/**
 * Frustration Handler Implementation
 * 
 * Handles frustrated users with empathetic, de-escalating responses.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class FrustrationHandlerImpl implements Handler {
  name = 'FrustrationHandler';
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
    // Empathetic, solution-focused, genuine (Dartmouth personality)
    switch (level) {
      case 'critical':
        return "I'm really sorry this has been so frustrating! Let me try to help. Can you tell me specifically what the issue is? If I can't resolve it, I'll make sure to connect you with our team who can.";
      
      case 'high':
        return "I can see this is frustrating - I'm really sorry about that! Let me understand what's going on. What specifically is the issue? I want to help if I can.";
      
      case 'moderate':
        return "I understand this isn't working the way you need it to, and I apologize! Let's figure this out together. What's the most important thing you're trying to do?";
      
      case 'mild':
      default:
        return "I want to make sure I'm actually helping you here. What's not quite working for you? Let's get this sorted out!";
    }
  }
}

