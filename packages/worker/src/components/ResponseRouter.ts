/**
 * Response Router
 * 
 * Routes intents to appropriate handlers and manages middleware.
 * Implements Section 5.1.3 from AGENT_ARMY_SYSTEM.md
 */

import type { Intent, Response, ConversationState } from '../types/shared'

/**
 * Handler interface - all handlers must implement this
 * 
 * UPDATED 2025-11-23: Added priority field for handler ordering
 */
export interface Handler {
  name: string
  version: string
  priority?: number  // Higher priority = checked first (default: 0)
  canHandle(intent: Intent): boolean
  handle(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response>
}

/**
 * Handler context passed to all handlers
 */
export interface HandlerContext {
  conversationState?: ConversationState
  state?: ConversationState
  agentConfig?: any
  env?: any
  stateManager?: any
  memorySystem?: any
  ragEngine?: any
  frustrationHandler?: any
  artworkData?: any
  ragContext?: string
  metadata?: Record<string, any>
}

/**
 * Middleware interface
 */
export interface Middleware {
  name: string
  execute(
    message: string,
    intent: Intent,
    context: HandlerContext,
    next: () => Promise<Response>
  ): Promise<Response>
}

export class ResponseRouter {
  private handlers: Map<string, Handler> = new Map()
  private middleware: Middleware[] = []
  private defaultHandler?: Handler

  /**
   * Register a handler
   */
  registerHandler(handler: Handler): void {
    this.handlers.set(handler.name, handler)
  }

  /**
   * Register multiple handlers
   */
  registerHandlers(handlers: Handler[]): void {
    for (const handler of handlers) {
      this.registerHandler(handler)
    }
  }

  /**
   * Set the default handler (fallback)
   */
  setDefaultHandler(handler: Handler): void {
    this.defaultHandler = handler
  }

  /**
   * Add middleware
   */
  use(middleware: Middleware): void {
    this.middleware.push(middleware)
  }

  /**
   * Route an intent to the appropriate handler
   */
  async route(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    // Find the best handler
    const handler = this.findHandler(intent)

    if (!handler) {
      throw new Error(`No handler found for intent type: ${intent.type}`)
    }

    // Execute middleware chain
    return this.executeMiddleware(message, intent, context, handler)
  }

  /**
   * Find the best handler for an intent
   * 
   * UPDATED 2025-11-23: Sort handlers by priority before checking
   * This allows specialized agents to override foundation handlers
   */
  private findHandler(intent: Intent): Handler | null {
    // Sort handlers by priority (highest first)
    const sortedHandlers = Array.from(this.handlers.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Check handlers in priority order
    for (const handler of sortedHandlers) {
      if (handler.canHandle(intent)) {
        return handler
      }
    }

    // Fall back to default handler
    return this.defaultHandler || null
  }

  /**
   * Execute middleware chain
   */
  private async executeMiddleware(
    message: string,
    intent: Intent,
    context: HandlerContext,
    handler: Handler
  ): Promise<Response> {
    let index = 0

    const next = async (): Promise<Response> => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index++]
        return middleware.execute(message, intent, context, next)
      } else {
        // All middleware executed, call the handler
        return handler.handle(message, intent, context)
      }
    }

    return next()
  }

  /**
   * Get all registered handlers
   */
  getHandlers(): Handler[] {
    return Array.from(this.handlers.values())
  }

  /**
   * Get handler by name
   */
  getHandler(name: string): Handler | undefined {
    return this.handlers.get(name)
  }

  /**
   * Remove a handler
   */
  removeHandler(name: string): boolean {
    return this.handlers.delete(name)
  }

  /**
   * Clear all handlers
   */
  clearHandlers(): void {
    this.handlers.clear()
  }

  /**
   * Get middleware stack
   */
  getMiddleware(): Middleware[] {
    return [...this.middleware]
  }
}

/**
 * Built-in Middleware: Logging
 */
export class LoggingMiddleware implements Middleware {
  name = 'logging'

  async execute(
    _message: string,
    intent: Intent,
    _context: HandlerContext,
    next: () => Promise<Response>
  ): Promise<Response> {
    const start = Date.now()
    console.log(`[Router] Processing intent: ${intent.type}`)

    try {
      const response = await next()
      const duration = Date.now() - start
      console.log(`[Router] Completed in ${duration}ms`)
      return response
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[Router] Failed after ${duration}ms:`, error)
      throw error
    }
  }
}

/**
 * Built-in Middleware: Caching
 */
export class CachingMiddleware implements Middleware {
  name = 'caching'
  private cache: Map<string, { response: Response; timestamp: number }> = new Map()
  private ttl: number = 60000 // 1 minute

  constructor(ttl?: number) {
    if (ttl) this.ttl = ttl
  }

  async execute(
    message: string,
    intent: Intent,
    _context: HandlerContext,
    next: () => Promise<Response>
  ): Promise<Response> {
    // Generate cache key
    const cacheKey = this.generateCacheKey(message, intent)

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      console.log('[Cache] Hit')
      return {
        ...cached.response,
        metadata: {
          ...cached.response.metadata,
          cached: true
        }
      }
    }

    // Cache miss - execute handler
    console.log('[Cache] Miss')
    const response = await next()

    // Store in cache
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    })

    return response
  }

  private generateCacheKey(message: string, intent: Intent): string {
    return `${intent.type}:${message.toLowerCase().trim()}`
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

/**
 * Built-in Middleware: Analytics
 */
export class AnalyticsMiddleware implements Middleware {
  name = 'analytics'

  async execute(
    _message: string,
    intent: Intent,
    _context: HandlerContext,
    next: () => Promise<Response>
  ): Promise<Response> {
    const start = Date.now()

    try {
      const response = await next()
      const duration = Date.now() - start

      // Track successful response
      this.track({
        event: 'response_generated',
        intentType: intent.type,
        duration,
        handlerName: response.metadata.handlerName,
        confidence: intent.confidence,
        cached: response.metadata.cached
      })

      return response
    } catch (error) {
      const duration = Date.now() - start

      // Track error
      this.track({
        event: 'response_error',
        intentType: intent.type,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }
  }

  private track(data: Record<string, any>): void {
    // TODO: Send to analytics service
    console.log('[Analytics]', data)
  }
}

