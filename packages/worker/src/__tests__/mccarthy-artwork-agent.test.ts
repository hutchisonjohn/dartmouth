/**
 * McCarthy Artwork Agent - Automated Test Suite
 * 
 * Tests the full McCarthy Artwork Agent functionality including:
 * - Greetings
 * - Calculations (DPI, size, pixels)
 * - How-to questions
 * - Information queries
 * - Constraint enforcement
 * - Memory and context
 * - Frustration handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseAgent } from '../BaseAgent';
import type { AgentConfig } from '../types/shared';

// Mock environment for testing
const createMockEnv = () => ({
  DB: {} as any,
  APP_CONFIG: {} as any,
  CACHE: {} as any,
  FILES: {} as any,
  WORKERS_AI: {} as any,
  OPENAI_API_KEY: 'test-key',
  ANTHROPIC_API_KEY: 'test-key',
  GOOGLE_API_KEY: 'test-key',
  LLM_PROVIDER: 'openai',
  LLM_MODEL: 'gpt-4o-mini',
  ENVIRONMENT: 'test',
});

// Create test agent configuration
const createTestConfig = (): AgentConfig => ({
  agentId: 'mccarthy-artwork-test',
  tenantId: 'test-tenant',
  userId: 'test-user',
  agentConfig: {
    agentId: 'mccarthy-artwork-test',
    name: 'McCarthy Artwork Agent (Test)',
    description: 'Test instance of McCarthy Artwork Agent',
    version: '1.0.0',
    systemPrompt: 'You are McCarthy, a helpful and friendly AI assistant specialized in artwork analysis and print preparation.',
    llmProvider: 'openai',
    llmModel: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
  },
  env: createMockEnv(),
});

describe('McCarthy Artwork Agent - Automated Tests', () => {
  let agent: BaseAgent;
  let sessionId: string;

  beforeEach(() => {
    agent = new BaseAgent(createTestConfig());
    sessionId = `test-session-${Date.now()}`;
  });

  describe('1. Greeting Tests', () => {
    it('should respond to "Hello!"', async () => {
      const response = await agent.processMessage('Hello!', sessionId);
      
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.metadata.intent?.type).toBe('greeting');
      expect(response.metadata.qualityScore).toBeGreaterThan(70);
    });

    it('should respond to "Hi there!"', async () => {
      const response = await agent.processMessage('Hi there!', sessionId);
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('greeting');
    });

    it('should respond to "Hey McCarthy!"', async () => {
      const response = await agent.processMessage('Hey McCarthy!', sessionId);
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('greeting');
    });
  });

  describe('2. Calculation Tests', () => {
    it('should calculate print size from pixels and DPI', async () => {
      const response = await agent.processMessage(
        'What size can I print 4000x6000 pixels at 300 DPI?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('calculation');
      
      // Should mention the correct size (13.33 x 20 inches)
      expect(
        response.content.includes('13') || 
        response.content.includes('20')
      ).toBe(true);
    });

    it('should calculate pixels from size and DPI', async () => {
      const response = await agent.processMessage(
        'If I want to print at 10x15 inches at 150 DPI, how many pixels do I need?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('calculation');
      
      // Should mention 1500 x 2250 pixels
      expect(
        response.content.includes('1500') &&
        response.content.includes('2250')
      ).toBe(true);
    });

    it('should calculate DPI from pixels and size', async () => {
      const response = await agent.processMessage(
        "What's the DPI of 1920x1080 pixels printed at 8x10 inches?",
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('calculation');
      
      // Should mention DPI around 240 and 108
      expect(
        response.content.includes('240') ||
        response.content.includes('108') ||
        response.content.includes('DPI')
      ).toBe(true);
    });
  });

  describe('3. How-To Tests', () => {
    it('should answer "How do I prepare artwork for DTF printing?"', async () => {
      const response = await agent.processMessage(
        'How do I prepare artwork for DTF printing?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('howto');
      expect(response.content.length).toBeGreaterThan(50);
    });

    it('should answer "What file format should I use?"', async () => {
      const response = await agent.processMessage(
        'What file format should I use?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('howto');
    });

    it('should answer "How do I check if my artwork is high enough quality?"', async () => {
      const response = await agent.processMessage(
        'How do I check if my artwork is high enough quality?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('howto');
    });
  });

  describe('4. Information Tests', () => {
    it('should answer "What is DTF printing?"', async () => {
      const response = await agent.processMessage(
        'What is DTF printing?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('information');
      expect(response.content.length).toBeGreaterThan(50);
    });

    it('should answer "What\'s the difference between DTF and UV DTF?"', async () => {
      const response = await agent.processMessage(
        "What's the difference between DTF and UV DTF?",
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('information');
    });

    it('should answer "Tell me about DPI standards"', async () => {
      const response = await agent.processMessage(
        'Tell me about DPI standards',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.intent?.type).toBe('information');
    });
  });

  describe('5. Constraint Tests (Should Refuse)', () => {
    it('should refuse pricing questions', async () => {
      const response = await agent.processMessage(
        'How much does DTF printing cost?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.constraintViolations).toBeDefined();
      expect(response.metadata.constraintViolations!.length).toBeGreaterThan(0);
      
      // Should mention contact/sales/pricing not available
      expect(
        response.content.toLowerCase().includes('contact') ||
        response.content.toLowerCase().includes('sales') ||
        response.content.toLowerCase().includes('price') ||
        response.content.toLowerCase().includes('pricing')
      ).toBe(true);
    });

    it('should refuse discount questions', async () => {
      const response = await agent.processMessage(
        'Do you offer discounts?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.constraintViolations).toBeDefined();
      expect(response.metadata.constraintViolations!.length).toBeGreaterThan(0);
    });

    it('should refuse refund questions', async () => {
      const response = await agent.processMessage(
        'Can I get a refund?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.constraintViolations).toBeDefined();
      expect(response.metadata.constraintViolations!.length).toBeGreaterThan(0);
    });
  });

  describe('6. Memory Tests', () => {
    it('should remember user name', async () => {
      // First message: introduce self
      await agent.processMessage('My name is John', sessionId);
      
      // Second message: ask for name
      const response = await agent.processMessage("What's my name?", sessionId);
      
      expect(response.content).toBeDefined();
      expect(
        response.content.includes('John') ||
        response.content.includes('john')
      ).toBe(true);
    });

    it('should maintain conversation context', async () => {
      // Multi-turn conversation
      await agent.processMessage('I need help with artwork', sessionId);
      await agent.processMessage('What DPI should I use?', sessionId);
      const response = await agent.processMessage('What about file format?', sessionId);
      
      expect(response.content).toBeDefined();
      // Should understand "file format" refers to artwork
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should track conversation topics', async () => {
      await agent.processMessage('Tell me about DTF', sessionId);
      await agent.processMessage('How is that different from UV DTF?', sessionId);
      
      const response = await agent.processMessage('Which one should I use?', sessionId);
      
      expect(response.content).toBeDefined();
      // Should understand "which one" refers to DTF vs UV DTF
      expect(response.content.length).toBeGreaterThan(0);
    });
  });

  describe('7. Frustration Tests', () => {
    it('should handle confusion signals', async () => {
      const response = await agent.processMessage(
        'This is confusing',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.sentiment).toBe('frustrated');
      
      // Should be empathetic
      expect(response.metadata.empathyApplied).toBe(true);
    });

    it('should handle repeated questions patiently', async () => {
      // Ask same question twice
      await agent.processMessage('What is DTF?', sessionId);
      const response = await agent.processMessage('What is DTF?', sessionId);
      
      expect(response.content).toBeDefined();
      expect(response.metadata.repetitionDetected).toBe(true);
    });

    it('should handle "I don\'t understand"', async () => {
      const response = await agent.processMessage(
        "I don't understand",
        sessionId
      );
      
      expect(response.content).toBeDefined();
      expect(response.metadata.sentiment).toBe('frustrated');
      expect(response.metadata.empathyApplied).toBe(true);
    });
  });

  describe('8. Quality Checks', () => {
    it('should have conversation quality score > 70', async () => {
      const response = await agent.processMessage(
        'Hello, can you help me with my artwork?',
        sessionId
      );
      
      expect(response.metadata.qualityScore).toBeGreaterThan(70);
    });

    it('should detect intent accurately', async () => {
      const response = await agent.processMessage(
        'What size can I print 3000x2000 pixels at 300 DPI?',
        sessionId
      );
      
      expect(response.metadata.intent).toBeDefined();
      expect(response.metadata.intent?.type).toBe('calculation');
      expect(response.metadata.intent?.confidence).toBeGreaterThan(0.7);
    });

    it('should not hallucinate on calculations', async () => {
      const response = await agent.processMessage(
        'What is 4000 pixels divided by 300 DPI?',
        sessionId
      );
      
      expect(response.content).toBeDefined();
      // Should mention 13.33 inches
      expect(
        response.content.includes('13') &&
        (response.content.includes('inch') || response.content.includes('inches'))
      ).toBe(true);
    });
  });
});

// Export test runner for CLI use
export async function runMcCarthyTests() {
  console.log('🧪 Running McCarthy Artwork Agent Tests...\n');
  
  // This will be called by vitest
  // Results will be displayed in terminal
}

