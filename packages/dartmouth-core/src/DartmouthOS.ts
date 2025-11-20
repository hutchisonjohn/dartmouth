/**
 * Dartmouth OS V2.0 - Core Operating System
 * The heart and orchestrator of all AI agents
 */

import { Agent, Env } from './types';
import { AgentRegistry } from './services/AgentRegistry';
import { APIGateway } from './services/APIGateway';
import { HealthMonitor } from './services/HealthMonitor';
import { Logger } from './utils/logger';

export interface DartmouthOSConfig {
  /** Environment */
  environment: 'development' | 'staging' | 'production';

  /** Health check interval (ms) */
  healthCheckInterval?: number;

  /** Enable health monitoring */
  enableHealthMonitoring?: boolean;
}

export class DartmouthOS {
  private logger: Logger;
  private agentRegistry: AgentRegistry;
  private apiGateway: APIGateway;
  private healthMonitor: HealthMonitor;
  private initialized = false;
  private env: Env;

  constructor(
    env: Env,
    private config: DartmouthOSConfig = {
      environment: 'development',
      healthCheckInterval: 60000,
      enableHealthMonitoring: true,
    }
  ) {
    this.env = env;
    this.logger = new Logger('DartmouthOS', config.environment);

    // Initialize services
    this.agentRegistry = new AgentRegistry(config.environment);
    this.apiGateway = new APIGateway(this.agentRegistry, config.environment);
    this.healthMonitor = new HealthMonitor(
      this.agentRegistry,
      {
        interval: config.healthCheckInterval || 60000,
        alertThreshold: 3,
      },
      config.environment
    );
  }

  /**
   * Initialize Dartmouth OS
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Dartmouth OS already initialized');
      return;
    }

    this.logger.info('Initializing Dartmouth OS V2.0', {
      environment: this.config.environment,
      healthCheckInterval: this.config.healthCheckInterval,
    });

    // Start health monitoring (if enabled)
    if (this.config.enableHealthMonitoring) {
      this.healthMonitor.start();
    }

    this.initialized = true;
    this.logger.info('Dartmouth OS initialized successfully');
  }

  /**
   * Shutdown Dartmouth OS
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Dartmouth OS');

    // Stop health monitoring
    this.healthMonitor.stop();

    this.initialized = false;
    this.logger.info('Dartmouth OS shut down successfully');
  }

  /**
   * Register an agent
   */
  registerAgent(agent: Agent): void {
    this.logger.info(`Registering agent: ${agent.id}`);
    this.agentRegistry.register(agent);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.logger.info(`Unregistering agent: ${agentId}`);
    this.agentRegistry.unregister(agentId);
  }

  /**
   * Handle incoming HTTP request
   */
  async handleRequest(request: Request): Promise<Response> {
    // Ensure initialized
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.apiGateway.handleRequest(request);
  }

  /**
   * Get agent registry
   */
  getAgentRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  /**
   * Get health monitor
   */
  getHealthMonitor(): HealthMonitor {
    return this.healthMonitor;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      environment: this.config.environment,
      agents: this.agentRegistry.getStats(),
      health: this.healthMonitor.getHealthSummary(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get environment bindings
   */
  getEnv(): Env {
    return this.env;
  }
}

