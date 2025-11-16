/**
 * Greeting Handler
 * 
 * Handles greetings and farewells with personalized, context-aware responses.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class GreetingHandler implements Handler {
  name = 'greeting';
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
    const greetings = [
      "Hello! I'm here to help you. What can I assist you with today?",
      "Hi there! How can I help you today?",
      "Welcome! I'm ready to assist you. What would you like to know?",
      "Hello! What can I do for you today?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getReturningGreeting(_state: any): string {
    const greetings = [
      "Welcome back! How can I help you today?",
      "Hello again! What can I assist you with?",
      "Good to see you again! What would you like to know?",
      "Hi! Ready to help you with anything you need."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getFarewell(_state: any): string {
    const farewells = [
      "Goodbye! Feel free to come back if you have more questions.",
      "Take care! I'm here whenever you need help.",
      "Bye! Don't hesitate to reach out if you need anything else.",
      "See you later! Have a great day!"
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }
}

