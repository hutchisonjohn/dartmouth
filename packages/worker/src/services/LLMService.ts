/**
 * LLM Service
 * 
 * Handles communication with LLM providers (OpenAI, Anthropic, Google)
 * Provides conversation generation with context, memory, and constraints
 */

import type { AgentConfig, Message, ConversationState } from '../types/shared';

export interface LLMRequest {
  messages: Message[];
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  conversationContext?: ConversationState;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed: number;
  finishReason: string;
}

export class LLMService {
  private apiKey: string;
  private provider: 'openai' | 'anthropic' | 'google';
  private model: string;

  constructor(
    provider: 'openai' | 'anthropic' | 'google',
    apiKey: string,
    model: string
  ) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Estimate token count for a given text
   * Uses rough approximation: ~4 characters per token for English text
   * This is a simplification; real tokenization is more complex and model-specific
   * 
   * @param text - The text to estimate tokens for
   * @returns Estimated token count
   */
  estimateTokens(text: string): number {
    if (!text || text.length === 0) {
      return 0;
    }
    
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is based on OpenAI's rule of thumb
    // More accurate would be to use tiktoken library, but this is sufficient for estimation
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate a response using the configured LLM
   */
  async generate(request: LLMRequest): Promise<LLMResponse> {
    switch (this.provider) {
      case 'openai':
        return this.generateOpenAI(request);
      case 'anthropic':
        return this.generateAnthropic(request);
      case 'google':
        return this.generateGoogle(request);
      default:
        throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }
  }

  /**
   * Generate response using OpenAI API
   */
  private async generateOpenAI(request: LLMRequest): Promise<LLMResponse> {
    const messages = [
      { role: 'system', content: request.systemPrompt },
      ...request.messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      tokensUsed: data.usage.total_tokens,
      finishReason: data.choices[0].finish_reason
    };
  }

  /**
   * Generate response using Anthropic API
   */
  private async generateAnthropic(request: LLMRequest): Promise<LLMResponse> {
    const messages = request.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        system: request.systemPrompt,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      content: data.content[0].text,
      model: data.model,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
      finishReason: data.stop_reason
    };
  }

  /**
   * Generate response using Google AI API
   */
  private async generateGoogle(request: LLMRequest): Promise<LLMResponse> {
    // Build conversation history
    const contents = request.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: request.systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? 1000
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      content: data.candidates[0].content.parts[0].text,
      model: this.model,
      tokensUsed: data.usageMetadata?.totalTokenCount || 0,
      finishReason: data.candidates[0].finishReason
    };
  }

  /**
   * Build system prompt with conversation context
   */
  static buildSystemPrompt(
    basePrompt: string,
    conversationContext?: ConversationState,
    constraints?: string[]
  ): string {
    let prompt = basePrompt;

    // Add conversation context
    if (conversationContext) {
      prompt += '\n\n## Conversation Context\n';
      
      if (conversationContext.userGoal) {
        prompt += `User Goal: ${conversationContext.userGoal.description}\n`;
      }

      if (conversationContext.messageCount > 0) {
        prompt += `Messages in conversation: ${conversationContext.messageCount}\n`;
      }

      // Add short-term memory (recent facts)
      if (conversationContext.shortTermMemory && conversationContext.shortTermMemory.length > 0) {
        prompt += '\n### Recent Context:\n';
        conversationContext.shortTermMemory.slice(-5).forEach(item => {
          prompt += `- ${item.content}\n`;
        });
      }
    }

    // Add constraints
    if (constraints && constraints.length > 0) {
      prompt += '\n\n## Business Rules (CRITICAL - MUST FOLLOW):\n';
      constraints.forEach(constraint => {
        prompt += `- ${constraint}\n`;
      });
    }

    return prompt;
  }
}
