-- Migration: Multi-Tenant Regional Settings
-- Purpose: Enable SaaS deployment for any country with configurable regional settings
-- Created: December 4, 2025

-- Tenant Settings Table (one row per tenant)
-- Stores default regional settings that all agents inherit
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id TEXT PRIMARY KEY,
  
  -- Business Information
  business_name TEXT NOT NULL,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  business_website TEXT,
  
  -- Regional Settings (with Australian defaults)
  timezone TEXT DEFAULT 'Australia/Brisbane',
  language TEXT DEFAULT 'en-AU', -- en-AU, en-GB, en-US, en-CA
  measurement_system TEXT DEFAULT 'metric', -- metric, imperial
  currency TEXT DEFAULT 'AUD',
  currency_symbol TEXT DEFAULT '$',
  date_format TEXT DEFAULT 'DD/MM/YYYY', -- DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  time_format TEXT DEFAULT '12h', -- 12h, 24h
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);

-- Insert default tenant settings for existing tenant
INSERT OR IGNORE INTO tenant_settings (
  tenant_id,
  business_name,
  business_email,
  timezone,
  language,
  measurement_system,
  currency,
  currency_symbol,
  date_format,
  time_format
) VALUES (
  'test-tenant-dtf',
  'Direct To Film Australia',
  'support@directtofilm.com.au',
  'Australia/Brisbane',
  'en-AU',
  'metric',
  'AUD',
  '$',
  'DD/MM/YYYY',
  '12h'
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_tenant_settings_updated_at
AFTER UPDATE ON tenant_settings
FOR EACH ROW
BEGIN
  UPDATE tenant_settings SET updated_at = datetime('now') WHERE tenant_id = NEW.tenant_id;
END;

