/**
 * Dartmouth OS V2.0 - API Gateway
 * Route requests to appropriate agents and services
 */

import { AgentRegistry } from './AgentRegistry';
import type { AgentRequest } from '../types';
import { Logger } from '../utils/logger';
import { handleError, ValidationError } from '../utils/errors';

export class APIGateway {
  private logger: Logger;

  constructor(
    private agentRegistry: AgentRegistry,
    environment: string = 'development'
  ) {
    this.logger = new Logger('APIGateway', environment);
  }

  /**
   * Handle incoming HTTP request
   */
  async handleRequest(request: Request): Promise<Response> {
    const startTime = Date.now();
    const url = new URL(request.url);

    this.logger.info(`Incoming request: ${request.method} ${url.pathname}`);

    try {
      // CORS headers
      if (request.method === 'OPTIONS') {
        return this.handleCORS();
      }

      // Route based on path
      if (url.pathname.startsWith('/api/v2/chat')) {
        return await this.handleChat(request);
      }

      if (url.pathname.startsWith('/api/v2/health')) {
        return await this.handleHealth(request);
      }

      if (url.pathname.startsWith('/api/v2/agents')) {
        return await this.handleAgents(request);
      }

      // Not found
      return new Response(
        JSON.stringify({
          error: {
            message: 'Not found',
            code: 'NOT_FOUND',
            statusCode: 404,
          },
        }),
        {
          status: 404,
          headers: this.getCORSHeaders({ 'Content-Type': 'application/json' }),
        }
      );
    } catch (error) {
      this.logger.error('Request failed', error);
      return handleError(error as Error);
    } finally {
      const duration = Date.now() - startTime;
      this.logger.info(`Request completed in ${duration}ms`);
    }
  }

  /**
   * Handle chat request
   */
  private async handleChat(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      throw new ValidationError('Method not allowed. Use POST.');
    }

    // Parse request body
    const body = await request.json() as any;

    // Validate required fields
    if (!body.agentId) {
      throw new ValidationError('Missing required field: agentId');
    }

    if (!body.message) {
      throw new ValidationError('Missing required field: message');
    }

    // Get agent
    const agent = this.agentRegistry.get(body.agentId);

    // Build agent request
    const agentRequest: AgentRequest = {
      sessionId: body.sessionId || `session-${Date.now()}`,
      userId: body.userId,
      message: body.message,
      history: body.history || [],
      context: body.context || {},
      metadata: {
        timestamp: Date.now(),
        userAgent: request.headers.get('User-Agent') || undefined,
        language: body.language || 'en-US',
        timezone: body.timezone || 'UTC',
      },
    };

    this.logger.info(`Routing chat request to agent: ${agent.id}`, {
      sessionId: agentRequest.sessionId,
      messageLength: body.message.length,
    });

    // Process message
    const startTime = Date.now();
    const response = await agent.processMessage(agentRequest);
    const processingTime = Date.now() - startTime;

    // Add processing time to metadata
    if (!response.metadata) {
      response.metadata = {
        timestamp: Date.now(),
        processingTime,
      };
    } else {
      response.metadata.processingTime = processingTime;
    }

    this.logger.info(`Agent response generated in ${processingTime}ms`, {
      agentId: agent.id,
      responseLength: response.content.length,
      intent: response.intent,
    });

    // Return response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: this.getCORSHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  /**
   * Handle health check request
   */
  private async handleHealth(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');

    if (agentId) {
      // Health check for specific agent
      const agent = this.agentRegistry.get(agentId);
      const healthCheck = await agent.healthCheck();

      // Update registry
      this.agentRegistry.updateHealthCheck(agentId, healthCheck);

      return new Response(JSON.stringify(healthCheck), {
        status: healthCheck.status === 'healthy' ? 200 : 503,
        headers: this.getCORSHeaders({ 'Content-Type': 'application/json' }),
      });
    }

    // Health check for all agents
    const agents = this.agentRegistry.getAll();
    const healthChecks = await Promise.all(
      agents.map(async (agent) => {
        const healthCheck = await agent.healthCheck();
        this.agentRegistry.updateHealthCheck(agent.id, healthCheck);
        return healthCheck;
      })
    );

    const allHealthy = healthChecks.every((hc) => hc.status === 'healthy');

    return new Response(
      JSON.stringify({
        status: allHealthy ? 'healthy' : 'degraded',
        agents: healthChecks,
        timestamp: Date.now(),
      }),
      {
        status: allHealthy ? 200 : 503,
        headers: this.getCORSHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  /**
   * Handle agents list request
   */
  private async handleAgents(_request: Request): Promise<Response> {
    const stats = this.agentRegistry.getStats();

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: this.getCORSHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  /**
   * Handle CORS preflight
   */
  private handleCORS(): Response {
    return new Response(null, {
      status: 204,
      headers: this.getCORSHeaders(),
    });
  }

  /**
   * Get CORS headers
   */
  private getCORSHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      ...additionalHeaders,
    };
  }
}

