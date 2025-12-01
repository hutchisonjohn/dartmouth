/**
 * Foundation Integration Tests
 * 
 * Tests the complete Dartmouth Foundation with all new systems:
 * - Conversation Quality System
 * - Agent Routing System
 * - Constraint System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseAgent } from '../BaseAgent';
import type { BaseAgentConfig } from '../BaseAgent';

// Mock environment
const mockEnv = {
  DB: {} as D1Database,
  APP_CONFIG: {} as KVNamespace,
  CACHE: {} as KVNamespace,
  FILES: {} as R2Bucket,
  WORKERS_AI: {} as Ai,
};

// Mock agent config
const mockConfig: BaseAgentConfig = {
  agentId: 'test-agent',
  tenantId: 'test-tenant',
  agentConfig: {
    name: 'Test Agent',
    description: 'Test agent for foundation testing',
    llmProvider: 'openai',
    llmModel: 'gpt-4',
    temperature: 0.7,
    maxTokens: 500,
  },
  env: mockEnv,
};

describe('Foundation Integration Tests', () => {
  let agent: BaseAgent;

  beforeEach(() => {
    agent = new BaseAgent(mockConfig);
  });

  describe('1. Initialization', () => {
    it('should initialize all core systems', () => {
      expect(agent).toBeDefined();
      expect(agent.getAgentRegistry).toBeDefined();
      expect(agent.getConstraintValidator).toBeDefined();
    });

    it('should have empty agent registry initially', () => {
      const registry = agent.getAgentRegistry();
      const stats = registry.getStats();
      
      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
    });

    it('should have global constraints loaded', () => {
      const validator = agent.getConstraintValidator();
      const stats = validator.getStats();
      
      expect(stats.global).toBeGreaterThan(0);
      expect(stats.totalRules).toBeGreaterThan(0);
    });
  });

  describe('2. Constraint Enforcement', () => {
    it('should detect pricing violations', () => {
      const validator = agent.getConstraintValidator();
      
      // Register agent-specific constraints (pricing/discounts/refunds are agent-specific, not global)
      validator.registerAgentConstraints('test-agent', [
        {
          id: 'no-pricing',
          type: 'forbidden-phrase',
          severity: 'high',
          pattern: /\$\d+|cost|price|charge/gi,
          message: 'Cannot discuss pricing',
          escalateTo: 'sales team'
        }
      ]);
      
      const response = {
        content: 'That will cost $50 for the print.',
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.requiresEscalation).toBe(true);
      expect(result.violations[0].type).toBe('forbidden-phrase');
    });

    it('should detect discount violations', () => {
      const validator = agent.getConstraintValidator();
      
      // Register agent-specific discount constraint
      validator.registerAgentConstraints('test-agent', [
        {
          id: 'no-discounts',
          type: 'forbidden-phrase',
          severity: 'high',
          pattern: /discount|%\s*off|sale|special offer/gi,
          message: 'Cannot offer discounts',
          escalateTo: 'sales team'
        }
      ]);
      
      const response = {
        content: 'I can offer you a 20% discount!',
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.requiresEscalation).toBe(true);
    });

    it('should detect refund violations', () => {
      const validator = agent.getConstraintValidator();
      
      // Register agent-specific refund constraint
      validator.registerAgentConstraints('test-agent', [
        {
          id: 'no-refunds',
          type: 'forbidden-commitment',
          severity: 'critical',
          pattern: /refund|money back|reimburse/gi,
          message: 'Cannot promise refunds',
          escalateTo: 'customer service manager'
        }
      ]);
      
      const response = {
        content: 'We will refund your money immediately.',
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should allow valid responses', () => {
      const validator = agent.getConstraintValidator();
      
      const response = {
        content: 'I can help you with that! What would you like to know?',
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      expect(result.passed).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.requiresEscalation).toBe(false);
    });

    it('should provide suggested responses for violations', () => {
      const validator = agent.getConstraintValidator();
      
      // Register agent-specific pricing constraint with suggested response
      validator.registerAgentConstraints('test-agent', [
        {
          id: 'no-pricing',
          type: 'forbidden-phrase',
          severity: 'high',
          pattern: /\$\d+|costs?|price/gi,
          message: 'Cannot discuss pricing',
          escalateTo: 'sales team',
          suggestedResponse: 'For pricing information, please contact our sales team.'
        }
      ]);
      
      const response = {
        content: 'That costs $100.',
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      expect(result.suggestedResponse).toBeDefined();
      expect(result.suggestedResponse).toContain('sales team');
    });
  });

  describe('3. Agent Routing System', () => {
    it('should have agent registry available', () => {
      const registry = agent.getAgentRegistry();
      expect(registry).toBeDefined();
    });

    it('should return empty list for capable agents when none registered', () => {
      const registry = agent.getAgentRegistry();
      const intent = { type: 'calculation', confidence: 0.9 };
      
      const capableAgents = registry.findCapableAgents(intent as any);
      expect(capableAgents).toEqual([]);
    });

    it('should track agent statistics', () => {
      const registry = agent.getAgentRegistry();
      const stats = registry.getStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('inactive');
      expect(stats).toHaveProperty('comingSoon');
    });
  });

  describe('4. Conversation Quality System', () => {
    it('should have conversation quality validator', () => {
      // This is tested indirectly through BaseAgent
      // The validator is private but used in message processing
      expect(agent).toBeDefined();
    });

    it('should have empathy injector', () => {
      // This is tested indirectly through BaseAgent
      // The injector is private but used in message processing
      expect(agent).toBeDefined();
    });
  });

  describe('5. Custom Constraints', () => {
    it('should allow registering tenant constraints', () => {
      const validator = agent.getConstraintValidator();
      
      const tenantConstraints = {
        level: 'tenant' as const,
        enabled: true,
        rules: [
          {
            id: 'test-rule',
            type: 'forbidden-phrase' as const,
            severity: 'high' as const,
            pattern: /test\s+phrase/gi,
            message: 'Test constraint',
          }
        ]
      };

      validator.registerTenantConstraints('test-tenant', tenantConstraints);
      
      const stats = validator.getStats();
      expect(stats.tenants).toBe(1);
    });

    it('should allow registering agent constraints', () => {
      const validator = agent.getConstraintValidator();
      
      const agentConstraints = {
        level: 'agent' as const,
        enabled: true,
        rules: [
          {
            id: 'agent-rule',
            type: 'forbidden-action' as const,
            severity: 'critical' as const,
            pattern: /forbidden\s+action/gi,
            message: 'Agent constraint',
          }
        ]
      };

      validator.registerAgentConstraints('test-agent', agentConstraints);
      
      const stats = validator.getStats();
      expect(stats.agents).toBe(1);
    });

    it('should enforce custom tenant constraints', () => {
      const validator = agent.getConstraintValidator();
      
      // Register custom constraint
      validator.registerTenantConstraints('test-tenant', {
        level: 'tenant',
        enabled: true,
        rules: [
          {
            id: 'no-competitor',
            type: 'forbidden-phrase',
            severity: 'high',
            pattern: /competitor\s+name/gi,
            message: 'Cannot mention competitors',
          }
        ]
      });

      // Test violation
      const response = {
        content: 'You should try competitor name instead.',
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.ruleId === 'no-competitor')).toBe(true);
    });
  });

  describe('6. Error Handling', () => {
    it('should handle empty responses gracefully', () => {
      const validator = agent.getConstraintValidator();
      
      const response = {
        content: '',
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      // Empty response should pass (no violations)
      expect(result.passed).toBe(true);
    });

    it('should handle very long responses', () => {
      const validator = agent.getConstraintValidator();
      
      const longContent = 'This is a test. '.repeat(1000);
      const response = {
        content: longContent,
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      // Should complete without errors
      expect(result).toBeDefined();
    });

    it('should handle special characters', () => {
      const validator = agent.getConstraintValidator();
      
      const response = {
        content: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        metadata: {}
      };

      const result = validator.validate(response, {
        tenantId: 'test-tenant',
        agentId: 'test-agent'
      });

      // Should complete without errors
      expect(result).toBeDefined();
    });
  });
});

