import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { McCarthyApiClient } from '../api/client';
import type { Message, WidgetConfig } from '../types';
import { cn } from '../lib/utils';

interface ChatWindowProps {
  config: WidgetConfig;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ config, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiClientRef = useRef<McCarthyApiClient | null>(null);

  // Initialize API client
  useEffect(() => {
    apiClientRef.current = new McCarthyApiClient(
      config.apiUrl,
      config.agentId,
      config.tenantId
    );

    // Add greeting message
    if (config.greetingMessage) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: config.greetingMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [config]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!apiClientRef.current) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const response = await apiClientRef.current.sendMessage(content, messages);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[ChatWindow] Error sending message:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send message. Please try again.'
      );

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const width = config.width || 400;
  const height = config.height || 600;

  return (
    <div
      className={cn(
        'mccarthy-widget-container flex flex-col bg-background rounded-lg overflow-hidden',
        'animate-slide-in'
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      <ChatHeader
        agentName={config.agentName}
        agentAvatar={config.agentAvatar}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-4 mccarthy-widget-scroll">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            agentName={config.agentName}
            agentAvatar={config.agentAvatar}
            showTimestamp={config.showTimestamps}
          />
        ))}
        {isTyping && <TypingIndicator />}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        disabled={isTyping}
        placeholder={config.placeholder || 'Type your message...'}
      />
    </div>
  );
};

