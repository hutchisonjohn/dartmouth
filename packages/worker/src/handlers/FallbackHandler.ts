/**
 * Fallback Handler
 * 
 * Handles unknown intents and provides helpful fallback responses.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class FallbackHandler implements Handler {
  name = 'FallbackHandler';
  version = '1.0.0';

  canHandle(_intent: Intent): boolean {
    // Fallback handler accepts all intents
    return true;
  }

  async handle(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();

    // UPDATED 2025-11-23: Check if we have conversation history
    // If mid-conversation, use LLM with context instead of generic response
    const hasContext = context.state && context.state.messages && context.state.messages.length > 1;
    
    if (hasContext) {
      // Mid-conversation - use contextual response
      const responseText = await this.generateContextualResponse(message, context);
      
      return {
        content: responseText,
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          cached: false,
          confidence: 0.7,
          contextAware: true
        }
      };
    }

    // First message - use generic fallback
    const responseText = this.getFallbackResponse(message, intent);

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: 0.5,
        contextAware: false
      },
      suggestions: [
        {
          type: 'rephrase',
          text: 'Try rephrasing your question',
          action: 'rephrase',
          priority: 'high'
        },
        {
          type: 'help',
          text: 'Ask for help',
          action: 'help',
          priority: 'medium'
        }
      ]
    };
  }

  /**
   * Generate contextual response using conversation history
   * 
   * ADDED 2025-11-23: Prevents "I don't understand" mid-conversation
   * 
   * @param message Current user message
   * @param context Handler context with conversation history
   * @returns Contextual response based on conversation
   */
  private async generateContextualResponse(message: string, context: HandlerContext): Promise<string> {
    // Get last 5 messages for context
    const recentMessages = context.state?.messages?.slice(-5) || [];
    const conversationContext = recentMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    // For now, provide a contextual fallback response
    // In future, this could call LLM with conversation history
    return `I understand we're discussing ${this.extractTopic(conversationContext)}. Could you clarify what you'd like to know about that?`;
  }

  /**
   * Extract topic from conversation context
   * 
   * @param context Conversation history
   * @returns Topic string
   */
  private extractTopic(context: string): string {
    // Simple topic extraction - look for common keywords
    if (context.toLowerCase().includes('artwork') || context.toLowerCase().includes('dpi')) {
      return 'your artwork';
    }
    if (context.toLowerCase().includes('price') || context.toLowerCase().includes('cost')) {
      return 'pricing';
    }
    if (context.toLowerCase().includes('size') || context.toLowerCase().includes('dimension')) {
      return 'sizing';
    }
    return 'this';
  }

  private getFallbackResponse(_message: string, _intent: Intent): string {
    // Helpful, not robotic - shows willingness to help (Dartmouth personality)
    const responses = [
      "I'm here to help! Could you tell me a bit more about what you need?",
      "I want to make sure I give you the right answer! Could you rephrase that or give me a bit more detail?",
      "I'm not following - but I really want to help! Can you explain what you need in a different way?",
      "Let me make sure I understand you correctly. Could you give me a bit more context about what you're looking for?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

