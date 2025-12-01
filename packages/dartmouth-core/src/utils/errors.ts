/**
 * Dartmouth OS V2.0 - Error Handling
 * Standardized error classes and handling
 */

export class DartmouthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'DartmouthError';
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class AgentNotFoundError extends DartmouthError {
  constructor(agentId: string) {
    super(`Agent not found: ${agentId}`, 'AGENT_NOT_FOUND', 404, { agentId });
    this.name = 'AgentNotFoundError';
  }
}

export class AuthenticationError extends DartmouthError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends DartmouthError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends DartmouthError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends DartmouthError {
  constructor(service: string) {
    super(`Service unavailable: ${service}`, 'SERVICE_UNAVAILABLE', 503, { service });
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Handle errors and return appropriate Response
 */
export function handleError(error: Error | DartmouthError): Response {
  if (error instanceof DartmouthError) {
    return new Response(JSON.stringify(error.toJSON()), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Unknown error
  return new Response(
    JSON.stringify({
      error: {
        name: 'InternalServerError',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
      },
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

