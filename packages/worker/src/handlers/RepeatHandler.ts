/**
 * Repeat Handler
 * 
 * Handles repeated questions by providing varied responses and detecting user frustration.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class RepeatHandler implements Handler {
  name = 'RepeatHandler';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    return intent.type === 'repeat';
  }

  async handle(
    message: string,
    _intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();
    const state = context.conversationState;

    // Find the previous answer to this question
    const previousAnswer = this.findPreviousAnswer(message, state);

    let responseText: string;

    if (previousAnswer) {
      // Provide a varied response
      responseText = this.getVariedResponse(previousAnswer, message);
    } else {
      // If we can't find the previous answer, it means the user is repeating a statement/command
      // NOT a question. In this case, we should use the LLM to handle it intelligently.
      // Return null to signal that LLM fallback should be used.
      return {
        content: '', // Empty content signals LLM should handle this
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0.3, // Low confidence - prefer LLM
          useLLMFallback: true // Explicit flag
        }
      };
    }

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: 0.9
      },
      suggestions: [
        {
          type: 'clarification',
          text: 'Ask for clarification on a specific part',
          action: 'clarify',
          priority: 'high'
        },
        {
          type: 'example',
          text: 'Ask for an example',
          action: 'example',
          priority: 'medium'
        }
      ]
    };
  }

  private findPreviousAnswer(_question: string, state: any): string | null {
    if (!state || !state.answersGiven || state.answersGiven.length === 0) {
      return null;
    }

    // Find the most recent answer (simplified - in production would use similarity matching)
    const lastAnswer = state.answersGiven[state.answersGiven.length - 1];
    return lastAnswer?.answer || null;
  }

  private getVariedResponse(previousAnswer: string, _question: string): string {
    // Contextual, remembers what was said, offers different explanation (Dartmouth personality)
    const variations = [
      `Just to recap what we discussed: ${previousAnswer}\n\nIs there a specific part you'd like me to explain differently?`,
      `Let me try explaining this another way: ${previousAnswer}\n\nDoes that make more sense?`,
      `I want to make sure this is clear! Here's what I said before: ${previousAnswer}\n\nWhat part would you like me to clarify?`,
      `Good question - let me break this down differently: ${previousAnswer}\n\nIs there something specific that's confusing?`
    ];

    return variations[Math.floor(Math.random() * variations.length)];
  }
}

