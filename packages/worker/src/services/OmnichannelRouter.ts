/**
 * Omnichannel Router
 * 
 * Routes customer messages from multiple channels into the Customer Service system.
 * Normalizes messages from different sources into a unified format.
 * 
 * Supported Channels:
 * - Email (SendGrid inbound parse)
 * - Live Chat (website widget via WebSocket)
 * - WhatsApp (Twilio Business API)
 * - Instagram (Meta Business API - DMs + Comments)
 * - Facebook (Meta Business API - Messenger + Comments)
 * - Phone (Twilio Voice - transcribed to text)
 * 
 * Created: Nov 28, 2025
 * Part of: Customer Service Agent Core
 */

/**
 * Channel types
 */
export type ChannelType = 'email' | 'chat' | 'whatsapp' | 'instagram' | 'facebook' | 'phone';

/**
 * Message direction
 */
export type MessageDirection = 'inbound' | 'outbound';

/**
 * Normalized message (unified format from all channels)
 */
export interface NormalizedMessage {
  id: string;
  channelType: ChannelType;
  direction: MessageDirection;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  content: string;
  attachments?: Array<{
    type: 'image' | 'file' | 'audio' | 'video';
    url: string;
    name?: string;
    size?: number;
    mimeType?: string;
  }>;
  metadata: {
    channelMessageId: string;  // Original message ID from channel
    channelThreadId?: string;   // Thread/conversation ID from channel
    timestamp: string;
    rawData?: any;              // Original channel-specific data
  };
}

/**
 * Channel configuration
 */
export interface ChannelConfig {
  enabled: boolean;
  credentials: Record<string, string>;
  webhookUrl?: string;
  settings?: Record<string, any>;
}

/**
 * Routing result
 */
export interface RoutingResult {
  success: boolean;
  normalizedMessage: NormalizedMessage;
  ticketId?: string;
  error?: string;
}

/**
 * Email message (SendGrid inbound parse format)
 */
export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
  headers?: Record<string, string>;
}

/**
 * Chat message (website widget format)
 */
export interface ChatMessage {
  sessionId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  message: string;
  timestamp: string;
}

/**
 * WhatsApp message (Twilio format)
 */
export interface WhatsAppMessage {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}

/**
 * Instagram message (Meta API format)
 */
export interface InstagramMessage {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
  };
  message: {
    mid: string;
    text?: string;
    attachments?: Array<{
      type: string;
      payload: {
        url: string;
      };
    }>;
  };
  timestamp: number;
}

/**
 * Facebook message (Meta API format)
 */
export interface FacebookMessage {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  message: {
    mid: string;
    text?: string;
    attachments?: Array<{
      type: string;
      payload: {
        url: string;
      };
    }>;
  };
  timestamp: number;
}

/**
 * Phone message (Twilio Voice transcription)
 */
export interface PhoneMessage {
  CallSid: string;
  From: string;
  To: string;
  TranscriptionText: string;
  RecordingUrl?: string;
  CallDuration?: string;
}

/**
 * Omnichannel Router
 * 
 * Routes messages from all channels into the Customer Service system.
 */
export class OmnichannelRouter {
  private channelConfigs: Map<ChannelType, ChannelConfig> = new Map();
  private messageHandlers: Map<ChannelType, (message: any) => Promise<NormalizedMessage>> = new Map();

  constructor() {
    this.initializeChannels();
    this.registerMessageHandlers();
    console.log('[OmnichannelRouter] Initialized');
  }

  /**
   * Route an incoming message from any channel
   */
  async routeMessage(
    channelType: ChannelType,
    rawMessage: any
  ): Promise<RoutingResult> {
    console.log(`[OmnichannelRouter] Routing ${channelType} message`);

    try {
      // STEP 1: Check if channel is enabled
      const config = this.channelConfigs.get(channelType);
      if (!config || !config.enabled) {
        throw new Error(`Channel ${channelType} is not enabled`);
      }

      // STEP 2: Normalize message
      const handler = this.messageHandlers.get(channelType);
      if (!handler) {
        throw new Error(`No handler registered for channel ${channelType}`);
      }

      const normalizedMessage = await handler(rawMessage);

      // STEP 3: Create/update ticket
      // TODO: Integrate with TicketManager
      const ticketId = `ticket_${Date.now()}`;

      console.log(`[OmnichannelRouter] ✅ Message routed successfully: ${normalizedMessage.id}`);

      return {
        success: true,
        normalizedMessage,
        ticketId
      };

    } catch (error) {
      console.error(`[OmnichannelRouter] ❌ Routing failed:`, error);
      
      return {
        success: false,
        normalizedMessage: {} as NormalizedMessage,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send a message to a specific channel
   */
  async sendMessage(
    channelType: ChannelType,
    customerId: string,
    content: string,
    options?: {
      attachments?: NormalizedMessage['attachments'];
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    console.log(`[OmnichannelRouter] Sending ${channelType} message to ${customerId}`);

    try {
      const config = this.channelConfigs.get(channelType);
      if (!config || !config.enabled) {
        throw new Error(`Channel ${channelType} is not enabled`);
      }

      // Send message via channel-specific API
      switch (channelType) {
        case 'email':
          await this.sendEmail(customerId, content, options);
          break;
        case 'chat':
          await this.sendChatMessage(customerId, content, options);
          break;
        case 'whatsapp':
          await this.sendWhatsAppMessage(customerId, content, options);
          break;
        case 'instagram':
          await this.sendInstagramMessage(customerId, content, options);
          break;
        case 'facebook':
          await this.sendFacebookMessage(customerId, content, options);
          break;
        case 'phone':
          await this.sendPhoneMessage(customerId, content, options);
          break;
        default:
          throw new Error(`Unsupported channel: ${channelType}`);
      }

      console.log(`[OmnichannelRouter] ✅ Message sent via ${channelType}`);
      return true;

    } catch (error) {
      console.error(`[OmnichannelRouter] ❌ Send failed:`, error);
      return false;
    }
  }

  /**
   * Get channel configuration
   */
  getChannelConfig(channelType: ChannelType): ChannelConfig | null {
    return this.channelConfigs.get(channelType) || null;
  }

  /**
   * Update channel configuration
   */
  updateChannelConfig(channelType: ChannelType, config: Partial<ChannelConfig>): void {
    const existing = this.channelConfigs.get(channelType);
    if (existing) {
      this.channelConfigs.set(channelType, { ...existing, ...config });
      console.log(`[OmnichannelRouter] ✅ Updated ${channelType} config`);
    }
  }

  /**
   * Enable/disable a channel
   */
  setChannelEnabled(channelType: ChannelType, enabled: boolean): void {
    const config = this.channelConfigs.get(channelType);
    if (config) {
      config.enabled = enabled;
      console.log(`[OmnichannelRouter] ${enabled ? '✅ Enabled' : '❌ Disabled'} ${channelType}`);
    }
  }

  /**
   * Initialize channel configurations
   */
  private initializeChannels(): void {
    // Email (SendGrid)
    this.channelConfigs.set('email', {
      enabled: true,
      credentials: {
        apiKey: process.env.SENDGRID_API_KEY || ''
      },
      webhookUrl: '/webhooks/email/inbound'
    });

    // Live Chat (WebSocket)
    this.channelConfigs.set('chat', {
      enabled: true,
      credentials: {},
      settings: {
        maxConcurrentChats: 50
      }
    });

    // WhatsApp (Twilio)
    this.channelConfigs.set('whatsapp', {
      enabled: false, // Disabled by default until credentials are added
      credentials: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER || ''
      },
      webhookUrl: '/webhooks/whatsapp'
    });

    // Instagram (Meta Business API)
    this.channelConfigs.set('instagram', {
      enabled: false,
      credentials: {
        accessToken: process.env.META_ACCESS_TOKEN || '',
        pageId: process.env.INSTAGRAM_PAGE_ID || ''
      },
      webhookUrl: '/webhooks/instagram'
    });

    // Facebook (Meta Business API)
    this.channelConfigs.set('facebook', {
      enabled: false,
      credentials: {
        accessToken: process.env.META_ACCESS_TOKEN || '',
        pageId: process.env.FACEBOOK_PAGE_ID || ''
      },
      webhookUrl: '/webhooks/facebook'
    });

    // Phone (Twilio Voice)
    this.channelConfigs.set('phone', {
      enabled: false,
      credentials: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
      },
      webhookUrl: '/webhooks/phone'
    });

    console.log('[OmnichannelRouter] ✅ Channels initialized');
  }

  /**
   * Register message handlers for each channel
   */
  private registerMessageHandlers(): void {
    this.messageHandlers.set('email', this.handleEmailMessage.bind(this));
    this.messageHandlers.set('chat', this.handleChatMessage.bind(this));
    this.messageHandlers.set('whatsapp', this.handleWhatsAppMessage.bind(this));
    this.messageHandlers.set('instagram', this.handleInstagramMessage.bind(this));
    this.messageHandlers.set('facebook', this.handleFacebookMessage.bind(this));
    this.messageHandlers.set('phone', this.handlePhoneMessage.bind(this));

    console.log('[OmnichannelRouter] ✅ Message handlers registered');
  }

  /**
   * Handle email message (SendGrid format)
   */
  private async handleEmailMessage(rawMessage: EmailMessage): Promise<NormalizedMessage> {
    const messageId = this.generateMessageId('email');

    return {
      id: messageId,
      channelType: 'email',
      direction: 'inbound',
      customerId: this.extractCustomerId(rawMessage.from, 'email'),
      customerEmail: rawMessage.from,
      content: rawMessage.text || rawMessage.html || '',
      attachments: rawMessage.attachments?.map(att => ({
        type: 'file',
        url: att.content, // Base64 content
        name: att.filename,
        mimeType: att.contentType
      })),
      metadata: {
        channelMessageId: rawMessage.headers?.['message-id'] || messageId,
        timestamp: new Date().toISOString(),
        rawData: rawMessage
      }
    };
  }

  /**
   * Handle chat message (website widget format)
   */
  private async handleChatMessage(rawMessage: ChatMessage): Promise<NormalizedMessage> {
    const messageId = this.generateMessageId('chat');

    return {
      id: messageId,
      channelType: 'chat',
      direction: 'inbound',
      customerId: rawMessage.userId,
      customerName: rawMessage.userName,
      customerEmail: rawMessage.userEmail,
      content: rawMessage.message,
      metadata: {
        channelMessageId: messageId,
        channelThreadId: rawMessage.sessionId,
        timestamp: rawMessage.timestamp,
        rawData: rawMessage
      }
    };
  }

  /**
   * Handle WhatsApp message (Twilio format)
   */
  private async handleWhatsAppMessage(rawMessage: WhatsAppMessage): Promise<NormalizedMessage> {
    const messageId = this.generateMessageId('whatsapp');
    const attachments: NormalizedMessage['attachments'] = [];

    // Handle media attachments
    if (rawMessage.NumMedia && parseInt(rawMessage.NumMedia) > 0) {
      attachments.push({
        type: 'image', // Simplified - could be image/video/audio
        url: rawMessage.MediaUrl0 || '',
        mimeType: rawMessage.MediaContentType0
      });
    }

    return {
      id: messageId,
      channelType: 'whatsapp',
      direction: 'inbound',
      customerId: this.extractCustomerId(rawMessage.From, 'whatsapp'),
      customerPhone: rawMessage.From,
      content: rawMessage.Body,
      attachments: attachments.length > 0 ? attachments : undefined,
      metadata: {
        channelMessageId: rawMessage.MessageSid,
        timestamp: new Date().toISOString(),
        rawData: rawMessage
      }
    };
  }

  /**
   * Handle Instagram message (Meta API format)
   */
  private async handleInstagramMessage(rawMessage: InstagramMessage): Promise<NormalizedMessage> {
    const messageId = this.generateMessageId('instagram');
    const attachments: NormalizedMessage['attachments'] = [];

    // Handle attachments
    if (rawMessage.message.attachments) {
      for (const att of rawMessage.message.attachments) {
        attachments.push({
          type: att.type as any,
          url: att.payload.url
        });
      }
    }

    return {
      id: messageId,
      channelType: 'instagram',
      direction: 'inbound',
      customerId: rawMessage.sender.id,
      customerName: rawMessage.sender.username,
      content: rawMessage.message.text || '[Media message]',
      attachments: attachments.length > 0 ? attachments : undefined,
      metadata: {
        channelMessageId: rawMessage.message.mid,
        timestamp: new Date(rawMessage.timestamp).toISOString(),
        rawData: rawMessage
      }
    };
  }

  /**
   * Handle Facebook message (Meta API format)
   */
  private async handleFacebookMessage(rawMessage: FacebookMessage): Promise<NormalizedMessage> {
    const messageId = this.generateMessageId('facebook');
    const attachments: NormalizedMessage['attachments'] = [];

    // Handle attachments
    if (rawMessage.message.attachments) {
      for (const att of rawMessage.message.attachments) {
        attachments.push({
          type: att.type as any,
          url: att.payload.url
        });
      }
    }

    return {
      id: messageId,
      channelType: 'facebook',
      direction: 'inbound',
      customerId: rawMessage.sender.id,
      content: rawMessage.message.text || '[Media message]',
      attachments: attachments.length > 0 ? attachments : undefined,
      metadata: {
        channelMessageId: rawMessage.message.mid,
        timestamp: new Date(rawMessage.timestamp).toISOString(),
        rawData: rawMessage
      }
    };
  }

  /**
   * Handle phone message (Twilio Voice transcription)
   */
  private async handlePhoneMessage(rawMessage: PhoneMessage): Promise<NormalizedMessage> {
    const messageId = this.generateMessageId('phone');
    const attachments: NormalizedMessage['attachments'] = [];

    // Add recording as attachment if available
    if (rawMessage.RecordingUrl) {
      attachments.push({
        type: 'audio',
        url: rawMessage.RecordingUrl,
        mimeType: 'audio/wav'
      });
    }

    return {
      id: messageId,
      channelType: 'phone',
      direction: 'inbound',
      customerId: this.extractCustomerId(rawMessage.From, 'phone'),
      customerPhone: rawMessage.From,
      content: rawMessage.TranscriptionText || '[Voice call]',
      attachments: attachments.length > 0 ? attachments : undefined,
      metadata: {
        channelMessageId: rawMessage.CallSid,
        timestamp: new Date().toISOString(),
        rawData: rawMessage
      }
    };
  }

  /**
   * Send email (SendGrid)
   */
  private async sendEmail(to: string, content: string, options?: any): Promise<void> {
    // TODO: Implement SendGrid API call
    console.log(`[OmnichannelRouter] Sending email to ${to}`);
  }

  /**
   * Send chat message (WebSocket)
   */
  private async sendChatMessage(userId: string, content: string, options?: any): Promise<void> {
    // TODO: Implement WebSocket send
    console.log(`[OmnichannelRouter] Sending chat message to ${userId}`);
  }

  /**
   * Send WhatsApp message (Twilio)
   */
  private async sendWhatsAppMessage(to: string, content: string, options?: any): Promise<void> {
    // TODO: Implement Twilio WhatsApp API call
    console.log(`[OmnichannelRouter] Sending WhatsApp message to ${to}`);
  }

  /**
   * Send Instagram message (Meta API)
   */
  private async sendInstagramMessage(userId: string, content: string, options?: any): Promise<void> {
    // TODO: Implement Meta Instagram API call
    console.log(`[OmnichannelRouter] Sending Instagram message to ${userId}`);
  }

  /**
   * Send Facebook message (Meta API)
   */
  private async sendFacebookMessage(userId: string, content: string, options?: any): Promise<void> {
    // TODO: Implement Meta Facebook API call
    console.log(`[OmnichannelRouter] Sending Facebook message to ${userId}`);
  }

  /**
   * Send phone message (Twilio Voice)
   */
  private async sendPhoneMessage(to: string, content: string, options?: any): Promise<void> {
    // TODO: Implement Twilio Voice API call (text-to-speech)
    console.log(`[OmnichannelRouter] Sending phone message to ${to}`);
  }

  /**
   * Extract customer ID from channel-specific identifier
   */
  private extractCustomerId(identifier: string, channelType: ChannelType): string {
    // Normalize identifier to create consistent customer ID
    return `${channelType}_${identifier.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  /**
   * Generate message ID
   */
  private generateMessageId(channelType: ChannelType): string {
    return `msg_${channelType}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    enabledChannels: ChannelType[];
    disabledChannels: ChannelType[];
    totalChannels: number;
  } {
    const enabled: ChannelType[] = [];
    const disabled: ChannelType[] = [];

    for (const [type, config] of this.channelConfigs.entries()) {
      if (config.enabled) {
        enabled.push(type);
      } else {
        disabled.push(type);
      }
    }

    return {
      enabledChannels: enabled,
      disabledChannels: disabled,
      totalChannels: this.channelConfigs.size
    };
  }
}

