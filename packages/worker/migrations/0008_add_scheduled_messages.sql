-- Migration 0008: Add scheduled_messages table
-- Date: 2025-11-30
-- Purpose: Support scheduling replies to be sent at a specific time

CREATE TABLE IF NOT EXISTS scheduled_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'sent', 'cancelled', 'failed')) DEFAULT 'pending',
  sent_at TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduled_messages_ticket_id ON scheduled_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON scheduled_messages(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_scheduled_for ON scheduled_messages(scheduled_for);

