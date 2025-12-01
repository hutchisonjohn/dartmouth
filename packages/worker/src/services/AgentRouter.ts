/**
 * Agent Router
 * 
 * Routes user requests to appropriate McCarthy agents.
 * Handles intent-to-agent mapping and orchestration.
 */

import type { Intent, Response } from '../types/shared';
import type { HandlerContext } from '../components/ResponseRouter';
import { AgentRegistry, type McCarthyAgent } from './AgentRegistry';
import { AgentOrchestrator } from './AgentOrchestrator';

/**
 * Routing decision
 */
export interface RoutingDecision {
  strategy: 'foundation' | 'single-agent' | 'multi-agent' | 'coming-soon';
  agents: McCarthyAgent[];
  reason: string;
  confidence: number;
}

/**
 * Agent Router
 * 
 * Determines which McCarthy agent(s) should handle a request.
 */
export class AgentRouter {
  private registry: AgentRegistry;
  private orchestrator: AgentOrchestrator;

  constructor(registry: AgentRegistry, orchestrator: AgentOrchestrator) {
    this.registry = registry;
    this.orchestrator = orchestrator;
  }

  /**
   * Decide how to route a request
   */
  async decide(intent: Intent, context: HandlerContext): Promise<RoutingDecision> {
    console.log(`[AgentRouter] Deciding route for intent: ${intent.type}`);

    // STEP 1: Check if any McCarthy agents can handle this
    const capableAgents = this.registry.findCapableAgents(intent);

    // STEP 2: No capable agents - use foundation handlers
    if (capableAgents.length === 0) {
      console.log(`[AgentRouter] No McCarthy agents available, using foundation handlers`);
      return {
        strategy: 'foundation',
        agents: [],
        reason: 'No specialized agents available for this intent',
        confidence: 1.0
      };
    }

    // STEP 3: Single agent can handle it
    if (capableAgents.length === 1) {
      console.log(`[AgentRouter] Single agent found: ${capableAgents[0].metadata.name}`);
      return {
        strategy: 'single-agent',
        agents: [capableAgents[0]],
        reason: `${capableAgents[0].metadata.name} is the specialist for this request`,
        confidence: 0.9
      };
    }

    // STEP 4: Multiple agents can handle it
    // Check if we need collaboration or just pick the best one
    const needsCollaboration = this.needsMultiAgentCollaboration(intent, capableAgents);

    if (needsCollaboration) {
      console.log(`[AgentRouter] Multi-agent collaboration needed`);
      return {
        strategy: 'multi-agent',
        agents: capableAgents,
        reason: 'This request requires multiple specialized agents working together',
        confidence: 0.85
      };
    } else {
      // Pick the highest priority agent
      console.log(`[AgentRouter] Multiple agents available, selecting highest priority: ${capableAgents[0].metadata.name}`);
      return {
        strategy: 'single-agent',
        agents: [capableAgents[0]],
        reason: `${capableAgents[0].metadata.name} is the best match for this request`,
        confidence: 0.9
      };
    }
  }

  /**
   * Route a request to the appropriate agent(s)
   */
  async route(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const decision = await this.decide(intent, context);

    console.log(`[AgentRouter] Routing strategy: ${decision.strategy}`);

    switch (decision.strategy) {
      case 'foundation':
        // Let foundation handlers deal with it
        return this.routeToFoundation(message, intent, context);

      case 'single-agent':
        // Route to single McCarthy agent
        return this.routeToSingleAgent(message, intent, context, decision.agents[0]);

      case 'multi-agent':
        // Orchestrate multiple McCarthy agents
        return this.routeToMultipleAgents(message, intent, context, decision.agents);

      case 'coming-soon':
        // Agent exists but not ready yet
        return this.handleComingSoon(decision.agents[0]);

      default:
        // Fallback to foundation
        return this.routeToFoundation(message, intent, context);
    }
  }

  /**
   * Route to foundation handlers (no McCarthy agent needed)
   */
  private async routeToFoundation(
    _message: string,
    _intent: Intent,
    _context: HandlerContext
  ): Promise<Response> {
    // Foundation handlers will be called by BaseAgent
    // This is just a pass-through signal
    return {
      content: '', // Will be replaced by foundation handler
      metadata: {
        routingStrategy: 'foundation',
        handlerName: 'FoundationRouter',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Route to a single McCarthy agent
   */
  private async routeToSingleAgent(
    _message: string,
    _intent: Intent,
    _context: HandlerContext,
    agent: McCarthyAgent
  ): Promise<Response> {
    console.log(`[AgentRouter] Routing to ${agent.metadata.name}`);

    // For now, return a placeholder
    // In Phase 6, we'll actually call the McCarthy agent
    return {
      content: `I'll connect you with ${agent.metadata.name} to help with that.`,
      metadata: {
        routingStrategy: 'single-agent',
        agentId: agent.metadata.id,
        agentName: agent.metadata.name,
        handlerName: 'AgentRouter',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Route to multiple McCarthy agents (orchestration)
   */
  private async routeToMultipleAgents(
    message: string,
    intent: Intent,
    context: HandlerContext,
    agents: McCarthyAgent[]
  ): Promise<Response> {
    console.log(`[AgentRouter] Orchestrating ${agents.length} agents`);

    // Use orchestrator to coordinate agents
    return await this.orchestrator.orchestrate(message, intent, context, agents);
  }

  /**
   * Handle "coming soon" agents
   */
  private handleComingSoon(agent: McCarthyAgent): Response {
    return {
      content: `I'd love to help with that! ${agent.metadata.name} is coming soon and will be able to assist you with ${agent.metadata.description.toLowerCase()}. In the meantime, is there anything else I can help you with?`,
      metadata: {
        routingStrategy: 'coming-soon',
        agentId: agent.metadata.id,
        agentName: agent.metadata.name,
        handlerName: 'AgentRouter',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Determine if multi-agent collaboration is needed
   */
  private needsMultiAgentCollaboration(
    intent: Intent,
    _agents: McCarthyAgent[]
  ): boolean {
    // For now, simple heuristic:
    // Multi-agent if intent explicitly requests multiple capabilities
    const multiAgentIntents = [
      'complex-analysis',
      'multi-step',
      'research-and-create',
      'analyze-and-publish'
    ];

    return multiAgentIntents.includes(intent.type);
  }
}

