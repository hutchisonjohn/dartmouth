-- Migration to add resolution tracking and queue management for chat conversations

-- Add resolution tracking fields
ALTER TABLE chat_conversations ADD COLUMN resolution_type TEXT CHECK(resolution_type IN ('ai_resolved', 'staff_resolved', 'inactive_closed'));
ALTER TABLE chat_conversations ADD COLUMN resolved_by TEXT; -- staff_id or 'ai-agent-001'
ALTER TABLE chat_conversations ADD COLUMN resolved_at TEXT;

-- Add queue management fields
ALTER TABLE chat_conversations ADD COLUMN queue_entered_at TEXT;
ALTER TABLE chat_conversations ADD COLUMN queue_assigned_at TEXT;

-- Add priority and sentiment (like email tickets)
ALTER TABLE chat_conversations ADD COLUMN priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent', 'critical'));
ALTER TABLE chat_conversations ADD COLUMN sentiment TEXT DEFAULT 'neutral' CHECK(sentiment IN ('positive', 'neutral', 'negative', 'angry'));

-- Add inactive tracking
ALTER TABLE chat_conversations ADD COLUMN last_activity_at TEXT;
ALTER TABLE chat_conversations ADD COLUMN inactive_warning_count INTEGER DEFAULT 0;

-- Add post-chat survey fields
ALTER TABLE chat_conversations ADD COLUMN survey_rating INTEGER; -- 1-5 stars
ALTER TABLE chat_conversations ADD COLUMN survey_thumbs TEXT CHECK(survey_thumbs IN ('up', 'down'));
ALTER TABLE chat_conversations ADD COLUMN survey_feedback TEXT;
ALTER TABLE chat_conversations ADD COLUMN survey_submitted_at TEXT;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_conversations_resolution_type ON chat_conversations(resolution_type);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_queue_entered_at ON chat_conversations(queue_entered_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_activity_at ON chat_conversations(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_priority ON chat_conversations(priority);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_sentiment ON chat_conversations(sentiment);

