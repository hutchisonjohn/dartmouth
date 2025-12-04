/**
 * Vector RAG Service
 * 
 * Provides semantic search capabilities using OpenAI embeddings and Cloudflare Vectorize.
 * This replaces keyword-based RAG search with vector similarity search for accurate retrieval.
 */

import type { D1Database, VectorizeIndex } from '@cloudflare/workers-types';

// Types
interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  category: string;
  sectionTitle: string | null;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  vectorId: string | null;
}

interface RAGSearchResult {
  chunks: Array<{
    id: string;
    documentTitle: string;
    sectionTitle: string | null;
    category: string;
    content: string;
    score: number;
  }>;
  context: string;
  sourcesUsed: string[];
}

interface ChunkingResult {
  chunks: Array<{
    sectionTitle: string | null;
    content: string;
    tokenCount: number;
  }>;
}

/**
 * VectorRAGService - Handles document embedding, storage, and semantic search
 */
export class VectorRAGService {
  private db: D1Database;
  private vectorize: VectorizeIndex;
  private openaiApiKey: string;
  
  // OpenAI embedding model
  private static readonly EMBEDDING_MODEL = 'text-embedding-3-small';
  private static readonly EMBEDDING_DIMENSIONS = 1536;
  
  // Chunking settings
  private static readonly MAX_CHUNK_TOKENS = 500;
  private static readonly MIN_CHUNK_TOKENS = 100;
  private static readonly OVERLAP_TOKENS = 50;

  constructor(db: D1Database, vectorize: VectorizeIndex, openaiApiKey: string) {
    this.db = db;
    this.vectorize = vectorize;
    this.openaiApiKey = openaiApiKey;
  }

  /**
   * Generate embeddings using OpenAI API
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required for embeddings');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VectorRAGService.EMBEDDING_MODEL,
        input: text,
        dimensions: VectorRAGService.EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[VectorRAG] OpenAI embedding error:', error);
      throw new Error(`OpenAI embedding failed: ${response.status}`);
    }

    const data = await response.json() as {
      data: Array<{ embedding: number[] }>;
    };

    return data.data[0].embedding;
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required for embeddings');
    }

    if (texts.length === 0) {
      return [];
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VectorRAGService.EMBEDDING_MODEL,
        input: texts,
        dimensions: VectorRAGService.EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[VectorRAG] OpenAI batch embedding error:', error);
      throw new Error(`OpenAI batch embedding failed: ${response.status}`);
    }

    const data = await response.json() as {
      data: Array<{ embedding: number[]; index: number }>;
    };

    // Sort by index to maintain order
    const sorted = data.data.sort((a, b) => a.index - b.index);
    return sorted.map(item => item.embedding);
  }

  /**
   * Estimate token count for text (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Chunk a markdown document by headings
   */
  chunkMarkdownDocument(content: string, documentTitle: string): ChunkingResult {
    const chunks: ChunkingResult['chunks'] = [];
    
    // Split by ## headings (level 2)
    const sections = content.split(/(?=^## )/gm);
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      // Extract section title if it starts with ##
      let sectionTitle: string | null = null;
      let sectionContent = section;
      
      const headingMatch = section.match(/^## (.+)$/m);
      if (headingMatch) {
        sectionTitle = headingMatch[1].trim();
      }
      
      const tokenCount = this.estimateTokens(sectionContent);
      
      // If section is small enough, keep it as one chunk
      if (tokenCount <= VectorRAGService.MAX_CHUNK_TOKENS) {
        chunks.push({
          sectionTitle,
          content: `Document: ${documentTitle}\n${sectionTitle ? `Section: ${sectionTitle}\n\n` : ''}${sectionContent.trim()}`,
          tokenCount,
        });
      } else {
        // Split large sections by ### headings or paragraphs
        const subSections = sectionContent.split(/(?=^### )/gm);
        
        for (const subSection of subSections) {
          if (!subSection.trim()) continue;
          
          const subTokenCount = this.estimateTokens(subSection);
          
          // Extract subsection title if present
          let subSectionTitle = sectionTitle;
          const subHeadingMatch = subSection.match(/^### (.+)$/m);
          if (subHeadingMatch) {
            subSectionTitle = sectionTitle 
              ? `${sectionTitle} > ${subHeadingMatch[1].trim()}`
              : subHeadingMatch[1].trim();
          }
          
          if (subTokenCount <= VectorRAGService.MAX_CHUNK_TOKENS) {
            chunks.push({
              sectionTitle: subSectionTitle,
              content: `Document: ${documentTitle}\n${subSectionTitle ? `Section: ${subSectionTitle}\n\n` : ''}${subSection.trim()}`,
              tokenCount: subTokenCount,
            });
          } else {
            // Split by paragraphs for very large sections
            const paragraphs = subSection.split(/\n\n+/);
            let currentChunk = '';
            let currentTokens = 0;
            
            for (const para of paragraphs) {
              const paraTokens = this.estimateTokens(para);
              
              if (currentTokens + paraTokens > VectorRAGService.MAX_CHUNK_TOKENS && currentChunk) {
                chunks.push({
                  sectionTitle: subSectionTitle,
                  content: `Document: ${documentTitle}\n${subSectionTitle ? `Section: ${subSectionTitle}\n\n` : ''}${currentChunk.trim()}`,
                  tokenCount: currentTokens,
                });
                currentChunk = para;
                currentTokens = paraTokens;
              } else {
                currentChunk += (currentChunk ? '\n\n' : '') + para;
                currentTokens += paraTokens;
              }
            }
            
            // Don't forget the last chunk
            if (currentChunk.trim()) {
              chunks.push({
                sectionTitle: subSectionTitle,
                content: `Document: ${documentTitle}\n${subSectionTitle ? `Section: ${subSectionTitle}\n\n` : ''}${currentChunk.trim()}`,
                tokenCount: currentTokens,
              });
            }
          }
        }
      }
    }
    
    // Filter out chunks that are too small (likely just headers)
    return {
      chunks: chunks.filter(c => c.tokenCount >= VectorRAGService.MIN_CHUNK_TOKENS),
    };
  }

  /**
   * Process and store a document with embeddings
   */
  async processDocument(
    documentId: string,
    documentTitle: string,
    category: string,
    content: string
  ): Promise<{ chunksCreated: number; vectorsStored: number }> {
    console.log(`[VectorRAG] Processing document: ${documentTitle}`);
    
    // Step 1: Chunk the document
    const { chunks } = this.chunkMarkdownDocument(content, documentTitle);
    console.log(`[VectorRAG] Created ${chunks.length} chunks`);
    
    if (chunks.length === 0) {
      console.log('[VectorRAG] No chunks created, document may be too short');
      return { chunksCreated: 0, vectorsStored: 0 };
    }
    
    // Step 2: Generate embeddings for all chunks
    const chunkTexts = chunks.map(c => c.content);
    console.log(`[VectorRAG] Generating embeddings for ${chunkTexts.length} chunks...`);
    const embeddings = await this.generateEmbeddingsBatch(chunkTexts);
    console.log(`[VectorRAG] Generated ${embeddings.length} embeddings`);
    
    // Step 3: Delete existing chunks for this document
    await this.db.prepare(
      'DELETE FROM rag_document_chunks WHERE document_id = ?'
    ).bind(documentId).run();
    
    // Step 4: Store chunks in D1 and vectors in Vectorize
    const vectorsToInsert: Array<{
      id: string;
      values: number[];
      metadata: Record<string, string>;
    }> = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${documentId}-chunk-${i}`;
      const vectorId = `vec-${chunkId}`;
      
      // Insert chunk metadata into D1
      await this.db.prepare(`
        INSERT INTO rag_document_chunks 
        (id, document_id, document_title, category, section_title, chunk_index, content, token_count, vector_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        chunkId,
        documentId,
        documentTitle,
        category,
        chunk.sectionTitle,
        i,
        chunk.content,
        chunk.tokenCount,
        vectorId
      ).run();
      
      // Prepare vector for Vectorize
      vectorsToInsert.push({
        id: vectorId,
        values: embeddings[i],
        metadata: {
          chunkId,
          documentId,
          documentTitle,
          category,
          sectionTitle: chunk.sectionTitle || '',
        },
      });
    }
    
    // Step 5: Insert vectors into Vectorize in batches
    const BATCH_SIZE = 100;
    let vectorsStored = 0;
    
    for (let i = 0; i < vectorsToInsert.length; i += BATCH_SIZE) {
      const batch = vectorsToInsert.slice(i, i + BATCH_SIZE);
      try {
        await this.vectorize.upsert(batch);
        vectorsStored += batch.length;
        console.log(`[VectorRAG] Stored batch of ${batch.length} vectors`);
      } catch (error) {
        console.error(`[VectorRAG] Error storing vectors:`, error);
        throw error;
      }
    }
    
    console.log(`[VectorRAG] ✅ Document processed: ${chunks.length} chunks, ${vectorsStored} vectors`);
    
    return {
      chunksCreated: chunks.length,
      vectorsStored,
    };
  }

  /**
   * Search for relevant chunks using vector similarity
   */
  async search(query: string, topK: number = 5): Promise<RAGSearchResult> {
    console.log(`[VectorRAG] Searching for: "${query.substring(0, 50)}..."`);
    
    // Step 1: Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Step 2: Search Vectorize for similar vectors
    const searchResults = await this.vectorize.query(queryEmbedding, {
      topK,
      returnMetadata: 'all',
    });
    
    console.log(`[VectorRAG] Found ${searchResults.matches.length} matches`);
    
    if (searchResults.matches.length === 0) {
      return {
        chunks: [],
        context: '',
        sourcesUsed: [],
      };
    }
    
    // Step 3: Fetch full chunk content from D1
    const chunkIds = searchResults.matches
      .map(m => m.metadata?.chunkId as string)
      .filter(Boolean);
    
    if (chunkIds.length === 0) {
      return {
        chunks: [],
        context: '',
        sourcesUsed: [],
      };
    }
    
    const placeholders = chunkIds.map(() => '?').join(',');
    const { results } = await this.db.prepare(`
      SELECT id, document_title, section_title, category, content
      FROM rag_document_chunks
      WHERE id IN (${placeholders})
    `).bind(...chunkIds).all<{
      id: string;
      document_title: string;
      section_title: string | null;
      category: string;
      content: string;
    }>();
    
    // Step 4: Map results with scores
    const chunkMap = new Map(results.map(r => [r.id, r]));
    const rankedChunks = searchResults.matches
      .map(match => {
        const chunkId = match.metadata?.chunkId as string;
        const chunk = chunkMap.get(chunkId);
        if (!chunk) return null;
        
        return {
          id: chunk.id,
          documentTitle: chunk.document_title,
          sectionTitle: chunk.section_title,
          category: chunk.category,
          content: chunk.content,
          score: match.score,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
    
    // Step 5: Build context string for AI
    const sourcesUsed = [...new Set(rankedChunks.map(c => c.documentTitle))];
    
    const context = rankedChunks.length > 0
      ? `# Knowledge Base Context\n\nThe following information is from our knowledge base. Use this to answer the customer's question accurately.\n\n${rankedChunks.map((c, i) => `---\n**Source ${i + 1}**: ${c.documentTitle}${c.sectionTitle ? ` > ${c.sectionTitle}` : ''}\n**Relevance Score**: ${(c.score * 100).toFixed(1)}%\n\n${c.content}\n`).join('\n')}`
      : '';
    
    console.log(`[VectorRAG] Returning ${rankedChunks.length} chunks from ${sourcesUsed.length} sources`);
    
    return {
      chunks: rankedChunks,
      context,
      sourcesUsed,
    };
  }

  /**
   * Delete all vectors and chunks for a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    console.log(`[VectorRAG] Deleting document: ${documentId}`);
    
    // Get vector IDs for this document
    const { results } = await this.db.prepare(
      'SELECT vector_id FROM rag_document_chunks WHERE document_id = ?'
    ).bind(documentId).all<{ vector_id: string }>();
    
    const vectorIds = results.map(r => r.vector_id).filter(Boolean);
    
    // Delete from Vectorize
    if (vectorIds.length > 0) {
      try {
        await this.vectorize.deleteByIds(vectorIds);
        console.log(`[VectorRAG] Deleted ${vectorIds.length} vectors`);
      } catch (error) {
        console.error('[VectorRAG] Error deleting vectors:', error);
      }
    }
    
    // Delete from D1
    await this.db.prepare(
      'DELETE FROM rag_document_chunks WHERE document_id = ?'
    ).bind(documentId).run();
    
    console.log(`[VectorRAG] ✅ Document deleted`);
  }

  /**
   * Get statistics about the vector store
   */
  async getStats(): Promise<{
    totalChunks: number;
    totalDocuments: number;
    chunksByCategory: Record<string, number>;
  }> {
    const [totalResult, categoryResult] = await Promise.all([
      this.db.prepare(`
        SELECT 
          COUNT(*) as total_chunks,
          COUNT(DISTINCT document_id) as total_documents
        FROM rag_document_chunks
      `).first<{ total_chunks: number; total_documents: number }>(),
      
      this.db.prepare(`
        SELECT category, COUNT(*) as count
        FROM rag_document_chunks
        GROUP BY category
      `).all<{ category: string; count: number }>(),
    ]);
    
    const chunksByCategory: Record<string, number> = {};
    for (const row of categoryResult.results) {
      chunksByCategory[row.category] = row.count;
    }
    
    return {
      totalChunks: totalResult?.total_chunks || 0,
      totalDocuments: totalResult?.total_documents || 0,
      chunksByCategory,
    };
  }
}

