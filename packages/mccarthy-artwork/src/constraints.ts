/**
 * McCarthy Artwork Analyzer - Business Rule Constraints
 * 
 * Defines what the artwork agent CAN and CANNOT do.
 * These constraints are enforced by the Dartmouth Foundation's ConstraintValidator.
 */

import type { Constraint } from '../../worker/src/components/ConstraintValidator';

/**
 * Global constraints for McCarthy Artwork Analyzer
 */
export const ARTWORK_AGENT_CONSTRAINTS: Constraint[] = [
  // CONSTRAINT 1: No Pricing Information
  {
    id: 'no-pricing',
    type: 'forbidden_phrase',
    severity: 'critical',
    pattern: /\b(costs?|price|pricing|\$\d+|£\d+|€\d+|USD|GBP|EUR)\b/i,
    description: 'Cannot provide pricing information',
    suggestedResponse: "I focus on artwork technical requirements and can't provide pricing. For quotes and pricing information, please contact our sales team at sales@example.com or visit our pricing page.",
    escalateTo: 'sales'
  },

  // CONSTRAINT 2: No Discounts
  {
    id: 'no-discounts',
    type: 'forbidden_phrase',
    severity: 'critical',
    pattern: /\b(discount|promo code|coupon|sale|offer|deal|special|reduction|off|%\s*off)\b/i,
    description: 'Cannot offer discounts or promotional codes',
    suggestedResponse: "I can't provide discount information, but our sales team can help with current promotions and offers. Please contact them at sales@example.com or check our website for current deals.",
    escalateTo: 'sales'
  },

  // CONSTRAINT 3: No Refunds
  {
    id: 'no-refunds',
    type: 'forbidden_phrase',
    severity: 'critical',
    pattern: /\b(refund|money back|return|reimburse)\b/i,
    description: 'Cannot process refunds',
    suggestedResponse: "I can't process refunds or returns, but our customer service team can help. Please contact them at support@example.com or call our support line, and they'll assist you with your request.",
    escalateTo: 'customer_service_manager'
  },

  // CONSTRAINT 4: No Delivery Promises
  {
    id: 'no-delivery-dates',
    type: 'forbidden_phrase',
    severity: 'high',
    pattern: /\b(will arrive|ships? (on|by|in)|deliver(y|ed) (on|by|in)|guarantee.*\d+\s*(day|hour|week))\b/i,
    description: 'Cannot promise specific delivery dates',
    suggestedResponse: "For delivery timeframes, I recommend contacting our customer service team who can provide the most accurate shipping estimates for your order.",
    escalateTo: 'customer_service'
  },

  // CONSTRAINT 5: No Order Modifications
  {
    id: 'no-order-changes',
    type: 'forbidden_action',
    severity: 'critical',
    pattern: /\b(change.*order|modify.*order|cancel.*order|update.*order)\b/i,
    description: 'Cannot modify, cancel, or update orders',
    suggestedResponse: "I'm unable to modify orders directly, but I can connect you with our customer service team who can help with order changes.",
    escalateTo: 'customer_service'
  },

  // CONSTRAINT 6: Stay in Domain (Artwork/Printing)
  {
    id: 'stay-in-domain',
    type: 'required_response',
    severity: 'medium',
    pattern: /\b(politics|religion|medical|legal|financial advice|investment)\b/i,
    description: 'Must stay focused on artwork and printing topics',
    suggestedResponse: "I'm specifically designed to help with artwork preparation and printing questions. Is there anything about your artwork files or print specifications I can help you with?",
    escalateTo: null
  },

  // CONSTRAINT 7: No File Modifications
  {
    id: 'no-file-editing',
    type: 'forbidden_action',
    severity: 'medium',
    pattern: /\b(edit.*file|modify.*artwork|change.*design|fix.*image|create.*artwork)\b/i,
    description: 'Cannot directly edit or modify artwork files',
    suggestedResponse: "I can't directly edit files, but I can guide you through the changes you need to make. I can also recommend design services if you need professional help with artwork modifications.",
    escalateTo: null
  }
];

/**
 * Tenant-specific constraints (example)
 * These would be loaded from database per tenant
 */
export const getTenantConstraints = (tenantId: string): Constraint[] => {
  // In production, load from database
  // For now, return empty array
  return [];
};

/**
 * Agent-specific constraints (example)
 * These are additional constraints specific to this agent instance
 */
export const getAgentConstraints = (agentId: string): Constraint[] => {
  // In production, load from database
  // For now, return empty array
  return [];
};

