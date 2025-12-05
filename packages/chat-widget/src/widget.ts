/**
 * McCarthy AI Chat Widget
 * Embeddable customer support chat widget
 */

interface ChatConfig {
  apiUrl: string;
  tenantId?: string;
  primaryColor?: string;
  textColor?: string;
  buttonText?: string;
  welcomeMessage?: string;
  offlineMessage?: string;
  position?: 'bottom-right' | 'bottom-left';
}

interface ActionButton {
  type: 'button' | 'form';
  label: string;
  action: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'customer' | 'agent' | 'ai' | 'system';
  senderName?: string;
  timestamp: Date;
  actions?: ActionButton[];
  showCallbackForm?: boolean;
}

interface ChatStatus {
  is_online: boolean;
  online_staff_count: number;
  is_in_business_hours: boolean;
  business_hours: Array<{
    day_of_week: number;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
  }>;
  timezone: string;
}

class McCarthyChat {
  private config: ChatConfig;
  private container: HTMLDivElement | null = null;
  private isOpen = false;
  private messages: ChatMessage[] = [];
  private chatStatus: ChatStatus | null = null;
  private customerInfo: { name?: string; email?: string } = {};
  private conversationId: string | null = null;
  private ws: WebSocket | null = null;
  private pollingInterval: number | null = null;
  private lastMessageId: string | null = null;
  private storageKey = 'mccarthy-chat-state';

  constructor(config: ChatConfig) {
    this.config = {
      primaryColor: '#4F46E5',
      textColor: '#ffffff',
      buttonText: 'Chat with us',
      welcomeMessage: 'Hi there! 👋 How can we help you today?',
      offlineMessage: 'We\'re currently offline. Leave a message and we\'ll get back to you!',
      position: 'bottom-right',
      ...config
    };

    this.init();
  }

  private async init() {
    // Restore any saved state
    this.restoreState();
    
    // Fetch chat status from API
    await this.fetchChatStatus();
    
    // Create and inject styles
    this.injectStyles();
    
    // Create widget container
    this.createWidget();
    
    // Add welcome message if no messages yet
    if (this.messages.length === 0) {
      this.addSystemMessage(this.config.welcomeMessage!);
    }
    
    // If we had an open conversation, restore it
    if (this.conversationId && this.customerInfo.name) {
      this.restoreOpenConversation();
    }
  }

  private saveState() {
    try {
      const state = {
        isOpen: this.isOpen,
        conversationId: this.conversationId,
        customerInfo: this.customerInfo,
        messages: this.messages.map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString()
        }))
      };
      sessionStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn('[McCarthyChat] Failed to save state:', e);
    }
  }

  private restoreState() {
    try {
      const saved = sessionStorage.getItem(this.storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        
        // Don't restore if conversation was closed
        if (state.isClosed) {
          console.log('[McCarthyChat] Previous conversation was closed - starting fresh');
          sessionStorage.removeItem(this.storageKey);
          return;
        }
        
        this.conversationId = state.conversationId || null;
        this.customerInfo = state.customerInfo || {};
        this.messages = (state.messages || []).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        this.isOpen = state.isOpen || false;
        console.log('[McCarthyChat] Restored state:', { 
          conversationId: this.conversationId, 
          messageCount: this.messages.length,
          isOpen: this.isOpen 
        });
      }
    } catch (e) {
      console.warn('[McCarthyChat] Failed to restore state:', e);
    }
  }

  private restoreOpenConversation() {
    // Skip pre-chat form and show messages
    setTimeout(() => {
      const prechat = this.container?.querySelector('#mccarthy-prechat') as HTMLElement;
      const messages = this.container?.querySelector('#mccarthy-messages') as HTMLElement;
      const inputArea = this.container?.querySelector('#mccarthy-input-area') as HTMLElement;
      
      if (prechat) prechat.style.display = 'none';
      if (messages) messages.style.display = 'flex';
      if (inputArea) inputArea.style.display = 'block';
      
      this.renderMessages();
      
      // If was open, reopen
      if (this.isOpen) {
        const bubble = this.container?.querySelector('.mccarthy-chat-bubble');
        const window = this.container?.querySelector('.mccarthy-chat-window');
        bubble?.classList.add('open');
        window?.classList.add('open');
      }
      
      // Start polling if we have a conversation
      if (this.conversationId) {
        this.startPolling();
      }
    }, 100);
  }

  private async fetchChatStatus() {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/chat/status`);
      if (response.ok) {
        this.chatStatus = await response.json();
      }
    } catch (error) {
      console.error('[McCarthyChat] Failed to fetch status:', error);
    }
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.id = 'mccarthy-chat-styles';
    style.textContent = `
      #mccarthy-chat-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        position: fixed;
        ${this.config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
        bottom: 20px;
        z-index: 999999;
      }

      /* Chat Bubble Button */
      .mccarthy-chat-bubble {
        padding: 12px 20px;
        border-radius: 50px;
        background: ${this.config.primaryColor};
        color: ${this.config.textColor};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s, box-shadow 0.2s, padding 0.2s;
        position: relative;
      }

      .mccarthy-chat-bubble:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .mccarthy-bubble-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mccarthy-bubble-text {
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
      }

      .mccarthy-chat-bubble svg.chat-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .mccarthy-chat-bubble svg.close-icon {
        width: 24px;
        height: 24px;
        display: none;
      }

      .mccarthy-chat-bubble.open .mccarthy-bubble-content {
        display: none;
      }

      .mccarthy-chat-bubble.open svg.close-icon {
        display: block;
      }

      .mccarthy-chat-bubble.open {
        width: 50px;
        height: 50px;
        padding: 0;
        border-radius: 50%;
      }

      /* Status indicator on bubble */
      .mccarthy-status-dot {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
      }

      .mccarthy-status-dot.online {
        background: #22c55e;
      }

      .mccarthy-status-dot.offline {
        background: #9ca3af;
      }

      /* Chat Window */
      .mccarthy-chat-window {
        position: absolute;
        ${this.config.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
        bottom: 75px;
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 520px;
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.3s, transform 0.3s;
      }

      .mccarthy-chat-window.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      /* Header */
      .mccarthy-chat-header {
        background: ${this.config.primaryColor};
        color: ${this.config.textColor};
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .mccarthy-chat-header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mccarthy-chat-header-avatar svg {
        width: 24px;
        height: 24px;
      }

      .mccarthy-chat-header-info {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .mccarthy-chat-header-title {
        font-weight: 600;
        font-size: 16px;
      }

      .mccarthy-chat-header-status {
        font-size: 12px;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
      }

      .mccarthy-chat-header-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .mccarthy-chat-header-status-dot.online {
        background: #22c55e;
      }

      .mccarthy-chat-header-status-dot.offline {
        background: rgba(255, 255, 255, 0.5);
      }

      .mccarthy-chat-header-new {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${this.config.textColor};
        margin-left: 8px;
        transition: background 0.2s;
      }

      .mccarthy-chat-header-new:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .mccarthy-chat-header-new svg {
        width: 18px;
        height: 18px;
      }

      /* Messages Area */
      .mccarthy-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f9fafb;
      }

      .mccarthy-chat-message {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 16px;
        word-wrap: break-word;
      }

      .mccarthy-chat-message.customer {
        align-self: flex-end;
        background: ${this.config.primaryColor};
        color: ${this.config.textColor};
        border-bottom-right-radius: 4px;
      }

      .mccarthy-chat-message.agent,
      .mccarthy-chat-message.ai {
        align-self: flex-start;
        background: white;
        color: #1f2937;
        border: 1px solid #e5e7eb;
        border-bottom-left-radius: 4px;
      }

      .mccarthy-chat-message.system {
        align-self: center;
        background: transparent;
        color: #6b7280;
        font-size: 13px;
        text-align: center;
        padding: 8px;
      }

      .mccarthy-chat-message-sender {
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 4px;
        opacity: 0.7;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .mccarthy-chat-message-sender svg {
        width: 12px;
        height: 12px;
      }

      .mccarthy-chat-message-time {
        font-size: 10px;
        opacity: 0.6;
        margin-top: 4px;
        text-align: right;
      }

      /* Typing indicator */
      .mccarthy-typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        align-self: flex-start;
        background: #f3f4f6;
        border-radius: 16px;
        border: 1px solid #e5e7eb;
      }

      .mccarthy-typing-indicator .typing-label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
      }

      .mccarthy-typing-indicator .typing-dots {
        display: flex;
        gap: 4px;
      }

      .mccarthy-typing-indicator .typing-dots span {
        width: 8px;
        height: 8px;
        background: ${this.config.primaryColor};
        border-radius: 50%;
        animation: mccarthy-typing 1.4s infinite ease-in-out;
      }

      .mccarthy-typing-indicator .typing-dots span:nth-child(1) { animation-delay: 0s; }
      .mccarthy-typing-indicator .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .mccarthy-typing-indicator .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes mccarthy-typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
      }

      /* Action Buttons */
      .mccarthy-action-buttons {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
      }

      .mccarthy-action-btn {
        padding: 8px 16px;
        border-radius: 20px;
        border: 1px solid ${this.config.primaryColor};
        background: white;
        color: ${this.config.primaryColor};
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .mccarthy-action-btn:hover {
        background: ${this.config.primaryColor};
        color: white;
      }

      /* Callback Form */
      .mccarthy-callback-form {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        margin: 8px 0;
      }

      .mccarthy-callback-form-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 12px;
        font-size: 15px;
      }

      .mccarthy-callback-icon {
        font-size: 20px;
      }

      .mccarthy-callback-form .mccarthy-form-group {
        margin-bottom: 12px;
      }

      .mccarthy-callback-form .mccarthy-form-group:last-of-type {
        margin-bottom: 16px;
      }

      .mccarthy-callback-form label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 4px;
      }

      .mccarthy-callback-form input,
      .mccarthy-callback-form textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }

      .mccarthy-callback-form input:focus,
      .mccarthy-callback-form textarea:focus {
        outline: none;
        border-color: ${this.config.primaryColor};
        box-shadow: 0 0 0 3px ${this.config.primaryColor}20;
      }

      .mccarthy-callback-form textarea {
        resize: vertical;
        min-height: 60px;
      }

      .mccarthy-callback-submit {
        width: 100%;
        padding: 12px;
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
      }

      .mccarthy-callback-submit:hover {
        filter: brightness(1.1);
      }

      .mccarthy-callback-submit:active {
        transform: scale(0.98);
      }

      .mccarthy-callback-submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      /* Post-Chat Survey */
      .mccarthy-survey {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #bae6fd;
        border-radius: 12px;
        padding: 16px;
        margin: 8px 0;
        text-align: center;
      }

      .mccarthy-survey-header {
        font-weight: 600;
        color: #0369a1;
        margin-bottom: 12px;
        font-size: 15px;
      }

      .mccarthy-survey-stars {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .mccarthy-star {
        background: none;
        border: none;
        font-size: 28px;
        color: #d1d5db;
        cursor: pointer;
        transition: color 0.2s, transform 0.2s;
        padding: 4px;
      }

      .mccarthy-star:hover {
        transform: scale(1.2);
      }

      .mccarthy-star.selected {
        color: #fbbf24;
      }

      .mccarthy-star:hover,
      .mccarthy-star:hover ~ .mccarthy-star {
        color: #fcd34d;
      }

      .mccarthy-survey-feedback {
        margin-top: 12px;
      }

      .mccarthy-survey-feedback textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        resize: vertical;
        min-height: 50px;
        box-sizing: border-box;
        margin-bottom: 8px;
      }

      .mccarthy-survey-feedback textarea:focus {
        outline: none;
        border-color: ${this.config.primaryColor};
        box-shadow: 0 0 0 3px ${this.config.primaryColor}20;
      }

      .mccarthy-survey-submit {
        width: 100%;
        padding: 10px;
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .mccarthy-survey-submit:hover {
        filter: brightness(1.1);
      }

      .mccarthy-survey-thanks {
        color: #059669;
        font-weight: 600;
        font-size: 15px;
        padding: 12px;
      }

      /* Input Area */
      .mccarthy-chat-input-area {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        background: white;
      }

      .mccarthy-chat-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }

      .mccarthy-chat-input {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
        resize: none;
        max-height: 100px;
        font-family: inherit;
      }

      .mccarthy-chat-input:focus {
        border-color: ${this.config.primaryColor};
        box-shadow: 0 0 0 2px ${this.config.primaryColor}20;
      }

      .mccarthy-chat-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        color: ${this.config.textColor};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.2s;
      }

      .mccarthy-chat-send:hover {
        filter: brightness(1.1);
      }

      .mccarthy-chat-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .mccarthy-chat-send svg {
        width: 20px;
        height: 20px;
      }

      /* Attachment Button */
      .mccarthy-chat-attach {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: transparent;
        color: #6b7280;
        border: 1px solid #e5e7eb;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
      }

      .mccarthy-chat-attach:hover {
        background: #f3f4f6;
        color: ${this.config.primaryColor};
        border-color: ${this.config.primaryColor};
      }

      .mccarthy-chat-attach svg {
        width: 18px;
        height: 18px;
      }

      /* Attachment Preview */
      .mccarthy-attachment-preview {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        margin-bottom: 8px;
        background: #f3f4f6;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }

      .mccarthy-attachment-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .mccarthy-attachment-icon {
        width: 16px;
        height: 16px;
        color: #6b7280;
        flex-shrink: 0;
      }

      .mccarthy-attachment-info span {
        font-size: 13px;
        color: #374151;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .mccarthy-attachment-remove {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .mccarthy-attachment-remove:hover {
        background: #fee2e2;
        color: #ef4444;
      }

      .mccarthy-attachment-remove svg {
        width: 14px;
        height: 14px;
      }

      /* Attachment in Messages */
      .mccarthy-message-attachment {
        margin-top: 8px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mccarthy-message-attachment a {
        color: ${this.config.primaryColor};
        text-decoration: none;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .mccarthy-message-attachment a:hover {
        text-decoration: underline;
      }

      .mccarthy-message-attachment svg {
        width: 16px;
        height: 16px;
      }

      .mccarthy-message-attachment img {
        max-width: 200px;
        max-height: 150px;
        border-radius: 8px;
        cursor: pointer;
      }

      /* Pre-chat form */
      .mccarthy-prechat-form {
        padding: 20px;
        background: white;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .mccarthy-prechat-form h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }

      .mccarthy-prechat-form p {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }

      .mccarthy-form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .mccarthy-form-group label {
        font-size: 13px;
        font-weight: 500;
        color: #374151;
      }

      .mccarthy-form-group input {
        padding: 10px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        font-family: inherit;
      }

      .mccarthy-form-group input:focus {
        border-color: ${this.config.primaryColor};
        box-shadow: 0 0 0 2px ${this.config.primaryColor}20;
      }

      .mccarthy-prechat-submit {
        padding: 12px 20px;
        background: ${this.config.primaryColor};
        color: ${this.config.textColor};
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 8px;
      }

      .mccarthy-prechat-submit:hover {
        filter: brightness(1.1);
      }

      /* Business hours info */
      .mccarthy-business-hours {
        padding: 12px 16px;
        background: #f3f4f6;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #6b7280;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .mccarthy-business-hours svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      /* Powered by */
      .mccarthy-powered-by {
        padding: 8px;
        text-align: center;
        font-size: 11px;
        color: #9ca3af;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }

      .mccarthy-powered-by a {
        color: #6b7280;
        text-decoration: none;
      }

      .mccarthy-powered-by a:hover {
        text-decoration: underline;
      }

      /* Mobile responsive */
      @media (max-width: 480px) {
        #mccarthy-chat-widget {
          right: 10px;
          bottom: 10px;
        }

        .mccarthy-chat-bubble {
          padding: 10px 16px;
        }

        .mccarthy-bubble-text {
          font-size: 13px;
        }

        .mccarthy-chat-window {
          width: calc(100vw - 20px);
          height: calc(100vh - 100px);
          max-height: calc(100vh - 80px);
          bottom: 70px;
          ${this.config.position === 'bottom-left' ? 'left: 10px;' : 'right: 10px;'}
          border-radius: 12px;
        }

        .mccarthy-chat-header {
          padding: 12px 16px;
        }

        .mccarthy-chat-header-info h3 {
          font-size: 15px;
        }

        .mccarthy-chat-messages {
          padding: 12px;
        }

        .mccarthy-chat-message {
          max-width: 90%;
          padding: 8px 12px;
          font-size: 14px;
        }

        .mccarthy-prechat-form {
          padding: 16px;
        }

        .mccarthy-form-group input {
          padding: 10px 12px;
        }

        .mccarthy-callback-form {
          padding: 12px;
        }

        .mccarthy-callback-form .mccarthy-form-group {
          margin-bottom: 10px;
        }

        .mccarthy-survey {
          padding: 12px;
        }

        .mccarthy-star {
          font-size: 24px;
        }
      }

      /* Very small screens */
      @media (max-width: 360px) {
        .mccarthy-chat-window {
          width: calc(100vw - 10px);
          right: 5px;
          left: 5px;
        }

        .mccarthy-bubble-text {
          display: none;
        }

        .mccarthy-chat-bubble {
          width: 50px;
          height: 50px;
          padding: 0;
          border-radius: 50%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private createWidget() {
    this.container = document.createElement('div');
    this.container.id = 'mccarthy-chat-widget';
    
    const isOnline = this.chatStatus?.is_online ?? false;
    
    this.container.innerHTML = `
      <!-- Chat Bubble -->
      <button class="mccarthy-chat-bubble" aria-label="Open chat">
        <span class="mccarthy-status-dot ${isOnline ? 'online' : 'offline'}"></span>
        <span class="mccarthy-bubble-content">
          <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
            <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z"></path>
            <path d="M19 12l1 2 1-2 2-1-2-1-1-2-1 2-2 1 2 1z"></path>
          </svg>
          <span class="mccarthy-bubble-text">${this.config.buttonText}</span>
        </span>
        <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Chat Window -->
      <div class="mccarthy-chat-window">
        <!-- Header -->
        <div class="mccarthy-chat-header">
          <div class="mccarthy-chat-header-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
              <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z"></path>
              <path d="M19 12l1 2 1-2 2-1-2-1-1-2-1 2-2 1 2 1z"></path>
            </svg>
          </div>
          <div class="mccarthy-chat-header-info">
            <div class="mccarthy-chat-header-title">McCarthy AI</div>
            <div class="mccarthy-chat-header-status">
              <span class="mccarthy-chat-header-status-dot ${isOnline ? 'online' : 'offline'}"></span>
              ${isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          <button class="mccarthy-chat-header-new" id="mccarthy-new-chat" title="Start new chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
        </div>

        <!-- Pre-chat form (shown first) -->
        <div class="mccarthy-prechat-form" id="mccarthy-prechat">
          <h3>Start a conversation</h3>
          <p>${isOnline ? 'Our team is ready to help!' : this.config.offlineMessage}</p>
          <div class="mccarthy-form-group">
            <label for="mccarthy-name">Your name</label>
            <input type="text" id="mccarthy-name" placeholder="John" required>
          </div>
          <div class="mccarthy-form-group">
            <label for="mccarthy-email">Email address</label>
            <input type="email" id="mccarthy-email" placeholder="john@example.com" required>
          </div>
          <button class="mccarthy-prechat-submit" id="mccarthy-start-chat">
            Start Chat
          </button>
        </div>

        <!-- Messages (hidden until form submitted) -->
        <div class="mccarthy-chat-messages" id="mccarthy-messages" style="display: none;">
        </div>

        <!-- Input Area (hidden until form submitted) -->
        <div class="mccarthy-chat-input-area" id="mccarthy-input-area" style="display: none;">
          <!-- Attachment Preview -->
          <div class="mccarthy-attachment-preview" id="mccarthy-attachment-preview" style="display: none;">
            <div class="mccarthy-attachment-info">
              <svg class="mccarthy-attachment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
              <span id="mccarthy-attachment-name">file.pdf</span>
            </div>
            <button class="mccarthy-attachment-remove" id="mccarthy-attachment-remove" aria-label="Remove attachment">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="mccarthy-chat-input-wrapper">
            <input type="file" id="mccarthy-file-input" style="display: none;" accept="image/*,.pdf,.doc,.docx,.txt">
            <button class="mccarthy-chat-attach" id="mccarthy-attach" aria-label="Attach file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <textarea 
              class="mccarthy-chat-input" 
              id="mccarthy-input"
              placeholder="Type your message..."
              rows="1"
            ></textarea>
            <button class="mccarthy-chat-send" id="mccarthy-send" aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>

        <!-- Business Hours -->
        ${this.renderBusinessHours()}

        <!-- Powered by -->
        <div class="mccarthy-powered-by">
          Powered by <a href="https://mccarthy.ai" target="_blank">McCarthy AI</a>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.attachEventListeners();
  }

  private renderBusinessHours(): string {
    if (!this.chatStatus?.business_hours) return '';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const todayHours = this.chatStatus.business_hours.find(h => h.day_of_week === today);
    
    if (!todayHours || !todayHours.is_open) {
      return `
        <div class="mccarthy-business-hours">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Closed today</span>
        </div>
      `;
    }
    
    return `
      <div class="mccarthy-business-hours">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>Today: ${todayHours.open_time} - ${todayHours.close_time} (${this.chatStatus.timezone})</span>
      </div>
    `;
  }

  private pendingAttachment: { file: File; dataUrl: string } | null = null;

  private attachEventListeners() {
    if (!this.container) return;

    // Toggle chat window
    const bubble = this.container.querySelector('.mccarthy-chat-bubble');
    bubble?.addEventListener('click', () => this.toggleChat());

    // New chat button
    const newChatBtn = this.container.querySelector('#mccarthy-new-chat');
    newChatBtn?.addEventListener('click', () => {
      if (confirm('Start a new conversation? This will clear the current chat.')) {
        this.clearChat();
      }
    });

    // Pre-chat form submission
    const startChatBtn = this.container.querySelector('#mccarthy-start-chat');
    startChatBtn?.addEventListener('click', () => this.startChat());

    // Send message
    const sendBtn = this.container.querySelector('#mccarthy-send');
    sendBtn?.addEventListener('click', () => this.sendMessage());

    // Enter key to send
    const input = this.container.querySelector('#mccarthy-input') as HTMLTextAreaElement;
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    input?.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });

    // File attachment button
    const attachBtn = this.container.querySelector('#mccarthy-attach');
    const fileInput = this.container.querySelector('#mccarthy-file-input') as HTMLInputElement;
    
    attachBtn?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });

    // Remove attachment button
    const removeAttachBtn = this.container.querySelector('#mccarthy-attachment-remove');
    removeAttachBtn?.addEventListener('click', () => {
      this.clearPendingAttachment();
    });
  }

  private handleFileSelect(file: File) {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      alert('File type not supported. Please upload an image, PDF, or document.');
      return;
    }

    // Read file as data URL for preview/upload
    const reader = new FileReader();
    reader.onload = (e) => {
      this.pendingAttachment = {
        file,
        dataUrl: e.target?.result as string
      };
      this.showAttachmentPreview(file.name);
    };
    reader.readAsDataURL(file);
  }

  private showAttachmentPreview(fileName: string) {
    const preview = this.container?.querySelector('#mccarthy-attachment-preview') as HTMLElement;
    const nameEl = this.container?.querySelector('#mccarthy-attachment-name');
    
    if (preview && nameEl) {
      nameEl.textContent = fileName;
      preview.style.display = 'flex';
    }
  }

  private clearPendingAttachment() {
    this.pendingAttachment = null;
    const preview = this.container?.querySelector('#mccarthy-attachment-preview') as HTMLElement;
    const fileInput = this.container?.querySelector('#mccarthy-file-input') as HTMLInputElement;
    
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
  }

  private toggleChat() {
    this.isOpen = !this.isOpen;
    
    const bubble = this.container?.querySelector('.mccarthy-chat-bubble');
    const window = this.container?.querySelector('.mccarthy-chat-window');
    
    if (this.isOpen) {
      bubble?.classList.add('open');
      window?.classList.add('open');
    } else {
      bubble?.classList.remove('open');
      window?.classList.remove('open');
    }
    
    this.saveState();
  }

  private async startChat() {
    const nameInput = this.container?.querySelector('#mccarthy-name') as HTMLInputElement;
    const emailInput = this.container?.querySelector('#mccarthy-email') as HTMLInputElement;
    const startButton = this.container?.querySelector('#mccarthy-start-chat') as HTMLButtonElement;
    
    if (!nameInput?.value || !emailInput?.value) {
      alert('Please enter your name and email');
      return;
    }

    this.customerInfo = {
      name: nameInput.value,
      email: emailInput.value
    };

    // Disable button while starting
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = 'Starting...';
    }

    try {
      // Create conversation on the server immediately
      const response = await fetch(`${this.config.apiUrl}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: this.customerInfo
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.conversationId = data.conversationId;
        console.log('[McCarthyChat] Conversation started:', this.conversationId);
        this.saveState();
        
        // Start polling for messages (staff might take over at any time)
        this.startPolling();
      } else {
        console.error('[McCarthyChat] Failed to start conversation');
      }
    } catch (error) {
      console.error('[McCarthyChat] Start conversation error:', error);
    }

    // Hide pre-chat form, show messages
    const prechat = this.container?.querySelector('#mccarthy-prechat') as HTMLElement;
    const messages = this.container?.querySelector('#mccarthy-messages') as HTMLElement;
    const inputArea = this.container?.querySelector('#mccarthy-input-area') as HTMLElement;
    
    if (prechat) prechat.style.display = 'none';
    if (messages) messages.style.display = 'flex';
    if (inputArea) inputArea.style.display = 'block';

    // Add welcome message
    this.renderMessages();

    // Re-enable button in case user goes back
    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = 'Start Chat';
    }
  }

  private addSystemMessage(content: string) {
    this.messages.push({
      id: `msg-${Date.now()}`,
      content,
      sender: 'system',
      timestamp: new Date()
    });
  }

  private addMessage(content: string, sender: 'customer' | 'agent' | 'ai', senderName?: string) {
    this.messages.push({
      id: `msg-${Date.now()}`,
      content,
      sender,
      senderName,
      timestamp: new Date()
    });
    this.renderMessages();
    this.saveState();
  }

  private addMessageWithActions(content: string, sender: 'customer' | 'agent' | 'ai', senderName?: string, actions?: ActionButton[]) {
    this.messages.push({
      id: `msg-${Date.now()}`,
      content,
      sender,
      senderName,
      timestamp: new Date(),
      actions
    });
    this.renderMessages();
    this.saveState();
  }

  private async handleActionClick(action: string) {
    console.log('[McCarthyChat] Action clicked:', action);
    
    // Send the action as a special message
    this.showTypingIndicator();
    
    try {
      const response = await fetch(`${this.config.apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: this.conversationId,
          message: `__action:${action}`,
          customer: this.customerInfo
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.hideTypingIndicator();
        
        // Handle callback form request
        if (data.showCallbackForm) {
          this.showCallbackForm();
        }
        
        // Ensure polling is running
        if (!this.pollingInterval) {
          this.startPolling();
        }
      } else {
        this.hideTypingIndicator();
        this.addSystemMessage('Sorry, something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('[McCarthyChat] Action error:', error);
      this.hideTypingIndicator();
      this.addSystemMessage('Connection error. Please try again.');
    }
  }

  private showCallbackForm() {
    const messagesEl = this.container?.querySelector('#mccarthy-messages');
    if (!messagesEl) return;

    // Create callback form HTML
    const formHtml = `
      <div class="mccarthy-callback-form" id="mccarthy-callback-form">
        <div class="mccarthy-callback-form-header">
          <span class="mccarthy-callback-icon">📞</span>
          <span>Callback Request</span>
        </div>
        <div class="mccarthy-form-group">
          <label>First Name *</label>
          <input type="text" id="mccarthy-cb-firstname" placeholder="John" required>
        </div>
        <div class="mccarthy-form-group">
          <label>Last Name *</label>
          <input type="text" id="mccarthy-cb-lastname" placeholder="Smith" required>
        </div>
        <div class="mccarthy-form-group">
          <label>Email *</label>
          <input type="email" id="mccarthy-cb-email" value="${this.customerInfo.email || ''}" placeholder="john@example.com" required>
        </div>
        <div class="mccarthy-form-group">
          <label>Phone Number *</label>
          <input type="tel" id="mccarthy-cb-phone" placeholder="+61 400 000 000" required>
        </div>
        <div class="mccarthy-form-group">
          <label>Order ID (optional)</label>
          <input type="text" id="mccarthy-cb-orderid" placeholder="ORD-12345">
        </div>
        <div class="mccarthy-form-group">
          <label>Reason for Request *</label>
          <textarea id="mccarthy-cb-reason" placeholder="Please describe why you need a callback..." rows="3" required></textarea>
        </div>
        <button class="mccarthy-callback-submit" id="mccarthy-cb-submit">
          Submit Request
        </button>
      </div>
    `;

    // Add form to messages
    const formDiv = document.createElement('div');
    formDiv.innerHTML = formHtml;
    messagesEl.appendChild(formDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Attach submit handler
    const submitBtn = this.container?.querySelector('#mccarthy-cb-submit');
    submitBtn?.addEventListener('click', () => this.submitCallbackForm());

    // Pre-fill first name from customer info
    if (this.customerInfo.name) {
      const firstNameInput = this.container?.querySelector('#mccarthy-cb-firstname') as HTMLInputElement;
      if (firstNameInput) {
        firstNameInput.value = this.customerInfo.name.split(' ')[0] || '';
      }
    }
  }

  private async submitCallbackForm() {
    const firstName = (this.container?.querySelector('#mccarthy-cb-firstname') as HTMLInputElement)?.value.trim();
    const lastName = (this.container?.querySelector('#mccarthy-cb-lastname') as HTMLInputElement)?.value.trim();
    const email = (this.container?.querySelector('#mccarthy-cb-email') as HTMLInputElement)?.value.trim();
    const phone = (this.container?.querySelector('#mccarthy-cb-phone') as HTMLInputElement)?.value.trim();
    const orderId = (this.container?.querySelector('#mccarthy-cb-orderid') as HTMLInputElement)?.value.trim();
    const reason = (this.container?.querySelector('#mccarthy-cb-reason') as HTMLTextAreaElement)?.value.trim();

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !reason) {
      alert('Please fill in all required fields (marked with *)');
      return;
    }

    // Disable submit button
    const submitBtn = this.container?.querySelector('#mccarthy-cb-submit') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/api/chat/callback-from-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: this.conversationId,
          firstName,
          lastName,
          email,
          phone,
          orderId: orderId || undefined,
          reason
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remove the form
        const form = this.container?.querySelector('#mccarthy-callback-form');
        form?.parentElement?.remove();
        
        // Add success message
        this.addSystemMessage(data.message);
        
        // If chat was closed, disable input
        if (data.chatClosed) {
          this.stopPolling();
          const input = this.container?.querySelector('#mccarthy-input') as HTMLTextAreaElement;
          const sendBtn = this.container?.querySelector('#mccarthy-send') as HTMLButtonElement;
          if (input) {
            input.disabled = true;
            input.placeholder = 'Chat ended';
          }
          if (sendBtn) {
            sendBtn.disabled = true;
          }
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit callback request. Please try again.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Request';
        }
      }
    } catch (error) {
      console.error('[McCarthyChat] Callback submit error:', error);
      alert('Connection error. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
      }
    }
  }

  private async sendMessage() {
    const input = this.container?.querySelector('#mccarthy-input') as HTMLTextAreaElement;
    const content = input?.value.trim();
    
    // Must have content or attachment
    if (!content && !this.pendingAttachment) return;

    // Add customer message (with attachment indicator if present)
    const displayContent = this.pendingAttachment 
      ? (content ? `${content}\n📎 ${this.pendingAttachment.file.name}` : `📎 ${this.pendingAttachment.file.name}`)
      : content;
    this.addMessage(displayContent, 'customer');
    input.value = '';
    input.style.height = 'auto';

    // Prepare attachment data if present
    let attachmentData: { url: string; name: string; type: string; size: number } | undefined;
    if (this.pendingAttachment) {
      attachmentData = {
        url: this.pendingAttachment.dataUrl,
        name: this.pendingAttachment.file.name,
        type: this.pendingAttachment.file.type,
        size: this.pendingAttachment.file.size
      };
      this.clearPendingAttachment();
    }

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Send to API
      const response = await fetch(`${this.config.apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: this.conversationId,
          message: content || '',
          customer: this.customerInfo,
          attachment: attachmentData
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.conversationId = data.conversationId;
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Handle action buttons in response
        if (data.actions && data.actions.length > 0) {
          // Add AI response with actions
          this.addMessageWithActions(data.response, 'ai', data.senderName, data.actions);
        }
        
        // Handle callback form request
        if (data.showCallbackForm) {
          this.showCallbackForm();
        }
        
        // Don't add AI response here - let polling handle it to avoid duplicates
        // Just ensure polling is running
        if (!this.pollingInterval) {
          this.startPolling();
        }
        
        // If chat was closed (e.g., after callback request), stop polling and disable input
        if (data.chatClosed) {
          console.log('[McCarthyChat] Chat closed by server');
          this.stopPolling();
          
          // Disable input
          const input = this.container?.querySelector('#mccarthy-input') as HTMLTextAreaElement;
          const sendBtn = this.container?.querySelector('#mccarthy-send') as HTMLButtonElement;
          if (input) {
            input.disabled = true;
            input.placeholder = 'Chat ended';
          }
          if (sendBtn) {
            sendBtn.disabled = true;
          }
          
          // Mark as closed in state
          this.saveState();
        }
      } else {
        this.hideTypingIndicator();
        this.addSystemMessage('Sorry, something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('[McCarthyChat] Send error:', error);
      this.hideTypingIndicator();
      this.addSystemMessage('Connection error. Please check your internet and try again.');
    }
  }

  private startPolling() {
    // Don't start if already polling
    if (this.pollingInterval) return;
    
    console.log('[McCarthyChat] Starting message polling');
    
    // Poll every 2 seconds for new messages
    this.pollingInterval = window.setInterval(() => {
      this.pollForMessages();
    }, 2000);
    
    // Also poll immediately
    this.pollForMessages();
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[McCarthyChat] Stopped message polling');
    }
  }

  private async pollForMessages() {
    if (!this.conversationId) return;
    
    try {
      const response = await fetch(`${this.config.apiUrl}/api/chat/conversation/${this.conversationId}/poll`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Replace all messages with server messages to avoid duplicates
        if (data.messages && Array.isArray(data.messages)) {
          const serverMessages: ChatMessage[] = [];
          
          for (const msg of data.messages) {
            // Format sender name - use only first name for staff
            let senderName = msg.sender_name;
            if (msg.sender_type === 'staff' && senderName) {
              senderName = senderName.split(' ')[0]; // Get first name only
            }
            
            serverMessages.push({
              id: msg.id,
              content: msg.content,
              sender: msg.sender_type === 'staff' ? 'agent' : msg.sender_type,
              senderName: senderName,
              timestamp: new Date(msg.created_at)
            });
          }
          
          // Only update if we have new messages (compare count or last message id)
          const lastServerMsgId = serverMessages.length > 0 ? serverMessages[serverMessages.length - 1].id : null;
          const lastLocalMsgId = this.messages.length > 0 ? this.messages[this.messages.length - 1].id : null;
          
          if (serverMessages.length !== this.messages.length || lastServerMsgId !== lastLocalMsgId) {
            this.messages = serverMessages;
            this.renderMessages();
            this.saveState();
          }
        }

        // Check if chat was closed and can be rated
        if (data.isClosed && data.canRate) {
          this.stopPolling();
          this.showPostChatSurvey();
          
          // Disable input
          const input = this.container?.querySelector('#mccarthy-input') as HTMLTextAreaElement;
          const sendBtn = this.container?.querySelector('#mccarthy-send') as HTMLButtonElement;
          if (input) {
            input.disabled = true;
            input.placeholder = 'Chat ended';
          }
          if (sendBtn) {
            sendBtn.disabled = true;
          }
        } else if (data.isClosed) {
          // Chat closed but already rated or can't rate
          this.stopPolling();
          
          // Disable input
          const input = this.container?.querySelector('#mccarthy-input') as HTMLTextAreaElement;
          const sendBtn = this.container?.querySelector('#mccarthy-send') as HTMLButtonElement;
          if (input) {
            input.disabled = true;
            input.placeholder = 'Chat ended';
          }
          if (sendBtn) {
            sendBtn.disabled = true;
          }
        }
      }
    } catch (error) {
      console.error('[McCarthyChat] Poll error:', error);
    }
  }

  private showPostChatSurvey() {
    const messagesEl = this.container?.querySelector('#mccarthy-messages');
    if (!messagesEl) return;

    // Check if survey already shown
    if (this.container?.querySelector('#mccarthy-survey')) return;

    const surveyHtml = `
      <div class="mccarthy-survey" id="mccarthy-survey">
        <div class="mccarthy-survey-header">
          <span>How was your experience?</span>
        </div>
        <div class="mccarthy-survey-stars">
          <button class="mccarthy-star" data-rating="1" aria-label="1 star">★</button>
          <button class="mccarthy-star" data-rating="2" aria-label="2 stars">★</button>
          <button class="mccarthy-star" data-rating="3" aria-label="3 stars">★</button>
          <button class="mccarthy-star" data-rating="4" aria-label="4 stars">★</button>
          <button class="mccarthy-star" data-rating="5" aria-label="5 stars">★</button>
        </div>
        <div class="mccarthy-survey-feedback" id="mccarthy-survey-feedback" style="display: none;">
          <textarea id="mccarthy-survey-comment" placeholder="Any additional feedback? (optional)" rows="2"></textarea>
          <button class="mccarthy-survey-submit" id="mccarthy-survey-submit">Submit Feedback</button>
        </div>
        <div class="mccarthy-survey-thanks" id="mccarthy-survey-thanks" style="display: none;">
          <span>🙏 Thank you for your feedback!</span>
        </div>
      </div>
    `;

    const surveyDiv = document.createElement('div');
    surveyDiv.innerHTML = surveyHtml;
    messagesEl.appendChild(surveyDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Attach star click handlers
    let selectedRating = 0;
    const stars = this.container?.querySelectorAll('.mccarthy-star');
    stars?.forEach((star, index) => {
      star.addEventListener('click', () => {
        selectedRating = index + 1;
        // Update star visuals
        stars.forEach((s, i) => {
          s.classList.toggle('selected', i < selectedRating);
        });
        // Show feedback textarea
        const feedbackEl = this.container?.querySelector('#mccarthy-survey-feedback') as HTMLElement;
        if (feedbackEl) feedbackEl.style.display = 'block';
      });
    });

    // Attach submit handler
    const submitBtn = this.container?.querySelector('#mccarthy-survey-submit');
    submitBtn?.addEventListener('click', async () => {
      if (selectedRating === 0) {
        alert('Please select a rating first');
        return;
      }
      
      const comment = (this.container?.querySelector('#mccarthy-survey-comment') as HTMLTextAreaElement)?.value.trim();
      
      try {
        const response = await fetch(`${this.config.apiUrl}/api/chat/conversation/${this.conversationId}/rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rating: selectedRating,
            feedback: comment || undefined
          })
        });

        if (response.ok) {
          // Show thank you message
          const feedbackEl = this.container?.querySelector('#mccarthy-survey-feedback') as HTMLElement;
          const starsEl = this.container?.querySelector('.mccarthy-survey-stars') as HTMLElement;
          const thanksEl = this.container?.querySelector('#mccarthy-survey-thanks') as HTMLElement;
          
          if (feedbackEl) feedbackEl.style.display = 'none';
          if (starsEl) starsEl.style.display = 'none';
          if (thanksEl) thanksEl.style.display = 'block';
        } else {
          alert('Failed to submit feedback. Please try again.');
        }
      } catch (error) {
        console.error('[McCarthyChat] Survey submit error:', error);
        alert('Connection error. Please try again.');
      }
    });
  }

  private showTypingIndicator(label: string = 'AI is typing') {
    const messagesEl = this.container?.querySelector('#mccarthy-messages');
    if (!messagesEl) return;

    // Remove existing indicator if any
    const existing = this.container?.querySelector('#mccarthy-typing');
    existing?.remove();

    const indicator = document.createElement('div');
    indicator.className = 'mccarthy-typing-indicator';
    indicator.id = 'mccarthy-typing';
    indicator.innerHTML = `
      <span class="typing-label">${label}</span>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesEl.appendChild(indicator);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  private hideTypingIndicator() {
    const indicator = this.container?.querySelector('#mccarthy-typing');
    indicator?.remove();
  }

  private renderMessages() {
    const messagesEl = this.container?.querySelector('#mccarthy-messages');
    if (!messagesEl) return;

    // Icons for different sender types
    const personIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    const sparklesIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path><path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z"></path></svg>`;

    messagesEl.innerHTML = this.messages.map(msg => {
      const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (msg.sender === 'system') {
        return `<div class="mccarthy-chat-message system">${msg.content}</div>`;
      }

      // Determine icon based on sender type
      let senderIcon = '';
      if (msg.sender === 'agent') {
        senderIcon = personIcon;
      } else if (msg.sender === 'ai') {
        senderIcon = sparklesIcon;
      }

      // Render action buttons if present
      let actionsHtml = '';
      if (msg.actions && msg.actions.length > 0) {
        actionsHtml = `
          <div class="mccarthy-action-buttons">
            ${msg.actions.map(action => `
              <button class="mccarthy-action-btn" data-action="${action.action}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        `;
      }

      return `
        <div class="mccarthy-chat-message ${msg.sender}">
          ${msg.senderName ? `<div class="mccarthy-chat-message-sender">${senderIcon}${msg.senderName}</div>` : ''}
          ${msg.content}
          ${actionsHtml}
          <div class="mccarthy-chat-message-time">${time}</div>
        </div>
      `;
    }).join('');

    // Attach event listeners to action buttons
    const actionBtns = messagesEl.querySelectorAll('.mccarthy-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.target as HTMLElement).getAttribute('data-action');
        if (action) {
          this.handleActionClick(action);
        }
      });
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Public methods
  public open() {
    if (!this.isOpen) this.toggleChat();
  }

  public close() {
    if (this.isOpen) this.toggleChat();
  }

  public destroy() {
    this.stopPolling();
    this.container?.remove();
    document.getElementById('mccarthy-chat-styles')?.remove();
  }

  public clearChat() {
    // Clear all state and start fresh
    this.stopPolling();
    this.conversationId = null;
    this.customerInfo = {};
    this.messages = [];
    this.isOpen = false;
    
    // Clear saved state
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('[McCarthyChat] Failed to clear state:', e);
    }
    
    // Reset UI
    const prechat = this.container?.querySelector('#mccarthy-prechat') as HTMLElement;
    const messagesEl = this.container?.querySelector('#mccarthy-messages') as HTMLElement;
    const inputArea = this.container?.querySelector('#mccarthy-input-area') as HTMLElement;
    const nameInput = this.container?.querySelector('#mccarthy-name') as HTMLInputElement;
    const emailInput = this.container?.querySelector('#mccarthy-email') as HTMLInputElement;
    
    if (prechat) prechat.style.display = 'flex';
    if (messagesEl) {
      messagesEl.style.display = 'none';
      messagesEl.innerHTML = '';
    }
    if (inputArea) inputArea.style.display = 'none';
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    
    // Add welcome message again
    this.addSystemMessage(this.config.welcomeMessage!);
    
    console.log('[McCarthyChat] Chat cleared - ready for new conversation');
  }
}

// Auto-initialize if config is present
declare global {
  interface Window {
    McCarthyChat: typeof McCarthyChat;
    McCarthyChatConfig?: ChatConfig;
    mccarthyChat?: McCarthyChat;
  }
}

window.McCarthyChat = McCarthyChat;

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.McCarthyChatConfig) {
      window.mccarthyChat = new McCarthyChat(window.McCarthyChatConfig);
    }
  });
} else {
  if (window.McCarthyChatConfig) {
    window.mccarthyChat = new McCarthyChat(window.McCarthyChatConfig);
  }
}

export default McCarthyChat;

