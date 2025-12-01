/**
 * Product Knowledge System
 * 
 * Syncs product data from Shopify into the RAG system.
 * Enables AI agents to search and recommend products.
 * 
 * Created: Nov 28, 2025
 * Part of: Dartmouth OS Extensions for Customer Service System
 */

import type { RAGEngine } from '../components/RAGEngine';

/**
 * Shopify product data
 */
export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  variants: ShopifyVariant[];
  images: Array<{
    src: string;
    alt?: string;
  }>;
  options: Array<{
    name: string;
    values: string[];
  }>;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  inventory: {
    available: boolean;
    quantity?: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Shopify product variant
 */
export interface ShopifyVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  inventoryQuantity: number;
  available: boolean;
  options: Record<string, string>;
  image?: {
    src: string;
    alt?: string;
  };
}

/**
 * Product search query
 */
export interface ProductSearchQuery {
  query: string;
  filters?: {
    productType?: string;
    vendor?: string;
    tags?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
    inStockOnly?: boolean;
  };
  limit?: number;
}

/**
 * Product search result
 */
export interface ProductSearchResult {
  product: ShopifyProduct;
  relevanceScore: number;
  matchedFields: string[];
}

/**
 * Sync status
 */
export interface SyncStatus {
  lastSync: string | null;
  productsCount: number;
  status: 'idle' | 'syncing' | 'error';
  error?: string;
}

/**
 * Product Knowledge System
 * 
 * Manages product data from Shopify and makes it searchable via RAG.
 */
export class ProductKnowledgeSystem {
  private ragEngine: RAGEngine;
  private shopifyApiKey: string;
  private shopifyDomain: string;
  private shopifyAccessToken: string;
  private syncStatus: SyncStatus;
  private productCache: Map<string, ShopifyProduct> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  constructor(
    ragEngine: RAGEngine,
    shopifyConfig: {
      apiKey: string;
      domain: string;
      accessToken: string;
    }
  ) {
    this.ragEngine = ragEngine;
    this.shopifyApiKey = shopifyConfig.apiKey;
    this.shopifyDomain = shopifyConfig.domain;
    this.shopifyAccessToken = shopifyConfig.accessToken;
    this.syncStatus = {
      lastSync: null,
      productsCount: 0,
      status: 'idle'
    };
  }

  /**
   * Sync all products from Shopify to RAG
   */
  async syncProducts(): Promise<SyncStatus> {
    console.log('[ProductKnowledgeSystem] Starting product sync from Shopify...');
    this.syncStatus.status = 'syncing';

    try {
      // STEP 1: Fetch products from Shopify
      const products = await this.fetchAllProductsFromShopify();
      console.log(`[ProductKnowledgeSystem] Fetched ${products.length} products from Shopify`);

      // STEP 2: Convert products to RAG documents
      const documents = products.map(product => this.convertProductToRAGDocument(product));

      // STEP 3: Store in RAG system
      await this.storeProductsInRAG(documents);

      // STEP 4: Update cache
      products.forEach(product => {
        this.productCache.set(product.id, product);
      });
      this.lastCacheUpdate = Date.now();

      // STEP 5: Update sync status
      this.syncStatus = {
        lastSync: new Date().toISOString(),
        productsCount: products.length,
        status: 'idle'
      };

      console.log(`[ProductKnowledgeSystem] ✅ Sync complete: ${products.length} products`);
      return this.syncStatus;

    } catch (error) {
      console.error('[ProductKnowledgeSystem] ❌ Sync failed:', error);
      
      this.syncStatus = {
        lastSync: this.syncStatus.lastSync,
        productsCount: this.syncStatus.productsCount,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      throw error;
    }
  }

  /**
   * Search products by query
   */
  async searchProducts(searchQuery: ProductSearchQuery): Promise<ProductSearchResult[]> {
    console.log(`[ProductKnowledgeSystem] Searching products: "${searchQuery.query}"`);

    try {
      // STEP 1: Search RAG system
      const ragResults = await this.ragEngine.retrieve(
        'product-knowledge',
        searchQuery.query,
        searchQuery.limit || 10
      );

      // STEP 2: Parse results and apply filters
      const results: ProductSearchResult[] = [];

      for (const ragResult of ragResults) {
        // Extract product ID from metadata
        const productId = ragResult.metadata?.productId;
        if (!productId) continue;

        // Get product from cache or Shopify
        const product = await this.getProduct(productId);
        if (!product) continue;

        // Apply filters
        if (searchQuery.filters) {
          if (!this.matchesFilters(product, searchQuery.filters)) {
            continue;
          }
        }

        results.push({
          product,
          relevanceScore: ragResult.score || 0,
          matchedFields: this.extractMatchedFields(ragResult)
        });
      }

      console.log(`[ProductKnowledgeSystem] Found ${results.length} matching products`);
      return results;

    } catch (error) {
      console.error('[ProductKnowledgeSystem] Search failed:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<ShopifyProduct | null> {
    // Check cache first
    if (this.isCacheValid() && this.productCache.has(productId)) {
      return this.productCache.get(productId)!;
    }

    // Fetch from Shopify
    try {
      const product = await this.fetchProductFromShopify(productId);
      if (product) {
        this.productCache.set(productId, product);
      }
      return product;
    } catch (error) {
      console.error(`[ProductKnowledgeSystem] Failed to fetch product ${productId}:`, error);
      return null;
    }
  }

  /**
   * Get product recommendations based on customer context
   */
  async getRecommendations(
    customerContext: {
      orderHistory?: Array<{ productId: string }>;
      preferences?: Record<string, any>;
      currentQuery?: string;
    },
    limit: number = 5
  ): Promise<ProductSearchResult[]> {
    console.log('[ProductKnowledgeSystem] Generating product recommendations');

    // Build recommendation query
    let query = '';

    if (customerContext.currentQuery) {
      query = customerContext.currentQuery;
    } else if (customerContext.orderHistory && customerContext.orderHistory.length > 0) {
      // Recommend similar to previous purchases
      query = 'products similar to previous purchases';
    } else {
      // Default to popular products
      query = 'popular products best sellers';
    }

    return await this.searchProducts({ query, limit });
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheTTL;
  }

  /**
   * Fetch all products from Shopify
   */
  private async fetchAllProductsFromShopify(): Promise<ShopifyProduct[]> {
    const products: ShopifyProduct[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const response = await this.shopifyGraphQLQuery(`
        query GetProducts($cursor: String) {
          products(first: 50, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                description
                vendor
                productType
                tags
                variants(first: 100) {
                  edges {
                    node {
                      id
                      title
                      price
                      compareAtPrice
                      sku
                      barcode
                      inventoryQuantity
                      availableForSale
                      selectedOptions {
                        name
                        value
                      }
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
                images(first: 10) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                options {
                  name
                  values
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      `, { cursor });

      const data = response.data.products;
      
      // Parse products
      for (const edge of data.edges) {
        const node = edge.node;
        products.push(this.parseShopifyProduct(node));
      }

      hasNextPage = data.pageInfo.hasNextPage;
      cursor = data.pageInfo.endCursor;
    }

    return products;
  }

  /**
   * Fetch a single product from Shopify
   */
  private async fetchProductFromShopify(productId: string): Promise<ShopifyProduct | null> {
    const response = await this.shopifyGraphQLQuery(`
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          vendor
          productType
          tags
          variants(first: 100) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                barcode
                inventoryQuantity
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                  altText
                }
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          options {
            name
            values
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    `, { id: productId });

    if (!response.data.product) return null;

    return this.parseShopifyProduct(response.data.product);
  }

  /**
   * Make a Shopify GraphQL query
   */
  private async shopifyGraphQLQuery(query: string, variables?: Record<string, any>): Promise<any> {
    const url = `https://${this.shopifyDomain}/admin/api/2024-01/graphql.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.shopifyAccessToken
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
   * Parse Shopify product from GraphQL response
   */
  private parseShopifyProduct(node: any): ShopifyProduct {
    return {
      id: node.id,
      title: node.title,
      description: node.description || '',
      vendor: node.vendor || '',
      productType: node.productType || '',
      tags: node.tags || [],
      variants: node.variants.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        price: parseFloat(edge.node.price),
        compareAtPrice: edge.node.compareAtPrice ? parseFloat(edge.node.compareAtPrice) : undefined,
        sku: edge.node.sku,
        barcode: edge.node.barcode,
        inventoryQuantity: edge.node.inventoryQuantity,
        available: edge.node.availableForSale,
        options: edge.node.selectedOptions.reduce((acc: any, opt: any) => {
          acc[opt.name] = opt.value;
          return acc;
        }, {}),
        image: edge.node.image ? {
          src: edge.node.image.url,
          alt: edge.node.image.altText
        } : undefined
      })),
      images: node.images.edges.map((edge: any) => ({
        src: edge.node.url,
        alt: edge.node.altText
      })),
      options: node.options.map((opt: any) => ({
        name: opt.name,
        values: opt.values
      })),
      price: {
        min: parseFloat(node.priceRange.minVariantPrice.amount),
        max: parseFloat(node.priceRange.maxVariantPrice.amount),
        currency: node.priceRange.minVariantPrice.currencyCode
      },
      inventory: {
        available: node.variants.edges.some((edge: any) => edge.node.availableForSale),
        quantity: node.variants.edges.reduce((sum: number, edge: any) => 
          sum + edge.node.inventoryQuantity, 0)
      }
    };
  }

  /**
   * Convert product to RAG document
   */
  private convertProductToRAGDocument(product: ShopifyProduct): any {
    // Create searchable text
    const searchableText = [
      product.title,
      product.description,
      product.vendor,
      product.productType,
      ...product.tags,
      ...product.variants.map(v => v.title),
      ...product.options.map(o => `${o.name}: ${o.values.join(', ')}`)
    ].filter(Boolean).join(' ');

    return {
      id: `product_${product.id}`,
      content: searchableText,
      metadata: {
        productId: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags,
        priceMin: product.price.min,
        priceMax: product.price.max,
        currency: product.price.currency,
        available: product.inventory.available,
        quantity: product.inventory.quantity,
        imageUrl: product.images[0]?.src,
        variantCount: product.variants.length
      }
    };
  }

  /**
   * Store products in RAG system
   */
  private async storeProductsInRAG(documents: any[]): Promise<void> {
    console.log(`[ProductKnowledgeSystem] Storing ${documents.length} products in RAG`);
    
    // Store each product as a document in RAG
    for (const doc of documents) {
      try {
        await this.ragEngine.ingestDocument('product-knowledge', {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          type: 'product',
          metadata: doc.metadata || {}
        });
      } catch (error) {
        console.error(`[ProductKnowledgeSystem] Error storing product ${doc.id} in RAG:`, error);
      }
    }
    
    console.log(`[ProductKnowledgeSystem] ✅ Stored ${documents.length} products in RAG`);
  }

  /**
   * Check if product matches filters
   */
  private matchesFilters(product: ShopifyProduct, filters: ProductSearchQuery['filters']): boolean {
    if (!filters) return true;

    // Product type filter
    if (filters.productType && product.productType !== filters.productType) {
      return false;
    }

    // Vendor filter
    if (filters.vendor && product.vendor !== filters.vendor) {
      return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => product.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Price range filter
    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined && product.price.max < filters.priceRange.min) {
        return false;
      }
      if (filters.priceRange.max !== undefined && product.price.min > filters.priceRange.max) {
        return false;
      }
    }

    // In stock filter
    if (filters.inStockOnly && !product.inventory.available) {
      return false;
    }

    return true;
  }

  /**
   * Extract matched fields from RAG result
   */
  private extractMatchedFields(ragResult: any): string[] {
    const fields: string[] = [];

    // Check which fields were matched
    if (ragResult.metadata?.title) fields.push('title');
    if (ragResult.metadata?.description) fields.push('description');
    if (ragResult.metadata?.tags) fields.push('tags');
    if (ragResult.metadata?.productType) fields.push('productType');

    return fields;
  }

  /**
   * Clear product cache
   */
  clearCache(): void {
    this.productCache.clear();
    this.lastCacheUpdate = 0;
    console.log('[ProductKnowledgeSystem] Cache cleared');
  }
}

