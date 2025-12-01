/**
 * Dartmouth Agent Adapter
 * Adapts existing BaseAgent to work with Dartmouth OS V2.0 Agent interface
 */

import type { 
  Agent, 
  AgentRequest, 
  AgentResponse, 
  HealthCheckResult,
  AgentCapability,
  AgentStatus
} from '../../dartmouth-core/src/types';
import { BaseAgent, BaseAgentConfig } from './BaseAgent';

export class DartmouthAgentAdapter implements Agent {
  public id: string;
  public name: string;
  public version: string;
  public description: string;
  public capabilities: AgentCapability[];
  public status: AgentStatus;

  private baseAgent: BaseAgent;
  private errorCount: number = 0;
  private successCount: number = 0;

  constructor(
    configOrAgent: BaseAgentConfig | BaseAgent,
    agentMetadata: {
      id: string;
      name: string;
      version: string;
      description: string;
      capabilities?: AgentCapability[];
    }
  ) {
    // Set agent metadata
    this.id = agentMetadata.id;
    this.name = agentMetadata.name;
    this.version = agentMetadata.version;
    this.description = agentMetadata.description;
    this.capabilities = agentMetadata.capabilities || [];
    this.status = 'active';

    // Create or use existing BaseAgent instance
    if (configOrAgent instanceof BaseAgent) {
      // Use existing agent (e.g., McCarthyArtworkAgent)
      this.baseAgent = configOrAgent;
    } else {
      // Create new BaseAgent from config
      this.baseAgent = new BaseAgent(configOrAgent);
    }
  }

  /**
   * Process a message (Dartmouth OS interface)
   */
  async processMessage(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // Convert Dartmouth request to BaseAgent format
      const response = await this.baseAgent.processMessage(
        request.message,
        request.history || [],
        request.sessionId,
        request.userId
      );

      // Track success
      this.successCount++;

      // Convert BaseAgent response to Dartmouth format
      return {
        content: response.content,
        type: 'text',
        intent: response.intent,
        sentiment: response.sentiment ? {
          score: response.sentiment.score,
          label: response.sentiment.label as 'negative' | 'neutral' | 'positive',
          confidence: response.sentiment.confidence,
        } : undefined,
        metadata: {
          timestamp: Date.now(),
          processingTime: Date.now() - startTime,
          llmProvider: response.metadata?.llmProvider,
          llmModel: response.metadata?.llmModel,
          tokensUsed: response.metadata?.tokensUsed,
          cost: response.metadata?.cost,
          cached: response.metadata?.cached,
        },
      };
    } catch (error) {
      // Track error
      this.errorCount++;

      throw error;
    }
  }

  /**
   * Health check (Dartmouth OS interface)
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Simple health check - try to process a test message
      await this.baseAgent.processMessage(
        'health check',
        [],
        `health-check-${Date.now()}`,
        'system'
      );

      const responseTime = Date.now() - startTime;

      return {
        agentId: this.id,
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        errorCount: this.errorCount,
        successCount: this.successCount,
        lastCheck: Date.now(),
        details: {
          name: this.name,
          version: this.version,
        },
      };
    } catch (error) {
      return {
        agentId: this.id,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        errorCount: this.errorCount,
        successCount: this.successCount,
        lastCheck: Date.now(),
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get error count
   */
  getErrorCount(): number {
    return this.errorCount;
  }

  /**
   * Get success count
   */
  getSuccessCount(): number {
    return this.successCount;
  }

  /**
   * Reset counters
   */
  resetCounters(): void {
    this.errorCount = 0;
    this.successCount = 0;
  }
}

