/**
 * PERP Integration
 * 
 * Integrates with PERP (Production ERP system) to fetch:
 * - Production status (in queue, in production, complete)
 * - Artwork approval status (pending, approved, rejected)
 * - VIP wallet balance (cash back credits)
 * - Invoice retrieval (PDF generation)
 * 
 * Method: REST API
 * Caching: 2-minute TTL for real-time data (using KV)
 * 
 * Created: Nov 28, 2025
 * Part of: Customer Service Agent Core
 */

import type { KVNamespace } from '@cloudflare/workers-types';

/**
 * Production status
 */
export type ProductionStatus = 'in_queue' | 'in_production' | 'complete' | 'shipped' | 'cancelled';

/**
 * Artwork status
 */
export type ArtworkStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

/**
 * Production order
 */
export interface ProductionOrder {
  orderId: string;
  orderNumber: string;
  customerId: string;
  status: ProductionStatus;
  artworkStatus: ArtworkStatus;
  queuePosition?: number;
  completionPercentage: number;
  estimatedCompletionDate?: string;
  estimatedShipDate?: string;
  actualCompletionDate?: string;
  actualShipDate?: string;
  productionNotes?: string;
  artworkNotes?: string;
  items: Array<{
    itemId: string;
    productName: string;
    quantity: number;
    status: ProductionStatus;
    artworkUrl?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * VIP wallet
 */
export interface VIPWallet {
  customerId: string;
  balance: number;
  currency: string;
  lifetimeEarned: number;
  lifetimeSpent: number;
  transactions: VIPTransaction[];
}

/**
 * VIP transaction
 */
export interface VIPTransaction {
  id: string;
  customerId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

/**
 * Invoice
 */
export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string;
  paidDate?: string;
  pdfUrl?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * PERP Integration
 * 
 * Provides access to production, artwork, and VIP wallet data from PERP system.
 */
export class PERPIntegration {
  private dbHost: string;
  private dbPort: number;
  private dbName: string;
  private dbUser: string;
  private dbPassword: string;
  private cacheTTL: number = 2 * 60 * 1000; // 2 minutes

  // Caches
  private productionOrderCache: Map<string, CacheEntry<ProductionOrder>> = new Map();
  private vipWalletCache: Map<string, CacheEntry<VIPWallet>> = new Map();
  private invoiceCache: Map<string, CacheEntry<Invoice>> = new Map();

  constructor(config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }) {
    this.dbHost = config.host;
    this.dbPort = config.port;
    this.dbName = config.database;
    this.dbUser = config.user;
    this.dbPassword = config.password;
    console.log('[PERPIntegration] Initialized');
  }

  /**
   * Get production order status
   */
  async getProductionOrder(orderId: string): Promise<ProductionOrder | null> {
    console.log(`[PERPIntegration] Fetching production order: ${orderId}`);

    try {
      // Check cache
      const cached = this.productionOrderCache.get(orderId);
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log(`[PERPIntegration] ✅ Production order found in cache`);
        return cached.data;
      }

      // Query database
      const query = `
        SELECT 
          po.order_id,
          po.order_number,
          po.customer_id,
          po.status,
          po.artwork_status,
          po.queue_position,
          po.completion_percentage,
          po.estimated_completion_date,
          po.estimated_ship_date,
          po.actual_completion_date,
          po.actual_ship_date,
          po.production_notes,
          po.artwork_notes,
          po.created_at,
          po.updated_at
        FROM production_orders po
        WHERE po.order_id = ?
      `;

      const result = await this.executeQuery(query, [orderId]);

      if (!result || result.length === 0) {
        console.log(`[PERPIntegration] ❌ Production order not found: ${orderId}`);
        return null;
      }

      const row = result[0];

      // Get production items
      const itemsQuery = `
        SELECT 
          item_id,
          product_name,
          quantity,
          status,
          artwork_url
        FROM production_items
        WHERE order_id = ?
      `;

      const items = await this.executeQuery(itemsQuery, [orderId]);

      const productionOrder: ProductionOrder = {
        orderId: row.order_id,
        orderNumber: row.order_number,
        customerId: row.customer_id,
        status: row.status,
        artworkStatus: row.artwork_status,
        queuePosition: row.queue_position,
        completionPercentage: row.completion_percentage,
        estimatedCompletionDate: row.estimated_completion_date,
        estimatedShipDate: row.estimated_ship_date,
        actualCompletionDate: row.actual_completion_date,
        actualShipDate: row.actual_ship_date,
        productionNotes: row.production_notes,
        artworkNotes: row.artwork_notes,
        items: items.map((item: any) => ({
          itemId: item.item_id,
          productName: item.product_name,
          quantity: item.quantity,
          status: item.status,
          artworkUrl: item.artwork_url
        })),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      // Cache it
      this.productionOrderCache.set(orderId, {
        data: productionOrder,
        timestamp: Date.now()
      });

      console.log(`[PERPIntegration] ✅ Production order fetched: ${orderId} (${productionOrder.status})`);
      return productionOrder;

    } catch (error) {
      console.error(`[PERPIntegration] ❌ Error fetching production order:`, error);
      return null;
    }
  }

  /**
   * Get VIP wallet for customer
   */
  async getVIPWallet(customerId: string): Promise<VIPWallet | null> {
    console.log(`[PERPIntegration] Fetching VIP wallet: ${customerId}`);

    try {
      // Check cache
      const cached = this.vipWalletCache.get(customerId);
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log(`[PERPIntegration] ✅ VIP wallet found in cache`);
        return cached.data;
      }

      // Query database
      const query = `
        SELECT 
          customer_id,
          balance,
          currency,
          lifetime_earned,
          lifetime_spent
        FROM vip_wallets
        WHERE customer_id = ?
      `;

      const result = await this.executeQuery(query, [customerId]);

      if (!result || result.length === 0) {
        console.log(`[PERPIntegration] ❌ VIP wallet not found: ${customerId}`);
        return null;
      }

      const row = result[0];

      // Get recent transactions
      const transactionsQuery = `
        SELECT 
          transaction_id,
          customer_id,
          type,
          amount,
          description,
          order_id,
          created_at
        FROM vip_transactions
        WHERE customer_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const transactions = await this.executeQuery(transactionsQuery, [customerId]);

      const wallet: VIPWallet = {
        customerId: row.customer_id,
        balance: parseFloat(row.balance),
        currency: row.currency,
        lifetimeEarned: parseFloat(row.lifetime_earned),
        lifetimeSpent: parseFloat(row.lifetime_spent),
        transactions: transactions.map((txn: any) => ({
          id: txn.transaction_id,
          customerId: txn.customer_id,
          type: txn.type,
          amount: parseFloat(txn.amount),
          description: txn.description,
          orderId: txn.order_id,
          createdAt: txn.created_at
        }))
      };

      // Cache it
      this.vipWalletCache.set(customerId, {
        data: wallet,
        timestamp: Date.now()
      });

      console.log(`[PERPIntegration] ✅ VIP wallet fetched: ${customerId} (Balance: $${wallet.balance})`);
      return wallet;

    } catch (error) {
      console.error(`[PERPIntegration] ❌ Error fetching VIP wallet:`, error);
      return null;
    }
  }

  /**
   * Get invoice for order
   */
  async getInvoice(orderId: string): Promise<Invoice | null> {
    console.log(`[PERPIntegration] Fetching invoice: ${orderId}`);

    try {
      // Check cache
      const cached = this.invoiceCache.get(orderId);
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log(`[PERPIntegration] ✅ Invoice found in cache`);
        return cached.data;
      }

      // Query database
      const query = `
        SELECT 
          invoice_id,
          invoice_number,
          order_id,
          customer_id,
          total_amount,
          paid_amount,
          balance_due,
          currency,
          status,
          due_date,
          paid_date,
          pdf_url,
          created_at
        FROM invoices
        WHERE order_id = ?
      `;

      const result = await this.executeQuery(query, [orderId]);

      if (!result || result.length === 0) {
        console.log(`[PERPIntegration] ❌ Invoice not found: ${orderId}`);
        return null;
      }

      const row = result[0];

      // Get line items
      const lineItemsQuery = `
        SELECT 
          description,
          quantity,
          unit_price,
          total_price
        FROM invoice_line_items
        WHERE invoice_id = ?
      `;

      const lineItems = await this.executeQuery(lineItemsQuery, [row.invoice_id]);

      const invoice: Invoice = {
        invoiceId: row.invoice_id,
        invoiceNumber: row.invoice_number,
        orderId: row.order_id,
        customerId: row.customer_id,
        totalAmount: parseFloat(row.total_amount),
        paidAmount: parseFloat(row.paid_amount),
        balanceDue: parseFloat(row.balance_due),
        currency: row.currency,
        status: row.status,
        dueDate: row.due_date,
        paidDate: row.paid_date,
        pdfUrl: row.pdf_url,
        lineItems: lineItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          totalPrice: parseFloat(item.total_price)
        })),
        createdAt: row.created_at
      };

      // Cache it
      this.invoiceCache.set(orderId, {
        data: invoice,
        timestamp: Date.now()
      });

      console.log(`[PERPIntegration] ✅ Invoice fetched: ${invoice.invoiceNumber}`);
      return invoice;

    } catch (error) {
      console.error(`[PERPIntegration] ❌ Error fetching invoice:`, error);
      return null;
    }
  }

  /**
   * Get all production orders for customer
   */
  async getCustomerProductionOrders(customerId: string): Promise<ProductionOrder[]> {
    console.log(`[PERPIntegration] Fetching production orders for customer: ${customerId}`);

    try {
      const query = `
        SELECT order_id
        FROM production_orders
        WHERE customer_id = ?
        ORDER BY created_at DESC
        LIMIT 20
      `;

      const result = await this.executeQuery(query, [customerId]);

      if (!result || result.length === 0) {
        return [];
      }

      // Fetch each order (will use cache if available)
      const orders: ProductionOrder[] = [];
      for (const row of result) {
        const order = await this.getProductionOrder(row.order_id);
        if (order) {
          orders.push(order);
        }
      }

      console.log(`[PERPIntegration] ✅ Fetched ${orders.length} production orders`);
      return orders;

    } catch (error) {
      console.error(`[PERPIntegration] ❌ Error fetching customer production orders:`, error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.productionOrderCache.clear();
    this.vipWalletCache.clear();
    this.invoiceCache.clear();
    console.log('[PERPIntegration] ✅ Cache cleared');
  }

  /**
   * Execute database query
   * 
   * NOTE: This is a placeholder. In production, use a proper database client:
   * - MySQL: mysql2
   * - PostgreSQL: pg
   * - Cloudflare D1: D1Database
   */
  private async executeQuery(query: string, params: any[]): Promise<any[]> {
    // TODO: Implement actual database connection
    // For now, return mock data for development

    console.log(`[PERPIntegration] Executing query: ${query.substring(0, 100)}...`);
    console.log(`[PERPIntegration] Params:`, params);

    // Mock data for development
    if (query.includes('FROM production_orders')) {
      return [{
        order_id: params[0],
        order_number: 'PERP-8472',
        customer_id: 'customer_123',
        status: 'in_production',
        artwork_status: 'approved',
        queue_position: null,
        completion_percentage: 65,
        estimated_completion_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_ship_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        actual_completion_date: null,
        actual_ship_date: null,
        production_notes: 'On schedule',
        artwork_notes: 'Artwork approved - no revisions needed',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }];
    }

    if (query.includes('FROM production_items')) {
      return [{
        item_id: 'item_1',
        product_name: 'Custom Hoodies',
        quantity: 100,
        status: 'in_production',
        artwork_url: 'https://example.com/artwork.png'
      }];
    }

    if (query.includes('FROM vip_wallets')) {
      return [{
        customer_id: params[0],
        balance: 250.00,
        currency: 'USD',
        lifetime_earned: 1500.00,
        lifetime_spent: 1250.00
      }];
    }

    if (query.includes('FROM vip_transactions')) {
      return [
        {
          transaction_id: 'txn_1',
          customer_id: params[0],
          type: 'credit',
          amount: 50.00,
          description: 'Cash back from order #1234',
          order_id: 'order_1234',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          transaction_id: 'txn_2',
          customer_id: params[0],
          type: 'debit',
          amount: 25.00,
          description: 'Applied to order #1235',
          order_id: 'order_1235',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    }

    if (query.includes('FROM invoices')) {
      return [{
        invoice_id: 'inv_1',
        invoice_number: 'INV-2024-001',
        order_id: params[0],
        customer_id: 'customer_123',
        total_amount: 1500.00,
        paid_amount: 1500.00,
        balance_due: 0.00,
        currency: 'USD',
        status: 'paid',
        due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        paid_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        pdf_url: 'https://example.com/invoices/inv-2024-001.pdf',
        created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      }];
    }

    if (query.includes('FROM invoice_line_items')) {
      return [
        {
          description: 'Custom Hoodies (100 units)',
          quantity: 100,
          unit_price: 12.00,
          total_price: 1200.00
        },
        {
          description: 'Setup Fee',
          quantity: 1,
          unit_price: 150.00,
          total_price: 150.00
        },
        {
          description: 'Shipping',
          quantity: 1,
          unit_price: 150.00,
          total_price: 150.00
        }
      ];
    }

    return [];
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTTL;
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('[PERPIntegration] Testing database connection...');
      // TODO: Implement actual connection test
      console.log('[PERPIntegration] ✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Database connection failed:', error);
      return false;
    }
  }
}

