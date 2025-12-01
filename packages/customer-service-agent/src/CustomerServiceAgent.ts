/**
 * Customer Service Agent
 * 
 * Specialized AI agent for customer service inquiries.
 * Extends BaseAgent from Dartmouth OS.
 * 
 * Features:
 * - Order status inquiries (Shopify integration)
 * - Production status updates (PERP integration)
 * - Invoice requests (PERP integration)
 * - General customer support
 * - Auto-escalation based on confidence, sentiment, VIP status
 * - Auto-reply or draft-for-approval modes
 * 
 * Created: Nov 28, 2025
 */

import { BaseAgent, BaseAgentConfig } from '../../worker/src/BaseAgent';
import type { Response } from '../../worker/src/types/shared';
import type { D1Database, KVNamespace } from '../../worker/src/types/shared';
import {
  ShopifyIntegration,
  PERPIntegration,
  TicketManager,
  AgentHandoffProtocol,
  AnalyticsService,
  GmailIntegration,
  type GmailCredentials,
} from '../../worker/src/services';
import { OrderStatusHandler } from './handlers/OrderStatusHandler';
import { ProductionStatusHandler } from './handlers/ProductionStatusHandler';
import { InvoiceHandler } from './handlers/InvoiceHandler';
import { GeneralInquiryHandler } from './handlers/GeneralInquiryHandler';

/**
 * Customer Service Agent configuration (extends BaseAgentConfig)
 */
export interface CustomerServiceConfig extends BaseAgentConfig {
  shopifyApiUrl: string;
  shopifyAccessToken: string;
  perpApiUrl: string;
  perpApiKey: string;
  gmailCredentials: GmailCredentials;
  aiResponseMode: 'auto' | 'draft';
}

/**
 * Customer Service Agent
 */
export class CustomerServiceAgent extends BaseAgent {
  // Agent Metadata
  public readonly type = 'customer_service';
  public readonly name = 'Customer Service Agent';
  public readonly version = '1.0.0';
  public readonly description = 'Specialized agent for customer service inquiries including order status, production updates, and general questions';

  // Dartmouth OS Services
  private shopify: ShopifyIntegration;
  private perp: PERPIntegration;
  private ticketManager: TicketManager;
  private handoffProtocol: AgentHandoffProtocol;
  private analytics: AnalyticsService;
  private gmail: GmailIntegration;
  
  // Customer Service specific config
  private aiResponseMode: 'auto' | 'draft';

  /**
   * Initialize Customer Service Agent
   */
  constructor(config: CustomerServiceConfig) {
    // Validate Customer Service specific config
    if (!config.shopifyApiUrl) throw new Error('[CustomerServiceAgent] Shopify API URL is required');
    if (!config.shopifyAccessToken) throw new Error('[CustomerServiceAgent] Shopify access token is required');
    if (!config.perpApiUrl) throw new Error('[CustomerServiceAgent] PERP API URL is required');
    if (!config.perpApiKey) throw new Error('[CustomerServiceAgent] PERP API key is required');
    if (!config.gmailCredentials) throw new Error('[CustomerServiceAgent] Gmail credentials are required');

    // Override system prompt BEFORE calling super()
    config.agentConfig.systemPrompt = `🎧 YOUR NAME IS CUSTOMER SERVICE AGENT - You Are A Professional Customer Support AI

You are an expert customer service representative with access to:
- Order management systems (Shopify)
- Production tracking (PERP)
- Invoice systems (PERP)
- Customer history and context

**YOUR CAPABILITIES:**
1. **Order Status** - Track orders, shipping, delivery
2. **Production Status** - Check printing, artwork approval, production progress
3. **Invoice Information** - Provide payment details, balances, receipts
4. **General Support** - Answer questions, provide guidance, escalate when needed

**YOUR PERSONALITY:**
- Professional, friendly, and empathetic
- Patient and understanding
- Proactive in offering solutions
- Clear and concise in communication

**RESPONSE GUIDELINES:**
- Always acknowledge customer frustration or concerns
- Provide specific information when available (order numbers, dates, tracking)
- Offer next steps or alternatives
- End with "How else can I help?" or similar
- Escalate to human agent when:
  * Customer is angry or frustrated
  * Issue is complex or sensitive
  * Refund or order modification requested
  * VIP customer with critical issue
  * Confidence in response is low (<60%)

**CONSTRAINTS:**
- NEVER process refunds without manager approval
- NEVER modify orders without customer confirmation
- NEVER share other customers' information
- NEVER make promises about timelines you're not certain of
- ALWAYS escalate angry customers to human agent
- ALWAYS escalate VIP customers with critical issues

**TONE:**
Professional, empathetic, solution-oriented, and reassuring.`;

    // Call BaseAgent constructor
    super(config);

    // Store Customer Service specific config
    this.aiResponseMode = config.aiResponseMode;

    // Initialize Dartmouth OS services
    this.shopify = new ShopifyIntegration({
      apiUrl: config.shopifyApiUrl,
      accessToken: config.shopifyAccessToken,
      cache: config.env.CACHE,
    });

    this.perp = new PERPIntegration({
      apiUrl: config.perpApiUrl,
      apiKey: config.perpApiKey,
      cache: config.env.CACHE,
    });

    this.ticketManager = new TicketManager(config.env.DB);
    this.handoffProtocol = new AgentHandoffProtocol(config.env.DB);
    this.analytics = new AnalyticsService(config.env.DB);
    this.gmail = new GmailIntegration(config.env.DB, config.gmailCredentials);

    // Register Customer Service handlers
    this.registerCustomerServiceHandlers();

    console.log('[CustomerServiceAgent] Initialized');
  }

  /**
   * Register Customer Service specific handlers
   */
  private registerCustomerServiceHandlers(): void {
    const router = this.getResponseRouter();

    // Register handlers in priority order (higher priority = checked first)
    router.registerHandler(new OrderStatusHandler(this.shopify, this.perp));
    router.registerHandler(new ProductionStatusHandler(this.perp));
    router.registerHandler(new InvoiceHandler(this.perp));
    router.registerHandler(new GeneralInquiryHandler());

    console.log('[CustomerServiceAgent] Customer Service handlers registered');
  }

  /**
   * Override processMessage to add Customer Service specific logic
   */
  async processMessage(message: string, sessionId?: string): Promise<Response> {
    console.log(`[CustomerServiceAgent] Processing message: ${message.substring(0, 50)}...`);

    try {
      // Call parent processMessage (handles intent detection, routing, RAG, memory, etc.)
      const response = await super.processMessage(message, sessionId);

      // Customer Service specific post-processing
      // (e.g., check if we should escalate, send email, create ticket, etc.)
      
      // For now, just return the response
      // TODO: Add escalation logic, ticket creation, email sending, etc.
      
      return response;

    } catch (error) {
      console.error('[CustomerServiceAgent] Error processing message:', error);
      
      return {
        content: "I apologize, but I'm having trouble processing your request right now. Let me connect you with a human agent who can help you immediately.",
        metadata: {
          handlerName: 'ErrorHandler',
          handlerVersion: '1.0.0',
          processingTime: 0,
          confidence: 0.0,
          error: error instanceof Error ? error.message : 'Unknown error',
          escalate: true
        }
      };
    }
  }

  /**
   * Get Shopify integration (for handlers)
   */
  getShopify(): ShopifyIntegration {
    return this.shopify;
  }

  /**
   * Get PERP integration (for handlers)
   */
  getPerp(): PERPIntegration {
    return this.perp;
  }

  /**
   * Get Ticket Manager (for handlers)
   */
  getTicketManager(): TicketManager {
    return this.ticketManager;
  }

  /**
   * Get Gmail Integration (for handlers)
   */
  getGmail(): GmailIntegration {
    return this.gmail;
  }

  /**
   * Get AI Response Mode
   */
  getAIResponseMode(): 'auto' | 'draft' {
    return this.aiResponseMode;
  }
}
