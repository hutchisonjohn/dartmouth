/**
 * Email Handler for Cloudflare Email Routing
 * Receives inbound emails and stores them in D1
 */

export interface Env {
  DB: D1Database;
}

export interface EmailMessage {
  from: string;
  to: string[];
  headers: Map<string, string>;
  raw: ReadableStream<Uint8Array>;
}

interface ParsedEmail {
  headersText: string;
  bodyText: string;
  bodyHtml: string | null;
}

interface ParsedAddress {
  name: string | null;
  email: string | null;
}

/**
 * Parse raw MIME email into headers and body.
 * This is a minimal parser - for production, consider using a proper MIME library.
 */
async function parseRawMime(raw: ReadableStream<Uint8Array>): Promise<ParsedEmail> {
  const reader = raw.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      totalLength += value.length;
    }
  }

  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  const text = new TextDecoder('utf-8').decode(merged);

  // Split headers from body
  const [rawHeaders, ...bodyParts] = text.split(/\r?\n\r?\n/);
  const body = bodyParts.join('\n\n');

  // Detect if body is HTML
  const hasHtmlTags = /<html[\s>]|<body[\s>]|<\/p>|<\/div>/.test(body);

  return {
    headersText: rawHeaders,
    bodyText: hasHtmlTags ? body.replace(/<[^>]+>/g, '') : body,
    bodyHtml: hasHtmlTags ? body : null,
  };
}

/**
 * Parse email address from "Name <email@domain>" format.
 */
function parseAddress(input: string | null | undefined): ParsedAddress {
  if (!input) return { name: null, email: null };

  const emailMatch = input.match(/<([^>]+)>/);
  if (emailMatch) {
    const email = emailMatch[1].trim();
    const namePart = input.replace(emailMatch[0], '').trim();
    return {
      name: namePart.replace(/^"|"$/g, '') || null,
      email,
    };
  }

  return {
    name: null,
    email: input.trim(),
  };
}

/**
 * Look up mailbox and tenant by recipient email address.
 */
async function resolveMailboxAndTenant(
  env: Env,
  toAddress: string
): Promise<{ mailbox_id: string; tenant_id: string } | null> {
  const mailbox = await env.DB.prepare(
    `
    SELECT m.id as mailbox_id,
           m.tenant_id as tenant_id
    FROM mailboxes m
    WHERE lower(m.email_address) = lower(?)
    `
  )
    .bind(toAddress)
    .first<{ mailbox_id: string; tenant_id: string } | null>();

  return mailbox;
}

/**
 * Find existing conversation by threading headers or create a new one.
 */
async function findOrCreateConversation(
  env: Env,
  params: {
    tenantId: string;
    mailboxId: string;
    subject: string;
    customerEmail: string;
    inReplyTo?: string | null;
    references?: string | null;
  }
): Promise<string> {
  const now = new Date().toISOString();

  // 1) Try to find existing conversation via In-Reply-To
  if (params.inReplyTo) {
    const parent = await env.DB.prepare(
      `
      SELECT conversation_id
      FROM emails
      WHERE message_id = ?
      LIMIT 1
      `
    )
      .bind(params.inReplyTo)
      .first<{ conversation_id: string } | null>();

    if (parent) {
      console.log(`[EmailHandler] Found existing conversation via In-Reply-To: ${parent.conversation_id}`);
      return parent.conversation_id;
    }
  }

  // 2) Try to find via References header
  if (params.references) {
    const refIds = params.references.split(/\s+/);
    for (const ref of refIds) {
      const parent = await env.DB.prepare(
        `
        SELECT conversation_id
        FROM emails
        WHERE message_id = ?
        LIMIT 1
        `
      )
        .bind(ref)
        .first<{ conversation_id: string } | null>();

      if (parent) {
        console.log(`[EmailHandler] Found existing conversation via References: ${parent.conversation_id}`);
        return parent.conversation_id;
      }
    }
  }

  // 3) No existing conversation found - create new one
  const conversationId = crypto.randomUUID();
  console.log(`[EmailHandler] Creating new conversation: ${conversationId}`);

  await env.DB.prepare(
    `
    INSERT INTO conversations (
      id, tenant_id, mailbox_id, subject, customer_email, status, last_message_at, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, 'open', ?, ?
    )
    `
  )
    .bind(
      conversationId,
      params.tenantId,
      params.mailboxId,
      params.subject,
      params.customerEmail,
      now,
      now
    )
    .run();

  return conversationId;
}

/**
 * Store inbound email in database.
 */
async function insertInboundEmail(
  env: Env,
  data: {
    tenantId: string;
    conversationId: string;
    mailboxId: string;
    messageId: string;
    inReplyTo?: string | null;
    references?: string | null;
    fromName: string | null;
    fromEmail: string;
    toEmail: string;
    subject: string;
    bodyText: string;
    bodyHtml: string | null;
    rawHeaders: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const emailId = crypto.randomUUID();

  console.log(`[EmailHandler] Storing inbound email: ${emailId}`);

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
      received_at,
      status
    ) VALUES (
      ?, ?, ?, ?, 'inbound',
      NULL,
      ?, ?, ?,
      ?, ?, ?,
      NULL, NULL,
      ?, ?, ?, ?,
      ?, 'ok'
    )
    `
  )
    .bind(
      emailId,
      data.tenantId,
      data.conversationId,
      data.mailboxId,
      data.messageId,
      data.inReplyTo || null,
      data.references || null,
      data.fromName,
      data.fromEmail,
      data.toEmail,
      data.subject,
      data.bodyText,
      data.bodyHtml,
      data.rawHeaders,
      now
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

  console.log(`[EmailHandler] ✅ Email stored successfully`);
}

/**
 * Main email handler - called by Cloudflare Email Worker
 */
export async function handleInboundEmail(message: EmailMessage, env: Env): Promise<void> {
  try {
    console.log(`[EmailHandler] Processing inbound email from: ${message.from}`);

    // Get recipient address
    const to = message.to && message.to.length > 0 ? message.to[0] : null;
    if (!to) {
      console.warn('[EmailHandler] Email missing "to" address');
      return;
    }

    console.log(`[EmailHandler] To: ${to}`);

    // Look up mailbox and tenant
    const mailbox = await resolveMailboxAndTenant(env, to);
    if (!mailbox) {
      console.warn(`[EmailHandler] No mailbox configured for address: ${to}`);
      return;
    }

    console.log(`[EmailHandler] Mailbox: ${mailbox.mailbox_id}, Tenant: ${mailbox.tenant_id}`);

    // Parse email
    const { headersText, bodyText, bodyHtml } = await parseRawMime(message.raw);

    // Extract headers
    const headers = message.headers;
    const subject = headers.get('subject') || '(no subject)';
    const messageId = headers.get('message-id') || `<${crypto.randomUUID()}@mail.system>`;
    const inReplyTo = headers.get('in-reply-to') || null;
    const references = headers.get('references') || null;
    const fromHeader = headers.get('from') || message.from;

    console.log(`[EmailHandler] Subject: ${subject}`);
    console.log(`[EmailHandler] Message-ID: ${messageId}`);
    if (inReplyTo) console.log(`[EmailHandler] In-Reply-To: ${inReplyTo}`);

    // Parse from address
    const from = parseAddress(fromHeader);
    const fromEmail = from.email;
    if (!fromEmail) {
      console.warn('[EmailHandler] Could not determine fromEmail');
      return;
    }

    console.log(`[EmailHandler] From: ${from.name} <${fromEmail}>`);

    // Find or create conversation
    const conversationId = await findOrCreateConversation(env, {
      tenantId: mailbox.tenant_id,
      mailboxId: mailbox.mailbox_id,
      subject,
      customerEmail: fromEmail,
      inReplyTo,
      references,
    });

    // Store email
    await insertInboundEmail(env, {
      tenantId: mailbox.tenant_id,
      conversationId,
      mailboxId: mailbox.mailbox_id,
      messageId,
      inReplyTo,
      references,
      fromName: from.name,
      fromEmail,
      toEmail: to,
      subject,
      bodyText,
      bodyHtml,
      rawHeaders: headersText,
    });

    console.log(`[EmailHandler] ✅ Email processed successfully`);
  } catch (err) {
    console.error('[EmailHandler] Error handling inbound email:', err);
    throw err;
  }
}

