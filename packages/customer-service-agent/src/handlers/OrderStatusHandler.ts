/**
 * Order Status Handler
 * 
 * Handles customer inquiries about order status.
 * Integrates with Shopify and PERP to provide comprehensive order information.
 * 
 * Created: Nov 28, 2025
 */

import type { Intent, Response } from '../../../worker/src/types/shared';
import type { Handler, HandlerContext } from '../../../worker/src/components/ResponseRouter';
import type { ShopifyIntegration, PERPIntegration } from '../../../worker/src/services';

export class OrderStatusHandler implements Handler {
  name = 'OrderStatusHandler';
  version = '1.0.0';
  priority = 10;

  private shopify: ShopifyIntegration;
  private perp: PERPIntegration;

  constructor(shopify: ShopifyIntegration, perp: PERPIntegration) {
    this.shopify = shopify;
    this.perp = perp;
    console.log('[OrderStatusHandler] Initialized');
  }

  canHandle(intent: Intent): boolean {
    return intent.type === 'order_status' || 
           intent.type === 'track_order' ||
           intent.type === 'where_is_my_order';
  }

  /**
   * Handle order status inquiry
   */
  async handle(message: string, intent: Intent, context: HandlerContext): Promise<Response> {
    console.log('[OrderStatusHandler] Handling order status inquiry');
    const startTime = Date.now();

    try {
      // 1. Extract order number from message
      const orderNumber = this.extractOrderNumber(message);
      
      if (!orderNumber) {
        return {
          content: "I'd be happy to help you check your order status! Could you please provide your order number? It should be in your confirmation email.",
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.7,
            needsOrderNumber: true
          }
        };
      }

      // 2. Get order from Shopify
      let shopifyOrder;
      try {
        shopifyOrder = await this.shopify.getOrder(orderNumber);
      } catch (error) {
        console.error('[OrderStatusHandler] Shopify API error:', error);
        return {
          content: "I'm having trouble connecting to our order system right now. Let me connect you with a team member who can look this up for you.",
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.3,
            error: 'shopify_api_error'
          }
        };
      }
      
      if (!shopifyOrder) {
        return {
          content: `I couldn't find order #${orderNumber} in our system. Could you double-check the order number? If you need help, I can connect you with our team.`,
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.8,
            orderNumber,
            orderNotFound: true
          }
        };
      }

      // 3. Get production status from PERP
      let productionOrder;
      try {
        productionOrder = await this.perp.getProductionOrder(orderNumber);
      } catch (error) {
        console.error('[OrderStatusHandler] PERP API error:', error);
        // Continue without production data
        productionOrder = null;
      }

      // 4. Get artwork status
      let artworkStatus;
      try {
        artworkStatus = await this.perp.getArtworkStatus(orderNumber);
      } catch (error) {
        console.error('[OrderStatusHandler] Artwork API error:', error);
        // Continue without artwork data
        artworkStatus = null;
      }

      // 5. Generate comprehensive response
      let content = `Great news! I found your order #${shopifyOrder.orderNumber}.\n\n`;
      
      // Financial and fulfillment status
      content += `**Order Status:** ${shopifyOrder.financialStatus}`;
      if (shopifyOrder.fulfillmentStatus) {
        content += ` | ${shopifyOrder.fulfillmentStatus}`;
      }
      content += `\n`;

      // Production status
      if (productionOrder) {
        content += `\n**Production:** ${productionOrder.status}`;
        if (productionOrder.progress) {
          content += ` (${productionOrder.progress}% complete)`;
        }
        if (productionOrder.estimatedCompletion) {
          content += `\nEstimated completion: ${new Date(productionOrder.estimatedCompletion).toLocaleDateString()}`;
        }
      }

      // Artwork status
      if (artworkStatus) {
        content += `\n\n**Artwork:** ${artworkStatus.status}`;
        if (artworkStatus.proofLink) {
          content += `\nView proof: ${artworkStatus.proofLink}`;
        }
      }

      // Tracking information
      if (shopifyOrder.trackingNumber && shopifyOrder.trackingCompany) {
        content += `\n\n**Tracking:** ${shopifyOrder.trackingNumber} (${shopifyOrder.trackingCompany})`;
        if (shopifyOrder.trackingUrl) {
          content += `\nTrack here: ${shopifyOrder.trackingUrl}`;
        }
      } else if (shopifyOrder.fulfillmentStatus === 'fulfilled' && !shopifyOrder.trackingNumber) {
        content += `\n\nYour order has been fulfilled. Tracking information will be available soon.`;
      } else if (shopifyOrder.fulfillmentStatus === 'unfulfilled') {
        content += `\n\nYour order is being processed. We'll send tracking information once it ships!`;
      }

      content += `\n\nIs there anything else you'd like to know about your order?`;

      return {
        content,
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          confidence: 0.95,
          orderNumber,
          shopifyOrderId: shopifyOrder.id,
          hasProduction: !!productionOrder,
          hasArtwork: !!artworkStatus,
          hasTracking: !!shopifyOrder.trackingNumber
        }
      };

    } catch (error) {
      console.error('[OrderStatusHandler] Error:', error);
      return {
        content: "I'm having trouble looking up that order right now. Could you please provide your order number again, or I can connect you with a team member who can help?",
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
    // Match patterns like #12345, 12345, order 12345, etc.
    const patterns = [
      /#(\d{4,})/,           // #12345
      /order\s*#?(\d{4,})/i, // order 12345 or order #12345
      /\b(\d{4,})\b/         // standalone 4+ digit number
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
