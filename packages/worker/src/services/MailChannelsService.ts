/**
 * MailChannels Service for Outbound Email
 * Sends emails via MailChannels SMTP with proper threading headers
 */

export interface Env {
  DB: D1Database;
}

export interface SendEmailOptions {
  tenantId: string;
  conversationId: string;
  mailboxId: string;
  userId: string;            // Staff member sending this email
  toEmail: string;
  fromEmail: string;         // e.g. "support@customerdomain.com"
  fromName?: string;         // e.g. "Amazing Transfers Support"
  subject: string;
  bodyHtml: string;          // Already includes signature
  bodyText?: string;         // Optional plain text override
}

/**
 * Fetch the latest email in a conversation for threading.
 */
async function getLatestEmailForThread(
  env: Env,
  tenantId: string,
  conversationId: string
): Promise<{ message_id: string; references_header: string | null } | null> {
  const row = await env.DB.prepare(
    `
    SELECT message_id, references_header
    FROM emails
    WHERE tenant_id = ? AND conversation_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    `
  )
    .bind(tenantId, conversationId)
    .first<{ message_id: string; references_header: string | null } | null>();

  return row;
}

/**
 * Insert outbound email record into D1.
 */
async function insertOutboundEmail(
  env: Env,
  data: {
    tenantId: string;
    conversationId: string;
    mailboxId: string;
    userId: string;
    messageId: string;
    inReplyTo?: string | null;
    references?: string | null;
    fromName: string | null;
    fromEmail: string;
    toEmail: string;
    subject: string;
    bodyText: string;
    bodyHtml: string;
    status: string;
    bounceReason?: string | null;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const emailId = crypto.randomUUID();

  await env.DB.prepare(
    `
    INSERT INTO emails (
      id,
      tenant_id,
      conversation_id,
      mailbox_id,
      direction,
      user_id,
      message_id,
      in_reply_to,
      references_header,
      from_name,
      from_email,
      to_email,
      cc,
      bcc,
      subject,
      body_text,
      body_html,
      raw_headers,
      sent_at,
      status,
      bounce_reason
    ) VALUES (
      ?, ?, ?, ?, 'outbound',
      ?,
      ?, ?, ?,
      ?, ?, ?,
      NULL, NULL,
      ?, ?, ?, NULL,
      ?, ?, ?
    )
    `
  )
    .bind(
      emailId,
      data.tenantId,
      data.conversationId,
      data.mailboxId,
      data.userId,
      data.messageId,
      data.inReplyTo || null,
      data.references || null,
      data.fromName,
      data.fromEmail,
      data.toEmail,
      data.subject,
      data.bodyText,
      data.bodyHtml,
      now,
      data.status,
      data.bounceReason || null
    )
    .run();

  // Update conversation timestamp
  await env.DB.prepare(
    `
    UPDATE conversations
    SET last_message_at = ?, updated_at = ?
    WHERE id = ?
    `
  )
    .bind(now, now, data.conversationId)
    .run();
}

/**
 * Strip HTML tags to create plain text version.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Build MailChannels JSON payload.
 */
function buildMailChannelsPayload(opts: {
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  messageId: string;
  inReplyTo?: string | null;
  references?: string | null;
}) {
  const {
    fromEmail,
    fromName,
    toEmail,
    subject,
    bodyHtml,
    bodyText,
    messageId,
    inReplyTo,
    references,
  } = opts;

  const headers: { [key: string]: string } = {
    'Message-ID': messageId,
  };

  if (inReplyTo) {
    headers['In-Reply-To'] = inReplyTo;
  }

  if (references) {
    headers['References'] = references;
  }

  return {
    personalizations: [
      {
        to: [{ email: toEmail }],
        headers,
      },
    ],
    from: {
      email: fromEmail,
      name: fromName || undefined,
    },
    subject,
    content: [
      {
        type: 'text/plain',
        value: bodyText || stripHtml(bodyHtml),
      },
      {
        type: 'text/html',
        value: bodyHtml,
      },
    ],
  };
}

/**
 * Check if tenant has exceeded daily email quota.
 */
async function checkQuota(env: Env, tenantId: string): Promise<boolean> {
  const quota = await env.DB.prepare(
    `
    SELECT daily_limit, used_today, last_reset_at
    FROM tenant_email_quota
    WHERE tenant_id = ?
    `
  )
    .bind(tenantId)
    .first<{ daily_limit: number; used_today: number; last_reset_at: string } | null>();

  if (!quota) {
    // No quota record - create one
    const now = new Date().toISOString();
    await env.DB.prepare(
      `
      INSERT INTO tenant_email_quota (tenant_id, daily_limit, used_today, last_reset_at)
      VALUES (?, 1000, 0, ?)
      `
    )
      .bind(tenantId, now)
      .run();
    return true;
  }

  // Check if we need to reset daily counter
  const lastReset = new Date(quota.last_reset_at);
  const now = new Date();
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  if (hoursSinceReset >= 24) {
    // Reset counter
    await env.DB.prepare(
      `
      UPDATE tenant_email_quota
      SET used_today = 0, last_reset_at = ?
      WHERE tenant_id = ?
      `
    )
      .bind(now.toISOString(), tenantId)
      .run();
    return true;
  }

  // Check if under limit
  return quota.used_today < quota.daily_limit;
}

/**
 * Increment quota usage.
 */
async function incrementQuota(env: Env, tenantId: string): Promise<void> {
  await env.DB.prepare(
    `
    UPDATE tenant_email_quota
    SET used_today = used_today + 1
    WHERE tenant_id = ?
    `
  )
    .bind(tenantId)
    .run();
}

/**
 * Extract domain from email address.
 */
function getDomainFromEmail(email: string): string {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : 'mail.system';
}

/**
 * Main send function.
 * Call this from your HTTP/Hono handler to send emails via MailChannels.
 */
export async function sendEmailThroughMailChannels(
  env: Env,
  opts: SendEmailOptions
): Promise<void> {
  console.log(`[MailChannels] Sending email to ${opts.toEmail}`);

  // 1) Check quota
  const hasQuota = await checkQuota(env, opts.tenantId);
  if (!hasQuota) {
    console.error(`[MailChannels] Tenant ${opts.tenantId} has exceeded daily email quota`);
    throw new Error('Daily email quota exceeded');
  }

  // 2) Determine threading context from latest email in conversation
  const latest = await getLatestEmailForThread(env, opts.tenantId, opts.conversationId);

  let inReplyTo: string | null = null;
  let references: string | null = null;

  if (latest?.message_id) {
    inReplyTo = latest.message_id;

    if (latest.references_header) {
      // Append latest message_id to existing References
      references = `${latest.references_header} ${latest.message_id}`;
    } else {
      references = latest.message_id;
    }

    console.log(`[MailChannels] Threading - In-Reply-To: ${inReplyTo}`);
    console.log(`[MailChannels] Threading - References: ${references}`);
  } else {
    console.log(`[MailChannels] No previous messages - starting new thread`);
  }

  // 3) Generate a new Message-ID using the tenant's domain
  const domain = getDomainFromEmail(opts.fromEmail);
  const newMessageId = `<${crypto.randomUUID()}@${domain}>`;
  console.log(`[MailChannels] New Message-ID: ${newMessageId}`);

  // 4) Build MailChannels payload
  const payload = buildMailChannelsPayload({
    fromEmail: opts.fromEmail,
    fromName: opts.fromName,
    toEmail: opts.toEmail,
    subject: opts.subject,
    bodyHtml: opts.bodyHtml,
    bodyText: opts.bodyText,
    messageId: newMessageId,
    inReplyTo,
    references,
  });

  console.log(`[MailChannels] Payload:`, JSON.stringify(payload, null, 2));

  // 5) Send via MailChannels
  const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const ok = res.status >= 200 && res.status < 300;
  const responseText = await res.text().catch(() => '');

  console.log(`[MailChannels] Response: ${res.status} ${responseText}`);

  // 6) Store outbound email record in D1
  await insertOutboundEmail(env, {
    tenantId: opts.tenantId,
    conversationId: opts.conversationId,
    mailboxId: opts.mailboxId,
    userId: opts.userId,
    messageId: newMessageId,
    inReplyTo,
    references,
    fromName: opts.fromName || null,
    fromEmail: opts.fromEmail,
    toEmail: opts.toEmail,
    subject: opts.subject,
    bodyText: opts.bodyText || stripHtml(opts.bodyHtml),
    bodyHtml: opts.bodyHtml,
    status: ok ? 'ok' : 'failed',
    bounceReason: ok ? null : `HTTP ${res.status}: ${responseText}`,
  });

  // 7) Increment quota
  if (ok) {
    await incrementQuota(env, opts.tenantId);
  }

  if (!ok) {
    throw new Error(`MailChannels send failed: ${res.status} ${responseText}`);
  }

  console.log(`[MailChannels] ✅ Email sent successfully`);
}

