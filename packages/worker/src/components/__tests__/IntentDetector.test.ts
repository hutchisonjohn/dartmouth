/**
 * IntentDetector.test.ts
 * 
 * Unit tests for the IntentDetector component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IntentDetector } from '../IntentDetector';
import { createMockConversationState } from '../../__tests__/test-helpers';
import type { ConversationState } from '../../types/shared';

describe('IntentDetector', () => {
  let detector: IntentDetector;
  let mockState: ConversationState;

  beforeEach(() => {
    detector = new IntentDetector();
    mockState = createMockConversationState();
  });

  describe('greeting detection', () => {
    it('should detect "hello" as greeting', async () => {
      const intent = await detector.detect('hello', mockState);
      expect(intent.type).toBe('greeting');
      expect(intent.confidence).toBeGreaterThan(0.8);
    });

    it('should detect "hi" as greeting', async () => {
      const intent = await detector.detect('hi', mockState);
      expect(intent.type).toBe('greeting');
    });

    it('should detect "hey" as greeting', async () => {
      const intent = await detector.detect('hey there', mockState);
      expect(intent.type).toBe('greeting');
    });

    it('should detect "good morning" as greeting', async () => {
      const intent = await detector.detect('good morning', mockState);
      expect(intent.type).toBe('greeting');
    });

    it('should be case insensitive', async () => {
      const intent1 = await detector.detect('HELLO', mockState);
      const intent2 = await detector.detect('HeLLo', mockState);
      
      expect(intent1.type).toBe('greeting');
      expect(intent2.type).toBe('greeting');
    });
  });

  describe('farewell detection', () => {
    it('should detect "goodbye" as farewell', async () => {
      const intent = await detector.detect('goodbye', mockState);
      expect(intent.type).toBe('farewell');
    });

    it('should detect "bye" as farewell', async () => {
      const intent = await detector.detect('bye', mockState);
      expect(intent.type).toBe('farewell');
    });

    it('should detect "see you later" as farewell', async () => {
      const intent = await detector.detect('see you later', mockState);
      expect(intent.type).toBe('farewell');
    });

    it('should detect "thanks, bye" as farewell', async () => {
      const intent = await detector.detect('thanks, bye!', mockState);
      expect(intent.type).toBe('farewell');
    });
  });

  describe('calculation detection', () => {
    it('should detect calculation requests', async () => {
      const intent = await detector.detect('calculate print sizes for 2000x3000', mockState);
      expect(intent.type).toBe('calculation');
      expect(intent.requiresCalculation).toBe(true);
    });

    it('should detect "what size" questions', async () => {
      const intent = await detector.detect('what size can I print?', mockState);
      expect(intent.type).toBe('calculation');
    });

    it('should detect DPI-related questions', async () => {
      const intent = await detector.detect('what DPI do I need?', mockState);
      expect(intent.type).toBe('calculation');
    });

    it('should detect dimension queries', async () => {
      const intent = await detector.detect('how many pixels for 8x10 print?', mockState);
      expect(intent.type).toBe('calculation');
    });
  });

  describe('how-to detection', () => {
    it('should detect "how do I" questions', async () => {
      const intent = await detector.detect('how do I upload an image?', mockState);
      expect(intent.type).toBe('howto');
    });

    it('should detect "how to" questions', async () => {
      const intent = await detector.detect('how to create a print?', mockState);
      expect(intent.type).toBe('howto');
    });

    it('should detect "how can I" questions', async () => {
      const intent = await detector.detect('how can I change my settings?', mockState);
      expect(intent.type).toBe('howto');
    });

    it('should detect tutorial requests', async () => {
      const intent = await detector.detect('show me how to use this', mockState);
      expect(intent.type).toBe('howto');
    });
  });

  describe('information detection', () => {
    it('should detect "what is" questions', async () => {
      const intent = await detector.detect('what is DPI?', mockState);
      expect(intent.type).toBe('information');
    });

    it('should detect "tell me about" requests', async () => {
      const intent = await detector.detect('tell me about print quality', mockState);
      expect(intent.type).toBe('information');
    });

    it('should detect "explain" requests', async () => {
      const intent = await detector.detect('explain resolution to me', mockState);
      expect(intent.type).toBe('information');
    });

    it('should detect definition requests', async () => {
      const intent = await detector.detect('define aspect ratio', mockState);
      expect(intent.type).toBe('information');
    });
  });

  describe('frustration detection', () => {
    it('should detect frustrated messages', async () => {
      const intent = await detector.detect("this doesn't work!", mockState);
      expect(intent.type).toBe('frustration');
    });

    it('should detect angry messages', async () => {
      const intent = await detector.detect('this is terrible', mockState);
      expect(intent.type).toBe('frustration');
    });

    it('should detect confusion', async () => {
      const intent = await detector.detect("I don't understand this at all", mockState);
      expect(intent.type).toBe('frustration');
    });

    it('should detect help requests', async () => {
      const intent = await detector.detect('help! nothing is working', mockState);
      expect(intent.type).toBe('frustration');
    });
  });

  describe('repeat detection', () => {
    it('should detect repeat requests', async () => {
      const intent = await detector.detect('can you repeat that?', mockState);
      expect(intent.type).toBe('repeat');
    });

    it('should detect "say that again"', async () => {
      const intent = await detector.detect('say that again', mockState);
      expect(intent.type).toBe('repeat');
    });

    it('should detect "what did you say"', async () => {
      const intent = await detector.detect('what did you say?', mockState);
      expect(intent.type).toBe('repeat');
    });

    it('should detect "huh?"', async () => {
      const intent = await detector.detect('huh?', mockState);
      expect(intent.type).toBe('repeat');
    });
  });

  describe('follow-up detection', () => {
    it('should detect follow-up with conversation history', async () => {
      mockState.messages = [
        { id: '1', role: 'user', content: 'What is DPI?', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'DPI stands for...', timestamp: new Date() },
      ];
      
      const intent = await detector.detect('and what about resolution?', mockState);
      expect(intent.type).toBe('followup');
    });

    it('should detect "also" as follow-up indicator', async () => {
      mockState.messageCount = 2;
      const intent = await detector.detect('also, how do I print?', mockState);
      expect(intent.type).toBe('followup');
    });

    it('should detect "and" at start as follow-up', async () => {
      mockState.messageCount = 2;
      const intent = await detector.detect('and what about sizes?', mockState);
      expect(intent.type).toBe('followup');
    });
  });

  describe('unknown detection', () => {
    it('should return unknown for unclear messages', async () => {
      const intent = await detector.detect('asdfghjkl', mockState);
      expect(intent.type).toBe('unknown');
    });

    it('should return unknown for gibberish', async () => {
      const intent = await detector.detect('xyz 123 abc', mockState);
      expect(intent.type).toBe('unknown');
    });

    it('should have lower confidence for unknown', async () => {
      const intent = await detector.detect('random unclear message', mockState);
      if (intent.type === 'unknown') {
        expect(intent.confidence).toBeLessThan(0.5);
      }
    });
  });

  describe('confidence scoring', () => {
    it('should return confidence between 0 and 1', async () => {
      const intent = await detector.detect('hello', mockState);
      expect(intent.confidence).toBeGreaterThanOrEqual(0);
      expect(intent.confidence).toBeLessThanOrEqual(1);
    });

    it('should have high confidence for clear intents', async () => {
      const intent = await detector.detect('hello there', mockState);
      expect(intent.confidence).toBeGreaterThan(0.8);
    });

    it('should have lower confidence for ambiguous messages', async () => {
      const intent = await detector.detect('maybe something', mockState);
      expect(intent.confidence).toBeLessThan(0.9);
    });
  });

  describe('entity extraction', () => {
    it('should extract entities from messages', async () => {
      const intent = await detector.detect('calculate for 2000x3000 pixels at 300 DPI', mockState);
      expect(intent.entities).toBeDefined();
    });

    it('should identify calculation requirements', async () => {
      const intent = await detector.detect('what print sizes for my image?', mockState);
      if (intent.type === 'calculation') {
        expect(intent.requiresCalculation).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty messages', async () => {
      const intent = await detector.detect('', mockState);
      expect(intent).toBeDefined();
      expect(intent.type).toBeDefined();
    });

    it('should handle very long messages', async () => {
      const longMessage = 'hello '.repeat(1000);
      const intent = await detector.detect(longMessage, mockState);
      expect(intent).toBeDefined();
    });

    it('should handle special characters', async () => {
      const intent = await detector.detect('hello! @#$%^&*()', mockState);
      expect(intent).toBeDefined();
    });

    it('should handle emojis', async () => {
      const intent = await detector.detect('hello 👋 😊', mockState);
      expect(intent.type).toBe('greeting');
    });

    it('should handle multiple languages (basic)', async () => {
      const intent = await detector.detect('bonjour', mockState);
      expect(intent).toBeDefined();
      // May or may not detect as greeting depending on implementation
    });
  });

  describe('context awareness', () => {
    it('should consider conversation history', async () => {
      mockState.messages = [
        { id: '1', role: 'user', content: 'Calculate sizes', timestamp: new Date() },
      ];
      mockState.intentsDetected = [{ type: 'calculation', confidence: 0.9 }];
      
      const intent = await detector.detect('what about 8x10?', mockState);
      expect(intent).toBeDefined();
    });

    it('should track detected intents', async () => {
      await detector.detect('hello', mockState);
      await detector.detect('calculate sizes', mockState);
      
      // Intents should be tracked in state if implemented
      expect(mockState).toBeDefined();
    });
  });
});

