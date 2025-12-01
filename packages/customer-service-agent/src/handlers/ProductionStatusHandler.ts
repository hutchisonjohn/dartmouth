/**
 * Production Status Handler
 * 
 * Handles customer inquiries about production status, artwork approval, and print progress.
 * Integrates with PERP to provide detailed production information.
 * 
 * Created: Nov 28, 2025
 */

import type { Intent, Response } from '../../../worker/src/types/shared';
import type { Handler, HandlerContext } from '../../../worker/src/components/ResponseRouter';
import type { PERPIntegration } from '../../../worker/src/services';

export class ProductionStatusHandler implements Handler {
  name = 'ProductionStatusHandler';
  version = '1.0.0';
  priority = 9;

  private perp: PERPIntegration;

  constructor(perp: PERPIntegration) {
    this.perp = perp;
    console.log('[ProductionStatusHandler] Initialized');
  }

  canHandle(intent: Intent): boolean {
    return intent.type === 'production_status' || 
           intent.type === 'artwork_status' ||
           intent.type === 'printing_status';
  }

  /**
   * Handle production status inquiry
   */
  async handle(message: string, intent: Intent, context: HandlerContext): Promise<Response> {
    console.log('[ProductionStatusHandler] Handling production status inquiry');
    const startTime = Date.now();

    try {
      // 1. Extract order number from message
      const orderNumber = this.extractOrderNumber(message);
      
      if (!orderNumber) {
        return {
          content: "I'd be happy to check your production status! Could you please provide your order number?",
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.7,
            needsOrderNumber: true
          }
        };
      }

      // 2. Get production order from PERP
      let productionOrder;
      try {
        productionOrder = await this.perp.getProductionOrder(orderNumber);
      } catch (error) {
        console.error('[ProductionStatusHandler] PERP API error:', error);
        return {
          content: "I'm having trouble accessing our production system right now. Let me connect you with our production team who can give you an update.",
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.3,
            error: 'perp_api_error'
          }
        };
      }
      
      if (!productionOrder) {
        return {
          content: `I couldn't find production details for order #${orderNumber}. It might be very new or not yet entered into our production system. Would you like me to connect you with our team?`,
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.8,
            orderNumber,
            productionNotFound: true
          }
        };
      }

      // 3. Get artwork status
      let artworkStatus;
      try {
        artworkStatus = await this.perp.getArtworkStatus(orderNumber);
      } catch (error) {
        console.error('[ProductionStatusHandler] Artwork API error:', error);
        // Continue without artwork data
        artworkStatus = null;
      }

      // 4. Generate comprehensive response
      let content = `Here's the production status for order #${orderNumber}:\n\n`;
      
      // Production status
      content += `**Production Status:** ${productionOrder.status}`;
      if (productionOrder.progress) {
        content += ` (${productionOrder.progress}% complete)`;
      }
      content += `\n`;

      if (productionOrder.estimatedCompletion) {
        content += `**Estimated Completion:** ${new Date(productionOrder.estimatedCompletion).toLocaleDateString()}\n`;
      }

      if (productionOrder.notes) {
        content += `\n*${productionOrder.notes}*\n`;
      }

      // Artwork status
      if (artworkStatus) {
        content += `\n**Artwork Status:** ${artworkStatus.status}`;
        if (artworkStatus.proofLink) {
          content += `\nView your proof: ${artworkStatus.proofLink}`;
        }
        if (artworkStatus.feedbackRequired) {
          content += `\n\n⚠️ **Action Required:** Your feedback is needed on the artwork proof!`;
        }
      }

      // Status-specific messages
      if (productionOrder.status === 'completed') {
        content += `\n\n✅ Production is complete! Your order is now awaiting fulfillment and shipping.`;
      } else if (productionOrder.status === 'printing') {
        content += `\n\n🖨️ Your order is currently being printed!`;
      } else if (productionOrder.status === 'awaiting_artwork') {
        content += `\n\n⏳ We're waiting for artwork approval before we can start production.`;
      }

      content += `\n\nNeed more details? Just ask!`;

      return {
        content,
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          confidence: 0.95,
          orderNumber,
          productionStatus: productionOrder.status,
          hasArtwork: !!artworkStatus,
          feedbackRequired: artworkStatus?.feedbackRequired || false
        }
      };

    } catch (error) {
      console.error('[ProductionStatusHandler] Error:', error);
      return {
        content: "I'm having trouble checking production status right now. Let me connect you with our production team.",
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          confidence: 0.3,
          error: 'unexpected_error'
        }
      };
    }
  }

  /**
   * Extract order number from message
   */
  private extractOrderNumber(message: string): string | null {
    const patterns = [
      /#(\d{4,})/,
      /order\s*#?(\d{4,})/i,
      /\b(\d{4,})\b/
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}
