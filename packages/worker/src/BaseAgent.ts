/**
 * BaseAgent - The Foundational AI Agent
 * 
 * Orchestrates all 10 core components to provide intelligent, context-aware conversations
 * with zero hallucination, true memory, and accurate calculations.
 * 
 * Architecture:
 * 1. Load/Create Session (ConversationStateManager)
 * 2. Detect Intent (IntentDetector)
 * 3. Check for Repetition (RepetitionDetector)
 * 4. Check for Frustration (FrustrationHandler)
 * 5. Route to Handler (ResponseRouter)
 * 6. Validate Response (ResponseValidator)
 * 7. Store Memory (MemorySystem)
 * 8. Save Session (ConversationStateManager)
 * 9. Return Response
 * 
 * @implements Section 5.1 from AGENT_ARMY_SYSTEM.md
 */

import type { ConversationState, Response, Message, AgentConfig, HandlerContext } from './types/shared';
import { ConversationStateManager } from './components/ConversationStateManager';
import { IntentDetector } from './components/IntentDetector';
import { ResponseRouter } from './components/ResponseRouter';
import { ResponseValidator } from './components/ResponseValidator';
import { MemorySystem } from './components/MemorySystem';
import { RAGEngine } from './components/RAGEngine';
import { RepetitionDetector } from './components/RepetitionDetector';
import { FrustrationHandler } from './components/FrustrationHandler';
import { ConversationQualityValidator } from './components/ConversationQualityValidator';
import { EmpathyInjector } from './components/EmpathyInjector';
import { ConstraintValidator } from './components/ConstraintValidator';
import { AgentRegistry, AgentRouter, AgentOrchestrator, LLMService } from './services';
import { 
  GreetingHandler, 
  FallbackHandler, 
  RepeatHandler, 
  FrustrationHandlerImpl
} from './handlers';

/**
 * Environment bindings required by BaseAgent
 */
export interface BaseAgentEnv {
  DB: D1Database;
  APP_CONFIG: KVNamespace;
  CACHE: KVNamespace;
  FILES: R2Bucket;
  WORKERS_AI: Ai;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
}

/**
 * Configuration for BaseAgent initialization
 */
export interface BaseAgentConfig {
  agentId: string;
  tenantId: string;
  userId?: string;
  agentConfig: AgentConfig;
  env: BaseAgentEnv;
}

/**
 * BaseAgent - The foundational AI agent that orchestrates all components
 */
export class BaseAgent {
  // Core Components
  private stateManager: ConversationStateManager;
  private intentDetector: IntentDetector;
  private responseRouter: ResponseRouter;
  private responseValidator: ResponseValidator;
  private memorySystem: MemorySystem;
  private ragEngine: RAGEngine;
  private repetitionDetector: RepetitionDetector;
  private frustrationHandler: FrustrationHandler;
  
  // Conversation Quality System (THE HEART OF DARTMOUTH)
  private conversationQualityValidator: ConversationQualityValidator;
  private empathyInjector: EmpathyInjector;

  // Agent Routing System (MCCARTHY AGENT ORCHESTRATION)
  private agentRegistry: AgentRegistry;
  // @ts-ignore - Will be used in Phase 6 for McCarthy agents
  private _agentRouter: AgentRouter;
  private agentOrchestrator: AgentOrchestrator;

  // Constraint System (BUSINESS RULES ENFORCEMENT)
  private constraintValidator: ConstraintValidator;

  // LLM Service (CONVERSATION GENERATION)
  private llmService: LLMService | null = null;

  // Configuration
  private agentId: string;
  private tenantId: string;
  private userId?: string;
  private agentConfig: AgentConfig;
  private env: BaseAgentEnv;

  // Current conversation state
  private state: ConversationState | null = null;

  /**
   * Initialize a new BaseAgent instance
   */
  constructor(config: BaseAgentConfig) {
    this.agentId = config.agentId;
    this.tenantId = config.tenantId;
    this.userId = config.userId;
    this.agentConfig = config.agentConfig;
    this.env = config.env;

    // Initialize all components
    this.stateManager = new ConversationStateManager(config.env.APP_CONFIG, config.env.DB);
    this.intentDetector = new IntentDetector();
    this.responseRouter = new ResponseRouter();
    this.responseValidator = new ResponseValidator();
    this.memorySystem = new MemorySystem(config.env.APP_CONFIG, config.env.DB);
    this.ragEngine = new RAGEngine(config.env.DB, config.env.WORKERS_AI, config.env.CACHE);
    this.repetitionDetector = new RepetitionDetector();
    this.frustrationHandler = new FrustrationHandler();
    
    // Initialize Conversation Quality System (THE HEART OF DARTMOUTH)
    this.conversationQualityValidator = new ConversationQualityValidator();
    this.empathyInjector = new EmpathyInjector();

    // Initialize Agent Routing System (MCCARTHY AGENT ORCHESTRATION)
    this.agentRegistry = new AgentRegistry();
    this.agentOrchestrator = new AgentOrchestrator();
    this._agentRouter = new AgentRouter(this.agentRegistry, this.agentOrchestrator);

    // Initialize Constraint System (BUSINESS RULES ENFORCEMENT)
    this.constraintValidator = new ConstraintValidator();

    // Initialize LLM Service (CONVERSATION GENERATION)
    this.initializeLLMService();

    // Register all handlers
    this.registerHandlers();
    
    // Register McCarthy agents (will be populated in Phase 6)
    this.registerMcCarthyAgents();

    console.log(`[BaseAgent] Initialized for agent: ${this.agentId}, tenant: ${this.tenantId}`);
  }

  /**
   * Initialize LLM Service based on agent configuration
   */
  private initializeLLMService(): void {
    const provider = this.agentConfig.llmProvider;
    let apiKey: string | undefined;

    switch (provider) {
      case 'openai':
        apiKey = this.env.OPENAI_API_KEY;
        break;
      case 'anthropic':
        apiKey = this.env.ANTHROPIC_API_KEY;
        break;
      case 'google':
        apiKey = this.env.GOOGLE_API_KEY;
        break;
      default:
        console.warn(`[BaseAgent] Unknown LLM provider: ${provider}`);
        return;
    }

    if (!apiKey) {
      console.warn(`[BaseAgent] No API key found for ${provider}. LLM fallback will not be available.`);
      return;
    }

    this.llmService = new LLMService(
      provider,
      apiKey!,  // We already checked apiKey exists above
      this.agentConfig.llmModel
    );

    console.log(`[BaseAgent] LLM Service initialized: ${provider} (${this.agentConfig.llmModel})`);
  }

  /**
   * Register all handlers with the ResponseRouter
   * 
   * NOTE: Only foundation handlers are registered here.
   * Domain-specific handlers (calculation, howto, information) are now
   * part of specialized McCarthy agents.
   */
  private registerHandlers(): void {
    // Register foundation handlers only
    this.responseRouter.registerHandler(new GreetingHandler());
    this.responseRouter.registerHandler(new RepeatHandler());
    this.responseRouter.registerHandler(new FrustrationHandlerImpl());

    // Set fallback handler (catches all unhandled intents)
    this.responseRouter.setDefaultHandler(new FallbackHandler());

    console.log('[BaseAgent] Foundation handlers registered (greeting, repeat, frustration, fallback)');
  }

  /**
   * Register McCarthy agents
   * 
   * NOTE: This is where specialized agents are registered.
   * In Phase 6, we'll register the McCarthy Artwork Analyzer here.
   */
  private registerMcCarthyAgents(): void {
    // No McCarthy agents registered yet
    // Will be populated in Phase 6
    console.log('[BaseAgent] McCarthy agent registry initialized (0 agents registered)');
  }

  /**
   * Get agent registry (for external agent registration)
   */
  getAgentRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  /**
   * Get constraint validator (for external constraint registration)
   */
  getConstraintValidator(): ConstraintValidator {
    return this.constraintValidator;
  }

  /**
   * Process a user message and return an intelligent response
   * 
   * This is the main entry point for all conversations.
   * 
   * @param message The user's message
   * @param sessionId Optional session ID (creates new session if not provided)
   * @returns The agent's response
   */
  async processMessage(message: string, sessionId?: string): Promise<Response> {
    const startTime = Date.now();
    console.log(`[BaseAgent] Processing message: "${message.substring(0, 50)}..."`);

    try {
      // STEP 1: Load or Create Session
      // If no sessionId provided, try to reuse existing session from previous call
      const effectiveSessionId = sessionId || this.state?.sessionId;
      this.state = await this.loadOrCreateSession(effectiveSessionId);
      console.log(`[BaseAgent] Session loaded: ${this.state.sessionId}`);

      // STEP 2: Create Message Object
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: {}
      };

      // STEP 3: Detect Intent
      const intent = await this.intentDetector.detect(message, this.state);
      userMessage.intent = intent;
      console.log(`[BaseAgent] Intent detected: ${intent.type} (confidence: ${intent.confidence})`);

      // STEP 4: Add Message to State
      this.stateManager.addMessage(this.state, userMessage);

      // STEP 5: Check for Repetition
      const repetition = await this.repetitionDetector.detectQuestionRepetition(message, this.state);
      if (repetition.isRepetition) {
        console.log(`[BaseAgent] Repetition detected (count: ${repetition.count})`);
        this.state.isRepeatDetected = true;
        // Update intent to reflect repetition
        intent.type = 'repeat';
      }

      // STEP 6: Check for Frustration
      const frustrationLevel = await this.frustrationHandler.detectFrustrationLevel(message, this.state);
      if (frustrationLevel !== 'none') {
        console.log(`[BaseAgent] Frustration detected: ${frustrationLevel}`);
        this.state.isFrustrationDetected = true;
        // Only override intent for moderate/high/critical frustration
        // Mild frustration should not hijack the conversation
        if (frustrationLevel === 'moderate' || frustrationLevel === 'high' || frustrationLevel === 'critical') {
          intent.type = 'frustration';
          console.log(`[BaseAgent] Intent overridden to frustration (level: ${frustrationLevel})`);
        } else {
          console.log(`[BaseAgent] Mild frustration noted, but not overriding intent`);
        }
      }

      // STEP 7: Build Handler Context
      const context: HandlerContext = {
        state: this.state,
        agentConfig: this.agentConfig,
        env: this.env,
        stateManager: this.stateManager,
        memorySystem: this.memorySystem,
        ragEngine: this.ragEngine,
        frustrationHandler: this.frustrationHandler
      };

      // STEP 8: Route to Appropriate Handler
      let response = await this.responseRouter.route(message, intent, context);
      console.log(`[BaseAgent] Handler response generated (${response.content.length} chars)`);

      // STEP 8.5: LLM Fallback (if handler returned generic response and LLM is available)
      if (this.shouldUseLLMFallback(response, intent) && this.llmService) {
        console.log(`[BaseAgent] Using LLM fallback for better response`);
        response = await this.generateLLMResponse(message, intent, context);
      }

      // STEP 9: Add Empathy (THE HEART OF DARTMOUTH)
      const userSentiment = this.empathyInjector.detectSentiment(
        message,
        this.state.messages.map(m => m.content)
      );
      
      const empathyContext = {
        sentiment: userSentiment,
        isFirstMessage: this.state.messages.length === 1,
        hasIssue: intent.type === 'frustration' || intent.type === 'complaint',
        isUrgent: message.toLowerCase().includes('urgent') || message.toLowerCase().includes('asap'),
        conversationLength: this.state.messages.length
      };
      
      response.content = this.empathyInjector.addEmpathy(response.content, empathyContext);
      console.log(`[BaseAgent] Empathy added (sentiment: ${userSentiment})`);

      // STEP 10: Validate Conversation Quality (THE HEART OF DARTMOUTH)
      const qualityCheck = this.conversationQualityValidator.validate(response, {
        userMessage: message,
        conversationHistory: this.state.messages.map(m => m.content),
        providedData: response.metadata,
        userSentiment
      });
      
      if (!qualityCheck.passed) {
        console.warn(`[BaseAgent] Conversation quality check failed (score: ${qualityCheck.score}/100)`);
        console.warn(`[BaseAgent] Issues: ${qualityCheck.issues.map(i => i.message).join(', ')}`);
        
        // Log suggestions for improvement
        if (qualityCheck.suggestions.length > 0) {
          console.log(`[BaseAgent] Suggestions: ${qualityCheck.suggestions.join('; ')}`);
        }
        
        // For critical issues (hallucinations), force fallback
        const hasCritical = qualityCheck.issues.some(i => i.severity === 'critical');
        if (hasCritical) {
          response.content = "I want to make sure I give you accurate information. Could you rephrase your question so I can help you better?";
          console.log(`[BaseAgent] Critical quality issue - using safe fallback`);
        }
      } else {
        console.log(`[BaseAgent] Conversation quality passed (score: ${qualityCheck.score}/100)`);
      }

      // STEP 11: Validate Constraints (BUSINESS RULES ENFORCEMENT)
      const constraintCheck = this.constraintValidator.validate(response, {
        tenantId: this.tenantId,
        agentId: this.agentId,
        userMessage: message
      });

      if (!constraintCheck.passed) {
        console.warn(`[BaseAgent] Constraint validation failed (${constraintCheck.violations.length} violation(s))`);
        constraintCheck.violations.forEach(v => {
          console.warn(`  - ${v.type} (${v.severity}): ${v.message}`);
        });

        // If escalation required, use escalation response
        if (constraintCheck.requiresEscalation && constraintCheck.suggestedResponse) {
          response.content = constraintCheck.suggestedResponse;
          this.state.needsEscalation = true;
          console.log(`[BaseAgent] Escalation required to: ${constraintCheck.escalateTo}`);
        } else if (constraintCheck.suggestedResponse) {
          // Use suggested fix
          response.content = constraintCheck.suggestedResponse;
          console.log(`[BaseAgent] Applied constraint fix`);
        }
      } else {
        console.log(`[BaseAgent] Constraint validation passed`);
      }

      // STEP 12: Validate Response (Technical)
      const validation = await this.responseValidator.validate(response, message);
      if (!validation.isValid) {
        console.warn(`[BaseAgent] Response validation failed: ${validation.issues.join(', ')}`);
        
        // If validation fails, try to fix or use fallback
        if (validation.suggestedFix) {
          response.content = validation.suggestedFix;
          console.log(`[BaseAgent] Applied suggested fix`);
        } else {
          response.content = "I'm having trouble formulating a proper response. Could you rephrase your question?";
          console.log(`[BaseAgent] Using fallback response`);
        }
      }

      // STEP 13: Create Assistant Message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        intent: intent,
        metadata: {
          ...response.metadata,
          validationPassed: validation.isValid,
          conversationQualityScore: qualityCheck.score,
          conversationQualityPassed: qualityCheck.passed,
          constraintsPassed: constraintCheck.passed,
          constraintViolations: constraintCheck.violations.length,
          needsEscalation: constraintCheck.requiresEscalation,
          userSentiment: userSentiment as string,
          processingTimeMs: Date.now() - startTime
        }
      };

      // STEP 14: Add Assistant Message to State
      this.stateManager.addMessage(this.state, assistantMessage);

      // STEP 15: Log Question and Answer
      this.stateManager.logQuestion(this.state, message, intent);
      this.stateManager.logAnswer(this.state, response.content, intent.type);

      // STEP 16: Store in Memory System
      await this.memorySystem.setShortTerm(this.state.sessionId, `msg_${assistantMessage.id}`, {
        question: message,
        answer: response.content,
        intent: intent.type,
        sentiment: userSentiment as string,
        qualityScore: qualityCheck.score,
        timestamp: new Date()
      });

      // STEP 17: Save Session State
      await this.stateManager.saveSession(this.state);
      console.log(`[BaseAgent] Session saved`);

      // STEP 18: Return Response
      const totalTime = Date.now() - startTime;
      console.log(`[BaseAgent] Message processed in ${totalTime}ms`);

      return {
        ...response,
        metadata: {
          ...response.metadata,
          sessionId: this.state.sessionId,
          messageId: assistantMessage.id,
          conversationQualityScore: qualityCheck.score,
          userSentiment,
          processingTimeMs: totalTime
        }
      };

    } catch (error) {
      console.error(`[BaseAgent] Error processing message:`, error);
      
      // Return error response
      return {
        content: "I apologize, but I encountered an error processing your message. Please try again.",
        metadata: {
          handlerName: 'error',
          handlerVersion: '1.0.0',
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          sessionId: this.state?.sessionId,
          processingTimeMs: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Load an existing session or create a new one
   */
  private async loadOrCreateSession(sessionId?: string): Promise<ConversationState> {
    if (sessionId) {
      // Try to load existing session
      const existingState = await this.stateManager.loadSession(sessionId);
      if (existingState) {
        console.log(`[BaseAgent] Loaded existing session: ${sessionId}`);
        return existingState;
      }
      // If sessionId was provided but not found, create a new session with that ID
      console.log(`[BaseAgent] Creating session with provided ID: ${sessionId}`);
      const newState = await this.stateManager.createSession(
        this.agentId,
        this.tenantId,
        this.userId,
        sessionId  // Pass the sessionId to use it
      );
      return newState;
    }

    // Create new session with auto-generated ID
    const newState = await this.stateManager.createSession(
      this.agentId,
      this.tenantId,
      this.userId
    );
    console.log(`[BaseAgent] Created new session: ${newState.sessionId}`);
    return newState;
  }

  /**
   * Get the current conversation state
   */
  getState(): ConversationState | null {
    return this.state;
  }

  /**
   * Get conversation history
   */
  getHistory(limit?: number): Message[] {
    if (!this.state) return [];
    return this.stateManager.getMessages(this.state, limit);
  }

  /**
   * Get conversation summary
   */
  getSummary(): { short: string; detailed: string } {
    if (!this.state) {
      return { short: 'No active conversation', detailed: 'No active conversation' };
    }
    const summary = this.stateManager.getConversationSummary(this.state);
    return { short: summary.short || '', detailed: summary.detailed || '' };
  }

  /**
   * Clear conversation history (useful for testing)
   */
  async clearSession(): Promise<void> {
    if (this.state) {
      await this.stateManager.deleteSession(this.state.sessionId);
      this.state = null;
      console.log(`[BaseAgent] Session cleared`);
    }
  }

  /**
   * Ingest a document into the RAG knowledge base
   */
  async ingestDocument(
    title: string,
    content: string
  ): Promise<void> {
    console.log(`[BaseAgent] Ingesting document: ${title}`);
    await this.ragEngine.ingestDocument(
      this.agentId,
      {
        id: crypto.randomUUID(),
        title,
        content,
        type: 'txt'
      }
    );
    console.log(`[BaseAgent] Document ingested successfully`);
  }

  /**
   * Search the knowledge base
   */
  async searchKnowledge(query: string, limit: number = 5): Promise<any> {
    console.log(`[BaseAgent] Searching knowledge base: "${query}"`);
    const results = await this.ragEngine.retrieve(query, this.agentId, limit);
    console.log(`[BaseAgent] Found results`);
    return results;
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    sessionId: string | null;
    messageCount: number;
    topicsDiscussed: string[];
    repetitionCount: number;
    isFrustrated: boolean;
  } {
    if (!this.state) {
      return {
        sessionId: null,
        messageCount: 0,
        topicsDiscussed: [],
        repetitionCount: 0,
        isFrustrated: false
      };
    }

    return {
      sessionId: this.state.sessionId,
      messageCount: this.state.messageCount,
      topicsDiscussed: this.stateManager.getTopicsDiscussed(this.state),
      repetitionCount: this.stateManager.getRepetitionCount(this.state),
      isFrustrated: this.state.isFrustrationDetected
    };
  }

  /**
   * Determine if we should use LLM fallback instead of handler response
   */
  private shouldUseLLMFallback(response: Response, intent: any): boolean {
    // Use LLM for fallback/unknown intents
    if (intent.type === 'unknown' || intent.type === 'information') {
      return true;
    }

    // Use LLM if handler returned a generic "I don't know" response
    const genericPhrases = [
      "i'm not sure",
      "i don't know",
      "i can't help",
      "i'm not quite sure",
      "could you rephrase"
    ];

    const lowerContent = response.content.toLowerCase();
    if (genericPhrases.some(phrase => lowerContent.includes(phrase))) {
      return true;
    }

    return false;
  }

  /**
   * Generate response using LLM
   */
  private async generateLLMResponse(
    _message: string,
    _intent: any,
    _context: HandlerContext
  ): Promise<Response> {
    if (!this.llmService) {
      throw new Error('LLM Service not initialized');
    }

    const startTime = Date.now();

    // Build system prompt with personality, context, and constraints
    const basePrompt = this.agentConfig.systemPrompt || 'You are a helpful AI assistant.';
    
    // Get active constraints
    const constraints: string[] = [];
    constraints.push('NEVER offer discounts or pricing without authorization');
    constraints.push('NEVER make promises you cannot keep');
    constraints.push('ALWAYS be honest if you don\'t know something');
    constraints.push('ALWAYS be concise - no more than 2-3 sentences unless asked for details');
    
    const systemPrompt = LLMService.buildSystemPrompt(
      basePrompt,
      this.state || undefined,
      constraints
    );

    // Prepare conversation history
    const conversationMessages = this.state?.messages || [];

    try {
      const llmResponse = await this.llmService.generate({
        messages: conversationMessages,
        systemPrompt,
        temperature: this.agentConfig.temperature,
        maxTokens: this.agentConfig.maxTokens
      });

      return {
        content: llmResponse.content,
        metadata: {
          handlerName: 'LLMFallback',
          handlerVersion: '1.0.0',
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0.8,
          llmModel: llmResponse.model,
          llmTokensUsed: llmResponse.tokensUsed,
          llmFinishReason: llmResponse.finishReason
        }
      };
    } catch (error) {
      console.error('[BaseAgent] LLM generation failed:', error);
      // Return a safe fallback
      return {
        content: "I'm having trouble processing that right now. Could you try rephrasing your question?",
        metadata: {
          handlerName: 'LLMFallback',
          handlerVersion: '1.0.0',
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0.3,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

