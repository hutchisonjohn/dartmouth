-- Migration 0010: Add message_id column to emails table
-- Date: 2025-11-30
-- Purpose: Store RFC 2822 Message-ID header for proper email threading

ALTER TABLE emails ADD COLUMN message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_emails_message_id ON emails(message_id);

