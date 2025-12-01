# 🎨 DARTMOUTH CHAT WIDGET - ARCHITECTURE

**Version:** 1.0.0  
**Date:** November 18, 2025  
**Status:** Design Phase

---

## 🎯 **VISION**

Build an **embeddable chat widget** that can be deployed on ANY website with a simple `<script>` tag, connecting users to specialized McCarthy agents with full Dartmouth foundation capabilities.

---

## 🏗️ **ARCHITECTURE**

### **Component Layers:**

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: EMBEDDING (Any Website)                       │
├─────────────────────────────────────────────────────────┤
│  <script                                                 │
│    src="https://widget.dartmouth.ai/v1/widget.js"       │
│    data-agent-id="mccarthy-artwork"                     │
│    data-primary-color="#667eea"                         │
│    data-secondary-color="#764ba2"                       │
│  ></script>                                              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: WIDGET LOADER (widget.js)                     │
├─────────────────────────────────────────────────────────┤
│  - Loads asynchronously (non-blocking)                  │
│  - Injects CSS and HTML                                 │
│  - Reads configuration from data attributes             │
│  - Initializes WebSocket/API connection                 │
│  - Handles state management                             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: UI COMPONENTS (React/Preact)                  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  Chat Bubble (Collapsed)                        │   │
│  │  [💬] New message indicator                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Chat Window (Expanded)                         │   │
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │ Header: McCarthy Artwork Analyzer         │  │   │
│  │  ├───────────────────────────────────────────┤  │   │
│  │  │ Message Area (scrollable)                 │  │   │
│  │  │ - Bot messages (left-aligned)             │  │   │
│  │  │ - User messages (right-aligned)           │  │   │
│  │  │ - Typing indicator                        │  │   │
│  │  ├───────────────────────────────────────────┤  │   │
│  │  │ Input Area                                │  │   │
│  │  │ [Type your message...] [Send]             │  │   │
│  │  └───────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 4: API CLIENT (widget-api.ts)                    │
├─────────────────────────────────────────────────────────┤
│  - Connects to Dartmouth API                            │
│  - Sends user messages                                  │
│  - Receives bot responses                               │
│  - Handles session management                           │
│  - Error handling & retry logic                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 5: DARTMOUTH BACKEND                             │
├─────────────────────────────────────────────────────────┤
│  BaseAgent → McCarthyArtworkAgent → Response            │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 **WIDGET FEATURES**

### **Core Features:**
- ✅ Embeddable on any website (WordPress, Shopify, React, etc.)
- ✅ Customizable colors/branding
- ✅ Responsive (mobile & desktop)
- ✅ Session persistence (localStorage)
- ✅ Typing indicators
- ✅ Message history
- ✅ Minimize/maximize

### **Advanced Features (Future):**
- 🔄 File upload support
- 🔄 Rich media (images, links, buttons)
- 🔄 Multi-language support
- 🔄 Accessibility (WCAG 2.1 AA)
- 🔄 Analytics tracking
- 🔄 GDPR compliance tools

---

## 🎨 **CUSTOMIZATION OPTIONS**

### **Phase 6 (Hardcoded):**
```javascript
{
  agentId: 'mccarthy-artwork',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  textColor: '#2d3748',
  position: 'bottom-right',
  size: 'standard'
}
```

### **Phase 9 (Dashboard UI):**
```javascript
{
  // Colors
  primaryColor: '#667eea',      // Brand color
  secondaryColor: '#764ba2',    // Accent color
  textColor: '#2d3748',         // Text color
  backgroundColor: '#ffffff',   // Widget background
  
  // Typography
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  
  // Layout
  position: 'bottom-right',     // bottom-right, bottom-left, etc.
  size: 'standard',             // compact, standard, large
  width: '380px',
  height: '600px',
  
  // Behavior
  openByDefault: false,
  showWelcomeMessage: true,
  welcomeMessage: 'Hi! How can I help you today?',
  placeholder: 'Type your message...',
  
  // Branding
  agentName: 'McCarthy Artwork Analyzer',
  agentAvatar: 'https://...',
  poweredByDartmouth: true
}
```

---

## 🛠️ **TECHNICAL STACK**

### **Widget Frontend:**
- **Framework:** Preact (lightweight React alternative, ~3KB)
- **Styling:** Tailwind CSS (inline via CDN or bundled)
- **Build:** Vite + Rollup (bundle to single JS file)
- **TypeScript:** For type safety
- **Bundle Size Target:** < 50KB gzipped

### **Widget Backend:**
- **API:** Cloudflare Workers (already built)
- **Endpoint:** `/api/v1/agents/:agentId/chat`
- **Authentication:** Agent API keys
- **CORS:** Enabled for all domains

### **Hosting:**
- **CDN:** Cloudflare CDN
- **URL:** `https://widget.dartmouth.ai/v1/widget.js`
- **Versioning:** `/v1/`, `/v2/`, etc. for breaking changes

---

## 📋 **IMPLEMENTATION PLAN**

### **Phase 6 Tasks:**

#### **Task 6.1: Build Widget Core** (2 hours)
- Create `packages/widget/` package
- Set up Preact + Vite build
- Create widget loader script
- Inject CSS and HTML
- Read configuration from data attributes

#### **Task 6.2: Build UI Components** (1.5 hours)
- ChatBubble component (collapsed state)
- ChatWindow component (expanded state)
- MessageList component
- MessageInput component
- TypingIndicator component

#### **Task 6.3: Build API Client** (1 hour)
- Connect to Dartmouth API
- Send/receive messages
- Handle sessions (localStorage)
- Error handling & retry logic

#### **Task 6.4: Styling & Theming** (30 min)
- Apply customizable colors
- Responsive design (mobile & desktop)
- Animations & transitions
- Dark mode support

#### **Task 6.5: Integration Testing** (1 hour)
- Test on plain HTML page
- Test on React app
- Test on WordPress (via HTML block)
- Test mobile responsiveness

---

## 🎯 **WIDGET USAGE EXAMPLES**

### **Example 1: Basic Embed**
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  
  <!-- Dartmouth Widget -->
  <script 
    src="https://widget.dartmouth.ai/v1/widget.js"
    data-agent-id="mccarthy-artwork"
  ></script>
</body>
</html>
```

### **Example 2: Customized Widget**
```html
<script 
  src="https://widget.dartmouth.ai/v1/widget.js"
  data-agent-id="mccarthy-artwork"
  data-primary-color="#e63946"
  data-secondary-color="#f1faee"
  data-position="bottom-left"
  data-size="large"
  data-welcome-message="Hi! Need help with your artwork?"
></script>
```

### **Example 3: React Integration**
```tsx
// Option A: Use widget as external script (recommended)
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.dartmouth.ai/v1/widget.js';
    script.dataset.agentId = 'mccarthy-artwork';
    script.dataset.primaryColor = '#667eea';
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return <div>My App</div>;
}

// Option B: Use as React component (internal)
import { DartmouthWidget } from '@dartmouth/widget-react';

function App() {
  return (
    <div>
      <DartmouthWidget 
        agentId="mccarthy-artwork"
        primaryColor="#667eea"
      />
    </div>
  );
}
```

---

## 🔐 **SECURITY CONSIDERATIONS**

### **Phase 6:**
- ✅ CORS enabled for all domains
- ✅ Rate limiting on API
- ✅ Session validation
- ✅ XSS prevention (sanitize inputs)

### **Phase 9 (Dashboard):**
- 🔄 Agent API key authentication
- 🔄 Domain whitelisting (restrict to specific domains)
- 🔄 Usage analytics & quotas
- 🔄 IP-based rate limiting

---

## 📊 **PERFORMANCE TARGETS**

### **Load Time:**
- Initial load: < 1s
- Widget open: < 200ms
- Message send: < 500ms
- Message receive: < 2s (depends on LLM)

### **Bundle Size:**
- widget.js: < 50KB gzipped
- CSS: < 10KB gzipped
- Total: < 60KB gzipped

### **Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🎨 **FUTURE ENHANCEMENTS (Phase 9+)**

### **Dashboard Features:**
- Visual widget customizer with live preview
- Color picker with brand color extraction
- Typography options
- Custom CSS injection
- A/B testing different widget configs
- Analytics dashboard (conversations, conversions, etc.)

### **Widget Features:**
- Multi-language support (i18n)
- Voice input
- Rich media (images, videos, carousels)
- Suggested replies
- Keyboard shortcuts
- Accessibility improvements (screen reader support)

---

## 📝 **WIDGET LIFECYCLE**

```
1. User lands on website
   ↓
2. Widget script loads asynchronously
   ↓
3. Widget initializes (reads config, checks session)
   ↓
4. Chat bubble appears in bottom-right
   ↓
5. User clicks bubble → Widget expands
   ↓
6. Connection established to Dartmouth API
   ↓
7. Welcome message displayed
   ↓
8. User sends message → API request
   ↓
9. McCarthy agent processes (via BaseAgent)
   ↓
10. Response streamed back to widget
   ↓
11. Message displayed with typing indicator
   ↓
12. Session persisted in localStorage
```

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Phase 6 (Initial):**
- Deploy to Cloudflare Pages
- URL: `https://widget.dartmouth.pages.dev/v1/widget.js`
- Redirect from: `https://widget.dartmouth.ai/v1/widget.js`

### **Phase 9 (Production):**
- Deploy to Cloudflare CDN
- Global edge distribution
- Automatic caching
- Version management (/v1/, /v2/, etc.)

---

## 📁 **FILE STRUCTURE**

```
packages/widget/
├── src/
│   ├── index.ts                 # Entry point
│   ├── loader.ts                # Script loader & injector
│   ├── components/
│   │   ├── ChatBubble.tsx       # Collapsed state
│   │   ├── ChatWindow.tsx       # Expanded state
│   │   ├── MessageList.tsx      # Message history
│   │   ├── MessageInput.tsx     # Input field
│   │   └── TypingIndicator.tsx  # Typing animation
│   ├── api/
│   │   └── client.ts            # API communication
│   ├── styles/
│   │   └── widget.css           # Widget styles
│   ├── config.ts                # Configuration types
│   └── utils/
│       ├── session.ts           # Session management
│       ├── colors.ts            # Color utilities
│       └── dom.ts               # DOM manipulation
├── public/
│   └── demo.html                # Demo page
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

**Last Updated:** November 18, 2025  
**Status:** Design complete, ready for implementation  
**Next:** Start Phase 6 implementation

