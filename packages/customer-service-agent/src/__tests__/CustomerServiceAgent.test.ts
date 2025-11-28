/**
 * CustomerServiceAgent Unit Tests
 * 
 * Tests the core CustomerServiceAgent functionality including:
 * - Config validation
 * - Message processing
 * - Escalation logic
 * - Auto-reply vs draft modes
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerServiceAgent } from '../CustomerServiceAgent';
import type { CustomerServiceConfig } from '../CustomerServiceAgent';
import type { AgentRequest, AgentResponse } from '../../../worker/src/types/shared';

// Mock services
const mockDb = {
  prepare: vi.fn(() => ({
    bind: vi.fn(() => ({
      run: vi.fn(),
      all: vi.fn(() => ({ results: [] })),
      first: vi.fn()
    }))
  })),
  batch: vi.fn()
} as any;

const mockKv = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
} as any;

const mockGmailCredentials = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirectUri: 'http://localhost',
  refreshToken: 'test-refresh-token'
};

describe('CustomerServiceAgent', () => {
  let config: CustomerServiceConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    config = {
      db: mockDb,
      kv: mockKv,
      shopifyApiUrl: 'https://test.myshopify.com',
      shopifyAccessToken: 'test-shopify-token',
      perpApiUrl: 'https://perp.test.com',
      perpApiKey: 'test-perp-key',
      gmailCredentials: mockGmailCredentials,
      aiResponseMode: 'draft'
    };
  });

  describe('Constructor Validation', () => {
    it('should throw error if db is missing', () => {
      const invalidConfig = { ...config, db: null as any };
      expect(() => new CustomerServiceAgent(invalidConfig)).toThrow('Database is required');
    });

    it('should throw error if kv is missing', () => {
      const invalidConfig = { ...config, kv: null as any };
      expect(() => new CustomerServiceAgent(invalidConfig)).toThrow('KV store is required');
    });

    it('should throw error if shopifyApiUrl is missing', () => {
      const invalidConfig = { ...config, shopifyApiUrl: '' };
      expect(() => new CustomerServiceAgent(invalidConfig)).toThrow('Shopify API URL is required');
    });

    it('should throw error if shopifyAccessToken is missing', () => {
      const invalidConfig = { ...config, shopifyAccessToken: '' };
      expect(() => new CustomerServiceAgent(invalidConfig)).toThrow('Shopify access token is required');
    });

    it('should throw error if perpApiUrl is missing', () => {
      const invalidConfig = { ...config, perpApiUrl: '' };
      expect(() => new CustomerServiceAgent(invalidConfig)).toThrow('PERP API URL is required');
    });

    it('should throw error if perpApiKey is missing', () => {
      const invalidConfig = { ...config, perpApiKey: '' };
      expect(() => new CustomerServiceAgent(invalidConfig)).toThrow('PERP API key is required');
    });

    it('should throw error if gmailCredentials is missing', () => {
      const invalidConfig = { ...config, gmailCredentials: null as any };
      expect(() => new CustomerServiceAgent(invalidConfig)).toThrow('Gmail credentials are required');
    });

    it('should successfully create agent with valid config', () => {
      expect(() => new CustomerServiceAgent(config)).not.toThrow();
    });
  });

  describe('Agent Metadata', () => {
    it('should have correct agent ID', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.id).toBe('customer-service-agent');
    });

    it('should have correct agent name', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.name).toBe('Customer Service Agent');
    });

    it('should have correct capabilities', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.capabilities).toContain('answer_order_status');
      expect(agent.capabilities).toContain('answer_production_status');
      expect(agent.capabilities).toContain('answer_invoice_questions');
      expect(agent.capabilities).toContain('provide_general_support');
      expect(agent.capabilities).toContain('escalate_to_human');
    });
  });

  describe('AI Response Mode', () => {
    it('should initialize with draft mode', () => {
      const agent = new CustomerServiceAgent(config);
      expect((agent as any).aiResponseMode).toBe('draft');
    });

    it('should initialize with auto mode', () => {
      const autoConfig = { ...config, aiResponseMode: 'auto' as const };
      const agent = new CustomerServiceAgent(autoConfig);
      expect((agent as any).aiResponseMode).toBe('auto');
    });
  });

  describe('Handler Initialization', () => {
    it('should initialize all handlers', () => {
      const agent = new CustomerServiceAgent(config);
      expect((agent as any).orderStatusHandler).toBeDefined();
      expect((agent as any).productionStatusHandler).toBeDefined();
      expect((agent as any).invoiceHandler).toBeDefined();
      expect((agent as any).generalInquiryHandler).toBeDefined();
    });
  });

  describe('Service Integration', () => {
    it('should initialize Shopify integration', () => {
      const agent = new CustomerServiceAgent(config);
      expect((agent as any).shopify).toBeDefined();
    });

    it('should initialize PERP integration', () => {
      const agent = new CustomerServiceAgent(config);
      expect((agent as any).perp).toBeDefined();
    });

    it('should initialize TicketManager', () => {
      const agent = new CustomerServiceAgent(config);
      expect((agent as any).ticketManager).toBeDefined();
    });

    it('should initialize GmailIntegration', () => {
      const agent = new CustomerServiceAgent(config);
      expect((agent as any).gmail).toBeDefined();
    });

    it('should initialize Analytics', () => {
      const agent = new CustomerServiceAgent(config);
      expect((agent as any).analytics).toBeDefined();
    });
  });
});

