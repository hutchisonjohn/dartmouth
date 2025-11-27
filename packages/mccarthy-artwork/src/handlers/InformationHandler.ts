/**
 * Information Handler
 * 
 * Handles information requests using RAG to provide accurate, sourced answers.
 */

import type { Intent, Response } from '@agent-army/shared';
import type { Handler, HandlerContext } from '@agent-army/shared';

export class InformationHandler implements Handler {
  name = 'InformationHandler';
  version = '1.0.0';
  private ragEngine: any;

  constructor(ragEngine: any) {
    this.ragEngine = ragEngine;
  }

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

    // Check if question is about artwork file properties (ICC profile, file size, etc.)
    const artworkData = context.state?.metadata?.artworkData;
    if (artworkData) {
      // ICC Profile questions
      if (/icc profile|color profile|embedded profile/i.test(message)) {
        const hasICC = artworkData.iccProfile && artworkData.iccProfile !== 'Unknown' && artworkData.iccProfile !== 'None';
        responseText = hasICC 
          ? `Yes, your artwork has an embedded ICC profile (${artworkData.iccProfile}).`
          : `No, your artwork does not have an embedded ICC profile.`;
        
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
      
      // File size questions
      if (/file size|how big.*file|how large.*file|what.*size.*file/i.test(message)) {
        if (artworkData.fileSize && artworkData.fileSize !== 'Unknown') {
          responseText = `Your file is ${artworkData.fileSize}.`;
        } else {
          responseText = "I don't have the file size information available.";
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
    }

    // Try to get answer from RAG knowledge base
    if (this.ragEngine && intent.requiresRAG) {
      try {
        const ragResults = await this.ragEngine.retrieve(
          context.state?.agentId || 'default',
          message,
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

