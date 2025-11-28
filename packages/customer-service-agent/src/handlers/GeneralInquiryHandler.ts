/**
 * General Inquiry Handler
 * 
 * Handles general customer inquiries that don't fit into specific categories.
 * Uses RAG system for knowledge base queries.
 * 
 * Created: Nov 28, 2025
 */

import type { Intent, Response } from '../../../worker/src/types/shared';
import type { Handler, HandlerContext } from '../../../worker/src/components/ResponseRouter';

export class GeneralInquiryHandler implements Handler {
  name = 'GeneralInquiryHandler';
  version = '1.0.0';
  priority = 1; // Lowest priority - catch-all handler

  constructor() {
    console.log('[GeneralInquiryHandler] Initialized');
  }

  canHandle(intent: Intent): boolean {
    // Catch-all for general inquiries, questions, help requests
    return intent.type === 'general' || 
           intent.type === 'question' ||
           intent.type === 'help' ||
           intent.type === 'unknown';
  }

  /**
   * Handle general inquiry
   */
  async handle(message: string, intent: Intent, context: HandlerContext): Promise<Response> {
    console.log('[GeneralInquiryHandler] Handling general inquiry');
    const startTime = Date.now();

    try {
      // Use RAG context if available
      let content = '';
      
      if (context.ragContext) {
        // RAG found relevant information
        content = `Based on our knowledge base:\n\n${context.ragContext}\n\n`;
        content += `Does this answer your question? If you need more specific help, just let me know!`;
      } else {
        // No RAG context - provide general helpful response
        content = `I'm here to help! I can assist you with:\n\n`;
        content += `• Order status and tracking\n`;
        content += `• Production and artwork status\n`;
        content += `• Invoice and payment information\n`;
        content += `• General questions about our services\n\n`;
        content += `What would you like to know more about?`;
      }

      return {
        content,
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          confidence: context.ragContext ? 0.75 : 0.6,
          usedRAG: !!context.ragContext,
          intentType: intent.type
        }
      };

    } catch (error) {
      console.error('[GeneralInquiryHandler] Error:', error);
      return {
        content: "I'm here to help! Could you tell me a bit more about what you're looking for? I can help with order status, production updates, invoices, and general questions.",
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          confidence: 0.5,
          error: 'unexpected_error'
        }
      };
    }
  }
}
