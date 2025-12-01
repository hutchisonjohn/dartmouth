/**
 * RAG Engine (Retrieval-Augmented Generation)
 * 
 * Document ingestion, embedding generation, and similarity search.
 * Implements Section 5.1.6 from AGENT_ARMY_SYSTEM.md
 */

import type { Document, Chunk, RAGResult, Source } from '../types/shared'

export class RAGEngine {
  constructor(
    private db: D1Database,
    private ai: Ai,
    private cache: KVNamespace
  ) {}

  /**
   * Ingest a document into the RAG system
   */
  async ingestDocument(
    agentId: string,
    document: Document
  ): Promise<{ chunks: number; embeddings: number }> {
    // Step 1: Store document metadata FIRST (before chunks due to foreign key constraint)
    await this.db
      .prepare(`
        INSERT INTO documents (id, organization_id, agent_id, title, file_name, file_type, file_size, content, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        document.id,
        'default', // Default organization for knowledge base documents
        agentId,
        document.title,
        document.title,
        document.type,
        document.content.length,
        document.content,
        'ready',
        new Date().toISOString(),
        new Date().toISOString()
      )
      .run()

    // Step 2: Split document into chunks
    const chunks = this.splitIntoChunks(document.content, 500) // 500 chars per chunk

    let embeddingsGenerated = 0

    // Step 3: Generate embeddings and store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      // Generate embedding using Workers AI
      const embedding = await this.generateEmbedding(chunk)
      
      // Store chunk with embedding in D1
      await this.db
        .prepare(`
          INSERT INTO rag_chunks (id, document_id, agent_id, chunk_index, text, embedding, metadata, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          crypto.randomUUID(),
          document.id,
          agentId,
          i,
          chunk,
          JSON.stringify(embedding),
          JSON.stringify(document.metadata || {}),
          new Date().toISOString()
        )
        .run()

      embeddingsGenerated++
    }

    return {
      chunks: chunks.length,
      embeddings: embeddingsGenerated
    }
  }

  /**
   * Retrieve relevant context for a query
   */
  async retrieve(
    agentId: string,
    query: string,
    topK: number = 5,
    minSimilarity: number = 0.7
  ): Promise<RAGResult> {
    console.log(`[RAGEngine] 🔍 RETRIEVE called`);
    console.log(`[RAGEngine] agentId: ${agentId}`);
    console.log(`[RAGEngine] query: ${query}`);
    console.log(`[RAGEngine] topK: ${topK}, minSimilarity: ${minSimilarity}`);
    
    // TEMPORARILY DISABLED: Check cache first
    // const cacheKey = `rag:${agentId}:${query}`
    // const cached = await this.cache.get(cacheKey)
    // if (cached) {
    //   console.log(`[RAGEngine] ✅ Cache hit!`);
    //   const result = JSON.parse(cached) as RAGResult
    //   return { ...result, cached: true }
    // }
    console.log(`[RAGEngine] ❌ Cache DISABLED for debugging, querying database...`);

    // Generate query embedding
    console.log(`[RAGEngine] Generating query embedding...`);
    const queryEmbedding = await this.generateEmbedding(query)
    console.log(`[RAGEngine] Query embedding generated (length: ${queryEmbedding.length})`);

    // Retrieve all chunks for this agent
    console.log(`[RAGEngine] Querying database for chunks with agent_id = ${agentId}...`);
    const allChunks = await this.db
      .prepare('SELECT id, document_id, text, embedding, chunk_index FROM rag_chunks WHERE agent_id = ?')
      .bind(agentId)
      .all<{
        id: string
        document_id: string
        text: string
        embedding: string
        chunk_index: number
      }>()
    
    console.log(`[RAGEngine] Found ${allChunks.results.length} chunks in database`);

    // Calculate similarity scores
    console.log(`[RAGEngine] Calculating similarity scores...`);
    const scored = allChunks.results.map(chunk => {
      const chunkEmbedding = JSON.parse(chunk.embedding)
      const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding)
      return { chunk, similarity }
    })
    
    console.log(`[RAGEngine] Similarity scores calculated:`);
    scored.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i+1}. Similarity: ${item.similarity.toFixed(3)} - Text: ${item.chunk.text.substring(0, 80)}...`);
    });

    // Filter and sort by similarity
    console.log(`[RAGEngine] Filtering by minSimilarity >= ${minSimilarity}...`);
    const relevant = scored
      .filter(item => item.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
    
    console.log(`[RAGEngine] ${relevant.length} chunks passed similarity threshold`);

    // Build result
    const chunks: Chunk[] = relevant.map(item => ({
      id: item.chunk.id,
      text: item.chunk.text,
      documentId: item.chunk.document_id,
      chunkIndex: item.chunk.chunk_index,
      metadata: { similarity: item.similarity }
    }))

    // Get unique document sources
    const uniqueDocIds = [...new Set(chunks.map(c => c.documentId).filter(Boolean))]
    const sources: Source[] = await this.getDocumentSources(uniqueDocIds as string[])

    const result: RAGResult = {
      chunks,
      sources,
      confidence: relevant.length > 0 ? relevant[0].similarity : 0,
      cached: false
    }

    // TEMPORARILY DISABLED: Cache result for 5 minutes
    // await this.cache.put(cacheKey, JSON.stringify(result), {
    //   expirationTtl: 300
    // })
    console.log(`[RAGEngine] ✅ Returning result (cache disabled for debugging)`);

    return result
  }

  /**
   * Validate citations in a response
   */
  validateCitations(
    response: string,
    ragResult: RAGResult
  ): { valid: boolean; missingCitations: string[] } {
    const missingCitations: string[] = []

    for (const chunk of ragResult.chunks) {
      // Check if chunk content is used in response
      const chunkWords = chunk.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const matchingWords = chunkWords.filter(word => response.toLowerCase().includes(word))

      // If significant overlap, check for citation
      if (matchingWords.length > 3) {
        const sourceId = chunk.documentId || chunk.id
        if (sourceId && !response.includes(sourceId)) {
          missingCitations.push(`Missing citation for content from ${sourceId}`)
        }
      }
    }

    return {
      valid: missingCitations.length === 0,
      missingCitations
    }
  }

  /**
   * Split text into chunks
   */
  private splitIntoChunks(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = []
    const paragraphs = text.split(/\n\n+/)

    let currentChunk = ''

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }
        currentChunk = paragraph
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }

  /**
   * Generate embedding using Workers AI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ai.run('@cf/baai/bge-base-en-v1.5', {
      text: [text]
    }) as { data: number[][] }

    return response.data[0]
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      magnitudeA += a[i] * a[i]
      magnitudeB += b[i] * b[i]
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) return 0

    return dotProduct / (magnitudeA * magnitudeB)
  }

  /**
   * Get document sources by IDs
   */
  private async getDocumentSources(documentIds: string[]): Promise<Source[]> {
    if (documentIds.length === 0) return []

    const placeholders = documentIds.map(() => '?').join(',')
    const result = await this.db
      .prepare(`SELECT id, title FROM documents WHERE id IN (${placeholders})`)
      .bind(...documentIds)
      .all<{ id: string; title: string }>()

    return result.results.map(doc => ({
      id: doc.id,
      title: doc.title
    }))
  }

  /**
   * Delete a document and its chunks
   */
  async deleteDocument(documentId: string): Promise<void> {
    // Delete chunks
    await this.db
      .prepare('DELETE FROM rag_chunks WHERE document_id = ?')
      .bind(documentId)
      .run()

    // Delete document
    await this.db
      .prepare('DELETE FROM documents WHERE id = ?')
      .bind(documentId)
      .run()

    // Clear related cache entries
    // Note: KV doesn't support pattern deletion, so we'd need to track cache keys
  }

  /**
   * Get document count for an agent
   */
  async getDocumentCount(agentId: string): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM documents WHERE agent_id = ?')
      .bind(agentId)
      .first<{ count: number }>()

    return result?.count || 0
  }
}

