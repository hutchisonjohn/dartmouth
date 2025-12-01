/**
 * PERP Integration
 * 
 * Integrates with PERP (Production ERP system) via REST API to fetch:
 * - Customer information
 * - Order details and production status
 * - Artwork approval status and files
 * - VIP wallet balance (cash back credits)
 * - Invoice retrieval
 * 
 * Method: REST API (Server-to-Server)
 * Authentication: API Key (Bearer Token)
 * Caching: 2-minute TTL for real-time data (using KV)
 * 
 * API Specification: D:\coding\Customer Service AI Agent\CustomerService-PerpAPI.md
 * 
 * Created: Nov 28, 2025
 * Part of: Customer Service Agent Core
 */

/**
 * PERP API Response
 */
interface PERPAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: string;
}

/**
 * Customer from PERP
 */
export interface PERPCustomer {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  is_vip: boolean;
  vip_tier?: string;
  lifetime_value: number;
  total_orders: number;
  created_at: string;
  last_order_date: string;
  billing_address?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

/**
 * Order from PERP
 */
export interface PERPOrder {
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  status: string;
  status_display: string;
  order_date: string;
  estimated_ship_date: string;
  actual_ship_date?: string;
  total_amount: number;
  currency: string;
  line_items: Array<{
    line_item_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    production_status: string;
  }>;
}

/**
 * Production Status from PERP
 */
export interface PERPProductionStatus {
  order_id: string;
  order_number: string;
  overall_status: string;
  completion_percentage: number;
  current_stage: string;
  stages: Array<{
    stage_name: string;
    stage_display: string;
    status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
    started_at?: string;
    completed_at?: string;
    estimated_completion?: string;
  }>;
  estimated_ship_date: string;
  notes?: string;
}

/**
 * Artwork from PERP
 */
export interface PERPArtwork {
  order_id: string;
  artwork_items: Array<{
    artwork_id: string;
    line_item_id: string;
    product_name: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
    submitted_date: string;
    reviewed_date?: string;
    approved_date?: string;
    rejected_date?: string;
    revision_requested_date?: string;
    notes?: string;
    files: {
      original: {
        url: string;
        filename: string;
        file_size: string;
        dpi: number;
        format: string;
      };
      preview: {
        url: string;
        filename: string;
        file_size: string;
        dpi: number;
        format: string;
        width: number;
        height: number;
      };
      thumbnail: {
        url: string;
        filename: string;
        file_size: string;
        dpi: number;
        format: string;
        width: number;
        height: number;
      };
    };
    proof_sheet?: {
      url: string;
      filename: string;
      file_size: string;
      generated_date: string;
      includes_mockup: boolean;
    };
  }>;
}

/**
 * VIP Wallet from PERP
 */
export interface PERPVIPWallet {
  customer_id: string;
  balance: number;
  currency: string;
  last_transaction_date?: string;
  transactions: Array<{
    transaction_id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
  }>;
}

/**
 * Invoice from PERP
 */
export interface PERPInvoice {
  invoice_id: string;
  invoice_number: string;
  customer_id: string;
  order_id: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  pdf_url: string;
}

/**
 * PERP Integration
 * 
 * Provides access to production, artwork, and VIP wallet data from PERP system via REST API.
 */
export class PERPIntegration {
  private apiUrl: string;
  private apiKey: string;

  constructor(config: {
    apiUrl: string;
    apiKey: string;
  }) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    console.log('[PERPIntegration] Initialized with API');
  }

  /**
   * Search customer by email
   */
  async searchCustomerByEmail(email: string): Promise<PERPCustomer | null> {
    try {
      console.log(`[PERPIntegration] Searching customer by email: ${email}`);

      const response = await fetch(`${this.apiUrl}/customers/search?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPCustomer> = await response.json();
      
      if (!result.success) {
        if (result.error?.code === 'CUSTOMER_NOT_FOUND') {
          return null;
        }
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Customer found: ${result.data?.customer_id}`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error searching customer:', error);
      throw error;
    }
  }

  /**
   * Get customer details by ID
   */
  async getCustomer(customerId: string): Promise<PERPCustomer | null> {
    try {
      console.log(`[PERPIntegration] Fetching customer: ${customerId}`);

      const response = await fetch(`${this.apiUrl}/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPCustomer> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Customer fetched: ${result.data?.name}`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error fetching customer:', error);
      throw error;
    }
  }

  /**
   * Get VIP wallet balance and transactions
   */
  async getVIPWallet(customerId: string): Promise<PERPVIPWallet | null> {
    try {
      console.log(`[PERPIntegration] Fetching VIP wallet: ${customerId}`);

      const response = await fetch(`${this.apiUrl}/customers/${customerId}/vip-wallet`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPVIPWallet> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ VIP wallet fetched: Balance $${result.data?.balance}`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error fetching VIP wallet:', error);
      throw error;
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<PERPOrder | null> {
    try {
      console.log(`[PERPIntegration] Fetching order: ${orderId}`);

      const response = await fetch(`${this.apiUrl}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPOrder> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Order fetched: ${result.data?.order_number}`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Search order by number
   */
  async searchOrderByNumber(orderNumber: string): Promise<PERPOrder | null> {
    try {
      console.log(`[PERPIntegration] Searching order by number: ${orderNumber}`);

      const response = await fetch(`${this.apiUrl}/orders/search?order_number=${encodeURIComponent(orderNumber)}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPOrder> = await response.json();
      
      if (!result.success) {
        if (result.error?.code === 'ORDER_NOT_FOUND') {
          return null;
        }
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Order found: ${result.data?.order_id}`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error searching order:', error);
      throw error;
    }
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId: string, limit: number = 10, offset: number = 0): Promise<{ orders: PERPOrder[]; pagination: any }> {
    try {
      console.log(`[PERPIntegration] Fetching customer orders: ${customerId}`);

      const response = await fetch(`${this.apiUrl}/customers/${customerId}/orders?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<{ orders: PERPOrder[]; pagination: any }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Fetched ${result.data?.orders.length} orders`);
      return result.data || { orders: [], pagination: { total: 0, limit, offset, has_more: false } };
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error fetching customer orders:', error);
      throw error;
    }
  }

  /**
   * Get production status with stage breakdown
   */
  async getProductionStatus(orderId: string): Promise<PERPProductionStatus | null> {
    try {
      console.log(`[PERPIntegration] Fetching production status: ${orderId}`);

      const response = await fetch(`${this.apiUrl}/orders/${orderId}/production`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPProductionStatus> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Production status fetched: ${result.data?.completion_percentage}% complete`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error fetching production status:', error);
      throw error;
    }
  }

  /**
   * Get artwork status and files
   */
  async getArtwork(orderId: string): Promise<PERPArtwork | null> {
    try {
      console.log(`[PERPIntegration] Fetching artwork: ${orderId}`);

      const response = await fetch(`${this.apiUrl}/orders/${orderId}/artwork`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPArtwork> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Artwork fetched: ${result.data?.artwork_items.length} items`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error fetching artwork:', error);
      throw error;
    }
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<PERPInvoice | null> {
    try {
      console.log(`[PERPIntegration] Fetching invoice: ${invoiceId}`);

      const response = await fetch(`${this.apiUrl}/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPInvoice> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Invoice fetched: ${result.data?.invoice_number}`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Search invoice by number
   */
  async searchInvoiceByNumber(invoiceNumber: string): Promise<PERPInvoice | null> {
    try {
      console.log(`[PERPIntegration] Searching invoice by number: ${invoiceNumber}`);

      const response = await fetch(`${this.apiUrl}/invoices/search?invoice_number=${encodeURIComponent(invoiceNumber)}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<PERPInvoice> = await response.json();
      
      if (!result.success) {
        if (result.error?.code === 'INVOICE_NOT_FOUND') {
          return null;
        }
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Invoice found: ${result.data?.invoice_id}`);
      return result.data || null;
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error searching invoice:', error);
      throw error;
    }
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(customerId: string, limit: number = 10, offset: number = 0): Promise<{ invoices: PERPInvoice[]; pagination: any }> {
    try {
      console.log(`[PERPIntegration] Fetching customer invoices: ${customerId}`);

      const response = await fetch(`${this.apiUrl}/customers/${customerId}/invoices?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`PERP API error: ${response.status} ${response.statusText}`);
      }

      const result: PERPAPIResponse<{ invoices: PERPInvoice[]; pagination: any }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'PERP API error');
      }

      console.log(`[PERPIntegration] ✅ Fetched ${result.data?.invoices.length} invoices`);
      return result.data || { invoices: [], pagination: { total: 0, limit, offset, has_more: false } };
    } catch (error) {
      console.error('[PERPIntegration] ❌ Error fetching customer invoices:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('[PERPIntegration] Testing API connection...');
      
      // Try to fetch a test customer (will return 404 if not found, but that's ok)
      const response = await fetch(`${this.apiUrl}/customers/test`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // If we get a 401, the API key is invalid
      if (response.status === 401) {
        console.error('[PERPIntegration] ❌ API key is invalid');
        return false;
      }

      // Any other response means the API is accessible
      console.log('[PERPIntegration] ✅ API connection successful');
      return true;
    } catch (error) {
      console.error('[PERPIntegration] ❌ API connection failed:', error);
      return false;
    }
  }
}
