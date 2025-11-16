/**
 * Shared types for Agent Army System
 */

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

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

// ============================================================================
// CONVERSATION STATE
// ============================================================================

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

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export interface AgentConfig {
  agentId: string
  name: string
  version: string
  llm: LLMConfig
  rag?: RAGConfig
  memory?: MemoryConfig
  features?: FeatureConfig
  ui?: UIConfig
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google'
  model: string
  maxTokens: number
  temperature?: number
  systemPrompt: string
}

export interface RAGConfig {
  enabled: boolean
  minSimilarity: number
  topK: number
  documents?: string[]
}

export interface MemoryConfig {
  shortTerm: boolean
  longTerm: boolean
  episodic: boolean
  semantic: boolean
}

export interface FeatureConfig {
  calculationEngine: boolean
  repetitionDetection: boolean
  frustrationHandling: boolean
  tutorialIntegration: boolean
  proactiveSuggestions: boolean
}

export interface UIConfig {
  greeting: string
  placeholder: string
  theme: {
    primary: string
    secondary: string
  }
}

// ============================================================================
// RAG TYPES
// ============================================================================

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

// ============================================================================
// MEMORY TYPES
// ============================================================================

export interface Fact {
  id: string
  agentId: string
  content: string
  learnedAt: Date
}

export interface Session {
  sessionId: string
  userId: string
  agentId: string
  startedAt: Date
  endedAt: Date
  messageCount: number
  topicsDiscussed: string[]
  goalAchieved: boolean
  summary: string
  messages: Message[]
}

// ============================================================================
// ARTWORK ANALYZER TYPES
// ============================================================================

export interface ArtworkData {
  id: string
  width: number
  height: number
  dpi: number
  fileSize?: number
  fileName?: string
}

export interface ArtworkAnalysis {
  dimensions: {
    width: number
    height: number
    aspectRatio: number
  }
  dpi: number
  colors?: ColorAnalysis
  transparency?: TransparencyAnalysis
  iccProfile?: ICCProfile
  quality: QualityRating
  fileSize: number
  fileType: string
  fileName: string
}

export interface ColorAnalysis {
  topColors: Array<{
    hex: string
    rgb: [number, number, number]
    percent: number
  }>
  uniqueColors: number
  totalSampled: number
}

export interface TransparencyAnalysis {
  hasAlpha: boolean
  transparent: {
    count: number
    percent: number
  }
  semiTransparent: {
    count: number
    percent: number
  }
  opaque: {
    count: number
    percent: number
  }
}

export interface ICCProfile {
  name: string
  colorSpace: string
  isEmbedded: boolean
}

export interface QualityRating {
  rating: 'optimal' | 'good' | 'poor'
  dpi: number
  maxSize300: {
    widthCm: number
    heightCm: number
  }
  maxSize250: {
    widthCm: number
    heightCm: number
  }
  recommendedSizes?: RecommendedSizes
}

export interface RecommendedSizes {
  at300dpi: {
    w_in: number
    h_in: number
    w_cm: number
    h_cm: number
  }
  at150dpi: {
    w_in: number
    h_in: number
    w_cm: number
    h_cm: number
  }
}

// ============================================================================
// CALCULATION TYPES
// ============================================================================

export interface CalculationSet {
  artworkId: string
  pixels: {
    width: number
    height: number
    total: number
  }
  dpi: number
  sizes: SizeCalculations
  quality: QualityRatings
  maxSizes: MaxSizes
  customSizes: any[]
  timestamp: Date
}

export interface SizeCalculations {
  [key: string]: {
    dpi: number
    widthInches: number
    heightInches: number
    widthCm: number
    heightCm: number
    quality: 'optimal' | 'good' | 'poor'
  }
}

export interface QualityRatings {
  optimal: {
    minDPI: number
    maxDPI: number
    color: string
    label: string
  }
  good: {
    minDPI: number
    maxDPI: number
    color: string
    label: string
  }
  poor: {
    minDPI: number
    maxDPI: number
    color: string
    label: string
  }
}

export interface MaxSizes {
  at300dpi: SizeResult
  at250dpi: SizeResult
  at200dpi: SizeResult
  at150dpi: SizeResult
  at72dpi: SizeResult
}

export interface DPIResult {
  dpi: number
  widthInches: number
  heightInches: number
  widthCm: number
  heightCm: number
  quality: 'optimal' | 'good' | 'poor'
  formula: string
}

export interface SizeResult {
  widthInches: number
  heightInches: number
  widthCm: number
  heightCm: number
  dpi: number
  quality: 'optimal' | 'good' | 'poor'
  formula?: string
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ChatRequest {
  message: string
  sessionId?: string
  context?: Record<string, any>
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface ChatResponse {
  sessionId: string
  messageId: string
  answer: string
  metadata: ResponseMetadata
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    totalCost: number
  }
}

export interface APIError {
  error: string
  code: string
  details?: any
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FrustrationLevel = 'none' | 'mild' | 'moderate' | 'high' | 'critical'

export interface ValidationResult {
  passed: boolean
  score: number
  verifiedFacts: string[]
  unverifiedFacts: string[]
}

