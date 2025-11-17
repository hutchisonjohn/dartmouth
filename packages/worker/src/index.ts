/**
 * Agent Army Worker - Main Entry Point
 * Cloudflare Worker for AI Agent Platform
 */

import { router } from './routes';
import type { Env } from './types/shared';

/**
 * Cloudflare Worker fetch handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Route the request
      return await router(request, env);
    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
}

