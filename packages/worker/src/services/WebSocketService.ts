/**
 * WebSocket Service
 * 
 * Real-time communication for staff dashboard:
 * - Live message delivery
 * - Presence detection (who's online)
 * - Typing indicators
 * - Notification delivery
 * - Real-time ticket updates
 * 
 * Created: Nov 28, 2025
 * Part of: Dartmouth OS Extensions for Customer Service System
 */

/**
 * WebSocket message types
 */
export type WebSocketMessageType =
  | 'message'           // New chat message
  | 'typing'            // Someone is typing
  | 'presence'          // User online/offline status
  | 'notification'      // System notification
  | 'ticket_update'     // Ticket status changed
  | 'mention'           // User was mentioned
  | 'channel_update'    // Channel was updated
  | 'ping'              // Keep-alive ping
  | 'pong';             // Keep-alive response

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: string;
  senderId?: string;
  targetId?: string;    // User ID or channel ID
  metadata?: Record<string, any>;
}

/**
 * Connection info
 */
export interface ConnectionInfo {
  userId: string;
  connectionId: string;
  connectedAt: string;
  lastActivity: string;
  metadata?: Record<string, any>;
}

/**
 * Presence status
 */
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

/**
 * User presence
 */
export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: string;
  currentChannel?: string;
  metadata?: Record<string, any>;
}

/**
 * Typing indicator
 */
export interface TypingIndicator {
  userId: string;
  userName: string;
  channelId: string;
  isTyping: boolean;
  timestamp: string;
}

/**
 * WebSocket Service
 * 
 * Manages real-time connections and message broadcasting.
 * Uses Cloudflare Durable Objects for connection management.
 */
export class WebSocketService {
  private connections: Map<string, Set<WebSocket>> = new Map(); // userId -> WebSockets
  private connectionInfo: Map<string, ConnectionInfo> = new Map(); // connectionId -> info
  private userPresence: Map<string, UserPresence> = new Map(); // userId -> presence
  private typingIndicators: Map<string, Map<string, TypingIndicator>> = new Map(); // channelId -> userId -> indicator
  private pingInterval: number = 30000; // 30 seconds

  constructor() {
    console.log('[WebSocketService] Initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(
    ws: WebSocket,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const connectionId = this.generateConnectionId();

    console.log(`[WebSocketService] New connection: ${userId} (${connectionId})`);

    // Store connection
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(ws);

    // Store connection info
    const connectionInfo: ConnectionInfo = {
      userId,
      connectionId,
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      metadata
    };
    this.connectionInfo.set(connectionId, connectionInfo);

    // Update presence
    this.updatePresence(userId, 'online');

    // Set up event handlers
    this.setupWebSocketHandlers(ws, userId, connectionId);

    // Start ping/pong
    this.startPingPong(ws, connectionId);

    // Broadcast presence update
    await this.broadcastPresenceUpdate(userId, 'online');

    return connectionId;
  }

  /**
   * Handle WebSocket disconnection
   */
  async handleDisconnection(userId: string, connectionId: string): Promise<void> {
    console.log(`[WebSocketService] Disconnection: ${userId} (${connectionId})`);

    // Remove connection info
    this.connectionInfo.delete(connectionId);

    // Check if user has other connections
    const userConnections = this.connections.get(userId);
    if (userConnections && userConnections.size === 0) {
      // No more connections - user is offline
      this.updatePresence(userId, 'offline');
      await this.broadcastPresenceUpdate(userId, 'offline');
    }
  }

  /**
   * Send message to specific user
   */
  async sendToUser(userId: string, message: WebSocketMessage): Promise<boolean> {
    const connections = this.connections.get(userId);

    if (!connections || connections.size === 0) {
      console.log(`[WebSocketService] User ${userId} not connected`);
      return false;
    }

    const messageStr = JSON.stringify(message);
    let sent = false;

    for (const ws of connections) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
          sent = true;
        }
      } catch (error) {
        console.error(`[WebSocketService] Error sending to user ${userId}:`, error);
      }
    }

    return sent;
  }

  /**
   * Send message to multiple users
   */
  async sendToUsers(userIds: string[], message: WebSocketMessage): Promise<number> {
    let sentCount = 0;

    for (const userId of userIds) {
      const sent = await this.sendToUser(userId, message);
      if (sent) sentCount++;
    }

    return sentCount;
  }

  /**
   * Broadcast message to all connected users
   */
  async broadcast(message: WebSocketMessage, excludeUserId?: string): Promise<number> {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const [userId, connections] of this.connections.entries()) {
      if (excludeUserId && userId === excludeUserId) {
        continue;
      }

      for (const ws of connections) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
            sentCount++;
          }
        } catch (error) {
          console.error(`[WebSocketService] Error broadcasting to ${userId}:`, error);
        }
      }
    }

    return sentCount;
  }

  /**
   * Broadcast message to channel members
   */
  async broadcastToChannel(channelId: string, message: WebSocketMessage, memberIds: string[]): Promise<number> {
    return await this.sendToUsers(memberIds, {
      ...message,
      targetId: channelId
    });
  }

  /**
   * Update user presence
   */
  updatePresence(userId: string, status: PresenceStatus, metadata?: Record<string, any>): void {
    const presence: UserPresence = {
      userId,
      status,
      lastSeen: new Date().toISOString(),
      metadata
    };

    this.userPresence.set(userId, presence);
  }

  /**
   * Get user presence
   */
  getPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): UserPresence[] {
    return Array.from(this.userPresence.values())
      .filter(p => p.status === 'online');
  }

  /**
   * Set typing indicator
   */
  async setTyping(
    userId: string,
    userName: string,
    channelId: string,
    isTyping: boolean
  ): Promise<void> {
    if (!this.typingIndicators.has(channelId)) {
      this.typingIndicators.set(channelId, new Map());
    }

    const channelTyping = this.typingIndicators.get(channelId)!;

    if (isTyping) {
      channelTyping.set(userId, {
        userId,
        userName,
        channelId,
        isTyping: true,
        timestamp: new Date().toISOString()
      });
    } else {
      channelTyping.delete(userId);
    }

    // Broadcast typing indicator to channel
    // (In production, get channel member IDs from database)
    await this.broadcast({
      type: 'typing',
      payload: {
        userId,
        userName,
        channelId,
        isTyping
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get typing users in channel
   */
  getTypingUsers(channelId: string): TypingIndicator[] {
    const channelTyping = this.typingIndicators.get(channelId);
    if (!channelTyping) return [];

    return Array.from(channelTyping.values());
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connectionInfo.size;
  }

  /**
   * Get online user count
   */
  getOnlineUserCount(): number {
    return this.getOnlineUsers().length;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    const presence = this.userPresence.get(userId);
    return presence?.status === 'online';
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupWebSocketHandlers(ws: WebSocket, userId: string, connectionId: string): void {
    ws.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string) as WebSocketMessage;
        await this.handleMessage(userId, connectionId, message);
      } catch (error) {
        console.error('[WebSocketService] Error handling message:', error);
      }
    });

    ws.addEventListener('close', async () => {
      await this.handleDisconnection(userId, connectionId);
      
      // Remove from connections
      const userConnections = this.connections.get(userId);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          this.connections.delete(userId);
        }
      }
    });

    ws.addEventListener('error', (error) => {
      console.error(`[WebSocketService] WebSocket error for ${userId}:`, error);
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(
    userId: string,
    connectionId: string,
    message: WebSocketMessage
  ): Promise<void> {
    // Update last activity
    const info = this.connectionInfo.get(connectionId);
    if (info) {
      info.lastActivity = new Date().toISOString();
    }

    // Handle different message types
    switch (message.type) {
      case 'ping':
        // Respond with pong
        await this.sendToUser(userId, {
          type: 'pong',
          payload: {},
          timestamp: new Date().toISOString()
        });
        break;

      case 'presence':
        // Update presence
        this.updatePresence(userId, message.payload.status, message.payload.metadata);
        await this.broadcastPresenceUpdate(userId, message.payload.status);
        break;

      case 'typing':
        // Handle typing indicator
        await this.setTyping(
          userId,
          message.payload.userName,
          message.payload.channelId,
          message.payload.isTyping
        );
        break;

      default:
        console.log(`[WebSocketService] Unhandled message type: ${message.type}`);
    }
  }

  /**
   * Broadcast presence update
   */
  private async broadcastPresenceUpdate(userId: string, status: PresenceStatus): Promise<void> {
    await this.broadcast({
      type: 'presence',
      payload: {
        userId,
        status,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, userId); // Exclude the user themselves
  }

  /**
   * Start ping/pong keep-alive
   */
  private startPingPong(ws: WebSocket, connectionId: string): void {
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({
            type: 'ping',
            payload: {},
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error(`[WebSocketService] Ping error for ${connectionId}:`, error);
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, this.pingInterval);
  }

  /**
   * Generate connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Clean up stale connections
   */
  async cleanupStaleConnections(maxIdleTime: number = 5 * 60 * 1000): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [connectionId, info] of this.connectionInfo.entries()) {
      const lastActivity = new Date(info.lastActivity).getTime();
      
      if (now - lastActivity > maxIdleTime) {
        await this.handleDisconnection(info.userId, connectionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[WebSocketService] Cleaned up ${cleaned} stale connections`);
    }

    return cleaned;
  }
}

