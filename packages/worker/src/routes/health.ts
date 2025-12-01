/**
 * health.ts
 * 
 * Health check endpoints for monitoring and status verification
 */

import type { Env } from '../types/shared';

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'up' | 'down' | 'unknown';
    cache: 'up' | 'down' | 'unknown';
    llm: 'up' | 'down' | 'unknown';
  };
  uptime?: number;
  environment?: string;
}

/**
 * Basic health check
 */
export async function healthCheck(env: Env): Promise<HealthCheckResponse> {
  const startTime = Date.now();
  
  // Check database
  let dbStatus: 'up' | 'down' | 'unknown' = 'unknown';
  try {
    await env.DB.prepare('SELECT 1').first();
    dbStatus = 'up';
  } catch (error) {
    dbStatus = 'down';
  }

  // Check cache (KV)
  let cacheStatus: 'up' | 'down' | 'unknown' = 'unknown';
  try {
    await env.CACHE.get('health-check-test');
    cacheStatus = 'up';
  } catch (error) {
    cacheStatus = 'down';
  }

  // LLM status (we can't really check without making a call, so assume up)
  const llmStatus: 'up' | 'down' | 'unknown' = 'up';

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (dbStatus === 'down' || cacheStatus === 'down') {
    status = 'unhealthy';
  }

  const responseTime = Date.now() - startTime;

  return {
    status,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: dbStatus,
      cache: cacheStatus,
      llm: llmStatus,
    },
    uptime: responseTime,
    environment: env.ENVIRONMENT || 'production',
  };
}

/**
 * Handle health check request
 */
export async function handleHealthCheck(_request: Request, env: Env): Promise<Response> {
  try {
    const health = await healthCheck(env);
    
    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(health, null, 2), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }, null, 2),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Readiness check (for Kubernetes/orchestration)
 */
export async function handleReadinessCheck(_request: Request, env: Env): Promise<Response> {
  try {
    // Check if critical services are ready
    await env.DB.prepare('SELECT 1').first();
    
    return new Response(
      JSON.stringify({
        ready: true,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ready: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Liveness check (for Kubernetes/orchestration)
 */
export async function handleLivenessCheck(_request: Request, _env: Env): Promise<Response> {
  // Simple check - if this endpoint responds, the worker is alive
  return new Response(
    JSON.stringify({
      alive: true,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

