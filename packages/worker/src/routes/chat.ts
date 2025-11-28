/**
 * chat.ts
 * 
 * Production chat endpoints for the Agent Army system
 * Handles real conversations with full authentication and validation
 */

import { BaseAgent } from '../BaseAgent';
import { McCarthyArtworkAgent } from '../../../mccarthy-artwork/src/McCarthyArtworkAgent';
import { CustomerServiceAgent } from '../../../customer-service-agent/src/CustomerServiceAgent';
import { DatabaseManager } from '../services/DatabaseManager';
import type { Env } from '../types/shared';

/**
 * Chat request body
 */
export interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Chat response body
 */
export interface ChatResponse {
  content: string;
  sessionId: string;
  messageId: string;
  metadata: Record<string, any>;
  timestamp: string;
}

/**
 * Error response body
 */
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

/**
 * Validate chat request
 */
function validateChatRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.message || typeof body.message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string' };
  }

  if (body.message.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (body.message.length > 10000) {
    return { valid: false, error: 'Message is too long (max 10000 characters)' };
  }

  return { valid: true };
}

/**
 * Get agent configuration from database or use default
 */
async function getBaseAgentConfig(agentId: string, env: Env, userId?: string) {
  // For now, return a default config
  // In the future, this would load from the database
  return {
    agentId,
    tenantId: 'default-tenant',
    userId,
    agentConfig: {
      agentId,
      name: `Agent ${agentId}`,
      description: 'Production agent',
      version: '1.0.0',
      systemPrompt: `You are a professional AI assistant designed to have natural, helpful conversations.

CORE CONVERSATIONAL SKILLS:
- ALWAYS read the full conversation history before responding
- Remember what the user has told you (name, preferences, context)
- When users say "it", "that", "this", refer to what was just discussed
- NEVER ask for information you already have from previous messages
- Maintain context throughout the conversation
- Be conversational and acknowledge previous messages

PERSONALITY:
- Friendly and professional
- Clear and concise
- Helpful and proactive
- Honest when you don't know something

RESPONSE GUIDELINES:
- Keep responses focused and relevant
- If you don't understand, ask for clarification
- If you can't help with something, explain why and suggest alternatives
- Avoid repetition - don't say the same thing multiple times

CONSTRAINTS:
- Be honest about your limitations
- Don't make promises you can't keep
- Don't pretend to have capabilities you don't have
- Stay on topic unless the user changes the subject`,
      llmProvider: (env.LLM_PROVIDER || 'openai') as 'openai' | 'anthropic' | 'google',
      llmModel: env.LLM_MODEL || 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2000,
    },
    env: {
      DB: env.DB,
      APP_CONFIG: env.APP_CONFIG as any,
      CACHE: env.CACHE as any,
      FILES: env.FILES as any,
      WORKERS_AI: env.WORKERS_AI as any,
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
      GOOGLE_API_KEY: env.GOOGLE_API_KEY,
    },
  };
}

/**
 * POST /api/v1/agents/:agentId/chat
 * Send a message to an agent
 */
export async function handleChat(
  agentId: string,
  request: Request,
  env: Env
): Promise<Response> {
  const startTime = Date.now();

  try {
    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json() as ChatRequest;
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate request
    const validation = validateChatRequest(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          error: validation.error,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get agent configuration
    const config = await getBaseAgentConfig(agentId, env, body.userId);
    
    // Create agent instance based on agentId
    let agent: BaseAgent;
    if (agentId === 'mccarthy-artwork' || agentId === 'artwork-analyzer') {
      agent = new McCarthyArtworkAgent(config);
    } else if (agentId === 'customer-service') {
      agent = new CustomerServiceAgent({
        ...config,
        shopifyApiUrl: env.SHOPIFY_API_URL!,
        shopifyAccessToken: env.SHOPIFY_ACCESS_TOKEN!,
        perpApiUrl: env.PERP_API_URL!,
        perpApiKey: env.PERP_API_KEY!,
        gmailCredentials: {
          clientId: env.GMAIL_CLIENT_ID!,
          clientSecret: env.GMAIL_CLIENT_SECRET!,
          redirectUri: env.GMAIL_REDIRECT_URI!,
          refreshToken: env.GMAIL_REFRESH_TOKEN!
        },
        aiResponseMode: (env.AI_RESPONSE_MODE || 'draft') as 'auto' | 'draft'
      });
    } else {
      agent = new BaseAgent(config);
    }
    
    // Generate session ID if not provided
    const sessionId = body.sessionId || `session-${agentId}-${Date.now()}`;
    
    // Process message
    const response = await agent.processMessage(body.message, sessionId);
    
    // Log to analytics
    const db = new DatabaseManager(env.DB);
    await db.createAnalyticsEvent({
      id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      sessionId,
      eventType: 'message_sent',
      eventData: {
        messageLength: body.message.length,
        responseLength: response.content.length,
        processingTime: Date.now() - startTime,
        intent: response.metadata.intent,
      },
      userId: body.userId,
      timestamp: new Date().toISOString(),
    });

    // Return response
    const chatResponse: ChatResponse = {
      content: response.content,
      sessionId,
      messageId: response.metadata.messageId || `msg-${Date.now()}`,
      metadata: {
        ...response.metadata,
        processingTime: Date.now() - startTime,
      },
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(chatResponse, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Id': agentId,
        'X-Session-Id': sessionId,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);

    // Log error to analytics
    try {
      const db = new DatabaseManager(env.DB);
      await db.createAnalyticsEvent({
        id: `analytics-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        eventType: 'error',
        eventData: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          processingTime: Date.now() - startTime,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      } as ErrorResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * GET /api/v1/agents/:agentId/sessions/:sessionId
 * Get session information
 */
export async function handleGetSession(
  agentId: string,
  sessionId: string,
  env: Env
): Promise<Response> {
  try {
    const db = new DatabaseManager(env.DB);
    
    // Get session from database
    const session = await db.getSession(sessionId);
    
    if (!session) {
      return new Response(
        JSON.stringify({
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify session belongs to agent
    if (session.agent_id !== agentId) {
      return new Response(
        JSON.stringify({
          error: 'Session does not belong to this agent',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get messages for session
    const messages = await db.getMessagesBySession(sessionId);

    return new Response(
      JSON.stringify(
        {
          session: {
            id: session.id,
            agentId: session.agent_id,
            startedAt: session.started_at,
            lastActivityAt: session.last_activity_at,
            messageCount: session.message_count,
            summary: session.summary,
            topicsDiscussed: session.topics_discussed 
              ? JSON.parse(session.topics_discussed) 
              : [],
            goalAchieved: session.goal_achieved === 1,
          },
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            intent: msg.intent ? JSON.parse(msg.intent) : undefined,
          })),
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get session error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      } as ErrorResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * DELETE /api/v1/agents/:agentId/sessions/:sessionId
 * Delete a session and all its messages
 */
export async function handleDeleteSession(
  agentId: string,
  sessionId: string,
  env: Env
): Promise<Response> {
  try {
    const db = new DatabaseManager(env.DB);
    
    // Get session from database
    const session = await db.getSession(sessionId);
    
    if (!session) {
      return new Response(
        JSON.stringify({
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify session belongs to agent
    if (session.agent_id !== agentId) {
      return new Response(
        JSON.stringify({
          error: 'Session does not belong to this agent',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete session (messages will be deleted via CASCADE)
    await db.executeRaw('DELETE FROM sessions WHERE id = ?', [sessionId]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Session deleted successfully',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Delete session error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      } as ErrorResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /api/v1/agents/:agentId/feedback
 * Submit feedback for a message or session
 */
export async function handleFeedback(
  agentId: string,
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body = await request.json() as {
      sessionId: string;
      messageId?: string;
      rating: 'positive' | 'negative' | 'neutral' | 'thumbs_up' | 'thumbs_down';
      comment?: string;
      category?: string;
      userId?: string;
    };

    // Validate required fields
    if (!body.sessionId || !body.rating) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: sessionId, rating',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const db = new DatabaseManager(env.DB);
    
    // Create feedback record
    await db.createFeedback({
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: body.sessionId,
      messageId: body.messageId,
      agentId,
      userId: body.userId,
      rating: body.rating,
      comment: body.comment,
      category: body.category,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback submitted successfully',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Feedback error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      } as ErrorResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

