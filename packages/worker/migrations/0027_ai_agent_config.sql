-- Migration to add AI Agent configuration tables
-- For RAG knowledge documents and system message configuration

-- AI Knowledge Documents Table (for RAG)
CREATE TABLE IF NOT EXISTS ai_knowledge_documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  title TEXT,
  category TEXT DEFAULT 'general', -- policies, products, faq, general, other
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  uploaded_by TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, processing, error, deleted
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_documents_category ON ai_knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_documents_status ON ai_knowledge_documents(status);

-- AI System Message Configuration Table
CREATE TABLE IF NOT EXISTS ai_system_message_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  role TEXT,
  personality TEXT,
  responsibilities TEXT,
  dos TEXT,
  donts TEXT,
  tone TEXT,
  custom_instructions TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

