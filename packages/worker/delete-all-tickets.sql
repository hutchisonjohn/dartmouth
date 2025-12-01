PRAGMA foreign_keys=OFF;
DELETE FROM ticket_messages;
DELETE FROM emails;
DELETE FROM internal_notes;
DELETE FROM escalations;
DELETE FROM ticket_assignments;
DELETE FROM tickets;
PRAGMA foreign_keys=ON;

