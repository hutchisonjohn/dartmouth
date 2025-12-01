import React from 'react';
import { createRoot } from 'react-dom/client';
import { McCarthyWidget } from './McCarthyWidget';
import type { WidgetConfig } from './types';

// Export types
export type { WidgetConfig, Message, ChatSession } from './types';

// Export components for React integration
export { McCarthyWidget } from './McCarthyWidget';

// Global initialization function for vanilla JS
declare global {
  interface Window {
    McCarthyWidget: {
      init: (config: WidgetConfig) => void;
      destroy: () => void;
    };
  }
}

let widgetRoot: ReturnType<typeof createRoot> | null = null;
let widgetContainer: HTMLDivElement | null = null;

// Initialize widget (for vanilla JS usage)
function init(config: WidgetConfig) {
  // Remove existing widget if any
  destroy();

  // Create container
  widgetContainer = document.createElement('div');
  widgetContainer.id = 'mccarthy-widget-root';
  document.body.appendChild(widgetContainer);

  // Render widget
  widgetRoot = createRoot(widgetContainer);
  widgetRoot.render(<McCarthyWidget config={config} />);
}

// Destroy widget
function destroy() {
  if (widgetRoot && widgetContainer) {
    widgetRoot.unmount();
    widgetContainer.remove();
    widgetRoot = null;
    widgetContainer = null;
  }
}

// Expose to window for vanilla JS usage
if (typeof window !== 'undefined') {
  window.McCarthyWidget = {
    init,
    destroy,
  };
}

export default {
  init,
  destroy,
};

