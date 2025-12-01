/**
 * Shopify Integration
 * 
 * Integrates with Shopify to fetch:
 * - Customer profiles (name, email, phone, VIP status, lifetime value)
 * - Order history (all orders, status, tracking, products)
 * - Product catalog (for product inquiries)
 * - Inventory levels (stock availability)
 * 
 * Caching: 5-minute TTL for performance
 * Rate Limit: 2 requests/second (Shopify API limit)
 * 
 * Created: Nov 28, 2025
 * Part of: Customer Service Agent Core
 */

/**
 * Shopify customer
 */
export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  totalSpent: number;
  ordersCount: number;
  isVIP: boolean;  // Calculated based on totalSpent threshold
  lifetimeValue: number;
  tags: string[];
  createdAt: string;
  lastOrderDate?: string;
  defaultAddress?: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
}

/**
 * Shopify order
 */
export interface ShopifyOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  email: string;
  totalPrice: number;
  subtotalPrice: number;
  totalTax: number;
  totalShipping: number;
  currency: string;
  financialStatus: 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'voided';
  fulfillmentStatus: 'fulfilled' | 'partial' | 'unfulfilled' | 'restocked' | null;
  lineItems: Array<{
    id: string;
    productId: string;
    variantId: string;
    title: string;
    variantTitle?: string;
    quantity: number;
    price: number;
    sku?: string;
    imageUrl?: string;
  }>;
  shippingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  trackingCompany?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  closedAt?: string;
  tags: string[];
}

/**
 * Shopify product (simplified)
 */
export interface ShopifyProductSimple {
  id: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  available: boolean;
  imageUrl?: string;
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Shopify Integration
 * 
 * Provides access to Shopify customer and order data.
 */
export class ShopifyIntegration {
  private shopifyDomain: string;
  private accessToken: string;
  private apiVersion: string = '2024-01';
  private vipThreshold: number = 5000; // $5,000 lifetime spend = VIP
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  // Caches
  private customerCache: Map<string, CacheEntry<ShopifyCustomer>> = new Map();
  private orderCache: Map<string, CacheEntry<ShopifyOrder>> = new Map();
  private customerOrdersCache: Map<string, CacheEntry<ShopifyOrder[]>> = new Map();

  // Rate limiting
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 500; // 500ms = 2 requests/second

  constructor(shopifyDomain: string, accessToken: string) {
    this.shopifyDomain = shopifyDomain;
    this.accessToken = accessToken;
    console.log('[ShopifyIntegration] Initialized');
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
    console.log(`[ShopifyIntegration] Fetching customer: ${email}`);

    try {
      // Check cache
      const cached = this.customerCache.get(email);
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log(`[ShopifyIntegration] ✅ Customer found in cache: ${email}`);
        return cached.data;
      }

      // Fetch from Shopify
      const response = await this.graphQLQuery(`
        query GetCustomer($email: String!) {
          customers(first: 1, query: $email) {
            edges {
              node {
                id
                email
                firstName
                lastName
                phone
                tags
                createdAt
                numberOfOrders
                amountSpent {
                  amount
                  currencyCode
                }
                lastOrder {
                  createdAt
                }
                defaultAddress {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
              }
            }
          }
        }
      `, { email: `email:${email}` });

      const edges = response.data.customers.edges;
      if (edges.length === 0) {
        console.log(`[ShopifyIntegration] ❌ Customer not found: ${email}`);
        return null;
      }

      const node = edges[0].node;
      const customer = this.parseCustomer(node);

      // Cache it
      this.customerCache.set(email, {
        data: customer,
        timestamp: Date.now()
      });

      console.log(`[ShopifyIntegration] ✅ Customer fetched: ${email} (VIP: ${customer.isVIP})`);
      return customer;

    } catch (error) {
      console.error(`[ShopifyIntegration] ❌ Error fetching customer:`, error);
      return null;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: string): Promise<ShopifyCustomer | null> {
    console.log(`[ShopifyIntegration] Fetching customer by ID: ${customerId}`);

    try {
      // Check cache
      const cached = this.customerCache.get(customerId);
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      // Fetch from Shopify
      const response = await this.graphQLQuery(`
        query GetCustomer($id: ID!) {
          customer(id: $id) {
            id
            email
            firstName
            lastName
            phone
            tags
            createdAt
            numberOfOrders
            amountSpent {
              amount
              currencyCode
            }
            lastOrder {
              createdAt
            }
            defaultAddress {
              address1
              address2
              city
              province
              country
              zip
            }
          }
        }
      `, { id: customerId });

      if (!response.data.customer) {
        return null;
      }

      const customer = this.parseCustomer(response.data.customer);

      // Cache it
      this.customerCache.set(customerId, {
        data: customer,
        timestamp: Date.now()
      });

      return customer;

    } catch (error) {
      console.error(`[ShopifyIntegration] ❌ Error fetching customer by ID:`, error);
      return null;
    }
  }

  /**
   * Get customer's order history
   */
  async getCustomerOrders(customerId: string, limit: number = 10): Promise<ShopifyOrder[]> {
    console.log(`[ShopifyIntegration] Fetching orders for customer: ${customerId}`);

    try {
      // Check cache
      const cacheKey = `${customerId}_${limit}`;
      const cached = this.customerOrdersCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log(`[ShopifyIntegration] ✅ Orders found in cache`);
        return cached.data;
      }

      // Fetch from Shopify
      const response = await this.graphQLQuery(`
        query GetCustomerOrders($id: ID!, $first: Int!) {
          customer(id: $id) {
            orders(first: $first, sortKey: CREATED_AT, reverse: true) {
              edges {
                node {
                  id
                  name
                  email
                  createdAt
                  updatedAt
                  cancelledAt
                  closedAt
                  tags
                  totalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  subtotalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  totalTaxSet {
                    shopMoney {
                      amount
                    }
                  }
                  totalShippingPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                  displayFinancialStatus
                  displayFulfillmentStatus
                  lineItems(first: 50) {
                    edges {
                      node {
                        id
                        title
                        variantTitle
                        quantity
                        originalUnitPriceSet {
                          shopMoney {
                            amount
                          }
                        }
                        sku
                        product {
                          id
                        }
                        variant {
                          id
                          image {
                            url
                          }
                        }
                      }
                    }
                  }
                  shippingAddress {
                    name
                    address1
                    address2
                    city
                    province
                    country
                    zip
                  }
                  fulfillments {
                    trackingInfo {
                      number
                      url
                      company
                    }
                  }
                }
              }
            }
          }
        }
      `, { id: customerId, first: limit });

      if (!response.data.customer) {
        return [];
      }

      const orders = response.data.customer.orders.edges.map((edge: any) => 
        this.parseOrder(edge.node)
      );

      // Cache it
      this.customerOrdersCache.set(cacheKey, {
        data: orders,
        timestamp: Date.now()
      });

      console.log(`[ShopifyIntegration] ✅ Fetched ${orders.length} orders`);
      return orders;

    } catch (error) {
      console.error(`[ShopifyIntegration] ❌ Error fetching orders:`, error);
      return [];
    }
  }

  /**
   * Get single order by ID
   */
  async getOrder(orderId: string): Promise<ShopifyOrder | null> {
    console.log(`[ShopifyIntegration] Fetching order: ${orderId}`);

    try {
      // Check cache
      const cached = this.orderCache.get(orderId);
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      // Fetch from Shopify
      const response = await this.graphQLQuery(`
        query GetOrder($id: ID!) {
          order(id: $id) {
            id
            name
            email
            createdAt
            updatedAt
            cancelledAt
            closedAt
            tags
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalTaxSet {
              shopMoney {
                amount
              }
            }
            totalShippingPriceSet {
              shopMoney {
                amount
              }
            }
            displayFinancialStatus
            displayFulfillmentStatus
            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  variantTitle
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                  sku
                  product {
                    id
                  }
                  variant {
                    id
                    image {
                      url
                    }
                  }
                }
              }
            }
            shippingAddress {
              name
              address1
              address2
              city
              province
              country
              zip
            }
            fulfillments {
              trackingInfo {
                number
                url
                company
              }
            }
            customer {
              id
            }
          }
        }
      `, { id: orderId });

      if (!response.data.order) {
        return null;
      }

      const order = this.parseOrder(response.data.order);

      // Cache it
      this.orderCache.set(orderId, {
        data: order,
        timestamp: Date.now()
      });

      return order;

    } catch (error) {
      console.error(`[ShopifyIntegration] ❌ Error fetching order:`, error);
      return null;
    }
  }

  /**
   * Search orders by order number
   */
  async searchOrderByNumber(orderNumber: string): Promise<ShopifyOrder | null> {
    console.log(`[ShopifyIntegration] Searching order by number: ${orderNumber}`);

    try {
      const response = await this.graphQLQuery(`
        query SearchOrder($query: String!) {
          orders(first: 1, query: $query) {
            edges {
              node {
                id
                name
                email
                createdAt
                updatedAt
                cancelledAt
                closedAt
                tags
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                subtotalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                totalTaxSet {
                  shopMoney {
                    amount
                  }
                }
                totalShippingPriceSet {
                  shopMoney {
                    amount
                  }
                }
                displayFinancialStatus
                displayFulfillmentStatus
                lineItems(first: 50) {
                  edges {
                    node {
                      id
                      title
                      variantTitle
                      quantity
                      originalUnitPriceSet {
                        shopMoney {
                          amount
                        }
                      }
                      sku
                      product {
                        id
                      }
                      variant {
                        id
                        image {
                          url
                        }
                      }
                    }
                  }
                }
                shippingAddress {
                  name
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
                fulfillments {
                  trackingInfo {
                    number
                    url
                    company
                  }
                }
                customer {
                  id
                }
              }
            }
          }
        }
      `, { query: `name:${orderNumber}` });

      const edges = response.data.orders.edges;
      if (edges.length === 0) {
        return null;
      }

      return this.parseOrder(edges[0].node);

    } catch (error) {
      console.error(`[ShopifyIntegration] ❌ Error searching order:`, error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.customerCache.clear();
    this.orderCache.clear();
    this.customerOrdersCache.clear();
    console.log('[ShopifyIntegration] ✅ Cache cleared');
  }

  /**
   * Make Shopify GraphQL query with rate limiting
   */
  private async graphQLQuery(query: string, variables?: Record<string, any>): Promise<any> {
    // Rate limiting
    await this.rateLimit();

    const url = `https://${this.shopifyDomain}/admin/api/${this.apiVersion}/graphql.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`Shopify GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data;
  }

  /**
   * Rate limiting (2 requests/second)
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTTL;
  }

  /**
   * Parse Shopify customer
   */
  private parseCustomer(node: any): ShopifyCustomer {
    const totalSpent = parseFloat(node.amountSpent?.amount || '0');
    const isVIP = totalSpent >= this.vipThreshold;

    return {
      id: node.id,
      email: node.email,
      firstName: node.firstName || '',
      lastName: node.lastName || '',
      phone: node.phone,
      totalSpent,
      ordersCount: node.numberOfOrders || 0,
      isVIP,
      lifetimeValue: totalSpent,
      tags: node.tags || [],
      createdAt: node.createdAt,
      lastOrderDate: node.lastOrder?.createdAt,
      defaultAddress: node.defaultAddress ? {
        address1: node.defaultAddress.address1,
        address2: node.defaultAddress.address2,
        city: node.defaultAddress.city,
        province: node.defaultAddress.province,
        country: node.defaultAddress.country,
        zip: node.defaultAddress.zip
      } : undefined
    };
  }

  /**
   * Parse Shopify order
   */
  private parseOrder(node: any): ShopifyOrder {
    // Extract tracking info
    let trackingNumber, trackingUrl, trackingCompany;
    if (node.fulfillments && node.fulfillments.length > 0) {
      const tracking = node.fulfillments[0].trackingInfo?.[0];
      if (tracking) {
        trackingNumber = tracking.number;
        trackingUrl = tracking.url;
        trackingCompany = tracking.company;
      }
    }

    return {
      id: node.id,
      orderNumber: node.name,
      customerId: node.customer?.id || '',
      email: node.email,
      totalPrice: parseFloat(node.totalPriceSet.shopMoney.amount),
      subtotalPrice: parseFloat(node.subtotalPriceSet.shopMoney.amount),
      totalTax: parseFloat(node.totalTaxSet.shopMoney.amount),
      totalShipping: parseFloat(node.totalShippingPriceSet.shopMoney.amount),
      currency: node.totalPriceSet.shopMoney.currencyCode,
      financialStatus: this.normalizeFinancialStatus(node.displayFinancialStatus),
      fulfillmentStatus: this.normalizeFulfillmentStatus(node.displayFulfillmentStatus),
      lineItems: node.lineItems.edges.map((edge: any) => ({
        id: edge.node.id,
        productId: edge.node.product?.id || '',
        variantId: edge.node.variant?.id || '',
        title: edge.node.title,
        variantTitle: edge.node.variantTitle,
        quantity: edge.node.quantity,
        price: parseFloat(edge.node.originalUnitPriceSet.shopMoney.amount),
        sku: edge.node.sku,
        imageUrl: edge.node.variant?.image?.url
      })),
      shippingAddress: node.shippingAddress ? {
        name: node.shippingAddress.name,
        address1: node.shippingAddress.address1,
        address2: node.shippingAddress.address2,
        city: node.shippingAddress.city,
        province: node.shippingAddress.province,
        country: node.shippingAddress.country,
        zip: node.shippingAddress.zip
      } : undefined,
      trackingNumber,
      trackingUrl,
      trackingCompany,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      cancelledAt: node.cancelledAt,
      closedAt: node.closedAt,
      tags: node.tags || []
    };
  }

  /**
   * Normalize financial status
   */
  private normalizeFinancialStatus(status: string): ShopifyOrder['financialStatus'] {
    const normalized = status.toLowerCase().replace(/\s+/g, '_');
    return normalized as ShopifyOrder['financialStatus'];
  }

  /**
   * Normalize fulfillment status
   */
  private normalizeFulfillmentStatus(status: string | null): ShopifyOrder['fulfillmentStatus'] {
    if (!status) return null;
    const normalized = status.toLowerCase().replace(/\s+/g, '_');
    return normalized as ShopifyOrder['fulfillmentStatus'];
  }
}

