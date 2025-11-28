/**
 * General Inquiry Handler
 * 
 * Handles general customer inquiries that don't fit into specific categories.
 * Uses BaseAgent's RAG system for knowledge base queries.
 * 
 * Created: Nov 28, 2025
 */

import type { AgentRequest, AgentResponse } from '../../../worker/src/types/shared';

export class GeneralInquiryHandler {
  constructor() {
    console.log('[GeneralInquiryHandler] Initialized');
  }

  /**
   * Handle general inquiry
   */
  async handle(request: AgentRequest, baseResponse: AgentResponse): Promise<AgentResponse> {
    console.log('[GeneralInquiryHandler] Handling general inquiry');

    // BaseAgent has already processed the message with RAG, quality checks, etc.
    // We just need to enhance the response with customer service touches

    return this.enhanceResponse(baseResponse, request);
  }

  /**
   * Enhance response with customer service touches
   */
  private enhanceResponse(baseResponse: AgentResponse, request: AgentRequest): AgentResponse {
    let content = baseResponse.content;

    // 1. Add greeting if first message
    if (this.isFirstMessage(request)) {
      content = this.addGreeting(content);
    }

    // 2. Add helpful closing
    content = this.addHelpfulClosing(content, baseResponse.intent?.type);

    // 3. Add empathy if needed
    if (this.needsEmpathy(request.message)) {
      content = this.addEmpathy(content);
    }

    return {
      ...baseResponse,
      content,
      confidence: Math.max(baseResponse.confidence, 0.8), // Boost confidence for general inquiries
    };
  }

  /**
   * Check if this is the first message
   */
  private isFirstMessage(request: AgentRequest): boolean {
    return !request.metadata?.previousMessages || request.metadata.previousMessages.length === 0;
  }

  /**
   * Add greeting
   */
  private addGreeting(content: string): string {
    const greetings = [
      'Hi there! 👋',
      'Hello!',
      'Thanks for reaching out!',
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    return `${greeting}\n\n${content}`;
  }

  /**
   * Add helpful closing
   */
  private addHelpfulClosing(content: string, intentType?: string): string {
    // Don't add closing if already has a question
    if (content.includes('?') && content.trim().endsWith('?')) {
      return content;
    }

    const closings: Record<string, string> = {
      'product_inquiry': '\n\nWould you like to know anything else about our products?',
      'pricing': '\n\nWould you like a detailed quote for your specific needs?',
      'shipping': '\n\nDo you have any other questions about shipping?',
      'returns': '\n\nIs there anything else I can help you with regarding returns?',
      'default': '\n\nHow else can I help you today?',
    };

    const closing = closings[intentType || 'default'] || closings['default'];
    return `${content}${closing}`;
  }

  /**
   * Check if message needs empathy
   */
  private needsEmpathy(message: string): boolean {
    const empathyTriggers = [
      'problem',
      'issue',
      'wrong',
      'mistake',
      'error',
      'disappointed',
      'frustrated',
      'unhappy',
      'confused',
      'worried',
    ];

    const lowerMessage = message.toLowerCase();
    return empathyTriggers.some(trigger => lowerMessage.includes(trigger));
  }

  /**
   * Add empathy to response
   */
  private addEmpathy(content: string): string {
    const empathyPhrases = [
      'I understand this can be frustrating.',
      'I appreciate your patience with this.',
      'I can see why this would be concerning.',
      'Thank you for bringing this to our attention.',
    ];

    const phrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    
    // Add empathy after the first sentence
    const sentences = content.split('. ');
    if (sentences.length > 1) {
      sentences.splice(1, 0, phrase);
      return sentences.join('. ');
    }

    return `${phrase} ${content}`;
  }
}

