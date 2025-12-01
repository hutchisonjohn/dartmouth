/**
 * How-To Handler
 * 
 * Handles "how to" questions using RAG to provide step-by-step instructions.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class HowToHandler implements Handler {
  name = 'HowToHandler';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    return intent.type === 'howto';
  }

  async handle(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();

    let responseText: string;
    let sources: any[] = [];
    let confidence = 0.7;

    // Try to get answer from RAG knowledge base
    if (context.ragEngine && intent.requiresRAG) {
      try {
        const ragResults = await context.ragEngine.retrieve(
          message,
          context.state?.agentId || 'default',
          5
        );

        if (ragResults && ragResults.length > 0) {
          // Format RAG results into step-by-step instructions
          responseText = this.formatHowToResponse(message, ragResults);
          sources = ragResults.map((r: any) => ({
            id: r.id,
            title: r.documentId,
            excerpt: r.text.substring(0, 100)
          }));
          confidence = 0.9;
        } else {
          responseText = this.getGenericHowToResponse(message);
        }
      } catch (error) {
        console.error('[HowToHandler] RAG error:', error);
        responseText = this.getGenericHowToResponse(message);
      }
    } else {
      responseText = this.getGenericHowToResponse(message);
    }

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence,
        sources: sources.length > 0 ? sources : undefined
      }
    };
  }

  private formatHowToResponse(_question: string, ragResults: any[]): string {
    // Combine RAG results into step-by-step format
    let response = "Here's how to do that:\n\n";

    ragResults.forEach((result, index) => {
      response += `${index + 1}. ${result.text}\n\n`;
    });

    response += "\nLet me know if you need clarification on any of these steps!";
    
    return response;
  }

  private getGenericHowToResponse(_question: string): string {
    return "I'd be happy to help with that! However, I need more specific information to provide accurate step-by-step instructions. Could you provide more details about what you're trying to accomplish?";
  }
}

