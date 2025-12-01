/**
 * Environment types for Cloudflare Worker
 */

export interface Bindings {
  // D1 Database
  DB: D1Database

  // KV Namespaces
  APP_CONFIG: KVNamespace
  CACHE: KVNamespace

  // R2 Bucket
  FILES: R2Bucket

  // Workers AI
  WORKERS_AI: Ai

  // Environment Variables
  ENVIRONMENT: string

  // Secrets
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  CLERK_SECRET_KEY: string
  JWT_SECRET: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  GOOGLE_API_KEY?: string

  // Index signature for Hono compatibility
  [key: string]: unknown
}

export interface Variables {
  // Request-scoped variables
  userId?: string
  organizationId?: string
  agentId?: string

  // Index signature for Hono compatibility
  [key: string]: unknown
}

declare global {
  // Extend Hono context
  interface HonoEnv {
    Bindings: Bindings
    Variables: Variables
  }
}

