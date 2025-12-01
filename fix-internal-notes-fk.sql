-- Drop the old table
DROP TABLE IF EXISTS internal_notes;

-- Recreate with correct foreign key
CREATE TABLE internal_notes (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  note_type TEXT CHECK(note_type IN ('general', 'escalation', 'resolution')) DEFAULT 'general',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_internal_notes_ticket ON internal_notes(ticket_id);
CREATE INDEX idx_internal_notes_staff ON internal_notes(staff_id);

