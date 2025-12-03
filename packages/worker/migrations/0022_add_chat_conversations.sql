-- Migration: 0022_add_chat_conversations
-- Purpose: Add tables for live chat conversations
-- Date: December 3, 2025

-- Chat Sessions Table (tracks active chat sessions)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL, -- Anonymous visitor ID or customer ID
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  status TEXT CHECK(status IN ('active', 'waiting', 'ended', 'transferred')) DEFAULT 'waiting',
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  last_message_at TEXT,
  assigned_to TEXT, -- Staff ID or 'ai-agent-001'
  metadata TEXT, -- JSON for additional data (browser, location, etc.)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES staff_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_ticket ON chat_sessions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_assigned ON chat_sessions(assigned_to);

-- Callback Requests Table (when chat is offline)
CREATE TABLE IF NOT EXISTS callback_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  order_id TEXT, -- Optional
  message TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'contacted', 'resolved', 'cancelled')) DEFAULT 'pending',
  contacted_by TEXT, -- Staff ID who contacted them
  contacted_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (contacted_by) REFERENCES staff_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_callback_requests_tenant ON callback_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_callback_requests_status ON callback_requests(status);
CREATE INDEX IF NOT EXISTS idx_callback_requests_created ON callback_requests(created_at);

-- Add platform column to tickets table to distinguish email vs chat
-- Platform: 'email', 'chat', 'phone', 'social', etc.
ALTER TABLE tickets ADD COLUMN platform TEXT DEFAULT 'email' CHECK(platform IN ('email', 'chat', 'phone', 'social', 'api'));

-- Update existing tickets to have platform = 'email'
UPDATE tickets SET platform = 'email' WHERE platform IS NULL;

-- Create index for platform filtering
CREATE INDEX IF NOT EXISTS idx_tickets_platform ON tickets(platform);

