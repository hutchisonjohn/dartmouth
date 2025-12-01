/**
 * Response Validator
 * 
 * Validates LLM responses for accuracy, hallucinations, and quality.
 * Implements Section 5.1.4 from AGENT_ARMY_SYSTEM.md
 */

import type { Response, ValidationResult, RAGResult } from '../types/shared'

export class ResponseValidator {
  /**
   * Validate a response
   */
  async validate(
    response: Response,
    originalQuestion: string,
    ragContext?: RAGResult,
    calculationData?: any
  ): Promise<ValidationResult> {
    const verifiedFacts: string[] = []
    const unverifiedFacts: string[] = []
    let score = 1.0

    // Rule 1: Check for citations if RAG was used
    if (ragContext && ragContext.chunks.length > 0) {
      const citationCheck = this.validateCitations(response.content, ragContext)
      if (!citationCheck.valid) {
        score -= 0.2
        unverifiedFacts.push('Response lacks proper citations from knowledge base')
      } else {
        verifiedFacts.push('Citations match knowledge base')
      }
    }

    // Rule 2: Validate calculations if present
    if (calculationData) {
      const calcCheck = this.validateCalculations(response.content, calculationData)
      if (!calcCheck.valid) {
        score -= 0.3
        unverifiedFacts.push('Calculations do not match provided data')
      } else {
        verifiedFacts.push('Calculations are accurate')
      }
    }

    // Rule 3: Check for hallucination patterns
    const hallucinationCheck = this.detectHallucinations(response.content)
    if (hallucinationCheck.detected) {
      score -= 0.4
      unverifiedFacts.push(...hallucinationCheck.patterns)
    } else {
      verifiedFacts.push('No hallucination patterns detected')
    }

    // Rule 4: Check response relevance to question
    const relevanceScore = this.checkRelevance(originalQuestion, response.content)
    if (relevanceScore < 0.5) {
      score -= 0.2
      unverifiedFacts.push('Response may not be relevant to question')
    } else {
      verifiedFacts.push('Response is relevant to question')
    }

    // Rule 5: Check for contradictions
    const contradictionCheck = this.detectContradictions(response.content)
    if (contradictionCheck.found) {
      score -= 0.3
      unverifiedFacts.push('Response contains contradictions')
    } else {
      verifiedFacts.push('No contradictions detected')
    }

    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score))

    return {
      isValid: score >= 0.7,
      score,
      verifiedFacts,
      unverifiedFacts,
      issues: unverifiedFacts,
      suggestedFix: score < 0.7 ? 'Please provide more specific information or rephrase your question.' : undefined
    }
  }

  /**
   * Validate that response cites sources correctly
   */
  private validateCitations(
    answer: string,
    ragContext: RAGResult
  ): { valid: boolean; missingCitations: string[] } {
    const missingCitations: string[] = []

    // Check if answer contains information from RAG chunks
    for (const chunk of ragContext.chunks) {
      // Extract key phrases from chunk (simple approach)
      const keyPhrases = this.extractKeyPhrases(chunk.text)
      
      for (const phrase of keyPhrases) {
        if (answer.toLowerCase().includes(phrase.toLowerCase())) {
          // Information from chunk is used, check if source is cited
          const sourceId = chunk.documentId || chunk.id
          if (sourceId && !answer.includes(sourceId)) {
            missingCitations.push(`Missing citation for: ${phrase}`)
          }
        }
      }
    }

    return {
      valid: missingCitations.length === 0,
      missingCitations
    }
  }

  /**
   * Validate calculations in response
   */
  private validateCalculations(
    answer: string,
    calculationData: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Extract numbers from answer
    const numbersInAnswer = this.extractNumbers(answer)

    // Check if expected numbers are present
    if (calculationData.dpi && !numbersInAnswer.includes(calculationData.dpi)) {
      errors.push(`Expected DPI ${calculationData.dpi} not found in answer`)
    }

    if (calculationData.width && !this.isNumberClose(numbersInAnswer, calculationData.width, 0.1)) {
      errors.push(`Expected width ${calculationData.width} not found in answer`)
    }

    if (calculationData.height && !this.isNumberClose(numbersInAnswer, calculationData.height, 0.1)) {
      errors.push(`Expected height ${calculationData.height} not found in answer`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Detect hallucination patterns
   */
  private detectHallucinations(answer: string): { detected: boolean; patterns: string[] } {
    const patterns: string[] = []

    // Pattern 1: Specific dates/times without source
    if (/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/i.test(answer)) {
      patterns.push('Contains specific dates without citation')
    }

    // Pattern 2: Specific statistics without source
    if (/\b\d+(\.\d+)?%\b/.test(answer) && !answer.includes('approximately') && !answer.includes('about')) {
      patterns.push('Contains precise statistics without qualification')
    }

    // Pattern 3: Absolute statements
    const absolutePatterns = [
      /\balways\b/i,
      /\bnever\b/i,
      /\beveryone\b/i,
      /\bno one\b/i,
      /\b100%\b/i
    ]
    for (const pattern of absolutePatterns) {
      if (pattern.test(answer)) {
        patterns.push('Contains absolute statements that may be inaccurate')
        break
      }
    }

    // Pattern 4: URLs or links without context
    if (/https?:\/\/[^\s]+/.test(answer) && !answer.includes('tutorial') && !answer.includes('guide')) {
      patterns.push('Contains URLs without proper context')
    }

    return {
      detected: patterns.length > 0,
      patterns
    }
  }

  /**
   * Check relevance of answer to question
   */
  private checkRelevance(question: string, answer: string): number {
    const questionWords = this.extractSignificantWords(question)
    const answerWords = this.extractSignificantWords(answer)

    // Calculate overlap
    const overlap = questionWords.filter(word => answerWords.includes(word))
    
    if (questionWords.length === 0) return 1.0
    
    return overlap.length / questionWords.length
  }

  /**
   * Detect contradictions in answer
   */
  private detectContradictions(answer: string): { found: boolean; contradictions: string[] } {
    const contradictions: string[] = []

    // Pattern 1: "Yes, but no" patterns
    if (/\byes\b.*\bbut\b.*\bno\b/i.test(answer) || /\bno\b.*\bbut\b.*\byes\b/i.test(answer)) {
      contradictions.push('Contains contradictory yes/no statements')
    }

    // Pattern 2: Conflicting numbers for same measurement
    const dpiMatches = answer.match(/(\d+)\s*dpi/gi)
    if (dpiMatches && dpiMatches.length > 1) {
      const dpis = dpiMatches.map(m => parseInt(m))
      const uniqueDpis = [...new Set(dpis)]
      if (uniqueDpis.length > 1 && !answer.includes('or') && !answer.includes('range')) {
        contradictions.push('Contains conflicting DPI values')
      }
    }

    return {
      found: contradictions.length > 0,
      contradictions
    }
  }

  /**
   * Extract key phrases from text
   */
  private extractKeyPhrases(text: string): string[] {
    // Simple approach: extract noun phrases (3+ word sequences)
    const words = text.toLowerCase().split(/\s+/)
    const phrases: string[] = []

    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ')
      if (phrase.length > 10) { // Only significant phrases
        phrases.push(phrase)
      }
    }

    return phrases
  }

  /**
   * Extract numbers from text
   */
  private extractNumbers(text: string): number[] {
    const matches = text.match(/\d+(\.\d+)?/g)
    return matches ? matches.map(m => parseFloat(m)) : []
  }

  /**
   * Check if a number is close to any in array
   */
  private isNumberClose(numbers: number[], target: number, tolerance: number): boolean {
    return numbers.some(num => Math.abs(num - target) <= tolerance)
  }

  /**
   * Extract significant words (filter stop words)
   */
  private extractSignificantWords(text: string): string[] {
    const stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'can', 'could', 'may', 'might', 'must', 'shall', 'of', 'at', 'by',
      'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
      'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ])

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
  }
}

