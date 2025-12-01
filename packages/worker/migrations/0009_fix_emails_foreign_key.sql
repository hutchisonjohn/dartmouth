-- Migration 0009: Fix foreign key reference in emails table
-- Date: 2025-11-30
-- Purpose: Correct the foreign key constraint to reference tickets.ticket_id

-- Drop existing emails table (if it exists and needs modification)
DROP TABLE IF EXISTS emails;

-- Recreate emails table with correct foreign key
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
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_emails_gmail_thread ON emails(gmail_thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_ticket ON emails(ticket_id);
CREATE INDEX IF NOT EXISTS idx_emails_from ON emails(from_email);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at);
CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read);

