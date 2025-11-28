/**
 * OrderStatusHandler Unit Tests
 * 
 * Tests order status inquiry handling including:
 * - Order number extraction
 * - Shopify integration
 * - PERP integration
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderStatusHandler } from '../OrderStatusHandler';
import type { AgentRequest } from '../../../../worker/src/types/shared';

describe('OrderStatusHandler', () => {
  let handler: OrderStatusHandler;
  let mockShopify: any;
  let mockPerp: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Shopify
    mockShopify = {
      getOrder: vi.fn()
    };

    // Mock PERP
    mockPerp = {
      getProductionOrder: vi.fn(),
      getArtworkStatus: vi.fn()
    };

    handler = new OrderStatusHandler();
    (handler as any).shopify = mockShopify;
    (handler as any).perp = mockPerp;
  });

  describe('Handler Metadata', () => {
    it('should have correct handler ID', () => {
      expect(handler.id).toBe('order-status-handler');
    });

    it('should have correct handler name', () => {
      expect(handler.name).toBe('Order Status Handler');
    });

    it('should have correct description', () => {
      expect(handler.description).toContain('order status');
    });
  });

  describe('Order Number Extraction', () => {
    it('should extract order number with hash', async () => {
      const request: AgentRequest = {
        message: 'What is the status of order #12345?',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockResolvedValue({
        id: '12345',
        orderNumber: '12345',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled'
      });

      mockPerp.getProductionOrder.mockResolvedValue(null);
      mockPerp.getArtworkStatus.mockResolvedValue(null);

      const response = await handler.handle(request);
      
      expect(mockShopify.getOrder).toHaveBeenCalledWith('12345');
      expect(response.content).toContain('#12345');
    });

    it('should extract order number without hash', async () => {
      const request: AgentRequest = {
        message: 'Status of order 67890 please',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockResolvedValue({
        id: '67890',
        orderNumber: '67890',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled'
      });

      mockPerp.getProductionOrder.mockResolvedValue(null);
      mockPerp.getArtworkStatus.mockResolvedValue(null);

      const response = await handler.handle(request);
      
      expect(mockShopify.getOrder).toHaveBeenCalledWith('67890');
    });
  });

  describe('Shopify Integration', () => {
    it('should handle order found successfully', async () => {
      const request: AgentRequest = {
        message: 'Status of order #12345',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockResolvedValue({
        id: '12345',
        orderNumber: '12345',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        trackingNumber: 'TRACK123',
        trackingCompany: 'UPS',
        trackingUrl: 'https://ups.com/track/TRACK123'
      });

      mockPerp.getProductionOrder.mockResolvedValue(null);
      mockPerp.getArtworkStatus.mockResolvedValue(null);

      const response = await handler.handle(request);
      
      expect(response.content).toContain('paid');
      expect(response.content).toContain('fulfilled');
      expect(response.content).toContain('TRACK123');
      expect(response.confidence).toBeGreaterThan(0.8);
    });

    it('should handle order not found', async () => {
      const request: AgentRequest = {
        message: 'Status of order #99999',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockResolvedValue(null);

      const response = await handler.handle(request);
      
      expect(response.content).toContain('couldn\'t find');
      expect(response.content).toContain('99999');
      expect(response.confidence).toBeLessThan(0.9);
    });

    it('should handle Shopify API error gracefully', async () => {
      const request: AgentRequest = {
        message: 'Status of order #12345',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockRejectedValue(new Error('Shopify API down'));

      const response = await handler.handle(request);
      
      expect(response.content).toContain('trouble connecting');
      expect(response.content).toContain('order system');
      expect(response.confidence).toBe(0.3);
    });
  });

  describe('PERP Integration', () => {
    it('should include production status when available', async () => {
      const request: AgentRequest = {
        message: 'Status of order #12345',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockResolvedValue({
        id: '12345',
        orderNumber: '12345',
        financialStatus: 'paid',
        fulfillmentStatus: 'unfulfilled'
      });

      mockPerp.getProductionOrder.mockResolvedValue({
        orderNumber: '12345',
        status: 'printing',
        progress: 75,
        estimatedCompletion: '2025-12-01'
      });

      mockPerp.getArtworkStatus.mockResolvedValue(null);

      const response = await handler.handle(request);
      
      expect(response.content).toContain('printing');
      expect(response.content).toContain('75');
    });

    it('should include artwork status when available', async () => {
      const request: AgentRequest = {
        message: 'Status of order #12345',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockResolvedValue({
        id: '12345',
        orderNumber: '12345',
        financialStatus: 'paid',
        fulfillmentStatus: 'unfulfilled'
      });

      mockPerp.getProductionOrder.mockResolvedValue(null);

      mockPerp.getArtworkStatus.mockResolvedValue({
        orderNumber: '12345',
        status: 'approved',
        proofLink: 'https://proof.link/123'
      });

      const response = await handler.handle(request);
      
      expect(response.content).toContain('approved');
      expect(response.content).toContain('https://proof.link/123');
    });

    it('should handle PERP API error gracefully', async () => {
      const request: AgentRequest = {
        message: 'Status of order #12345',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockResolvedValue({
        id: '12345',
        orderNumber: '12345',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled'
      });

      mockPerp.getProductionOrder.mockRejectedValue(new Error('PERP API down'));
      mockPerp.getArtworkStatus.mockRejectedValue(new Error('PERP API down'));

      const response = await handler.handle(request);
      
      // Should still return order info from Shopify
      expect(response.content).toContain('paid');
      expect(response.content).toContain('fulfilled');
      expect(response.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing order number in message', async () => {
      const request: AgentRequest = {
        message: 'What is my order status?',
        conversationId: 'test-123',
        metadata: {}
      };

      const response = await handler.handle(request);
      
      expect(response.content).toContain('order number');
      expect(response.confidence).toBeLessThan(0.7);
    });

    it('should handle multiple order numbers in message', async () => {
      const request: AgentRequest = {
        message: 'Status of orders #12345 and #67890',
        conversationId: 'test-123',
        metadata: {}
      };

      mockShopify.getOrder.mockResolvedValue({
        id: '12345',
        orderNumber: '12345',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled'
      });

      mockPerp.getProductionOrder.mockResolvedValue(null);
      mockPerp.getArtworkStatus.mockResolvedValue(null);

      const response = await handler.handle(request);
      
      // Should use first order number
      expect(mockShopify.getOrder).toHaveBeenCalledWith('12345');
    });
  });
});

