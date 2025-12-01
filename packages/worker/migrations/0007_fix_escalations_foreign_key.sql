-- Migration 0007: Fix escalations table foreign key reference
-- Date: 2025-11-30
-- Purpose: Fix foreign key to reference tickets(ticket_id) instead of tickets(id)

-- SQLite doesn't support ALTER TABLE to modify foreign keys
-- So we need to recreate the table

-- Step 1: Create new escalations table with correct foreign key
CREATE TABLE IF NOT EXISTS escalations_new (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  escalated_by TEXT,
  escalated_to TEXT,
  reason TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'accepted', 'resolved')) DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (escalated_by) REFERENCES staff_users(id) ON DELETE SET NULL,
  FOREIGN KEY (escalated_to) REFERENCES staff_users(id) ON DELETE SET NULL
);

-- Step 2: Copy any existing data (if any)
INSERT INTO escalations_new SELECT * FROM escalations;

-- Step 3: Drop old table
DROP TABLE escalations;

-- Step 4: Rename new table
ALTER TABLE escalations_new RENAME TO escalations;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_escalations_ticket_id ON escalations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);

