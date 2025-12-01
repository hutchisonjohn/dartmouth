-- Migration 0005: Fix schema inconsistencies and add missing tables
-- Date: 2025-11-28
-- Purpose: Create staff_users table and fix foreign key references

-- ============================================================================
-- STAFF USERS TABLE (was missing!)
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'manager', 'agent')) DEFAULT 'agent',
  is_active BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_staff_users_email ON staff_users(email);
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON staff_users(role);
CREATE INDEX IF NOT EXISTS idx_staff_users_is_active ON staff_users(is_active);

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  vip_tier TEXT,
  lifetime_value REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  shopify_id TEXT,
  perp_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_synced_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_shopify_id ON customers(shopify_id);
CREATE INDEX IF NOT EXISTS idx_customers_perp_id ON customers(perp_id);

-- ============================================================================
-- TICKETS TABLE (if not exists from migration 0002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  conversation_id TEXT,
  customer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'pending', 'in-progress', 'waiting_on_customer', 'waiting_on_internal', 'resolved', 'closed', 'escalated', 'snoozed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'critical', 'urgent')),
  category TEXT NOT NULL,
  sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative', 'angry')),
  assigned_to TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  closed_at TEXT,
  sla_due_at TEXT,
  FOREIGN KEY (assigned_to) REFERENCES staff_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_conversation_id ON tickets(conversation_id);

-- ============================================================================
-- TICKET MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK(sender_type IN ('customer', 'agent', 'ai', 'system')),
  sender_id TEXT,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  ai_confidence REAL,
  ai_intent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- ============================================================================
-- INTERNAL NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS internal_notes (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  note_type TEXT CHECK(note_type IN ('general', 'escalation', 'resolution')) DEFAULT 'general',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_ticket_id ON internal_notes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_created_at ON internal_notes(created_at);

-- ============================================================================
-- ESCALATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS escalations (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  escalated_by TEXT,
  escalated_to TEXT,
  reason TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'accepted', 'resolved')) DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (escalated_by) REFERENCES staff_users(id) ON DELETE SET NULL,
  FOREIGN KEY (escalated_to) REFERENCES staff_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_escalations_ticket_id ON escalations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);

-- ============================================================================
-- SEED DATA: 3 Staff Users
-- ============================================================================

-- Password hash for 'changeme123' (bcrypt)
INSERT OR IGNORE INTO staff_users (id, email, password_hash, first_name, last_name, role, is_active, is_available, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'john@dtf.com.au',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEiW4u',
    'John',
    'Hutchison',
    'admin',
    TRUE,
    TRUE,
    datetime('now'),
    datetime('now')
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'john+ted@dtf.com.au',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEiW4u',
    'Ted',
    'Smith',
    'agent',
    TRUE,
    TRUE,
    datetime('now'),
    datetime('now')
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'john+sam@dtf.com.au',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEiW4u',
    'Sam',
    'Johnson',
    'agent',
    TRUE,
    TRUE,
    datetime('now'),
    datetime('now')
  );

