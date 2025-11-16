/**
 * Conversation State Manager
 * 
 * Tracks and manages conversation state across messages.
 * Implements Section 5.1.1 from AGENT_ARMY_SYSTEM.md
 */

import type {
  ConversationState,
  Intent,
  QuestionLog,
  AnswerLog,
  UserGoal
} from '../types/shared'

export class ConversationStateManager {
  private state: ConversationState

  constructor(
    sessionId: string,
    agentId: string,
    userId?: string
  ) {
    this.state = {
      sessionId,
      userId,
      agentId,
      startedAt: new Date(),
      lastMessageAt: new Date(),
      messageCount: 0,
      questionsAsked: [],
      answersGiven: [],
      topicsDiscussed: [],
      isFrustrationDetected: false,
      metadata: {}
    }
  }

  /**
   * Load existing state from database
   */
  static async load(
    db: D1Database,
    sessionId: string
  ): Promise<ConversationStateManager | null> {
    const result = await db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .bind(sessionId)
      .first<{
        id: string
        agent_id: string
        user_id: string | null
        started_at: string
        message_count: number
        topics_discussed: string | null
        metadata: string | null
      }>()

    if (!result) return null

    const manager = new ConversationStateManager(
      result.id,
      result.agent_id,
      result.user_id || undefined
    )

    manager.state.startedAt = new Date(result.started_at)
    manager.state.messageCount = result.message_count
    manager.state.topicsDiscussed = result.topics_discussed
      ? JSON.parse(result.topics_discussed)
      : []
    manager.state.metadata = result.metadata ? JSON.parse(result.metadata) : {}

    return manager
  }

  /**
   * Add a user question to the conversation
   */
  addQuestion(question: string, intent: Intent): void {
    this.state.questionsAsked.push({
      question,
      intent,
      timestamp: new Date()
    })
    this.state.messageCount++
    this.state.lastMessageAt = new Date()

    // Extract topics from intent
    if (intent.entities) {
      const topics = Object.keys(intent.entities)
      topics.forEach(topic => {
        if (!this.state.topicsDiscussed.includes(topic)) {
          this.state.topicsDiscussed.push(topic)
        }
      })
    }
  }

  /**
   * Add an assistant answer to the conversation
   */
  addAnswer(answer: string, handler: string): void {
    this.state.answersGiven.push({
      answer,
      handler,
      timestamp: new Date()
    })
    this.state.lastMessageAt = new Date()
  }

  /**
   * Set the user's goal
   */
  setUserGoal(goal: UserGoal): void {
    this.state.userGoal = goal
  }

  /**
   * Mark goal as achieved
   */
  markGoalAchieved(): void {
    if (this.state.userGoal) {
      this.state.userGoal.achieved = true
    }
  }

  /**
   * Set frustration flag
   */
  setFrustration(detected: boolean): void {
    this.state.isFrustrationDetected = detected
  }

  /**
   * Get the current state
   */
  getState(): ConversationState {
    return { ...this.state }
  }

  /**
   * Get recent questions (last N)
   */
  getRecentQuestions(count: number = 5): QuestionLog[] {
    return this.state.questionsAsked.slice(-count)
  }

  /**
   * Get recent answers (last N)
   */
  getRecentAnswers(count: number = 5): AnswerLog[] {
    return this.state.answersGiven.slice(-count)
  }

  /**
   * Check if a topic has been discussed
   */
  hasDiscussedTopic(topic: string): boolean {
    return this.state.topicsDiscussed.includes(topic)
  }

  /**
   * Get conversation duration in seconds
   */
  getDuration(): number {
    return Math.floor(
      (this.state.lastMessageAt.getTime() - this.state.startedAt.getTime()) / 1000
    )
  }

  /**
   * Save state to database
   */
  async save(db: D1Database): Promise<void> {
    await db
      .prepare(`
        INSERT INTO sessions (
          id, agent_id, organization_id, user_id, started_at, ended_at,
          message_count, topics_discussed, goal_achieved, summary, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          message_count = excluded.message_count,
          topics_discussed = excluded.topics_discussed,
          goal_achieved = excluded.goal_achieved,
          metadata = excluded.metadata
      `)
      .bind(
        this.state.sessionId,
        this.state.agentId,
        '', // TODO: Get from context
        this.state.userId || null,
        this.state.startedAt.toISOString(),
        null, // ended_at
        this.state.messageCount,
        JSON.stringify(this.state.topicsDiscussed),
        this.state.userGoal?.achieved ? 1 : 0,
        '', // summary (generated at end)
        JSON.stringify(this.state.metadata)
      )
      .run()
  }

  /**
   * Generate a summary of the conversation
   */
  generateSummary(): string {
    const duration = this.getDuration()
    const topicsStr = this.state.topicsDiscussed.join(', ')
    const goalStatus = this.state.userGoal?.achieved ? 'achieved' : 'not achieved'

    return `Conversation lasted ${duration}s with ${this.state.messageCount} messages. Topics: ${topicsStr}. Goal: ${goalStatus}.`
  }
}

