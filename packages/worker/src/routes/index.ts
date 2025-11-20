/**
 * index.ts
 * 
 * Main router for all API endpoints
 * Routes requests to appropriate handlers
 */

import { handleHealthCheck, handleReadinessCheck, handleLivenessCheck } from './health';
import {
  handleTestChat,
  handleTestIntent,
  handleTestValidation,
  handleTestCalculation,
  handleTestMemory,
  handleTestRAG,
  handleTestGetSession,
  handleTestBatch,
} from './test';
import {
  handleChat,
  handleGetSession,
  handleDeleteSession,
  handleFeedback,
} from './chat';
import type { Env } from '../types/shared';

/**
 * CORS headers for all responses
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Agent-Id',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * 404 Not Found response
 */
function notFound(): Response {
  return new Response(
    JSON.stringify({
      error: 'Not Found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * 405 Method Not Allowed response
 */
function methodNotAllowed(allowedMethods: string[]): Response {
  return new Response(
    JSON.stringify({
      error: 'Method Not Allowed',
      code: 'METHOD_NOT_ALLOWED',
      allowedMethods,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': allowedMethods.join(', '),
      },
    }
  );
}

/**
 * Parse URL path and extract parameters
 */
function parsePath(pathname: string): { segments: string[]; params: Record<string, string> } {
  const segments = pathname.split('/').filter(s => s.length > 0);
  const params: Record<string, string> = {};
  
  return { segments, params };
}

/**
 * Main router function
 */
export async function router(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return handleOptions();
  }

  // Parse path
  const { segments } = parsePath(pathname);

  try {
    // ========================================================================
    // HEALTH CHECK ENDPOINTS
    // ========================================================================

    // GET /health
    if (segments[0] === 'health' && segments.length === 1) {
      if (method !== 'GET') {
        return addCorsHeaders(methodNotAllowed(['GET']));
      }
      return addCorsHeaders(await handleHealthCheck(request, env));
    }

    // GET /health/ready
    if (segments[0] === 'health' && segments[1] === 'ready' && segments.length === 2) {
      if (method !== 'GET') {
        return addCorsHeaders(methodNotAllowed(['GET']));
      }
      return addCorsHeaders(await handleReadinessCheck(request, env));
    }

    // GET /health/live
    if (segments[0] === 'health' && segments[1] === 'live' && segments.length === 2) {
      if (method !== 'GET') {
        return addCorsHeaders(methodNotAllowed(['GET']));
      }
      return addCorsHeaders(await handleLivenessCheck(request, env));
    }

    // ========================================================================
    // TEST ENDPOINTS
    // ========================================================================

    // POST /test/chat
    if (segments[0] === 'test' && segments[1] === 'chat' && segments.length === 2) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      return addCorsHeaders(await handleTestChat(request, env));
    }

    // POST /test/intent
    if (segments[0] === 'test' && segments[1] === 'intent' && segments.length === 2) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      return addCorsHeaders(await handleTestIntent(request, env));
    }

    // POST /test/validation
    if (segments[0] === 'test' && segments[1] === 'validation' && segments.length === 2) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      return addCorsHeaders(await handleTestValidation(request, env));
    }

    // POST /test/calculation
    if (segments[0] === 'test' && segments[1] === 'calculation' && segments.length === 2) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      return addCorsHeaders(await handleTestCalculation(request, env));
    }

    // POST /test/memory
    if (segments[0] === 'test' && segments[1] === 'memory' && segments.length === 2) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      return addCorsHeaders(await handleTestMemory(request, env));
    }

    // POST /test/rag
    if (segments[0] === 'test' && segments[1] === 'rag' && segments.length === 2) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      return addCorsHeaders(await handleTestRAG(request, env));
    }

    // GET /test/session/:sessionId
    if (segments[0] === 'test' && segments[1] === 'session' && segments.length === 3) {
      if (method !== 'GET') {
        return addCorsHeaders(methodNotAllowed(['GET']));
      }
      return addCorsHeaders(await handleTestGetSession(segments[2], env));
    }

    // POST /test/batch
    if (segments[0] === 'test' && segments[1] === 'batch' && segments.length === 2) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      return addCorsHeaders(await handleTestBatch(request, env));
    }

    // ========================================================================
    // PRODUCTION API ENDPOINTS
    // ========================================================================

    // POST /api/v1/agents/:agentId/chat
    if (
      segments[0] === 'api' &&
      segments[1] === 'v1' &&
      segments[2] === 'agents' &&
      segments[4] === 'chat' &&
      segments.length === 5
    ) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      const agentId = segments[3];
      return addCorsHeaders(await handleChat(agentId, request, env));
    }

    // GET /api/v1/agents/:agentId/sessions/:sessionId
    if (
      segments[0] === 'api' &&
      segments[1] === 'v1' &&
      segments[2] === 'agents' &&
      segments[4] === 'sessions' &&
      segments.length === 6
    ) {
      if (method !== 'GET') {
        return addCorsHeaders(methodNotAllowed(['GET']));
      }
      const agentId = segments[3];
      const sessionId = segments[5];
      return addCorsHeaders(await handleGetSession(agentId, sessionId, env));
    }

    // DELETE /api/v1/agents/:agentId/sessions/:sessionId
    if (
      segments[0] === 'api' &&
      segments[1] === 'v1' &&
      segments[2] === 'agents' &&
      segments[4] === 'sessions' &&
      segments.length === 6
    ) {
      if (method !== 'DELETE') {
        return addCorsHeaders(methodNotAllowed(['DELETE']));
      }
      const agentId = segments[3];
      const sessionId = segments[5];
      return addCorsHeaders(await handleDeleteSession(agentId, sessionId, env));
    }

    // POST /api/v1/agents/:agentId/feedback
    if (
      segments[0] === 'api' &&
      segments[1] === 'v1' &&
      segments[2] === 'agents' &&
      segments[4] === 'feedback' &&
      segments.length === 5
    ) {
      if (method !== 'POST') {
        return addCorsHeaders(methodNotAllowed(['POST']));
      }
      const agentId = segments[3];
      return addCorsHeaders(await handleFeedback(agentId, request, env));
    }

    // ========================================================================
    // ROOT ENDPOINT - API Documentation
    // ========================================================================

    // GET /
    if (segments.length === 0 || (segments.length === 1 && segments[0] === '')) {
      if (method !== 'GET') {
        return addCorsHeaders(methodNotAllowed(['GET']));
      }
      
      return addCorsHeaders(
        new Response(
          JSON.stringify(
            {
              name: 'Dartmouth OS API',
              version: '2.0.0',
              status: 'operational',
              dartmouth: {
                version: '2.0.0',
                status: 'active',
                agents: ['fam', 'mccarthy-artwork', 'test-agent'],
              },
              endpoints: {
                'dartmouth-v2': {
                  'POST /api/v2/chat': 'Send message to agent (Dartmouth OS)',
                  'GET /api/v2/health': 'Health check for all agents',
                  'GET /api/v2/health?agentId=xxx': 'Health check for specific agent',
                  'GET /api/v2/agents': 'List all registered agents',
                },
                health: {
                  'GET /health': 'Health check',
                  'GET /health/ready': 'Readiness check',
                  'GET /health/live': 'Liveness check',
                },
                test: {
                  'POST /test/chat': 'Test full conversation flow',
                  'POST /test/intent': 'Test intent detection',
                  'POST /test/validation': 'Test response validation',
                  'POST /test/calculation': 'Test calculation engine',
                  'POST /test/memory': 'Test memory system',
                  'POST /test/rag': 'Test RAG engine',
                  'GET /test/session/:sessionId': 'Get test session',
                  'POST /test/batch': 'Test batch messages',
                },
                'legacy-v1': {
                  'POST /api/v1/agents/:agentId/chat': 'Send message to agent (Legacy)',
                  'GET /api/v1/agents/:agentId/sessions/:sessionId': 'Get session',
                  'DELETE /api/v1/agents/:agentId/sessions/:sessionId': 'Delete session',
                  'POST /api/v1/agents/:agentId/feedback': 'Submit feedback',
                },
              },
              documentation: 'https://github.com/hutchisonjohn/dartmouth',
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }

    // ========================================================================
    // 404 NOT FOUND
    // ========================================================================

    return addCorsHeaders(notFound());
  } catch (error) {
    console.error('Router error:', error);

    return addCorsHeaders(
      new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
  }
}

