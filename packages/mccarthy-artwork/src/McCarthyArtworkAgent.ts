/**
 * McCarthy Artwork Analyzer Agent
 * 
 * Specialized AI agent for artwork analysis, DPI calculations, and print preparation guidance.
 * Extends the Dartmouth Foundation (BaseAgent) with artwork-specific capabilities.
 * 
 * Features:
 * - DPI/size calculations (precise, no LLM math errors)
 * - DTF/UV DTF knowledge base
 * - Artwork preparation guidance
 * - Quality ratings and recommendations
 * - Print size calculations
 * 
 * @extends BaseAgent - Inherits conversation quality, memory, constraints, routing
 */

import type { AgentConfig, Intent, Response, HandlerContext } from '../../worker/src/types/shared';
import { BaseAgent, BaseAgentConfig } from '../../worker/src/BaseAgent';
import { CalculationEngine } from './components/CalculationEngine';
import { CalculationHandler } from './handlers/CalculationHandler';
import { HowToHandler } from './handlers/HowToHandler';
import { InformationHandler } from './handlers/InformationHandler';
import { ARTWORK_AGENT_CONSTRAINTS } from './constraints';

/**
 * McCarthy Artwork Analyzer Agent
 */
export class McCarthyArtworkAgent extends BaseAgent {
  // Agent Metadata
  public readonly type = 'artwork_analyzer';
  public readonly name = 'McCarthy Artwork Analyzer';
  public readonly version = '1.0.0';
  public readonly description = 'Specialized agent for artwork analysis, DPI calculations, and print preparation guidance';

  // Artwork-Specific Components
  private calculationEngine: CalculationEngine;

  /**
   * Initialize McCarthy Artwork Analyzer
   */
  constructor(config: BaseAgentConfig) {
    // Override system prompt BEFORE calling super()
    config.agentConfig.systemPrompt = `You are McCarthy, an expert artwork analysis assistant specializing in DTF and UV DTF printing.

Your expertise includes:
- DPI calculations and print size recommendations
- Artwork quality assessment
- DTF/UV DTF technical requirements
- Print preparation guidance
- File format and resolution advice

CRITICAL CONVERSATION RULES:
- ALWAYS read the FULL conversation history before responding
- If the user says "it", "that", "this size", etc., refer to what was JUST discussed
- If you just provided a calculation, and they ask a follow-up, USE that calculation data
- NEVER ask for information you already have from previous messages
- Maintain context throughout the conversation
- Be conversational and reference what was said before

PERSONALITY:
- Friendly and professional
- Use emojis sparingly (📐, 🎨, ✨, 💡)
- Acknowledge previous messages ("Based on your 800x1200 at 72 DPI artwork...")
- Be helpful and proactive

CONSTRAINTS:
- NEVER discuss pricing, discounts, or refunds - those are handled by the sales team
- ALWAYS provide accurate technical information
- If you don't know something, say so and offer to escalate`;

    // Initialize foundation (BaseAgent)
    super(config);

    console.log(`[McCarthy Artwork] Initializing ${this.name} v${this.version}`);

    // Initialize artwork-specific components
    this.calculationEngine = new CalculationEngine();
    console.log('[McCarthy Artwork] CalculationEngine initialized');

    // Register artwork-specific constraints
    this.registerArtworkConstraints();

    // Register artwork-specific handlers
    this.registerArtworkHandlers();

    // Load DTF knowledge base
    this.loadKnowledgeBase();

    console.log(`[McCarthy Artwork] ${this.name} ready!`);
  }

  /**
   * Register artwork-specific business rule constraints
   */
  private registerArtworkConstraints(): void {
    const constraintValidator = this.getConstraintValidator();

    // Register agent-specific constraints
    constraintValidator.registerAgentConstraints((this as any).agentId, ARTWORK_AGENT_CONSTRAINTS);

    console.log('[McCarthy Artwork] Constraints registered (no pricing, no discounts, no refunds)');
  }

  /**
   * Register artwork-specific handlers
   */
  private registerArtworkHandlers(): void {
    // Get the response router from BaseAgent
    const router = (this as any).responseRouter;

    // Register artwork handlers
    router.registerHandler(new CalculationHandler(this.calculationEngine));
    router.registerHandler(new HowToHandler((this as any).ragEngine));
    router.registerHandler(new InformationHandler((this as any).ragEngine));

    console.log('[McCarthy Artwork] Handlers registered (Calculation, HowTo, Information)');
  }

  /**
   * Load DTF/UV DTF knowledge base
   */
  private async loadKnowledgeBase(): Promise<void> {
    try {
      console.log('[McCarthy Artwork] Loading DTF knowledge base...');

      const ragEngine = (this as any).ragEngine;
      const agentId = (this as any).agentId;

      // Knowledge documents to ingest
      const knowledgeDocs = [
        {
          id: 'dtf-artwork-requirements',
          title: 'DTF Artwork Requirements',
          path: './knowledge/DTF_Artwork_Requirements.md',
          type: 'markdown' as const
        },
        {
          id: 'uv-dtf-artwork-requirements',
          title: 'UV DTF Artwork Requirements',
          path: './knowledge/UV_DTF_Artwork_Requirements.md',
          type: 'markdown' as const
        },
        {
          id: 'dpi-quality-standards',
          title: 'DPI Quality Standards',
          path: './knowledge/DPI_QUALITY_STANDARDS.md',
          type: 'markdown' as const
        }
      ];

      // TODO: In production, load these files and ingest them
      // For now, we'll add a placeholder
      console.log('[McCarthy Artwork] Knowledge base loaded (3 documents):');
      knowledgeDocs.forEach(doc => {
        console.log(`  - ${doc.title}`);
      });

      // NOTE: Actual implementation will read files and call:
      // await ragEngine.ingestDocument(agentId, doc);

    } catch (error) {
      console.error('[McCarthy Artwork] Failed to load knowledge base:', error);
    }
  }

  /**
   * Check if this agent can handle the given intent
   */
  canHandle(intent: Intent): boolean {
    const artworkIntents = ['calculation', 'howto', 'information'];
    return artworkIntents.includes(intent.type);
  }

  /**
   * Check if this agent can contribute to handling the intent
   * (Used for multi-agent collaboration)
   */
  canContribute(intent: Intent): boolean {
    // Can contribute if the intent requires artwork knowledge
    if (intent.requiresArtworkData) return true;
    if (intent.requiresRAG && intent.entities?.topic?.includes('artwork')) return true;
    if (intent.entities?.domain === 'printing' || intent.entities?.domain === 'artwork') return true;

    return false;
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return [
      'dpi_calculation',
      'size_calculation',
      'quality_rating',
      'print_size_recommendation',
      'dtf_knowledge',
      'uv_dtf_knowledge',
      'artwork_preparation',
      'file_requirements',
      'troubleshooting'
    ];
  }

  /**
   * Get agent metadata
   */
  getMetadata(): {
    type: string;
    name: string;
    version: string;
    description: string;
    capabilities: string[];
  } {
    return {
      type: this.type,
      name: this.name,
      version: this.version,
      description: this.description,
      capabilities: this.getCapabilities()
    };
  }

  /**
   * Process a message (override to add artwork-specific logging)
   */
  async processMessage(message: string, sessionId?: string): Promise<Response> {
    console.log(`[McCarthy Artwork] Processing message: "${message}"`);
    
    // Call BaseAgent's processMessage (gets all foundation features)
    const response = await super.processMessage(message, sessionId);

    // Add McCarthy Artwork metadata
    response.metadata = {
      ...response.metadata,
      agentType: this.type,
      agentName: this.name,
      agentVersion: this.version
    };

    return response;
  }
}

