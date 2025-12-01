/**
 * Analytics Service
 * 
 * Tracks and analyzes Customer Service system metrics:
 * - Conversation metrics (total, resolved, escalated)
 * - AI vs Human resolution rates
 * - Response times
 * - Customer satisfaction (CSAT)
 * - Agent performance
 * - Channel performance
 * 
 * Created: Nov 28, 2025
 * Part of: Dartmouth OS Extensions for Customer Service System
 */

/**
 * Metric types
 */
export type MetricType =
  | 'conversation_started'
  | 'conversation_resolved'
  | 'conversation_escalated'
  | 'message_sent'
  | 'response_time'
  | 'csat_rating'
  | 'agent_action'
  | 'channel_activity';

/**
 * Resolution type
 */
export type ResolutionType = 'ai' | 'human' | 'hybrid';

/**
 * Channel type
 */
export type ChannelType = 'email' | 'chat' | 'whatsapp' | 'instagram' | 'facebook' | 'phone';

/**
 * Metric event
 */
export interface MetricEvent {
  type: MetricType;
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Conversation metrics
 */
export interface ConversationMetrics {
  total: number;
  resolved: number;
  escalated: number;
  active: number;
  averageResponseTime: number;  // milliseconds
  averageResolutionTime: number; // milliseconds
  aiResolutionRate: number;      // percentage (0-100)
  humanResolutionRate: number;   // percentage (0-100)
  escalationRate: number;        // percentage (0-100)
}

/**
 * CSAT metrics
 */
export interface CSATMetrics {
  totalRatings: number;
  averageRating: number;         // 1-5 scale
  distribution: {
    1: number;  // Very dissatisfied
    2: number;  // Dissatisfied
    3: number;  // Neutral
    4: number;  // Satisfied
    5: number;  // Very satisfied
  };
  nps: number;                   // Net Promoter Score (-100 to 100)
}

/**
 * Agent performance metrics
 */
export interface AgentPerformanceMetrics {
  agentId: string;
  agentName: string;
  conversationsHandled: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  csatRating: number;
  escalationsReceived: number;
  activeConversations: number;
}

/**
 * Channel metrics
 */
export interface ChannelMetrics {
  channel: ChannelType;
  conversationsTotal: number;
  conversationsResolved: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  csatRating: number;
}

/**
 * Time-series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Dashboard metrics (overview)
 */
export interface DashboardMetrics {
  conversations: ConversationMetrics;
  csat: CSATMetrics;
  agents: AgentPerformanceMetrics[];
  channels: ChannelMetrics[];
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Analytics Service
 * 
 * Collects, stores, and analyzes metrics for the Customer Service system.
 */
export class AnalyticsService {
  private events: MetricEvent[] = [];
  private conversationData: Map<string, any> = new Map(); // conversationId -> data
  private agentData: Map<string, any> = new Map(); // agentId -> data
  private channelData: Map<string, any> = new Map(); // channel -> data
  private csatRatings: Array<{ rating: number; timestamp: string; metadata?: any }> = [];

  constructor() {
    console.log('[AnalyticsService] Initialized');
  }

  /**
   * Track a metric event
   */
  async trackEvent(event: MetricEvent): Promise<void> {
    this.events.push(event);

    // Process event based on type
    switch (event.type) {
      case 'conversation_started':
        await this.handleConversationStarted(event);
        break;

      case 'conversation_resolved':
        await this.handleConversationResolved(event);
        break;

      case 'conversation_escalated':
        await this.handleConversationEscalated(event);
        break;

      case 'csat_rating':
        await this.handleCSATRating(event);
        break;

      case 'agent_action':
        await this.handleAgentAction(event);
        break;

      case 'channel_activity':
        await this.handleChannelActivity(event);
        break;
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(
    startDate: string,
    endDate: string
  ): Promise<DashboardMetrics> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter events in time range
    const eventsInRange = this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= start && eventDate <= end;
    });

    // Calculate conversation metrics
    const conversations = this.calculateConversationMetrics(eventsInRange);

    // Calculate CSAT metrics
    const csat = this.calculateCSATMetrics(eventsInRange);

    // Calculate agent metrics
    const agents = this.calculateAgentMetrics(eventsInRange);

    // Calculate channel metrics
    const channels = this.calculateChannelMetrics(eventsInRange);

    return {
      conversations,
      csat,
      agents,
      channels,
      timeRange: {
        start: startDate,
        end: endDate
      }
    };
  }

  /**
   * Get conversation metrics
   */
  async getConversationMetrics(
    startDate: string,
    endDate: string
  ): Promise<ConversationMetrics> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const eventsInRange = this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= start && eventDate <= end;
    });

    return this.calculateConversationMetrics(eventsInRange);
  }

  /**
   * Get CSAT metrics
   */
  async getCSATMetrics(
    startDate: string,
    endDate: string
  ): Promise<CSATMetrics> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const eventsInRange = this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= start && eventDate <= end;
    });

    return this.calculateCSATMetrics(eventsInRange);
  }

  /**
   * Get agent performance metrics
   */
  async getAgentMetrics(
    agentId: string,
    startDate: string,
    endDate: string
  ): Promise<AgentPerformanceMetrics | null> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const eventsInRange = this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= start && eventDate <= end && e.metadata?.agentId === agentId;
    });

    if (eventsInRange.length === 0) return null;

    const metrics = this.calculateAgentMetrics(eventsInRange);
    return metrics.find(m => m.agentId === agentId) || null;
  }

  /**
   * Get time-series data
   */
  async getTimeSeriesData(
    metricType: MetricType,
    startDate: string,
    endDate: string,
    interval: 'hour' | 'day' | 'week' = 'day'
  ): Promise<TimeSeriesDataPoint[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter events
    const eventsInRange = this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= start && eventDate <= end && e.type === metricType;
    });

    // Group by interval
    const grouped = this.groupByInterval(eventsInRange, interval);

    return grouped;
  }

  /**
   * Calculate conversation metrics
   */
  private calculateConversationMetrics(events: MetricEvent[]): ConversationMetrics {
    const started = events.filter(e => e.type === 'conversation_started').length;
    const resolved = events.filter(e => e.type === 'conversation_resolved').length;
    const escalated = events.filter(e => e.type === 'conversation_escalated').length;
    const active = started - resolved - escalated;

    // Calculate resolution types
    const aiResolved = events.filter(e => 
      e.type === 'conversation_resolved' && e.metadata?.resolutionType === 'ai'
    ).length;
    const humanResolved = events.filter(e => 
      e.type === 'conversation_resolved' && e.metadata?.resolutionType === 'human'
    ).length;

    // Calculate average times
    const responseTimes = events
      .filter(e => e.type === 'response_time')
      .map(e => e.value);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

    const resolutionTimes = events
      .filter(e => e.type === 'conversation_resolved' && e.metadata?.resolutionTime)
      .map(e => e.metadata!.resolutionTime);
    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum: number, t: number) => sum + t, 0) / resolutionTimes.length
      : 0;

    return {
      total: started,
      resolved,
      escalated,
      active: Math.max(0, active),
      averageResponseTime,
      averageResolutionTime,
      aiResolutionRate: resolved > 0 ? (aiResolved / resolved) * 100 : 0,
      humanResolutionRate: resolved > 0 ? (humanResolved / resolved) * 100 : 0,
      escalationRate: started > 0 ? (escalated / started) * 100 : 0
    };
  }

  /**
   * Calculate CSAT metrics
   */
  private calculateCSATMetrics(events: MetricEvent[]): CSATMetrics {
    const ratings = events
      .filter(e => e.type === 'csat_rating')
      .map(e => e.value);

    if (ratings.length === 0) {
      return {
        totalRatings: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        nps: 0
      };
    }

    // Calculate distribution
    const distribution = {
      1: ratings.filter(r => r === 1).length,
      2: ratings.filter(r => r === 2).length,
      3: ratings.filter(r => r === 3).length,
      4: ratings.filter(r => r === 4).length,
      5: ratings.filter(r => r === 5).length
    };

    // Calculate average
    const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    // Calculate NPS (simplified: 4-5 = promoters, 1-3 = detractors)
    const promoters = distribution[4] + distribution[5];
    const detractors = distribution[1] + distribution[2] + distribution[3];
    const nps = ((promoters - detractors) / ratings.length) * 100;

    return {
      totalRatings: ratings.length,
      averageRating,
      distribution,
      nps
    };
  }

  /**
   * Calculate agent metrics
   */
  private calculateAgentMetrics(events: MetricEvent[]): AgentPerformanceMetrics[] {
    const agentIds = new Set(
      events
        .filter(e => e.metadata?.agentId)
        .map(e => e.metadata!.agentId)
    );

    const metrics: AgentPerformanceMetrics[] = [];

    for (const agentId of agentIds) {
      const agentEvents = events.filter(e => e.metadata?.agentId === agentId);

      const conversationsHandled = agentEvents.filter(e => 
        e.type === 'conversation_resolved'
      ).length;

      const responseTimes = agentEvents
        .filter(e => e.type === 'response_time')
        .map(e => e.value);
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;

      const resolutionTimes = agentEvents
        .filter(e => e.type === 'conversation_resolved' && e.metadata?.resolutionTime)
        .map(e => e.metadata!.resolutionTime);
      const averageResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum: number, t: number) => sum + t, 0) / resolutionTimes.length
        : 0;

      const csatRatings = agentEvents
        .filter(e => e.type === 'csat_rating')
        .map(e => e.value);
      const csatRating = csatRatings.length > 0
        ? csatRatings.reduce((sum, r) => sum + r, 0) / csatRatings.length
        : 0;

      const escalationsReceived = agentEvents.filter(e => 
        e.type === 'conversation_escalated'
      ).length;

      metrics.push({
        agentId,
        agentName: agentEvents[0]?.metadata?.agentName || agentId,
        conversationsHandled,
        averageResponseTime,
        averageResolutionTime,
        csatRating,
        escalationsReceived,
        activeConversations: 0 // TODO: Calculate from active conversations
      });
    }

    return metrics;
  }

  /**
   * Calculate channel metrics
   */
  private calculateChannelMetrics(events: MetricEvent[]): ChannelMetrics[] {
    const channels: ChannelType[] = ['email', 'chat', 'whatsapp', 'instagram', 'facebook', 'phone'];
    const metrics: ChannelMetrics[] = [];

    for (const channel of channels) {
      const channelEvents = events.filter(e => e.metadata?.channel === channel);

      if (channelEvents.length === 0) continue;

      const conversationsTotal = channelEvents.filter(e => 
        e.type === 'conversation_started'
      ).length;

      const conversationsResolved = channelEvents.filter(e => 
        e.type === 'conversation_resolved'
      ).length;

      const responseTimes = channelEvents
        .filter(e => e.type === 'response_time')
        .map(e => e.value);
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;

      const resolutionTimes = channelEvents
        .filter(e => e.type === 'conversation_resolved' && e.metadata?.resolutionTime)
        .map(e => e.metadata!.resolutionTime);
      const averageResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum: number, t: number) => sum + t, 0) / resolutionTimes.length
        : 0;

      const csatRatings = channelEvents
        .filter(e => e.type === 'csat_rating')
        .map(e => e.value);
      const csatRating = csatRatings.length > 0
        ? csatRatings.reduce((sum, r) => sum + r, 0) / csatRatings.length
        : 0;

      metrics.push({
        channel,
        conversationsTotal,
        conversationsResolved,
        averageResponseTime,
        averageResolutionTime,
        csatRating
      });
    }

    return metrics;
  }

  /**
   * Group events by time interval
   */
  private groupByInterval(
    events: MetricEvent[],
    interval: 'hour' | 'day' | 'week'
  ): TimeSeriesDataPoint[] {
    const grouped = new Map<string, number>();

    for (const event of events) {
      const date = new Date(event.timestamp);
      let key: string;

      switch (interval) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
          break;
      }

      grouped.set(key, (grouped.get(key) || 0) + event.value);
    }

    return Array.from(grouped.entries())
      .map(([timestamp, value]) => ({ timestamp, value }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Handle conversation started
   */
  private async handleConversationStarted(event: MetricEvent): Promise<void> {
    const conversationId = event.metadata?.conversationId;
    if (!conversationId) return;

    this.conversationData.set(conversationId, {
      startedAt: event.timestamp,
      channel: event.metadata?.channel,
      customerId: event.metadata?.customerId
    });
  }

  /**
   * Handle conversation resolved
   */
  private async handleConversationResolved(event: MetricEvent): Promise<void> {
    const conversationId = event.metadata?.conversationId;
    if (!conversationId) return;

    const data = this.conversationData.get(conversationId);
    if (data) {
      data.resolvedAt = event.timestamp;
      data.resolutionType = event.metadata?.resolutionType;
      data.resolutionTime = new Date(event.timestamp).getTime() - new Date(data.startedAt).getTime();
    }
  }

  /**
   * Handle conversation escalated
   */
  private async handleConversationEscalated(event: MetricEvent): Promise<void> {
    const conversationId = event.metadata?.conversationId;
    if (!conversationId) return;

    const data = this.conversationData.get(conversationId);
    if (data) {
      data.escalatedAt = event.timestamp;
      data.escalatedTo = event.metadata?.agentId;
    }
  }

  /**
   * Handle CSAT rating
   */
  private async handleCSATRating(event: MetricEvent): Promise<void> {
    this.csatRatings.push({
      rating: event.value,
      timestamp: event.timestamp,
      metadata: event.metadata
    });
  }

  /**
   * Handle agent action
   */
  private async handleAgentAction(event: MetricEvent): Promise<void> {
    const agentId = event.metadata?.agentId;
    if (!agentId) return;

    if (!this.agentData.has(agentId)) {
      this.agentData.set(agentId, {
        agentId,
        agentName: event.metadata?.agentName,
        actions: []
      });
    }

    const data = this.agentData.get(agentId);
    data.actions.push({
      type: event.metadata?.actionType,
      timestamp: event.timestamp
    });
  }

  /**
   * Handle channel activity
   */
  private async handleChannelActivity(event: MetricEvent): Promise<void> {
    const channel = event.metadata?.channel;
    if (!channel) return;

    if (!this.channelData.has(channel)) {
      this.channelData.set(channel, {
        channel,
        activities: []
      });
    }

    const data = this.channelData.get(channel);
    data.activities.push({
      type: event.metadata?.activityType,
      timestamp: event.timestamp
    });
  }

  /**
   * Clear old events (cleanup)
   */
  async clearOldEvents(olderThan: string): Promise<number> {
    const cutoffDate = new Date(olderThan);
    const initialCount = this.events.length;

    this.events = this.events.filter(e => new Date(e.timestamp) >= cutoffDate);

    const removed = initialCount - this.events.length;
    console.log(`[AnalyticsService] Cleared ${removed} old events`);

    return removed;
  }

  /**
   * Get total event count
   */
  getEventCount(): number {
    return this.events.length;
  }
}

