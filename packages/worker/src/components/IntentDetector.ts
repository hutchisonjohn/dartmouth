/**
 * Intent Detector
 * 
 * Detects user intent from messages using pattern matching and context analysis.
 * Implements Section 5.1.2 from AGENT_ARMY_SYSTEM.md
 */

import type { Intent, ConversationState } from '../types/shared'

export class IntentDetector {
  /**
   * Detect intent from a user message
   */
  async detect(
    message: string,
    conversationState?: ConversationState
  ): Promise<Intent> {
    const lowerMessage = message.toLowerCase().trim()

    // Pattern-based detection
    const patternIntent = this.detectByPattern(lowerMessage)
    
    // Context-based refinement
    if (conversationState) {
      return this.refineWithContext(patternIntent, lowerMessage, conversationState)
    }

    return patternIntent
  }

  /**
   * Detect intent using pattern matching
   */
  private detectByPattern(message: string): Intent {
    // Greeting patterns
    if (this.isGreeting(message)) {
      return {
        type: 'greeting',
        confidence: 0.95,
        entities: {}
      }
    }

    // Farewell patterns
    if (this.isFarewell(message)) {
      return {
        type: 'farewell',
        confidence: 0.95,
        entities: {}
      }
    }

    // Follow-up patterns (check BEFORE calculation - high priority)
    if (this.isFollowUp(message)) {
      return {
        type: 'followup',
        confidence: 0.70,
        entities: {}
      }
    }

    // Calculation patterns
    if (this.isCalculation(message)) {
      return {
        type: 'calculation',
        confidence: 0.85,
        requiresCalculation: true,
        entities: this.extractCalculationEntities(message)
      }
    }

    // How-to patterns
    if (this.isHowTo(message)) {
      return {
        type: 'howto',
        confidence: 0.80,
        requiresRAG: true,
        entities: this.extractHowToEntities(message)
      }
    }

    // Frustration patterns (check before troubleshooting)
    if (this.isFrustration(message)) {
      return {
        type: 'frustration',
        confidence: 0.85,
        entities: {}
      }
    }

    // Troubleshooting patterns
    if (this.isTroubleshooting(message)) {
      return {
        type: 'troubleshooting',
        confidence: 0.75,
        requiresRAG: true,
        entities: {}
      }
    }

    // Repeat/clarification patterns
    if (this.isRepeat(message)) {
      return {
        type: 'repeat',
        confidence: 0.90,
        entities: {}
      }
    }

    // Check if message is gibberish/unknown
    if (this.isUnknown(message)) {
      return {
        type: 'unknown',
        confidence: 0.30,
        entities: {}
      }
    }

    // Information request patterns
    if (this.isInformation(message)) {
      return {
        type: 'information',
        confidence: 0.75,
        requiresRAG: true,
        entities: {}
      }
    }

    // Default: information request
    return {
      type: 'information',
      confidence: 0.60,
      requiresRAG: true,
      entities: {}
    }
  }

  /**
   * Refine intent using conversation context
   */
  private refineWithContext(
    intent: Intent,
    message: string,
    state: ConversationState
  ): Intent {
    // If this is a follow-up, inherit context from previous question
    if (intent.type === 'followup' && state.questionsAsked.length > 0) {
      const lastQuestion = state.questionsAsked[state.questionsAsked.length - 1]
      return {
        ...intent,
        type: lastQuestion.intent.type,
        confidence: Math.max(intent.confidence, 0.75),
        requiresArtworkData: lastQuestion.intent.requiresArtworkData,
        requiresRAG: lastQuestion.intent.requiresRAG,
        requiresCalculation: lastQuestion.intent.requiresCalculation,
        entities: {
          ...lastQuestion.intent.entities,
          followUpContext: true
        }
      }
    }

    // Detect frustration based on conversation history
    if (state.questionsAsked && state.questionsAsked.length > 3) {
      const recentQuestions = state.questionsAsked.slice(-3)
      const repeatedTopics = this.detectRepeatedTopics(recentQuestions)
      
      if (repeatedTopics.length > 0 && this.isFrustration(message)) {
        return {
          type: 'frustration',
          confidence: 0.95,
          entities: {
            repeatedTopics,
            conversationLength: state.messageCount
          }
        }
      }
    }

    return intent
  }

  /**
   * Check if message is a greeting
   */
  private isGreeting(message: string): boolean {
    const greetingPatterns = [
      /^(hi|hello|hey|howdy|greetings|good morning|good afternoon|good evening)/i,
      /^(hi|hello)\s+(there|everyone|folks)/i,
      /^(what's up|sup|yo)/i
    ]
    return greetingPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message is a farewell
   */
  private isFarewell(message: string): boolean {
    const farewellPatterns = [
      /^(bye|goodbye|see you|later|farewell|thanks|thank you)/i,
      /^(that's all|that is all|i'm done|im done)/i
    ]
    return farewellPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message is a calculation request
   */
  private isCalculation(message: string): boolean {
    // If message has measurements, it's likely a calculation
    const hasMeasurements = /\d+\s*(cm|inch|in|px|pixel|x\d+)/i.test(message);
    
    const calculationPatterns = [
      /calculate/i,
      /what.*dpi.*(at|for|if|need|use|cm|inch|px)/i, // "What is the DPI at 20cm?" (has context)
      /what.*(size|dimension).*can.*print/i, // "What size can I print"
      /dpi (at|for|if|do i need|should i use)/i,
      /how (big|large|wide|tall|many pixels)/i,
      /max(imum)? size/i,
      /print size/i
    ]
    
    // Match if has measurements OR matches specific calculation patterns
    return hasMeasurements || calculationPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Check if message is a how-to question
   */
  private isHowTo(message: string): boolean {
    const howToPatterns = [
      /^how (do|can|to)/i,
      /how (do i|can i)/i,
      /what('s| is) the (best )?way to/i,
      /can you (show|tell|explain)/i,
      /show me how/i,
      /teach me/i,
      /tutorial/i,
      /steps to/i,
      /guide (for|to)/i
    ]
    return howToPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message is troubleshooting
   */
  private isTroubleshooting(message: string): boolean {
    const troublePatterns = [
      /(problem|issue|error|wrong|not working|doesn't work|broken)/i,
      /(fix|solve|resolve)/i,
      /(why (is|does|can't|won't))/i
    ]
    return troublePatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message is asking for repetition
   */
  private isRepeat(message: string): boolean {
    const repeatPatterns = [
      /^(what\?|huh\??|pardon\??|sorry\??|excuse me\??)$/i,
      /^what did you (say|mean)/i,
      /can you repeat/i,
      /say that again/i,
      /didn't (understand|get|catch)/i,
      /^again\??$/i,
      /^come again/i
    ]
    return repeatPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message is a follow-up
   */
  private isFollowUp(message: string): boolean {
    const followUpPatterns = [
      /^(and|also|what about|how about)/i,
      /^(ok|okay|alright),?\s+(and|but|so)/i,
      /^(yes|yeah|yep|sure),?\s+(and|but)/i
    ]
    return followUpPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message indicates frustration
   * NOTE: Made VERY conservative to avoid false positives
   */
  private isFrustration(message: string): boolean {
    // Only match EXPLICIT frustration expressions
    // Do NOT match general negative words like "issue", "problem", "help"
    const frustrationPatterns = [
      /\b(frustrated|annoyed)\b/i,  // Explicit frustration words
      /(give up|never mind|forget it)/i,  // Giving up
      /(terrible|awful|useless|horrible|worst)/i,  // Strong negative
      /!!{2,}/,  // Multiple exclamation marks (3+)
      /\?{3,}/,  // Multiple question marks (3+)
      /(ugh|argh|grrr)/i,  // Frustration sounds
      /this (is|isn't) working/i,  // Explicit "not working"
      /nothing (is )?working/i  // "nothing working"
    ]
    return frustrationPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message is an information request
   */
  private isInformation(message: string): boolean {
    const informationPatterns = [
      /^what is /i,
      /^what are /i,
      /tell me about/i,
      /explain/i,
      /define/i,
      /^who is /i,
      /^who are /i,
      /^where is /i,
      /^when is /i,
      /^why is /i
    ]
    return informationPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message is gibberish/unknown
   */
  private isUnknown(message: string): boolean {
    // Check for gibberish patterns
    const words = message.split(/\s+/)
    const cleanMessage = message.replace(/\s/g, '').toLowerCase()
    
    // If message is very short and has no recognizable words
    if (words.length <= 3 && cleanMessage.length >= 5) {
      // Check vowel/consonant ratio for gibberish detection
      const vowels = (cleanMessage.match(/[aeiou]/g) || []).length
      const consonants = (cleanMessage.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length
      const total = vowels + consonants
      
      if (total > 0) {
        const vowelRatio = vowels / total
        // Gibberish typically has very low or very high vowel ratios
        if (vowelRatio < 0.15 || vowelRatio > 0.85) {
          return true
        }
      }
      
      // Check for keyboard mashing patterns (adjacent keys)
      const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
      for (const row of keyboardRows) {
        if (row.includes(cleanMessage)) {
          return true
        }
      }
      
      // Random numbers and letters mixed
      if (/^[a-z0-9]{3,}$/i.test(cleanMessage) && /\d/.test(cleanMessage) && /[a-z]/i.test(cleanMessage)) {
        const digitRatio = (cleanMessage.match(/\d/g) || []).length / cleanMessage.length
        if (digitRatio > 0.3) {
          return true
        }
      }
    }
    
    return false
  }

  /**
   * Extract calculation entities from message
   */
  private extractCalculationEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extract dimensions
    const dimensionMatch = message.match(/(\d+(?:\.\d+)?)\s*(cm|inch|in|px|pixel)/i)
    if (dimensionMatch) {
      entities.dimension = parseFloat(dimensionMatch[1])
      entities.unit = dimensionMatch[2].toLowerCase()
    }

    // Extract DPI
    const dpiMatch = message.match(/(\d+)\s*dpi/i)
    if (dpiMatch) {
      entities.targetDPI = parseInt(dpiMatch[1])
    }

    // Check for "max" or "optimal"
    if (/max(imum)?|largest|biggest/i.test(message)) {
      entities.findMaximum = true
    }
    if (/optimal|best|recommended/i.test(message)) {
      entities.findOptimal = true
    }

    return entities
  }

  /**
   * Extract how-to entities from message
   */
  private extractHowToEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extract software mentioned
    const softwarePatterns = [
      { pattern: /photoshop/i, name: 'Photoshop' },
      { pattern: /illustrator/i, name: 'Illustrator' },
      { pattern: /canva/i, name: 'Canva' },
      { pattern: /gimp/i, name: 'GIMP' },
      { pattern: /inkscape/i, name: 'Inkscape' }
    ]

    for (const { pattern, name } of softwarePatterns) {
      if (pattern.test(message)) {
        entities.software = name
        break
      }
    }

    // Extract action
    if (/increase|raise|boost/i.test(message)) {
      entities.action = 'increase'
    } else if (/decrease|reduce|lower/i.test(message)) {
      entities.action = 'decrease'
    } else if (/fix|correct|repair/i.test(message)) {
      entities.action = 'fix'
    } else if (/create|make|generate/i.test(message)) {
      entities.action = 'create'
    }

    return entities
  }

  /**
   * Detect repeated topics in recent questions
   */
  private detectRepeatedTopics(questions: Array<{ question: string; intent: Intent }>): string[] {
    const topics: Record<string, number> = {}

    for (const q of questions) {
      const words = q.question.toLowerCase().split(/\s+/)
      for (const word of words) {
        if (word.length > 4) { // Only count significant words
          topics[word] = (topics[word] || 0) + 1
        }
      }
    }

    return Object.entries(topics)
      .filter(([_, count]) => count >= 2)
      .map(([topic]) => topic)
  }
}

