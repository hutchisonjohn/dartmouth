/**
 * Customer Service Agent
 * 
 * Specialized AI agent for customer service inquiries.
 * Extends BaseAgent from Dartmouth OS.
 * 
 * Features:
 * - Handles order status, production status, invoice, and general inquiries
 * - Auto-escalates based on confidence, sentiment, VIP status
 * - Integrates with Shopify, PERP, TicketManager
 * - Supports auto-reply or draft-for-approval modes
 * 
 * Created: Nov 28, 2025
 */

import { BaseAgent } from '../../worker/src/BaseAgent';
import type { AgentRequest, AgentResponse } from '../../worker/src/types/shared';
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

// Import handlers
import { OrderStatusHandler } from './handlers/OrderStatusHandler';
import { ProductionStatusHandler } from './handlers/ProductionStatusHandler';
import { InvoiceHandler } from './handlers/InvoiceHandler';
import { GeneralInquiryHandler } from './handlers/GeneralInquiryHandler';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CustomerServiceConfig {
  db: D1Database;
  kv: KVNamespace;
  shopifyApiUrl: string;
  shopifyAccessToken: string;
  perpApiUrl: string;
  perpApiKey: string;
  gmailCredentials: GmailCredentials;
  aiResponseMode: 'auto' | 'draft'; // auto = send immediately, draft = save for approval
}

export interface EscalationReason {
  type: 'low_confidence' | 'angry_customer' | 'vip_critical' | 'refund_request' | 'complex_query';
  confidence?: number;
  sentiment?: string;
  details: string;
}

// ============================================================================
// CUSTOMER SERVICE AGENT
// ============================================================================

export class CustomerServiceAgent extends BaseAgent {
  private db: D1Database;
  private shopify: ShopifyIntegration;
  private perp: PERPIntegration;
  private ticketManager: TicketManager;
  private handoffProtocol: AgentHandoffProtocol;
  private analytics: AnalyticsService;
  private gmail: GmailIntegration;
  private aiResponseMode: 'auto' | 'draft';

  // Handlers
  private orderStatusHandler: OrderStatusHandler;
  private productionStatusHandler: ProductionStatusHandler;
  private invoiceHandler: InvoiceHandler;
  private generalInquiryHandler: GeneralInquiryHandler;

  constructor(config: CustomerServiceConfig) {
    // Validate config
    if (!config.db) throw new Error('[CustomerServiceAgent] Database is required');
    if (!config.kv) throw new Error('[CustomerServiceAgent] KV store is required');
    if (!config.shopifyApiUrl) throw new Error('[CustomerServiceAgent] Shopify API URL is required');
    if (!config.shopifyAccessToken) throw new Error('[CustomerServiceAgent] Shopify access token is required');
    if (!config.perpApiUrl) throw new Error('[CustomerServiceAgent] PERP API URL is required');
    if (!config.perpApiKey) throw new Error('[CustomerServiceAgent] PERP API key is required');
    if (!config.gmailCredentials) throw new Error('[CustomerServiceAgent] Gmail credentials are required');
    // Initialize BaseAgent
    super({
      id: 'customer-service-agent',
      name: 'Customer Service Agent',
      description: 'Handles customer service inquiries including order status, production updates, and general questions',
      capabilities: [
        'order_status',
        'production_status',
        'invoice_requests',
        'general_inquiries',
        'customer_support',
      ],
      constraints: [
        'Cannot process refunds without manager approval',
        'Cannot modify orders without customer confirmation',
        'Cannot share other customers\' information',
        'Must escalate angry customers to human agent',
        'Must escalate VIP customers with critical issues',
      ],
      personality: {
        tone: 'professional, friendly, helpful',
        style: 'Clear and concise, empathetic',
        guidelines: [
          'Always acknowledge customer frustration',
          'Provide specific timelines when available',
          'Offer proactive solutions',
          'End with "How else can I help?"',
        ],
      },
    });

    // Store config
    this.db = config.db;
    this.aiResponseMode = config.aiResponseMode;

    // Initialize Dartmouth OS services
    this.shopify = new ShopifyIntegration({
      apiUrl: config.shopifyApiUrl,
      accessToken: config.shopifyAccessToken,
      cache: config.kv,
    });

    this.perp = new PERPIntegration({
      apiUrl: config.perpApiUrl,
      apiKey: config.perpApiKey,
      cache: config.kv,
    });

    this.ticketManager = new TicketManager(config.db);
    this.handoffProtocol = new AgentHandoffProtocol(config.db);
    this.analytics = new AnalyticsService(config.db);
    this.gmail = new GmailIntegration(config.db, config.gmailCredentials);

    // Initialize handlers
    this.orderStatusHandler = new OrderStatusHandler(this.shopify, this.perp);
    this.productionStatusHandler = new ProductionStatusHandler(this.perp);
    this.invoiceHandler = new InvoiceHandler(this.perp);
    this.generalInquiryHandler = new GeneralInquiryHandler();

    console.log('[CustomerServiceAgent] Initialized');
  }

  // ==========================================================================
  // MAIN PROCESSING METHOD
  // ==========================================================================

  /**
   * Process customer service request
   */
  async processMessage(request: AgentRequest): Promise<AgentResponse> {
    console.log(`[CustomerServiceAgent] Processing message: ${request.message.substring(0, 50)}...`);

    try {
      // 1. Use BaseAgent to process (handles intent detection, memory, RAG, quality)
      const baseResponse = await super.processMessage(request);

      // 2. Get ticket context if available
      const ticket = await this.getTicketContext(request.conversationId);

      // 3. Check if we should escalate
      const escalation = this.shouldEscalate(baseResponse, ticket);
      if (escalation) {
        return await this.escalateToHuman(request, baseResponse, escalation);
      }

      // 4. Route to appropriate handler based on intent
      const handlerResponse = await this.routeToHandler(
        baseResponse.intent?.type || 'general',
        request,
        baseResponse
      );

      // 5. Enrich response with customer context
      const enrichedResponse = await this.enrichWithCustomerContext(
        handlerResponse,
        request.metadata?.customerEmail
      );

      // 6. Send response (auto-reply or draft)
      if (ticket && !escalation) {
        await this.sendResponse(ticket.ticket_id, enrichedResponse);
      }

      // 7. Log analytics
      await this.logInteraction(request, enrichedResponse, ticket);

      // 8. Return response
      return enrichedResponse;

    } catch (error) {
      console.error('[CustomerServiceAgent] Error processing message:', error);
      
      return {
        content: "I apologize, but I'm having trouble processing your request right now. Let me connect you with a human agent who can help you immediately.",
        confidence: 0.0,
        intent: { type: 'error', confidence: 1.0 },
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          escalated: true,
        },
      };
    }
  }

  // ==========================================================================
  // HANDLER ROUTING
  // ==========================================================================

  /**
   * Route to appropriate handler based on intent
   */
  private async routeToHandler(
    intentType: string,
    request: AgentRequest,
    baseResponse: AgentResponse
  ): Promise<AgentResponse> {
    console.log(`[CustomerServiceAgent] Routing to handler: ${intentType}`);

    switch (intentType) {
      case 'order_status':
        return await this.orderStatusHandler.handle(request, baseResponse);

      case 'production_status':
        return await this.productionStatusHandler.handle(request, baseResponse);

      case 'invoice_request':
        return await this.invoiceHandler.handle(request, baseResponse);

      case 'general':
      default:
        return await this.generalInquiryHandler.handle(request, baseResponse);
    }
  }

  // ==========================================================================
  // ESCALATION LOGIC
  // ==========================================================================

  /**
   * Determine if request should be escalated to human
   */
  private shouldEscalate(response: AgentResponse, ticket: any): EscalationReason | null {
    // 1. Low confidence
    if (response.confidence < 0.6) {
      return {
        type: 'low_confidence',
        confidence: response.confidence,
        details: `AI confidence too low: ${(response.confidence * 100).toFixed(0)}%`,
      };
    }

    // 2. Angry customer
    if (ticket?.sentiment === 'angry') {
      return {
        type: 'angry_customer',
        sentiment: ticket.sentiment,
        details: 'Customer is angry - requires human touch',
      };
    }

    // 3. VIP customer with critical issue
    if (ticket?.is_vip && ticket?.priority === 'urgent') {
      return {
        type: 'vip_critical',
        details: 'VIP customer with critical priority',
      };
    }

    // 4. Refund request
    if (response.intent?.type === 'refund_request') {
      return {
        type: 'refund_request',
        details: 'Refund requests require manager approval',
      };
    }

    // 5. Complex query (multiple intents)
    if (response.metadata?.multipleIntents) {
      return {
        type: 'complex_query',
        details: 'Query requires multiple specialized handlers',
      };
    }

    return null;
  }

  /**
   * Escalate to human agent
   */
  private async escalateToHuman(
    request: AgentRequest,
    response: AgentResponse,
    reason: EscalationReason
  ): Promise<AgentResponse> {
    console.log(`[CustomerServiceAgent] Escalating: ${reason.type}`);

    // Update ticket status
    const ticket = await this.getTicketContext(request.conversationId);
    if (ticket) {
      await this.ticketManager.escalateTicket(
        ticket.ticket_id,
        'ai-agent', // escalatedBy
        'human-agent', // escalatedTo
        `${reason.type}: ${reason.details}` // reason
      );
    }

    // Generate warm handoff message
    const handoffMessage = this.generateHandoffMessage(reason);

    return {
      content: handoffMessage,
      confidence: 1.0,
      intent: { type: 'escalation', confidence: 1.0 },
      metadata: {
        escalated: true,
        escalationReason: reason,
        requiresHuman: true,
      },
    };
  }

  /**
   * Generate warm handoff message
   */
  private generateHandoffMessage(reason: EscalationReason): string {
    switch (reason.type) {
      case 'angry_customer':
        return "I understand your frustration, and I want to make sure you get the best possible help. Let me connect you with one of our senior support specialists who can give your situation their full attention.";

      case 'vip_critical':
        return "As one of our valued VIP customers, I want to ensure you receive immediate assistance. I'm connecting you with our priority support team right now.";

      case 'refund_request':
        return "I understand you'd like to discuss a refund. Let me connect you with our customer service manager who can review your request and help find the best solution for you.";

      case 'complex_query':
        return "Your question involves several aspects of your order. To give you the most accurate information, let me connect you with a specialist who can address all your concerns comprehensively.";

      case 'low_confidence':
      default:
        return "To make sure I give you the most accurate information, let me connect you with one of our customer service specialists who can help you right away.";
    }
  }

  // ==========================================================================
  // CUSTOMER CONTEXT
  // ==========================================================================

  /**
   * Get ticket context
   */
  private async getTicketContext(conversationId: string): Promise<any> {
    try {
      // Find ticket by conversation ID
      const { results } = await this.db
        .prepare(`SELECT * FROM tickets WHERE conversation_id = ? LIMIT 1`)
        .bind(conversationId)
        .all();

      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('[CustomerServiceAgent] Error getting ticket context:', error);
      return null;
    }
  }

  /**
   * Enrich response with customer context
   */
  private async enrichWithCustomerContext(
    response: AgentResponse,
    customerEmail?: string
  ): Promise<AgentResponse> {
    if (!customerEmail) return response;

    try {
      // Get customer from Shopify
      const customer = await this.shopify.getCustomerByEmail(customerEmail);
      
      if (customer) {
        response.metadata = {
          ...response.metadata,
          customerContext: {
            customerId: customer.id,
            customerName: `${customer.first_name} ${customer.last_name}`,
            totalOrders: customer.orders_count,
            isVIP: customer.tags?.includes('VIP'),
          },
        };
      }
    } catch (error) {
      console.error('[CustomerServiceAgent] Error enriching customer context:', error);
    }

    return response;
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  /**
   * Log interaction for analytics
   */
  private async logInteraction(
    request: AgentRequest,
    response: AgentResponse,
    ticket: any
  ): Promise<void> {
    try {
      await this.analytics.trackEvent({
        type: 'agent_response',
        agentId: 'customer-service-agent',
        conversationId: request.conversationId,
        metadata: {
          intent: response.intent?.type,
          confidence: response.confidence,
          escalated: response.metadata?.escalated || false,
          ticketId: ticket?.ticket_id,
          responseLength: response.content.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[CustomerServiceAgent] Error logging analytics:', error);
    }
  }

  // ==========================================================================
  // AUTO-REPLY vs DRAFT MODE
  // ==========================================================================

  /**
   * Send response (auto-reply or draft based on config)
   */
  private async sendResponse(
    ticketId: string,
    response: AgentResponse
  ): Promise<void> {
    try {
      const ticket = await this.ticketManager.getTicket(ticketId);
      if (!ticket) {
        console.error(`[CustomerServiceAgent] Ticket not found: ${ticketId}`);
        return;
      }
      
      if (this.aiResponseMode === 'auto') {
        // Auto-send
        await this.gmail.sendEmail({
          to: ticket.customer_email,
          subject: `Re: ${ticket.subject}`,
          body: response.content,
          threadId: ticket.conversation_id,
        });

        console.log(`[CustomerServiceAgent] ✅ Auto-sent response for ticket ${ticket.ticket_number}`);
      } else {
        // Create draft for approval
        await this.gmail.createDraft({
          to: ticket.customer_email,
          subject: `Re: ${ticket.subject}`,
          body: response.content,
          threadId: ticket.conversation_id,
        });

        // Add internal note
        await this.ticketManager.addInternalNote(
          ticketId,
          'ai-agent', // userId
          `AI generated draft response (confidence: ${(response.confidence * 100).toFixed(0)}%)`
        );

        console.log(`[CustomerServiceAgent] ✅ Created draft for ticket ${ticket.ticket_number}`);
      }
    } catch (error) {
      console.error('[CustomerServiceAgent] Error sending response:', error);
    }
  }
}

