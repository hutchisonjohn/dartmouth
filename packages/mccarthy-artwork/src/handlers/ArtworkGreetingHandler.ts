/**
 * Artwork Greeting Handler
 * 
 * Custom greeting handler for McCarthy Artwork Agent.
 * Overrides FAM's generic GreetingHandler with artwork-specific personality.
 * 
 * CREATED 2025-11-23: Part of FAM architectural fixes
 */

import type { Intent, Response } from '../../../worker/src/types/shared';
import type { Handler, HandlerContext } from '../../../worker/src/components/ResponseRouter';

export class ArtworkGreetingHandler implements Handler {
  name = 'ArtworkGreetingHandler';
  version = '1.0.0';
  priority = 100; // Higher than foundation GreetingHandler (0)

  canHandle(intent: Intent): boolean {
    return intent.type === 'greeting' || intent.type === 'farewell';
  }

  async handle(
    _message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();

    if (intent.type === 'greeting') {
      // Check if artwork is uploaded
      const hasArtwork = context.state?.metadata?.artworkData;
      
      if (hasArtwork) {
        return {
          content: `Hey! 👋 I'm McCarthy, your artwork assistant.

I can see your artwork is uploaded and analyzed.

What would you like to know about it?
• DPI and print sizes?
• Transparency or DTF issues?
• Colors and quality?
• Something else?`,
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            cached: false,
            confidence: 1.0
          }
        };
      } else {
        return {
          content: "Hey! 👋 I'm McCarthy, your artwork assistant. Upload an artwork and I'll help you analyze it!",
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            cached: false,
            confidence: 1.0
          }
        };
      }
    } else {
      // Farewell
      return {
        content: "Take care! I'm here anytime you need help with artwork. 🎨",
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
}

