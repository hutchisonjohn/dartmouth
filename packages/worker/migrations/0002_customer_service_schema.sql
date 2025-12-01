-- Customer Service System Database Schema
-- Created: Nov 28, 2025
-- Database: Cloudflare D1 (SQLite)

-- ============================================================================
-- AUTHENTICATION & AUTHORIZATION
-- ============================================================================

-- Users table (staff members)
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  role_id TEXT PRIMARY KEY,
  role_name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  permission_id TEXT PRIMARY KEY,
  permission_name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User roles (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  assigned_by TEXT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Role permissions (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id TEXT NOT NULL,
  permission_id TEXT NOT NULL,
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- ============================================================================
-- INTERNAL COMMUNICATION SYSTEM
-- ============================================================================

-- Channels (group channels, DMs)
CREATE TABLE IF NOT EXISTS channels (
  channel_id TEXT PRIMARY KEY,
  channel_name TEXT,
  channel_type TEXT NOT NULL CHECK(channel_type IN ('public', 'private', 'direct')),
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  archived BOOLEAN DEFAULT 0,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE INDEX idx_channels_type ON channels(channel_type);
CREATE INDEX idx_channels_archived ON channels(archived);

-- Channel members
CREATE TABLE IF NOT EXISTS channel_members (
  channel_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_read_at TEXT,
  PRIMARY KEY (channel_id, user_id),
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_channel_members_user ON channel_members(user_id);

-- Channel messages
CREATE TABLE IF NOT EXISTS channel_messages (
  message_id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_message_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted BOOLEAN DEFAULT 0,
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_message_id) REFERENCES channel_messages(message_id) ON DELETE CASCADE
);

CREATE INDEX idx_channel_messages_channel ON channel_messages(channel_id, created_at);
CREATE INDEX idx_channel_messages_parent ON channel_messages(parent_message_id);
CREATE INDEX idx_channel_messages_user ON channel_messages(user_id);

-- Threads
CREATE TABLE IF NOT EXISTS threads (
  thread_id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  parent_message_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_message_id) REFERENCES channel_messages(message_id) ON DELETE CASCADE
);

CREATE INDEX idx_threads_channel ON threads(channel_id);
CREATE INDEX idx_threads_parent ON threads(parent_message_id);

-- Mentions
CREATE TABLE IF NOT EXISTS mentions (
  mention_id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  mentioned_by TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (message_id) REFERENCES channel_messages(message_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (mentioned_by) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_mentions_user ON mentions(user_id, read);
CREATE INDEX idx_mentions_message ON mentions(message_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  notification_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at);

-- Staff presence
CREATE TABLE IF NOT EXISTS staff_presence (
  user_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('online', 'away', 'busy', 'offline')),
  last_seen TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- CUSTOMER SERVICE TICKETS
-- ============================================================================

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'pending', 'resolved', 'closed', 'escalated')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  channel TEXT NOT NULL,
  assigned_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  closed_at TEXT,
  sla_due_at TEXT,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);

CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_tickets_created ON tickets(created_at);

-- Ticket messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  message_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK(sender_type IN ('customer', 'agent', 'system')),
  sender_id TEXT,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);

-- Customer profiles (cached from Shopify/PERP)
CREATE TABLE IF NOT EXISTS customer_profiles (
  customer_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  is_vip BOOLEAN DEFAULT 0,
  vip_tier TEXT,
  lifetime_value REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  shopify_id TEXT,
  perp_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_synced_at TEXT
);

CREATE INDEX idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX idx_customer_profiles_shopify ON customer_profiles(shopify_id);
CREATE INDEX idx_customer_profiles_perp ON customer_profiles(perp_id);

-- Internal notes (staff-only)
CREATE TABLE IF NOT EXISTS internal_notes (
  note_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_internal_notes_ticket ON internal_notes(ticket_id, created_at);

-- Escalations
CREATE TABLE IF NOT EXISTS escalations (
  escalation_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  escalated_by TEXT NOT NULL,
  escalated_to TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (escalated_by) REFERENCES users(user_id),
  FOREIGN KEY (escalated_to) REFERENCES users(user_id)
);

CREATE INDEX idx_escalations_ticket ON escalations(ticket_id);

-- Ticket assignments
CREATE TABLE IF NOT EXISTS ticket_assignments (
  assignment_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  unassigned_at TEXT,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id),
  FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

CREATE INDEX idx_ticket_assignments_ticket ON ticket_assignments(ticket_id);
CREATE INDEX idx_ticket_assignments_user ON ticket_assignments(assigned_to);

-- ============================================================================
-- ANALYTICS & METRICS
-- ============================================================================

-- Customer satisfaction ratings
CREATE TABLE IF NOT EXISTS customer_satisfaction (
  rating_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

CREATE INDEX idx_customer_satisfaction_ticket ON customer_satisfaction(ticket_id);
CREATE INDEX idx_customer_satisfaction_rating ON customer_satisfaction(rating, created_at);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  user_id TEXT,
  ticket_id TEXT,
  agent_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_ticket ON analytics_events(ticket_id);

-- Conversation logs
CREATE TABLE IF NOT EXISTS conversation_logs (
  log_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  agent_id TEXT,
  customer_id TEXT NOT NULL,
  duration_seconds INTEGER,
  message_count INTEGER DEFAULT 0,
  resolution_status TEXT,
  satisfaction_rating INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

CREATE INDEX idx_conversation_logs_ticket ON conversation_logs(ticket_id);
CREATE INDEX idx_conversation_logs_agent ON conversation_logs(agent_id, created_at);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

-- Shopify sync log
CREATE TABLE IF NOT EXISTS shopify_sync_log (
  sync_id TEXT PRIMARY KEY,
  sync_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_shopify_sync_log_type ON shopify_sync_log(sync_type, created_at);
CREATE INDEX idx_shopify_sync_log_status ON shopify_sync_log(status);

-- PERP sync log
CREATE TABLE IF NOT EXISTS perp_sync_log (
  sync_id TEXT PRIMARY KEY,
  sync_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_perp_sync_log_type ON perp_sync_log(sync_type, created_at);
CREATE INDEX idx_perp_sync_log_status ON perp_sync_log(status);

-- ============================================================================
-- AGENT HANDOFFS
-- ============================================================================

-- Agent handoffs
CREATE TABLE IF NOT EXISTS agent_handoffs (
  handoff_id TEXT PRIMARY KEY,
  from_agent_id TEXT NOT NULL,
  to_agent_id TEXT NOT NULL,
  ticket_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'completed')),
  context TEXT NOT NULL,
  message TEXT NOT NULL,
  reason TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  accepted_at TEXT,
  rejected_at TEXT,
  completed_at TEXT,
  rejection_reason TEXT
);

CREATE INDEX idx_agent_handoffs_from ON agent_handoffs(from_agent_id);
CREATE INDEX idx_agent_handoffs_to ON agent_handoffs(to_agent_id);
CREATE INDEX idx_agent_handoffs_status ON agent_handoffs(status);
CREATE INDEX idx_agent_handoffs_ticket ON agent_handoffs(ticket_id);

-- ============================================================================
-- PRODUCT KNOWLEDGE (RAG Cache)
-- ============================================================================

-- Product knowledge cache
CREATE TABLE IF NOT EXISTS product_knowledge (
  product_id TEXT PRIMARY KEY,
  shopify_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  product_type TEXT,
  vendor TEXT,
  tags TEXT,
  price REAL,
  currency TEXT,
  inventory_quantity INTEGER,
  image_url TEXT,
  metadata TEXT,
  last_synced_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_product_knowledge_shopify ON product_knowledge(shopify_id);
CREATE INDEX idx_product_knowledge_type ON product_knowledge(product_type);
CREATE INDEX idx_product_knowledge_vendor ON product_knowledge(vendor);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default roles
INSERT OR IGNORE INTO roles (role_id, role_name, description) VALUES
  ('role_admin', 'Admin', 'Full system access'),
  ('role_manager', 'Manager', 'Manage team and tickets'),
  ('role_agent', 'Agent', 'Handle customer tickets'),
  ('role_viewer', 'Viewer', 'Read-only access');

-- Insert default permissions
INSERT OR IGNORE INTO permissions (permission_id, permission_name, description, resource, action) VALUES
  ('perm_tickets_read', 'tickets:read', 'View tickets', 'tickets', 'read'),
  ('perm_tickets_create', 'tickets:create', 'Create tickets', 'tickets', 'create'),
  ('perm_tickets_update', 'tickets:update', 'Update tickets', 'tickets', 'update'),
  ('perm_tickets_delete', 'tickets:delete', 'Delete tickets', 'tickets', 'delete'),
  ('perm_tickets_assign', 'tickets:assign', 'Assign tickets', 'tickets', 'assign'),
  ('perm_users_read', 'users:read', 'View users', 'users', 'read'),
  ('perm_users_create', 'users:create', 'Create users', 'users', 'create'),
  ('perm_users_update', 'users:update', 'Update users', 'users', 'update'),
  ('perm_users_delete', 'users:delete', 'Delete users', 'users', 'delete'),
  ('perm_channels_read', 'channels:read', 'View channels', 'channels', 'read'),
  ('perm_channels_create', 'channels:create', 'Create channels', 'channels', 'create'),
  ('perm_channels_update', 'channels:update', 'Update channels', 'channels', 'update'),
  ('perm_channels_delete', 'channels:delete', 'Delete channels', 'channels', 'delete'),
  ('perm_analytics_read', 'analytics:read', 'View analytics', 'analytics', 'read');

-- Assign permissions to roles
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
  -- Admin gets everything
  ('role_admin', 'perm_tickets_read'),
  ('role_admin', 'perm_tickets_create'),
  ('role_admin', 'perm_tickets_update'),
  ('role_admin', 'perm_tickets_delete'),
  ('role_admin', 'perm_tickets_assign'),
  ('role_admin', 'perm_users_read'),
  ('role_admin', 'perm_users_create'),
  ('role_admin', 'perm_users_update'),
  ('role_admin', 'perm_users_delete'),
  ('role_admin', 'perm_channels_read'),
  ('role_admin', 'perm_channels_create'),
  ('role_admin', 'perm_channels_update'),
  ('role_admin', 'perm_channels_delete'),
  ('role_admin', 'perm_analytics_read'),
  
  -- Manager gets most things
  ('role_manager', 'perm_tickets_read'),
  ('role_manager', 'perm_tickets_create'),
  ('role_manager', 'perm_tickets_update'),
  ('role_manager', 'perm_tickets_assign'),
  ('role_manager', 'perm_users_read'),
  ('role_manager', 'perm_channels_read'),
  ('role_manager', 'perm_channels_create'),
  ('role_manager', 'perm_channels_update'),
  ('role_manager', 'perm_analytics_read'),
  
  -- Agent gets basic access
  ('role_agent', 'perm_tickets_read'),
  ('role_agent', 'perm_tickets_create'),
  ('role_agent', 'perm_tickets_update'),
  ('role_agent', 'perm_channels_read'),
  
  -- Viewer gets read-only
  ('role_viewer', 'perm_tickets_read'),
  ('role_viewer', 'perm_users_read'),
  ('role_viewer', 'perm_channels_read'),
  ('role_viewer', 'perm_analytics_read');

-- Insert default channels
INSERT OR IGNORE INTO channels (channel_id, channel_name, channel_type, description, created_by) VALUES
  ('channel_general', 'General', 'public', 'General discussion for all staff', 'system'),
  ('channel_managers', 'Managers', 'private', 'Private channel for managers and team leads', 'system'),
  ('channel_design', 'Graphic Design', 'private', 'Channel for designers to collaborate', 'system'),
  ('channel_sales', 'Sales Team', 'private', 'Sales team coordination', 'system'),
  ('channel_production', 'Production', 'private', 'Production team updates', 'system');

