/**
 * Frustration Handler
 * 
 * Detects and responds to user frustration with empathy.
 * Implements Section 5.1.8 from AGENT_ARMY_SYSTEM.md
 */

import type { FrustrationLevel, ConversationState } from '../types/shared'

export class FrustrationHandler {
  /**
   * Detect frustration level from message and conversation history
   */
  detectFrustrationLevel(
    message: string,
    conversationState: ConversationState
  ): FrustrationLevel {
    let score = 0

    // Factor 1: Frustration keywords
    // NOTE: Made VERY conservative to match IntentDetector patterns
    // Punctuation alone (!!!, ???) is NOT frustration - it's just emphasis
    const frustrationKeywords = [
      { pattern: /\b(frustrated|annoyed)\b/i, weight: 3 },  // Explicit frustration only
      { pattern: /(give up|never mind|forget it)/i, weight: 4 },  // Giving up
      { pattern: /(terrible|awful|useless|horrible|worst)/i, weight: 3 },  // Strong negative
      { pattern: /(ugh|argh|grrr)/i, weight: 2 },  // Frustration sounds
      { pattern: /this (is|isn't) working/i, weight: 3 },  // Explicit "not working"
      { pattern: /nothing (is )?working/i, weight: 3 },  // "nothing working"
      { pattern: /\b(fuck|shit|damn|hell|crap)\b/i, weight: 9 }  // Profanity = CRITICAL frustration
    ]

    for (const { pattern, weight } of frustrationKeywords) {
      if (pattern.test(message)) {
        score += weight
      }
    }

    // REMOVED: Factor 2 (conversation length) - caused false positives
    // REMOVED: Factor 3 (repeated topics) - caused false positives on normal follow-ups
    // REMOVED: Factor 4 (short messages) - "bye" and "goodbye" are not frustration
    
    // Only use explicit frustration keywords - no other factors
    // This prevents false positives on normal conversation

    // Map score to frustration level
    if (score === 0) return 'none'
    if (score <= 2) return 'mild'
    if (score <= 5) return 'moderate'
    if (score <= 8) return 'high'
    return 'critical'
  }

  /**
   * Generate empathetic response based on frustration level
   */
  generateEmpatheticResponse(
    level: FrustrationLevel,
    context: string
  ): string {
    switch (level) {
      case 'none':
        return '' // No special handling needed

      case 'mild':
        return `I understand this might be confusing. Let me try to explain it more clearly. ${context}`

      case 'moderate':
        return `I can see you're having trouble with this. Let me break it down step by step. ${context}`

      case 'high':
        return `I apologize for the confusion. Let me start over and explain this in a simpler way. ${context}`

      case 'critical':
        return `I'm really sorry this hasn't been helpful. Would you like me to connect you with a human expert who can assist you better?`
    }
  }

  /**
   * Determine if escalation is needed
   */
  shouldEscalate(level: FrustrationLevel): boolean {
    return level === 'critical'
  }

  /**
   * Generate escalation message
   */
  generateEscalationMessage(): string {
    return `I understand you're frustrated, and I want to make sure you get the help you need. Would you like me to:
1. Connect you with a human support agent
2. Schedule a callback
3. Send you detailed documentation via email

Please let me know how I can best assist you.`
  }

  /**
   * Count repeated topics in questions
   */
  private countRepeatedTopics(questions: string[]): number {
    const topics: Record<string, number> = {}

    for (const question of questions) {
      const words = question.toLowerCase().split(/\s+/)
      for (const word of words) {
        if (word.length > 4) {
          topics[word] = (topics[word] || 0) + 1
        }
      }
    }

    return Object.values(topics).filter(count => count >= 2).length
  }

  /**
   * Learn from frustration event
   */
  async learnFromFrustration(
    db: D1Database,
    agentId: string,
    message: string,
    level: FrustrationLevel,
    context: string
  ): Promise<void> {
    // Store frustration event for analysis
    await db
      .prepare(`
        INSERT INTO agent_analytics (id, agent_id, event_type, event_data, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        agentId,
        'frustration',
        JSON.stringify({
          message,
          level,
          context,
          timestamp: new Date().toISOString()
        }),
        new Date().toISOString()
      )
      .run()
  }
}

