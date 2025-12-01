/**
 * LLMService.test.ts
 * 
 * Unit tests for the LLMService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LLMService } from '../LLMService';

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(() => {
    const mockApiKeys = {
      ANTHROPIC_API_KEY: 'test-anthropic-key',
      OPENAI_API_KEY: 'test-openai-key',
      GOOGLE_API_KEY: 'test-google-key',
    };

    service = new LLMService(mockApiKeys);
  });

  describe('initialization', () => {
    it('should initialize with API keys', () => {
      expect(service).toBeDefined();
    });

    it('should accept minimal API keys', () => {
      const minimalService = new LLMService({ ANTHROPIC_API_KEY: 'test-key' });
      expect(minimalService).toBeDefined();
    });

    it('should accept multiple API keys', () => {
      const multiService = new LLMService({
        ANTHROPIC_API_KEY: 'key1',
        OPENAI_API_KEY: 'key2',
        GOOGLE_API_KEY: 'key3',
      });
      expect(multiService).toBeDefined();
    });
  });

  describe('token counting', () => {
    it('should estimate tokens for short text', () => {
      const text = 'Hello world';
      const tokens = service.estimateTokens(text);
      
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(10);
    });

    it('should estimate tokens for long text', () => {
      const text = 'word '.repeat(1000);
      const tokens = service.estimateTokens(text);
      
      expect(tokens).toBeGreaterThan(500);
    });

    it('should handle empty text', () => {
      const tokens = service.estimateTokens('');
      expect(tokens).toBe(0);
    });

    it('should handle special characters', () => {
      const text = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const tokens = service.estimateTokens(text);
      
      expect(tokens).toBeGreaterThan(0);
    });

    it('should handle unicode characters', () => {
      const text = 'Hello 世界 🌍';
      const tokens = service.estimateTokens(text);
      
      expect(tokens).toBeGreaterThan(0);
    });
  });

  describe('configuration', () => {
    it('should work with different API key combinations', () => {
      const configs = [
        { ANTHROPIC_API_KEY: 'key1' },
        { OPENAI_API_KEY: 'key2' },
        { GOOGLE_API_KEY: 'key3' },
        { ANTHROPIC_API_KEY: 'key1', OPENAI_API_KEY: 'key2' },
      ];
      
      configs.forEach(config => {
        const testService = new LLMService(config);
        expect(testService).toBeDefined();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long prompts', () => {
      const longPrompt = 'word '.repeat(10000);
      const tokens = service.estimateTokens(longPrompt);
      
      expect(tokens).toBeGreaterThan(5000);
    });

    it('should handle special formatting in prompts', () => {
      const formattedPrompt = `
        # Heading
        - List item 1
        - List item 2
        
        **Bold text**
        *Italic text*
        
        \`code block\`
      `;
      
      const tokens = service.estimateTokens(formattedPrompt);
      expect(tokens).toBeGreaterThan(0);
    });

    it('should handle JSON in prompts', () => {
      const jsonPrompt = JSON.stringify({
        key: 'value',
        nested: { data: [1, 2, 3] },
      });
      
      const tokens = service.estimateTokens(jsonPrompt);
      expect(tokens).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('should estimate tokens quickly', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        service.estimateTokens('test message');
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('provider support', () => {
    it('should support Anthropic', () => {
      const anthropicService = new LLMService({ ANTHROPIC_API_KEY: 'test-key' });
      expect(anthropicService).toBeDefined();
    });

    it('should support OpenAI', () => {
      const openaiService = new LLMService({ OPENAI_API_KEY: 'test-key' });
      expect(openaiService).toBeDefined();
    });

    it('should support Google', () => {
      const googleService = new LLMService({ GOOGLE_API_KEY: 'test-key' });
      expect(googleService).toBeDefined();
    });
  });

  describe('token estimation accuracy', () => {
    it('should estimate similar tokens for similar text', () => {
      const text1 = 'Hello world';
      const text2 = 'Hello there';
      
      const tokens1 = service.estimateTokens(text1);
      const tokens2 = service.estimateTokens(text2);
      
      // Should be within 20% of each other
      const ratio = tokens1 / tokens2;
      expect(ratio).toBeGreaterThan(0.8);
      expect(ratio).toBeLessThan(1.2);
    });

    it('should scale with text length', () => {
      const short = 'Hello';
      const medium = 'Hello '.repeat(10);
      const long = 'Hello '.repeat(100);
      
      const tokensShort = service.estimateTokens(short);
      const tokensMedium = service.estimateTokens(medium);
      const tokensLong = service.estimateTokens(long);
      
      expect(tokensMedium).toBeGreaterThan(tokensShort);
      expect(tokensLong).toBeGreaterThan(tokensMedium);
    });
  });
});
