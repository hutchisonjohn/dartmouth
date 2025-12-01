-- Email System V2 Migration
-- Multi-tenant email infrastructure with Cloudflare Email Routing + MailChannels
-- Created: December 1, 2025
-- Note: D1 doesn't support FOREIGN KEY constraints - enforced in application layer

-- ============================================================================
-- 1. TENANTS
-- ============================================================================
CREATE TABLE tenants (
  id                      TEXT PRIMARY KEY,
  name                    TEXT NOT NULL,
  slug                    TEXT UNIQUE,
  status                  TEXT NOT NULL DEFAULT 'active',
  plan                    TEXT NOT NULL DEFAULT 'free',
  default_signature_html  TEXT,
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at              TEXT
);

CREATE INDEX idx_tenants_slug ON tenants(slug);

-- ============================================================================
-- 2. DOMAINS
-- ============================================================================
CREATE TABLE domains (
  id                 TEXT PRIMARY KEY,
  tenant_id          TEXT NOT NULL,
  domain             TEXT NOT NULL,
  verification_token TEXT,
  status             TEXT NOT NULL DEFAULT 'pending',
  mx_configured      INTEGER NOT NULL DEFAULT 0,
  spf_configured     INTEGER NOT NULL DEFAULT 0,
  dkim_configured    INTEGER NOT NULL DEFAULT 0,
  dkim_selector      TEXT,
  dkim_public_key    TEXT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT
);

CREATE UNIQUE INDEX idx_domains_domain ON domains(domain);
CREATE INDEX idx_domains_tenant ON domains(tenant_id);

-- ============================================================================
-- 3. MAILBOXES
-- ============================================================================
CREATE TABLE mailboxes (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  domain_id     TEXT NOT NULL,
  email_address TEXT NOT NULL,
  label         TEXT NOT NULL,
  is_default    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT
);

CREATE UNIQUE INDEX idx_mailboxes_email ON mailboxes(email_address);
CREATE INDEX idx_mailboxes_tenant ON mailboxes(tenant_id);
CREATE INDEX idx_mailboxes_domain ON mailboxes(domain_id);

-- ============================================================================
-- 4. CONVERSATIONS
-- ============================================================================
CREATE TABLE conversations (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  mailbox_id      TEXT NOT NULL,
  subject         TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open',
  last_message_at TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT
);

CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_mailbox ON conversations(mailbox_id);
CREATE INDEX idx_conversations_customer ON conversations(customer_email);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at);

-- ============================================================================
-- 5. EMAILS (V2 - replaces old emails table)
-- ============================================================================
DROP TABLE IF EXISTS emails;

CREATE TABLE emails (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  mailbox_id      TEXT,
  direction       TEXT NOT NULL,
  user_id         TEXT,
  message_id      TEXT NOT NULL,
  in_reply_to     TEXT,
  references      TEXT,
  from_name       TEXT,
  from_email      TEXT NOT NULL,
  to_email        TEXT NOT NULL,
  cc              TEXT,
  bcc             TEXT,
  subject         TEXT NOT NULL,
  body_text       TEXT,
  body_html       TEXT,
  raw_headers     TEXT,
  raw_source_id   TEXT,
  sent_at         TEXT,
  received_at     TEXT,
  status          TEXT NOT NULL DEFAULT 'ok',
  bounce_reason   TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT
);

CREATE INDEX idx_emails_tenant ON emails(tenant_id);
CREATE INDEX idx_emails_conversation ON emails(conversation_id);
CREATE INDEX idx_emails_mailbox ON emails(mailbox_id);
CREATE INDEX idx_emails_user ON emails(user_id);
CREATE INDEX idx_emails_message_id ON emails(message_id);
CREATE INDEX idx_emails_in_reply_to ON emails(in_reply_to);
CREATE INDEX idx_emails_direction ON emails(direction);

-- ============================================================================
-- 6. EMAIL TEMPLATES
-- ============================================================================
CREATE TABLE email_templates (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL,
  scope               TEXT NOT NULL DEFAULT 'shared',
  owner_user_id       TEXT,
  subject_template    TEXT,
  body_html_template  TEXT NOT NULL,
  body_text_template  TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT
);

CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_owner ON email_templates(owner_user_id);

-- ============================================================================
-- 7. TENANT EMAIL QUOTA
-- ============================================================================
CREATE TABLE tenant_email_quota (
  tenant_id      TEXT PRIMARY KEY,
  daily_limit    INTEGER NOT NULL DEFAULT 1000,
  used_today     INTEGER NOT NULL DEFAULT 0,
  last_reset_at  TEXT NOT NULL
);

-- ============================================================================
-- 8. ATTACHMENTS
-- ============================================================================
CREATE TABLE attachments (
  id           TEXT PRIMARY KEY,
  email_id     TEXT NOT NULL,
  tenant_id    TEXT NOT NULL,
  filename     TEXT NOT NULL,
  content_type TEXT,
  size_bytes   INTEGER,
  storage_key  TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_attachments_email ON attachments(email_id);
CREATE INDEX idx_attachments_tenant ON attachments(tenant_id);

-- ============================================================================
-- 9. ENHANCE EXISTING TABLES
-- ============================================================================
-- Note: SQLite doesn't have IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- If columns already exist, this will fail - that's OK, just comment out

-- Uncomment these if running for the first time:
-- ALTER TABLE staff_users ADD COLUMN tenant_id TEXT;
-- ALTER TABLE staff_users ADD COLUMN signature_override_html TEXT;
-- ALTER TABLE tickets ADD COLUMN conversation_id TEXT;
-- ALTER TABLE tickets ADD COLUMN tenant_id TEXT;

-- ============================================================================
-- 10. SEED DATA FOR DTF.COM.AU (TEST TENANT)
-- ============================================================================

INSERT INTO tenants (id, name, slug, status, plan, default_signature_html) 
VALUES (
  'test-tenant-dtf',
  'DTF Test',
  'dtf-test',
  'active',
  'free',
  '<p>--<br>{{agent_name}}<br>{{agent_role}}<br>DTF Test<br>Email: {{agent_email}}</p>'
);

INSERT INTO domains (
  id,
  tenant_id,
  domain,
  verification_token,
  status,
  mx_configured,
  spf_configured
) VALUES (
  'domain-dtf',
  'test-tenant-dtf',
  'dtf.com.au',
  NULL,
  'verified',
  1,
  1
);

INSERT INTO mailboxes (
  id,
  tenant_id,
  domain_id,
  email_address,
  label,
  is_default
) VALUES 
  (
    'mailbox-john',
    'test-tenant-dtf',
    'domain-dtf',
    'john@dtf.com.au',
    'John',
    1
  ),
  (
    'mailbox-info',
    'test-tenant-dtf',
    'domain-dtf',
    'info@dtf.com.au',
    'Info',
    0
  );

UPDATE staff_users SET tenant_id = 'test-tenant-dtf';

INSERT INTO tenant_email_quota (tenant_id, daily_limit, used_today, last_reset_at)
VALUES ('test-tenant-dtf', 1000, 0, datetime('now'));
