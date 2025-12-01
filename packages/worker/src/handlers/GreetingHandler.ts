/**
 * Greeting Handler
 * 
 * Handles greetings and farewells with personalized, context-aware responses.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class GreetingHandler implements Handler {
  name = 'GreetingHandler';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    return intent.type === 'greeting' || intent.type === 'farewell';
  }

  async handle(
    _message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();
    const state = context.conversationState;

    let responseText: string;

    if (intent.type === 'greeting') {
      // Check if this is a returning user
      const isReturning = state && state.messageCount > 0;

      if (isReturning) {
        responseText = this.getReturningGreeting(state);
      } else {
        responseText = this.getFirstTimeGreeting();
      }
    } else {
      // Farewell
      responseText = this.getFarewell(state);
    }

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: 1.0
      }
    };
  }

  private getFirstTimeGreeting(): string {
    // Warm, welcoming, personal (Dartmouth personality)
    const greetings = [
      "Hey there! 👋 I'm here to help make things easier for you. What are you working on today?",
      "Hi! I'm here to help with whatever you need. What can I do for you?",
      "Hello! Ready to help you out. What's on your mind?",
      "Hey! I'm here to make your day easier. What would you like help with?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getReturningGreeting(_state: any): string {
    // Friendly, recognizes returning user (Dartmouth personality)
    const greetings = [
      "Welcome back! Good to see you again. What can I help you with today?",
      "Hey! Great to have you back. What are you working on?",
      "Hi again! Ready to help with whatever you need.",
      "Welcome back! What can I do for you today?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getFarewell(_state: any): string {
    // Warm, genuine, inviting to return (Dartmouth personality)
    const farewells = [
      "Take care! I'm here anytime you need help.",
      "Have a great day! Come back anytime.",
      "See you later! Feel free to reach out whenever you need.",
      "Bye! I'm always here if you need anything."
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }
}

