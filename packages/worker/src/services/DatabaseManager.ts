/**
 * DatabaseManager.ts
 * 
 * Provides a clean abstraction layer for all database operations.
 * Handles CRUD operations for all 8 core tables in the Dartmouth system.
 * 
 * Design Principles:
 * - Type-safe operations with full TypeScript support
 * - Automatic timestamp management
 * - Transaction support for complex operations
 * - Error handling with detailed messages
 * - JSON serialization/deserialization for complex fields
 */

import type { D1Database } from '@cloudflare/workers-types';

/**
 * Session record in the database
 */
export interface SessionRecord {
  id: string;
  agent_id: string;
  organization_id?: string;
  user_id?: string;
  started_at: string;
  last_activity_at: string;
  message_count: number;
  topics_discussed?: string; // JSON array
  goal_achieved: number; // 0 or 1
  summary?: string;
  metadata?: string; // JSON object
  created_at: string;
  updated_at: string;
}

/**
 * Message record in the database
 */
export interface MessageRecord {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string; // JSON object
  timestamp: string;
  metadata?: string; // JSON object
  created_at: string;
}

/**
 * Semantic memory record in the database
 */
export interface SemanticMemoryRecord {
  id: string;
  agent_id: string;
  content: string;
  category?: string;
  confidence: number;
  source_session_id?: string;
  metadata?: string; // JSON object
  learned_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Episodic memory record in the database
 */
export interface EpisodicMemoryRecord {
  id: string;
  user_id: string;
  agent_id: string;
  session_id?: string;
  summary: string;
  event_type?: string;
  importance: number;
  metadata?: string; // JSON object
  occurred_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Document record in the database
 */
export interface DocumentRecord {
  id: string;
  organization_id: string;
  agent_id?: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  content: string;
  status: 'processing' | 'ready' | 'failed' | 'archived';
  error_message?: string;
  chunk_count: number;
  metadata?: string; // JSON object
  created_at: string;
  updated_at: string;
}

/**
 * RAG chunk record in the database
 */
export interface RAGChunkRecord {
  id: string;
  document_id: string;
  agent_id: string;
  chunk_index: number;
  text: string;
  embedding: string; // JSON array
  token_count?: number;
  metadata?: string; // JSON object
  created_at: string;
}

/**
 * Analytics event record in the database
 */
export interface AnalyticsEventRecord {
  id: string;
  agent_id: string;
  organization_id?: string;
  session_id?: string;
  event_type: string;
  event_data: string; // JSON object
  user_id?: string;
  timestamp: string;
  created_at: string;
}

/**
 * Feedback record in the database
 */
export interface FeedbackRecord {
  id: string;
  session_id: string;
  message_id?: string;
  agent_id: string;
  user_id?: string;
  rating: 'positive' | 'negative' | 'neutral' | 'thumbs_up' | 'thumbs_down';
  comment?: string;
  category?: string;
  metadata?: string; // JSON object
  created_at: string;
}

/**
 * DatabaseManager class
 * Provides all database operations for the Dartmouth system
 */
export class DatabaseManager {
  constructor(private db: D1Database) {}

  // ========================================================================
  // SESSION OPERATIONS
  // ========================================================================

  /**
   * Create a new session
   */
  async createSession(data: {
    id: string;
    agentId: string;
    organizationId?: string;
    userId?: string;
    startedAt: string;
    metadata?: Record<string, any>;
  }): Promise<SessionRecord> {
    const now = new Date().toISOString();
    
    const result = await this.db
      .prepare(
        `INSERT INTO sessions (
          id, agent_id, organization_id, user_id, started_at, 
          last_activity_at, message_count, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.agentId,
        data.organizationId || null,
        data.userId || null,
        data.startedAt,
        data.startedAt,
        0,
        data.metadata ? JSON.stringify(data.metadata) : null,
        now,
        now
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create session: ${result.error}`);
    }

    return this.getSession(data.id) as Promise<SessionRecord>;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<SessionRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .bind(sessionId)
      .first<SessionRecord>();

    return result || null;
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string, messageCount?: number): Promise<void> {
    const now = new Date().toISOString();
    
    if (messageCount !== undefined) {
      await this.db
        .prepare(
          'UPDATE sessions SET last_activity_at = ?, message_count = ? WHERE id = ?'
        )
        .bind(now, messageCount, sessionId)
        .run();
    } else {
      await this.db
        .prepare('UPDATE sessions SET last_activity_at = ? WHERE id = ?')
        .bind(now, sessionId)
        .run();
    }
  }

  /**
   * Update session summary
   */
  async updateSessionSummary(
    sessionId: string,
    summary: string,
    topics?: string[],
    goalAchieved?: boolean
  ): Promise<void> {
    await this.db
      .prepare(
        `UPDATE sessions 
         SET summary = ?, topics_discussed = ?, goal_achieved = ? 
         WHERE id = ?`
      )
      .bind(
        summary,
        topics ? JSON.stringify(topics) : null,
        goalAchieved ? 1 : 0,
        sessionId
      )
      .run();
  }

  /**
   * Get sessions by agent ID
   */
  async getSessionsByAgent(
    agentId: string,
    limit: number = 50
  ): Promise<SessionRecord[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM sessions WHERE agent_id = ? ORDER BY last_activity_at DESC LIMIT ?'
      )
      .bind(agentId, limit)
      .all<SessionRecord>();

    return result.results || [];
  }

  // ========================================================================
  // MESSAGE OPERATIONS
  // ========================================================================

  /**
   * Create a new message
   */
  async createMessage(data: {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    intent?: Record<string, any>;
    timestamp: string;
    metadata?: Record<string, any>;
  }): Promise<MessageRecord> {
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO messages (
          id, session_id, role, content, intent, timestamp, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.sessionId,
        data.role,
        data.content,
        data.intent ? JSON.stringify(data.intent) : null,
        data.timestamp,
        data.metadata ? JSON.stringify(data.metadata) : null,
        now
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create message: ${result.error}`);
    }

    return this.getMessage(data.id) as Promise<MessageRecord>;
  }

  /**
   * Get a message by ID
   */
  async getMessage(messageId: string): Promise<MessageRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM messages WHERE id = ?')
      .bind(messageId)
      .first<MessageRecord>();

    return result || null;
  }

  /**
   * Get messages by session ID
   */
  async getMessagesBySession(
    sessionId: string,
    limit?: number
  ): Promise<MessageRecord[]> {
    let query = 'SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC';
    
    if (limit) {
      query += ' LIMIT ?';
      const result = await this.db
        .prepare(query)
        .bind(sessionId, limit)
        .all<MessageRecord>();
      return result.results || [];
    }

    const result = await this.db
      .prepare(query)
      .bind(sessionId)
      .all<MessageRecord>();

    return result.results || [];
  }

  // ========================================================================
  // SEMANTIC MEMORY OPERATIONS
  // ========================================================================

  /**
   * Create semantic memory
   */
  async createSemanticMemory(data: {
    id: string;
    agentId: string;
    content: string;
    category?: string;
    confidence?: number;
    sourceSessionId?: string;
    metadata?: Record<string, any>;
    learnedAt: string;
  }): Promise<SemanticMemoryRecord> {
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO semantic_memory (
          id, agent_id, content, category, confidence, 
          source_session_id, metadata, learned_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.agentId,
        data.content,
        data.category || null,
        data.confidence || 1.0,
        data.sourceSessionId || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.learnedAt,
        now,
        now
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create semantic memory: ${result.error}`);
    }

    return this.getSemanticMemory(data.id) as Promise<SemanticMemoryRecord>;
  }

  /**
   * Get semantic memory by ID
   */
  async getSemanticMemory(memoryId: string): Promise<SemanticMemoryRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM semantic_memory WHERE id = ?')
      .bind(memoryId)
      .first<SemanticMemoryRecord>();

    return result || null;
  }

  /**
   * Get semantic memories by agent ID
   */
  async getSemanticMemoriesByAgent(
    agentId: string,
    category?: string,
    limit: number = 100
  ): Promise<SemanticMemoryRecord[]> {
    let query = 'SELECT * FROM semantic_memory WHERE agent_id = ?';
    const params: any[] = [agentId];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY learned_at DESC LIMIT ?';
    params.push(limit);

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .all<SemanticMemoryRecord>();

    return result.results || [];
  }

  // ========================================================================
  // EPISODIC MEMORY OPERATIONS
  // ========================================================================

  /**
   * Create episodic memory
   */
  async createEpisodicMemory(data: {
    id: string;
    userId: string;
    agentId: string;
    sessionId?: string;
    summary: string;
    eventType?: string;
    importance?: number;
    metadata?: Record<string, any>;
    occurredAt: string;
  }): Promise<EpisodicMemoryRecord> {
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO episodic_memory (
          id, user_id, agent_id, session_id, summary, event_type, 
          importance, metadata, occurred_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.userId,
        data.agentId,
        data.sessionId || null,
        data.summary,
        data.eventType || null,
        data.importance || 0.5,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.occurredAt,
        now,
        now
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create episodic memory: ${result.error}`);
    }

    return this.getEpisodicMemory(data.id) as Promise<EpisodicMemoryRecord>;
  }

  /**
   * Get episodic memory by ID
   */
  async getEpisodicMemory(memoryId: string): Promise<EpisodicMemoryRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM episodic_memory WHERE id = ?')
      .bind(memoryId)
      .first<EpisodicMemoryRecord>();

    return result || null;
  }

  /**
   * Get episodic memories by user ID
   */
  async getEpisodicMemoriesByUser(
    userId: string,
    agentId?: string,
    limit: number = 50
  ): Promise<EpisodicMemoryRecord[]> {
    let query = 'SELECT * FROM episodic_memory WHERE user_id = ?';
    const params: any[] = [userId];

    if (agentId) {
      query += ' AND agent_id = ?';
      params.push(agentId);
    }

    query += ' ORDER BY importance DESC, occurred_at DESC LIMIT ?';
    params.push(limit);

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .all<EpisodicMemoryRecord>();

    return result.results || [];
  }

  // ========================================================================
  // DOCUMENT OPERATIONS
  // ========================================================================

  /**
   * Create a document
   */
  async createDocument(data: {
    id: string;
    organizationId: string;
    agentId?: string;
    title: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<DocumentRecord> {
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO documents (
          id, organization_id, agent_id, title, file_name, file_type, 
          file_size, content, status, chunk_count, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.organizationId,
        data.agentId || null,
        data.title,
        data.fileName,
        data.fileType,
        data.fileSize,
        data.content,
        'processing',
        0,
        data.metadata ? JSON.stringify(data.metadata) : null,
        now,
        now
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create document: ${result.error}`);
    }

    return this.getDocument(data.id) as Promise<DocumentRecord>;
  }

  /**
   * Get a document by ID
   */
  async getDocument(documentId: string): Promise<DocumentRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM documents WHERE id = ?')
      .bind(documentId)
      .first<DocumentRecord>();

    return result || null;
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(
    documentId: string,
    status: 'processing' | 'ready' | 'failed' | 'archived',
    errorMessage?: string,
    chunkCount?: number
  ): Promise<void> {
    await this.db
      .prepare(
        `UPDATE documents 
         SET status = ?, error_message = ?, chunk_count = ? 
         WHERE id = ?`
      )
      .bind(
        status,
        errorMessage || null,
        chunkCount || 0,
        documentId
      )
      .run();
  }

  /**
   * Get documents by organization
   */
  async getDocumentsByOrganization(
    organizationId: string,
    agentId?: string,
    limit: number = 50
  ): Promise<DocumentRecord[]> {
    let query = 'SELECT * FROM documents WHERE organization_id = ?';
    const params: any[] = [organizationId];

    if (agentId) {
      query += ' AND agent_id = ?';
      params.push(agentId);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .all<DocumentRecord>();

    return result.results || [];
  }

  // ========================================================================
  // RAG CHUNK OPERATIONS
  // ========================================================================

  /**
   * Create a RAG chunk
   */
  async createRAGChunk(data: {
    id: string;
    documentId: string;
    agentId: string;
    chunkIndex: number;
    text: string;
    embedding: number[];
    tokenCount?: number;
    metadata?: Record<string, any>;
  }): Promise<RAGChunkRecord> {
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO rag_chunks (
          id, document_id, agent_id, chunk_index, text, 
          embedding, token_count, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.documentId,
        data.agentId,
        data.chunkIndex,
        data.text,
        JSON.stringify(data.embedding),
        data.tokenCount || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        now
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create RAG chunk: ${result.error}`);
    }

    return this.getRAGChunk(data.id) as Promise<RAGChunkRecord>;
  }

  /**
   * Get a RAG chunk by ID
   */
  async getRAGChunk(chunkId: string): Promise<RAGChunkRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM rag_chunks WHERE id = ?')
      .bind(chunkId)
      .first<RAGChunkRecord>();

    return result || null;
  }

  /**
   * Get RAG chunks by document ID
   */
  async getRAGChunksByDocument(documentId: string): Promise<RAGChunkRecord[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM rag_chunks WHERE document_id = ? ORDER BY chunk_index ASC'
      )
      .bind(documentId)
      .all<RAGChunkRecord>();

    return result.results || [];
  }

  /**
   * Get RAG chunks by agent ID (for semantic search)
   */
  async getRAGChunksByAgent(
    agentId: string,
    limit: number = 1000
  ): Promise<RAGChunkRecord[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM rag_chunks WHERE agent_id = ? LIMIT ?'
      )
      .bind(agentId, limit)
      .all<RAGChunkRecord>();

    return result.results || [];
  }

  // ========================================================================
  // ANALYTICS OPERATIONS
  // ========================================================================

  /**
   * Create an analytics event
   */
  async createAnalyticsEvent(data: {
    id: string;
    agentId: string;
    organizationId?: string;
    sessionId?: string;
    eventType: string;
    eventData: Record<string, any>;
    userId?: string;
    timestamp: string;
  }): Promise<AnalyticsEventRecord> {
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO agent_analytics (
          id, agent_id, organization_id, session_id, event_type, 
          event_data, user_id, timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.agentId,
        data.organizationId || null,
        data.sessionId || null,
        data.eventType,
        JSON.stringify(data.eventData),
        data.userId || null,
        data.timestamp,
        now
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create analytics event: ${result.error}`);
    }

    return this.getAnalyticsEvent(data.id) as Promise<AnalyticsEventRecord>;
  }

  /**
   * Get an analytics event by ID
   */
  async getAnalyticsEvent(eventId: string): Promise<AnalyticsEventRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM agent_analytics WHERE id = ?')
      .bind(eventId)
      .first<AnalyticsEventRecord>();

    return result || null;
  }

  /**
   * Get analytics events by agent ID
   */
  async getAnalyticsEventsByAgent(
    agentId: string,
    eventType?: string,
    limit: number = 100
  ): Promise<AnalyticsEventRecord[]> {
    let query = 'SELECT * FROM agent_analytics WHERE agent_id = ?';
    const params: any[] = [agentId];

    if (eventType) {
      query += ' AND event_type = ?';
      params.push(eventType);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .all<AnalyticsEventRecord>();

    return result.results || [];
  }

  // ========================================================================
  // FEEDBACK OPERATIONS
  // ========================================================================

  /**
   * Create feedback
   */
  async createFeedback(data: {
    id: string;
    sessionId: string;
    messageId?: string;
    agentId: string;
    userId?: string;
    rating: 'positive' | 'negative' | 'neutral' | 'thumbs_up' | 'thumbs_down';
    comment?: string;
    category?: string;
    metadata?: Record<string, any>;
  }): Promise<FeedbackRecord> {
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO feedback (
          id, session_id, message_id, agent_id, user_id, 
          rating, comment, category, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.sessionId,
        data.messageId || null,
        data.agentId,
        data.userId || null,
        data.rating,
        data.comment || null,
        data.category || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        now
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create feedback: ${result.error}`);
    }

    return this.getFeedback(data.id) as Promise<FeedbackRecord>;
  }

  /**
   * Get feedback by ID
   */
  async getFeedback(feedbackId: string): Promise<FeedbackRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM feedback WHERE id = ?')
      .bind(feedbackId)
      .first<FeedbackRecord>();

    return result || null;
  }

  /**
   * Get feedback by session ID
   */
  async getFeedbackBySession(sessionId: string): Promise<FeedbackRecord[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM feedback WHERE session_id = ? ORDER BY created_at DESC'
      )
      .bind(sessionId)
      .all<FeedbackRecord>();

    return result.results || [];
  }

  /**
   * Get feedback by agent ID
   */
  async getFeedbackByAgent(
    agentId: string,
    rating?: string,
    limit: number = 100
  ): Promise<FeedbackRecord[]> {
    let query = 'SELECT * FROM feedback WHERE agent_id = ?';
    const params: any[] = [agentId];

    if (rating) {
      query += ' AND rating = ?';
      params.push(rating);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .all<FeedbackRecord>();

    return result.results || [];
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /**
   * Execute a raw SQL query (for advanced operations)
   */
  async executeRaw(sql: string, params: any[] = []): Promise<any> {
    const result = await this.db.prepare(sql).bind(...params).all();
    return result;
  }

  /**
   * Begin a transaction (D1 doesn't support explicit transactions yet,
   * but this is a placeholder for future support)
   */
  async transaction<T>(callback: (db: DatabaseManager) => Promise<T>): Promise<T> {
    // For now, just execute the callback
    // In the future, this could use D1's transaction support
    return callback(this);
  }
}

