/**
 * test.ts
 * 
 * Test endpoints for validating individual components
 * These endpoints allow testing each component in isolation
 */

import { BaseAgent } from '../BaseAgent';
import { IntentDetector } from '../components/IntentDetector';
import { ResponseValidator } from '../components/ResponseValidator';
import { CalculationEngine } from '../components/CalculationEngine';
import type { Env } from '../types/shared';

/**
 * Create a test base agent configuration
 */
function createTestBaseAgentConfig(env: Env, agentId: string = 'test-agent') {
  return {
    agentId,
    tenantId: 'test-tenant',
    userId: 'test-user',
    agentConfig: {
      agentId,
      name: 'Test Agent',
      description: 'Agent for testing purposes',
      version: '1.0.0',
      systemPrompt: 'You are a helpful test assistant.',
      llmProvider: 'anthropic' as const,
      llmModel: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 1000,
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
 * POST /test/chat
 * Test the full conversation flow
 */
export async function handleTestChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { message: string; sessionId?: string };
    
    if (!body.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const config = createTestBaseAgentConfig(env);
    const agent = new BaseAgent(config);
    
    const sessionId = body.sessionId || `test-session-${Date.now()}`;
    const response = await agent.processMessage(body.message, sessionId);

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /test/intent
 * Test the IntentDetector component
 */
export async function handleTestIntent(request: Request, _env: Env): Promise<Response> {
  try {
    const body = await request.json() as { message: string };
    
    if (!body.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const detector = new IntentDetector();
    const intent = await detector.detect(body.message);

    return new Response(JSON.stringify({ intent }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /test/validation
 * Test the ResponseValidator component
 */
export async function handleTestValidation(request: Request, _env: Env): Promise<Response> {
  try {
    const body = await request.json() as { 
      question: string; 
      answer: string;
    };
    
    if (!body.question || !body.answer) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: question, answer' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validator = new ResponseValidator();
    const validation = await validator.validate(
      { 
        content: body.answer, 
        metadata: {
          handlerName: 'test',
          handlerVersion: '1.0.0',
          processingTime: 0,
          cached: false,
          confidence: 1.0,
        }
      },
      body.question
    );

    return new Response(JSON.stringify({ validation }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /test/calculation
 * Test the CalculationEngine component
 */
export async function handleTestCalculation(request: Request, _env: Env): Promise<Response> {
  try {
    const body = await request.json() as { 
      artworkId: string;
      widthPixels: number;
      heightPixels: number;
      currentDPI: number;
    };
    
    if (!body.artworkId || !body.widthPixels || !body.heightPixels || !body.currentDPI) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: artworkId, widthPixels, heightPixels, currentDPI' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const engine = new CalculationEngine();
    const result = engine.preCompute(
      body.artworkId,
      body.widthPixels,
      body.heightPixels,
      body.currentDPI
    );

    return new Response(JSON.stringify({ result }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /test/memory
 * Test the MemorySystem component
 */
export async function handleTestMemory(request: Request, _env: Env): Promise<Response> {
  try {
    const body = await request.json() as { 
      action: 'store' | 'retrieve';
      agentId: string;
    };
    
    if (!body.action || !body.agentId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, agentId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Implement memory system testing once MemorySystem API is finalized
    return new Response(
      JSON.stringify({ 
        message: 'Memory system testing not yet implemented',
        action: body.action,
        agentId: body.agentId
      }, null, 2),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /test/rag
 * Test the RAG Engine component
 */
export async function handleTestRAG(request: Request, _env: Env): Promise<Response> {
  try {
    const body = await request.json() as { 
      action: 'ingest' | 'search';
      agentId: string;
    };
    
    if (!body.action || !body.agentId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, agentId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Implement RAG testing once RAGEngine API is finalized
    return new Response(
      JSON.stringify({ 
        message: 'RAG engine testing not yet implemented',
        action: body.action,
        agentId: body.agentId
      }, null, 2),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * GET /test/session/:sessionId
 * Get session state for testing
 */
export async function handleTestGetSession(sessionId: string, env: Env): Promise<Response> {
  try {
    const config = createTestBaseAgentConfig(env);
    const agent = new BaseAgent(config);
    
    // Initialize with the session ID to load state
    await agent.processMessage('', sessionId);
    const summary = agent.getSummary();

    return new Response(
      JSON.stringify({ sessionId, summary }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /test/batch
 * Test multiple messages in sequence
 */
export async function handleTestBatch(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { 
      messages: string[];
      sessionId?: string;
    };
    
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: messages (array)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const config = createTestBaseAgentConfig(env);
    const agent = new BaseAgent(config);
    const sessionId = body.sessionId || `test-batch-${Date.now()}`;
    
    const responses = [];
    for (const message of body.messages) {
      const response = await agent.processMessage(message, sessionId);
      responses.push({
        message,
        response: response.content,
        metadata: response.metadata,
      });
    }

    const summary = agent.getSummary();

    return new Response(
      JSON.stringify({ sessionId, responses, summary }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

