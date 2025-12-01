import React from 'react';
import { createRoot } from 'react-dom/client';
import { McCarthyWidget } from './McCarthyWidget';
import type { WidgetConfig } from './types';

const config: WidgetConfig = {
  apiUrl: 'https://agent-army-worker.dartmouth.workers.dev',
  agentId: 'artwork-analyzer',
  tenantId: 'dev-tenant',
  agentName: 'McCarthy AI',
  greetingMessage: 'Hey there! I am McCarthy, your AI artwork assistant. How can I help you today?',
  placeholder: 'Ask me about artwork...',
  position: 'bottom-right',
  theme: 'light',
  showTimestamps: true,
  width: 400,
  height: 600,
};

const DevApp = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', color: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>McCarthy Widget - Development</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2rem' }}>Test the chat widget in the bottom-right corner!</p>
      </div>
      <McCarthyWidget config={config} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<DevApp />);
