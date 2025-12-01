/**
 * CustomerServiceAgent Unit Tests
 * 
 * Tests the core CustomerServiceAgent functionality including:
 * - Proper BaseAgent extension
 * - Handler registration
 * - Service initialization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerServiceAgent } from '../CustomerServiceAgent';
import type { CustomerServiceConfig } from '../CustomerServiceAgent';

// Mock D1Database
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

// Mock KVNamespace
const mockKv = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  list: vi.fn()
} as any;

// Mock R2Bucket
const mockR2 = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
} as any;

// Mock Ai (Workers AI)
const mockAi = {
  run: vi.fn()
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
      agentId: 'customer-service-test',
      tenantId: 'test-tenant',
      userId: 'test-user',
      agentConfig: {
        agentId: 'customer-service-test',
        name: 'Customer Service Agent',
        description: 'Test agent',
        version: '1.0.0',
        systemPrompt: 'Test prompt',
        llmProvider: 'openai',
        llmModel: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000
      },
      env: {
        DB: mockDb,
        APP_CONFIG: mockKv,
        CACHE: mockKv,
        FILES: mockR2,
        WORKERS_AI: mockAi,
        OPENAI_API_KEY: 'test-openai-key'
      },
      shopifyApiUrl: 'https://test.myshopify.com',
      shopifyAccessToken: 'test-shopify-token',
      perpApiUrl: 'https://perp.test.com',
      perpApiKey: 'test-perp-key',
      gmailCredentials: mockGmailCredentials,
      aiResponseMode: 'draft'
    };
  });

  describe('Constructor Validation', () => {
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
    it('should have correct agent type', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.type).toBe('customer_service');
    });

    it('should have correct agent name', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.name).toBe('Customer Service Agent');
    });

    it('should have correct version', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.version).toBe('1.0.0');
    });
  });

  describe('Service Initialization', () => {
    it('should initialize Shopify integration', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.getShopify()).toBeDefined();
    });

    it('should initialize PERP integration', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.getPerp()).toBeDefined();
    });

    it('should initialize TicketManager', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.getTicketManager()).toBeDefined();
    });

    it('should initialize GmailIntegration', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.getGmail()).toBeDefined();
    });

    it('should have correct AI response mode', () => {
      const agent = new CustomerServiceAgent(config);
      expect(agent.getAIResponseMode()).toBe('draft');
    });

    it('should support auto response mode', () => {
      const autoConfig = { ...config, aiResponseMode: 'auto' as const };
      const agent = new CustomerServiceAgent(autoConfig);
      expect(agent.getAIResponseMode()).toBe('auto');
    });
  });

  describe('Handler Registration', () => {
    it('should register handlers without errors', () => {
      // If this doesn't throw, handlers were registered successfully
      expect(() => new CustomerServiceAgent(config)).not.toThrow();
    });

    it('should initialize with BaseAgent foundation', () => {
      const agent = new CustomerServiceAgent(config);
      // Agent should have processMessage method from BaseAgent
      expect(typeof agent.processMessage).toBe('function');
    });
  });
});
