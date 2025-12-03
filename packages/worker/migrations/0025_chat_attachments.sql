-- Migration to add attachment support to chat messages

-- Add attachment columns to chat_messages
ALTER TABLE chat_messages ADD COLUMN attachment_url TEXT;
ALTER TABLE chat_messages ADD COLUMN attachment_name TEXT;
ALTER TABLE chat_messages ADD COLUMN attachment_type TEXT;
ALTER TABLE chat_messages ADD COLUMN attachment_size INTEGER;

