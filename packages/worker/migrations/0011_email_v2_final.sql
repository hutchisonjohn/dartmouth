-- Email System V2 - Final Migration (emails table already dropped)

CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  plan TEXT NOT NULL DEFAULT 'free',
  default_signature_html TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX idx_tenants_slug ON tenants(slug);

CREATE TABLE domains (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  verification_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  mx_configured INTEGER NOT NULL DEFAULT 0,
  spf_configured INTEGER NOT NULL DEFAULT 0,
  dkim_configured INTEGER NOT NULL DEFAULT 0,
  dkim_selector TEXT,
  dkim_public_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE UNIQUE INDEX idx_domains_domain ON domains(domain);
CREATE INDEX idx_domains_tenant ON domains(tenant_id);

CREATE TABLE mailboxes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  domain_id TEXT NOT NULL,
  email_address TEXT NOT NULL,
  label TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE UNIQUE INDEX idx_mailboxes_email ON mailboxes(email_address);
CREATE INDEX idx_mailboxes_tenant ON mailboxes(tenant_id);
CREATE INDEX idx_mailboxes_domain ON mailboxes(domain_id);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  mailbox_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  last_message_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_mailbox ON conversations(mailbox_id);
CREATE INDEX idx_conversations_customer ON conversations(customer_email);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at);

CREATE TABLE emails (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  mailbox_id TEXT,
  direction TEXT NOT NULL,
  user_id TEXT,
  message_id TEXT NOT NULL,
  in_reply_to TEXT,
  references_header TEXT,
  from_name TEXT,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  cc TEXT,
  bcc TEXT,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  raw_headers TEXT,
  raw_source_id TEXT,
  sent_at TEXT,
  received_at TEXT,
  status TEXT NOT NULL DEFAULT 'ok',
  bounce_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX idx_emails_tenant ON emails(tenant_id);
CREATE INDEX idx_emails_conversation ON emails(conversation_id);
CREATE INDEX idx_emails_mailbox ON emails(mailbox_id);
CREATE INDEX idx_emails_user ON emails(user_id);
CREATE INDEX idx_emails_message_id ON emails(message_id);
CREATE INDEX idx_emails_in_reply_to ON emails(in_reply_to);
CREATE INDEX idx_emails_direction ON emails(direction);

CREATE TABLE email_templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'shared',
  owner_user_id TEXT,
  subject_template TEXT,
  body_html_template TEXT NOT NULL,
  body_text_template TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_owner ON email_templates(owner_user_id);

CREATE TABLE tenant_email_quota (
  tenant_id TEXT PRIMARY KEY,
  daily_limit INTEGER NOT NULL DEFAULT 1000,
  used_today INTEGER NOT NULL DEFAULT 0,
  last_reset_at TEXT NOT NULL
);

CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  email_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  storage_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_attachments_email ON attachments(email_id);
CREATE INDEX idx_attachments_tenant ON attachments(tenant_id);

INSERT INTO tenants (id, name, slug, status, plan) 
VALUES ('test-tenant-dtf', 'DTF Test', 'dtf-test', 'active', 'free');

INSERT INTO domains (id, tenant_id, domain, status, mx_configured, spf_configured) 
VALUES ('domain-dtf', 'test-tenant-dtf', 'dtf.com.au', 'verified', 1, 1);

INSERT INTO mailboxes (id, tenant_id, domain_id, email_address, label, is_default) 
VALUES 
  ('mailbox-john', 'test-tenant-dtf', 'domain-dtf', 'john@dtf.com.au', 'John', 1),
  ('mailbox-info', 'test-tenant-dtf', 'domain-dtf', 'info@dtf.com.au', 'Info', 0);

INSERT INTO tenant_email_quota (tenant_id, daily_limit, used_today, last_reset_at)
VALUES ('test-tenant-dtf', 1000, 0, datetime('now'));

