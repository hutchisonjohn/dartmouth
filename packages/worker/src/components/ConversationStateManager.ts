/**
 * Conversation State Manager
 *
 * Tracks and manages conversation state across messages.
 * Implements Section 5.1.1 from AGENT_ARMY_SYSTEM.md
 */

import type {
  ConversationState,
  Intent,
  UserGoal,
  Message,
  Pattern,
  SessionSummary,
  Summary
} from '../types/shared';

export class ConversationStateManager {
  private kv: KVNamespace;
  private db: D1Database;

  constructor(kv: KVNamespace, db: D1Database) {
    this.kv = kv;
    this.db = db;
  }

  private createEmptyState(sessionId?: string): ConversationState {
    const now = new Date();
    return {
      sessionId: sessionId || crypto.randomUUID(),
      agentId: 'default', // Will be set by agent config
      tenantId: 'default', // Will be set by auth
      startedAt: now,
      lastMessageAt: now,
      lastActivityAt: now,
      expiresAt: new Date(now.getTime() + 3600 * 1000), // 1 hour TTL for KV
      messages: [],
      messageCount: 0,
      userGoal: null,
      currentTopic: null,
      conversationPlan: null,
      userPreferences: new Map(),
      learnedPatterns: [],
      previousSessions: [],
      questionsAsked: [],
      answersGiven: [],
      topicsDiscussed: [],
      intentsDetected: [],
      isRepeatDetected: false,
      isFrustrationDetected: false,
      isGoalAchieved: false,
      needsEscalation: false,
      isMultiTurn: false,
      metadata: {},
      tags: [],
    };
  }

  /**
   * Creates a new conversation session.
   * @param agentId The ID of the agent.
   * @param tenantId The ID of the tenant/organization.
   * @param userId Optional user ID.
   * @returns The initial conversation state.
   */
  async createSession(agentId: string, tenantId: string, userId?: string, sessionId?: string): Promise<ConversationState> {
    const newState = this.createEmptyState(sessionId);
    newState.agentId = agentId;
    newState.tenantId = tenantId;
    if (userId) newState.userId = userId;
    await this.saveSession(newState);
    return newState;
  }

  /**
   * Loads a conversation state from KV.
   * @param sessionId The ID of the session to load.
   * @returns The loaded conversation state or null if not found.
   */
  async loadSession(sessionId: string): Promise<ConversationState | null> {
    const stateJson = await this.kv.get(`session:${sessionId}`);
    if (!stateJson) return null;
    const state = JSON.parse(stateJson) as ConversationState;
    // Rehydrate Maps if necessary
    state.userPreferences = new Map(state.userPreferences as any);
    // Rehydrate Dates
    state.startedAt = new Date(state.startedAt);
    state.lastActivityAt = new Date(state.lastActivityAt);
    state.expiresAt = new Date(state.expiresAt);
    state.messages = state.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
    // Ensure arrays are properly initialized (they might be missing in old sessions)
    state.questionsAsked = Array.isArray(state.questionsAsked) 
      ? state.questionsAsked.map(q => ({
          ...q,
          timestamp: new Date(q.timestamp)
        }))
      : [];
    state.answersGiven = Array.isArray(state.answersGiven)
      ? state.answersGiven.map(a => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }))
      : [];
    state.intentsDetected = Array.isArray(state.intentsDetected) ? state.intentsDetected : [];
    state.topicsDiscussed = Array.isArray(state.topicsDiscussed) ? state.topicsDiscussed : [];
    state.previousSessions = Array.isArray(state.previousSessions) ? state.previousSessions : [];
    state.tags = Array.isArray(state.tags) ? state.tags : [];
    
    // Debug: Log array lengths after rehydration
    console.log(`[StateManager] Loaded session ${sessionId}: questionsAsked=${state.questionsAsked.length}, answersGiven=${state.answersGiven.length}, messages=${state.messages.length}`);
    
    return state;
  }

  /**
   * Saves the current conversation state to KV and asynchronously to D1 for long-term storage.
   * @param state The conversation state to save.
   */
  async saveSession(state: ConversationState): Promise<void> {
    state.lastActivityAt = new Date();
    state.expiresAt = new Date(state.lastActivityAt.getTime() + 3600 * 1000); // Extend TTL
    // Convert Map to array for JSON serialization
    const stateToSave = { ...state, userPreferences: Array.from(state.userPreferences.entries()) };
    await this.kv.put(`session:${state.sessionId}`, JSON.stringify(stateToSave), {
      expirationTtl: 3600 // 1 hour
    });

    // Asynchronously persist to D1 for long-term storage
    // This should be a non-blocking operation
    this.persistToLongTerm(state).catch(console.error);
  }

  /**
   * Deletes a session from KV and D1.
   * @param sessionId The ID of the session to delete.
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.kv.delete(`session:${sessionId}`);
    await this.db.prepare(`DELETE FROM sessions WHERE id = ?`).bind(sessionId).run();
    await this.db.prepare(`DELETE FROM messages WHERE session_id = ?`).bind(sessionId).run();
    // TODO: Delete associated memory, feedback, etc.
  }

  /**
   * Adds a message to the conversation state.
   * @param state The current conversation state.
   * @param message The message to add.
   */
  addMessage(state: ConversationState, message: Message): void {
    state.messages.push(message);
    state.messageCount = state.messages.length;
    state.lastActivityAt = new Date();
  }

  /**
   * Retrieves a limited number of recent messages.
   * @param state The current conversation state.
   * @param limit The maximum number of messages to retrieve.
   * @returns An array of messages.
   */
  getMessages(state: ConversationState, limit?: number): Message[] {
    if (limit) {
      return state.messages.slice(-limit);
    }
    return state.messages;
  }

  /**
   * Gets the last message in the conversation.
   * @param state The current conversation state.
   * @returns The last message or null if no messages.
   */
  getLastMessage(state: ConversationState): Message | null {
    return state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;
  }

  /**
   * Identifies the user's current goal based on messages.
   * This is a placeholder and would typically involve LLM calls or complex logic.
   * @param state The current conversation state.
   * @param messages Recent messages to analyze.
   * @returns The identified user goal or null.
   */
  identifyGoal(_state: ConversationState, messages: Message[]): UserGoal | null {
    // TODO: Implement actual goal identification logic (e.g., using IntentDetector, LLM)
    console.log('Identifying goal for messages:', messages);
    return null;
  }

  /**
   * Updates the user's current goal.
   * @param state The current conversation state.
   * @param goal The new user goal.
   */
  updateGoal(state: ConversationState, goal: UserGoal): void {
    state.userGoal = goal;
  }

  /**
   * Checks if the current user goal has been achieved.
   * @param state The current conversation state.
   * @returns True if the goal is achieved, false otherwise.
   */
  isGoalAchieved(_state: ConversationState): boolean {
    // TODO: Implement logic to determine if goal is achieved
    return false;
  }

  /**
   * Remembers a user preference.
   * @param state The current conversation state.
   * @param key The preference key.
   * @param value The preference value.
   */
  rememberPreference(state: ConversationState, key: string, value: any): void {
    state.userPreferences.set(key, value);
  }

  /**
   * Recalls a user preference.
   * @param state The current conversation state.
   * @param key The preference key.
   * @returns The preference value or undefined.
   */
  recallPreference(state: ConversationState, key: string): any {
    return state.userPreferences.get(key);
  }

  /**
   * Learns a behavioral pattern from the user.
   * @param state The current conversation state.
   * @param pattern The pattern to learn.
   */
  learnPattern(state: ConversationState, pattern: Pattern): void {
    state.learnedPatterns.push(pattern);
    // TODO: Implement logic to analyze and store patterns more intelligently
  }

  /**
   * Logs a user question.
   * @param state The current conversation state.
   * @param question The question asked.
   * @param intent The detected intent.
   */
  logQuestion(state: ConversationState, question: string, intent: Intent): void {
    state.questionsAsked.push({
      question,
      intent,
      timestamp: new Date(),
      wasAnswered: false,
    });
  }

  /**
   * Logs an assistant's answer.
   * @param state The current conversation state.
   * @param answer The answer given.
   * @param type The type of answer (e.g., 'calculation', 'rag').
   */
  logAnswer(state: ConversationState, answer: string, type: string): void {
    state.answersGiven.push({
      answer,
      handler: type,
      type,
      timestamp: new Date(),
      validationPassed: true, // Assume passed for now
    });
    // Mark the last question as answered
    if (state.questionsAsked.length > 0) {
      state.questionsAsked[state.questionsAsked.length - 1].wasAnswered = true;
    }
  }

  /**
   * Logs a topic discussed in the conversation.
   * @param state The current conversation state.
   * @param topic The topic to log.
   */
  logTopic(state: ConversationState, topic: string): void {
    if (!state.topicsDiscussed.includes(topic)) {
      state.topicsDiscussed.push(topic);
    }
  }

  /**
   * Generates a summary of the conversation.
   * @param state The current conversation state.
   * @returns A conversation summary.
   */
  getConversationSummary(state: ConversationState): Summary {
    // TODO: Implement LLM-based summarization
    return {
      short: `Conversation with ${state.agentId} about ${state.topicsDiscussed.join(', ')}.`,
      detailed: JSON.stringify(state.messages.map(m => `${m.role}: ${m.content}`)),
      topics: state.topicsDiscussed,
      keyPoints: [],
      sentiment: 'neutral'
    };
  }

  /**
   * Retrieves all topics discussed.
   * @param state The current conversation state.
   * @returns An array of topics.
   */
  getTopicsDiscussed(state: ConversationState): string[] {
    return state.topicsDiscussed;
  }

  /**
   * Gets the count of detected repetitions.
   * @param state The current conversation state.
   * @returns The repetition count.
   */
  getRepetitionCount(state: ConversationState): number {
    return state.questionsAsked.filter(q => q.intent.type === 'repeat').length;
  }

  /**
   * Persists the conversation state to D1 for long-term storage.
   * This method is called asynchronously by saveSession.
   * @param state The conversation state to persist.
   */
  async persistToLongTerm(state: ConversationState): Promise<void> {
    try {
      // Check if session already exists in D1
      const existingSession = await this.db.prepare(`SELECT id FROM sessions WHERE id = ?`).bind(state.sessionId).first();

      if (existingSession) {
        // Update existing session
        await this.db.prepare(`
          UPDATE sessions
          SET
            last_activity_at = ?,
            message_count = ?,
            topics_discussed = ?,
            goal_achieved = ?,
            summary = ?,
            metadata = ?
          WHERE id = ?
        `).bind(
          state.lastActivityAt.toISOString(),
          state.messageCount,
          JSON.stringify(state.topicsDiscussed),
          state.isGoalAchieved ? 1 : 0,
          state.userGoal?.description || null,
          JSON.stringify(state.metadata),
          state.sessionId
        ).run();
      } else {
        // Insert new session
        await this.db.prepare(`
          INSERT INTO sessions (id, agent_id, organization_id, user_id, started_at, last_activity_at, message_count, topics_discussed, goal_achieved, summary, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          state.sessionId,
          state.agentId,
          state.tenantId, // organization_id
          state.userId || null,
          state.startedAt.toISOString(),
          state.lastActivityAt.toISOString(),
          state.messageCount,
          JSON.stringify(state.topicsDiscussed),
          state.isGoalAchieved ? 1 : 0,
          state.userGoal?.description || null,
          JSON.stringify(state.metadata)
        ).run();
      }

      // Persist messages (insert new ones, update existing if needed)
      for (const message of state.messages) {
        const existingMessage = await this.db.prepare(`SELECT id FROM messages WHERE id = ?`).bind(message.id).first();
        if (!existingMessage) {
          await this.db.prepare(`
            INSERT INTO messages (id, session_id, role, content, intent, timestamp, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            message.id,
            state.sessionId,
            message.role,
            message.content,
            message.intent ? JSON.stringify(message.intent) : null,
            message.timestamp.toISOString(),
            message.metadata ? JSON.stringify(message.metadata) : null
          ).run();
        }
        // TODO: Handle message updates if content can change
      }

      // TODO: Persist other memory types (semantic, episodic)
    } catch (error) {
      console.error('Error persisting conversation state to D1:', error);
    }
  }

  /**
   * Loads previous session summaries for a user from D1.
   * @param userId The ID of the user.
   * @returns An array of previous session summaries.
   */
  async loadFromLongTerm(userId: string): Promise<SessionSummary[]> {
    try {
      const { results } = await this.db.prepare(`
        SELECT id, agent_id, started_at, last_activity_at, summary, topics_discussed
        FROM sessions
        WHERE user_id = ?
        ORDER BY last_activity_at DESC
        LIMIT 5
      `).bind(userId).all<SessionSummary>();
      return results || [];
    } catch (error) {
      console.error('Error loading previous sessions from D1:', error);
      return [];
    }
  }
}
