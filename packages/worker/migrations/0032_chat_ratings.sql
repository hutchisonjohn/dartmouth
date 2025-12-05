-- Migration: 0032_chat_ratings.sql
-- Description: Create table for post-chat survey ratings

CREATE TABLE IF NOT EXISTS chat_ratings (
    id TEXT PRIMARY KEY NOT NULL,
    conversation_id TEXT NOT NULL,
    ticket_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    handler_type TEXT NOT NULL DEFAULT 'ai' CHECK (handler_type IN ('ai', 'staff', 'mixed')),
    handler_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_ratings_conversation_id ON chat_ratings (conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_ratings_ticket_id ON chat_ratings (ticket_id);
CREATE INDEX IF NOT EXISTS idx_chat_ratings_handler_type ON chat_ratings (handler_type);
CREATE INDEX IF NOT EXISTS idx_chat_ratings_rating ON chat_ratings (rating);
CREATE INDEX IF NOT EXISTS idx_chat_ratings_created_at ON chat_ratings (created_at);


