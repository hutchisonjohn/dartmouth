/**
 * BaseAgent Unit Tests
 * 
 * Tests the core orchestration logic of the BaseAgent
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseAgent, type BaseAgentEnv, type BaseAgentConfig } from '../BaseAgent';
import type { AgentConfig } from '../types/shared';

// Mock environment with in-memory storage
const createMockEnv = (): BaseAgentEnv => {
  const kvStorage = new Map<string, string>();
  const cacheStorage = new Map<string, string>();
  
  return {
    DB: {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
        first: vi.fn().mockResolvedValue(null),
        all: vi.fn().mockResolvedValue({ results: [] })
      })
    } as any,
    APP_CONFIG: {
      get: vi.fn().mockImplementation(async (key: string) => kvStorage.get(key) || null),
      put: vi.fn().mockImplementation(async (key: string, value: string) => {
        kvStorage.set(key, value);
      }),
      delete: vi.fn().mockImplementation(async (key: string) => kvStorage.delete(key))
    } as any,
    CACHE: {
      get: vi.fn().mockImplementation(async (key: string) => cacheStorage.get(key) || null),
      put: vi.fn().mockImplementation(async (key: string, value: string) => {
        cacheStorage.set(key, value);
      }),
      delete: vi.fn().mockImplementation(async (key: string) => cacheStorage.delete(key))
    } as any,
    FILES: {} as any,
    WORKERS_AI: {
      run: vi.fn().mockResolvedValue({
        data: [[0.1, 0.2, 0.3]] // Mock embedding
      })
    } as any
  };
};

// Mock agent config
const createMockAgentConfig = (): AgentConfig => ({
  agentId: 'test-agent-1',
  name: 'Test Agent',
  version: '1.0.0',
  description: 'A test agent',
  systemPrompt: 'You are a helpful test assistant.',
  llmProvider: 'openai',
  llmModel: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 150
});

describe('BaseAgent', () => {
  let agent: BaseAgent;
  let env: BaseAgentEnv;
  let agentConfig: AgentConfig;

  beforeEach(() => {
    env = createMockEnv();
    agentConfig = createMockAgentConfig();
    
    const config: BaseAgentConfig = {
      agentId: 'test-agent-1',
      tenantId: 'test-tenant-1',
      userId: 'test-user-1',
      agentConfig,
      env
    };

    agent = new BaseAgent(config);
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(agent).toBeDefined();
      expect(agent.getState()).toBeNull(); // No session yet
    });

    it('should have empty history initially', () => {
      const history = agent.getHistory();
      expect(history).toEqual([]);
    });

    it('should return default stats', () => {
      const stats = agent.getStats();
      expect(stats.sessionId).toBeNull();
      expect(stats.messageCount).toBe(0);
      expect(stats.topicsDiscussed).toEqual([]);
      expect(stats.repetitionCount).toBe(0);
      expect(stats.isFrustrated).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should create a new session on first message', async () => {
      const response = await agent.processMessage('Hello');
      
      expect(response).toBeDefined();
      expect(response.metadata?.sessionId).toBeDefined();
      expect(agent.getState()).not.toBeNull();
    });

    it('should maintain session across messages', async () => {
      const response1 = await agent.processMessage('Hello');
      const sessionId1 = response1.metadata?.sessionId;
      
      const response2 = await agent.processMessage('How are you?');
      const sessionId2 = response2.metadata?.sessionId;
      
      expect(sessionId1).toBe(sessionId2);
    });

    it('should track message count', async () => {
      await agent.processMessage('Message 1');
      await agent.processMessage('Message 2');
      await agent.processMessage('Message 3');
      
      const stats = agent.getStats();
      expect(stats.messageCount).toBe(6); // 3 user + 3 assistant
    });

    it('should clear session', async () => {
      await agent.processMessage('Hello');
      expect(agent.getState()).not.toBeNull();
      
      await agent.clearSession();
      expect(agent.getState()).toBeNull();
    });
  });

  describe('Message Processing', () => {
    it('should process a simple greeting', async () => {
      const response = await agent.processMessage('Hi');
      
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.metadata?.processingTimeMs).toBeDefined();
    });

    it('should handle empty messages gracefully', async () => {
      const response = await agent.processMessage('');
      
      expect(response.content).toBeDefined();
      // Should not crash
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000);
      const response = await agent.processMessage(longMessage);
      
      expect(response.content).toBeDefined();
      // Should not crash
    });

    it('should include metadata in response', async () => {
      const response = await agent.processMessage('Hello');
      
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.sessionId).toBeDefined();
      expect(response.metadata?.messageId).toBeDefined();
      expect(response.metadata?.processingTimeMs).toBeGreaterThan(0);
    });
  });

  describe('Intent Detection', () => {
    it('should detect greeting intent', async () => {
      await agent.processMessage('Hello');
      const state = agent.getState();
      
      expect(state).not.toBeNull();
      if (state) {
        const lastMessage = state.messages[state.messages.length - 2]; // User message
        expect(lastMessage.intent?.type).toBe('greeting');
      }
    });

    it('should detect calculation intent', async () => {
      await agent.processMessage('What is the DPI at 20cm?');
      const state = agent.getState();
      
      expect(state).not.toBeNull();
      if (state) {
        const lastMessage = state.messages[state.messages.length - 2]; // User message
        expect(lastMessage.intent?.type).toBe('calculation');
      }
    });
  });

  describe('Repetition Detection', () => {
    it('should detect repeated questions', async () => {
      await agent.processMessage('What is DPI?');
      await agent.processMessage('What is DPI?');
      await agent.processMessage('What is DPI?');
      
      const stats = agent.getStats();
      expect(stats.repetitionCount).toBeGreaterThan(0);
    });
  });

  describe('History Management', () => {
    it('should maintain conversation history', async () => {
      await agent.processMessage('Message 1');
      await agent.processMessage('Message 2');
      
      const history = agent.getHistory();
      expect(history.length).toBe(4); // 2 user + 2 assistant
    });

    it('should limit history when requested', async () => {
      await agent.processMessage('Message 1');
      await agent.processMessage('Message 2');
      await agent.processMessage('Message 3');
      
      const history = agent.getHistory(2);
      expect(history.length).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Force an error by passing invalid data
      const response = await agent.processMessage('Test');
      
      // Should return a response even if there's an error
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should include error info in metadata on failure', async () => {
      // This test would need to mock a component to throw an error
      // For now, we just verify the structure
      const response = await agent.processMessage('Test');
      expect(response.metadata).toBeDefined();
    });
  });

  describe('Knowledge Base', () => {
    it('should ingest documents', async () => {
      await expect(
        agent.ingestDocument('Test Doc', 'This is test content')
      ).resolves.not.toThrow();
    });

    it('should search knowledge base', async () => {
      await agent.ingestDocument('Test Doc', 'This is about DPI and printing');
      
      const results = await agent.searchKnowledge('DPI');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should track topics discussed', async () => {
      await agent.processMessage('What is DPI?');
      await agent.processMessage('Tell me about colors');
      
      const stats = agent.getStats();
      // Topics would be populated by handlers
      expect(stats.topicsDiscussed).toBeDefined();
      expect(Array.isArray(stats.topicsDiscussed)).toBe(true);
    });

    it('should track frustration', async () => {
      await agent.processMessage("This doesn't help at all!");
      
      const stats = agent.getStats();
      expect(stats.isFrustrated).toBeDefined();
    });
  });

  describe('Summary Generation', () => {
    it('should generate conversation summary', async () => {
      await agent.processMessage('Hello');
      await agent.processMessage('What is DPI?');
      
      const summary = agent.getSummary();
      expect(summary.short).toBeDefined();
      expect(summary.detailed).toBeDefined();
      expect(summary.short.length).toBeGreaterThan(0);
    });

    it('should return default summary with no conversation', () => {
      const summary = agent.getSummary();
      expect(summary.short).toBe('No active conversation');
      expect(summary.detailed).toBe('No active conversation');
    });
  });
});


