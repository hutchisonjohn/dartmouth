/**
 * Invoice Handler
 * 
 * Handles customer requests for invoices, receipts, and payment information.
 * Integrates with PERP to retrieve invoice details.
 * 
 * Created: Nov 28, 2025
 */

import type { Intent, Response } from '../../../worker/src/types/shared';
import type { Handler, HandlerContext } from '../../../worker/src/components/ResponseRouter';
import type { PERPIntegration } from '../../../worker/src/services';

export class InvoiceHandler implements Handler {
  name = 'InvoiceHandler';
  version = '1.0.0';
  priority = 8;

  private perp: PERPIntegration;

  constructor(perp: PERPIntegration) {
    this.perp = perp;
    console.log('[InvoiceHandler] Initialized');
  }

  canHandle(intent: Intent): boolean {
    return intent.type === 'invoice' || 
           intent.type === 'receipt' ||
           intent.type === 'payment_info';
  }

  /**
   * Handle invoice inquiry
   */
  async handle(message: string, intent: Intent, context: HandlerContext): Promise<Response> {
    console.log('[InvoiceHandler] Handling invoice inquiry');
    const startTime = Date.now();

    try {
      // 1. Extract order number from message
      const orderNumber = this.extractOrderNumber(message);
      
      if (!orderNumber) {
        return {
          content: "I can help you with your invoice! Could you please provide your order number?",
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.7,
            needsOrderNumber: true
          }
        };
      }

      // 2. Get invoice from PERP
      let invoice;
      try {
        invoice = await this.perp.getInvoice(orderNumber);
      } catch (error) {
        console.error('[InvoiceHandler] PERP API error:', error);
        return {
          content: "I'm having trouble accessing our invoice system right now. Let me connect you with our accounts team who can email you the invoice directly.",
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.3,
            error: 'perp_api_error'
          }
        };
      }
      
      if (!invoice) {
        return {
          content: `I couldn't find an invoice for order #${orderNumber}. It might be too recent or there was an issue generating it. Would you like me to connect you with our accounts team?`,
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            confidence: 0.8,
            orderNumber,
            invoiceNotFound: true
          }
        };
      }

      // 3. Generate invoice response
      let content = `Here's the invoice information for order #${orderNumber}:\n\n`;
      
      content += `**Invoice Status:** ${invoice.status}\n`;
      content += `**Total Amount:** $${invoice.totalAmount.toFixed(2)}\n`;
      content += `**Amount Paid:** $${invoice.amountPaid.toFixed(2)}\n`;
      
      const balanceDue = invoice.totalAmount - invoice.amountPaid;
      content += `**Balance Due:** $${balanceDue.toFixed(2)}\n`;

      if (invoice.dueDate) {
        content += `**Due Date:** ${new Date(invoice.dueDate).toLocaleDateString()}\n`;
      }

      if (invoice.pdfLink) {
        content += `\n📄 **Download Invoice:** ${invoice.pdfLink}\n`;
      }

      // Status-specific messages
      if (invoice.status === 'overdue') {
        content += `\n⚠️ **Action Required:** This invoice is overdue. Please make a payment as soon as possible to avoid any service interruptions.`;
      } else if (invoice.status === 'paid') {
        content += `\n✅ Thank you for your payment! Your invoice is fully paid.`;
      } else if (invoice.status === 'pending' && balanceDue > 0) {
        content += `\n💳 Payment is pending. If you've already paid, it may take a few business days to process.`;
      }

      content += `\n\nNeed help with payment or have questions? Just let me know!`;

      return {
        content,
        metadata: {
          handlerName: this.name,
          handlerVersion: this.version,
          processingTime: Date.now() - startTime,
          confidence: 0.95,
          orderNumber,
          invoiceStatus: invoice.status,
          totalAmount: invoice.totalAmount,
          balanceDue,
          hasPdfLink: !!invoice.pdfLink
        }
      };

    } catch (error) {
      console.error('[InvoiceHandler] Error:', error);
      return {
        content: "I'm having trouble retrieving invoice information right now. Let me connect you with our accounts team.",
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
      /invoice\s*#?(\d{4,})/i,
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
