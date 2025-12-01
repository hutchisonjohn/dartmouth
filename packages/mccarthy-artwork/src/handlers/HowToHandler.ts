/**
 * How-To Handler
 * 
 * Handles "how to" questions using RAG to provide step-by-step instructions.
 */

import type { Intent, Response } from '@agent-army/shared';
import type { Handler, HandlerContext } from '@agent-army/shared';

export class HowToHandler implements Handler {
  name = 'HowToHandler';
  version = '2.0.0';
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

    console.log('[HowToHandler] 📚 HANDLING HOW-TO QUESTION');
    console.log('[HowToHandler] Message:', message);

    // Check conversation history to see if we're in a follow-up
    const conversationHistory = context.state?.messages || [];
    const lastAssistantMessage = conversationHistory
      .filter((m: any) => m.role === 'assistant')
      .pop();

    // Check if we just asked about YouTube tutorial
    const askedAboutTutorial = lastAssistantMessage?.content?.includes('Would you like a quick YouTube tutorial?');

    if (askedAboutTutorial) {
      // User is responding to our tutorial offer
      if (this.isAffirmativeResponse(message)) {
        // User wants YouTube tutorial
        return this.provideYouTubeTutorial(lastAssistantMessage.metadata?.howToTopic || message, startTime);
      } else if (this.isNegativeResponse(message) || message.toLowerCase().includes('step')) {
        // User wants written steps
        return await this.provideWrittenSteps(lastAssistantMessage.metadata?.howToTopic || message, context, startTime);
      }
    }

    // First time asking - offer YouTube tutorial
    const topic = this.extractHowToTopic(message);
    
    return {
      content: `Would you like a quick YouTube tutorial?`,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: 0.95,
        howToTopic: topic,
        originalQuestion: message
      }
    };
  }

  private provideYouTubeTutorial(topic: string, startTime: number): Response {
    // Create YouTube search URL
    const searchQuery = topic
      .replace(/^how (do i|to|can i)\s+/i, '') // Remove "how do I/to/can I"
      .replace(/\?$/, '') // Remove trailing ?
      .trim();
    
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' photoshop tutorial')}`;
    
    console.log('[HowToHandler] 🎬 Providing YouTube link for:', searchQuery);

    return {
      content: `Here's a YouTube search for "${searchQuery}":\n\n🎬 ${youtubeSearchUrl}\n\nYou'll find great video tutorials there!`,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: 0.95,
        youtubeLink: youtubeSearchUrl
      }
    };
  }

  private async provideWrittenSteps(
    topic: string,
    context: HandlerContext,
    startTime: number
  ): Promise<Response> {
    console.log('[HowToHandler] 📝 Providing written steps for:', topic);

    let responseText: string;
    let sources: any[] = [];
    let confidence = 0.7;

    // Try to get answer from RAG knowledge base
    if (this.ragEngine) {
      try {
        // Strip artwork context from message before RAG query
        let cleanMessage = topic.replace(/\[Artwork Context:.*?\]/gs, '').trim();
        cleanMessage = cleanMessage.split('\n\n')[0].trim();
        
        const ragResults = await this.ragEngine.retrieve('mccarthy-artwork', cleanMessage, 3);
        
        console.log('[HowToHandler] 🔍 RAG RESULTS:', {
          count: ragResults?.chunks?.length || 0,
          hasResults: !!(ragResults && ragResults.chunks && ragResults.chunks.length > 0)
        });

        if (ragResults && ragResults.chunks && ragResults.chunks.length > 0) {
          console.log('[HowToHandler] ✅ RAG returned', ragResults.chunks.length, 'chunks');
          
          // Provide brief summary from RAG
          responseText = this.formatBriefSteps(topic, ragResults.chunks);
          
          sources = ragResults.chunks.map((chunk: any) => ({
            id: chunk.id,
            title: chunk.documentId,
            excerpt: chunk.text.substring(0, 100)
          }));
          confidence = ragResults.confidence || 0.9;
        } else {
          console.log('[HowToHandler] ⚠️ NO RAG RESULTS - using generic response');
          responseText = this.getGenericHowToResponse(topic);
        }
      } catch (error) {
        console.error('[HowToHandler] RAG error:', error);
        responseText = this.getGenericHowToResponse(topic);
      }
    } else {
      responseText = this.getGenericHowToResponse(topic);
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

  private formatBriefSteps(_topic: string, ragResults: any[]): string {
    // Extract key steps from RAG results (brief version)
    const firstChunk = ragResults[0].text;
    
    // Try to extract just the main steps (look for numbered lists or bullet points)
    const lines = firstChunk.split('\n');
    const steps: string[] = [];
    
    for (const line of lines) {
      // Look for numbered steps or bullet points
      if (/^\d+\./.test(line.trim()) || /^[-•]/.test(line.trim())) {
        steps.push(line.trim());
        if (steps.length >= 5) break; // Max 5 steps for brief version
      }
    }

    if (steps.length > 0) {
      return `Here's a quick overview:\n\n${steps.join('\n')}\n\nFor detailed instructions, I recommend searching YouTube!`;
    }

    // Fallback: just show first 200 chars
    return `Quick tip: ${firstChunk.substring(0, 200)}...\n\nFor detailed step-by-step instructions, YouTube tutorials are your best bet!`;
  }

  private isAffirmativeResponse(message: string): boolean {
    const affirmative = /^(yes|yeah|yep|sure|ok|okay|y|please|yea|ya)\b/i;
    return affirmative.test(message.trim());
  }

  private isNegativeResponse(message: string): boolean {
    const negative = /^(no|nope|nah|n)\b/i;
    return negative.test(message.trim());
  }

  private extractHowToTopic(message: string): string {
    // Extract the main topic from "how do I..." or "how to..." questions
    const match = message.match(/how (?:do i|to|can i) (.+?)(?:\?|$)/i);
    if (match) {
      return match[1].trim();
    }
    
    // Fallback: return cleaned message
    return message.replace(/^(how do i|how to|how can i)\s+/i, '').replace(/\?$/, '').trim();
  }

  private getGenericHowToResponse(_topic: string): string {
    return "I'd be happy to help! For detailed step-by-step instructions, I recommend searching YouTube for video tutorials. They're usually the clearest way to learn!";
  }
}

