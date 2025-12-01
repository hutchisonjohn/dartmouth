
# MailChannels Send Service (Outbound Email)

This file contains a standalone TypeScript module you can use from your Cloudflare Worker (Hono or plain) to send outbound emails via **MailChannels** while preserving threading headers.

It expects the D1 schema from `d1_schema.md` and will:

- Look up the parent email in a conversation
- Generate correct `Message-ID`, `In-Reply-To`, and `References`
- Send via MailChannels JSON API
- Store the outbound message in `emails` (including the sending `user_id`)
- Update the `conversations.last_message_at`

Signatures and templates are handled **before** calling this service:  
your app should build the final `bodyHtml` (template + user text + signature) and pass that in.

---

## `mailchannelsService.ts`

```ts
export interface Env {
  DB: D1Database;
}

export interface SendEmailOptions {
  tenantId: string;
  conversationId: string;
  mailboxId: string;
  userId: string;            // staff/agent sending this email
  toEmail: string;
  fromEmail: string;         // e.g. "support@tenantdomain.com"
  fromName?: string;         // e.g. "Amazing Transfers Support"
  subject: string;
  bodyHtml: string;          // primary content (already includes signature)
  bodyText?: string;         // optional plain text override
}

/**
 * Fetch the latest email in a conversation (for threading).
 */
async function getLatestEmailForThread(env: Env, tenantId: string, conversationId: string) {
  const row = await env.DB
    .prepare(
      `
      SELECT message_id, references
      FROM emails
      WHERE tenant_id = ? AND conversation_id = ?
      ORDER BY created_at DESC
      LIMIT 1
      `
    )
    .bind(tenantId, conversationId)
    .first<{ message_id: string; references: string | null } | null>();

  return row;
}

/**
 * Insert outbound email record into D1.
 */
async function insertOutboundEmail(env: Env, data: {
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
}) {
  const now = Math.floor(Date.now() / 1000);
  const emailId = crypto.randomUUID();

  await env.DB
    .prepare(
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
        references,
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

  await env.DB
    .prepare(
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
 * Minimal HTML → text stripper.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
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
  const { fromEmail, fromName, toEmail, subject, bodyHtml, bodyText, messageId, inReplyTo, references } = opts;

  const headers: { [key: string]: string } = {
    "Message-ID": messageId,
  };
  if (inReplyTo) headers["In-Reply-To"] = inReplyTo;
  if (references) headers["References"] = references;

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
        type: "text/plain",
        value: bodyText || stripHtml(bodyHtml),
      },
      {
        type: "text/html",
        value: bodyHtml,
      },
    ],
  };
}

/**
 * Main send function.
 *
 * Use this in your HTTP/Hono handler:
 * await sendEmailThroughMailChannels(env, { ...opts });
 */
export async function sendEmailThroughMailChannels(env: Env, opts: SendEmailOptions) {
  // 1) Determine threading context from latest email in conversation
  const latest = await getLatestEmailForThread(env, opts.tenantId, opts.conversationId);

  let inReplyTo: string | null = null;
  let references: string | null = null;

  if (latest?.message_id) {
    inReplyTo = latest.message_id;

    if (latest.references) {
      // Append latest message_id to existing References
      references = `${latest.references} ${latest.message_id}`;
    } else {
      references = latest.message_id;
    }
  }

  // 2) Generate a new Message-ID for this email
  // Using your own domain here is best.
  const newMessageId = `<${crypto.randomUUID()}@mail.your-saas.com>`;

  // 3) Build MailChannels payload
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

  // 4) Send via MailChannels
  const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const ok = res.status >= 200 && res.status < 300;
  const responseText = await res.text().catch(() => "");

  // 5) Store outbound email record in D1
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
    status: ok ? "ok" : "failed",
    bounceReason: ok ? null : `HTTP ${res.status}: ${responseText}`,
  });

  if (!ok) {
    throw new Error(`MailChannels send failed: ${res.status} ${responseText}`);
  }
}
```

---

## Example Usage in an HTTP/Hono Route

Your API route should:

- Know which **user** is sending (from auth/session)
- Load tenant + mailbox info
- Build **final HTML body** = template + reply + signature
- Then call `sendEmailThroughMailChannels`

```ts
import { Hono } from "hono";
import type { Env } from "./types";
import { sendEmailThroughMailChannels } from "./mailchannelsService";

const app = new Hono<{ Bindings: Env }>();

app.post("/api/conversations/:id/reply", async (c) => {
  const env = c.env;
  const conversationId = c.req.param("id");

  const {
    tenantId,
    mailboxId,
    userId,
    toEmail,
    fromEmail,
    fromName,
    subject,
    bodyHtml,   // already composed (template + reply + signature)
    bodyText,
  } = await c.req.json<{
    tenantId: string;
    mailboxId: string;
    userId: string;
    toEmail: string;
    fromEmail: string;
    fromName?: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
  }>();

  await sendEmailThroughMailChannels(env, {
    tenantId,
    conversationId,
    mailboxId,
    userId,
    toEmail,
    fromEmail,
    fromName,
    subject,
    bodyHtml,
    bodyText,
  });

  return c.json({ ok: true });
});

export default app;
```

This keeps your send logic centralized in `mailchannelsService.ts` and works cleanly with:

- The D1 schema (`tenants`, `domains`, `mailboxes`, `users`, `conversations`, `emails`)
- The inbound email worker (`email-worker.ts`)
- Your signatures & templates logic in the app layer.
