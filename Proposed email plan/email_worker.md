
# Cloudflare Email Routing Worker (Inbound Handler)

This Worker handles incoming emails via **Cloudflare Email Routing** and stores them in D1 using the schema defined in `d1_schema.md`.

- Trigger type: `email` (Email Workers)
- Responsibilities:
  - Map recipient → mailbox → tenant
  - Parse basic headers & body
  - Resolve / create conversation
  - Store inbound email in `emails`
  - Update `conversations`

> NOTE: This is a starter implementation. You can extend it later to handle attachments and richer parsing.

---

## `email-worker.ts`

```ts
export interface Env {
  DB: D1Database;
}

type EmailMessage = {
  from: string;             // "Name <email@domain>"
  to: string[];             // ["support@brand.com"]
  headers: Map<string, string>;
  raw: ReadableStream<Uint8Array>;
  // body is not directly available; we parse from raw MIME
};

/**
 * Basic MIME parser helper (very minimal).
 * For production you may want to integrate a proper parser, or store raw MIME and parse offline.
 */
async function parseRawMime(raw: ReadableStream<Uint8Array>): Promise<{
  headersText: string;
  bodyText: string;
  bodyHtml: string | null;
}> {
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

  const text = new TextDecoder("utf-8").decode(merged);

  // crude split of headers/body
  const [rawHeaders, ...bodyParts] = text.split(/\r?\n\r?\n/);
  const body = bodyParts.join("\n\n");

  // minimal heuristic for html vs text
  const hasHtmlTags = /<html[\s>]|<body[\s>]|<\/p>|<\/div>/.test(body);
  return {
    headersText: rawHeaders,
    bodyText: hasHtmlTags ? body.replace(/<[^>]+>/g, "") : body,
    bodyHtml: hasHtmlTags ? body : null,
  };
}

/**
 * Parse "Name <email@domain>" into { name, email }.
 */
function parseAddress(input: string | null | undefined): { name: string | null; email: string | null } {
  if (!input) return { name: null, email: null };
  const emailMatch = input.match(/<([^>]+)>/);
  if (emailMatch) {
    const email = emailMatch[1].trim();
    const namePart = input.replace(emailMatch[0], "").trim();
    return {
      name: namePart.replace(/^"|"$/g, "") || null,
      email,
    };
  }
  return {
    name: null,
    email: input.trim(),
  };
}

/**
 * Look up mailbox and tenant by recipient address.
 */
async function resolveMailboxAndTenant(env: Env, toAddress: string) {
  const mailbox = await env.DB
    .prepare(
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
 * Find or create a conversation for this inbound email.
 */
async function findOrCreateConversation(env: Env, params: {
  tenantId: string;
  mailboxId: string;
  subject: string;
  customerEmail: string;
  inReplyTo?: string | null;
  references?: string | null;
}) {
  const now = Math.floor(Date.now() / 1000);

  // 1) Try to find an existing conversation via in_reply_to or references
  if (params.inReplyTo) {
    const parent = await env.DB
      .prepare(
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
      return parent.conversation_id;
    }
  }

  if (params.references) {
    const refIds = params.references.split(/\s+/);
    for (const ref of refIds) {
      const parent = await env.DB
        .prepare(
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
        return parent.conversation_id;
      }
    }
  }

  // 2) No existing: create new conversation
  const conversationId = crypto.randomUUID();
  await env.DB
    .prepare(
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
 * Store inbound email record.
 */
async function insertInboundEmail(env: Env, data: {
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

  // Update conversation timestamps
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

export default {
  async email(message: EmailMessage, env: Env, ctx: ExecutionContext) {
    try {
      const to = message.to && message.to.length > 0 ? message.to[0] : null;
      if (!to) {
        console.warn("Email missing 'to' address");
        return;
      }

      const mailbox = await resolveMailboxAndTenant(env, to);
      if (!mailbox) {
        console.warn(`No mailbox configured for address: ${to}`);
        return;
      }

      const { headersText, bodyText, bodyHtml } = await parseRawMime(message.raw);

      // Convert headers Map -> simple lookups
      const headers = message.headers;
      const subject = headers.get("subject") || "(no subject)";
      const messageId = headers.get("message-id") || crypto.randomUUID();
      const inReplyTo = headers.get("in-reply-to") || null;
      const references = headers.get("references") || null;
      const fromHeader = headers.get("from") || message.from;

      const from = parseAddress(fromHeader);
      const fromEmail = from.email;
      if (!fromEmail) {
        console.warn("Could not determine fromEmail");
        return;
      }

      const conversationId = await findOrCreateConversation(env, {
        tenantId: mailbox.tenant_id,
        mailboxId: mailbox.mailbox_id,
        subject,
        customerEmail: fromEmail,
        inReplyTo,
        references,
      });

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
    } catch (err) {
      console.error("Error handling inbound email", err);
    }
  },
};
```

---

### Notes

- This worker assumes Cloudflare passes an `EmailMessage` object shaped like the Email Workers API. Adjust field names if your binding differs.
- `parseRawMime` is intentionally simple. For production, consider:
  - Storing raw MIME in R2 and parsing asynchronously, or
  - Using a robust MIME parsing library at build time (with bundling).
- Multi-recipient handling (Cc/Bcc, multiple To) can be added later.
