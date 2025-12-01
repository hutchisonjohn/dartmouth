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
    // Strip artwork context metadata before intent detection
    // Frontend appends "[Artwork Context: {...}]" which should NOT influence intent
    const cleanMessage = this.stripArtworkContext(message);
    const lowerMessage = cleanMessage.toLowerCase().trim()

    // HIGH PRIORITY: If user's ACTUAL message has pixels AND DPI, it's a calculation
    // This prevents ANY other intent from overriding calculation requests
    // BUT we check the CLEAN message (without artwork context metadata)
    const hasPixelsAndDPI = /\d+\s*x\s*\d+\s*(pixels?|px)/i.test(cleanMessage) && /\d+\s*dpi/i.test(cleanMessage);
    if (hasPixelsAndDPI) {
      return {
        type: 'calculation',
        confidence: 1.0,
        requiresCalculation: true,
        entities: this.extractCalculationEntities(cleanMessage)
      };
    }

    // Pattern-based detection
    const patternIntent = this.detectByPattern(lowerMessage)
    
    // Context-based refinement
    if (conversationState) {
      return this.refineWithContext(patternIntent, lowerMessage, conversationState)
    }

    return patternIntent
  }

  /**
   * Strip artwork context metadata from message for intent detection
   * Frontend appends "[Artwork Context: {...}]" which should not influence intent detection
   * BUT we keep it in the message for handlers/LLM to access the data
   * 
   * This method only strips it for the PURPOSE of intent classification,
   * not from the actual message that gets processed.
   */
  private stripArtworkContext(message: string): string {
    // Remove [Artwork Context: ...] section for intent detection only
    // The actual message passed to handlers will still have this data
    return message.replace(/\[Artwork Context:.*?\]/gs, '').trim();
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

    // Calculation patterns (MOVED UP - check BEFORE followup)
    // This prevents "What is the DPI at 20cm?" from being detected as followup
    if (this.isCalculation(message)) {
      return {
        type: 'calculation',
        confidence: 0.85,
        requiresCalculation: true,
        entities: this.extractCalculationEntities(message)
      }
    }

    // Follow-up patterns (MOVED DOWN - check AFTER calculation)
    if (this.isFollowUp(message)) {
      return {
        type: 'followup',
        confidence: 0.70,
        entities: {}
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
      console.log('[IntentDetector] ✅ Detected as INFORMATION intent');
      console.log('[IntentDetector] requiresRAG: true');
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
    // DON'T trigger frustration just because of conversation length
    // Only trigger if there's ACTUAL frustration in the message
    if (intent.type === 'frustration') {
      // Only keep frustration if message explicitly shows frustration
      if (!this.isFrustration(message)) {
        // Redetect without context
        return this.detectByPattern(message);
      }
    }

    // Check if user is responding to YouTube tutorial offer
    // ONLY if this looks like a yes/no/steps response (not a greeting or new question)
    const lastAssistantMessage = state.messages
      .filter((m: any) => m.role === 'assistant')
      .pop();
    
    // Check if this is a direct response to the tutorial offer
    const isYesNoStepsResponse = /^(yes|yeah|yep|sure|ok|okay|no|nope|nah|steps?|written|text)/i.test(message.trim());
    
    if (isYesNoStepsResponse && 
        lastAssistantMessage?.content?.includes('Would you like a quick YouTube tutorial?')) {
      // User is responding to YouTube tutorial offer - route back to HowToHandler
      console.log('[IntentDetector] ✅ Detected response to YouTube tutorial offer - routing to HOWTO');
      return {
        type: 'howto',
        confidence: 0.95,
        requiresRAG: true,
        entities: {
          isFollowUp: true,
          respondingToTutorialOffer: true
        }
      };
    }

    // If this is a follow-up, mark it as 'information' so LLM handles it with full context
    // DON'T inherit the previous handler type - the LLM is better at understanding context
    if (intent.type === 'followup' && state.questionsAsked.length > 0) {
      const lastQuestion = state.questionsAsked[state.questionsAsked.length - 1]
      return {
        ...intent,
        type: 'information',  // Route to LLM, not to previous handler
        confidence: 0.85,
        requiresContext: true,
        entities: {
          followUpContext: true,
          previousIntent: lastQuestion.intent.type,
          conversationHistory: true
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
      /^(bye|goodbye|see you|later|farewell|take care|chat soon|got to go|gotta go)/i,
      /^(thanks|thank you|that's all|that is all|i'm done|im done)/i,
      /\b(bye|goodbye|farewell)\b/i  // Also match these words anywhere in message
    ]
    return farewellPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Extract calculation entities from message
   */
  private extractCalculationEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract pixel dimensions
    const pixelMatch = message.match(/(\d+)\s*x\s*(\d+)\s*(pixels?|px)?/i);
    if (pixelMatch) {
      entities.widthPixels = parseInt(pixelMatch[1]);
      entities.heightPixels = parseInt(pixelMatch[2]);
    }
    
    // Extract DPI
    const dpiMatch = message.match(/(\d+)\s*dpi/i);
    if (dpiMatch) {
      entities.dpi = parseInt(dpiMatch[1]);
    }
    
    return entities;
  }

  /**
   * Check if message is a calculation request
   */
  private isCalculation(message: string): boolean {
    // If message has pixel dimensions and DPI, it's ALWAYS a calculation
    const hasPixelsAndDPI = /\d+\s*x\s*\d+\s*(pixels?|px)/i.test(message) && /\d+\s*dpi/i.test(message);
    if (hasPixelsAndDPI) return true;
    
    // DPI questions - let LLM handle them intelligently
    // Just detect if they mention DPI at all
    const mentionsDPI = /\d+\s*dpi/i.test(message);
    if (mentionsDPI) return true;
    
    // If asking GENERAL questions about DPI (no specific numbers), it's information, not calculation
    const isGeneralDPIQuestion = /what dpi (is )?(recommended|should|best)/i.test(message);
    if (isGeneralDPIQuestion) return false;
    
    // If message has measurements, it's likely a calculation
    const hasMeasurements = /\d+\s*(cm|inch|in|px|pixel|x\d+)/i.test(message);
    
    const calculationPatterns = [
      /calculate/i,
      /what.*dpi.*(at|for|if|need|use|cm|inch|px)/i, // "What is the DPI at 20cm?" (has context)
      /what.*(size|dimension).*can.*print/i, // "What size can I print"
      /(what about|can i print).*(pixels|x\d+)/i,  // "What about 6000x9000 pixels"
      /dpi (at|for|if|do i need|should i use)/i,
      /how (big|large|wide|tall).*can.*(i|we).*(print|make)/i, // "how big can I print?" (NOT "how big is my file?")
      /how many pixels.*need/i, // "how many pixels do I need?"
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
      /^(yes|yeah|yep|sure),?\s+(and|but)/i,
      // REMOVED: /^what (is|was|are|were|size)/i - Too broad! Catches "What is the DPI at 20cm?"
      // REPLACED WITH more specific patterns:
      /^what (was|were) (that|it)/i,  // "What was that?", "What were those?" (references past)
      /\b(that|this|it)\b/i,  // References to previous context (but NOT "my")
      /^(where|when|why) (was|did|were)/i  // Past tense questions (likely followup)
    ]
    return followUpPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message indicates frustration
   * NOTE: Made VERY conservative to avoid false positives
   * Punctuation alone (!!!, ???) is NOT frustration - it's just emphasis
   */
  private isFrustration(message: string): boolean {
    // Only match EXPLICIT frustration expressions
    // Do NOT match:
    // - General negative words like "issue", "problem", "help"
    // - Punctuation alone (!!!, ???) - that's just emphasis
    // - Questions about orders, products, etc.
    // MUST match FrustrationHandler.detectFrustrationLevel patterns exactly
    const frustrationPatterns = [
      /\b(frustrated|annoyed)\b/i,  // Explicit frustration words
      /(give up|never mind|forget it)/i,  // Giving up
      /(terrible|awful|useless|horrible|worst)/i,  // Strong negative
      /(ugh|argh|grrr)/i,  // Frustration sounds
      /this (is|isn't) working/i,  // Explicit "not working"
      /nothing (is )?working/i,  // "nothing working"
      /\b(fuck|shit|damn|hell|crap)\b/i  // Profanity
    ]
    return frustrationPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Check if message is an information request
   */
  private isInformation(message: string): boolean {
    // Check for file information questions FIRST (before general patterns)
    if (this.isFileInformation(message)) {
      return true;
    }
    
    const informationPatterns = [
      /^what is /i,
      /^what are /i,
      /^what can /i,  // "what can UV DTF be used for?"
      /^what does /i, // "what does UV DTF do?"
      /^what's /i,    // "what's UV DTF used for?"
      /^does (it|my|the)/i, // "does it have an ICC profile?"
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
   * Check if message is asking about file information
   */
  private isFileInformation(message: string): boolean {
    const filePatterns = [
      /how (big|large).*file/i, // "how big is my file?"
      /file size/i, // "what's the file size?"
      /what.*file.*size/i, // "what is the file size?"
      /size.*file/i // "size of my file"
    ]
    return filePatterns.some(pattern => pattern.test(message))
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

