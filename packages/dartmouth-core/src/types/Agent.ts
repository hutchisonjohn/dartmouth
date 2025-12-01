/**
 * Agent Interface
 * Defines the contract for all agents in the Dartmouth ecosystem
 */

export interface Agent {
  /** Unique agent identifier (e.g., 'fam', 'mccarthy-artwork', 'mccarthy-pa') */
  id: string;

  /** Human-readable agent name */
  name: string;

  /** Agent version */
  version: string;

  /** Agent description */
  description: string;

  /** Agent capabilities */
  capabilities: AgentCapability[];

  /** Agent status */
  status: AgentStatus;

  /** Process a chat message */
  processMessage(request: AgentRequest): Promise<AgentResponse>;

  /** Health check */
  healthCheck(): Promise<HealthCheckResult>;
}

export interface AgentCapability {
  /** Capability name (e.g., 'voice', 'vision', 'calculations') */
  name: string;

  /** Capability description */
  description: string;

  /** Is this capability enabled? */
  enabled: boolean;
}

export type AgentStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface AgentRequest {
  /** Session ID */
  sessionId: string;

  /** User ID */
  userId?: string;

  /** User message */
  message: string;

  /** Conversation history */
  history?: ConversationMessage[];

  /** Additional context */
  context?: Record<string, any>;

  /** Request metadata */
  metadata?: RequestMetadata;
}

export interface AgentResponse {
  /** Response content */
  content: string;

  /** Response type */
  type: ResponseType;

  /** Detected intent */
  intent?: string;

  /** Sentiment analysis */
  sentiment?: SentimentResult;

  /** Suggested actions */
  actions?: SuggestedAction[];

  /** Response metadata */
  metadata?: ResponseMetadata;
}

export type ResponseType = 'text' | 'audio' | 'image' | 'error';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface RequestMetadata {
  /** Request timestamp */
  timestamp: number;

  /** User agent */
  userAgent?: string;

  /** IP address */
  ipAddress?: string;

  /** Language */
  language?: string;

  /** Timezone */
  timezone?: string;
}

export interface ResponseMetadata {
  /** Response timestamp */
  timestamp: number;

  /** Processing time (ms) */
  processingTime: number;

  /** LLM provider used */
  llmProvider?: string;

  /** LLM model used */
  llmModel?: string;

  /** Tokens used */
  tokensUsed?: number;

  /** Cost (USD) */
  cost?: number;

  /** Cached response? */
  cached?: boolean;
}

export interface SentimentResult {
  /** Sentiment score (-1 to 1) */
  score: number;

  /** Sentiment label */
  label: 'negative' | 'neutral' | 'positive';

  /** Confidence (0 to 1) */
  confidence: number;
}

export interface SuggestedAction {
  /** Action type */
  type: string;

  /** Action label */
  label: string;

  /** Action data */
  data?: Record<string, any>;
}

export interface HealthCheckResult {
  /** Agent ID */
  agentId: string;

  /** Health status */
  status: 'healthy' | 'degraded' | 'unhealthy';

  /** Response time (ms) */
  responseTime: number;

  /** Error count (last hour) */
  errorCount: number;

  /** Success count (last hour) */
  successCount: number;

  /** Last check timestamp */
  lastCheck: number;

  /** Additional details */
  details?: Record<string, any>;
}

export interface AgentRegistration {
  /** Agent instance */
  agent: Agent;

  /** Registration timestamp */
  registeredAt: number;

  /** Last health check */
  lastHealthCheck?: HealthCheckResult;
}

