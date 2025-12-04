-- RAG Document Chunks Table
-- Stores chunked documents with metadata for vector search

CREATE TABLE IF NOT EXISTS rag_document_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    document_title TEXT NOT NULL,
    category TEXT NOT NULL,
    section_title TEXT,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    vector_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES ai_knowledge_documents(id) ON DELETE CASCADE
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rag_chunks_document ON rag_document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_category ON rag_document_chunks(category);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_vector ON rag_document_chunks(vector_id);

