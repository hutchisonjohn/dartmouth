/**
 * Agent Handoff Protocol
 * 
 * Enables seamless handoffs between agents (e.g., Customer Service → Sales).
 * Preserves conversation context, customer data, and intent.
 * 
 * Created: Nov 28, 2025
 * Part of: Dartmouth OS Extensions for Customer Service System
 */

import type { Response } from '../types/shared';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * Handoff request from one agent to another
 */
export interface HandoffRequest {
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  reason: string;
  conversationContext: ConversationContext;
  customerContext?: CustomerContext;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Conversation context to transfer
 */
export interface ConversationContext {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  currentIntent?: string;
  lastTopic?: string;
  extractedEntities?: Record<string, any>;
  conversationSummary?: string;
}

/**
 * Customer context (if available)
 */
export interface CustomerContext {
  customerId?: string;
  email?: string;
  name?: string;
  phone?: string;
  isVIP?: boolean;
  lifetimeValue?: number;
  orderHistory?: Array<{
    orderId: string;
    date: string;
    total: number;
    status: string;
  }>;
  preferences?: Record<string, any>;
}

/**
 * Handoff result
 */
export interface HandoffResult {
  success: boolean;
  handoffId: string;
  toAgentId: string;
  toAgentName: string;
  message: string;
  context: ConversationContext;
  timestamp: string;
  error?: string;
}

/**
 * Agent Handoff Protocol
 * 
 * Manages seamless transitions between agents while preserving context.
 */
export class AgentHandoffProtocol {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
    console.log('[AgentHandoffProtocol] Initialized with D1 database');
  }

  /**
   * Initiate a handoff from one agent to another
   */
  async initiateHandoff(request: HandoffRequest): Promise<HandoffResult> {
    console.log(`[AgentHandoffProtocol] Initiating handoff: ${request.fromAgentName} → ${request.toAgentName}`);
    console.log(`[AgentHandoffProtocol] Reason: ${request.reason}`);
    console.log(`[AgentHandoffProtocol] Urgency: ${request.urgency}`);

    const handoffId = this.generateHandoffId(request);

    try {
      // STEP 1: Validate handoff request
      this.validateHandoffRequest(request);

      // STEP 2: Prepare context for target agent
      const preparedContext = this.prepareContextForHandoff(request);

      // STEP 3: Store handoff in database
      await this.storeHandoffInDatabase(request, handoffId);

      // STEP 4: Generate handoff message
      const message = this.generateHandoffMessage(request);

      // STEP 5: Return success result
      const result: HandoffResult = {
        success: true,
        handoffId,
        toAgentId: request.toAgentId,
        toAgentName: request.toAgentName,
        message,
        context: preparedContext,
        timestamp: new Date().toISOString()
      };

      console.log(`[AgentHandoffProtocol] ✅ Handoff successful: ${handoffId}`);
      return result;

    } catch (error) {
      console.error(`[AgentHandoffProtocol] ❌ Handoff failed:`, error);
      
      return {
        success: false,
        handoffId,
        toAgentId: request.toAgentId,
        toAgentName: request.toAgentName,
        message: `I'm having trouble connecting you with ${request.toAgentName}. Let me try again.`,
        context: request.conversationContext,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Accept a handoff (called by receiving agent)
   */
  async acceptHandoff(handoffId: string, agentId: string): Promise<Response> {
    console.log(`[AgentHandoffProtocol] Agent ${agentId} accepting handoff ${handoffId}`);

    return {
      content: "Thanks for the handoff! I've got all the context and I'm ready to help.",
      metadata: {
        handlerName: 'AgentHandoffProtocol',
        handlerVersion: '1.0.0',
        processingTime: 0,
        cached: false,
        confidence: 1.0,
        handoffAccepted: true,
        handoffId,
        acceptedBy: agentId,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Get handoff history for a session
   */
  async getHandoffHistory(sessionId: string): Promise<HandoffRequest[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM agent_handoffs
        WHERE context LIKE ?
        ORDER BY timestamp DESC
        LIMIT 50
      `).bind(`%"sessionId":"${sessionId}"%`).all();
      
      return result.results.map((row: any) => ({
        fromAgentId: row.from_agent_id,
        fromAgentName: 'Agent', // Not stored, would need agent registry lookup
        toAgentId: row.to_agent_id,
        toAgentName: 'Agent',
        reason: row.reason,
        conversationContext: JSON.parse(row.context),
        urgency: 'normal' as const,
        metadata: {}
      }));
    } catch (error) {
      console.error(`[AgentHandoffProtocol] ❌ Error fetching handoff history:`, error);
      return [];
    }
  }

  /**
   * Check if a session has had handoffs
   */
  hasHandoffHistory(sessionId: string): boolean {
    const history = this.handoffHistory.get(sessionId);
    return history !== undefined && history.length > 0;
  }

  /**
   * Get the last handoff for a session
   */
  getLastHandoff(sessionId: string): HandoffRequest | null {
    const history = this.handoffHistory.get(sessionId);
    if (!history || history.length === 0) return null;
    return history[history.length - 1];
  }

  /**
   * Validate handoff request
   */
  private validateHandoffRequest(request: HandoffRequest): void {
    if (!request.fromAgentId || !request.toAgentId) {
      throw new Error('Both fromAgentId and toAgentId are required');
    }

    if (request.fromAgentId === request.toAgentId) {
      throw new Error('Cannot handoff to the same agent');
    }

    if (!request.conversationContext || !request.conversationContext.sessionId) {
      throw new Error('Conversation context with sessionId is required');
    }

    if (!request.reason) {
      throw new Error('Handoff reason is required');
    }
  }

  /**
   * Prepare context for handoff
   */
  private prepareContextForHandoff(request: HandoffRequest): ConversationContext {
    const context = { ...request.conversationContext };

    // Add handoff metadata to context
    if (!context.extractedEntities) {
      context.extractedEntities = {};
    }

    context.extractedEntities.handoffReason = request.reason;
    context.extractedEntities.handoffFrom = request.fromAgentName;
    context.extractedEntities.handoffUrgency = request.urgency;

    // Generate conversation summary if not present
    if (!context.conversationSummary && context.messages.length > 0) {
      context.conversationSummary = this.generateConversationSummary(context.messages);
    }

    return context;
  }

  /**
   * Generate conversation summary
   */
  private generateConversationSummary(messages: ConversationContext['messages']): string {
    if (messages.length === 0) return 'No previous conversation';

    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];

    if (userMessages.length === 1) {
      return `Customer asked: "${lastUserMessage.content}"`;
    }

    return `Customer has been discussing: ${lastUserMessage.content}. ${userMessages.length} messages exchanged.`;
  }

  /**
   * Generate handoff message
   */
  private generateHandoffMessage(request: HandoffRequest): string {
    const urgencyPrefix = request.urgency === 'high' || request.urgency === 'critical' 
      ? '⚡ ' 
      : '';

    // Warm handoff message
    const warmHandoff = `${urgencyPrefix}I'm connecting you with ${request.toAgentName}, who specializes in ${this.getAgentSpecialty(request.toAgentId)}. They'll have full context of our conversation and can help you right away.`;

    // Add customer context if VIP
    if (request.customerContext?.isVIP) {
      return `${warmHandoff}\n\n✨ As a VIP customer, you'll receive priority assistance.`;
    }

    return warmHandoff;
  }

  /**
   * Get agent specialty description
   */
  private getAgentSpecialty(agentId: string): string {
    const specialties: Record<string, string> = {
      'sales-agent': 'pricing, quotes, and product recommendations',
      'customer-service-agent': 'customer support and order assistance',
      'mccarthy-artwork-agent': 'artwork analysis and print preparation',
      'production-agent': 'production status and timelines',
      'shipping-agent': 'shipping and delivery'
    };

    return specialties[agentId] || 'this area';
  }

  /**
   * Record handoff in history
   */
  private recordHandoff(sessionId: string, request: HandoffRequest): void {
    if (!this.handoffHistory.has(sessionId)) {
      this.handoffHistory.set(sessionId, []);
    }

    this.handoffHistory.get(sessionId)!.push(request);

    // Limit history to last 10 handoffs per session
    const history = this.handoffHistory.get(sessionId)!;
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Generate unique handoff ID
   */
  private generateHandoffId(request: HandoffRequest): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `handoff_${request.fromAgentId}_${request.toAgentId}_${timestamp}_${random}`;
  }

  /**
   * Create a handoff request (helper method)
   */
  static createHandoffRequest(
    fromAgentId: string,
    fromAgentName: string,
    toAgentId: string,
    toAgentName: string,
    reason: string,
    conversationContext: ConversationContext,
    options?: {
      customerContext?: CustomerContext;
      urgency?: 'low' | 'normal' | 'high' | 'critical';
      metadata?: Record<string, any>;
    }
  ): HandoffRequest {
    return {
      fromAgentId,
      fromAgentName,
      toAgentId,
      toAgentName,
      reason,
      conversationContext,
      customerContext: options?.customerContext,
      urgency: options?.urgency || 'normal',
      metadata: options?.metadata
    };
  }

  /**
   * Clear handoff history for a session (cleanup)
   */
  clearHistory(sessionId: string): void {
    this.handoffHistory.delete(sessionId);
  }

  /**
   * Clear all handoff history (cleanup)
   */
  clearAllHistory(): void {
    this.handoffHistory.clear();
  }
}

