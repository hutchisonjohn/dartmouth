/**
 * Information Handler
 * 
 * Handles information requests using RAG to provide accurate, sourced answers.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class InformationHandler implements Handler {
  name = 'InformationHandler';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    return intent.type === 'information';
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
          // Format RAG results into informative response
          responseText = this.formatInformationResponse(message, ragResults);
          sources = ragResults.map((r: any) => ({
            id: r.id,
            title: r.documentId,
            excerpt: r.text.substring(0, 100)
          }));
          confidence = 0.9;
        } else {
          responseText = this.getGenericInformationResponse(message);
        }
      } catch (error) {
        console.error('[InformationHandler] RAG error:', error);
        responseText = this.getGenericInformationResponse(message);
      }
    } else {
      responseText = this.getGenericInformationResponse(message);
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

  private formatInformationResponse(_question: string, ragResults: any[]): string {
    // Combine RAG results into coherent answer
    let response = "";

    // Use the most relevant result as the primary answer
    if (ragResults.length > 0) {
      response = ragResults[0].text;
    }

    // Add additional context from other results if available
    if (ragResults.length > 1) {
      response += "\n\nAdditional information:\n";
      for (let i = 1; i < Math.min(ragResults.length, 3); i++) {
        response += `\n• ${ragResults[i].text}`;
      }
    }

    return response;
  }

  private getGenericInformationResponse(_question: string): string {
    return "I'd be happy to provide information about that! However, I don't have specific details in my knowledge base at the moment. Could you rephrase your question or ask about something else I might be able to help with?";
  }
}

