/**
 * Shared types for worker
 * Re-exported from @agent-army/shared types
 */

// For now, we'll define the types locally until we set up proper workspace linking
// TODO: Import from @agent-army/shared once workspace is configured

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
  | 'unknown'

export interface ConversationState {
  sessionId: string
  userId?: string
  agentId: string
  startedAt: Date
  lastMessageAt: Date
  messageCount: number
  questionsAsked: QuestionLog[]
  answersGiven: AnswerLog[]
  topicsDiscussed: string[]
  userGoal?: UserGoal
  isFrustrationDetected: boolean
  metadata: Record<string, any>
}

export interface QuestionLog {
  question: string
  intent: Intent
  timestamp: Date
}

export interface AnswerLog {
  answer: string
  handler: string
  timestamp: Date
}

export interface UserGoal {
  type: 'information' | 'calculation' | 'howto' | 'troubleshooting'
  description: string
  identifiedAt: Date
  achieved: boolean
}

export interface Response {
  answer: string
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
  passed: boolean
  score: number
  verifiedFacts: string[]
  unverifiedFacts: string[]
}

