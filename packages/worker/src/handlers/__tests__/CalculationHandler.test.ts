/**
 * CalculationHandler.test.ts
 * 
 * Unit tests for the CalculationHandler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CalculationHandler } from '../CalculationHandler';
import { CalculationEngine } from '../../components/CalculationEngine';
import { createMockHandlerContext, createMockIntent } from '../../__tests__/test-helpers';
import type { HandlerContext } from '../../types/shared';

describe('CalculationHandler', () => {
  let handler: CalculationHandler;
  let mockContext: HandlerContext;

  beforeEach(() => {
    handler = new CalculationHandler();
    mockContext = createMockHandlerContext({
      calculationEngine: new CalculationEngine(),
    });
  });

  describe('canHandle', () => {
    it('should handle calculation intents', () => {
      const intent = createMockIntent('calculation');
      const result = handler.canHandle(intent);
      expect(result).toBe(true);
    });

    it('should not handle non-calculation intents', () => {
      const intent = createMockIntent('greeting');
      const result = handler.canHandle(intent);
      expect(result).toBe(false);
    });
  });

  describe('handle', () => {
    it('should perform artwork calculations', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate print sizes for artwork 2000x3000 pixels at 300 DPI';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.metadata.calculationResult).toBeDefined();
    });

    it('should include calculation results in metadata', async () => {
      const intent = createMockIntent('calculation');
      const message = 'What sizes can I print 4000x6000 pixels at 300 DPI?';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response.metadata.calculationResult).toBeDefined();
      expect(response.metadata.calculationResult.pixels).toBeDefined();
      expect(response.metadata.calculationResult.dpi).toBe(300);
    });

    it('should handle different DPI values', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate for 2000x2000 pixels at 150 DPI';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response.metadata.calculationResult).toBeDefined();
      expect(response.metadata.calculationResult.dpi).toBe(150);
    });

    it('should provide quality assessments', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate print sizes for 3000x3000 pixels at 300 DPI';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response.metadata.calculationResult.quality).toBeDefined();
      expect(response.metadata.calculationResult.quality.optimal).toBeDefined();
      expect(response.metadata.calculationResult.quality.good).toBeDefined();
      expect(response.metadata.calculationResult.quality.poor).toBeDefined();
    });

    it('should calculate multiple print sizes', async () => {
      const intent = createMockIntent('calculation');
      const message = 'What print sizes for 6000x4000 pixels at 300 DPI?';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response.metadata.calculationResult.sizes).toBeDefined();
      expect(Object.keys(response.metadata.calculationResult.sizes).length).toBeGreaterThan(0);
    });

    it('should include handler metadata', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate for 1000x1000 at 72 DPI';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response.metadata.handlerName).toBe('CalculationHandler');
      expect(response.metadata.handlerVersion).toBe('1.0.0');
      expect(response.metadata.confidence).toBeGreaterThan(0.8);
    });

    it('should handle low DPI warnings', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate for 1000x1000 at 72 DPI';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response.metadata.calculationResult.dpi).toBe(72);
    });

    it('should handle high resolution images', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate for 10000x10000 pixels at 300 DPI';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response.metadata.calculationResult.pixels.total).toBe(100000000);
      expect(response.content).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle missing dimension information', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate print sizes';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle invalid dimensions gracefully', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate for -1000x2000 pixels';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle zero dimensions', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate for 0x0 pixels';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle extremely large dimensions', async () => {
      const intent = createMockIntent('calculation');
      const message = 'Calculate for 100000x100000 pixels at 300 DPI';
      const response = await handler.handle(message, intent, mockContext);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('CalculationEngine integration', () => {
    it('should use CalculationEngine for computations', async () => {
      const engine = new CalculationEngine();
      const result = engine.preCompute('test-artwork', 3000, 2000, 300);
      
      expect(result).toBeDefined();
      expect(result.pixels.width).toBe(3000);
      expect(result.pixels.height).toBe(2000);
      expect(result.dpi).toBe(300);
    });

    it('should calculate correct physical dimensions', async () => {
      const engine = new CalculationEngine();
      const result = engine.preCompute('test', 3000, 2000, 300);
      
      expect(result.sizes).toBeDefined();
    });

    it('should provide quality thresholds', async () => {
      const engine = new CalculationEngine();
      const result = engine.preCompute('test', 3000, 2000, 300);
      
      expect(result.quality.optimal).toBeDefined();
      expect(result.quality.good).toBeDefined();
      expect(result.quality.poor).toBeDefined();
    });
  });
});
