/**
 * Agent Registry
 * 
 * Central registry for all McCarthy agents in the system.
 * Manages agent metadata, capabilities, and availability.
 */

import type { Intent } from '../types/shared';

/**
 * McCarthy Agent metadata
 */
export interface McCarthyAgentMetadata {
  id: string;
  type: string;
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  intents: string[];
  status: 'active' | 'inactive' | 'coming-soon';
  priority: number; // Higher = higher priority when multiple agents can handle
  constraints?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * McCarthy Agent interface
 */
export interface McCarthyAgent {
  metadata: McCarthyAgentMetadata;
  canHandle(intent: Intent): boolean;
  canContribute(intent: Intent): boolean;
}

/**
 * Agent Registry
 * 
 * Manages all available McCarthy agents and provides lookup/discovery.
 */
export class AgentRegistry {
  private agents: Map<string, McCarthyAgent> = new Map();

  /**
   * Register a McCarthy agent
   */
  registerAgent(agent: McCarthyAgent): void {
    if (this.agents.has(agent.metadata.id)) {
      console.warn(`[AgentRegistry] Agent ${agent.metadata.id} already registered, overwriting`);
    }
    
    this.agents.set(agent.metadata.id, agent);
    console.log(`[AgentRegistry] Registered agent: ${agent.metadata.name} (${agent.metadata.id})`);
  }

  /**
   * Unregister a McCarthy agent
   */
  unregisterAgent(agentId: string): boolean {
    const removed = this.agents.delete(agentId);
    if (removed) {
      console.log(`[AgentRegistry] Unregistered agent: ${agentId}`);
    }
    return removed;
  }

  /**
   * Get a specific agent by ID
   */
  getAgent(agentId: string): McCarthyAgent | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): McCarthyAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all active agents
   */
  getActiveAgents(): McCarthyAgent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.metadata.status === 'active'
    );
  }

  /**
   * Find agents that can handle a specific intent
   */
  findCapableAgents(intent: Intent): McCarthyAgent[] {
    const capable = Array.from(this.agents.values()).filter(agent => {
      // Only consider active agents
      if (agent.metadata.status !== 'active') {
        return false;
      }

      // Check if agent can handle this intent
      return agent.canHandle(intent);
    });

    // Sort by priority (highest first)
    return capable.sort((a, b) => b.metadata.priority - a.metadata.priority);
  }

  /**
   * Find agents that can contribute to handling an intent
   * (for multi-agent collaboration)
   */
  findContributingAgents(intent: Intent): McCarthyAgent[] {
    const contributors = Array.from(this.agents.values()).filter(agent => {
      // Only consider active agents
      if (agent.metadata.status !== 'active') {
        return false;
      }

      // Check if agent can contribute
      return agent.canContribute(intent);
    });

    // Sort by priority (highest first)
    return contributors.sort((a, b) => b.metadata.priority - a.metadata.priority);
  }

  /**
   * Find agents by capability
   */
  findByCapability(capability: string): McCarthyAgent[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.metadata.capabilities.includes(capability)
    );
  }

  /**
   * Find agents by type
   */
  findByType(type: string): McCarthyAgent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.metadata.type === type
    );
  }

  /**
   * Check if any agent can handle an intent
   */
  hasCapableAgent(intent: Intent): boolean {
    return this.findCapableAgents(intent).length > 0;
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    active: number;
    inactive: number;
    comingSoon: number;
    byType: Record<string, number>;
  } {
    const agents = Array.from(this.agents.values());
    
    const byType: Record<string, number> = {};
    agents.forEach(agent => {
      byType[agent.metadata.type] = (byType[agent.metadata.type] || 0) + 1;
    });

    return {
      total: agents.length,
      active: agents.filter(a => a.metadata.status === 'active').length,
      inactive: agents.filter(a => a.metadata.status === 'inactive').length,
      comingSoon: agents.filter(a => a.metadata.status === 'coming-soon').length,
      byType
    };
  }

  /**
   * Clear all agents (useful for testing)
   */
  clear(): void {
    this.agents.clear();
    console.log('[AgentRegistry] All agents cleared');
  }
}

