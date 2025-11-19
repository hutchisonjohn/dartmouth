/**
 * Constraint Validator
 * 
 * Enforces business rules and constraints across all agents.
 * Prevents unauthorized actions, forbidden phrases, and ensures compliance.
 * 
 * Constraint Levels:
 * 1. Global - Apply to ALL agents
 * 2. Tenant - Apply to all agents for a specific customer
 * 3. Agent - Apply to a specific McCarthy agent
 */

import type { Response } from '../types/shared';

/**
 * Constraint types
 */
export type ConstraintType = 
  | 'forbidden-phrase'      // Words/phrases agent cannot say
  | 'forbidden-action'      // Actions agent cannot take
  | 'forbidden-commitment'  // Promises agent cannot make
  | 'required-response'     // Must-use phrases for certain situations
  | 'escalation-required';  // Must escalate to human

/**
 * Constraint severity
 */
export type ConstraintSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Constraint rule
 */
export interface ConstraintRule {
  id: string;
  type: ConstraintType;
  severity: ConstraintSeverity;
  pattern: string | RegExp;
  message: string;
  escalateTo?: string; // Who to escalate to if violated
  replacementText?: string; // Suggested replacement text
  suggestedResponse?: string; // Custom response for this constraint
  description?: string; // Human-readable description
}

/**
 * Constraint (alias for ConstraintRule for backward compatibility)
 */
export type Constraint = ConstraintRule;

/**
 * Constraint set (collection of rules)
 */
export interface ConstraintSet {
  level: 'global' | 'tenant' | 'agent';
  targetId?: string; // tenantId or agentId
  rules: ConstraintRule[];
  enabled: boolean;
}

/**
 * Constraint violation
 */
export interface ConstraintViolation {
  ruleId: string;
  type: ConstraintType;
  severity: ConstraintSeverity;
  message: string;
  matchedText: string;
  position: number;
  escalateTo?: string;
  replacementText?: string;
  suggestedResponse?: string; // Custom response for this violation
}

/**
 * Constraint validation result
 */
export interface ConstraintValidationResult {
  passed: boolean;
  violations: ConstraintViolation[];
  requiresEscalation: boolean;
  escalateTo?: string;
  suggestedResponse?: string;
}

/**
 * Constraint Validator
 * 
 * Validates responses against business constraints.
 */
export class ConstraintValidator {
  private globalConstraints: ConstraintSet;
  private tenantConstraints: Map<string, ConstraintSet> = new Map();
  private agentConstraints: Map<string, ConstraintSet> = new Map();

  constructor() {
    // Initialize with default global constraints
    this.globalConstraints = this.getDefaultGlobalConstraints();
  }

  /**
   * Check if user message is requesting something forbidden
   * (separate from validating agent responses)
   */
  checkUserIntent(
    userMessage: string,
    agentId?: string
  ): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    
    if (!agentId) return violations;
    
    const agentConstraints = this.agentConstraints.get(agentId);
    if (!agentConstraints || !agentConstraints.enabled) return violations;
    
    // Only check constraints that are about user REQUESTS (not agent responses)
    // These are constraints where we want to proactively respond
    const requestConstraints = agentConstraints.rules.filter(rule => 
      rule.id === 'no-refunds' || 
      rule.id === 'no-discounts' ||
      rule.id === 'no-pricing'
    );
    
    for (const rule of requestConstraints) {
      const violation = this.checkRule(rule, userMessage);
      if (violation) {
        violations.push(violation);
      }
    }
    
    return violations;
  }

  /**
   * Validate a response against all applicable constraints
   */
  validate(
    response: Response,
    context: {
      tenantId?: string;
      agentId?: string;
      userMessage?: string;
    }
  ): ConstraintValidationResult {
    const violations: ConstraintViolation[] = [];

    // STEP 0: Check if user message is requesting something forbidden
    if (context.userMessage && context.agentId) {
      const userIntentViolations = this.checkUserIntent(context.userMessage, context.agentId);
      if (userIntentViolations.length > 0) {
        console.log(`[ConstraintValidator] User requesting forbidden action: ${userIntentViolations[0].ruleId}`);
        violations.push(...userIntentViolations);
      }
    }

    // STEP 1: Check global constraints (always apply)
    const globalViolations = this.checkConstraintSet(
      this.globalConstraints,
      response.content
    );
    violations.push(...globalViolations);

    // STEP 2: Check tenant constraints (if tenant specified)
    if (context.tenantId) {
      const tenantConstraints = this.tenantConstraints.get(context.tenantId);
      if (tenantConstraints && tenantConstraints.enabled) {
        const tenantViolations = this.checkConstraintSet(
          tenantConstraints,
          response.content
        );
        violations.push(...tenantViolations);
      }
    }

    // STEP 3: Check agent constraints (if agent specified)
    if (context.agentId) {
      const agentConstraints = this.agentConstraints.get(context.agentId);
      if (agentConstraints && agentConstraints.enabled) {
        const agentViolations = this.checkConstraintSet(
          agentConstraints,
          response.content
        );
        violations.push(...agentViolations);
      }
    }

    // STEP 4: Determine if escalation is required
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const requiresEscalation = criticalViolations.length > 0 || 
                               violations.some(v => v.escalateTo !== undefined);

    // STEP 5: Build result
    const result: ConstraintValidationResult = {
      passed: violations.length === 0,
      violations,
      requiresEscalation,
      escalateTo: criticalViolations[0]?.escalateTo,
      suggestedResponse: this.generateSuggestedResponse(violations, response.content)
    };

    if (!result.passed) {
      console.warn(`[ConstraintValidator] ${violations.length} constraint violation(s) detected`);
      violations.forEach(v => {
        console.warn(`  - ${v.type}: ${v.message} (matched: "${v.matchedText}")`);
      });
    }

    return result;
  }

  /**
   * Check a constraint set against response content
   */
  private checkConstraintSet(
    constraintSet: ConstraintSet,
    content: string
  ): ConstraintViolation[] {
    if (!constraintSet.enabled) {
      return [];
    }

    const violations: ConstraintViolation[] = [];

    for (const rule of constraintSet.rules) {
      const violation = this.checkRule(rule, content);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  /**
   * Check a single constraint rule
   */
  private checkRule(rule: ConstraintRule, content: string): ConstraintViolation | null {
    const pattern = typeof rule.pattern === 'string' 
      ? new RegExp(rule.pattern, 'gi')
      : rule.pattern;

    const match = pattern.exec(content);

    if (match) {
      return {
        ruleId: rule.id,
        type: rule.type,
        severity: rule.severity,
        message: rule.message,
        matchedText: match[0],
        position: match.index,
        escalateTo: rule.escalateTo,
        replacementText: rule.replacementText,
        suggestedResponse: rule.suggestedResponse // Pass through custom response
      };
    }

    return null;
  }

  /**
   * Generate suggested response based on violations
   */
  private generateSuggestedResponse(
    violations: ConstraintViolation[],
    originalContent: string
  ): string | undefined {
    if (violations.length === 0) {
      return undefined;
    }

    // If we have critical violations, provide a safe fallback
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      const firstViolation = criticalViolations[0];
      
      // DEBUG: Log what we have
      console.log(`[ConstraintValidator] Critical violation: ${firstViolation.ruleId}`);
      console.log(`[ConstraintValidator] Has suggestedResponse: ${!!firstViolation.suggestedResponse}`);
      if (firstViolation.suggestedResponse) {
        console.log(`[ConstraintValidator] Using custom response: ${firstViolation.suggestedResponse.substring(0, 50)}...`);
      }
      
      // PRIORITY 1: Use custom suggestedResponse if provided
      if (firstViolation.suggestedResponse) {
        return firstViolation.suggestedResponse;
      }
      
      // PRIORITY 2: Generic escalation with contact
      const escalateTo = firstViolation.escalateTo;
      if (escalateTo) {
        console.log(`[ConstraintValidator] Using generic escalation template for: ${escalateTo}`);
        return `I'd like to connect you with ${escalateTo} who can better assist you with that. They'll be able to provide the specific information you need.`;
      }
      
      // PRIORITY 3: Generic fallback
      return "I want to make sure I give you accurate information. Let me connect you with someone who can help you with that.";
    }

    // Try to fix the response by replacing violations
    let fixedContent = originalContent;
    for (const violation of violations) {
      if (violation.replacementText) {
        fixedContent = fixedContent.replace(violation.matchedText, violation.replacementText);
      }
    }

    return fixedContent !== originalContent ? fixedContent : undefined;
  }

  /**
   * Register tenant-specific constraints
   */
  registerTenantConstraints(tenantId: string, constraints: ConstraintSet): void {
    constraints.level = 'tenant';
    constraints.targetId = tenantId;
    this.tenantConstraints.set(tenantId, constraints);
    console.log(`[ConstraintValidator] Registered tenant constraints for: ${tenantId}`);
  }

  /**
   * Register agent-specific constraints
   */
  registerAgentConstraints(agentId: string, constraints: ConstraintSet | Constraint[]): void {
    // If passed an array of constraints, wrap in ConstraintSet
    const constraintSet: ConstraintSet = Array.isArray(constraints)
      ? {
          level: 'agent',
          targetId: agentId,
          rules: constraints,
          enabled: true
        }
      : constraints;
    
    constraintSet.level = 'agent';
    constraintSet.targetId = agentId;
    this.agentConstraints.set(agentId, constraintSet);
    console.log(`[ConstraintValidator] Registered ${constraintSet.rules.length} agent constraints for: ${agentId}`);
  }

  /**
   * Get default global constraints
   */
  private getDefaultGlobalConstraints(): ConstraintSet {
    return {
      level: 'global',
      enabled: true,
      rules: [
        // FORBIDDEN PHRASES - Pricing
        {
          id: 'no-pricing',
          type: 'forbidden-phrase',
          severity: 'critical',
          pattern: /\$\d+|\d+\s*(dollars?|pounds?|euros?|gbp|usd|eur)|price\s+is|costs?\s+\d+/gi,
          message: 'Cannot quote specific prices',
          escalateTo: 'sales team',
          replacementText: 'our sales team can provide pricing information'
        },

        // FORBIDDEN COMMITMENTS - Discounts
        {
          id: 'no-discounts',
          type: 'forbidden-commitment',
          severity: 'critical',
          pattern: /\d+%\s+off|discount|special\s+offer|promotion|sale\s+price/gi,
          message: 'Cannot offer discounts or promotions',
          escalateTo: 'sales team'
        },

        // FORBIDDEN COMMITMENTS - Refunds
        {
          id: 'no-refunds',
          type: 'forbidden-commitment',
          severity: 'critical',
          pattern: /refund|money\s+back|reimburse|compensation/gi,
          message: 'Cannot promise refunds or compensation',
          escalateTo: 'customer service manager'
        },

        // FORBIDDEN COMMITMENTS - Delivery dates
        {
          id: 'no-delivery-dates',
          type: 'forbidden-commitment',
          severity: 'high',
          pattern: /will\s+arrive|delivery\s+by|ships?\s+on|guaranteed\s+delivery/gi,
          message: 'Cannot commit to specific delivery dates',
          escalateTo: 'fulfillment team',
          replacementText: 'our fulfillment team can provide delivery estimates'
        },

        // FORBIDDEN ACTIONS - Account modifications
        {
          id: 'no-account-changes',
          type: 'forbidden-action',
          severity: 'critical',
          pattern: /change\s+your\s+password|update\s+your\s+email|modify\s+your\s+account/gi,
          message: 'Cannot modify user accounts',
          escalateTo: 'account manager'
        },

        // FORBIDDEN PHRASES - Legal advice
        {
          id: 'no-legal-advice',
          type: 'forbidden-phrase',
          severity: 'critical',
          pattern: /legal\s+advice|you\s+should\s+sue|consult\s+a\s+lawyer|legal\s+rights/gi,
          message: 'Cannot provide legal advice',
          escalateTo: 'legal team'
        },

        // FORBIDDEN PHRASES - Medical advice
        {
          id: 'no-medical-advice',
          type: 'forbidden-phrase',
          severity: 'critical',
          pattern: /medical\s+advice|diagnosis|treatment|prescription|you\s+should\s+take/gi,
          message: 'Cannot provide medical advice',
          escalateTo: 'medical professional'
        }
      ]
    };
  }

  /**
   * Get constraint statistics
   */
  getStats(): {
    global: number;
    tenants: number;
    agents: number;
    totalRules: number;
  } {
    let totalRules = this.globalConstraints.rules.length;
    
    this.tenantConstraints.forEach(cs => {
      totalRules += cs.rules.length;
    });
    
    this.agentConstraints.forEach(cs => {
      totalRules += cs.rules.length;
    });

    return {
      global: this.globalConstraints.rules.length,
      tenants: this.tenantConstraints.size,
      agents: this.agentConstraints.size,
      totalRules
    };
  }
}

