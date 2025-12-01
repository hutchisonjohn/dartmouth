
# D1 Schema Design for Multi-Tenant Email Support System  
_With Per-Tenant Domains, Staff Signatures & Templates_

This schema is designed for Cloudflare D1 (SQLite) and supports:

- Multi-tenant SaaS (multiple businesses)
- Per-tenant domains & mailboxes (sending from their own domain)
- Staff users/agents
- Tenant- and user-level signatures
- Email templates & canned responses
- Email conversations (threads)
- Individual email messages (inbound + outbound)
- Threading via `message_id`, `in_reply_to`, `references`
- Future expansion (attachments, quotas, etc.)

---

## 1. Tenants

Represents each business using your SaaS.

```sql
CREATE TABLE tenants (
  id            TEXT PRIMARY KEY,           -- UUID string
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE,                -- optional: human-friendly identifier
  status        TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'trial'
  plan          TEXT NOT NULL DEFAULT 'free',

  -- Tenant-wide signature/footer for all staff (can include placeholders)
  -- e.g. "{{agent_name}}<br>{{agent_role}}<br>{{tenant_name}}<br>Address..."
  default_signature_html TEXT,

  created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at    INTEGER
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
```

---

## 2. Domains

Email domains used for sending/receiving (e.g. `amazingtransfers.com`).

```sql
CREATE TABLE domains (
  id                 TEXT PRIMARY KEY,       -- UUID
  tenant_id          TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain             TEXT NOT NULL,          -- e.g. "amazingtransfers.com"
  verification_token TEXT,                   -- for DNS TXT verification, if needed
  status             TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'inactive'
  mx_configured      INTEGER NOT NULL DEFAULT 0,      -- 0 = false, 1 = true

  -- Sending configuration flags
  spf_configured     INTEGER NOT NULL DEFAULT 0,      -- 0 = false, 1 = true
  dkim_configured    INTEGER NOT NULL DEFAULT 0,      -- 0 = false, 1 = true
  dkim_selector      TEXT,                            -- optional, for advanced DKIM setups
  dkim_public_key    TEXT,                            -- optional (for reference / tooling)

  created_at         INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at         INTEGER
);

CREATE UNIQUE INDEX idx_domains_domain ON domains(domain);
CREATE INDEX idx_domains_tenant ON domains(tenant_id);
```

---

## 3. Mailboxes

Logical inboxes (support, sales, etc.) tied to a domain.  
These determine the **From** address used when sending.

```sql
CREATE TABLE mailboxes (
  id            TEXT PRIMARY KEY,           -- UUID
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain_id     TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,              -- e.g. "support@amazingtransfers.com"
  label         TEXT NOT NULL,              -- e.g. "Support", "Sales"
  is_default    INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true

  created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at    INTEGER
);

CREATE UNIQUE INDEX idx_mailboxes_email ON mailboxes(email_address);
CREATE INDEX idx_mailboxes_tenant ON mailboxes(tenant_id);
CREATE INDEX idx_mailboxes_domain ON mailboxes(domain_id);
```

For v1, the **From** address of outbound emails will be `mailboxes.email_address`.  
Staff identity is represented in the signature, not the From address.

---

## 4. Users (Staff)

Represents individual agents/staff within each tenant, used for:

- Attribution (who sent what)
- Signature personalization
- Personal templates/snippets

```sql
CREATE TABLE users (
  id          TEXT PRIMARY KEY,               -- UUID
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,                  -- login / identity email within the app
  name        TEXT NOT NULL,                  -- "John Smith"
  role        TEXT,                           -- 'agent', 'admin', etc.
  is_active   INTEGER NOT NULL DEFAULT 1,

  -- Optional per-user signature override. If NULL, use tenant.default_signature_html.
  signature_override_html TEXT,

  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at  INTEGER
);

CREATE UNIQUE INDEX idx_users_tenant_email ON users(tenant_id, email);
```

---

## 5. Conversations (Threads)

Represents a customer support “ticket” or conversation.

```sql
CREATE TABLE conversations (
  id                TEXT PRIMARY KEY,           -- UUID
  tenant_id         TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  mailbox_id        TEXT NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  subject           TEXT NOT NULL,
  customer_email    TEXT NOT NULL,              -- primary external participant
  status            TEXT NOT NULL DEFAULT 'open',  -- 'open', 'pending', 'closed', etc.
  last_message_at   INTEGER NOT NULL,           -- unix timestamp of last message
  created_at        INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at        INTEGER
);

CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_mailbox ON conversations(mailbox_id);
CREATE INDEX idx_conversations_customer ON conversations(customer_email);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at);
```

---

## 6. Emails (Messages)

Each individual email in a conversation. This is where threading data lives.

```sql
CREATE TABLE emails (
  id              TEXT PRIMARY KEY,        -- UUID
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  mailbox_id      TEXT REFERENCES mailboxes(id),  -- null for system messages, if any
  direction       TEXT NOT NULL,           -- 'inbound' or 'outbound'

  -- Which user (agent) sent this (for outbound). NULL for inbound.
  user_id         TEXT REFERENCES users(id),

  -- RFC 5322 headers
  message_id      TEXT NOT NULL,           -- Message-ID of this email
  in_reply_to     TEXT,                    -- In-Reply-To header (Message-ID)
  references      TEXT,                    -- References header (raw string)
  from_name       TEXT,
  from_email      TEXT NOT NULL,
  to_email        TEXT NOT NULL,
  cc              TEXT,                    -- comma-separated
  bcc             TEXT,                    -- outbound only, stored for internal use
  subject         TEXT NOT NULL,

  -- Content
  body_text       TEXT,                    -- plain text
  body_html       TEXT,                    -- HTML body
  raw_headers     TEXT,                    -- optional: full raw headers
  raw_source_id   TEXT,                    -- optional: pointer to raw mime stored elsewhere (R2, etc.)

  -- Timing
  sent_at         INTEGER,                 -- for outbound
  received_at     INTEGER,                 -- for inbound

  -- Delivery / status
  status          TEXT NOT NULL DEFAULT 'ok',   -- 'ok', 'failed', 'bounced', etc.
  bounce_reason   TEXT,

  created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at      INTEGER
);

CREATE INDEX idx_emails_tenant ON emails(tenant_id);
CREATE INDEX idx_emails_conversation ON emails(conversation_id);
CREATE INDEX idx_emails_mailbox ON emails(mailbox_id);
CREATE INDEX idx_emails_user ON emails(user_id);
CREATE INDEX idx_emails_message_id ON emails(message_id);
CREATE INDEX idx_emails_in_reply_to ON emails(in_reply_to);
CREATE INDEX idx_emails_direction ON emails(direction);
```

---

## 7. Email Templates & Canned Responses

Used for full email templates (subject + body) and smaller canned snippets used inside the editor.

```sql
CREATE TABLE email_templates (
  id                  TEXT PRIMARY KEY,   -- UUID
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,      -- "Refund Approved", "Shipping Delay", etc.
  type                TEXT NOT NULL,      -- 'full' or 'snippet'
  scope               TEXT NOT NULL DEFAULT 'shared', -- 'shared' or 'personal'
  owner_user_id       TEXT REFERENCES users(id),      -- for scope='personal'

  -- Only used when type='full'; can be NULL for snippets
  subject_template    TEXT,

  body_html_template  TEXT NOT NULL,      -- HTML with placeholders ({{customer_name}}, etc.)
  body_text_template  TEXT,               -- optional plain text version

  created_at          INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at          INTEGER
);

CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_owner ON email_templates(owner_user_id);
```

Usage model:

- **Full templates (`type='full'`)**  
  Used to create new emails / standard replies: subject + body.

- **Snippets (`type='snippet'`)**  
  Inserted into the reply editor as canned responses.

---

## 8. (Optional) Attachments

If you want attachment support:

```sql
CREATE TABLE attachments (
  id              TEXT PRIMARY KEY,        -- UUID
  email_id        TEXT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  filename        TEXT NOT NULL,
  content_type    TEXT,
  size_bytes      INTEGER,
  storage_key     TEXT NOT NULL,           -- e.g. R2 object key
  created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX idx_attachments_email ON attachments(email_id);
CREATE INDEX idx_attachments_tenant ON attachments(tenant_id);
```

You can initially store only metadata and the raw MIME in R2, and build a richer UI later.

---

## 9. (Optional) Outbound Quotas / Limits

To protect your MailChannels reputation in a multi-tenant context:

```sql
CREATE TABLE tenant_email_quota (
  tenant_id        TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  daily_limit      INTEGER NOT NULL DEFAULT 1000,
  used_today       INTEGER NOT NULL DEFAULT 0,
  last_reset_at    INTEGER NOT NULL          -- unix timestamp when counters last reset
);
```

- Increment `used_today` on each outbound send.
- Refuse or queue emails if `used_today >= daily_limit`.
- Reset counters daily via a Worker Cron.

---

## 10. Basic Conversation Linking Logic

**When receiving an inbound email**:

1. Use `To` / `Delivered-To` to find `mailbox_id` and `tenant_id`.
2. Look up `emails` by `message_id` in `in_reply_to` or `references`.
3. If found:
   - Use that email’s `conversation_id`.
4. If not found:
   - Create a new `conversations` row:
     - `tenant_id`, `mailbox_id`, `subject`, `customer_email`, `status='open'`, `last_message_at=now`.
5. Insert `emails` row with `direction='inbound'`, `received_at=now`.
6. Update `conversations.last_message_at` and `updated_at`.

**When sending an outbound reply**:

1. Use existing `conversation_id` + `tenant_id`.
2. Fetch the most recent email in that conversation (or a specific parent).
3. Build `In-Reply-To` + `References` from that email’s `message_id` and `references`.
4. Insert `emails` row with `direction='outbound'`, `sent_at=now` after a successful send, and `user_id` set to the sending agent.
5. Update `conversations.last_message_at` and `updated_at`.

This schema is intentionally neutral and will work cleanly with Cloudflare Email Routing (inbound), MailChannels (outbound), and your staff signatures/templates layer.
