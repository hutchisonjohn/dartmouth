/**
 * Dartmouth OS V2.0 - Health Monitor
 * Monitor agent health and performance
 */

import { AgentRegistry } from './AgentRegistry';
import { HealthCheckResult } from '../types';
import { Logger } from '../utils/logger';

export interface HealthMonitorConfig {
  /** Health check interval (ms) */
  interval: number;

  /** Alert threshold for unhealthy agents */
  alertThreshold: number;
}

export class HealthMonitor {
  private logger: Logger;
  private intervalId?: number;

  constructor(
    private agentRegistry: AgentRegistry,
    private config: HealthMonitorConfig = {
      interval: 60000, // 1 minute
      alertThreshold: 3, // Alert after 3 consecutive failures
    },
    environment: string = 'development'
  ) {
    this.logger = new Logger('HealthMonitor', environment);
  }

  /**
   * Start monitoring
   */
  start(): void {
    this.logger.info('Starting health monitor', {
      interval: this.config.interval,
      alertThreshold: this.config.alertThreshold,
    });

    // Run initial health check
    this.runHealthChecks();

    // Schedule periodic health checks
    // Note: In Cloudflare Workers, use Durable Objects or Cron Triggers for scheduled tasks
    // This is a simplified version for demonstration
    this.intervalId = setInterval(() => {
      this.runHealthChecks();
    }, this.config.interval) as unknown as number;
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.logger.info('Stopping health monitor');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Run health checks for all agents
   */
  private async runHealthChecks(): Promise<void> {
    const agents = this.agentRegistry.getAll();

    this.logger.debug(`Running health checks for ${agents.length} agents`);

    const results = await Promise.allSettled(
      agents.map(async (agent) => {
        try {
          const startTime = Date.now();
          const healthCheck = await agent.healthCheck();
          const responseTime = Date.now() - startTime;

          // Update response time
          healthCheck.responseTime = responseTime;

          // Update registry
          this.agentRegistry.updateHealthCheck(agent.id, healthCheck);

          return healthCheck;
        } catch (error) {
          this.logger.error(`Health check failed for agent: ${agent.id}`, error);

          // Create unhealthy health check
          const unhealthyCheck: HealthCheckResult = {
            agentId: agent.id,
            status: 'unhealthy',
            responseTime: 0,
            errorCount: 1,
            successCount: 0,
            lastCheck: Date.now(),
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          };

          this.agentRegistry.updateHealthCheck(agent.id, unhealthyCheck);

          return unhealthyCheck;
        }
      })
    );

    // Log results
    const healthy = results.filter(
      (r) => r.status === 'fulfilled' && r.value.status === 'healthy'
    ).length;
    const unhealthy = results.filter(
      (r) => r.status === 'fulfilled' && r.value.status === 'unhealthy'
    ).length;

    this.logger.info(`Health checks completed: ${healthy} healthy, ${unhealthy} unhealthy`);

    // Alert if too many unhealthy agents
    if (unhealthy >= this.config.alertThreshold) {
      this.logger.warn(`Alert: ${unhealthy} agents are unhealthy!`);
      // In production, send alert to monitoring service (PagerDuty, Slack, etc.)
    }
  }

  /**
   * Get health summary
   */
  getHealthSummary() {
    const stats = this.agentRegistry.getStats();

    return {
      total: stats.total,
      healthy: stats.healthy,
      unhealthy: stats.unhealthy,
      unknown: stats.unknown,
      healthPercentage: stats.total > 0 ? (stats.healthy / stats.total) * 100 : 0,
      agents: stats.agents,
    };
  }

  /**
   * Force health check for specific agent
   */
  async checkAgent(agentId: string): Promise<HealthCheckResult> {
    const agent = this.agentRegistry.get(agentId);

    this.logger.info(`Running health check for agent: ${agentId}`);

    const startTime = Date.now();
    const healthCheck = await agent.healthCheck();
    const responseTime = Date.now() - startTime;

    healthCheck.responseTime = responseTime;

    // Update registry
    this.agentRegistry.updateHealthCheck(agentId, healthCheck);

    return healthCheck;
  }
}

