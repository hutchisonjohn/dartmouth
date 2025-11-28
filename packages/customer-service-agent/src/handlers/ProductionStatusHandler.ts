/**
 * Production Status Handler
 * 
 * Handles customer inquiries about production status, artwork approval, and print progress.
 * Integrates with PERP to provide detailed production information.
 * 
 * Created: Nov 28, 2025
 */

import type { AgentRequest, AgentResponse } from '../../../worker/src/types/shared';
import type { PERPIntegration } from '../../../worker/src/services';

export class ProductionStatusHandler {
  private perp: PERPIntegration;

  constructor(perp: PERPIntegration) {
    this.perp = perp;
    console.log('[ProductionStatusHandler] Initialized');
  }

  /**
   * Handle production status inquiry
   */
  async handle(request: AgentRequest, baseResponse: AgentResponse): Promise<AgentResponse> {
    console.log('[ProductionStatusHandler] Handling production status inquiry');

    try {
      // 1. Extract order number
      const orderNumber = this.extractOrderNumber(request.message);
      
      if (!orderNumber) {
        return this.askForOrderNumber(baseResponse);
      }

      // 2. Get production order from PERP
      let productionOrder;
      try {
        productionOrder = await this.perp.getProductionOrder(orderNumber);
      } catch (error) {
        console.error('[ProductionStatusHandler] PERP API error:', error);
        return {
          ...baseResponse,
          content: "I'm having trouble accessing our production system right now. Let me connect you with our production team who can give you an update.",
          confidence: 0.3,
        };
      }
      
      if (!productionOrder) {
        return this.productionNotFound(orderNumber, baseResponse);
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

      // 4. Generate response
      return this.generateProductionStatusResponse(productionOrder, artworkStatus, baseResponse);

    } catch (error) {
      console.error('[ProductionStatusHandler] Error:', error);
      return {
        ...baseResponse,
        content: "I'm having trouble checking the production status right now. Let me connect you with our production team who can give you the latest update.",
        confidence: 0.3,
      };
    }
  }

  /**
   * Extract order number from message
   */
  private extractOrderNumber(message: string): string | null {
    const patterns = [
      /PERP-(\d+)/i,
      /#(\d+)/,
      /order\s*#?(\d+)/i,
      /\b(\d{4,6})\b/,
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
   * Ask for order number
   */
  private askForOrderNumber(baseResponse: AgentResponse): AgentResponse {
    return {
      ...baseResponse,
      content: "I'd be happy to check on your production status! Could you please provide your order number? (e.g., PERP-1234 or #1234)",
      confidence: 0.9,
    };
  }

  /**
   * Production not found
   */
  private productionNotFound(orderNumber: string, baseResponse: AgentResponse): AgentResponse {
    return {
      ...baseResponse,
      content: `I couldn't find production details for order ${orderNumber}. This might mean your order hasn't entered production yet, or the order number might be incorrect. Would you like me to check your order status instead?`,
      confidence: 0.8,
    };
  }

  /**
   * Generate production status response
   */
  private generateProductionStatusResponse(
    productionOrder: any,
    artworkStatus: any,
    baseResponse: AgentResponse
  ): AgentResponse {
    const parts: string[] = [];

    // 1. Production status header
    parts.push(`**Production Status for Order ${productionOrder.order_number}:**`);

    // 2. Current status
    const statusMessage = this.getProductionStatusMessage(productionOrder.status);
    parts.push(`\n${statusMessage}`);

    // 3. Artwork status (if applicable)
    if (artworkStatus) {
      const artworkMessage = this.getArtworkStatusMessage(artworkStatus);
      if (artworkMessage) {
        parts.push(`\n🎨 **Artwork:** ${artworkMessage}`);
      }
    }

    // 4. Progress details
    if (productionOrder.progress) {
      parts.push(this.getProgressDetails(productionOrder.progress));
    }

    // 5. Timeline
    if (productionOrder.started_at) {
      const timeline = this.getTimeline(productionOrder);
      if (timeline) {
        parts.push(`\n${timeline}`);
      }
    }

    // 6. Next steps
    const nextSteps = this.getNextSteps(productionOrder, artworkStatus);
    if (nextSteps) {
      parts.push(`\n**Next Steps:** ${nextSteps}`);
    }

    // 7. Helpful closing
    parts.push('\nDo you have any questions about the production process?');

    return {
      ...baseResponse,
      content: parts.join('\n'),
      confidence: 0.95,
      metadata: {
        ...baseResponse.metadata,
        orderNumber: productionOrder.order_number,
        productionStatus: productionOrder.status,
        artworkStatus: artworkStatus?.status,
      },
    };
  }

  /**
   * Get production status message
   */
  private getProductionStatusMessage(status: string): string {
    const statusMessages: Record<string, string> = {
      'awaiting_artwork': '⏳ Awaiting artwork approval from you',
      'artwork_approved': '✅ Artwork approved - ready to print!',
      'queued': '📋 Queued for production',
      'printing': '🖨️ Currently printing',
      'quality_check': '🔍 In quality check',
      'packaging': '📦 Being packaged',
      'ready_to_ship': '✅ Ready to ship',
      'completed': '✅ Production completed',
    };

    return statusMessages[status] || `⏳ Status: ${status}`;
  }

  /**
   * Get artwork status message
   */
  private getArtworkStatusMessage(artworkStatus: any): string | null {
    switch (artworkStatus.status) {
      case 'pending_upload':
        return 'Waiting for you to upload artwork';
      
      case 'pending_approval':
        return 'Proof sent - awaiting your approval';
      
      case 'approved':
        return 'Approved ✅';
      
      case 'revision_requested':
        return `Revision requested: ${artworkStatus.notes || 'See email for details'}`;
      
      case 'in_review':
        return 'Our team is reviewing your artwork';
      
      default:
        return null;
    }
  }

  /**
   * Get progress details
   */
  private getProgressDetails(progress: any): string {
    const parts: string[] = [];

    if (progress.percentage !== undefined) {
      const bar = this.createProgressBar(progress.percentage);
      parts.push(`\n📊 Progress: ${bar} ${progress.percentage}%`);
    }

    if (progress.current_step && progress.total_steps) {
      parts.push(`Step ${progress.current_step} of ${progress.total_steps}`);
    }

    return parts.join('\n');
  }

  /**
   * Create progress bar
   */
  private createProgressBar(percentage: number): string {
    const filled = Math.floor(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Get timeline
   */
  private getTimeline(productionOrder: any): string | null {
    const parts: string[] = [];

    if (productionOrder.started_at) {
      const started = new Date(productionOrder.started_at);
      parts.push(`Started: ${started.toLocaleDateString()}`);
    }

    if (productionOrder.estimated_completion) {
      const completion = new Date(productionOrder.estimated_completion);
      const now = new Date();
      
      if (completion > now) {
        const daysLeft = Math.ceil((completion.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        parts.push(`Expected completion: ${completion.toLocaleDateString()} (${daysLeft} days)`);
      } else {
        parts.push(`Expected completion: ${completion.toLocaleDateString()} (any moment now!)`);
      }
    }

    return parts.length > 0 ? `\n📅 Timeline:\n${parts.join('\n')}` : null;
  }

  /**
   * Get next steps
   */
  private getNextSteps(productionOrder: any, artworkStatus: any): string | null {
    // Awaiting artwork
    if (artworkStatus?.status === 'pending_upload') {
      return 'Please upload your artwork to proceed with production.';
    }

    // Awaiting approval
    if (artworkStatus?.status === 'pending_approval') {
      return 'Please review and approve the proof we sent you. Production will start immediately after approval!';
    }

    // Revision requested
    if (artworkStatus?.status === 'revision_requested') {
      return 'Please review the revision notes and upload the updated artwork.';
    }

    // In production
    if (productionOrder.status === 'printing' || productionOrder.status === 'quality_check') {
      return 'Your order is in production. We\'ll notify you when it ships!';
    }

    // Ready to ship
    if (productionOrder.status === 'ready_to_ship') {
      return 'Your order will be picked up by the courier today!';
    }

    return null;
  }
}

