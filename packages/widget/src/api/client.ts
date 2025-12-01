import type { ApiResponse, Message } from '../types';

export class McCarthyApiClient {
  private apiUrl: string;
  private agentId: string;
  private tenantId: string;
  private sessionId: string | null = null;

  constructor(apiUrl: string, agentId: string, tenantId: string = 'default') {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.agentId = agentId;
    this.tenantId = tenantId;
  }

  async sendMessage(message: string, conversationHistory: Message[]): Promise<ApiResponse> {
    const endpoint = `${this.apiUrl}/api/v1/agents/${this.agentId}/chat`;
    
    const requestBody = {
      message,
      sessionId: this.sessionId,
      tenantId: this.tenantId,
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      
      // Update session ID if provided
      if (data.metadata?.sessionId) {
        this.sessionId = data.metadata.sessionId;
      }

      return data;
    } catch (error) {
      console.error('[McCarthyWidget] API Error:', error);
      throw error;
    }
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  resetSession(): void {
    this.sessionId = null;
  }
}

