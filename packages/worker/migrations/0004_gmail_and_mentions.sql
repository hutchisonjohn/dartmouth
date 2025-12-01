-- Migration 0004: Gmail Integration & Mentions System
-- Date: 2025-11-28
-- Purpose: Add tables for Gmail emails, staff mentions, and snooze functionality

-- ============================================================================
-- EMAILS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  gmail_message_id TEXT UNIQUE NOT NULL,
  gmail_thread_id TEXT NOT NULL,
  ticket_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  is_inbound BOOLEAN DEFAULT TRUE,
  is_read BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  attachments TEXT, -- JSON array
  received_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_emails_gmail_thread ON emails(gmail_thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_ticket ON emails(ticket_id);
CREATE INDEX IF NOT EXISTS idx_emails_from ON emails(from_email);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at);
CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read);

-- ============================================================================
-- SNOOZE FUNCTIONALITY (Add columns to tickets table)
-- ============================================================================

-- Add snooze columns to tickets table
ALTER TABLE tickets ADD COLUMN is_snoozed BOOLEAN DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN snoozed_until TEXT;
ALTER TABLE tickets ADD COLUMN snoozed_by TEXT;
ALTER TABLE tickets ADD COLUMN snooze_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_tickets_is_snoozed ON tickets(is_snoozed);
CREATE INDEX IF NOT EXISTS idx_tickets_snoozed_until ON tickets(snoozed_until);

-- ============================================================================
-- STAFF MENTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_mentions (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  from_staff_id TEXT NOT NULL,
  to_staff_id TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('normal', 'high', 'critical')) DEFAULT 'normal',
  type TEXT CHECK(type IN ('ticket', 'order', 'project')) DEFAULT 'ticket',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (from_staff_id) REFERENCES staff_users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_staff_mentions_to ON staff_mentions(to_staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_mentions_ticket ON staff_mentions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_staff_mentions_is_read ON staff_mentions(is_read);
CREATE INDEX IF NOT EXISTS idx_staff_mentions_created_at ON staff_mentions(created_at);

-- ============================================================================
-- MENTION THREADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mention_threads (
  id TEXT PRIMARY KEY,
  mention_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (mention_id) REFERENCES staff_mentions(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mention_threads_mention ON mention_threads(mention_id);
CREATE INDEX IF NOT EXISTS idx_mention_threads_created_at ON mention_threads(created_at);

-- ============================================================================
-- SYSTEM SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT CHECK(setting_type IN ('string', 'boolean', 'number', 'json')) DEFAULT 'string',
  description TEXT,
  updated_by TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (updated_by) REFERENCES staff_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed AI response mode setting
INSERT OR IGNORE INTO system_settings (id, setting_key, setting_value, setting_type, description, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ai_response_mode',
  'draft',
  'string',
  'AI response mode: "auto" (send immediately) or "draft" (save for staff approval)',
  datetime('now')
);

-- Seed email polling interval (seconds)
INSERT OR IGNORE INTO system_settings (id, setting_key, setting_value, setting_type, description, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'email_poll_interval',
  '30',
  'number',
  'How often to poll Gmail for new emails (in seconds)',
  datetime('now')
);

