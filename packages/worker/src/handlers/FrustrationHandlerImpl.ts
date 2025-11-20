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
        return "I'm really sorry this has been so frustrating! I'd like to help you get this sorted out. Please reach out to our friendly team via email and they'll prioritize your issue. What else can I help you with right now?";
      
      case 'high':
        return "I can see this is frustrating - I'm really sorry about that! If you'd like, I can help you get in touch with our support team who can provide more direct assistance. What would be most helpful for you right now?";
      
      case 'moderate':
        return "I understand this isn't working the way you need it to, and I apologize! Let's figure this out together. What's the most important thing you're trying to do?";
      
      case 'mild':
      default:
        return "I want to make sure I'm actually helping you here. What's not quite working for you? Let's get this sorted out!";
    }
  }
}

