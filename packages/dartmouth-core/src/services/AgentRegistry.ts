/**
 * Dartmouth OS V2.0 - Agent Registry
 * Register, discover, and manage agents
 */

import { Agent, AgentRegistration, HealthCheckResult } from '../types';
import { Logger } from '../utils/logger';
import { AgentNotFoundError } from '../utils/errors';

export class AgentRegistry {
  private agents: Map<string, AgentRegistration> = new Map();
  private logger: Logger;

  constructor(environment: string = 'development') {
    this.logger = new Logger('AgentRegistry', environment);
  }

  /**
   * Register an agent
   */
  register(agent: Agent): void {
    this.logger.info(`Registering agent: ${agent.id}`, { name: agent.name, version: agent.version });

    this.agents.set(agent.id, {
      agent,
      registeredAt: Date.now(),
    });

    this.logger.info(`Agent registered successfully: ${agent.id}`);
  }

  /**
   * Unregister an agent
   */
  unregister(agentId: string): void {
    this.logger.info(`Unregistering agent: ${agentId}`);

    if (!this.agents.has(agentId)) {
      throw new AgentNotFoundError(agentId);
    }

    this.agents.delete(agentId);
    this.logger.info(`Agent unregistered successfully: ${agentId}`);
  }

  /**
   * Get an agent by ID
   */
  get(agentId: string): Agent {
    const registration = this.agents.get(agentId);

    if (!registration) {
      throw new AgentNotFoundError(agentId);
    }

    return registration.agent;
  }

  /**
   * Check if an agent is registered
   */
  has(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  /**
   * Get all registered agents
   */
  getAll(): Agent[] {
    return Array.from(this.agents.values()).map((reg) => reg.agent);
  }

  /**
   * Get agent registration (includes health check data)
   */
  getRegistration(agentId: string): AgentRegistration {
    const registration = this.agents.get(agentId);

    if (!registration) {
      throw new AgentNotFoundError(agentId);
    }

    return registration;
  }

  /**
   * Update agent health check result
   */
  updateHealthCheck(agentId: string, healthCheck: HealthCheckResult): void {
    const registration = this.agents.get(agentId);

    if (!registration) {
      throw new AgentNotFoundError(agentId);
    }

    registration.lastHealthCheck = healthCheck;
    this.agents.set(agentId, registration);

    this.logger.debug(`Health check updated for agent: ${agentId}`, {
      status: healthCheck.status,
      responseTime: healthCheck.responseTime,
    });
  }

  /**
   * Get agent count
   */
  count(): number {
    return this.agents.size;
  }

  /**
   * Get healthy agents
   */
  getHealthyAgents(): Agent[] {
    return Array.from(this.agents.values())
      .filter((reg) => reg.lastHealthCheck?.status === 'healthy')
      .map((reg) => reg.agent);
  }

  /**
   * Get unhealthy agents
   */
  getUnhealthyAgents(): Agent[] {
    return Array.from(this.agents.values())
      .filter((reg) => reg.lastHealthCheck?.status === 'unhealthy')
      .map((reg) => reg.agent);
  }

  /**
   * Get agent statistics
   */
  getStats() {
    const total = this.agents.size;
    const healthy = this.getHealthyAgents().length;
    const unhealthy = this.getUnhealthyAgents().length;
    const unknown = total - healthy - unhealthy;

    return {
      total,
      healthy,
      unhealthy,
      unknown,
      agents: Array.from(this.agents.values()).map((reg) => ({
        id: reg.agent.id,
        name: reg.agent.name,
        status: reg.agent.status,
        healthStatus: reg.lastHealthCheck?.status || 'unknown',
        registeredAt: reg.registeredAt,
        lastCheck: reg.lastHealthCheck?.lastCheck,
      })),
    };
  }
}

