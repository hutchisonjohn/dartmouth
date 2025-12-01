/**
 * Empathy Injector
 * 
 * Adds empathy and warmth to responses based on user sentiment and context.
 * Part of Dartmouth's Conversation Quality System.
 * 
 * Based on: Personalised Conversational Agent Guidelines.md
 */

export type UserSentiment = 'neutral' | 'frustrated' | 'confused' | 'excited' | 'worried' | 'grateful'

export interface EmpathyContext {
  sentiment: UserSentiment
  isFirstMessage: boolean
  hasIssue: boolean
  isUrgent: boolean
  conversationLength: number
}

export class EmpathyInjector {
  /**
   * Add empathy to a response based on user sentiment
   */
  addEmpathy(response: string, context: EmpathyContext): string {
    // First message - always warm welcome
    if (context.isFirstMessage) {
      return this.addWelcome(response)
    }
    
    // Add sentiment-specific empathy
    switch (context.sentiment) {
      case 'frustrated':
        return this.addFrustratedEmpathy(response, context)
      
      case 'confused':
        return this.addConfusedEmpathy(response, context)
      
      case 'excited':
        return this.addExcitedEmpathy(response)
      
      case 'worried':
        return this.addWorriedEmpathy(response, context)
      
      case 'grateful':
        return this.addGratefulEmpathy(response)
      
      default:
        return response
    }
  }
  
  /**
   * Add warm welcome for first message
   */
  private addWelcome(response: string): string {
    const welcomes = [
      'Hey there! 👋 ',
      'Hi! ',
      'Hello! ',
      'Hey! '
    ]
    
    const welcome = this.randomChoice(welcomes)
    
    // Don't add if response already starts with greeting
    if (this.startsWithGreeting(response)) {
      return response
    }
    
    return welcome + response
  }
  
  /**
   * Add empathy for frustrated users
   */
  private addFrustratedEmpathy(response: string, context: EmpathyContext): string {
    const empathyPhrases = [
      'I understand this can be frustrating! ',
      'I hear you - that\'s frustrating! ',
      'I can see why that\'s frustrating! ',
      'I\'m really sorry about that! '
    ]
    
    // For urgent issues, be more direct
    if (context.isUrgent) {
      return 'I\'m on it! ' + response
    }
    
    const empathy = this.randomChoice(empathyPhrases)
    
    // Don't add if response already has empathy
    if (this.hasEmpathy(response)) {
      return response
    }
    
    return empathy + response
  }
  
  /**
   * Add empathy for confused users
   */
  private addConfusedEmpathy(response: string, context: EmpathyContext): string {
    const empathyPhrases = [
      'No worries, let me explain! ',
      'Happy to clarify! ',
      'Let me break this down! ',
      'Good question! '
    ]
    
    const empathy = this.randomChoice(empathyPhrases)
    
    // Don't add if response already has empathy
    if (this.hasEmpathy(response)) {
      return response
    }
    
    return empathy + response
  }
  
  /**
   * Add empathy for excited users
   */
  private addExcitedEmpathy(response: string): string {
    const empathyPhrases = [
      'That\'s awesome! ',
      'Love it! ',
      'Exciting! ',
      'Great! '
    ]
    
    const empathy = this.randomChoice(empathyPhrases)
    
    // Don't add if response already has excitement
    if (this.hasExcitement(response)) {
      return response
    }
    
    return empathy + response
  }
  
  /**
   * Add empathy for worried users
   */
  private addWorriedEmpathy(response: string, context: EmpathyContext): string {
    const empathyPhrases = [
      'Don\'t worry! ',
      'No need to worry! ',
      'It\'s going to be fine! ',
      'Let me help you with that! '
    ]
    
    const empathy = this.randomChoice(empathyPhrases)
    
    // Don't add if response already has reassurance
    if (this.hasReassurance(response)) {
      return response
    }
    
    return empathy + response
  }
  
  /**
   * Add empathy for grateful users
   */
  private addGratefulEmpathy(response: string): string {
    const empathyPhrases = [
      'You\'re very welcome! ',
      'Happy to help! ',
      'My pleasure! ',
      'Anytime! '
    ]
    
    const empathy = this.randomChoice(empathyPhrases)
    
    // Don't add if response already has gratitude response
    if (this.hasGratitudeResponse(response)) {
      return response
    }
    
    return empathy + response
  }
  
  /**
   * Detect user sentiment from message
   */
  detectSentiment(message: string, conversationHistory: string[]): UserSentiment {
    const lowerMessage = message.toLowerCase()
    
    // Frustrated indicators
    const frustratedPatterns = [
      /not work/i,
      /doesn't work/i,
      /won't work/i,
      /broken/i,
      /terrible/i,
      /awful/i,
      /frustrated/i,
      /annoyed/i,
      /angry/i,
      /wtf/i,
      /what the/i,
      /seriously/i,
      /ridiculous/i
    ]
    
    if (frustratedPatterns.some(p => p.test(lowerMessage))) {
      return 'frustrated'
    }
    
    // Confused indicators
    const confusedPatterns = [
      /don't understand/i,
      /confused/i,
      /what do you mean/i,
      /explain/i,
      /clarify/i,
      /huh/i,
      /what\?$/i,
      /how do i/i,
      /i don't get/i
    ]
    
    if (confusedPatterns.some(p => p.test(lowerMessage))) {
      return 'confused'
    }
    
    // Excited indicators
    const excitedPatterns = [
      /awesome/i,
      /amazing/i,
      /great/i,
      /perfect/i,
      /love/i,
      /excited/i,
      /can't wait/i,
      /!/,
      /😊|😄|🎉|❤️/
    ]
    
    if (excitedPatterns.some(p => p.test(lowerMessage))) {
      return 'excited'
    }
    
    // Worried indicators
    const worriedPatterns = [
      /worried/i,
      /concerned/i,
      /afraid/i,
      /nervous/i,
      /will it/i,
      /what if/i,
      /hope/i
    ]
    
    if (worriedPatterns.some(p => p.test(lowerMessage))) {
      return 'worried'
    }
    
    // Grateful indicators
    const gratefulPatterns = [
      /thank/i,
      /thanks/i,
      /appreciate/i,
      /grateful/i,
      /helpful/i
    ]
    
    if (gratefulPatterns.some(p => p.test(lowerMessage))) {
      return 'grateful'
    }
    
    return 'neutral'
  }
  
  /**
   * Check if response already starts with greeting
   */
  private startsWithGreeting(response: string): boolean {
    const greetings = ['hey', 'hi', 'hello', 'welcome']
    const firstWord = response.toLowerCase().split(/\s+/)[0]
    return greetings.some(g => firstWord.startsWith(g))
  }
  
  /**
   * Check if response already has empathy
   */
  private hasEmpathy(response: string): boolean {
    const empathyPhrases = [
      'i understand',
      'i hear you',
      'i can see',
      'no worries',
      'don\'t worry',
      'frustrating',
      'sorry'
    ]
    
    const lowerResponse = response.toLowerCase()
    return empathyPhrases.some(phrase => lowerResponse.includes(phrase))
  }
  
  /**
   * Check if response already has excitement
   */
  private hasExcitement(response: string): boolean {
    const excitementPhrases = [
      'awesome',
      'great',
      'amazing',
      'love it',
      'exciting',
      '!'
    ]
    
    const lowerResponse = response.toLowerCase()
    return excitementPhrases.some(phrase => lowerResponse.includes(phrase))
  }
  
  /**
   * Check if response already has reassurance
   */
  private hasReassurance(response: string): boolean {
    const reassurancePhrases = [
      'don\'t worry',
      'no need to worry',
      'it\'s fine',
      'it\'s going to be',
      'no problem'
    ]
    
    const lowerResponse = response.toLowerCase()
    return reassurancePhrases.some(phrase => lowerResponse.includes(phrase))
  }
  
  /**
   * Check if response already has gratitude response
   */
  private hasGratitudeResponse(response: string): boolean {
    const gratitudePhrases = [
      'welcome',
      'happy to help',
      'pleasure',
      'anytime',
      'glad'
    ]
    
    const lowerResponse = response.toLowerCase()
    return gratitudePhrases.some(phrase => lowerResponse.includes(phrase))
  }
  
  /**
   * Random choice from array
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }
}

