-- Migration 0012: Add AI Agent as Staff Member
-- Date: 2025-12-01
-- Purpose: Create AI agent staff user for tracking AI-generated responses

-- Insert AI Agent as a special staff member
INSERT INTO staff_users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_active,
  is_available,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  'ai-agent-001',
  'ai@system.internal',
  'NO_PASSWORD_AI_AGENT',
  'AI',
  'Assistant',
  'agent',
  1,
  1,
  NULL,
  datetime('now'),
  datetime('now')
);

-- Add index for quick AI agent lookup
CREATE INDEX IF NOT EXISTS idx_staff_users_ai_agent ON staff_users(id) WHERE id = 'ai-agent-001';

