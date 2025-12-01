import React from 'react';
import { cn } from '../lib/utils';
import type { Message } from '../types';
import { formatTime } from '../lib/utils';

interface ChatBubbleProps {
  message: Message;
  agentName?: string;
  agentAvatar?: string;
  showTimestamp?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  agentName = 'Agent',
  agentAvatar,
  showTimestamp = false,
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            U
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            {agentAvatar ? (
              <img src={agentAvatar} alt={agentName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-accent-foreground text-sm font-semibold">
                {agentName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start', 'max-w-[80%]')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {showTimestamp && (
          <span className="text-xs text-muted-foreground mt-1">
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
};
