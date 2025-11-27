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
    type: 'forbidden-phrase',
    severity: 'critical',
    pattern: /\b(how much does|what does.*cost|what.*the cost|how much is|what.*the price|price for|\$\d+|£\d+|€\d+)\b/i,
    description: 'Cannot provide pricing information',
    suggestedResponse: "I focus on artwork technical requirements and can't provide pricing. For quotes and pricing information, please contact our sales team. Is there anything else I can help you with?",
    escalateTo: 'sales'
  },

  // CONSTRAINT 2: No Discounts
  {
    id: 'no-discounts',
    type: 'forbidden-phrase',
    severity: 'critical',
    pattern: /\b(give me.*discount|send.*discount|any discount|get.*discount|have.*discount|promo code|coupon code|\d+%\s*off|percent off)\b/i,
    description: 'Cannot offer discounts or promotional codes',
    suggestedResponse: "Unfortunately I don't have access to the latest information regarding discounts or sales offers. The best place to look would be on our website for the most up to date information. Is there anything else I can help you with?",
    escalateTo: 'sales'
  },

  // CONSTRAINT 3: No Refunds
  {
    id: 'no-refunds',
    type: 'forbidden-phrase',
    severity: 'critical',
    pattern: /\b(want.*refund|need.*refund|get.*refund|give.*refund|money back|process.*refund|request.*refund)\b/i,
    description: 'Cannot process refunds',
    suggestedResponse: "Unfortunately I'm not the best person to help assist you with this request. Please reach out to our friendly team via email and a member of staff will happily help you. Is there anything else I can help you with?",
    escalateTo: 'customer_service_manager'
  },

  // CONSTRAINT 4: No Delivery Promises
  {
    id: 'no-delivery-dates',
    type: 'forbidden-phrase',
    severity: 'high',
    pattern: /\b(will arrive|ships? (on|by|in)|deliver(y|ed) (on|by|in)|guarantee.*\d+\s*(day|hour|week))\b/i,
    description: 'Cannot promise specific delivery dates',
    suggestedResponse: "For delivery timeframes, I recommend contacting our customer service team who can provide the most accurate shipping estimates for your order.",
    escalateTo: 'customer_service'
  },

  // CONSTRAINT 5: No Order Modifications
  {
    id: 'no-order-changes',
    type: 'forbidden-action',
    severity: 'critical',
    pattern: /\b(change.*order|modify.*order|cancel.*order|update.*order)\b/i,
    description: 'Cannot modify, cancel, or update orders',
    suggestedResponse: "I'm unable to modify orders directly, but I can connect you with our customer service team who can help with order changes.",
    escalateTo: 'customer_service'
  },

  // CONSTRAINT 6: Stay in Domain (Artwork/Printing)
  {
    id: 'stay-in-domain',
    type: 'required-response',
    severity: 'medium',
    pattern: /\b(politics|religion|medical|legal|financial advice|investment)\b/i,
    description: 'Must stay focused on artwork and printing topics',
    suggestedResponse: "I'm specifically designed to help with artwork preparation and printing questions. Is there anything about your artwork files or print specifications I can help you with?",
    escalateTo: null
  },

  // CONSTRAINT 7: No File Modifications
  {
    id: 'no-file-editing',
    type: 'forbidden-action',
    severity: 'medium',
    pattern: /\b(edit.*file|modify.*artwork|change.*design|fix.*image|create.*artwork)\b/i,
    description: 'Cannot directly edit or modify artwork files',
    suggestedResponse: "I can't directly edit files, but I can guide you through the changes you need to make. I can also recommend design services if you need professional help with artwork modifications.",
    escalateTo: null
  },

  // CONSTRAINT 8: No Payment Information
  {
    id: 'no-payment-info',
    type: 'forbidden-phrase',
    severity: 'critical',
    pattern: /\b(payment method|pay with|accept.*payment|credit card|paypal|stripe|payment option)\b/i,
    description: 'Cannot provide payment method information',
    suggestedResponse: "For payment options and methods, please visit our website or contact our sales team. Is there anything about your artwork I can help you with?",
    escalateTo: 'sales'
  },

  // CONSTRAINT 9: No Order Tracking
  {
    id: 'no-order-tracking',
    type: 'forbidden-phrase',
    severity: 'critical',
    pattern: /\b(where.*my order|track.*order|order status|shipping status|delivery status|when.*arrive)\b/i,
    description: 'Cannot track orders',
    suggestedResponse: "For order tracking and status updates, please contact our customer service team who can provide real-time information about your order.",
    escalateTo: 'customer_service'
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

