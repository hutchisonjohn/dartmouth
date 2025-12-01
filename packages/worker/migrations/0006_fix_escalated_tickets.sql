-- Migration 0006: Fix existing escalated tickets
-- Date: 2025-11-30
-- Purpose: Update tickets with status='escalated' to status='in-progress'
--          Escalation is now tracked via the escalations table, not as a status

-- Update all tickets that have status='escalated' to 'in-progress'
UPDATE tickets 
SET status = 'in-progress', 
    updated_at = datetime('now')
WHERE status = 'escalated';

-- Optional: Remove 'escalated' from the CHECK constraint
-- Note: SQLite doesn't support ALTER TABLE to modify CHECK constraints
-- So we'll leave it in the schema but just never use it

