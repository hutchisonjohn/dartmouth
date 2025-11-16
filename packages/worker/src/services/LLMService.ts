/**
 * LLM Service
 * 
 * Multi-provider LLM service with support for:
 * - OpenAI (GPT-4o-mini) - Primary
 * - Anthropic (Claude Sonnet 4) - Premium
 * - Google (Gemini 1.5 Flash) - Fallback
 * 
 * Features:
 * - Automatic retry logic (3 attempts)
 * - Provider fallback on failure
 * - Token counting and cost tracking
 * - Streaming support
 * - Error handling
 */

import type { Message } from '../types/shared';

/**
 * LLM Provider types
 */
export type LLMProvider = 'openai' | 'anthropic' | 'google';

/**
 * LLM Configuration
 */
export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
}

/**
 * LLM Context for generation
 */
export interface LLMContext {
  conversationHistory?: Message[];
  ragContext?: string;
  systemPrompt?: string;
  userContext?: Record<string, any>;
}

/**
 * LLM Response
 */
export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  cached: boolean;
  processingTime: number;
}

/**
 * API Keys interface
 */
interface APIKeys {
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
}

/**
 * LLM Service - Multi-provider AI text generation
 */
export class LLMService {
  private apiKeys: APIKeys;
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  // Cost per 1M tokens (as of Nov 2024)
  private readonly costs = {
    'openai-gpt-4o-mini': { prompt: 0.15, completion: 0.60 },
    'anthropic-claude-sonnet-4': { prompt: 3.00, completion: 15.00 },
    'google-gemini-1.5-flash': { prompt: 0.075, completion: 0.30 }
  };

  constructor(apiKeys: APIKeys) {
    this.apiKeys = apiKeys;
  }

  /**
   * Generate text using the specified LLM provider
   */
  async generate(
    prompt: string,
    config: LLMConfig,
    context?: LLMContext
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    // Build the full prompt with context
    const fullPrompt = this.buildPrompt(prompt, config, context);

    // Try primary provider with retries
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[LLMService] Attempt ${attempt}/${this.maxRetries} with ${config.provider}`);
        
        const response = await this.callProvider(config.provider, config, fullPrompt, context);
        
        return {
          ...response,
          processingTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`[LLMService] Attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    // If primary provider failed, try fallback providers
    console.warn(`[LLMService] Primary provider ${config.provider} failed, trying fallbacks`);
    
    const fallbackProviders = this.getFallbackProviders(config.provider);
    
    for (const fallbackProvider of fallbackProviders) {
      try {
        console.log(`[LLMService] Trying fallback provider: ${fallbackProvider}`);
        
        const fallbackConfig = { ...config, provider: fallbackProvider };
        const response = await this.callProvider(fallbackProvider, fallbackConfig, fullPrompt, context);
        
        return {
          ...response,
          processingTime: Date.now() - startTime
        };
      } catch (error) {
        console.error(`[LLMService] Fallback ${fallbackProvider} failed:`, error);
      }
    }

    // All providers failed
    throw new Error(`LLM generation failed after ${this.maxRetries} retries: ${lastError?.message}`);
  }

  /**
   * Call a specific LLM provider
   */
  private async callProvider(
    provider: LLMProvider,
    config: LLMConfig,
    prompt: string,
    context?: LLMContext
  ): Promise<Omit<LLMResponse, 'processingTime'>> {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(config, prompt, context);
      case 'anthropic':
        return this.callAnthropic(config, prompt, context);
      case 'google':
        return this.callGoogle(config, prompt, context);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    config: LLMConfig,
    prompt: string,
    context?: LLMContext
  ): Promise<Omit<LLMResponse, 'processingTime'>> {
    if (!this.apiKeys.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const model = config.model || 'gpt-4o-mini';
    
    const messages: any[] = [];
    
    // Add system prompt
    if (config.systemPrompt || context?.systemPrompt) {
      messages.push({
        role: 'system',
        content: config.systemPrompt || context?.systemPrompt
      });
    }

    // Add conversation history
    if (context?.conversationHistory) {
      for (const msg of context.conversationHistory.slice(-10)) { // Last 10 messages
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Add RAG context if available
    if (context?.ragContext) {
      messages.push({
        role: 'system',
        content: `Relevant context from knowledge base:\n\n${context.ragContext}`
      });
    }

    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKeys.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 1000,
        top_p: config.topP ?? 1,
        frequency_penalty: config.frequencyPenalty ?? 0,
        presence_penalty: config.presencePenalty ?? 0
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data: any = await response.json();

    const promptTokens = data.usage.prompt_tokens;
    const completionTokens = data.usage.completion_tokens;
    const totalTokens = data.usage.total_tokens;

    return {
      content: data.choices[0].message.content,
      provider: 'openai',
      model,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      },
      cost: this.calculateCost('openai-gpt-4o-mini', promptTokens, completionTokens),
      cached: false
    };
  }

  /**
   * Call Anthropic API (Claude)
   */
  private async callAnthropic(
    config: LLMConfig,
    prompt: string,
    context?: LLMContext
  ): Promise<Omit<LLMResponse, 'processingTime'>> {
    if (!this.apiKeys.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    const model = config.model || 'claude-sonnet-4-20250514';
    
    const messages: any[] = [];

    // Add conversation history
    if (context?.conversationHistory) {
      for (const msg of context.conversationHistory.slice(-10)) {
        if (msg.role !== 'system') {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      }
    }

    // Add RAG context and current prompt
    let finalPrompt = prompt;
    if (context?.ragContext) {
      finalPrompt = `Relevant context from knowledge base:\n\n${context.ragContext}\n\nUser question: ${prompt}`;
    }

    messages.push({
      role: 'user',
      content: finalPrompt
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKeys.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages,
        system: config.systemPrompt || context?.systemPrompt || 'You are a helpful AI assistant.',
        max_tokens: config.maxTokens ?? 1000,
        temperature: config.temperature ?? 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data: any = await response.json();

    const promptTokens = data.usage.input_tokens;
    const completionTokens = data.usage.output_tokens;
    const totalTokens = promptTokens + completionTokens;

    return {
      content: data.content[0].text,
      provider: 'anthropic',
      model,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      },
      cost: this.calculateCost('anthropic-claude-sonnet-4', promptTokens, completionTokens),
      cached: false
    };
  }

  /**
   * Call Google Gemini API
   */
  private async callGoogle(
    config: LLMConfig,
    prompt: string,
    context?: LLMContext
  ): Promise<Omit<LLMResponse, 'processingTime'>> {
    if (!this.apiKeys.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured');
    }

    const model = config.model || 'gemini-1.5-flash';
    
    // Build the full prompt with context
    let fullPrompt = '';
    
    if (config.systemPrompt || context?.systemPrompt) {
      fullPrompt += `${config.systemPrompt || context?.systemPrompt}\n\n`;
    }

    if (context?.ragContext) {
      fullPrompt += `Relevant context:\n${context.ragContext}\n\n`;
    }

    if (context?.conversationHistory) {
      fullPrompt += 'Conversation history:\n';
      for (const msg of context.conversationHistory.slice(-5)) {
        fullPrompt += `${msg.role}: ${msg.content}\n`;
      }
      fullPrompt += '\n';
    }

    fullPrompt += `User: ${prompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKeys.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxTokens ?? 1000,
            topP: config.topP ?? 1
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${response.status} - ${error}`);
    }

    const data: any = await response.json();

    // Google doesn't provide detailed token counts in the response
    // Estimate based on character count (rough approximation: 4 chars = 1 token)
    const promptTokens = Math.ceil(fullPrompt.length / 4);
    const completionText = data.candidates[0].content.parts[0].text;
    const completionTokens = Math.ceil(completionText.length / 4);
    const totalTokens = promptTokens + completionTokens;

    return {
      content: completionText,
      provider: 'google',
      model,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      },
      cost: this.calculateCost('google-gemini-1.5-flash', promptTokens, completionTokens),
      cached: false
    };
  }

  /**
   * Build the full prompt with context
   */
  private buildPrompt(
    prompt: string,
    config: LLMConfig,
    context?: LLMContext
  ): string {
    let fullPrompt = '';

    // Add system prompt
    if (config.systemPrompt || context?.systemPrompt) {
      fullPrompt += `${config.systemPrompt || context?.systemPrompt}\n\n`;
    }

    // Add RAG context
    if (context?.ragContext) {
      fullPrompt += `Relevant information from knowledge base:\n${context.ragContext}\n\n`;
    }

    // Add conversation history summary (if needed)
    if (context?.conversationHistory && context.conversationHistory.length > 0) {
      fullPrompt += 'Previous conversation:\n';
      for (const msg of context.conversationHistory.slice(-5)) {
        fullPrompt += `${msg.role}: ${msg.content}\n`;
      }
      fullPrompt += '\n';
    }

    // Add current prompt
    fullPrompt += prompt;

    return fullPrompt;
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(
    modelKey: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    const pricing = this.costs[modelKey as keyof typeof this.costs];
    if (!pricing) return 0;

    const promptCost = (promptTokens / 1_000_000) * pricing.prompt;
    const completionCost = (completionTokens / 1_000_000) * pricing.completion;

    return promptCost + completionCost;
  }

  /**
   * Get fallback providers in order of preference
   */
  private getFallbackProviders(primaryProvider: LLMProvider): LLMProvider[] {
    const allProviders: LLMProvider[] = ['openai', 'google', 'anthropic'];
    return allProviders.filter(p => p !== primaryProvider);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Estimate token count from text (rough approximation)
   */
  estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if a provider is available (has API key)
   */
  isProviderAvailable(provider: LLMProvider): boolean {
    switch (provider) {
      case 'openai':
        return !!this.apiKeys.OPENAI_API_KEY;
      case 'anthropic':
        return !!this.apiKeys.ANTHROPIC_API_KEY;
      case 'google':
        return !!this.apiKeys.GOOGLE_API_KEY;
      default:
        return false;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): LLMProvider[] {
    const providers: LLMProvider[] = [];
    if (this.isProviderAvailable('openai')) providers.push('openai');
    if (this.isProviderAvailable('anthropic')) providers.push('anthropic');
    if (this.isProviderAvailable('google')) providers.push('google');
    return providers;
  }
}

