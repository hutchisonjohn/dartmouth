# SaaS Delivery Architecture
**Last Updated:** 2025-11-20  
**Status:** Design Complete - Ready for Implementation

---

## 🎯 OVERVIEW

Dartmouth OS agents can be delivered to customers in two ways:

1. **Custom Domain** - Full white-label experience (like Shopify)
2. **Embeddable Widget Script** - Easy integration into existing sites (like Intercom)

This document outlines the architecture, implementation, and customer setup process for both delivery methods.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER DELIVERY                         │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Custom Domain   │         │  Widget Script   │         │
│  │                  │         │                  │         │
│  │ customer.com     │         │ <script src=...> │         │
│  │      ↓           │         │      ↓           │         │
│  │ CNAME → Pages    │         │  Loads widget    │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        ↓                                     │
│              ┌──────────────────┐                           │
│              │ Cloudflare Pages │                           │
│              │  (Frontend)      │                           │
│              └──────────────────┘                           │
│                        │                                     │
│                        ↓                                     │
│              ┌──────────────────┐                           │
│              │ Dartmouth OS     │                           │
│              │  Worker          │                           │
│              └──────────────────┘                           │
│                        │                                     │
│         ┌──────────────┼──────────────┐                    │
│         ↓              ↓              ↓                     │
│    ┌────────┐    ┌────────┐    ┌────────┐                │
│    │   KV   │    │   D1   │    │  RAG   │                │
│    │ Tenant │    │ Agent  │    │ Knowledge│               │
│    │ Config │    │  Data  │    │  Base   │                │
│    └────────┘    └────────┘    └────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 DELIVERY METHOD 1: CUSTOM DOMAIN

### Customer Experience

**Customer owns:** `artworktools.com`  
**Customer sees:** Their domain, their branding  
**We control:** Code, updates, infrastructure  

### How It Works

1. Customer provides their domain
2. Customer adds DNS CNAME record
3. Cloudflare verifies domain and issues SSL
4. Site goes live on customer's domain
5. Tenant detected from domain
6. Custom branding and config applied

### Technical Implementation

#### Step 1: Tenant Configuration Storage (KV)

**Key Structure:**
```
tenant:{tenantId}:config
tenant:{domain}:id
domain:{domain}:tenant
```

**Example Tenant Config:**
```json
{
  "tenantId": "tenant-abc-123",
  "domain": "artworktools.com",
  "createdAt": "2025-11-20T10:00:00Z",
  "status": "active",
  
  "branding": {
    "name": "ArtworkTools Pro",
    "logo": "https://cdn.customer.com/logo.png",
    "favicon": "https://cdn.customer.com/favicon.ico",
    "primaryColor": "#4F46E5",
    "secondaryColor": "#10B981",
    "fontFamily": "Inter, sans-serif"
  },
  
  "agent": {
    "agentId": "mccarthy-artwork",
    "name": "ArtBot",
    "greetingMessage": "Hi! I'm ArtBot, your artwork assistant.\n\nI can see your artwork is uploaded and analysed.\n\nWhat would you like to know about it?",
    "systemPrompt": "Custom system instructions...",
    "model": "gpt-4o-mini",
    "temperature": 0.7
  },
  
  "features": {
    "dtf": true,
    "uvdtf": true,
    "customKnowledgeBase": true,
    "analytics": true
  },
  
  "limits": {
    "messagesPerDay": 1000,
    "uploadsPerDay": 500,
    "maxFileSize": 10485760
  },
  
  "apiKeys": {
    "openai": "encrypted-key-here",
    "anthropic": "encrypted-key-here"
  }
}
```

#### Step 2: Worker Tenant Detection

**File:** `packages/worker/src/middleware/tenant.ts`

```typescript
/**
 * Tenant Detection Middleware
 * Extracts tenant ID from domain or API key
 */

export interface TenantContext {
  tenantId: string;
  config: TenantConfig;
  domain?: string;
}

export async function detectTenant(
  request: Request, 
  env: Env
): Promise<TenantContext> {
  // Method 1: Detect from custom domain
  const hostname = new URL(request.url).hostname;
  
  // Skip detection for default domains
  const defaultDomains = [
    'dartmouth-os-worker.dartmouth.workers.dev',
    'artwork-analyser-ai-agent-1qo.pages.dev',
    'localhost'
  ];
  
  if (!defaultDomains.some(d => hostname.includes(d))) {
    // Custom domain - lookup tenant
    const tenantId = await env.KV.get(`domain:${hostname}:tenant`);
    if (tenantId) {
      const config = await loadTenantConfig(tenantId, env);
      return { tenantId, config, domain: hostname };
    }
  }
  
  // Method 2: Detect from API key header
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey) {
    const tenantId = await env.KV.get(`apikey:${apiKey}:tenant`);
    if (tenantId) {
      const config = await loadTenantConfig(tenantId, env);
      return { tenantId, config };
    }
  }
  
  // Method 3: Query parameter (for testing)
  const url = new URL(request.url);
  const tenantParam = url.searchParams.get('tenant');
  if (tenantParam) {
    const config = await loadTenantConfig(tenantParam, env);
    return { tenantId: tenantParam, config };
  }
  
  // Default tenant
  const defaultConfig = await loadTenantConfig('default', env);
  return { tenantId: 'default', config: defaultConfig };
}

async function loadTenantConfig(
  tenantId: string, 
  env: Env
): Promise<TenantConfig> {
  const configJson = await env.KV.get(`tenant:${tenantId}:config`);
  if (!configJson) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }
  return JSON.parse(configJson);
}
```

#### Step 3: Frontend Tenant Detection

**File:** `src/frontend/src/hooks/useTenant.ts`

```typescript
import { useState, useEffect } from 'react';

interface TenantConfig {
  tenantId: string;
  branding: {
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  agent: {
    name: string;
    greetingMessage: string;
  };
}

export function useTenant(apiBase: string) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadTenant() {
      try {
        // Tenant is detected server-side from domain
        // Frontend just needs to fetch the config
        const response = await fetch(`${apiBase}/api/v2/tenant/config`);
        const config = await response.json();
        
        // Apply branding
        document.title = config.branding.name;
        
        // Set favicon
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
          favicon.setAttribute('href', config.branding.favicon);
        }
        
        // Set CSS variables for theming
        document.documentElement.style.setProperty(
          '--color-primary', 
          config.branding.primaryColor
        );
        document.documentElement.style.setProperty(
          '--color-secondary', 
          config.branding.secondaryColor
        );
        
        setTenant(config);
      } catch (error) {
        console.error('Failed to load tenant config:', error);
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    
    loadTenant();
  }, [apiBase]);
  
  return { tenant, loading };
}
```

#### Step 4: Cloudflare Pages Custom Domain Setup

**For Each New Customer:**

1. **Customer provides domain:** `artworktools.com`

2. **Add to Cloudflare Pages:**
   - Go to: Cloudflare Dashboard → Pages → artwork-analyser-ai-agent-1qo
   - Click: Custom domains → Set up a custom domain
   - Enter: `artworktools.com`
   - Click: Continue

3. **Cloudflare provides DNS instructions:**
   ```
   Type: CNAME
   Name: artworktools.com (or @)
   Target: artwork-analyser-ai-agent-1qo.pages.dev
   ```

4. **Customer adds DNS record** (in their DNS provider)

5. **Cloudflare verifies:**
   - Automatic verification (usually 1-5 minutes)
   - SSL certificate issued automatically
   - Domain goes live

6. **Store tenant mapping in KV:**
   ```bash
   npx wrangler kv:key put \
     --namespace-id=<KV_ID> \
     "domain:artworktools.com:tenant" \
     "tenant-abc-123"
   ```

### Customer Setup Guide

**Provide to customer:**

```markdown
# Custom Domain Setup - ArtworkTools Pro

## Step 1: Provide Your Domain
Email us your domain: artworktools.com

## Step 2: Add DNS Record
Log into your DNS provider (GoDaddy, Cloudflare, etc.) and add:

**Type:** CNAME  
**Name:** @ (or artworktools.com)  
**Target:** artwork-analyser-ai-agent-1qo.pages.dev  
**TTL:** Auto (or 3600)

## Step 3: Wait for Verification
- Verification usually takes 1-5 minutes
- SSL certificate issued automatically
- You'll receive an email when ready

## Step 4: Test Your Site
Visit: https://artworktools.com

Your artwork analyser is now live on your domain! 🎉
```

---

## 📋 DELIVERY METHOD 2: EMBEDDABLE WIDGET SCRIPT

### Customer Experience

**Customer adds:** One `<script>` tag to their site  
**Widget appears:** Chat bubble or embedded div  
**We control:** Widget code, updates, agent  

### How It Works

1. Customer copies script tag from dashboard
2. Customer pastes into their website HTML
3. Widget loads and detects tenant from API key
4. Widget connects to Dartmouth OS
5. Chat interface appears on customer's site

### Technical Implementation

#### Step 1: Widget Script Structure

**File:** `packages/widget/src/index.ts`

```typescript
/**
 * McCarthy AI Widget
 * Embeddable chat widget for Dartmouth OS agents
 * 
 * Usage:
 * <script src="https://cdn.mccarthyai.com/widget.js" 
 *         data-tenant="tenant-abc-123"
 *         data-agent="mccarthy-artwork"></script>
 */

(function() {
  'use strict';
  
  // Configuration from script tag
  const script = document.currentScript as HTMLScriptElement;
  const config = {
    tenantId: script.dataset.tenant || '',
    agentId: script.dataset.agent || 'mccarthy-artwork',
    apiBase: script.dataset.apiBase || 'https://dartmouth-os-worker.dartmouth.workers.dev',
    position: script.dataset.position || 'bottom-right', // bottom-right, bottom-left, inline
    theme: script.dataset.theme || 'light', // light, dark, auto
    primaryColor: script.dataset.primaryColor || '#4F46E5',
    embedTarget: script.dataset.embedTarget || null, // CSS selector for inline mode
  };
  
  // Validate tenant
  if (!config.tenantId) {
    console.error('[McCarthy Widget] Missing data-tenant attribute');
    return;
  }
  
  // Create widget container
  const widgetId = 'mccarthy-widget-' + Math.random().toString(36).substr(2, 9);
  let container: HTMLElement;
  
  if (config.embedTarget) {
    // Inline mode - embed in specific element
    const target = document.querySelector(config.embedTarget);
    if (!target) {
      console.error(`[McCarthy Widget] Target element not found: ${config.embedTarget}`);
      return;
    }
    container = document.createElement('div');
    container.id = widgetId;
    target.appendChild(container);
  } else {
    // Floating mode - create fixed position container
    container = document.createElement('div');
    container.id = widgetId;
    container.style.cssText = `
      position: fixed;
      ${config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}
      z-index: 999999;
      width: 400px;
      height: 600px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(container);
  }
  
  // Create iframe for widget content
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
  `;
  
  // Build widget URL with config
  const widgetUrl = new URL(`${config.apiBase}/widget`);
  widgetUrl.searchParams.set('tenant', config.tenantId);
  widgetUrl.searchParams.set('agent', config.agentId);
  widgetUrl.searchParams.set('theme', config.theme);
  widgetUrl.searchParams.set('color', config.primaryColor);
  
  iframe.src = widgetUrl.toString();
  container.appendChild(iframe);
  
  // Add minimize/maximize functionality for floating mode
  if (!config.embedTarget) {
    let isMinimized = false;
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '💬';
    toggleButton.style.cssText = `
      position: fixed;
      ${config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}
      z-index: 999998;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: ${config.primaryColor};
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: none;
      transition: all 0.3s ease;
    `;
    toggleButton.onclick = () => {
      isMinimized = !isMinimized;
      container.style.display = isMinimized ? 'none' : 'block';
      toggleButton.style.display = isMinimized ? 'block' : 'none';
    };
    document.body.appendChild(toggleButton);
    
    // Add close button to widget
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000000;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: none;
      background: rgba(0,0,0,0.1);
      color: #333;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    closeButton.onclick = () => {
      isMinimized = true;
      container.style.display = 'none';
      toggleButton.style.display = 'block';
    };
    container.appendChild(closeButton);
  }
  
  // PostMessage communication between parent and iframe
  window.addEventListener('message', (event) => {
    if (event.origin !== new URL(config.apiBase).origin) return;
    
    // Handle widget events
    if (event.data.type === 'widget-ready') {
      console.log('[McCarthy Widget] Widget loaded successfully');
    }
    
    if (event.data.type === 'widget-resize') {
      container.style.height = event.data.height + 'px';
    }
  });
  
  console.log('[McCarthy Widget] Initialized', config);
})();
```

#### Step 2: Widget HTML Page

**File:** `packages/worker/src/widget.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>McCarthy Widget</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      height: 100vh;
      overflow: hidden;
    }
    
    #widget-root {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    /* Widget styles injected here based on tenant config */
  </style>
</head>
<body>
  <div id="widget-root"></div>
  
  <script>
    // Parse config from URL
    const params = new URLSearchParams(window.location.search);
    const config = {
      tenant: params.get('tenant'),
      agent: params.get('agent'),
      theme: params.get('theme'),
      color: params.get('color')
    };
    
    // Load React widget app
    // (This would be the built React app from packages/widget)
    
    // Notify parent window that widget is ready
    window.parent.postMessage({ type: 'widget-ready' }, '*');
  </script>
</body>
</html>
```

#### Step 3: Widget Dashboard (Copy Script)

**File:** `packages/dashboard/src/pages/Agents.tsx`

```typescript
/**
 * Agent Dashboard - Copy Widget Script
 */

export function AgentCard({ agent }) {
  const [showScript, setShowScript] = useState(false);
  const tenantId = useTenant();
  
  // Generate widget script
  const widgetScript = `<script src="https://cdn.mccarthyai.com/widget.js" 
        data-tenant="${tenantId}"
        data-agent="${agent.id}"></script>`;
  
  const copyScript = () => {
    navigator.clipboard.writeText(widgetScript);
    toast.success('Widget script copied to clipboard!');
  };
  
  return (
    <div className="agent-card">
      <h3>{agent.name}</h3>
      <p>{agent.description}</p>
      
      <button onClick={() => setShowScript(!showScript)}>
        Get Embed Code
      </button>
      
      {showScript && (
        <div className="script-container">
          <h4>Embed this agent on your website:</h4>
          <pre>{widgetScript}</pre>
          <button onClick={copyScript}>Copy Script</button>
          
          <h4>Advanced Options:</h4>
          <pre>{`<!-- Inline mode (embed in specific div) -->
<div id="mccarthy-chat"></div>
<script src="https://cdn.mccarthyai.com/widget.js" 
        data-tenant="${tenantId}"
        data-agent="${agent.id}"
        data-embed-target="#mccarthy-chat"></script>

<!-- Custom styling -->
<script src="https://cdn.mccarthyai.com/widget.js" 
        data-tenant="${tenantId}"
        data-agent="${agent.id}"
        data-position="bottom-left"
        data-theme="dark"
        data-primary-color="#10B981"></script>`}</pre>
        </div>
      )}
    </div>
  );
}
```

### Customer Setup Guide

**Provide to customer:**

```markdown
# Widget Script Setup - McCarthy AI

## Step 1: Copy Your Widget Script

Log into your McCarthy AI dashboard and copy your unique widget script:

```html
<script src="https://cdn.mccarthyai.com/widget.js" 
        data-tenant="your-tenant-id"
        data-agent="mccarthy-artwork"></script>
```

## Step 2: Add to Your Website

Paste the script before the closing `</body>` tag on any page where you want the widget to appear.

### Option A: All Pages (Recommended)
Add to your site's footer template or layout file.

### Option B: Specific Pages
Add only to pages where you want the artwork analyser.

## Step 3: Customise (Optional)

### Inline Mode (Embed in Specific Location)
```html
<div id="artwork-chat"></div>
<script src="https://cdn.mccarthyai.com/widget.js" 
        data-tenant="your-tenant-id"
        data-agent="mccarthy-artwork"
        data-embed-target="#artwork-chat"></script>
```

### Custom Position & Color
```html
<script src="https://cdn.mccarthyai.com/widget.js" 
        data-tenant="your-tenant-id"
        data-agent="mccarthy-artwork"
        data-position="bottom-left"
        data-theme="dark"
        data-primary-color="#10B981"></script>
```

## Step 4: Test
Visit your website and the widget should appear!

## Troubleshooting
- Make sure the script is before `</body>`
- Check browser console for errors
- Verify your tenant ID is correct
```

---

## 🔐 SECURITY CONSIDERATIONS

### API Key Management

**For Custom Domains:**
- Tenant detected from domain (no API key in frontend)
- API keys stored encrypted in KV
- Rate limiting per tenant

**For Widget Scripts:**
- Tenant ID in script tag (public, but harmless)
- API calls authenticated server-side
- CORS configured to allow customer domains

### Rate Limiting

**Per Tenant:**
```typescript
// packages/worker/src/middleware/rateLimit.ts
export async function checkRateLimit(
  tenantId: string,
  env: Env
): Promise<boolean> {
  const key = `ratelimit:${tenantId}:${getHour()}`;
  const count = await env.KV.get(key);
  
  const limit = await getTenantLimit(tenantId, env);
  
  if (parseInt(count || '0') >= limit) {
    return false; // Rate limit exceeded
  }
  
  await env.KV.put(key, (parseInt(count || '0') + 1).toString(), {
    expirationTtl: 3600 // 1 hour
  });
  
  return true;
}
```

### CORS Configuration

**Allow customer domains:**
```typescript
// packages/worker/src/middleware/cors.ts
export function setCorsHeaders(
  response: Response,
  request: Request,
  tenantConfig: TenantConfig
): Response {
  const origin = request.headers.get('Origin');
  
  // Allow tenant's domain
  if (origin && origin.includes(tenantConfig.domain)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}
```

---

## 📊 COMPARISON TABLE

| Feature | Custom Domain | Widget Script |
|---------|--------------|---------------|
| **Setup Time** | 5-10 minutes (DNS) | 1 minute (copy/paste) |
| **Customer URL** | Their domain | Their site + widget |
| **Branding** | Full white-label | Customisable colors/theme |
| **SSL** | Automatic | Inherited from customer |
| **Updates** | Instant (we deploy) | Instant (CDN cache) |
| **Best For** | Premium customers, full tools | Quick integration, trials |
| **Cost** | Higher (dedicated domain) | Lower (shared infrastructure) |
| **Maintenance** | We manage DNS | Customer manages script |

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Multi-Tenancy Foundation
- [ ] Create tenant detection middleware
- [ ] Build tenant config storage (KV)
- [ ] Implement frontend tenant detection
- [ ] Add tenant API endpoints
- [ ] Test with multiple tenants

### Phase 2: Custom Domain Support
- [ ] Document Cloudflare Pages custom domain setup
- [ ] Create tenant onboarding script
- [ ] Build customer setup guide
- [ ] Test domain verification flow
- [ ] Implement SSL monitoring

### Phase 3: Widget Script
- [ ] Build widget JavaScript loader
- [ ] Create widget HTML page
- [ ] Implement PostMessage communication
- [ ] Add floating/inline modes
- [ ] Build widget customisation options
- [ ] Host on CDN (Cloudflare Pages)

### Phase 4: Dashboard Integration
- [ ] Add "Get Embed Code" to agent cards
- [ ] Build widget script generator
- [ ] Add copy-to-clipboard functionality
- [ ] Create widget preview
- [ ] Add customisation UI

### Phase 5: Documentation
- [ ] Customer setup guides (both methods)
- [ ] Developer documentation
- [ ] Troubleshooting guides
- [ ] Video tutorials

---

## 📞 SUPPORT

**For Custom Domain Issues:**
- DNS propagation: 1-48 hours (usually 5 minutes)
- SSL certificate: Automatic (1-5 minutes)
- Verification: Check Cloudflare dashboard

**For Widget Script Issues:**
- Check browser console for errors
- Verify tenant ID is correct
- Ensure script is before `</body>`
- Check CORS configuration

---

**Next Steps:** See `SAAS_DELIVERY_BUILD_PLAN.md` for implementation timeline and tasks.

