/**
 * Shared types for worker
 * Re-exported from @agent-army/shared types
 */

// For now, we'll define the types locally until we set up proper workspace linking
// TODO: Import from @agent-army/shared once workspace is configured

import type { D1Database, KVNamespace, R2Bucket, Ai } from '@cloudflare/workers-types';

/**
 * Environment bindings for Cloudflare Worker
 */
export interface Env {
  // D1 Database
  DB: D1Database;
  
  // KV Namespaces
  APP_CONFIG: KVNamespace;
  CACHE: KVNamespace;
  
  // R2 Bucket
  FILES: R2Bucket;
  
  // Workers AI
  WORKERS_AI: Ai;
  
  // Environment Variables
  ENVIRONMENT?: string;
  LLM_PROVIDER?: 'openai' | 'anthropic' | 'google';
  LLM_MODEL?: string;
  
  // API Keys
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  
  // Secrets
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  CLERK_SECRET_KEY?: string;
  JWT_SECRET?: string;
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  intent?: Intent
  metadata?: Record<string, any>
}

export interface Intent {
  type: IntentType
  confidence: number
  entities?: Record<string, any>
  requiresArtworkData?: boolean
  requiresRAG?: boolean
  requiresCalculation?: boolean
}

export type IntentType =
  | 'greeting'
  | 'farewell'
  | 'information'
  | 'calculation'
  | 'howto'
  | 'troubleshooting'
  | 'repeat'
  | 'followup'
  | 'frustration'
  | 'complaint'
  | 'unknown'

export interface ConversationState {
  sessionId: string
  userId?: string
  agentId: string
  tenantId?: string
  startedAt: Date
  lastMessageAt: Date
  lastActivityAt: Date
  expiresAt: Date
  messageCount: number
  messages: Message[]
  questionsAsked: QuestionLog[]
  answersGiven: AnswerLog[]
  topicsDiscussed: string[]
  intentsDetected: Intent[]
  userGoal?: UserGoal | null
  currentTopic?: string | null
  conversationPlan?: Plan | null
  isFrustrationDetected: boolean
  isRepeatDetected: boolean
  isGoalAchieved: boolean
  needsEscalation: boolean
  isMultiTurn: boolean
  userPreferences: Map<string, any>
  learnedPatterns: Pattern[]
  previousSessions: string[]
  tags: string[]
  metadata: Record<string, any>
}

export interface QuestionLog {
  question: string
  intent: Intent
  timestamp: Date
  wasAnswered: boolean
}

export interface AnswerLog {
  answer: string
  handler: string
  type: string
  timestamp: Date
  validationPassed?: boolean
}

export interface UserGoal {
  type: 'information' | 'calculation' | 'howto' | 'troubleshooting'
  description: string
  identifiedAt: Date
  achieved: boolean
}

export interface Response {
  content: string
  metadata: ResponseMetadata
  actions?: string[]
  suggestions?: Suggestion[]
}

export interface ResponseMetadata {
  handlerName: string
  handlerVersion: string
  processingTime: number
  cached: boolean
  confidence: number
  sources?: Source[]
  sessionId?: string
  messageId?: string
  processingTimeMs?: number
  validationPassed?: boolean
  error?: string
  calculationResult?: any
  frustrationLevel?: string
  [key: string]: any
}

export interface Suggestion {
  type: string
  text: string
  action: string
  priority: 'low' | 'medium' | 'high'
}

export interface Source {
  id: string
  title: string
  url?: string
  excerpt?: string
}

export interface Document {
  id: string
  title: string
  content: string
  type: 'markdown' | 'pdf' | 'txt'
  metadata?: Record<string, any>
}

export interface RAGResult {
  chunks: Chunk[]
  sources: Source[]
  confidence: number
  cached: boolean
}

export interface Chunk {
  id?: string
  text: string
  documentId?: string
  chunkIndex?: number
  metadata?: Record<string, any>
}

export type FrustrationLevel = 'none' | 'mild' | 'moderate' | 'high' | 'critical'

export interface ValidationResult {
  isValid: boolean
  score: number
  verifiedFacts: string[]
  unverifiedFacts: string[]
  issues: string[]
  suggestedFix?: string
}

export interface AgentConfig {
  agentId: string
  name: string
  version: string
  description?: string
  systemPrompt?: string
  llmProvider?: 'openai' | 'anthropic' | 'google'
  llmModel?: string
  temperature?: number
  maxTokens?: number
}

export interface HandlerContext {
  state: ConversationState
  agentConfig: AgentConfig
  env: any
  stateManager: any
  memorySystem: any
  ragEngine: any
  frustrationHandler: any
}

export interface Pattern {
  type: string
  pattern: string
  frequency: number
  lastSeen: Date
}

export interface SessionSummary {
  short: string
  detailed: string
}

export interface Summary {
  short?: string
  detailed?: string
  topics: string[]
  keyPoints: string[]
  sentiment: string
}

export interface Plan {
  goal: string
  steps: string[]
  currentStep: number
  completed: boolean
}

