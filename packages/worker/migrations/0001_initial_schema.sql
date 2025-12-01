-- ============================================================================
-- DARTMOUTH FOUNDATION - INITIAL DATABASE SCHEMA
-- ============================================================================
-- Migration: 0001_initial_schema.sql
-- Created: November 17, 2025
-- Database: Cloudflare D1 (SQLite)
-- Purpose: Create all core tables for the Agent Army system
-- ============================================================================

-- ============================================================================
-- TABLE 1: SESSIONS
-- ============================================================================
-- Stores conversation session metadata
-- Each session represents a unique conversation between a user and an agent

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  organization_id TEXT,
  user_id TEXT,
  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  topics_discussed TEXT,  -- JSON array of topics
  goal_achieved INTEGER DEFAULT 0,  -- Boolean: 0 = false, 1 = true
  summary TEXT,
  metadata TEXT,  -- JSON object for additional data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_organization_id ON sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity_at ON sessions(last_activity_at);

-- ============================================================================
-- TABLE 2: MESSAGES
-- ============================================================================
-- Stores individual messages within conversations
-- Each message is either from the user or the assistant

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  intent TEXT,  -- JSON object with intent data
  timestamp TEXT NOT NULL,
  metadata TEXT,  -- JSON object for additional data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- ============================================================================
-- TABLE 3: SEMANTIC MEMORY
-- ============================================================================
-- Stores agent-level semantic knowledge learned from conversations
-- This is shared knowledge that applies across all conversations for an agent

CREATE TABLE IF NOT EXISTS semantic_memory (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,  -- e.g., 'fact', 'preference', 'rule'
  confidence REAL DEFAULT 1.0,  -- Confidence score 0.0-1.0
  source_session_id TEXT,  -- Optional: where this was learned
  metadata TEXT,  -- JSON object for additional data
  learned_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for semantic_memory table
CREATE INDEX IF NOT EXISTS idx_semantic_memory_agent_id ON semantic_memory(agent_id);
CREATE INDEX IF NOT EXISTS idx_semantic_memory_category ON semantic_memory(category);
CREATE INDEX IF NOT EXISTS idx_semantic_memory_learned_at ON semantic_memory(learned_at);

-- ============================================================================
-- TABLE 4: EPISODIC MEMORY
-- ============================================================================
-- Stores user-specific episodic memories (events, interactions)
-- This is personal memory about specific users

CREATE TABLE IF NOT EXISTS episodic_memory (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  session_id TEXT,  -- Optional: link to specific session
  summary TEXT NOT NULL,
  event_type TEXT,  -- e.g., 'conversation', 'achievement', 'preference'
  importance REAL DEFAULT 0.5,  -- Importance score 0.0-1.0
  metadata TEXT,  -- JSON object for additional data
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for episodic_memory table
CREATE INDEX IF NOT EXISTS idx_episodic_memory_user_id ON episodic_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_episodic_memory_agent_id ON episodic_memory(agent_id);
CREATE INDEX IF NOT EXISTS idx_episodic_memory_session_id ON episodic_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_episodic_memory_occurred_at ON episodic_memory(occurred_at);
CREATE INDEX IF NOT EXISTS idx_episodic_memory_importance ON episodic_memory(importance);

-- ============================================================================
-- TABLE 5: DOCUMENTS
-- ============================================================================
-- Stores documents uploaded to the knowledge base
-- Used by the RAG (Retrieval-Augmented Generation) system

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  agent_id TEXT,  -- Optional: agent-specific document
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- e.g., 'markdown', 'pdf', 'txt'
  file_size INTEGER NOT NULL,  -- Size in bytes
  content TEXT NOT NULL,  -- Full document content
  status TEXT NOT NULL DEFAULT 'processing' CHECK(status IN ('processing', 'ready', 'failed', 'archived')),
  error_message TEXT,  -- If processing failed
  chunk_count INTEGER DEFAULT 0,  -- Number of chunks created
  metadata TEXT,  -- JSON object for additional data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_agent_id ON documents(agent_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- ============================================================================
-- TABLE 6: RAG_CHUNKS
-- ============================================================================
-- Stores document chunks with embeddings for semantic search
-- Each document is split into chunks for efficient retrieval

CREATE TABLE IF NOT EXISTS rag_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,  -- Position in original document
  text TEXT NOT NULL,  -- The actual chunk text
  embedding TEXT NOT NULL,  -- JSON array of embedding vector
  token_count INTEGER,  -- Number of tokens in chunk
  metadata TEXT,  -- JSON object for additional data (e.g., page number, section)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Indexes for rag_chunks table
CREATE INDEX IF NOT EXISTS idx_rag_chunks_document_id ON rag_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_agent_id ON rag_chunks(agent_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_chunk_index ON rag_chunks(chunk_index);

-- Note: For vector similarity search, we'll use application-level logic
-- since D1/SQLite doesn't have native vector search capabilities

-- ============================================================================
-- TABLE 7: AGENT_ANALYTICS
-- ============================================================================
-- Stores analytics events for tracking agent performance and usage

CREATE TABLE IF NOT EXISTS agent_analytics (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  organization_id TEXT,
  session_id TEXT,
  event_type TEXT NOT NULL,  -- e.g., 'message_sent', 'intent_detected', 'error', 'feedback'
  event_data TEXT NOT NULL,  -- JSON object with event details
  user_id TEXT,
  timestamp TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for agent_analytics table
CREATE INDEX IF NOT EXISTS idx_agent_analytics_agent_id ON agent_analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_organization_id ON agent_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_session_id ON agent_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_event_type ON agent_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_timestamp ON agent_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_user_id ON agent_analytics(user_id);

-- ============================================================================
-- TABLE 8: FEEDBACK
-- ============================================================================
-- Stores user feedback on agent responses
-- Used for improving agent performance and quality

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  message_id TEXT,  -- Optional: specific message being rated
  agent_id TEXT NOT NULL,
  user_id TEXT,
  rating TEXT NOT NULL CHECK(rating IN ('positive', 'negative', 'neutral', 'thumbs_up', 'thumbs_down')),
  comment TEXT,  -- Optional user comment
  category TEXT,  -- e.g., 'accuracy', 'helpfulness', 'speed'
  metadata TEXT,  -- JSON object for additional data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Indexes for feedback table
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_message_id ON feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_feedback_agent_id ON feedback(agent_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- ============================================================================
-- TABLE 9: AGENT_CONFIGS
-- ============================================================================
-- Stores agent configuration settings
-- Each agent has customizable LLM settings and behavior

CREATE TABLE IF NOT EXISTS agent_configs (
  agent_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  llm_provider TEXT DEFAULT 'anthropic',
  llm_model TEXT DEFAULT 'claude-3-5-sonnet-20241022',
  temperature REAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  config_data TEXT,  -- JSON object for additional settings
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for agent_configs table
CREATE INDEX IF NOT EXISTS idx_agent_configs_name ON agent_configs(name);
CREATE INDEX IF NOT EXISTS idx_agent_configs_llm_provider ON agent_configs(llm_provider);
CREATE INDEX IF NOT EXISTS idx_agent_configs_updated_at ON agent_configs(updated_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================
-- Automatically update the updated_at field when records are modified

-- Trigger for sessions table
CREATE TRIGGER IF NOT EXISTS update_sessions_updated_at
AFTER UPDATE ON sessions
FOR EACH ROW
BEGIN
  UPDATE sessions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for semantic_memory table
CREATE TRIGGER IF NOT EXISTS update_semantic_memory_updated_at
AFTER UPDATE ON semantic_memory
FOR EACH ROW
BEGIN
  UPDATE semantic_memory SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for episodic_memory table
CREATE TRIGGER IF NOT EXISTS update_episodic_memory_updated_at
AFTER UPDATE ON episodic_memory
FOR EACH ROW
BEGIN
  UPDATE episodic_memory SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for documents table
CREATE TRIGGER IF NOT EXISTS update_documents_updated_at
AFTER UPDATE ON documents
FOR EACH ROW
BEGIN
  UPDATE documents SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for agent_configs table
CREATE TRIGGER IF NOT EXISTS update_agent_configs_updated_at
AFTER UPDATE ON agent_configs
FOR EACH ROW
BEGIN
  UPDATE agent_configs SET updated_at = datetime('now') WHERE agent_id = NEW.agent_id;
END;

-- ============================================================================
-- INITIAL DATA / SEED DATA (Optional)
-- ============================================================================
-- Add any initial data here if needed

-- Example: Insert a default system session for testing
-- INSERT INTO sessions (id, agent_id, organization_id, started_at, last_activity_at)
-- VALUES ('system-test-session', 'system', 'system', datetime('now'), datetime('now'));

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Schema Version: 0001
-- Tables Created: 9
-- Indexes Created: 38
-- Triggers Created: 5
-- Foreign Keys: 3
-- 
-- Next Steps:
-- 1. Run this migration on Cloudflare D1
-- 2. Verify all tables are created
-- 3. Test with sample data
-- 4. Update application code to use these tables
-- ============================================================================

