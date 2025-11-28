/**
 * Invoice Handler
 * 
 * Handles customer requests for invoices, receipts, and payment information.
 * Integrates with PERP to retrieve invoice details.
 * 
 * Created: Nov 28, 2025
 */

import type { AgentRequest, AgentResponse } from '../../../worker/src/types/shared';
import type { PERPIntegration } from '../../../worker/src/services';

export class InvoiceHandler {
  private perp: PERPIntegration;

  constructor(perp: PERPIntegration) {
    this.perp = perp;
    console.log('[InvoiceHandler] Initialized');
  }

  /**
   * Handle invoice request
   */
  async handle(request: AgentRequest, baseResponse: AgentResponse): Promise<AgentResponse> {
    console.log('[InvoiceHandler] Handling invoice request');

    try {
      // 1. Extract order number
      const orderNumber = this.extractOrderNumber(request.message);
      
      if (!orderNumber) {
        return this.askForOrderNumber(baseResponse);
      }

      // 2. Get invoice from PERP
      let invoice;
      try {
        invoice = await this.perp.getInvoice(orderNumber);
      } catch (error) {
        console.error('[InvoiceHandler] PERP API error:', error);
        return {
          ...baseResponse,
          content: "I'm having trouble accessing our invoice system right now. Let me connect you with our accounts team who can email you the invoice directly.",
          confidence: 0.3,
        };
      }
      
      if (!invoice) {
        return this.invoiceNotFound(orderNumber, baseResponse);
      }

      // 3. Generate response
      return this.generateInvoiceResponse(invoice, baseResponse);

    } catch (error) {
      console.error('[InvoiceHandler] Error:', error);
      return {
        ...baseResponse,
        content: "I'm having trouble retrieving your invoice right now. Let me connect you with our accounts team who can email it to you directly.",
        confidence: 0.3,
      };
    }
  }

  /**
   * Extract order number from message
   */
  private extractOrderNumber(message: string): string | null {
    const patterns = [
      /invoice\s*#?(\d+)/i,
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
      content: "I'd be happy to help you with your invoice! Could you please provide your order number? (e.g., #1234 or PERP-1234)",
      confidence: 0.9,
    };
  }

  /**
   * Invoice not found
   */
  private invoiceNotFound(orderNumber: string, baseResponse: AgentResponse): AgentResponse {
    return {
      ...baseResponse,
      content: `I couldn't find an invoice for order ${orderNumber}. This might mean:\n\n• The order hasn't been invoiced yet\n• The order number might be incorrect\n• The invoice is still being generated\n\nWould you like me to check your order status, or connect you with our accounts team?`,
      confidence: 0.8,
    };
  }

  /**
   * Generate invoice response
   */
  private generateInvoiceResponse(invoice: any, baseResponse: AgentResponse): AgentResponse {
    const parts: string[] = [];

    // 1. Invoice header
    parts.push(`**Invoice for Order ${invoice.order_number}**`);

    // 2. Invoice details
    parts.push(this.formatInvoiceDetails(invoice));

    // 3. Payment status
    const paymentStatus = this.getPaymentStatus(invoice);
    parts.push(`\n💳 **Payment Status:** ${paymentStatus}`);

    // 4. Amount details
    parts.push(this.formatAmountDetails(invoice));

    // 5. Download/email options
    if (invoice.pdf_url) {
      parts.push(`\n📄 **Download Invoice:** ${invoice.pdf_url}`);
    } else {
      parts.push('\n📧 I can email you a copy of this invoice. Would you like me to send it to your email address?');
    }

    // 6. Helpful closing
    parts.push('\nIs there anything else you need regarding this invoice?');

    return {
      ...baseResponse,
      content: parts.join('\n'),
      confidence: 0.95,
      metadata: {
        ...baseResponse.metadata,
        invoiceNumber: invoice.invoice_number,
        orderNumber: invoice.order_number,
        paymentStatus: invoice.payment_status,
        totalAmount: invoice.total,
      },
    };
  }

  /**
   * Format invoice details
   */
  private formatInvoiceDetails(invoice: any): string {
    const parts: string[] = [];

    if (invoice.invoice_number) {
      parts.push(`Invoice #: ${invoice.invoice_number}`);
    }

    if (invoice.invoice_date) {
      const date = new Date(invoice.invoice_date);
      parts.push(`Date: ${date.toLocaleDateString()}`);
    }

    if (invoice.due_date) {
      const dueDate = new Date(invoice.due_date);
      const now = new Date();
      const isOverdue = dueDate < now;
      
      parts.push(`Due Date: ${dueDate.toLocaleDateString()}${isOverdue ? ' ⚠️ (Overdue)' : ''}`);
    }

    return parts.length > 0 ? `\n${parts.join('\n')}` : '';
  }

  /**
   * Get payment status
   */
  private getPaymentStatus(invoice: any): string {
    switch (invoice.payment_status) {
      case 'paid':
        return '✅ Paid in full';
      
      case 'partial':
        return `⏳ Partially paid ($${invoice.amount_paid} of $${invoice.total})`;
      
      case 'pending':
        return '⏳ Payment pending';
      
      case 'overdue':
        return '⚠️ Payment overdue';
      
      case 'refunded':
        return '↩️ Refunded';
      
      default:
        return invoice.payment_status;
    }
  }

  /**
   * Format amount details
   */
  private formatAmountDetails(invoice: any): string {
    const parts: string[] = [];

    parts.push('\n**Amount Breakdown:**');

    if (invoice.subtotal) {
      parts.push(`Subtotal: $${invoice.subtotal.toFixed(2)}`);
    }

    if (invoice.tax) {
      parts.push(`Tax: $${invoice.tax.toFixed(2)}`);
    }

    if (invoice.shipping) {
      parts.push(`Shipping: $${invoice.shipping.toFixed(2)}`);
    }

    if (invoice.discount && invoice.discount > 0) {
      parts.push(`Discount: -$${invoice.discount.toFixed(2)}`);
    }

    parts.push(`**Total: $${invoice.total.toFixed(2)}**`);

    if (invoice.amount_paid && invoice.amount_paid > 0) {
      parts.push(`Amount Paid: $${invoice.amount_paid.toFixed(2)}`);
      const balance = invoice.total - invoice.amount_paid;
      if (balance > 0) {
        parts.push(`**Balance Due: $${balance.toFixed(2)}**`);
      }
    }

    return parts.join('\n');
  }
}

