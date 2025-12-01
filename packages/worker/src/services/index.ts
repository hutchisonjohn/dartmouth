/**
 * Services
 * 
 * Agent routing and orchestration services
 */

export { AgentRegistry } from './AgentRegistry';
export type { McCarthyAgent, McCarthyAgentMetadata } from './AgentRegistry';

export { AgentRouter } from './AgentRouter';
export type { RoutingDecision } from './AgentRouter';

export { AgentOrchestrator } from './AgentOrchestrator';
export type {
  OrchestrationPlan,
  OrchestrationStep,
  OrchestrationResult,
  StepResult
} from './AgentOrchestrator';

export { AgentHandoffProtocol } from './AgentHandoffProtocol';
export type {
  HandoffRequest,
  HandoffResult,
  ConversationContext,
  CustomerContext
} from './AgentHandoffProtocol';

export { ProductKnowledgeSystem } from './ProductKnowledgeSystem';
export type {
  ShopifyProduct,
  ShopifyVariant,
  ProductSearchQuery,
  ProductSearchResult,
  SyncStatus
} from './ProductKnowledgeSystem';

export { AuthenticationService } from './AuthenticationService';
export type {
  User,
  UserRole,
  Permission,
  LoginCredentials,
  LoginResult,
  TokenValidationResult,
  JWTPayload
} from './AuthenticationService';

export { WebSocketService } from './WebSocketService';
export type {
  WebSocketMessage,
  WebSocketMessageType,
  ConnectionInfo,
  UserPresence,
  PresenceStatus,
  TypingIndicator
} from './WebSocketService';

export { AnalyticsService } from './AnalyticsService';
export type {
  MetricEvent,
  MetricType,
  ConversationMetrics,
  CSATMetrics,
  AgentPerformanceMetrics,
  ChannelMetrics,
  DashboardMetrics,
  TimeSeriesDataPoint,
  ResolutionType,
  ChannelType
} from './AnalyticsService';

export { InternalCommunicationSystem } from './InternalCommunicationSystem';
export type {
  Channel,
  ChannelMessage,
  Thread,
  Mention,
  Notification,
  ChannelMember
} from './InternalCommunicationSystem';

export { OmnichannelRouter } from './OmnichannelRouter';
export type {
  NormalizedMessage,
  ChannelConfig,
  RoutingResult,
  EmailMessage,
  ChatMessage,
  WhatsAppMessage,
  InstagramMessage,
  FacebookMessage,
  PhoneMessage
} from './OmnichannelRouter';

export { TicketManager } from './TicketManager';
export type {
  Ticket,
  TicketMessage,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketFilterOptions,
  TicketStatistics
} from './TicketManager';

export { ShopifyIntegration } from './ShopifyIntegration';
export type {
  ShopifyCustomer,
  ShopifyOrder,
  ShopifyProductSimple
} from './ShopifyIntegration';

export { PERPIntegration } from './PERPIntegration';
export type {
  ProductionOrder,
  ProductionStatus,
  ArtworkStatus,
  VIPWallet,
  VIPTransaction,
  Invoice
} from './PERPIntegration';

export { LLMService } from './LLMService';
export type { LLMRequest, LLMResponse } from './LLMService';

export { GmailIntegration } from './GmailIntegration';
export type { Email, EmailAddress, Attachment, Draft, SendEmailOptions, GmailCredentials } from './GmailIntegration';

export { MentionManager } from './MentionManager';
export type { Mention as StaffMention, CreateMentionData, ThreadReply, MentionPriority, MentionType } from './MentionManager';
