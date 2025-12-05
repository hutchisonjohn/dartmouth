/**
 * Shopify Controller
 * 
 * API endpoints for fetching Shopify customer and order data
 * Used by the ticket detail page to show customer info, order history, and tracking
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';
import { ShopifyIntegration } from '../services/ShopifyIntegration';

/**
 * Get or create ShopifyIntegration instance
 */
function getShopifyClient(env: Env): ShopifyIntegration | null {
  const shopifyDomain = env.SHOPIFY_DOMAIN;
  const shopifyAccessToken = env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyDomain || !shopifyAccessToken) {
    console.log('[Shopify] Missing SHOPIFY_DOMAIN or SHOPIFY_ACCESS_TOKEN');
    return null;
  }

  return new ShopifyIntegration(shopifyDomain, shopifyAccessToken);
}

/**
 * Get customer info by email
 * GET /api/shopify/customer?email=customer@example.com
 */
export async function getCustomerByEmail(c: Context<{ Bindings: Env }>) {
  try {
    const email = c.req.query('email');
    
    if (!email) {
      return c.json({ error: 'Email parameter is required' }, 400);
    }

    const shopify = getShopifyClient(c.env);
    
    if (!shopify) {
      // Return mock data if Shopify is not configured
      console.log('[Shopify] Not configured, returning mock data');
      return c.json({
        customer: {
          id: 'mock-customer-id',
          email: email,
          firstName: email.split('@')[0],
          lastName: '',
          phone: null,
          totalSpent: 0,
          ordersCount: 0,
          isVIP: false,
          lifetimeValue: 0,
          tags: [],
          createdAt: new Date().toISOString(),
          lastOrderDate: null,
          defaultAddress: null
        },
        isMock: true,
        message: 'Shopify integration not configured. Using mock data.'
      });
    }

    const customer = await shopify.getCustomerByEmail(email);

    if (!customer) {
      return c.json({ 
        customer: null, 
        message: 'Customer not found in Shopify' 
      });
    }

    return c.json({ customer, isMock: false });

  } catch (error: any) {
    console.error('[Shopify] Get customer error:', error);
    return c.json({ 
      error: 'Failed to fetch customer data', 
      details: error.message 
    }, 500);
  }
}

/**
 * Get customer's order history
 * GET /api/shopify/customer/:customerId/orders?limit=10
 */
export async function getCustomerOrders(c: Context<{ Bindings: Env }>) {
  try {
    const customerId = c.req.param('customerId');
    const limit = parseInt(c.req.query('limit') || '10');
    
    if (!customerId) {
      return c.json({ error: 'Customer ID is required' }, 400);
    }

    const shopify = getShopifyClient(c.env);
    
    if (!shopify) {
      // Return mock data if Shopify is not configured
      return c.json({
        orders: [],
        isMock: true,
        message: 'Shopify integration not configured. Using mock data.'
      });
    }

    const orders = await shopify.getCustomerOrders(customerId, limit);

    return c.json({ orders, isMock: false });

  } catch (error: any) {
    console.error('[Shopify] Get orders error:', error);
    return c.json({ 
      error: 'Failed to fetch order data', 
      details: error.message 
    }, 500);
  }
}

/**
 * Get orders by customer email (convenience endpoint)
 * GET /api/shopify/orders?email=customer@example.com&limit=10
 */
export async function getOrdersByEmail(c: Context<{ Bindings: Env }>) {
  try {
    const email = c.req.query('email');
    const limit = parseInt(c.req.query('limit') || '10');
    
    if (!email) {
      return c.json({ error: 'Email parameter is required' }, 400);
    }

    const shopify = getShopifyClient(c.env);
    
    if (!shopify) {
      // Return mock data if Shopify is not configured
      return c.json({
        customer: null,
        orders: [],
        isMock: true,
        message: 'Shopify integration not configured. Using mock data.'
      });
    }

    // First get customer by email
    const customer = await shopify.getCustomerByEmail(email);

    if (!customer) {
      return c.json({ 
        customer: null,
        orders: [],
        message: 'Customer not found in Shopify' 
      });
    }

    // Then get their orders
    const orders = await shopify.getCustomerOrders(customer.id, limit);

    return c.json({ customer, orders, isMock: false });

  } catch (error: any) {
    console.error('[Shopify] Get orders by email error:', error);
    return c.json({ 
      error: 'Failed to fetch order data', 
      details: error.message 
    }, 500);
  }
}

/**
 * Search for a specific order by order number
 * GET /api/shopify/order?number=1234
 */
export async function searchOrder(c: Context<{ Bindings: Env }>) {
  try {
    const orderNumber = c.req.query('number');
    
    if (!orderNumber) {
      return c.json({ error: 'Order number parameter is required' }, 400);
    }

    const shopify = getShopifyClient(c.env);
    
    if (!shopify) {
      // Return mock data if Shopify is not configured
      return c.json({
        order: null,
        isMock: true,
        message: 'Shopify integration not configured. Using mock data.'
      });
    }

    const order = await shopify.searchOrderByNumber(orderNumber);

    if (!order) {
      return c.json({ 
        order: null, 
        message: `Order #${orderNumber} not found` 
      });
    }

    return c.json({ order, isMock: false });

  } catch (error: any) {
    console.error('[Shopify] Search order error:', error);
    return c.json({ 
      error: 'Failed to search order', 
      details: error.message 
    }, 500);
  }
}

/**
 * Get a specific order by ID
 * GET /api/shopify/order/:orderId
 */
export async function getOrder(c: Context<{ Bindings: Env }>) {
  try {
    const orderId = c.req.param('orderId');
    
    if (!orderId) {
      return c.json({ error: 'Order ID is required' }, 400);
    }

    const shopify = getShopifyClient(c.env);
    
    if (!shopify) {
      return c.json({
        order: null,
        isMock: true,
        message: 'Shopify integration not configured. Using mock data.'
      });
    }

    const order = await shopify.getOrder(orderId);

    if (!order) {
      return c.json({ 
        order: null, 
        message: 'Order not found' 
      });
    }

    return c.json({ order, isMock: false });

  } catch (error: any) {
    console.error('[Shopify] Get order error:', error);
    return c.json({ 
      error: 'Failed to fetch order', 
      details: error.message 
    }, 500);
  }
}

/**
 * Get full Shopify data for a ticket (customer + orders + latest order tracking)
 * This is the main endpoint used by the ticket detail page
 * GET /api/shopify/ticket-data?email=customer@example.com
 */
export async function getTicketShopifyData(c: Context<{ Bindings: Env }>) {
  try {
    const email = c.req.query('email');
    
    if (!email) {
      return c.json({ error: 'Email parameter is required' }, 400);
    }

    const shopify = getShopifyClient(c.env);
    
    if (!shopify) {
      // Return structured mock data if Shopify is not configured
      return c.json({
        configured: false,
        customer: null,
        orders: [],
        latestOrder: null,
        message: 'Shopify integration not configured. Add SHOPIFY_DOMAIN and SHOPIFY_ACCESS_TOKEN to enable.'
      });
    }

    // Get customer
    const customer = await shopify.getCustomerByEmail(email);

    if (!customer) {
      return c.json({ 
        configured: true,
        customer: null,
        orders: [],
        latestOrder: null,
        message: 'Customer not found in Shopify' 
      });
    }

    // Get orders (up to 5 recent ones)
    const orders = await shopify.getCustomerOrders(customer.id, 5);

    // Get the latest order with tracking info
    const latestOrder = orders.length > 0 ? orders[0] : null;

    return c.json({ 
      configured: true,
      customer, 
      orders, 
      latestOrder,
      message: null
    });

  } catch (error: any) {
    console.error('[Shopify] Get ticket Shopify data error:', error);
    return c.json({ 
      error: 'Failed to fetch Shopify data', 
      details: error.message 
    }, 500);
  }
}

