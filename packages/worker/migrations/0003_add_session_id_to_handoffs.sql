-- Add session_id column to agent_handoffs for efficient querying
-- Created: Nov 28, 2025
-- Fixes: SQL injection vulnerability from LIKE queries on JSON

ALTER TABLE agent_handoffs ADD COLUMN session_id TEXT;

CREATE INDEX idx_agent_handoffs_session ON agent_handoffs(session_id);

-- Backfill session_id from existing context JSON (if any records exist)
-- Note: This is a one-time migration, new records will have session_id populated
UPDATE agent_handoffs 
SET session_id = json_extract(context, '$.sessionId')
WHERE session_id IS NULL AND context IS NOT NULL;

