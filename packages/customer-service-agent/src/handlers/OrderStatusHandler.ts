/**
 * Order Status Handler
 * 
 * Handles customer inquiries about order status.
 * Integrates with Shopify and PERP to provide comprehensive order information.
 * 
 * Created: Nov 28, 2025
 */

import type { AgentRequest, AgentResponse } from '../../../worker/src/types/shared';
import type { ShopifyIntegration, PERPIntegration } from '../../../worker/src/services';

export class OrderStatusHandler {
  private shopify: ShopifyIntegration;
  private perp: PERPIntegration;

  constructor(shopify: ShopifyIntegration, perp: PERPIntegration) {
    this.shopify = shopify;
    this.perp = perp;
    console.log('[OrderStatusHandler] Initialized');
  }

  /**
   * Handle order status inquiry
   */
  async handle(request: AgentRequest, baseResponse: AgentResponse): Promise<AgentResponse> {
    console.log('[OrderStatusHandler] Handling order status inquiry');

    try {
      // 1. Extract order number from message
      const orderNumber = this.extractOrderNumber(request.message);
      
      if (!orderNumber) {
        return this.askForOrderNumber(baseResponse);
      }

      // 2. Get order from Shopify
      let shopifyOrder;
      try {
        shopifyOrder = await this.shopify.getOrder(orderNumber);
      } catch (error) {
        console.error('[OrderStatusHandler] Shopify API error:', error);
        return {
          ...baseResponse,
          content: "I'm having trouble connecting to our order system right now. Let me connect you with a team member who can look this up for you.",
          confidence: 0.3,
        };
      }
      
      if (!shopifyOrder) {
        return this.orderNotFound(orderNumber, baseResponse);
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

      // 4. Generate comprehensive response
      return this.generateOrderStatusResponse(shopifyOrder, productionOrder, baseResponse);

    } catch (error) {
      console.error('[OrderStatusHandler] Error:', error);
      return {
        ...baseResponse,
        content: "I'm having trouble looking up that order right now. Could you please provide your order number again, or I can connect you with a team member who can help?",
        confidence: 0.3,
      };
    }
  }

  /**
   * Extract order number from message
   */
  private extractOrderNumber(message: string): string | null {
    // Match patterns: #1234, PERP-1234, Order 1234, etc.
    const patterns = [
      /#(\d+)/,                    // #1234
      /PERP-(\d+)/i,               // PERP-1234
      /order\s*#?(\d+)/i,          // Order 1234 or Order #1234
      /\b(\d{4,6})\b/,             // 4-6 digit number
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Ask customer for order number
   */
  private askForOrderNumber(baseResponse: AgentResponse): AgentResponse {
    return {
      ...baseResponse,
      content: "I'd be happy to check on your order status! Could you please provide your order number? It usually starts with # or PERP- (for example: #1234 or PERP-5678).",
      confidence: 0.9,
      metadata: {
        ...baseResponse.metadata,
        needsOrderNumber: true,
      },
    };
  }

  /**
   * Order not found response
   */
  private orderNotFound(orderNumber: string, baseResponse: AgentResponse): AgentResponse {
    return {
      ...baseResponse,
      content: `I couldn't find an order with number ${orderNumber}. Could you please double-check the order number? You can find it in your order confirmation email. If you're still having trouble, I can connect you with our team.`,
      confidence: 0.8,
      metadata: {
        ...baseResponse.metadata,
        orderNotFound: true,
        searchedOrderNumber: orderNumber,
      },
    };
  }

  /**
   * Generate comprehensive order status response
   */
  private generateOrderStatusResponse(
    shopifyOrder: any,
    productionOrder: any,
    baseResponse: AgentResponse
  ): AgentResponse {
    const parts: string[] = [];

    // 1. Order confirmation
    parts.push(`Great! I found your order #${shopifyOrder.order_number}.`);

    // 2. Order status
    const status = this.getOrderStatus(shopifyOrder, productionOrder);
    parts.push(status.message);

    // 3. Production details (if available)
    if (productionOrder) {
      const productionDetails = this.getProductionDetails(productionOrder);
      if (productionDetails) {
        parts.push(productionDetails);
      }
    }

    // 4. Shipping info (if available)
    if (shopifyOrder.fulfillment_status === 'fulfilled' && shopifyOrder.tracking_number) {
      parts.push(`\n📦 Tracking Number: ${shopifyOrder.tracking_number}`);
      if (shopifyOrder.tracking_url) {
        parts.push(`Track your order: ${shopifyOrder.tracking_url}`);
      }
    }

    // 5. Estimated delivery (if available)
    if (status.estimatedDelivery) {
      parts.push(`\n📅 Estimated Delivery: ${status.estimatedDelivery}`);
    }

    // 6. Helpful closing
    parts.push('\nIs there anything else you\'d like to know about your order?');

    return {
      ...baseResponse,
      content: parts.join('\n\n'),
      confidence: 0.95,
      metadata: {
        ...baseResponse.metadata,
        orderNumber: shopifyOrder.order_number,
        orderStatus: shopifyOrder.financial_status,
        fulfillmentStatus: shopifyOrder.fulfillment_status,
        productionStatus: productionOrder?.status,
      },
    };
  }

  /**
   * Get order status message
   */
  private getOrderStatus(shopifyOrder: any, productionOrder: any): {
    message: string;
    estimatedDelivery?: string;
  } {
    // Fulfilled and shipped
    if (shopifyOrder.fulfillment_status === 'fulfilled') {
      return {
        message: '✅ **Your order has been shipped!**',
        estimatedDelivery: this.calculateEstimatedDelivery(shopifyOrder.shipped_at),
      };
    }

    // In production
    if (productionOrder) {
      switch (productionOrder.status) {
        case 'printing':
          return {
            message: '🖨️ **Your order is currently being printed.** We\'re working on it right now!',
            estimatedDelivery: this.calculateProductionDelivery(productionOrder.started_at, 2),
          };

        case 'quality_check':
          return {
            message: '🔍 **Your order is in quality check.** We\'re making sure everything looks perfect!',
            estimatedDelivery: this.calculateProductionDelivery(productionOrder.started_at, 1),
          };

        case 'packaging':
          return {
            message: '📦 **Your order is being packaged.** It will ship very soon!',
            estimatedDelivery: this.calculateProductionDelivery(productionOrder.started_at, 1),
          };

        case 'ready_to_ship':
          return {
            message: '✅ **Your order is ready to ship!** It will be picked up by the courier today.',
            estimatedDelivery: 'Within 1-2 business days',
          };

        default:
          return {
            message: '⏳ **Your order is in production.** We\'re working on it!',
          };
      }
    }

    // Awaiting artwork approval
    if (shopifyOrder.tags?.includes('awaiting_artwork')) {
      return {
        message: '🎨 **Your order is awaiting artwork approval.** Once you approve the proof, we\'ll start production immediately!',
      };
    }

    // Payment pending
    if (shopifyOrder.financial_status === 'pending') {
      return {
        message: '💳 **Your order is awaiting payment.** Once payment is confirmed, we\'ll start production!',
      };
    }

    // Default: Processing
    return {
      message: '⏳ **Your order is being processed.** We\'ll start production soon!',
      estimatedDelivery: '3-5 business days',
    };
  }

  /**
   * Get production details
   */
  private getProductionDetails(productionOrder: any): string | null {
    if (!productionOrder.details) return null;

    const parts: string[] = [];

    if (productionOrder.details.started_at) {
      const startedDate = new Date(productionOrder.details.started_at);
      parts.push(`Started: ${startedDate.toLocaleDateString()}`);
    }

    if (productionOrder.details.estimated_completion) {
      const completionDate = new Date(productionOrder.details.estimated_completion);
      parts.push(`Expected Completion: ${completionDate.toLocaleDateString()}`);
    }

    return parts.length > 0 ? `\n📋 Production Details:\n${parts.join('\n')}` : null;
  }

  /**
   * Calculate estimated delivery from ship date
   */
  private calculateEstimatedDelivery(shippedAt: string): string {
    const shipped = new Date(shippedAt);
    const now = new Date();
    const daysInTransit = Math.floor((now.getTime() - shipped.getTime()) / (1000 * 60 * 60 * 24));

    if (daysInTransit >= 5) {
      return 'Should arrive any day now!';
    } else {
      const remainingDays = 5 - daysInTransit;
      return `${remainingDays}-${remainingDays + 2} business days`;
    }
  }

  /**
   * Calculate estimated delivery from production start
   */
  private calculateProductionDelivery(startedAt: string, additionalDays: number): string {
    const started = new Date(startedAt);
    const estimated = new Date(started.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
    return estimated.toLocaleDateString();
  }
}

