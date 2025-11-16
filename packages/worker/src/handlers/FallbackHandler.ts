/**
 * Fallback Handler
 * 
 * Handles unknown intents and provides helpful fallback responses.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class FallbackHandler implements Handler {
  name = 'fallback';
  version = '1.0.0';

  canHandle(_intent: Intent): boolean {
    // Fallback handler accepts all intents
    return true;
  }

  async handle(
    message: string,
    intent: Intent,
    _context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();

    const responseText = this.getFallbackResponse(message, intent);

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: 0.5
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

  private getFallbackResponse(_message: string, _intent: Intent): string {
    const responses = [
      "I'm not quite sure I understand. Could you rephrase that?",
      "I didn't quite catch that. Can you try asking in a different way?",
      "I'm here to help, but I need a bit more clarity. Could you elaborate?",
      "I want to make sure I give you the right information. Could you provide more details?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

