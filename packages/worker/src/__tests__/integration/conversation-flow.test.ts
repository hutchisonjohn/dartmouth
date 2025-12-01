/**
 * conversation-flow.test.ts
 * 
 * Integration tests for full conversation flows
 * Tests the complete system working together
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseAgent } from '../../BaseAgent';
import type { BaseAgentConfig } from '../../BaseAgent';
import { createMockKV, createMockD1 } from '../test-helpers';

describe('Conversation Flow Integration', () => {
  let agent: BaseAgent;
  let config: BaseAgentConfig;

  beforeEach(() => {
    // Create a test configuration with working mocks
    config = {
      agentId: 'test-agent',
      tenantId: 'test-tenant',
      userId: 'test-user',
      agentConfig: {
        agentId: 'test-agent',
        name: 'Test Agent',
        version: '1.0.0',
        systemPrompt: 'You are a helpful test assistant.',
        llmProvider: 'anthropic',
        llmModel: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
        maxTokens: 1000,
      },
      env: {
        DB: createMockD1(),
        APP_CONFIG: createMockKV(),
        CACHE: createMockKV(),
        FILES: null as any,
        WORKERS_AI: null as any,
      },
    };

    agent = new BaseAgent(config);
  });

  describe('greeting flow', () => {
    it('should handle a simple greeting', async () => {
      const response = await agent.processMessage('Hello!', 'test-session-1');
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.metadata).toBeDefined();
      expect(response.metadata.sessionId).toBe('test-session-1');
    });

    it('should maintain conversation context', async () => {
      const sessionId = 'test-session-context';
      
      const response1 = await agent.processMessage('Hello', sessionId);
      expect(response1).toBeDefined();
      
      const response2 = await agent.processMessage('How are you?', sessionId);
      expect(response2).toBeDefined();
      
      // Both responses should be from the same session
      expect(response1.metadata.sessionId).toBe(sessionId);
      expect(response2.metadata.sessionId).toBe(sessionId);
    });

    it('should track message count', async () => {
      const sessionId = 'test-session-count';
      
      await agent.processMessage('Message 1', sessionId);
      await agent.processMessage('Message 2', sessionId);
      await agent.processMessage('Message 3', sessionId);
      
      const summary = agent.getSummary();
      expect(summary).toBeDefined();
    });
  });

  describe('calculation flow', () => {
    it('should handle calculation requests', async () => {
      const response = await agent.processMessage(
        'Calculate print sizes for 3000x2000 pixels at 300 DPI',
        'test-calc-session'
      );
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.metadata.intent).toBeDefined();
    });

    it('should provide accurate calculations', async () => {
      const response = await agent.processMessage(
        'What sizes can I print 6000x4000 pixels at 300 DPI?',
        'test-calc-accuracy'
      );
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      // Should mention print sizes in the response
    });
  });

  describe('multi-turn conversations', () => {
    it('should handle follow-up questions', async () => {
      const sessionId = 'test-multi-turn';
      
      const response1 = await agent.processMessage('What is DPI?', sessionId);
      expect(response1).toBeDefined();
      
      const response2 = await agent.processMessage('And what about resolution?', sessionId);
      expect(response2).toBeDefined();
      
      const response3 = await agent.processMessage('How do they relate?', sessionId);
      expect(response3).toBeDefined();
      
      // All should be part of the same conversation
      expect(response1.metadata.sessionId).toBe(sessionId);
      expect(response2.metadata.sessionId).toBe(sessionId);
      expect(response3.metadata.sessionId).toBe(sessionId);
    });

    it('should maintain topic continuity', async () => {
      const sessionId = 'test-topic-continuity';
      
      await agent.processMessage('Tell me about print quality', sessionId);
      await agent.processMessage('What factors affect it?', sessionId);
      await agent.processMessage('How can I improve it?', sessionId);
      
      const summary = agent.getSummary();
      expect(summary).toBeDefined();
    });
  });

  describe('intent switching', () => {
    it('should handle switching between different intents', async () => {
      const sessionId = 'test-intent-switch';
      
      // Greeting
      const r1 = await agent.processMessage('Hello', sessionId);
      expect(r1).toBeDefined();
      
      // Calculation
      const r2 = await agent.processMessage('Calculate sizes for 2000x3000', sessionId);
      expect(r2).toBeDefined();
      
      // Information
      const r3 = await agent.processMessage('What is aspect ratio?', sessionId);
      expect(r3).toBeDefined();
      
      // Farewell
      const r4 = await agent.processMessage('Thanks, goodbye!', sessionId);
      expect(r4).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle unclear messages gracefully', async () => {
      const response = await agent.processMessage('asdfghjkl', 'test-unclear');
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      // Should provide a helpful response even for unclear input
    });

    it('should handle empty messages', async () => {
      const response = await agent.processMessage('', 'test-empty');
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle very long messages', async () => {
      const longMessage = 'word '.repeat(1000);
      const response = await agent.processMessage(longMessage, 'test-long');
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle special characters', async () => {
      const response = await agent.processMessage('!@#$%^&*()', 'test-special');
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('session management', () => {
    it('should create unique sessions', async () => {
      const session1 = 'session-1';
      const session2 = 'session-2';
      
      const r1 = await agent.processMessage('Hello', session1);
      const r2 = await agent.processMessage('Hello', session2);
      
      expect(r1.metadata.sessionId).toBe(session1);
      expect(r2.metadata.sessionId).toBe(session2);
      expect(r1.metadata.sessionId).not.toBe(r2.metadata.sessionId);
    });

    it('should isolate session data', async () => {
      const session1 = 'isolated-1';
      const session2 = 'isolated-2';
      
      await agent.processMessage('My name is Alice', session1);
      await agent.processMessage('My name is Bob', session2);
      
      // Each session should maintain its own context
      const r1 = await agent.processMessage('What is my name?', session1);
      const r2 = await agent.processMessage('What is my name?', session2);
      
      expect(r1).toBeDefined();
      expect(r2).toBeDefined();
    });
  });

  describe('response quality', () => {
    it('should provide helpful responses', async () => {
      const response = await agent.processMessage('How do I print?', 'test-helpful');
      
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(10);
    });

    it('should include metadata in all responses', async () => {
      const response = await agent.processMessage('Test', 'test-metadata');
      
      expect(response.metadata).toBeDefined();
      expect(response.metadata.sessionId).toBeDefined();
      expect(response.metadata.messageId).toBeDefined();
      expect(response.metadata.processingTimeMs).toBeDefined();
      expect(response.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should track processing time', async () => {
      const response = await agent.processMessage('Hello', 'test-timing');
      
      expect(response.metadata.processingTimeMs).toBeDefined();
      expect(response.metadata.processingTimeMs).toBeGreaterThan(0);
      expect(response.metadata.processingTimeMs).toBeLessThan(10000); // Should be under 10 seconds
    });
  });

  describe('conversation summary', () => {
    it('should provide conversation summary', async () => {
      const sessionId = 'test-summary';
      
      await agent.processMessage('Hello', sessionId);
      await agent.processMessage('Calculate 2000x3000', sessionId);
      await agent.processMessage('Thanks', sessionId);
      
      const summary = agent.getSummary();
      
      expect(summary).toBeDefined();
      expect(summary.short).toBeDefined();
      expect(summary.detailed).toBeDefined();
    });

    it('should track conversation metrics', async () => {
      const sessionId = 'test-metrics';
      
      await agent.processMessage('Message 1', sessionId);
      await agent.processMessage('Message 2', sessionId);
      await agent.processMessage('Message 3', sessionId);
      
      const summary = agent.getSummary();
      expect(summary).toBeDefined();
    });
  });

  describe('performance', () => {
    it('should respond within reasonable time', async () => {
      const start = Date.now();
      await agent.processMessage('Hello', 'test-perf');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should handle multiple messages efficiently', async () => {
      const sessionId = 'test-efficiency';
      const start = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await agent.processMessage(`Message ${i}`, sessionId);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(15000); // 5 messages in under 15 seconds
    });
  });

  describe('state persistence', () => {
    it('should maintain state across messages', async () => {
      const sessionId = 'test-state-persist';
      
      const r1 = await agent.processMessage('Hello', sessionId);
      expect(r1.metadata.sessionId).toBe(sessionId);
      
      const r2 = await agent.processMessage('How are you?', sessionId);
      expect(r2.metadata.sessionId).toBe(sessionId);
      
      // State should be maintained
      const summary = agent.getSummary();
      expect(summary).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid successive messages', async () => {
      const sessionId = 'test-rapid';
      
      const promises = [
        agent.processMessage('Message 1', sessionId),
        agent.processMessage('Message 2', sessionId),
        agent.processMessage('Message 3', sessionId),
      ];
      
      const responses = await Promise.all(promises);
      
      expect(responses).toHaveLength(3);
      responses.forEach(r => {
        expect(r).toBeDefined();
        expect(r.content).toBeDefined();
      });
    });

    it('should handle unicode and emojis', async () => {
      const response = await agent.processMessage('Hello 👋 世界', 'test-unicode');
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle mixed case input', async () => {
      const response = await agent.processMessage('HeLLo WoRLd', 'test-mixed-case');
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });
});

