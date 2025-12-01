/**
 * test-helpers.ts
 * 
 * Shared test utilities and mock factories
 */

import type { ConversationState, HandlerContext, Intent, AgentConfig } from '../types/shared';

/**
 * Create a mock KV namespace for testing
 */
export function createMockKV(): any {
  const storage = new Map<string, string>();
  return {
    get: async (key: string) => storage.get(key) || null,
    put: async (key: string, value: string) => {
      storage.set(key, value);
    },
    delete: async (key: string) => storage.delete(key),
    list: async () => ({ keys: Array.from(storage.keys()).map(name => ({ name })) }),
  };
}

/**
 * Create a mock D1 database for testing
 */
export function createMockD1(): any {
  return {
    prepare: (_query: string) => ({
      bind: (..._params: any[]) => ({
        first: async () => null,
        all: async () => ({ results: [] }),
        run: async () => ({ success: true }),
      }),
    }),
  };
}

/**
 * Create a mock ConversationState with all required properties
 */
export function createMockConversationState(overrides?: Partial<ConversationState>): ConversationState {
  return {
    sessionId: 'test-session',
    agentId: 'test-agent',
    startedAt: new Date(),
    lastMessageAt: new Date(),
    lastActivityAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
    messageCount: 0,
    messages: [],
    questionsAsked: [],
    answersGiven: [],
    topicsDiscussed: [],
    intentsDetected: [],
    currentTopic: null,
    conversationPlan: null,
    isFrustrationDetected: false,
    isRepeatDetected: false,
    isGoalAchieved: false,
    needsEscalation: false,
    isMultiTurn: false,
    userPreferences: new Map(),
    learnedPatterns: [],
    previousSessions: [],
    tags: [],
    metadata: {},
    ...overrides,
  };
}

/**
 * Create a mock HandlerContext
 */
export function createMockHandlerContext(overrides?: Partial<HandlerContext>): HandlerContext {
  return {
    state: createMockConversationState(),
    agentConfig: {
      agentId: 'test-agent',
      name: 'Test Agent',
      version: '1.0.0',
    },
    env: {} as any,
    stateManager: {} as any,
    memorySystem: {} as any,
    ragEngine: {} as any,
    calculationEngine: {} as any,
    frustrationHandler: {} as any,
    ...overrides,
  };
}

/**
 * Create a mock Intent
 */
export function createMockIntent(type: string, confidence: number = 0.9): Intent {
  return {
    type: type as any,
    confidence,
    entities: {},
  };
}

/**
 * Create a mock AgentConfig
 */
export function createMockAgentConfig(overrides?: Partial<AgentConfig>): AgentConfig {
  return {
    agentId: 'test-agent',
    name: 'Test Agent',
    version: '1.0.0',
    systemPrompt: 'You are a helpful test assistant.',
    llmProvider: 'anthropic',
    llmModel: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 1000,
    ...overrides,
  };
}

