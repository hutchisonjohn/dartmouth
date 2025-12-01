/**
 * Agent Orchestrator
 * 
 * Coordinates multiple McCarthy agents for complex tasks.
 * Manages agent handoffs, collaboration, and result aggregation.
 */

import type { Intent, Response } from '../types/shared';
import type { HandlerContext } from '../components/ResponseRouter';
import type { McCarthyAgent } from './AgentRegistry';
import { AgentHandoffProtocol, type HandoffRequest, type ConversationContext } from './AgentHandoffProtocol';

/**
 * Orchestration plan
 */
export interface OrchestrationPlan {
  steps: OrchestrationStep[];
  strategy: 'sequential' | 'parallel' | 'hybrid';
  estimatedTime: number;
}

/**
 * Single orchestration step
 */
export interface OrchestrationStep {
  stepNumber: number;
  agent: McCarthyAgent;
  action: string;
  dependencies: number[]; // Step numbers this depends on
  expectedOutput: string;
}

/**
 * Orchestration result
 */
export interface OrchestrationResult {
  success: boolean;
  steps: StepResult[];
  finalResponse: Response;
  totalTime: number;
}

/**
 * Result from a single step
 */
export interface StepResult {
  stepNumber: number;
  agentId: string;
  success: boolean;
  output: any;
  error?: string;
  timeMs: number;
}

/**
 * Agent Orchestrator
 * 
 * Coordinates multiple McCarthy agents to handle complex requests.
 */
export class AgentOrchestrator {
  private handoffProtocol: AgentHandoffProtocol;

  constructor() {
    this.handoffProtocol = new AgentHandoffProtocol();
  }

  /**
   * Get the handoff protocol instance
   */
  getHandoffProtocol(): AgentHandoffProtocol {
    return this.handoffProtocol;
  }

  /**
   * Orchestrate multiple agents to handle a request
   */
  async orchestrate(
    message: string,
    intent: Intent,
    context: HandlerContext,
    agents: McCarthyAgent[]
  ): Promise<Response> {
    console.log(`[AgentOrchestrator] Orchestrating ${agents.length} agents`);
    const startTime = Date.now();

    // STEP 1: Create orchestration plan
    const plan = this.createPlan(message, intent, agents);
    console.log(`[AgentOrchestrator] Plan: ${plan.strategy} with ${plan.steps.length} steps`);

    // STEP 2: Execute plan
    const result = await this.executePlan(plan, message, intent, context);

    // STEP 3: Aggregate results
    const finalResponse = this.aggregateResults(result, agents);

    // STEP 4: Add orchestration metadata
    finalResponse.metadata = {
      ...finalResponse.metadata,
      orchestration: {
        strategy: plan.strategy,
        agentsInvolved: agents.map(a => a.metadata.name),
        stepsCompleted: result.steps.length,
        totalTimeMs: Date.now() - startTime,
        success: result.success
      }
    };

    console.log(`[AgentOrchestrator] Orchestration complete in ${Date.now() - startTime}ms`);
    return finalResponse;
  }

  /**
   * Create an orchestration plan
   */
  private createPlan(
    _message: string,
    intent: Intent,
    agents: McCarthyAgent[]
  ): OrchestrationPlan {
    // For now, simple sequential plan
    // In future, we can add more sophisticated planning

    const steps: OrchestrationStep[] = agents.map((agent, index) => ({
      stepNumber: index + 1,
      agent,
      action: `Process ${intent.type} with ${agent.metadata.name}`,
      dependencies: index > 0 ? [index] : [], // Each step depends on previous
      expectedOutput: `${agent.metadata.name} contribution`
    }));

    return {
      steps,
      strategy: 'sequential',
      estimatedTime: steps.length * 2000 // 2 seconds per step estimate
    };
  }

  /**
   * Execute an orchestration plan
   */
  private async executePlan(
    plan: OrchestrationPlan,
    _message: string,
    _intent: Intent,
    _context: HandlerContext
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];

    // Execute based on strategy
    switch (plan.strategy) {
      case 'sequential':
        // Execute steps one by one
        for (const step of plan.steps) {
          const result = await this.executeStep(step);
          stepResults.push(result);

          // If step failed and is critical, stop
          if (!result.success) {
            console.warn(`[AgentOrchestrator] Step ${step.stepNumber} failed, continuing...`);
          }
        }
        break;

      case 'parallel':
        // Execute all steps in parallel
        const results = await Promise.all(
          plan.steps.map(step => this.executeStep(step))
        );
        stepResults.push(...results);
        break;

      case 'hybrid':
        // Execute based on dependencies
        // TODO: Implement dependency-aware execution
        console.warn('[AgentOrchestrator] Hybrid strategy not yet implemented, using sequential');
        for (const step of plan.steps) {
          const result = await this.executeStep(step);
          stepResults.push(result);
        }
        break;
    }

    const allSuccessful = stepResults.every(r => r.success);

    return {
      success: allSuccessful,
      steps: stepResults,
      finalResponse: {
        content: '', // Will be filled by aggregateResults
        metadata: {}
      },
      totalTime: Date.now() - startTime
    };
  }

  /**
   * Execute a single orchestration step
   */
  private async executeStep(step: OrchestrationStep): Promise<StepResult> {
    const startTime = Date.now();
    console.log(`[AgentOrchestrator] Executing step ${step.stepNumber}: ${step.action}`);

    try {
      // For now, simulate agent execution
      // In Phase 6, we'll actually call the McCarthy agent
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work

      return {
        stepNumber: step.stepNumber,
        agentId: step.agent.metadata.id,
        success: true,
        output: `${step.agent.metadata.name} completed successfully`,
        timeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        stepNumber: step.stepNumber,
        agentId: step.agent.metadata.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Aggregate results from multiple agents
   */
  private aggregateResults(
    result: OrchestrationResult,
    agents: McCarthyAgent[]
  ): Response {
    if (!result.success) {
      return {
        content: "I coordinated with multiple specialists, but encountered some issues. Let me try a different approach.",
        metadata: {
          orchestrationFailed: true,
          stepsCompleted: result.steps.filter(s => s.success).length,
          totalSteps: result.steps.length
        }
      };
    }

    // Build response from all agent contributions
    const agentNames = agents.map(a => a.metadata.name).join(', ');
    const contributions = result.steps
      .filter(s => s.success)
      .map(s => s.output)
      .join('\n\n');

    return {
      content: `I've coordinated with ${agentNames} to help you.\n\n${contributions}`,
      metadata: {
        orchestrationSuccess: true,
        agentsInvolved: agents.length,
        stepsCompleted: result.steps.length
      }
    };
  }

  /**
   * Handle agent handoff
   * (When one agent needs to pass control to another)
   */
  async handoff(
    fromAgent: McCarthyAgent,
    toAgent: McCarthyAgent,
    conversationContext: ConversationContext,
    reason: string,
    options?: {
      customerContext?: any;
      urgency?: 'low' | 'normal' | 'high' | 'critical';
      metadata?: Record<string, any>;
    }
  ): Promise<Response> {
    console.log(`[AgentOrchestrator] Handoff from ${fromAgent.metadata.name} to ${toAgent.metadata.name}`);

    // Create handoff request
    const handoffRequest: HandoffRequest = {
      fromAgentId: fromAgent.metadata.id,
      fromAgentName: fromAgent.metadata.name,
      toAgentId: toAgent.metadata.id,
      toAgentName: toAgent.metadata.name,
      reason,
      conversationContext,
      customerContext: options?.customerContext,
      urgency: options?.urgency || 'normal',
      metadata: options?.metadata
    };

    // Initiate handoff
    const result = await this.handoffProtocol.initiateHandoff(handoffRequest);

    if (result.success) {
      return {
        content: result.message,
        metadata: {
          handoff: true,
          handoffId: result.handoffId,
          fromAgent: fromAgent.metadata.id,
          toAgent: toAgent.metadata.id,
          toAgentName: toAgent.metadata.name,
          context: result.context,
          timestamp: result.timestamp
        }
      };
    } else {
      return {
        content: result.message,
        metadata: {
          handoff: false,
          handoffFailed: true,
          error: result.error,
          fromAgent: fromAgent.metadata.id,
          toAgent: toAgent.metadata.id
        }
      };
    }
  }
}

