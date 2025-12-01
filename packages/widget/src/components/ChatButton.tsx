import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick, unreadCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'mccarthy-widget-container rounded-full bg-primary text-primary-foreground',
        'p-4 shadow-lg hover:scale-110 transition-transform duration-200',
        'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-2',
        'animate-fade-in'
      )}
      style={{ width: '64px', height: '64px' }}
      aria-label="Open chat"
    >
      <MessageCircle className="w-8 h-8" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

