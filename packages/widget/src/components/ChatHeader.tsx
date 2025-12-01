import React from 'react';
import { X, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatHeaderProps {
  agentName?: string;
  agentAvatar?: string;
  onClose: () => void;
  onMinimize?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  agentName = 'McCarthy Agent',
  agentAvatar,
  onClose,
  onMinimize,
}) => {
  return (
    <div className="flex items-center justify-between bg-primary text-primary-foreground p-4 rounded-t-lg">
      <div className="flex items-center gap-3">
        {agentAvatar ? (
          <img src={agentAvatar} alt={agentName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-lg font-semibold">{agentName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-sm">{agentName}</h3>
          <p className="text-xs opacity-90">Online</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onMinimize && (
          <button
            onClick={onMinimize}
            className={cn(
              'p-1 rounded hover:bg-primary-foreground/20 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-foreground/30'
            )}
            aria-label="Minimize chat"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={onClose}
          className={cn(
            'p-1 rounded hover:bg-primary-foreground/20 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-foreground/30'
          )}
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

