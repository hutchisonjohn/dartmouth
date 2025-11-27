/**
 * How-To Handler
 * 
 * Handles "how to" questions using RAG to provide step-by-step instructions.
 */

import type { Intent, Response } from '@agent-army/shared';
import type { Handler, HandlerContext } from '@agent-army/shared';

export class HowToHandler implements Handler {
  name = 'HowToHandler';
  version = '1.0.0';
  private ragEngine: any;

  constructor(ragEngine: any) {
    this.ragEngine = ragEngine;
  }

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
    if (this.ragEngine && intent.requiresRAG) {
      try {
        // Strip artwork context from message before RAG query (it's too long for KV key limit)
        // Format: "question\n\n,{...json...}" or "[Artwork Context: {...}]"
        let cleanMessage = message.replace(/\[Artwork Context:.*?\]/gs, '').trim();
        // Also strip JSON that starts after double newline
        cleanMessage = cleanMessage.split('\n\n')[0].trim();
        
        const ragResults = await this.ragEngine.retrieve(
          'mccarthy-artwork',  // Use McCarthy's agent ID to get artwork-specific knowledge
          cleanMessage,  // Use clean message without artwork context
          5
        );

        console.log('[HowToHandler] 📊 RAG RESULTS:', {
          count: ragResults?.chunks?.length || 0,
          hasResults: !!(ragResults && ragResults.chunks && ragResults.chunks.length > 0),
          confidence: ragResults?.confidence || 0
        });

        if (ragResults && ragResults.chunks && ragResults.chunks.length > 0) {
          console.log('[HowToHandler] ✅ RAG returned', ragResults.chunks.length, 'chunks');
          console.log('[HowToHandler] Top chunk preview:', ragResults.chunks[0].text.substring(0, 200));
          
          // Format RAG results into step-by-step instructions
          responseText = this.formatHowToResponse(message, ragResults.chunks);
          
          console.log('[HowToHandler] 📝 FORMATTED RESPONSE:', responseText.substring(0, 200));
          
          sources = ragResults.chunks.map((chunk: any) => ({
            id: chunk.id,
            title: chunk.documentId,
            excerpt: chunk.text.substring(0, 100)
          }));
          confidence = ragResults.confidence || 0.9;
        } else {
          console.log('[HowToHandler] ❌ NO RAG RESULTS - using generic response');
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

