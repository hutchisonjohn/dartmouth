/**
 * Repetition Detector
 * 
 * Detects when user is asking the same question or agent is giving the same answer.
 * Implements Section 5.1.7 from AGENT_ARMY_SYSTEM.md
 */

import type { ConversationState } from '../types/shared'

export class RepetitionDetector {
  /**
   * Detect if current question is a repetition
   */
  detectQuestionRepetition(
    currentQuestion: string,
    conversationState: ConversationState
  ): { isRepetition: boolean; previousQuestion?: string; count: number } {
    // Exclude meta-questions (questions ABOUT the conversation) from repetition detection
    // These should be answered with conversation context, not treated as repetition
    if (this.isMetaQuestion(currentQuestion)) {
      return { isRepetition: false, count: 0 };
    }

    if (!conversationState.questionsAsked || !Array.isArray(conversationState.questionsAsked)) {
      return { isRepetition: false, count: 0 };
    }
    const recentQuestions = conversationState.questionsAsked.slice(-5)
    const normalized = this.normalizeText(currentQuestion)

    let count = 0
    let previousQuestion: string | undefined

    for (const q of recentQuestions) {
      const similarity = this.calculateSimilarity(normalized, this.normalizeText(q.question))
      if (similarity > 0.8) {
        count++
        previousQuestion = q.question
      }
    }

    return {
      isRepetition: count > 0,
      previousQuestion,
      count
    }
  }

  /**
   * Detect if agent is repeating the same answer
   */
  detectAnswerRepetition(
    currentAnswer: string,
    conversationState: ConversationState
  ): { isRepetition: boolean; previousAnswer?: string; count: number } {
    if (!conversationState.answersGiven || !Array.isArray(conversationState.answersGiven)) {
      return { isRepetition: false, count: 0 };
    }
    const recentAnswers = conversationState.answersGiven.slice(-3)
    const normalized = this.normalizeText(currentAnswer)

    let count = 0
    let previousAnswer: string | undefined

    for (const a of recentAnswers) {
      const similarity = this.calculateSimilarity(normalized, this.normalizeText(a.answer))
      if (similarity > 0.7) {
        count++
        previousAnswer = a.answer
      }
    }

    return {
      isRepetition: count > 0,
      previousAnswer,
      count
    }
  }

  /**
   * Generate a varied response to avoid repetition
   */
  generateVariedResponse(originalAnswer: string, repetitionCount: number): string {
    const variations = [
      `As I mentioned earlier, ${originalAnswer}`,
      `To reiterate: ${originalAnswer}`,
      `Let me explain this differently: ${originalAnswer}`,
      `I understand this might be confusing. ${originalAnswer}`,
      `To clarify: ${originalAnswer}`
    ]

    const index = Math.min(repetitionCount - 1, variations.length - 1)
    return variations[index]
  }

  /**
   * Check if question is a meta-question (asking ABOUT the conversation)
   * These should NOT be treated as repetition - they should be answered with context
   */
  private isMetaQuestion(question: string): boolean {
    const lowerQuestion = question.toLowerCase();
    const metaPatterns = [
      /what did (i|you) (just )?say/i,
      /what (was|is) my (name|last message)/i,
      /do you (remember|know) (what|my|about)/i,
      /tell me (what|about) (i|we|my)/i,
      /what (do you|have i) (know|said|told)/i,
      /how many (messages|times|exchanges)/i,
      /what's my (name|email|address|location)/i,
      /did you (hear|understand|get|catch) (me|that|what i said)/i,
      /are you (listening|paying attention)/i,
      /can you (hear|understand) me/i
    ];
    
    return metaPatterns.some(pattern => pattern.test(lowerQuestion));
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Calculate similarity between two texts (Jaccard similarity)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' '))
    const words2 = new Set(text2.split(' '))

    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }
}

