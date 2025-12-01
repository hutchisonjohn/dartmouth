export interface WidgetConfig {
  // API Configuration
  apiUrl: string;
  agentId: string;
  tenantId?: string;
  
  // UI Configuration
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  
  // Branding
  agentName?: string;
  agentAvatar?: string;
  greetingMessage?: string;
  placeholder?: string;
  
  // Behavior
  autoOpen?: boolean;
  showTimestamps?: boolean;
  allowFileUpload?: boolean;
  
  // Size
  width?: number;
  height?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  metadata?: Record<string, any>;
}

export interface ApiResponse {
  content: string;
  metadata?: {
    sessionId?: string;
    handlerName?: string;
    confidence?: number;
    [key: string]: any;
  };
}

