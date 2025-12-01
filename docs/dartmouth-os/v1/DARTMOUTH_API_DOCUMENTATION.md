# 📡 DARTMOUTH API DOCUMENTATION
## Complete API Reference for Agent Integration

**Version:** 1.0.0  
**Date:** November 19, 2024  
**Base URL:** `https://agent-army-worker.dartmouth.workers.dev/api/v1`

---

## 📖 TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Analytics API](#analytics-api)
3. [Cache API](#cache-api)
4. [Security API](#security-api)
5. [Integration API](#integration-api)
6. [Event API](#event-api)
7. [Language API](#language-api)
8. [Cost Management API](#cost-management-api)
9. [Health & SLA API](#health--sla-api)
10. [Formatting API](#formatting-api)
11. [Error Handling](#error-handling)
12. [Rate Limits](#rate-limits)
13. [SDK Examples](#sdk-examples)

---

## 🔐 **AUTHENTICATION**

### **API Key Authentication**

Include API key in request header:

```http
Authorization: Bearer sk-dartmouth-abc123xyz...
```

### **JWT Authentication**

For user-specific requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Request Headers**

```http
Content-Type: application/json
Authorization: Bearer {token}
X-Agent-ID: fam (optional, for agent-specific requests)
X-Request-ID: {uuid} (optional, for request tracking)
```

---

## 📊 **ANALYTICS API**

### **Track Event**

Record an analytics event.

**Endpoint:** `POST /analytics/track`

**Request:**
```json
{
  "event": "message_sent",
  "agentId": "fam",
  "userId": "user-123",
  "sessionId": "session-456",
  "timestamp": 1700395200000,
  "metadata": {
    "intent": "greeting",
    "responseTime": 245,
    "llmModel": "gpt-4o-mini"
  }
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "evt-789"
}
```

**TypeScript:**
```typescript
await dartmouth.analytics.track({
  event: 'message_sent',
  agentId: 'fam',
  userId: 'user-123',
  metadata: { intent: 'greeting', responseTime: 245 }
});
```

---

### **Get Metrics**

Retrieve analytics metrics for an agent.

**Endpoint:** `GET /analytics/metrics/{agentId}`

**Query Parameters:**
- `timeRange` - `1h`, `24h`, `7d`, `30d`, `custom`
- `startDate` - ISO 8601 timestamp (if timeRange=custom)
- `endDate` - ISO 8601 timestamp (if timeRange=custom)
- `metrics` - Comma-separated list: `avgResponseTime,totalConversations,errorRate`

**Example:**
```http
GET /analytics/metrics/fam?timeRange=24h&metrics=avgResponseTime,totalConversations
```

**Response:**
```json
{
  "agentId": "fam",
  "timeRange": "24h",
  "metrics": {
    "avgResponseTime": 342,
    "totalConversations": 156,
    "totalMessages": 842,
    "errorRate": 0.5,
    "cacheHitRate": 62.3,
    "avgSatisfaction": 4.2
  },
  "timestamp": "2024-11-19T10:00:00Z"
}
```

**TypeScript:**
```typescript
const metrics = await dartmouth.analytics.getMetrics({
  agentId: 'fam',
  timeRange: '24h',
  metrics: ['avgResponseTime', 'totalConversations']
});
```

---

### **Generate Insights**

Get AI-powered insights about agent performance.

**Endpoint:** `GET /analytics/insights/{agentId}`

**Query Parameters:**
- `timeRange` - `7d`, `30d`, `90d`

**Response:**
```json
{
  "agentId": "fam",
  "insights": [
    {
      "type": "opportunity",
      "title": "High cache miss rate",
      "description": "37% of queries are not cached. Consider warming cache for common queries.",
      "impact": "high",
      "potentialSavings": "$45/month"
    },
    {
      "type": "success",
      "title": "Excellent response times",
      "description": "95th percentile response time is 512ms, well within SLA.",
      "impact": "positive"
    }
  ],
  "recommendations": [
    "Implement cache warming for top 100 queries",
    "Consider upgrading to GPT-4 for complex queries"
  ]
}
```

---

## 🚀 **CACHE API**

### **Get from Cache**

Retrieve a value from cache (checks all layers).

**Endpoint:** `GET /cache/{key}`

**Headers:**
- `X-Cache-Layer` - `cdn`, `kv`, `d1`, `all` (default: `all`)

**Response:**
```json
{
  "found": true,
  "value": "Hello! How can I help you today?",
  "layer": "kv",
  "ttl": 2847,
  "age": 153
}
```

**TypeScript:**
```typescript
const cached = await dartmouth.cache.get('llm:response:abc123');
if (cached) {
  return cached.value; // Skip expensive operation
}
```

---

### **Set Cache**

Store a value in cache.

**Endpoint:** `PUT /cache/{key}`

**Request:**
```json
{
  "value": "Hello! How can I help you today?",
  "ttl": 3600,
  "layer": "kv"
}
```

**Response:**
```json
{
  "success": true,
  "key": "llm:response:abc123",
  "expiresAt": "2024-11-19T11:00:00Z"
}
```

**TypeScript:**
```typescript
await dartmouth.cache.set('llm:response:abc123', response, {
  ttl: 3600,
  layer: 'kv'
});
```

---

### **Invalidate Cache**

Clear cached values by pattern.

**Endpoint:** `DELETE /cache/{pattern}`

**Example:**
```http
DELETE /cache/llm:response:*
```

**Response:**
```json
{
  "success": true,
  "keysDeleted": 42
}
```

---

### **Cache Stats**

Get cache performance statistics.

**Endpoint:** `GET /cache/stats`

**Query Parameters:**
- `agentId` - Filter by agent
- `timeRange` - `1h`, `24h`, `7d`

**Response:**
```json
{
  "hitRate": 0.623,
  "missRate": 0.377,
  "totalRequests": 1542,
  "hits": 960,
  "misses": 582,
  "avgHitTime": 8,
  "avgMissTime": 342,
  "estimatedSavings": "$45.23",
  "byLayer": {
    "cdn": { hits: 420, rate: 0.272 },
    "kv": { hits: 380, rate: 0.246 },
    "d1": { hits: 160, rate: 0.104 }
  }
}
```

---

## 🛡️ **SECURITY API**

### **Scan Content**

Comprehensive security scan of content.

**Endpoint:** `POST /security/scan`

**Request:**
```json
{
  "content": "Contact me at john@example.com or 555-1234",
  "checks": ["pii", "toxicity", "profanity"]
}
```

**Response:**
```json
{
  "safe": false,
  "violations": ["pii_detected"],
  "details": {
    "pii": {
      "found": true,
      "types": ["email", "phone"],
      "locations": [
        { "type": "email", "value": "john@example.com", "position": 14 },
        { "type": "phone", "value": "555-1234", "position": 35 }
      ],
      "redacted": "Contact me at [EMAIL_REDACTED] or [PHONE_REDACTED]"
    },
    "toxicity": {
      "detected": false,
      "score": 0.02
    },
    "profanity": {
      "detected": false
    }
  },
  "recommendation": "redact_pii"
}
```

**TypeScript:**
```typescript
const scan = await dartmouth.security.scanContent(userMessage);
if (!scan.safe) {
  if (scan.violations.includes('pii_detected')) {
    return scan.details.pii.redacted; // Use redacted version
  }
  return dartmouth.security.getBlockedResponse();
}
```

---

### **Detect PII**

Detect personally identifiable information.

**Endpoint:** `POST /security/detect-pii`

**Request:**
```json
{
  "content": "My email is john@example.com and SSN is 123-45-6789"
}
```

**Response:**
```json
{
  "found": true,
  "types": ["email", "ssn"],
  "entities": [
    {
      "type": "email",
      "value": "john@example.com",
      "confidence": 1.0,
      "position": 12
    },
    {
      "type": "ssn",
      "value": "123-45-6789",
      "confidence": 0.98,
      "position": 39
    }
  ],
  "redacted": "My email is [EMAIL] and SSN is [SSN]",
  "risk": "high"
}
```

---

### **Check Toxicity**

Detect toxic, harmful, or hateful content.

**Endpoint:** `POST /security/check-toxicity`

**Request:**
```json
{
  "content": "You're an idiot and this is terrible!"
}
```

**Response:**
```json
{
  "toxic": true,
  "score": 0.87,
  "categories": {
    "insult": 0.92,
    "profanity": 0.15,
    "hate_speech": 0.08,
    "threat": 0.02
  },
  "severity": "high",
  "recommendation": "block"
}
```

---

## 🔌 **INTEGRATION API**

### **CRM - Create Contact**

Create a contact in CRM system.

**Endpoint:** `POST /integrations/crm/{provider}/contacts`

**Providers:** `hubspot`, `salesforce`, `pipedrive`, `zoho`

**Request:**
```json
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "customFields": {
    "source": "chat_widget",
    "interested_in": "artwork_analysis"
  }
}
```

**Response:**
```json
{
  "success": true,
  "contactId": "12345",
  "provider": "hubspot",
  "url": "https://app.hubspot.com/contacts/12345"
}
```

**TypeScript:**
```typescript
await dartmouth.integrations.crm.createContact({
  provider: 'hubspot',
  data: {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    customFields: { source: 'chat_widget' }
  }
});
```

---

### **Email - Send**

Send an email via email provider.

**Endpoint:** `POST /integrations/email/send`

**Request:**
```json
{
  "provider": "sendgrid",
  "to": "john@example.com",
  "from": "noreply@mccarthy.ai",
  "subject": "Your Artwork Analysis is Ready",
  "body": "Hi John,\n\nYour artwork analysis is complete...",
  "html": "<p>Hi John,</p><p>Your artwork analysis is complete...</p>",
  "attachments": [
    {
      "filename": "analysis.pdf",
      "content": "base64-encoded-content",
      "type": "application/pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg-abc123",
  "provider": "sendgrid"
}
```

---

### **Webhook - Call**

Call a custom webhook.

**Endpoint:** `POST /integrations/webhooks/call`

**Request:**
```json
{
  "url": "https://api.example.com/callback",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer secret-token",
    "Content-Type": "application/json"
  },
  "body": {
    "event": "conversation_complete",
    "userId": "user-123",
    "agentId": "fam",
    "satisfaction": 5
  },
  "retry": {
    "enabled": true,
    "maxAttempts": 3,
    "backoff": "exponential"
  }
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "response": {
    "received": true,
    "id": "webhook-789"
  },
  "duration": 142
}
```

---

## 🔔 **EVENT API**

### **Publish Event**

Publish an event to the event bus.

**Endpoint:** `POST /events/publish`

**Request:**
```json
{
  "event": "agent:escalate",
  "data": {
    "agentId": "fam",
    "userId": "user-123",
    "reason": "critical_frustration",
    "urgency": "high",
    "context": {
      "conversationLength": 15,
      "lastMessage": "This is fucking useless!"
    }
  },
  "timestamp": 1700395200000
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "evt-abc123",
  "publishedAt": "2024-11-19T10:00:00Z",
  "subscribers": 3
}
```

**TypeScript:**
```typescript
await dartmouth.events.publish('agent:escalate', {
  agentId: 'fam',
  userId: 'user-123',
  reason: 'critical_frustration',
  urgency: 'high'
});
```

---

### **Subscribe to Events**

Subscribe to events matching a pattern.

**Endpoint:** `GET /events/subscribe/{pattern}`

**WebSocket Connection:**
```javascript
const ws = new WebSocket('wss://agent-army-worker.dartmouth.workers.dev/events/subscribe/agent:*');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event received:', data);
};
```

**Event Stream (SSE):**
```http
GET /events/subscribe/agent:*
Accept: text/event-stream
```

**Response (Stream):**
```
event: agent:escalate
data: {"agentId":"fam","userId":"user-123","reason":"critical_frustration"}

event: agent:error
data: {"agentId":"artwork","error":"LLM timeout"}
```

---

## 🌍 **LANGUAGE API**

### **Detect Language**

Auto-detect the language of text.

**Endpoint:** `POST /language/detect`

**Request:**
```json
{
  "text": "Bonjour, comment ça va?"
}
```

**Response:**
```json
{
  "language": "fr",
  "name": "French",
  "confidence": 0.98,
  "alternatives": [
    { "language": "es", "confidence": 0.12 }
  ]
}
```

**TypeScript:**
```typescript
const detected = await dartmouth.language.detect(userMessage);
if (detected.language !== 'en') {
  // Translate to English for processing
  const translated = await dartmouth.language.translate({
    text: userMessage,
    from: detected.language,
    to: 'en'
  });
}
```

---

### **Translate**

Translate text between languages.

**Endpoint:** `POST /language/translate`

**Request:**
```json
{
  "text": "Hello, how can I help you?",
  "from": "en",
  "to": "es"
}
```

**Response:**
```json
{
  "translated": "¡Hola! ¿Cómo puedo ayudarte?",
  "from": "en",
  "to": "es",
  "provider": "google_translate",
  "confidence": 0.95
}
```

---

### **Format Locale**

Format numbers, dates, currency for a locale.

**Endpoint:** `POST /language/format-locale`

**Request:**
```json
{
  "locale": "de-DE",
  "data": {
    "number": 1234.56,
    "date": 1700395200000,
    "currency": { "amount": 99.99, "code": "EUR" }
  }
}
```

**Response:**
```json
{
  "formatted": {
    "number": "1.234,56",
    "date": "19.11.2024",
    "currency": "99,99 €"
  },
  "locale": "de-DE"
}
```

---

## 💰 **COST MANAGEMENT API**

### **Get Current Costs**

Get real-time cost information.

**Endpoint:** `GET /costs/current`

**Response:**
```json
{
  "today": {
    "llm": 12.50,
    "infrastructure": 1.25,
    "integrations": 0.50,
    "total": 14.25
  },
  "month": {
    "llm": 245.00,
    "infrastructure": 28.50,
    "integrations": 15.00,
    "total": 288.50
  },
  "projected": {
    "month": 425.00,
    "trend": "up",
    "percentChange": 12.5
  },
  "budget": {
    "daily": 50,
    "monthly": 1000,
    "remaining": 711.50,
    "percentUsed": 28.85
  }
}
```

---

### **Get Cost Breakdown**

Detailed cost breakdown by service.

**Endpoint:** `GET /costs/breakdown`

**Query Parameters:**
- `timeRange` - `24h`, `7d`, `30d`, `90d`
- `groupBy` - `service`, `agent`, `user`

**Response:**
```json
{
  "timeRange": "30d",
  "total": 288.50,
  "byService": {
    "llm": {
      "openai": 245.00,
      "anthropic": 0
    },
    "infrastructure": {
      "workers": 5.00,
      "d1": 0,
      "kv": 1.50,
      "r2": 2.00,
      "vectorize": 0
    },
    "integrations": {
      "sendgrid": 0,
      "hubspot": 15.00
    }
  },
  "byAgent": {
    "fam": 120.00,
    "mccarthy-artwork": 168.50
  },
  "topExpenses": [
    { "item": "OpenAI GPT-4o-mini", "cost": 245.00, "percent": 84.9 },
    { "item": "HubSpot API", "cost": 15.00, "percent": 5.2 }
  ]
}
```

---

### **Set Budget**

Configure budget limits and alerts.

**Endpoint:** `POST /costs/budget`

**Request:**
```json
{
  "daily": 50,
  "monthly": 1000,
  "alertThresholds": [0.5, 0.8, 0.95],
  "alertChannels": ["email", "slack"],
  "autoActions": {
    "at90Percent": "enable_cost_saving_mode",
    "at100Percent": "pause_non_critical_agents"
  }
}
```

**Response:**
```json
{
  "success": true,
  "budget": {
    "daily": 50,
    "monthly": 1000,
    "alertsConfigured": 3
  }
}
```

---

## 🏥 **HEALTH & SLA API**

### **Heartbeat**

Send agent heartbeat (keep-alive).

**Endpoint:** `POST /health/heartbeat/{agentId}`

**Request:**
```json
{
  "status": "healthy",
  "metrics": {
    "cpuUsage": 12.5,
    "memoryUsage": 45.2,
    "activeConnections": 8
  }
}
```

**Response:**
```json
{
  "acknowledged": true,
  "nextHeartbeatDue": "2024-11-19T10:01:00Z"
}
```

---

### **Get Agent Status**

Get current agent health status.

**Endpoint:** `GET /health/status/{agentId}`

**Response:**
```json
{
  "agentId": "fam",
  "status": "healthy",
  "uptime": 0.9995,
  "lastHeartbeat": "2024-11-19T10:00:30Z",
  "metrics": {
    "avgResponseTime": 342,
    "errorRate": 0.5,
    "requestsPerMinute": 12
  },
  "dependencies": {
    "llmService": "healthy",
    "database": "healthy",
    "cache": "healthy"
  }
}
```

---

### **Record Response Time**

Record a response time for SLA tracking.

**Endpoint:** `POST /sla/record-response-time`

**Request:**
```json
{
  "agentId": "fam",
  "duration": 342,
  "success": true,
  "endpoint": "/chat"
}
```

**Response:**
```json
{
  "recorded": true,
  "slaStatus": "within_limits",
  "percentile": "p95"
}
```

---

### **Get SLA Compliance**

Check SLA compliance for time period.

**Endpoint:** `GET /sla/compliance`

**Query Parameters:**
- `agentId` - Filter by agent
- `timeRange` - `24h`, `7d`, `30d`

**Response:**
```json
{
  "compliant": true,
  "timeRange": "30d",
  "metrics": {
    "availability": 99.95,
    "p50ResponseTime": 298,
    "p95ResponseTime": 512,
    "p99ResponseTime": 1245,
    "errorRate": 0.5,
    "successRate": 99.5
  },
  "violations": [],
  "trend": "improving"
}
```

---

## 🎨 **FORMATTING API**

### **Format as Markdown**

Convert plain text to formatted Markdown.

**Endpoint:** `POST /formatting/to-markdown`

**Request:**
```json
{
  "text": "Here are your print sizes:\n1. 10x15cm at 300 DPI\n2. 20x30cm at 200 DPI",
  "options": {
    "addEmojis": true,
    "boldHeaders": true
  }
}
```

**Response:**
```json
{
  "formatted": "📐 **Here are your print sizes:**\n\n1. 10x15cm at 300 DPI\n2. 20x30cm at 200 DPI",
  "hasChanges": true
}
```

---

### **Create Buttons**

Create interactive button elements.

**Endpoint:** `POST /formatting/create-buttons`

**Request:**
```json
{
  "buttons": [
    {
      "label": "Yes, continue",
      "action": "confirm_order",
      "style": "primary",
      "data": { "orderId": "12345" }
    },
    {
      "label": "No, cancel",
      "action": "cancel_order",
      "style": "secondary"
    }
  ]
}
```

**Response:**
```json
{
  "html": "<div class='button-group'><button class='btn-primary' data-action='confirm_order'>Yes, continue</button><button class='btn-secondary' data-action='cancel_order'>No, cancel</button></div>",
  "markdown": "[Yes, continue](action:confirm_order) | [No, cancel](action:cancel_order)",
  "json": [...]
}
```

---

### **Create Table**

Create a formatted table.

**Endpoint:** `POST /formatting/create-table`

**Request:**
```json
{
  "headers": ["Size", "DPI", "Quality"],
  "rows": [
    ["10x15cm", "300", "Excellent"],
    ["20x30cm", "200", "Good"],
    ["30x45cm", "150", "Acceptable"]
  ],
  "format": "markdown"
}
```

**Response:**
```json
{
  "formatted": "| Size | DPI | Quality |\n|------|-----|----------|\n| 10x15cm | 300 | Excellent |\n| 20x30cm | 200 | Good |\n| 30x45cm | 150 | Acceptable |",
  "html": "<table>...</table>"
}
```

---

## ❌ **ERROR HANDLING**

### **Error Response Format**

All errors follow this format:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again in 60 seconds.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2024-11-19T10:01:00Z"
    },
    "requestId": "req-abc123"
  },
  "timestamp": "2024-11-19T10:00:00Z"
}
```

### **Error Codes**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `GATEWAY_TIMEOUT` | 504 | Upstream service timeout |

### **Retry Strategy**

For 5xx errors and 429 (rate limit):

```typescript
async function retryWithBackoff(fn: Function, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status >= 500 || error.status === 429) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Don't retry client errors
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## ⚡ **RATE LIMITS**

### **Default Limits**

| Tier | Requests/Min | Requests/Hour | Requests/Day |
|------|--------------|---------------|--------------|
| Free | 20 | 1,000 | 10,000 |
| Basic | 100 | 5,000 | 50,000 |
| Pro | 1,000 | 50,000 | 500,000 |
| Enterprise | Custom | Custom | Custom |

### **Rate Limit Headers**

Every response includes rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700395260
```

### **Exceeding Limits**

When limit exceeded:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2024-11-19T10:01:00Z"
    }
  }
}
```

---

## 💻 **SDK EXAMPLES**

### **TypeScript SDK**

```typescript
import { DartmouthSDK } from '@dartmouth/sdk';

const dartmouth = new DartmouthSDK({
  apiKey: 'sk-dartmouth-abc123',
  baseUrl: 'https://agent-army-worker.dartmouth.workers.dev/api/v1'
});

// Analytics
await dartmouth.analytics.track({
  event: 'message_sent',
  agentId: 'fam',
  metadata: { intent: 'greeting' }
});

const metrics = await dartmouth.analytics.getMetrics('fam', '24h');

// Cache
const cached = await dartmouth.cache.get('key');
await dartmouth.cache.set('key', value, { ttl: 3600 });

// Security
const scan = await dartmouth.security.scanContent(message);
if (!scan.safe) {
  // Handle unsafe content
}

// Integrations
await dartmouth.integrations.crm.createContact({
  provider: 'hubspot',
  data: { email: 'user@example.com', name: 'John Doe' }
});

// Events
await dartmouth.events.publish('agent:escalate', { agentId: 'fam' });

dartmouth.events.subscribe('agent:*', (event) => {
  console.log('Event:', event);
});

// Language
const detected = await dartmouth.language.detect(message);
const translated = await dartmouth.language.translate({
  text: message,
  from: 'en',
  to: 'es'
});

// Costs
const costs = await dartmouth.costs.getCurrent();
await dartmouth.costs.setBudget({ daily: 50, monthly: 1000 });

// Health & SLA
await dartmouth.health.heartbeat('fam');
const status = await dartmouth.health.getStatus('fam');
const compliance = await dartmouth.sla.getCompliance('30d');
```

### **Python SDK**

```python
from dartmouth import DartmouthSDK

dartmouth = DartmouthSDK(
    api_key='sk-dartmouth-abc123',
    base_url='https://agent-army-worker.dartmouth.workers.dev/api/v1'
)

# Analytics
dartmouth.analytics.track(
    event='message_sent',
    agent_id='fam',
    metadata={'intent': 'greeting'}
)

metrics = dartmouth.analytics.get_metrics('fam', '24h')

# Cache
cached = dartmouth.cache.get('key')
dartmouth.cache.set('key', value, ttl=3600)

# Security
scan = dartmouth.security.scan_content(message)
if not scan['safe']:
    # Handle unsafe content
    pass

# Integrations
dartmouth.integrations.crm.create_contact(
    provider='hubspot',
    data={'email': 'user@example.com', 'name': 'John Doe'}
)

# Events
dartmouth.events.publish('agent:escalate', {'agent_id': 'fam'})

@dartmouth.events.subscribe('agent:*')
def on_agent_event(event):
    print(f'Event: {event}')

# Language
detected = dartmouth.language.detect(message)
translated = dartmouth.language.translate(
    text=message,
    from_lang='en',
    to_lang='es'
)

# Costs
costs = dartmouth.costs.get_current()
dartmouth.costs.set_budget(daily=50, monthly=1000)

# Health & SLA
dartmouth.health.heartbeat('fam')
status = dartmouth.health.get_status('fam')
compliance = dartmouth.sla.get_compliance('30d')
```

### **cURL Examples**

```bash
# Track event
curl -X POST https://agent-army-worker.dartmouth.workers.dev/api/v1/analytics/track \
  -H "Authorization: Bearer sk-dartmouth-abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message_sent",
    "agentId": "fam",
    "metadata": {"intent": "greeting"}
  }'

# Get metrics
curl -X GET "https://agent-army-worker.dartmouth.workers.dev/api/v1/analytics/metrics/fam?timeRange=24h" \
  -H "Authorization: Bearer sk-dartmouth-abc123"

# Get from cache
curl -X GET https://agent-army-worker.dartmouth.workers.dev/api/v1/cache/llm:response:abc123 \
  -H "Authorization: Bearer sk-dartmouth-abc123"

# Scan content
curl -X POST https://agent-army-worker.dartmouth.workers.dev/api/v1/security/scan \
  -H "Authorization: Bearer sk-dartmouth-abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Contact me at john@example.com",
    "checks": ["pii", "toxicity"]
  }'

# Create CRM contact
curl -X POST https://agent-army-worker.dartmouth.workers.dev/api/v1/integrations/crm/hubspot/contacts \
  -H "Authorization: Bearer sk-dartmouth-abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

## 📚 **ADDITIONAL RESOURCES**

- **Full Dartmouth OS Spec:** `DARTMOUTH_OS_COMPLETE_SPECIFICATION.md`
- **Tech Stack & Costs:** `DARTMOUTH_LEAN_MVP_TECH_STACK.md`
- **Cost Optimization:** `COST_OPTIMIZATION_GUIDE.md`
- **FAM Agent Spec:** `FAM_COMPLETE_SPECIFICATION.md`

---

## 📞 **SUPPORT**

- **Documentation:** https://docs.dartmouth.ai
- **API Status:** https://status.dartmouth.ai
- **Email:** support@dartmouth.ai
- **Discord:** https://discord.gg/dartmouth

---

**This API enables agents to leverage the full power of Dartmouth OS!** 🚀

