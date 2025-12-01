/**
 * Conversation Quality Validator
 * 
 * THE HEART OF DARTMOUTH - Ensures all agents are personal, conversational, and helpful.
 * 
 * Based on: Personalised Conversational Agent Guidelines.md
 * 
 * This validator checks EVERY response before it's sent to ensure:
 * - Friendly, conversational tone
 * - Concise, not verbose
 * - No hallucinations
 * - No technical jargon without explanation
 * - No repetition/loops
 * - No broken promises
 */

import type { Response } from '../types/shared';
import type { UserSentiment } from './EmpathyInjector';

export interface ConversationQualityResult {
  passed: boolean
  score: number // 0-100
  issues: ConversationIssue[]
  suggestions: string[]
}

export interface ConversationIssue {
  type: 'verbosity' | 'jargon' | 'hallucination' | 'repetition' | 'promise' | 'tone' | 'empathy'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  suggestion: string
}

export class ConversationQualityValidator {
  private conversationHistory: string[] = []
  
  /**
   * Validate response quality before sending to user
   */
  validate(
    response: Response,
    context: {
      userMessage: string
      conversationHistory: string[]
      providedData?: any
      userSentiment?: UserSentiment
      intentType?: string  // Added to allow different rules for different intents
    }
  ): ConversationQualityResult {
    this.conversationHistory = context.conversationHistory
    
    const issues: ConversationIssue[] = []
    let score = 100
    
    // Check 1: Verbosity (responses should be concise)
    const verbosityCheck = this.checkVerbosity(response.content, context.intentType)
    if (verbosityCheck) {
      issues.push(verbosityCheck)
      score -= 20
    }
    
    // Check 2: Technical jargon without explanation
    const jargonCheck = this.checkJargon(response.content)
    if (jargonCheck) {
      issues.push(jargonCheck)
      score -= 15
    }
    
    // Check 3: Hallucinations (making up information)
    const hallucinationCheck = this.checkHallucinations(response.content, context.providedData)
    if (hallucinationCheck) {
      issues.push(hallucinationCheck)
      score -= 40 // Critical issue!
    }
    
    // Check 4: Repetition (stuck in loop)
    const repetitionCheck = this.checkRepetition(response.content)
    if (repetitionCheck) {
      issues.push(repetitionCheck)
      score -= 30
    }
    
    // Check 5: Broken promises ("I'll get back to you")
    const promiseCheck = this.checkBrokenPromises(response.content)
    if (promiseCheck) {
      issues.push(promiseCheck)
      score -= 25
    }
    
    // Check 6: Tone (should be friendly, not robotic)
    const toneCheck = this.checkTone(response.content)
    if (toneCheck) {
      issues.push(toneCheck)
      score -= 10
    }
    
    // Check 7: Empathy (if user is frustrated/confused)
    const empathyCheck = this.checkEmpathy(response.content, context.userSentiment)
    if (empathyCheck) {
      issues.push(empathyCheck)
      score -= 15
    }
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(issues)
    
    return {
      passed: score >= 70, // Must score 70+ to pass
      score: Math.max(0, score),
      issues,
      suggestions
    }
  }
  
  /**
   * Check 1: Verbosity
   * Responses should be concise (2-4 sentences ideal, max 200 words)
   */
  private checkVerbosity(content: string, intentType?: string): ConversationIssue | null {
    const wordCount = content.split(/\s+/).length
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    
    // Allow longer responses for how-to questions (step-by-step instructions)
    const maxWords = intentType === 'howto' ? 1000 : 300;
    const recommendedWords = intentType === 'howto' ? 500 : 200;
    
    // Critical: Over max words
    if (wordCount > maxWords) {
      return {
        type: 'verbosity',
        severity: 'critical',
        message: `Response is ${wordCount} words (should be under ${recommendedWords})`,
        suggestion: 'Cut response by 50%. Lead with the most important information. Remove fluff.'
      }
    }
    
    // High: Over recommended words (but not critical for howto)
    if (wordCount > recommendedWords && intentType !== 'howto') {
      return {
        type: 'verbosity',
        severity: 'high',
        message: `Response is ${wordCount} words (should be under ${recommendedWords})`,
        suggestion: 'Be more concise. Get to the point faster. Remove unnecessary details.'
      }
    }
    
    // Medium: Over 10 sentences (skip for howto)
    if (sentenceCount > 10 && intentType !== 'howto') {
      return {
        type: 'verbosity',
        severity: 'medium',
        message: `Response has ${sentenceCount} sentences (should be 2-6)`,
        suggestion: 'Break into shorter responses or use bullet points.'
      }
    }
    
    return null
  }
  
  /**
   * Check 2: Technical Jargon
   * Technical terms should be explained in plain language
   */
  private checkJargon(content: string): ConversationIssue | null {
    const technicalTerms = [
      { term: 'DPI', explanation: ['dots per inch', 'resolution', 'quality'] },
      { term: 'ICC', explanation: ['color profile', 'color space'] },
      { term: 'CMYK', explanation: ['color mode', 'printing colors'] },
      { term: 'RGB', explanation: ['screen colors', 'red green blue'] },
      { term: 'alpha channel', explanation: ['transparency'] },
      { term: 'halftone', explanation: ['dot pattern', 'dots'] },
      { term: 'vector', explanation: ['scalable', 'resolution independent'] },
      { term: 'raster', explanation: ['pixel-based', 'bitmap'] },
      { term: 'aspect ratio', explanation: ['width to height', 'proportions'] }
    ]
    
    const unexplainedTerms: string[] = []
    
    for (const { term, explanation } of technicalTerms) {
      // Check if term is used
      const termRegex = new RegExp(`\\b${term}\\b`, 'i')
      if (termRegex.test(content)) {
        // Check if it's explained
        const hasExplanation = explanation.some(exp => 
          content.toLowerCase().includes(exp.toLowerCase())
        )
        
        if (!hasExplanation) {
          unexplainedTerms.push(term)
        }
      }
    }
    
    if (unexplainedTerms.length > 0) {
      return {
        type: 'jargon',
        severity: 'medium',
        message: `Technical terms used without explanation: ${unexplainedTerms.join(', ')}`,
        suggestion: 'Explain technical terms in plain language. Example: "DPI (dots per inch) measures quality"'
      }
    }
    
    return null
  }
  
  /**
   * Check 3: Hallucinations
   * CRITICAL: Never make up information
   */
  private checkHallucinations(content: string, providedData?: any): ConversationIssue | null {
    // Patterns that indicate hallucination
    const hallucinationPatterns = [
      /created in (photoshop|illustrator|indesign|gimp)/i,
      /last modified on \d{1,2}\/\d{1,2}\/\d{2,4}/i,
      /file was created by/i,
      /photographer.*is/i,
      /camera.*used/i,
      /this image was taken/i,
      /original source/i,
      /copyright.*belongs to/i
    ]
    
    // Check for specific claims without data
    const specificClaims = [
      { pattern: /embedded.*profile.*is.*adobe rgb/i, dataKey: 'iccProfile' },
      { pattern: /color space.*is.*cmyk/i, dataKey: 'colorSpace' },
      { pattern: /bit depth.*is.*16/i, dataKey: 'bitDepth' },
      { pattern: /file size.*is.*\d+\s*mb/i, dataKey: 'fileSize' }
    ]
    
    // Check hallucination patterns
    for (const pattern of hallucinationPatterns) {
      if (pattern.test(content)) {
        return {
          type: 'hallucination',
          severity: 'critical',
          message: 'Response contains unverified information (hallucination)',
          suggestion: 'Only state facts from provided data. Say "I don\'t have that information" if data is missing.'
        }
      }
    }
    
    // Check specific claims against provided data
    if (providedData) {
      for (const { pattern, dataKey } of specificClaims) {
        if (pattern.test(content) && !providedData[dataKey]) {
          return {
            type: 'hallucination',
            severity: 'critical',
            message: `Response claims ${dataKey} information not in provided data`,
            suggestion: `Don't claim ${dataKey} unless it's in the provided data. Say "I don't see ${dataKey} information" instead.`
          }
        }
      }
    }
    
    return null
  }
  
  /**
   * Check 4: Repetition
   * Don't repeat the same response if it didn't help
   */
  private checkRepetition(content: string): ConversationIssue | null {
    if (this.conversationHistory.length < 2) {
      return null // Not enough history to check
    }
    
    // Get last 3 agent responses
    const recentResponses = this.conversationHistory
      .filter((_, i) => i % 2 === 1) // Agent responses are at odd indices
      .slice(-3)
    
    // Check if current response is very similar to recent responses
    for (const pastResponse of recentResponses) {
      const similarity = this.calculateSimilarity(content, pastResponse)
      
      if (similarity > 0.8) {
        return {
          type: 'repetition',
          severity: 'high',
          message: 'Response is very similar to a previous response',
          suggestion: 'Try a different approach. If you can\'t help, escalate to another agent or human.'
        }
      }
    }
    
    return null
  }
  
  /**
   * Check 5: Broken Promises
   * Don't promise to "get back to you" unless you actually will
   */
  private checkBrokenPromises(content: string): ConversationIssue | null {
    const promisePatterns = [
      /i'll get back to you/i,
      /i'll check on that/i,
      /i'll look into/i,
      /i'll find out/i,
      /i'll contact/i,
      /someone will (email|call|message) you/i,
      /we'll (reach out|follow up)/i
    ]
    
    for (const pattern of promisePatterns) {
      if (pattern.test(content)) {
        return {
          type: 'promise',
          severity: 'high',
          message: 'Response promises future action without follow-through mechanism',
          suggestion: 'Either help NOW or escalate to someone who can. Don\'t promise "I\'ll get back to you".'
        }
      }
    }
    
    return null
  }
  
  /**
   * Check 6: Tone
   * Should be friendly and conversational, not robotic
   */
  private checkTone(content: string): ConversationIssue | null {
    const roboticPatterns = [
      /^(greetings|salutations)/i,
      /as an ai (assistant|agent)/i,
      /i am (programmed|designed|configured) to/i,
      /my (programming|algorithms|systems)/i,
      /i apologize.*i apologize/i, // Excessive apologizing
      /^(hello|hi)\.?\s+(i am|i'm) (an ai|your|a)/i // Robotic greeting
    ]
    
    for (const pattern of roboticPatterns) {
      if (pattern.test(content)) {
        return {
          type: 'tone',
          severity: 'medium',
          message: 'Response sounds robotic or overly formal',
          suggestion: 'Be more conversational. Talk like a helpful friend, not a robot.'
        }
      }
    }
    
    return null
  }
  
  /**
   * Check 7: Empathy
   * Show empathy when user is frustrated, confused, or upset
   */
  private checkEmpathy(
    content: string, 
    userSentiment?: 'neutral' | 'frustrated' | 'confused' | 'excited'
  ): ConversationIssue | null {
    if (!userSentiment || userSentiment === 'neutral') {
      return null // No empathy needed
    }
    
    const empathyPhrases = [
      'i understand',
      'i can see',
      'that makes sense',
      'i hear you',
      'no worries',
      'don\'t worry',
      'that\'s frustrating',
      'that\'s confusing',
      'let me help',
      'i\'m here to help',
      'that\'s awesome',
      'that\'s great',
      'exciting'
    ]
    
    const hasEmpathy = empathyPhrases.some(phrase => 
      content.toLowerCase().includes(phrase)
    )
    
    if (!hasEmpathy && (userSentiment === 'frustrated' || userSentiment === 'confused')) {
      return {
        type: 'empathy',
        severity: 'medium',
        message: `User is ${userSentiment} but response lacks empathy`,
        suggestion: `Add empathy: "I understand this can be ${userSentiment}!" or "No worries, let me help!"`
      }
    }
    
    return null
  }
  
  /**
   * Calculate similarity between two strings (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/)
    const words2 = str2.toLowerCase().split(/\s+/)
    
    const commonWords = words1.filter(word => words2.includes(word))
    const totalWords = Math.max(words1.length, words2.length)
    
    return commonWords.length / totalWords
  }
  
  /**
   * Generate suggestions based on issues found
   */
  private generateSuggestions(issues: ConversationIssue[]): string[] {
    const suggestions: string[] = []
    
    // Group by severity
    const critical = issues.filter(i => i.severity === 'critical')
    const high = issues.filter(i => i.severity === 'high')
    
    if (critical.length > 0) {
      suggestions.push('🚨 CRITICAL: ' + critical[0].suggestion)
    }
    
    if (high.length > 0) {
      suggestions.push('⚠️ HIGH: ' + high[0].suggestion)
    }
    
    // Add general improvement suggestions
    if (issues.length > 3) {
      suggestions.push('💡 TIP: Focus on being concise, friendly, and accurate. Quality over quantity!')
    }
    
    return suggestions
  }
}

