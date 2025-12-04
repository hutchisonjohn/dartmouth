/**
 * Knowledge Service
 * 
 * Provides AI agents with knowledge from:
 * 1. Tenant Settings (regional preferences, business info)
 * 2. System Message Configuration (role, personality, do's/don'ts)
 * 3. RAG Documents (policies, FAQs, product info) - NOW WITH VECTOR SEARCH
 * 4. Learning Examples (high-quality past responses)
 * 
 * This is the bridge between stored knowledge and AI prompts.
 * 
 * V2.0: Now supports Vector Embeddings RAG for semantic search
 */

import type { D1Database, VectorizeIndex } from '@cloudflare/workers-types';
import { VectorRAGService } from './VectorRAGService';

export interface TenantSettings {
  tenant_id: string;
  business_name: string;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  business_website: string | null;
  timezone: string;
  language: string;
  measurement_system: string;
  currency: string;
  currency_symbol: string;
  date_format: string;
  time_format: string;
}

// Language-specific settings for AI responses
const LANGUAGE_SETTINGS: Record<string, { spellings: string[]; greetings: string[]; terminology: Record<string, string> }> = {
  'en-AU': {
    spellings: ['colour', 'metre', 'organisation', 'favour', 'centre', 'analyse', 'catalogue', 'programme'],
    greetings: ["G'day", 'Hi there', 'Hello'],
    terminology: { shipping: 'postage', inquiry: 'enquiry', while: 'whilst' }
  },
  'en-GB': {
    spellings: ['colour', 'metre', 'organisation', 'favour', 'centre', 'analyse', 'catalogue', 'programme'],
    greetings: ['Hello', 'Hi there', 'Good day'],
    terminology: { shipping: 'postage', inquiry: 'enquiry' }
  },
  'en-US': {
    spellings: ['color', 'meter', 'organization', 'favor', 'center', 'analyze', 'catalog', 'program'],
    greetings: ['Hi', 'Hello', 'Hey there'],
    terminology: {}
  },
  'en-CA': {
    spellings: ['colour', 'metre', 'organization', 'favour', 'centre', 'analyze', 'catalogue', 'program'],
    greetings: ['Hello', 'Hi there', 'Hey'],
    terminology: {}
  }
};

export interface SystemMessageConfig {
  role: string;
  personality: string;
  responsibilities: string;
  dos: string;
  donts: string;
  tone: string;
  custom_instructions: string;
}

export interface LearningExample {
  id: string;
  intent: string;
  customer_message: string;
  ai_response: string;
  quality_score: number;
  sentiment?: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  relevance_score?: number;
}

export interface KnowledgeContext {
  systemMessage: string;
  learningExamples: LearningExample[];
  ragContext: string;
  ragDocuments: RAGDocument[];
  tenantSettings: TenantSettings | null;
}

const DEFAULT_SYSTEM_MESSAGE: SystemMessageConfig = {
  role: `You are McCarthy AI, a friendly and professional customer service assistant for Amazing Transfers, an Australian company specializing in DTF (Direct to Film) and UV DTF transfers for custom printing.`,
  personality: `- Warm, helpful, and professional
- Use Australian English (colour, metre, etc.)
- Friendly but not overly casual
- Patient and understanding
- Knowledgeable about DTF printing`,
  responsibilities: `- Answer questions about products, ordering, and policies
- Help customers with order inquiries
- Provide application instructions for DTF and UV DTF transfers
- Explain shipping, returns, and refund policies
- Assist with artwork requirements and file formats
- Escalate complex issues to human staff when needed`,
  dos: `- Always be polite and respectful
- Provide accurate information from the knowledge base
- Acknowledge customer frustrations with empathy
- Offer to escalate to human staff when you can't help
- Use the customer's name when known
- Confirm understanding before providing solutions`,
  donts: `- Never make up information or guess at policies
- Don't provide specific pricing (direct to website)
- Don't promise things you can't guarantee
- Never argue with customers
- Don't share internal business information
- Don't use American spelling (use colour not color)
- NEVER add sign-offs like "Cheers", "Best regards", "Thanks" at the end of chat messages - this is a live chat, not email
- Don't end every message with a closing - just answer the question naturally`,
  tone: `Professional yet friendly. Think of a knowledgeable colleague who genuinely wants to help. Not robotic, but not overly casual either. Match the customer's energy level.`,
  custom_instructions: ``,
};

export class KnowledgeService {
  private db: D1Database;
  private vectorize: VectorizeIndex | null;
  private openaiApiKey: string | null;
  private vectorRAG: VectorRAGService | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private tenantId: string;

  constructor(
    db: D1Database, 
    tenantId: string = 'test-tenant-dtf',
    vectorize?: VectorizeIndex,
    openaiApiKey?: string
  ) {
    this.db = db;
    this.tenantId = tenantId;
    this.vectorize = vectorize || null;
    this.openaiApiKey = openaiApiKey || null;
    
    // Initialize Vector RAG if both vectorize and openai key are available
    if (this.vectorize && this.openaiApiKey) {
      this.vectorRAG = new VectorRAGService(this.db, this.vectorize, this.openaiApiKey);
      console.log('[KnowledgeService] Vector RAG initialized ✅');
    } else {
      console.log('[KnowledgeService] Vector RAG not available, using keyword search fallback');
    }
  }

  /**
   * Get tenant settings (regional preferences, business info)
   */
  async getTenantSettings(): Promise<TenantSettings | null> {
    const cacheKey = `tenant_settings_${this.tenantId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('[KnowledgeService] Using cached tenant settings');
      return cached.data;
    }

    try {
      const result = await this.db.prepare(`
        SELECT * FROM tenant_settings WHERE tenant_id = ?
      `).bind(this.tenantId).first();

      if (result) {
        const settings = result as TenantSettings;
        this.cache.set(cacheKey, { data: settings, timestamp: Date.now() });
        console.log('[KnowledgeService] Loaded tenant settings from DB');
        return settings;
      }
    } catch (error) {
      console.error('[KnowledgeService] Error loading tenant settings:', error);
    }

    console.log('[KnowledgeService] No tenant settings found');
    return null;
  }

  /**
   * Build regional context string for AI prompts
   */
  buildRegionalContext(settings: TenantSettings): string {
    const langSettings = LANGUAGE_SETTINGS[settings.language] || LANGUAGE_SETTINGS['en-AU'];
    
    const measurementExamples = settings.measurement_system === 'metric'
      ? 'cm, kg, km, °C'
      : 'in, lb, mi, °F';
    
    // Format date example based on settings
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let dateExample: string;
    switch (settings.date_format) {
      case 'DD/MM/YYYY': dateExample = `${day}/${month}/${year}`; break;
      case 'MM/DD/YYYY': dateExample = `${month}/${day}/${year}`; break;
      case 'YYYY-MM-DD': dateExample = `${year}-${month}-${day}`; break;
      default: dateExample = `${day}/${month}/${year}`;
    }
    
    const timeExample = settings.time_format === '12h' ? '2:30 PM' : '14:30';

    return `
# Regional Settings (IMPORTANT - Follow these strictly)
- **Business:** ${settings.business_name}
- **Timezone:** ${settings.timezone}
- **Language:** ${settings.language}
  - Use these spellings: ${langSettings.spellings.join(', ')}
  - Greetings to use: ${langSettings.greetings.join(', ')}
${Object.keys(langSettings.terminology).length > 0 ? `  - Terminology: ${Object.entries(langSettings.terminology).map(([k, v]) => `${k} → ${v}`).join(', ')}` : ''}
- **Measurements:** ${settings.measurement_system === 'metric' ? 'Metric' : 'Imperial'} (${measurementExamples})
- **Currency:** ${settings.currency} (${settings.currency_symbol})
- **Date Format:** ${settings.date_format} (e.g., ${dateExample})
- **Time Format:** ${settings.time_format === '12h' ? '12-hour' : '24-hour'} (e.g., ${timeExample})

CRITICAL: Always use the correct spelling and terminology for the configured language. Never mix American and British/Australian English.
`;
  }

  /**
   * Get the full system message configuration
   */
  async getSystemMessageConfig(): Promise<SystemMessageConfig> {
    // Check cache
    const cached = this.cache.get('system_message');
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('[KnowledgeService] Using cached system message config');
      return cached.data;
    }

    try {
      const result = await this.db.prepare(`
        SELECT * FROM ai_system_message_config WHERE id = 'default'
      `).first();

      if (result) {
        const config: SystemMessageConfig = {
          role: (result.role as string) || DEFAULT_SYSTEM_MESSAGE.role,
          personality: (result.personality as string) || DEFAULT_SYSTEM_MESSAGE.personality,
          responsibilities: (result.responsibilities as string) || DEFAULT_SYSTEM_MESSAGE.responsibilities,
          dos: (result.dos as string) || DEFAULT_SYSTEM_MESSAGE.dos,
          donts: (result.donts as string) || DEFAULT_SYSTEM_MESSAGE.donts,
          tone: (result.tone as string) || DEFAULT_SYSTEM_MESSAGE.tone,
          custom_instructions: (result.custom_instructions as string) || '',
        };
        
        this.cache.set('system_message', { data: config, timestamp: Date.now() });
        console.log('[KnowledgeService] Loaded system message config from DB');
        return config;
      }
    } catch (error) {
      console.error('[KnowledgeService] Error loading system message config:', error);
    }

    console.log('[KnowledgeService] Using default system message config');
    return DEFAULT_SYSTEM_MESSAGE;
  }

  /**
   * Build the full system prompt from configuration
   */
  async buildSystemPrompt(): Promise<string> {
    const config = await this.getSystemMessageConfig();

    let prompt = `# Role
${config.role}

# Personality
${config.personality}

# Responsibilities
${config.responsibilities}

# Do's ✅
${config.dos}

# Don'ts ❌
${config.donts}

# Tone
${config.tone}`;

    if (config.custom_instructions) {
      prompt += `

# Custom Instructions
${config.custom_instructions}`;
    }

    return prompt;
  }

  /**
   * Get top learning examples for few-shot prompting
   */
  async getLearningExamples(limit: number = 5): Promise<LearningExample[]> {
    try {
      const { results } = await this.db.prepare(`
        SELECT 
          id,
          intent,
          customer_message,
          ai_response,
          quality_score,
          sentiment
        FROM ai_learning_examples
        WHERE is_active = 1 AND quality_score >= 4
        ORDER BY quality_score DESC, created_at DESC
        LIMIT ?
      `).bind(limit).all();

      console.log(`[KnowledgeService] Loaded ${results?.length || 0} learning examples`);
      return (results || []) as LearningExample[];
    } catch (error) {
      console.error('[KnowledgeService] Error loading learning examples:', error);
      return [];
    }
  }

  /**
   * Format learning examples for injection into prompt
   */
  formatLearningExamples(examples: LearningExample[]): string {
    if (examples.length === 0) return '';

    let formatted = `\n# High-Quality Response Examples
Learn from these excellent responses that your team has approved:\n`;

    examples.forEach((ex, i) => {
      formatted += `
## Example ${i + 1} (Quality: ${ex.quality_score}/5, Intent: ${ex.intent})
**Customer:** ${ex.customer_message.substring(0, 200)}${ex.customer_message.length > 200 ? '...' : ''}
**Response:** ${ex.ai_response.substring(0, 500)}${ex.ai_response.length > 500 ? '...' : ''}
`;
    });

    return formatted;
  }

  /**
   * Search RAG documents for relevant content
   * 
   * V2.0: Uses Vector Embeddings for semantic search when available
   * Falls back to keyword-based search if Vector RAG is not configured
   */
  async searchRAGDocuments(query: string, limit: number = 5): Promise<RAGDocument[]> {
    console.log('[KnowledgeService] ========== RAG SEARCH START ==========');
    console.log('[KnowledgeService] Query:', query);

    // TRY VECTOR SEARCH FIRST (if available)
    if (this.vectorRAG) {
      try {
        console.log('[KnowledgeService] Using VECTOR SEARCH (semantic)');
        const vectorResults = await this.vectorRAG.search(query, limit);
        
        if (vectorResults.chunks.length > 0) {
          console.log(`[KnowledgeService] Vector search found ${vectorResults.chunks.length} chunks`);
          console.log(`[KnowledgeService] Sources: ${vectorResults.sourcesUsed.join(', ')}`);
          
          // Convert vector results to RAGDocument format
          // Group by document and use highest scoring chunk's content
          const docMap = new Map<string, RAGDocument>();
          
          for (const chunk of vectorResults.chunks) {
            const existingDoc = docMap.get(chunk.documentTitle);
            if (!existingDoc || chunk.score > (existingDoc.relevance_score || 0)) {
              docMap.set(chunk.documentTitle, {
                id: chunk.id,
                title: chunk.documentTitle,
                category: chunk.category,
                content: chunk.content,
                relevance_score: chunk.score
              });
            }
          }
          
          const results = Array.from(docMap.values());
          console.log(`[KnowledgeService] Returning ${results.length} documents from vector search`);
          console.log('[KnowledgeService] ========== RAG SEARCH END ==========');
          return results;
        } else {
          console.log('[KnowledgeService] Vector search returned no results, falling back to keyword search');
        }
      } catch (vectorError) {
        console.error('[KnowledgeService] Vector search error, falling back to keyword:', vectorError);
      }
    }

    // FALLBACK: Keyword-based search (original implementation)
    console.log('[KnowledgeService] Using KEYWORD SEARCH (fallback)');
    return this.searchRAGDocumentsKeyword(query, limit);
  }

  /**
   * Keyword-based RAG search (fallback when Vector RAG is not available)
   */
  private async searchRAGDocumentsKeyword(query: string, limit: number = 5): Promise<RAGDocument[]> {
    const lowerQuery = query.toLowerCase();
    const results: RAGDocument[] = [];
    const loadedIds = new Set<string>();

    try {
      // STEP 1: TOPIC DETECTION - Load MUST-HAVE documents based on what customer is asking about
      const mustLoadDocuments: string[] = [];
      
      // DTF-related questions (heat, temperature, press, application, transfer, settings)
      if (lowerQuery.includes('dtf') || 
          lowerQuery.includes('heat') || 
          lowerQuery.includes('temperature') || 
          lowerQuery.includes('press') ||
          lowerQuery.includes('transfer') ||
          lowerQuery.includes('setting') ||
          lowerQuery.includes('apply') ||
          lowerQuery.includes('application')) {
        
        // Check if it's specifically about UV DTF
        if (lowerQuery.includes('uv') || lowerQuery.includes('sticker') || lowerQuery.includes('decal')) {
          mustLoadDocuments.push('UV DTF Transfers');
          console.log('[KnowledgeService] Topic detected: UV DTF');
        } else {
          // Regular DTF
          mustLoadDocuments.push('DTF Transfers');
          console.log('[KnowledgeService] Topic detected: DTF Transfers');
        }
      }
      
      // Shipping/delivery questions
      if (lowerQuery.includes('ship') || lowerQuery.includes('delivery') || lowerQuery.includes('postage')) {
        mustLoadDocuments.push('Shipping');
        console.log('[KnowledgeService] Topic detected: Shipping');
      }
      
      // Returns/refunds questions
      if (lowerQuery.includes('return') || lowerQuery.includes('refund')) {
        mustLoadDocuments.push('Returns');
        console.log('[KnowledgeService] Topic detected: Returns');
      }
      
      // Order/ordering questions
      if (lowerQuery.includes('order') || lowerQuery.includes('ordering') || lowerQuery.includes('buy')) {
        mustLoadDocuments.push('Ordering');
        console.log('[KnowledgeService] Topic detected: Ordering');
      }
      
      // FAQ for general questions
      if (lowerQuery.includes('faq') || lowerQuery.includes('question')) {
        mustLoadDocuments.push('FAQ');
        console.log('[KnowledgeService] Topic detected: FAQ');
      }

      // STEP 2: Load must-have documents by title matching
      if (mustLoadDocuments.length > 0) {
        console.log('[KnowledgeService] Must-load documents:', mustLoadDocuments);
        
        for (const docTopic of mustLoadDocuments) {
          const doc = await this.db.prepare(`
            SELECT id, title, category, content
            FROM ai_knowledge_documents
            WHERE status = 'active' 
              AND deleted_at IS NULL
              AND title LIKE ?
            LIMIT 1
          `).bind(`%${docTopic}%`).first<RAGDocument>();
          
          if (doc && !loadedIds.has(doc.id)) {
            results.push(doc);
            loadedIds.add(doc.id);
            console.log(`[KnowledgeService] ✅ Loaded must-have doc: ${doc.title} (${doc.content.length} chars)`);
            
            // Verify it has the key info
            if (doc.content.includes('150-160') || doc.content.includes('150°C') || doc.content.includes('160°C')) {
              console.log('[KnowledgeService] ✅ Document contains temperature settings!');
            }
          }
        }
      }

      // STEP 3: Keyword search for additional context (if we haven't hit limit)
      if (results.length < limit) {
        const keywords = lowerQuery
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 2)
          .filter(w => !['the', 'and', 'for', 'are', 'was', 'were', 'what', 'how', 'can', 'you', 'your', 'with'].includes(w))
          .slice(0, 10);

        if (keywords.length > 0) {
          console.log(`[KnowledgeService] Keyword search with: ${keywords.join(', ')}`);
          
          const likeClauses = keywords.map(() => `(content LIKE ? OR title LIKE ?)`).join(' OR ');
          const params = keywords.flatMap(k => [`%${k}%`, `%${k}%`]);

          const { results: keywordResults } = await this.db.prepare(`
            SELECT id, title, category, content
            FROM ai_knowledge_documents
            WHERE status = 'active' 
              AND deleted_at IS NULL
              AND (${likeClauses})
            LIMIT ?
          `).bind(...params, limit - results.length).all();

          // Add keyword results that aren't already loaded
          for (const doc of (keywordResults || []) as RAGDocument[]) {
            if (!loadedIds.has(doc.id)) {
              results.push(doc);
              loadedIds.add(doc.id);
              console.log(`[KnowledgeService] Added keyword match: ${doc.title}`);
            }
          }
        }
      }

      console.log(`[KnowledgeService] Total RAG documents loaded: ${results.length}`);
      console.log('[KnowledgeService] ========== RAG SEARCH END ==========');
      
      return results;
    } catch (error) {
      console.error('[KnowledgeService] Error searching RAG documents:', error);
      return [];
    }
  }

  /**
   * Format RAG documents for injection into prompt
   */
  formatRAGContext(documents: RAGDocument[]): string {
    if (documents.length === 0) return '';

    let formatted = `\n# Knowledge Base Context
Use this information to answer the customer's question accurately:\n`;

    documents.forEach((doc) => {
      // Truncate content to avoid token limits
      const truncatedContent = doc.content.length > 2000 
        ? doc.content.substring(0, 2000) + '...[truncated]'
        : doc.content;

      formatted += `
## ${doc.title} (${doc.category})
${truncatedContent}
---
`;
    });

    return formatted;
  }

  /**
   * Get full knowledge context for a customer query
   * This is the main method to call when generating AI responses
   */
  async getKnowledgeContext(customerMessage: string): Promise<KnowledgeContext> {
    console.log('[KnowledgeService] Building knowledge context...');
    const startTime = Date.now();

    // Fetch all knowledge sources in parallel
    const [tenantSettings, systemPrompt, learningExamples, ragDocuments] = await Promise.all([
      this.getTenantSettings(),
      this.buildSystemPrompt(),
      this.getLearningExamples(5),
      this.searchRAGDocuments(customerMessage, 3)
    ]);

    const ragContext = this.formatRAGContext(ragDocuments);
    const examplesFormatted = this.formatLearningExamples(learningExamples);
    
    // Build regional context if tenant settings exist
    const regionalContext = tenantSettings ? this.buildRegionalContext(tenantSettings) : '';

    console.log(`[KnowledgeService] Knowledge context built in ${Date.now() - startTime}ms`);
    console.log(`[KnowledgeService] - Tenant settings: ${tenantSettings ? 'loaded' : 'not found'}`);
    console.log(`[KnowledgeService] - System prompt: ${systemPrompt.length} chars`);
    console.log(`[KnowledgeService] - Learning examples: ${learningExamples.length}`);
    console.log(`[KnowledgeService] - RAG documents: ${ragDocuments.length}`);
    if (tenantSettings) {
      console.log(`[KnowledgeService] - Language: ${tenantSettings.language}, Timezone: ${tenantSettings.timezone}`);
    }

    return {
      // Regional context comes first so it sets the tone
      systemMessage: regionalContext + systemPrompt + examplesFormatted + ragContext,
      learningExamples,
      ragContext,
      ragDocuments,
      tenantSettings
    };
  }

  /**
   * Clear the cache (useful after config updates)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[KnowledgeService] Cache cleared');
  }
}

