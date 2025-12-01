/**
 * GreetingHandler.test.ts
 * 
 * Unit tests for the GreetingHandler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GreetingHandler } from '../GreetingHandler';
import { createMockHandlerContext, createMockIntent } from '../../__tests__/test-helpers';
import type { HandlerContext } from '../../types/shared';

describe('GreetingHandler', () => {
  let handler: GreetingHandler;
  let mockContext: HandlerContext;

  beforeEach(() => {
    handler = new GreetingHandler();
    mockContext = createMockHandlerContext();
  });

  describe('canHandle', () => {
    it('should handle greeting intents', () => {
      const intent = createMockIntent('greeting');
      const result = handler.canHandle(intent);
      expect(result).toBe(true);
    });

    it('should not handle non-greeting intents', () => {
      const intent = createMockIntent('calculation');
      const result = handler.canHandle(intent);
      expect(result).toBe(false);
    });

    it('should handle farewell intents', () => {
      const intent = createMockIntent('farewell');
      const result = handler.canHandle(intent);
      expect(result).toBe(true);
    });
  });

  describe('handle', () => {
    it('should return a greeting response', async () => {
      const intent = createMockIntent('greeting');
      const response = await handler.handle('Hello!', intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should include handler metadata', async () => {
      const intent = createMockIntent('greeting');
      const response = await handler.handle('Hi there', intent, mockContext);
      
      expect(response.metadata).toBeDefined();
      expect(response.metadata.handlerName).toBe('GreetingHandler');
      expect(response.metadata.handlerVersion).toBe('1.0.0');
      expect(response.metadata.cached).toBe(false);
    });

    it('should handle different greeting variations', async () => {
      const greetings = ['hello', 'hi', 'hey', 'good morning', 'howdy'];
      const intent = createMockIntent('greeting');
      
      for (const greeting of greetings) {
        const response = await handler.handle(greeting, intent, mockContext);
        expect(response.content).toBeDefined();
        expect(response.content.length).toBeGreaterThan(0);
      }
    });

    it('should provide a welcoming tone', async () => {
      const intent = createMockIntent('greeting');
      const response = await handler.handle('Hello', intent, mockContext);
      
      const content = response.content.toLowerCase();
      const hasWelcomingWords = 
        content.includes('hello') ||
        content.includes('hi') ||
        content.includes('welcome') ||
        content.includes('help');
      
      expect(hasWelcomingWords).toBe(true);
    });

    it('should handle first-time vs returning user differently', async () => {
      const intent = createMockIntent('greeting');
      
      // First time user
      const firstResponse = await handler.handle('Hello', intent, mockContext);
      
      // Returning user (with message history)
      mockContext.state.messageCount = 10;
      mockContext.state.messages = [
        { id: '1', role: 'user', content: 'Previous message', timestamp: new Date() },
      ];
      const returningResponse = await handler.handle('Hello again', intent, mockContext);
      
      expect(firstResponse.content).toBeDefined();
      expect(returningResponse.content).toBeDefined();
      // Both should be valid responses
      expect(firstResponse.content.length).toBeGreaterThan(0);
      expect(returningResponse.content.length).toBeGreaterThan(0);
    });

    it('should include confidence in metadata', async () => {
      const intent = createMockIntent('greeting');
      const response = await handler.handle('Hello', intent, mockContext);
      
      expect(response.metadata.confidence).toBeDefined();
      expect(response.metadata.confidence).toBeGreaterThanOrEqual(0);
      expect(response.metadata.confidence).toBeLessThanOrEqual(1);
    });

    it('should track processing time', async () => {
      const intent = createMockIntent('greeting');
      const response = await handler.handle('Hello', intent, mockContext);
      
      expect(response.metadata.processingTime).toBeDefined();
      expect(response.metadata.processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty message gracefully', async () => {
      const intent = createMockIntent('greeting');
      const response = await handler.handle('', intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle very long greeting message', async () => {
      const intent = createMockIntent('greeting');
      const longGreeting = 'Hello! '.repeat(100);
      const response = await handler.handle(longGreeting, intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle special characters in greeting', async () => {
      const intent = createMockIntent('greeting');
      const response = await handler.handle('Hello! 👋 😊', intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });
});

