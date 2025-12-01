/**
 * Dartmouth OS V2.0 - Tests
 * Basic tests for DartmouthOS core functionality
 */

import { DartmouthOS } from '../DartmouthOS';
import type { Env } from '../types';
import type { Agent, AgentRequest, AgentResponse, HealthCheckResult } from '../types';

// Mock environment
const mockEnv: Env = {
  DB: {} as D1Database,
  R2: {} as R2Bucket,
  KV: {} as KVNamespace,
  OPENAI_API_KEY: 'test-key',
  ANTHROPIC_API_KEY: 'test-key',
  ENVIRONMENT: 'development',
  JWT_SECRET: 'test-secret',
};

// Mock agent
const mockAgent: Agent = {
  id: 'test-agent',
  name: 'Test Agent',
  version: '1.0.0',
  description: 'Test agent for unit tests',
  capabilities: [],
  status: 'active',
  
  async processMessage(request: AgentRequest): Promise<AgentResponse> {
    return {
      content: `Echo: ${request.message}`,
      type: 'text',
      metadata: {
        timestamp: Date.now(),
        processingTime: 10,
      },
    };
  },
  
  async healthCheck(): Promise<HealthCheckResult> {
    return {
      agentId: 'test-agent',
      status: 'healthy',
      responseTime: 10,
      errorCount: 0,
      successCount: 100,
      lastCheck: Date.now(),
    };
  },
};

describe('DartmouthOS', () => {
  let dartmouth: DartmouthOS;

  beforeEach(() => {
    dartmouth = new DartmouthOS(mockEnv, {
      environment: 'development',
      enableHealthMonitoring: false, // Disable for tests
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await dartmouth.initialize();
      const status = dartmouth.getStatus();
      expect(status.initialized).toBe(true);
    });

    it('should not initialize twice', async () => {
      await dartmouth.initialize();
      await dartmouth.initialize(); // Should not throw
      const status = dartmouth.getStatus();
      expect(status.initialized).toBe(true);
    });
  });

  describe('Agent Registration', () => {
    beforeEach(async () => {
      await dartmouth.initialize();
    });

    it('should register an agent', () => {
      dartmouth.registerAgent(mockAgent);
      const registry = dartmouth.getAgentRegistry();
      expect(registry.has('test-agent')).toBe(true);
    });

    it('should get registered agent', () => {
      dartmouth.registerAgent(mockAgent);
      const registry = dartmouth.getAgentRegistry();
      const agent = registry.get('test-agent');
      expect(agent.id).toBe('test-agent');
      expect(agent.name).toBe('Test Agent');
    });

    it('should unregister an agent', () => {
      dartmouth.registerAgent(mockAgent);
      dartmouth.unregisterAgent('test-agent');
      const registry = dartmouth.getAgentRegistry();
      expect(registry.has('test-agent')).toBe(false);
    });

    it('should get all registered agents', () => {
      dartmouth.registerAgent(mockAgent);
      const registry = dartmouth.getAgentRegistry();
      const agents = registry.getAll();
      expect(agents.length).toBe(1);
      expect(agents[0].id).toBe('test-agent');
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      await dartmouth.initialize();
      dartmouth.registerAgent(mockAgent);
    });

    it('should get health monitor', () => {
      const healthMonitor = dartmouth.getHealthMonitor();
      expect(healthMonitor).toBeDefined();
    });

    it('should get health summary', () => {
      const healthMonitor = dartmouth.getHealthMonitor();
      const summary = healthMonitor.getHealthSummary();
      expect(summary.total).toBe(1);
    });

    it('should check agent health', async () => {
      const healthMonitor = dartmouth.getHealthMonitor();
      const healthCheck = await healthMonitor.checkAgent('test-agent');
      expect(healthCheck.agentId).toBe('test-agent');
      expect(healthCheck.status).toBe('healthy');
    });
  });

  describe('System Status', () => {
    beforeEach(async () => {
      await dartmouth.initialize();
      dartmouth.registerAgent(mockAgent);
    });

    it('should get system status', () => {
      const status = dartmouth.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.environment).toBe('development');
      expect(status.agents.total).toBe(1);
    });
  });

  describe('Shutdown', () => {
    it('should shutdown successfully', async () => {
      await dartmouth.initialize();
      await dartmouth.shutdown();
      const status = dartmouth.getStatus();
      expect(status.initialized).toBe(false);
    });
  });
});

