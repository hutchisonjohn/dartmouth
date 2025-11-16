/**
 * Frustration Handler Implementation
 * 
 * Handles frustrated users with empathetic, de-escalating responses.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class FrustrationHandlerImpl implements Handler {
  name = 'frustration';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    return intent.type === 'frustration';
  }

  async handle(
    message: string,
    _intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();
    const state = context.conversationState;

    // Detect frustration level
    const frustrationLevel = context.frustrationHandler?.detectFrustrationLevel(
      message,
      state?.answersGiven || []
    ) || 'mild';

    const responseText = this.getEmpathicResponse(frustrationLevel, message);

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: 0.95,
        frustrationLevel
      },
      suggestions: [
        {
          type: 'human',
          text: 'Connect with a human',
          action: 'escalate',
          priority: 'high'
        },
        {
          type: 'restart',
          text: 'Start over',
          action: 'restart',
          priority: 'medium'
        }
      ]
    };
  }

  private getEmpathicResponse(level: string, _message: string): string {
    switch (level) {
      case 'critical':
        return "I sincerely apologize for the frustration. I want to help you get this resolved. Would you like me to connect you with someone who can provide more personalized assistance?";
      
      case 'high':
        return "I understand this is frustrating, and I apologize. Let me try a different approach to help you better. What specific part can I clarify?";
      
      case 'moderate':
        return "I can see this isn't working as expected, and I'm sorry about that. Let's take a step back - what's the main thing you're trying to accomplish?";
      
      case 'mild':
      default:
        return "I sense some confusion, and I want to make sure I'm helping you effectively. Could you tell me what's not working for you?";
    }
  }
}

