-- Migration: Agent Regional Overrides
-- Purpose: Allow individual agents to override tenant default settings
-- Created: December 4, 2025

-- Add regional override columns to agents table (if it exists)
-- NULL = inherit from tenant, SET = use agent-specific value

-- First check if agents table exists, if not create it
CREATE TABLE IF NOT EXISTS agents (
  agent_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'customer_service',
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenant_settings(tenant_id)
);

-- Add regional override columns (nullable = inherit from tenant)
ALTER TABLE agents ADD COLUMN timezone TEXT; -- NULL = inherit from tenant
ALTER TABLE agents ADD COLUMN language TEXT; -- NULL = inherit from tenant
ALTER TABLE agents ADD COLUMN measurement_system TEXT; -- NULL = inherit from tenant
ALTER TABLE agents ADD COLUMN currency TEXT; -- NULL = inherit from tenant
ALTER TABLE agents ADD COLUMN currency_symbol TEXT; -- NULL = inherit from tenant
ALTER TABLE agents ADD COLUMN date_format TEXT; -- NULL = inherit from tenant
ALTER TABLE agents ADD COLUMN time_format TEXT; -- NULL = inherit from tenant

-- Create index for agent lookups
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);

-- Insert default agent for existing tenant
INSERT OR IGNORE INTO agents (
  agent_id,
  tenant_id,
  name,
  description,
  type,
  status
) VALUES (
  'ai-agent-001',
  'test-tenant-dtf',
  'McCarthy AI',
  'Customer Service AI Agent for Direct To Film Australia',
  'customer_service',
  'active'
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_agents_updated_at
AFTER UPDATE ON agents
FOR EACH ROW
BEGIN
  UPDATE agents SET updated_at = datetime('now') WHERE agent_id = NEW.agent_id;
END;

