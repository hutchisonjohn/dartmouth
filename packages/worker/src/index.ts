/**
 * Dartmouth OS Worker - Main Entry Point
 * Cloudflare Worker powered by Dartmouth OS V2.0
 */

import { DartmouthOS } from '../../dartmouth-core/src/DartmouthOS';
import { createFAMAgent, createArtworkAnalyzerAgent, createTestAgent } from './createDartmouthAgents';
// import { McCarthyPAAgent } from '../../mccarthy-pa/src'; // TODO: Enable after package build
import { router } from './routes';
import { handleEmailPolling } from './workers/email-poller';
import type { Env } from './types/shared';
import type { Env as DartmouthEnv } from '../../dartmouth-core/src/types';

// Global Dartmouth OS instance (initialized on first request)
let dartmouth: DartmouthOS | null = null;

/**
 * Initialize Dartmouth OS and register agents
 */
async function initializeDartmouth(env: Env): Promise<DartmouthOS> {
  if (dartmouth) {
    return dartmouth;
  }

  console.log('[Dartmouth] Initializing Dartmouth OS V2.0...');

  // Create Dartmouth OS instance
  const dartmouthEnv: DartmouthEnv = {
    DB: env.DB,
    R2: env.FILES,
    KV: env.CACHE,
    OPENAI_API_KEY: env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY || '',
    ELEVENLABS_API_KEY: env.ELEVENLABS_API_KEY,
    TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: env.TWILIO_AUTH_TOKEN,
    SENDGRID_API_KEY: env.SENDGRID_API_KEY,
    ENVIRONMENT: (env.ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
    JWT_SECRET: env.JWT_SECRET || 'dev-secret',
  };

  dartmouth = new DartmouthOS(dartmouthEnv, {
    environment: dartmouthEnv.ENVIRONMENT,
    enableHealthMonitoring: true,
    healthCheckInterval: 60000,
  });

  await dartmouth.initialize();

  console.log('[Dartmouth] Dartmouth OS initialized successfully');

  // Register agents
  console.log('[Dartmouth] Registering agents...');

  // Create base agent config
  const baseConfig = {
    agentId: 'fam',
    tenantId: 'default',
    agentConfig: {
      llmProvider: (env.LLM_PROVIDER as 'openai' | 'anthropic' | 'google') || 'openai',
      llmModel: env.LLM_MODEL || 'gpt-4o-mini',
      systemPrompt: '', // Will be set by agent
      temperature: 0.7,
      maxTokens: 1000,
    },
    env: {
      DB: env.DB,
      APP_CONFIG: env.APP_CONFIG,
      CACHE: env.CACHE,
      FILES: env.FILES,
      WORKERS_AI: env.WORKERS_AI,
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
      GOOGLE_API_KEY: env.GOOGLE_API_KEY,
    },
  };

  // Register FAM
  const famAgent = createFAMAgent(baseConfig);
  dartmouth.registerAgent(famAgent);
  console.log('[Dartmouth] ✅ FAM registered');

  // Register Artwork Analyzer
  const artworkAgent = createArtworkAnalyzerAgent({
    ...baseConfig,
    agentId: 'mccarthy-artwork',
  });
  dartmouth.registerAgent(artworkAgent);
  console.log('[Dartmouth] ✅ McCarthy Artwork Analyzer registered');

  // Register Test Agent
  const testAgent = createTestAgent({
    ...baseConfig,
    agentId: 'test-agent',
  });
  dartmouth.registerAgent(testAgent);
  console.log('[Dartmouth] ✅ Test Agent registered');

  // Register PA Agent (TODO: Enable after package build)
  // const paAgent = new McCarthyPAAgent({
  //   ...baseConfig,
  //   agentId: 'mccarthy-pa',
  // });
  // dartmouth.registerAgent(paAgent);
  // console.log('[Dartmouth] ✅ McCarthy PA registered');

  console.log('[Dartmouth] All agents registered successfully');

  return dartmouth;
}

/**
 * Cloudflare Worker fetch handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Initialize Dartmouth OS (if not already initialized)
      const dartmouthOS = await initializeDartmouth(env);

      // Check if request should be routed through Dartmouth OS
      const url = new URL(request.url);
      
      if (url.pathname.startsWith('/api/v2/')) {
        // Route through Dartmouth OS
        return await dartmouthOS.handleRequest(request);
      }

      // Otherwise, use legacy routing (for backward compatibility)
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

  /**
   * Cloudflare Worker scheduled handler
   * Runs on cron schedule defined in wrangler.toml
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('[Scheduled] Email polling job triggered at:', new Date(event.scheduledTime).toISOString());
    
    try {
      // Run email polling in background
      ctx.waitUntil(handleEmailPolling(env));
    } catch (error) {
      console.error('[Scheduled] Error in email polling job:', error);
    }
  }
}

