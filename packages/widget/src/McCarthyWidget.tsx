import React, { useState, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { ChatButton } from './components/ChatButton';
import type { WidgetConfig } from './types';
import './styles/globals.css';

interface McCarthyWidgetProps {
  config: WidgetConfig;
}

export const McCarthyWidget: React.FC<McCarthyWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(config.autoOpen || false);

  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (config.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (config.theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }

    if (config.primaryColor) {
      document.documentElement.style.setProperty('--primary', config.primaryColor);
    }
  }, [config.theme, config.primaryColor]);

  const position = config.position || 'bottom-right';
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };

  return (
    <div className="mccarthy-widget" style={positionStyles[position]}>
      {isOpen ? (
        <ChatWindow config={config} onClose={() => setIsOpen(false)} />
      ) : (
        <ChatButton onClick={() => setIsOpen(true)} />
      )}
    </div>
  );
};
