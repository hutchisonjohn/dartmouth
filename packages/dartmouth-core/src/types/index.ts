/**
 * Dartmouth OS V2.0 - Type Definitions
 * Central export for all type definitions
 */

export * from './Agent';

// Environment bindings for Cloudflare Workers
export interface Env {
  // Database
  DB: D1Database;

  // Storage
  R2: R2Bucket;

  // Cache
  KV: KVNamespace;

  // API Keys
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  ELEVENLABS_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  SENDGRID_API_KEY?: string;

  // Configuration
  ENVIRONMENT: 'development' | 'staging' | 'production';
  JWT_SECRET: string;
}

