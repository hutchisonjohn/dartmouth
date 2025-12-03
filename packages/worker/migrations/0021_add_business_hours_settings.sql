-- Migration: 0021_add_business_hours_settings
-- Purpose: Add business hours configuration for live chat
-- Date: December 3, 2025

-- Business Hours Settings Table
CREATE TABLE IF NOT EXISTS business_hours (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  is_open BOOLEAN DEFAULT TRUE,
  open_time TEXT, -- Format: "HH:MM" in 24hr (e.g., "09:00")
  close_time TEXT, -- Format: "HH:MM" in 24hr (e.g., "17:00")
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_business_hours_tenant ON business_hours(tenant_id);

-- Chat Widget Settings Table
CREATE TABLE IF NOT EXISTS chat_widget_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  primary_color TEXT DEFAULT '#1e40af', -- Blue
  secondary_color TEXT DEFAULT '#ffffff', -- White
  button_text TEXT DEFAULT 'Chat with us',
  welcome_message TEXT DEFAULT 'Hi! How can we help you today?',
  offline_message TEXT DEFAULT 'Our team is currently offline. Please leave a message and we''ll get back to you.',
  timezone TEXT DEFAULT 'Australia/Sydney',
  show_business_hours BOOLEAN DEFAULT TRUE,
  require_email_when_offline BOOLEAN DEFAULT TRUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chat_widget_tenant ON chat_widget_settings(tenant_id);

-- Seed default business hours for DTF tenant (Mon-Fri 9am-5pm)
INSERT OR IGNORE INTO business_hours (id, tenant_id, day_of_week, is_open, open_time, close_time)
VALUES 
  ('bh-dtf-0', 'test-tenant-dtf', 0, FALSE, NULL, NULL), -- Sunday - Closed
  ('bh-dtf-1', 'test-tenant-dtf', 1, TRUE, '09:00', '17:00'), -- Monday
  ('bh-dtf-2', 'test-tenant-dtf', 2, TRUE, '09:00', '17:00'), -- Tuesday
  ('bh-dtf-3', 'test-tenant-dtf', 3, TRUE, '09:00', '17:00'), -- Wednesday
  ('bh-dtf-4', 'test-tenant-dtf', 4, TRUE, '09:00', '17:00'), -- Thursday
  ('bh-dtf-5', 'test-tenant-dtf', 5, TRUE, '09:00', '17:00'), -- Friday
  ('bh-dtf-6', 'test-tenant-dtf', 6, FALSE, NULL, NULL); -- Saturday - Closed

-- Seed default chat widget settings for DTF tenant
INSERT OR IGNORE INTO chat_widget_settings (id, tenant_id, is_enabled, primary_color, button_text, welcome_message, timezone)
VALUES (
  'cws-dtf',
  'test-tenant-dtf',
  TRUE,
  '#1e40af',
  'Chat with us',
  'G''day! How can we help you today?',
  'Australia/Sydney'
);

