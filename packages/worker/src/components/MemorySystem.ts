/**
 * Memory System
 * 
 * Multi-level persistent memory (short-term, long-term, semantic, episodic).
 * Implements Section 5.1.5 from AGENT_ARMY_SYSTEM.md
 */

export class MemorySystem {
  constructor(
    private kv: KVNamespace,
    private db: D1Database
  ) {}

  /**
   * SHORT-TERM MEMORY (KV - session-scoped, expires after 1 hour)
   */
  async setShortTerm(sessionId: string, key: string, value: any): Promise<void> {
    const memoryKey = `stm:${sessionId}:${key}`
    await this.kv.put(memoryKey, JSON.stringify(value), {
      expirationTtl: 3600 // 1 hour
    })
  }

  async getShortTerm(sessionId: string, key: string): Promise<any | null> {
    const memoryKey = `stm:${sessionId}:${key}`
    const value = await this.kv.get(memoryKey)
    return value ? JSON.parse(value) : null
  }

  /**
   * LONG-TERM MEMORY (D1 - persistent facts about user/domain)
   */
  async storeFact(agentId: string, content: string, metadata?: Record<string, any>): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO semantic_memory (id, agent_id, content, metadata, learned_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        agentId,
        content,
        JSON.stringify(metadata || {}),
        new Date().toISOString()
      )
      .run()
  }

  async getFacts(agentId: string, query?: string): Promise<Array<{ content: string; metadata: any }>> {
    let sql = 'SELECT content, metadata FROM semantic_memory WHERE agent_id = ?'
    const params: any[] = [agentId]

    if (query) {
      sql += ' AND content LIKE ?'
      params.push(`%${query}%`)
    }

    sql += ' ORDER BY learned_at DESC LIMIT 10'

    const result = await this.db.prepare(sql).bind(...params).all<{
      content: string
      metadata: string
    }>()

    return result.results.map(row => ({
      content: row.content,
      metadata: JSON.parse(row.metadata)
    }))
  }

  /**
   * SEMANTIC MEMORY (D1 - general knowledge, patterns, rules)
   */
  async storePattern(
    agentId: string,
    pattern: string,
    description: string,
    examples?: string[]
  ): Promise<void> {
    await this.storeFact(agentId, description, {
      type: 'pattern',
      pattern,
      examples: examples || []
    })
  }

  async getPatterns(agentId: string): Promise<Array<{ pattern: string; description: string }>> {
    const facts = await this.getFacts(agentId)
    return facts
      .filter(f => f.metadata.type === 'pattern')
      .map(f => ({
        pattern: f.metadata.pattern,
        description: f.content
      }))
  }

  /**
   * EPISODIC MEMORY (D1 - conversation history, user interactions)
   */
  async storeEpisode(
    userId: string,
    agentId: string,
    summary: string,
    metadata: Record<string, any>
  ): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO episodic_memory (id, user_id, agent_id, summary, metadata, occurred_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        userId,
        agentId,
        summary,
        JSON.stringify(metadata),
        new Date().toISOString()
      )
      .run()
  }

  async getEpisodes(
    userId: string,
    agentId: string,
    limit: number = 5
  ): Promise<Array<{ summary: string; metadata: any; occurredAt: string }>> {
    const result = await this.db
      .prepare(`
        SELECT summary, metadata, occurred_at
        FROM episodic_memory
        WHERE user_id = ? AND agent_id = ?
        ORDER BY occurred_at DESC
        LIMIT ?
      `)
      .bind(userId, agentId, limit)
      .all<{
        summary: string
        metadata: string
        occurred_at: string
      }>()

    return result.results.map(row => ({
      summary: row.summary,
      metadata: JSON.parse(row.metadata),
      occurredAt: row.occurred_at
    }))
  }

  /**
   * UNIFIED MEMORY RETRIEVAL
   * Get relevant memories from all levels
   */
  async recall(
    sessionId: string,
    userId: string | undefined,
    agentId: string,
    context: string
  ): Promise<{
    shortTerm: Record<string, any>
    facts: Array<{ content: string; metadata: any }>
    episodes: Array<{ summary: string; metadata: any }>
  }> {
    // Get short-term memory (recent conversation context)
    const shortTerm: Record<string, any> = {}
    const stmKeys = ['lastIntent', 'lastTopic', 'userPreferences']
    for (const key of stmKeys) {
      const value = await this.getShortTerm(sessionId, key)
      if (value) shortTerm[key] = value
    }

    // Get relevant facts (semantic memory)
    const facts = await this.getFacts(agentId, context)

    // Get recent episodes (episodic memory)
    const episodes = userId ? await this.getEpisodes(userId, agentId, 3) : []

    return { shortTerm, facts, episodes }
  }

  /**
   * MEMORY CONSOLIDATION
   * Move important short-term memories to long-term
   */
  async consolidate(sessionId: string, agentId: string): Promise<void> {
    // Get all short-term memories for this session
    const stmKeys = ['lastIntent', 'lastTopic', 'userPreferences', 'importantFacts']
    
    for (const key of stmKeys) {
      const value = await this.getShortTerm(sessionId, key)
      if (value && key === 'importantFacts') {
        // Store important facts in long-term memory
        for (const fact of value) {
          await this.storeFact(agentId, fact)
        }
      }
    }
  }

  /**
   * MEMORY CLEANUP
   * Remove old or irrelevant memories
   */
  async cleanup(agentId: string, daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    // Clean semantic memory
    await this.db
      .prepare(`
        DELETE FROM semantic_memory
        WHERE agent_id = ? AND learned_at < ?
      `)
      .bind(agentId, cutoffDate.toISOString())
      .run()

    // Clean episodic memory
    await this.db
      .prepare(`
        DELETE FROM episodic_memory
        WHERE agent_id = ? AND occurred_at < ?
      `)
      .bind(agentId, cutoffDate.toISOString())
      .run()
  }
}

