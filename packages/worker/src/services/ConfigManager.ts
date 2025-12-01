/**
 * ConfigManager.ts
 * 
 * Manages agent configurations with database persistence
 * Provides loading, saving, validation, and default templates
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { AgentConfig } from '../types/shared';

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration template
 */
export interface ConfigTemplate {
  name: string;
  description: string;
  config: Partial<AgentConfig>;
}

/**
 * ConfigManager class
 * Handles all agent configuration operations
 */
export class ConfigManager {
  constructor(private db: D1Database) {}

  /**
   * Get agent configuration by ID
   */
  async getConfig(agentId: string): Promise<AgentConfig | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM agent_configs WHERE agent_id = ?')
        .bind(agentId)
        .first<any>();

      if (!result) {
        return null;
      }

      return this.deserializeConfig(result);
    } catch (error) {
      console.error('Failed to get config:', error);
      throw new Error(`Failed to load configuration for agent ${agentId}`);
    }
  }

  /**
   * Save or update agent configuration
   */
  async saveConfig(config: AgentConfig): Promise<void> {
    try {
      const now = new Date().toISOString();
      const serialized = this.serializeConfig(config);

      // Check if config exists
      const existing = await this.db
        .prepare('SELECT agent_id FROM agent_configs WHERE agent_id = ?')
        .bind(config.agentId)
        .first();

      if (existing) {
        // Update existing config
        await this.db
          .prepare(
            `UPDATE agent_configs 
             SET name = ?, version = ?, description = ?, system_prompt = ?, 
                 llm_provider = ?, llm_model = ?, temperature = ?, max_tokens = ?,
                 config_data = ?, updated_at = ?
             WHERE agent_id = ?`
          )
          .bind(
            config.name,
            config.version,
            config.description || null,
            config.systemPrompt || null,
            config.llmProvider || 'anthropic',
            config.llmModel || 'claude-3-5-sonnet-20241022',
            config.temperature || 0.7,
            config.maxTokens || 2000,
            serialized,
            now,
            config.agentId
          )
          .run();
      } else {
        // Insert new config
        await this.db
          .prepare(
            `INSERT INTO agent_configs 
             (agent_id, name, version, description, system_prompt, 
              llm_provider, llm_model, temperature, max_tokens, 
              config_data, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            config.agentId,
            config.name,
            config.version,
            config.description || null,
            config.systemPrompt || null,
            config.llmProvider || 'anthropic',
            config.llmModel || 'claude-3-5-sonnet-20241022',
            config.temperature || 0.7,
            config.maxTokens || 2000,
            serialized,
            now,
            now
          )
          .run();
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new Error(`Failed to save configuration for agent ${config.agentId}`);
    }
  }

  /**
   * Delete agent configuration
   */
  async deleteConfig(agentId: string): Promise<void> {
    try {
      await this.db
        .prepare('DELETE FROM agent_configs WHERE agent_id = ?')
        .bind(agentId)
        .run();
    } catch (error) {
      console.error('Failed to delete config:', error);
      throw new Error(`Failed to delete configuration for agent ${agentId}`);
    }
  }

  /**
   * List all agent configurations
   */
  async listConfigs(limit: number = 50): Promise<AgentConfig[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM agent_configs ORDER BY updated_at DESC LIMIT ?')
        .bind(limit)
        .all<any>();

      return (result.results || []).map(row => this.deserializeConfig(row));
    } catch (error) {
      console.error('Failed to list configs:', error);
      throw new Error('Failed to list agent configurations');
    }
  }

  /**
   * Validate agent configuration
   */
  validateConfig(config: AgentConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!config.agentId || config.agentId.trim() === '') {
      errors.push('Agent ID is required');
    }

    if (!config.name || config.name.trim() === '') {
      errors.push('Agent name is required');
    }

    if (!config.version || config.version.trim() === '') {
      errors.push('Agent version is required');
    }

    // Validate LLM provider
    if (config.llmProvider) {
      const validProviders = ['openai', 'anthropic', 'google'];
      if (!validProviders.includes(config.llmProvider)) {
        errors.push(`Invalid LLM provider: ${config.llmProvider}. Must be one of: ${validProviders.join(', ')}`);
      }
    }

    // Validate temperature
    if (config.temperature !== undefined) {
      if (config.temperature < 0 || config.temperature > 2) {
        errors.push('Temperature must be between 0 and 2');
      }
      if (config.temperature > 1) {
        warnings.push('Temperature above 1 may produce unpredictable results');
      }
    }

    // Validate maxTokens
    if (config.maxTokens !== undefined) {
      if (config.maxTokens < 1) {
        errors.push('Max tokens must be at least 1');
      }
      if (config.maxTokens > 100000) {
        errors.push('Max tokens cannot exceed 100000');
      }
      if (config.maxTokens > 8000) {
        warnings.push('High token limits may increase costs significantly');
      }
    }

    // Validate system prompt
    if (config.systemPrompt && config.systemPrompt.length > 10000) {
      warnings.push('System prompt is very long and may increase token usage');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get default configuration template
   */
  getDefaultConfig(agentId: string, name: string): AgentConfig {
    return {
      agentId,
      name,
      version: '1.0.0',
      description: 'Default agent configuration',
      systemPrompt: 'You are a helpful, accurate, and professional AI assistant.',
      llmProvider: 'anthropic',
      llmModel: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 2000,
    };
  }

  /**
   * Get configuration templates
   */
  getTemplates(): ConfigTemplate[] {
    return [
      {
        name: 'default',
        description: 'Balanced configuration for general use',
        config: {
          llmProvider: 'anthropic',
          llmModel: 'claude-3-5-sonnet-20241022',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: 'You are a helpful, accurate, and professional AI assistant.',
        },
      },
      {
        name: 'creative',
        description: 'Higher temperature for creative tasks',
        config: {
          llmProvider: 'anthropic',
          llmModel: 'claude-3-5-sonnet-20241022',
          temperature: 0.9,
          maxTokens: 3000,
          systemPrompt: 'You are a creative and imaginative AI assistant.',
        },
      },
      {
        name: 'precise',
        description: 'Lower temperature for factual accuracy',
        config: {
          llmProvider: 'anthropic',
          llmModel: 'claude-3-5-sonnet-20241022',
          temperature: 0.3,
          maxTokens: 2000,
          systemPrompt: 'You are a precise and factual AI assistant. Provide accurate information.',
        },
      },
      {
        name: 'fast',
        description: 'Optimized for speed with smaller model',
        config: {
          llmProvider: 'openai',
          llmModel: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 1000,
          systemPrompt: 'You are a helpful AI assistant. Be concise.',
        },
      },
      {
        name: 'detailed',
        description: 'For comprehensive, detailed responses',
        config: {
          llmProvider: 'anthropic',
          llmModel: 'claude-3-5-sonnet-20241022',
          temperature: 0.7,
          maxTokens: 4000,
          systemPrompt: 'You are a thorough AI assistant. Provide detailed, comprehensive answers.',
        },
      },
    ];
  }

  /**
   * Create config from template
   */
  createFromTemplate(
    templateName: string,
    agentId: string,
    name: string
  ): AgentConfig {
    const template = this.getTemplates().find(t => t.name === templateName);
    
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    return {
      agentId,
      name,
      version: '1.0.0',
      ...template.config,
    } as AgentConfig;
  }

  /**
   * Clone configuration with new ID
   */
  cloneConfig(sourceConfig: AgentConfig, newAgentId: string, newName: string): AgentConfig {
    return {
      ...sourceConfig,
      agentId: newAgentId,
      name: newName,
      version: '1.0.0', // Reset version for new agent
    };
  }

  /**
   * Serialize config to JSON string
   */
  private serializeConfig(config: AgentConfig): string {
    return JSON.stringify({
      agentId: config.agentId,
      name: config.name,
      version: config.version,
      description: config.description,
      systemPrompt: config.systemPrompt,
      llmProvider: config.llmProvider,
      llmModel: config.llmModel,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });
  }

  /**
   * Deserialize config from database row
   */
  private deserializeConfig(row: any): AgentConfig {
    // Try to parse config_data if it exists
    let configData: any = {};
    if (row.config_data) {
      try {
        configData = JSON.parse(row.config_data);
      } catch (error) {
        console.error('Failed to parse config_data:', error);
      }
    }

    return {
      agentId: row.agent_id,
      name: row.name,
      version: row.version,
      description: row.description || configData.description,
      systemPrompt: row.system_prompt || configData.systemPrompt,
      llmProvider: row.llm_provider || configData.llmProvider || 'anthropic',
      llmModel: row.llm_model || configData.llmModel || 'claude-3-5-sonnet-20241022',
      temperature: row.temperature !== null ? row.temperature : (configData.temperature || 0.7),
      maxTokens: row.max_tokens !== null ? row.max_tokens : (configData.maxTokens || 2000),
    };
  }

  /**
   * Get configuration statistics
   */
  async getStats(): Promise<{
    totalConfigs: number;
    byProvider: Record<string, number>;
    avgTemperature: number;
    avgMaxTokens: number;
  }> {
    try {
      const totalResult = await this.db
        .prepare('SELECT COUNT(*) as count FROM agent_configs')
        .first<{ count: number }>();

      const providerResult = await this.db
        .prepare('SELECT llm_provider, COUNT(*) as count FROM agent_configs GROUP BY llm_provider')
        .all<{ llm_provider: string; count: number }>();

      const avgResult = await this.db
        .prepare('SELECT AVG(temperature) as avg_temp, AVG(max_tokens) as avg_tokens FROM agent_configs')
        .first<{ avg_temp: number; avg_tokens: number }>();

      const byProvider: Record<string, number> = {};
      (providerResult.results || []).forEach(row => {
        byProvider[row.llm_provider] = row.count;
      });

      return {
        totalConfigs: totalResult?.count || 0,
        byProvider,
        avgTemperature: avgResult?.avg_temp || 0.7,
        avgMaxTokens: avgResult?.avg_tokens || 2000,
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalConfigs: 0,
        byProvider: {},
        avgTemperature: 0.7,
        avgMaxTokens: 2000,
      };
    }
  }
}

