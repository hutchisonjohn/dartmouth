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
  KnowledgeService,
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
  shopifyApiUrl?: string;
  shopifyAccessToken?: string;
  perpApiUrl?: string;
  perpApiKey?: string;
  gmailCredentials?: GmailCredentials;
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
  private shopify?: ShopifyIntegration;
  private perp?: PERPIntegration;
  private ticketManager: TicketManager;
  private handoffProtocol: AgentHandoffProtocol;
  private analytics: AnalyticsService;
  private gmail?: GmailIntegration;
  private knowledgeService: KnowledgeService;
  
  // Customer Service specific config
  private aiResponseMode: 'auto' | 'draft';
  
  // Knowledge context (loaded dynamically)
  private knowledgeContext: string | null = null;

  /**
   * Initialize Customer Service Agent
   */
  constructor(config: CustomerServiceConfig) {
    // Integrations are now optional - they'll be initialized if credentials are provided
    // This allows the agent to handle general inquiries without requiring all integrations

    // Override system prompt BEFORE calling super()
    config.agentConfig.systemPrompt = `🎧 YOUR NAME IS MCCARTHY AI - You Are A Professional Customer Support AI

You are an expert customer service representative for DirectToFilm.com.au, an Australian company based in Australia.

**CRITICAL: ALWAYS USE AUSTRALIAN ENGLISH**
- Spell: colour (not color), favour (not favor), centre (not center), organisation (not organization)
- Say: "G'day", "Cheers", "No worries", "Happy to help"
- Use Australian terms: "postage" (not shipping), "enquiry" (not inquiry), "whilst" (not while)
- Date format: DD/MM/YYYY (e.g., 02/12/2025)
- Currency: AUD or $ (Australian dollars)

**YOUR CAPABILITIES:**
1. **Order Status** - Track orders, postage, delivery
2. **Production Status** - Check printing, artwork approval, production progress
3. **Invoice Information** - Provide payment details, balances, receipts
4. **General Support** - Answer questions, provide guidance, escalate when needed

**YOUR PERSONALITY:**
- Professional, friendly, and empathetic (with an Australian touch)
- Patient and understanding
- Proactive in offering solutions
- Clear and concise in communication
- Warm and approachable (like a helpful Aussie mate)

**RESPONSE GUIDELINES:**
- Always acknowledge customer frustration or concerns
- Provide specific information when available (order numbers, dates, tracking)
- Offer next steps or alternatives
- End with "How else can I help?" or "Let me know if you need anything else, mate!"
- Use Australian English spelling and terminology throughout
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
- ALWAYS use Australian English spelling and terminology

**COMMON SCENARIOS - EXAMPLES:**

**Scenario: Customer says "Thank you"**
Response: "You're very welcome! It's been our pleasure to help you. If you need anything else in the future, please don't hesitate to reach out. Cheers!"

**Scenario: "How do I order?"**
Response: "G'day! You can place an order directly on our website at directtofilm.com.au. Simply browse our products, add items to your cart, and checkout. If you need help finding a specific product or have questions about the ordering process, I'm here to help!"

**Scenario: "Where is my order?"**
Response: "I'd be happy to check on your order status for you! Could you please provide your order number? It should be in your confirmation email and starts with #. Once I have that, I can look up the current status and tracking information for you."

**Scenario: "I have a problem with my order"**
Response: "I'm sorry to hear you're experiencing an issue. I want to make sure we sort this out for you quickly. Could you please tell me more about the problem? Also, if you have your order number handy, that will help me look into this right away."

**TONE:**
Professional, empathetic, solution-oriented, and reassuring. Always maintain a helpful and positive attitude with a friendly Australian touch. Use Australian English exclusively.`;

    // Call BaseAgent constructor
    super(config);

    // Store Customer Service specific config
    this.aiResponseMode = config.aiResponseMode;

    // Initialize Dartmouth OS services (all optional)
    if (config.shopifyApiUrl && config.shopifyAccessToken) {
      this.shopify = new ShopifyIntegration({
        apiUrl: config.shopifyApiUrl,
        accessToken: config.shopifyAccessToken,
        cache: config.env.CACHE,
      });
      console.log('[CustomerServiceAgent] Shopify integration enabled');
    } else {
      console.log('[CustomerServiceAgent] Shopify integration disabled (no credentials)');
    }

    if (config.perpApiUrl && config.perpApiKey) {
      this.perp = new PERPIntegration({
        apiUrl: config.perpApiUrl,
        apiKey: config.perpApiKey,
        cache: config.env.CACHE,
      });
      console.log('[CustomerServiceAgent] PERP integration enabled');
    } else {
      console.log('[CustomerServiceAgent] PERP integration disabled (no credentials)');
    }

    this.ticketManager = new TicketManager(config.env.DB);
    this.handoffProtocol = new AgentHandoffProtocol(config.env.DB);
    this.analytics = new AnalyticsService(config.env.DB);
    // Initialize KnowledgeService with Vector RAG support
    this.knowledgeService = new KnowledgeService(
      config.env.DB,
      config.tenantId,
      config.env.VECTORIZE,      // Vectorize binding for semantic search
      config.env.OPENAI_API_KEY  // OpenAI key for embeddings
    );
    console.log('[CustomerServiceAgent] KnowledgeService initialized with Vector RAG support');
    
    if (config.gmailCredentials) {
      this.gmail = new GmailIntegration(config.env.DB, config.gmailCredentials);
      console.log('[CustomerServiceAgent] Gmail integration enabled');
    } else {
      console.log('[CustomerServiceAgent] Gmail integration disabled (no credentials)');
    }

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
    // Only register handlers if their required integrations are available
    
    if (this.shopify && this.perp) {
      router.registerHandler(new OrderStatusHandler(this.shopify, this.perp));
      console.log('[CustomerServiceAgent] OrderStatusHandler registered');
    } else {
      console.log('[CustomerServiceAgent] OrderStatusHandler skipped (Shopify/PERP not configured)');
    }
    
    if (this.perp) {
      router.registerHandler(new ProductionStatusHandler(this.perp));
      router.registerHandler(new InvoiceHandler(this.perp));
      console.log('[CustomerServiceAgent] ProductionStatusHandler and InvoiceHandler registered');
    } else {
      console.log('[CustomerServiceAgent] Production/Invoice handlers skipped (PERP not configured)');
    }
    
    // GeneralInquiryHandler always available (no integrations required)
    router.registerHandler(new GeneralInquiryHandler());
    console.log('[CustomerServiceAgent] GeneralInquiryHandler registered');

    console.log('[CustomerServiceAgent] Customer Service handlers registration complete');
  }

  /**
   * Override processMessage to add Customer Service specific logic
   * Now includes RAG knowledge, learning examples, and system message config
   */
  async processMessage(message: string, sessionId?: string, _context?: any): Promise<Response> {
    console.log(`[CustomerServiceAgent] Processing message: ${message.substring(0, 50)}...`);

    try {
      // STEP 1: Load knowledge context (RAG docs, learning examples, system message)
      console.log('[CustomerServiceAgent] Loading knowledge context...');
      const knowledge = await this.knowledgeService.getKnowledgeContext(message);
      
      // Store knowledge context for use in LLM generation
      this.knowledgeContext = knowledge.systemMessage;
      
      console.log(`[CustomerServiceAgent] Knowledge loaded:`);
      console.log(`  - System message: ${knowledge.systemMessage.length} chars`);
      console.log(`  - Learning examples: ${knowledge.learningExamples.length}`);
      console.log(`  - RAG documents: ${knowledge.ragDocuments.length}`);
      if (knowledge.ragDocuments.length > 0) {
        console.log(`  - RAG titles: ${knowledge.ragDocuments.map(d => d.title).join(', ')}`);
      }

      // STEP 2: Call parent processMessage (handles intent detection, routing, etc.)
      const response = await super.processMessage(message, sessionId);
      
      // STEP 3: Add metadata about knowledge used
      if (response.metadata) {
        response.metadata.knowledgeUsed = {
          learningExamples: knowledge.learningExamples.length,
          ragDocuments: knowledge.ragDocuments.map(d => d.title),
          systemMessageConfigured: true
        };
      }
      
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
   * Get the current knowledge context (for LLM prompt building)
   */
  getKnowledgeContext(): string | null {
    return this.knowledgeContext;
  }

  /**
   * Get the knowledge service (for external access)
   */
  getKnowledgeService(): KnowledgeService {
    return this.knowledgeService;
  }

  /**
   * Override shouldUseLLMFallback to ALWAYS use LLM for customer service
   * 
   * IMPORTANT: Customer Service Agent ALWAYS uses LLM for contextual, empathetic responses
   * We don't want robotic pattern-based responses for customer support
   */
  protected shouldUseLLMFallback(response: any, intent: any): boolean {
    console.log(`[CustomerServiceAgent] 🤖 ALWAYS using LLM for contextual customer service responses`);
    return true; // Always use LLM for customer service
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
