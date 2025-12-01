# Dartmouth OS V2.0 - Complete API Documentation

**Version:** 2.0.0  
**Date:** November 19, 2024  
**Base URL:** `https://api.dartmouth-os.com/api/v2`  
**Status:** Active Development  
**Purpose:** Agent-agnostic API for all Dartmouth OS services

---

## 📋 Table of Contents

### **Core Platform**
1. [Authentication & Authorization](#1-authentication--authorization)
2. [Agent Management](#2-agent-management)
3. [Health & Monitoring](#3-health--monitoring)
4. [Analytics & Metrics](#4-analytics--metrics)
5. [Caching & Performance](#5-caching--performance)
6. [Security & Compliance](#6-security--compliance)

### **Communication & Integration**
7. [Webhooks & Events](#7-webhooks--events)
8. [External Integrations](#8-external-integrations)
9. [Notifications](#9-notifications)

### **Intelligence & Learning**
10. [LLM Services](#10-llm-services)
11. [RAG (Knowledge Base)](#11-rag-knowledge-base)
12. [Sentiment Analysis](#12-sentiment-analysis)
13. [Intent Detection](#13-intent-detection)

### **Voice & Audio (Layer 7)**
14. [Speech-to-Text (STT)](#14-speech-to-text-stt)
15. [Text-to-Speech (TTS)](#15-text-to-speech-tts)
16. [Audio Streaming](#16-audio-streaming)
17. [Voice Activity Detection (VAD)](#17-voice-activity-detection-vad)
18. [Audio Processing](#18-audio-processing)

### **Multi-Modal Intelligence (Layer 8)**
19. [Vision-Language Models](#19-vision-language-models)
20. [Document Intelligence](#20-document-intelligence)
21. [Audio Analysis](#21-audio-analysis)
22. [Multi-Modal Context](#22-multi-modal-context)

### **Orchestration & Workflows (Layer 9)**
23. [Agent-to-Agent Communication](#23-agent-to-agent-communication)
24. [Workflow Engine](#24-workflow-engine)
25. [Agent Registry](#25-agent-registry)
26. [Swarm Coordination](#26-swarm-coordination)
27. [Cross-Agent Memory](#27-cross-agent-memory)

### **Utilities**
28. [File Storage](#28-file-storage)
29. [Database Operations](#29-database-operations)
30. [Rate Limiting](#30-rate-limiting)
31. [Error Handling](#31-error-handling)
32. [WebSocket Protocol](#32-websocket-protocol)

---

## 🔐 1. Authentication & Authorization

### **POST /auth/register**

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "metadata": {
    "timezone": "America/New_York",
    "language": "en-US"
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": 1700000000000,
    "emailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Error Codes:**
- `400` - Invalid email or password
- `409` - Email already exists

---

### **POST /auth/login**

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Error Codes:**
- `401` - Invalid credentials
- `403` - Account locked or disabled

---

### **POST /auth/refresh**

Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Error Codes:**
- `401` - Invalid or expired refresh token

---

### **POST /auth/logout**

Logout and invalidate tokens.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true
}
```

---

### **GET /auth/me**

Get current user information.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["user"],
  "permissions": ["read:own", "write:own"],
  "metadata": {
    "timezone": "America/New_York",
    "language": "en-US"
  },
  "createdAt": 1700000000000,
  "updatedAt": 1700000000000
}
```

---

### **POST /auth/verify-email**

Verify email address.

**Request:**
```json
{
  "token": "email_verification_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### **POST /auth/forgot-password**

Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### **POST /auth/reset-password**

Reset password with token.

**Request:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### **POST /auth/change-password**

Change password (authenticated).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🤖 2. Agent Management

### **GET /agents**

List all available agents.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `category` (optional): Filter by category (`personal-assistant`, `customer-service`, `creative`, etc.)
- `status` (optional): Filter by status (`active`, `inactive`, `maintenance`)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "agents": [
    {
      "id": "mccarthy-pa",
      "name": "McCarthy PA",
      "description": "Voice + Text AI Personal Assistant",
      "category": "personal-assistant",
      "status": "active",
      "capabilities": ["voice", "text", "tasks", "reminders", "calendar"],
      "version": "8.0.0",
      "endpoint": "/agents/mccarthy-pa",
      "pricing": {
        "model": "usage-based",
        "basePrice": 0,
        "perRequest": 0.001
      }
    },
    {
      "id": "mccarthy-artwork",
      "name": "McCarthy Artwork Analyzer",
      "description": "DPI calculations & print preparation",
      "category": "creative",
      "status": "active",
      "capabilities": ["dpi-calculation", "print-analysis", "artwork-optimization"],
      "version": "1.5.0",
      "endpoint": "/agents/mccarthy-artwork"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

---

### **GET /agents/:agentId**

Get agent details.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "mccarthy-pa",
  "name": "McCarthy PA",
  "description": "Voice + Text AI Personal Assistant",
  "category": "personal-assistant",
  "status": "active",
  "capabilities": ["voice", "text", "tasks", "reminders", "calendar"],
  "version": "8.0.0",
  "endpoint": "/agents/mccarthy-pa",
  "documentation": "https://docs.dartmouth-os.com/agents/mccarthy-pa",
  "pricing": {
    "model": "usage-based",
    "basePrice": 0,
    "perRequest": 0.001
  },
  "limits": {
    "requestsPerMinute": 100,
    "requestsPerDay": 10000
  },
  "createdAt": 1700000000000,
  "updatedAt": 1700000000000
}
```

---

### **POST /agents/:agentId/chat**

Send a message to an agent (text).

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "message": "What's on my calendar today?",
  "sessionId": "sess_abc123",
  "context": {
    "timezone": "America/New_York",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "deviceType": "mobile"
  },
  "options": {
    "stream": false,
    "includeMetadata": true
  }
}
```

**Response:**
```json
{
  "response": "You have 3 events today: Team meeting at 10am, Lunch with Sarah at 12pm, and Project review at 3pm.",
  "intent": "query_calendar",
  "entities": {
    "timeframe": "today"
  },
  "confidence": 0.95,
  "sessionId": "sess_abc123",
  "metadata": {
    "processingTime": 245,
    "tokensUsed": 150,
    "cacheHit": false
  }
}
```

---

### **POST /agents/:agentId/voice**

Send voice input to an agent.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: audio/webm
```

**Request:**
```
<audio binary data>
```

**Response:**
```json
{
  "transcript": "What's on my calendar today?",
  "response": "You have 3 events today: Team meeting at 10am, Lunch with Sarah at 12pm, and Project review at 3pm.",
  "audioUrl": "https://r2.dartmouth-os.com/audio/response_abc123.wav",
  "intent": "query_calendar",
  "entities": {
    "timeframe": "today"
  },
  "sessionId": "sess_abc123",
  "metadata": {
    "sttProvider": "deepgram",
    "ttsProvider": "f5-tts",
    "sttLatency": 320,
    "ttsLatency": 480,
    "totalLatency": 800
  }
}
```

---

### **POST /agents/:agentId/session**

Create a new conversation session.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "metadata": {
    "deviceType": "mobile",
    "appVersion": "1.0.0"
  }
}
```

**Response:**
```json
{
  "sessionId": "sess_abc123",
  "agentId": "mccarthy-pa",
  "userId": "usr_abc123",
  "createdAt": 1700000000000,
  "expiresAt": 1700086400000
}
```

---

### **GET /agents/:agentId/session/:sessionId**

Get session details and history.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "sessionId": "sess_abc123",
  "agentId": "mccarthy-pa",
  "userId": "usr_abc123",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "What's on my calendar today?",
      "timestamp": 1700000000000
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "You have 3 events today...",
      "timestamp": 1700000001000
    }
  ],
  "metadata": {
    "messageCount": 2,
    "totalTokens": 300
  },
  "createdAt": 1700000000000,
  "updatedAt": 1700000001000
}
```

---

### **DELETE /agents/:agentId/session/:sessionId**

End a session.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "sess_abc123"
}
```

---

## 📊 3. Health & Monitoring

### **GET /health**

Platform health check.

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "uptime": 86400,
  "timestamp": 1700000000000,
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "storage": "healthy",
    "llm": "healthy",
    "voice": "healthy"
  }
}
```

---

### **GET /agents/:agentId/health**

Agent-specific health check.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "agentId": "mccarthy-pa",
  "status": "healthy",
  "version": "8.0.0",
  "uptime": 43200,
  "metrics": {
    "requestsPerMinute": 45,
    "averageLatency": 250,
    "errorRate": 0.01,
    "cacheHitRate": 0.65
  },
  "dependencies": {
    "dartmouth-core": "healthy",
    "voice-services": "healthy",
    "database": "healthy"
  }
}
```

---

### **GET /metrics**

Platform metrics.

**Headers:**
```
Authorization: Bearer {accessToken}
X-Admin-Key: {adminKey}
```

**Query Parameters:**
- `startTime` (optional): Start timestamp
- `endTime` (optional): End timestamp
- `granularity` (optional): `minute`, `hour`, `day` (default: `hour`)

**Response:**
```json
{
  "period": {
    "start": 1700000000000,
    "end": 1700086400000,
    "granularity": "hour"
  },
  "metrics": {
    "totalRequests": 125000,
    "successfulRequests": 123750,
    "failedRequests": 1250,
    "averageLatency": 245,
    "p50Latency": 200,
    "p95Latency": 450,
    "p99Latency": 800,
    "totalTokensUsed": 15000000,
    "totalCost": 45.50,
    "cacheHitRate": 0.62
  },
  "byAgent": {
    "mccarthy-pa": {
      "requests": 85000,
      "latency": 250,
      "cost": 32.00
    },
    "mccarthy-artwork": {
      "requests": 40000,
      "latency": 235,
      "cost": 13.50
    }
  }
}
```

---

### **GET /agents/:agentId/metrics**

Agent-specific metrics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startTime` (optional): Start timestamp
- `endTime` (optional): End timestamp
- `granularity` (optional): `minute`, `hour`, `day` (default: `hour`)

**Response:**
```json
{
  "agentId": "mccarthy-pa",
  "period": {
    "start": 1700000000000,
    "end": 1700086400000
  },
  "metrics": {
    "totalRequests": 85000,
    "successfulRequests": 84150,
    "failedRequests": 850,
    "averageLatency": 250,
    "totalTokensUsed": 10500000,
    "totalCost": 32.00,
    "byIntent": {
      "create_task": 25000,
      "query_calendar": 20000,
      "create_reminder": 15000,
      "general_conversation": 25000
    }
  }
}
```

---

## 📈 4. Analytics & Metrics

### **POST /analytics/events**

Track custom events.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "event": "task_completed",
  "properties": {
    "taskId": "task_abc123",
    "category": "work",
    "completionTime": 3600
  },
  "userId": "usr_abc123",
  "sessionId": "sess_abc123",
  "timestamp": 1700000000000
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "evt_abc123"
}
```

---

### **GET /analytics/usage**

Get usage analytics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startTime` (required): Start timestamp
- `endTime` (required): End timestamp
- `groupBy` (optional): `agent`, `user`, `intent` (default: `agent`)

**Response:**
```json
{
  "period": {
    "start": 1700000000000,
    "end": 1700086400000
  },
  "usage": {
    "totalRequests": 1250,
    "totalTokens": 187500,
    "totalCost": 5.62,
    "byAgent": {
      "mccarthy-pa": {
        "requests": 850,
        "tokens": 127500,
        "cost": 3.82
      },
      "mccarthy-artwork": {
        "requests": 400,
        "tokens": 60000,
        "cost": 1.80
      }
    }
  }
}
```

---

### **GET /analytics/users**

Get user analytics.

**Headers:**
```
Authorization: Bearer {accessToken}
X-Admin-Key: {adminKey}
```

**Response:**
```json
{
  "totalUsers": 5420,
  "activeUsers": {
    "daily": 1250,
    "weekly": 3200,
    "monthly": 4800
  },
  "newUsers": {
    "today": 45,
    "thisWeek": 320,
    "thisMonth": 1200
  },
  "retention": {
    "day1": 0.85,
    "day7": 0.62,
    "day30": 0.45
  }
}
```

---

## 🚀 5. Caching & Performance

### **GET /cache/:key**

Get cached value.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "key": "user:usr_abc123:preferences",
  "value": {
    "theme": "dark",
    "language": "en-US"
  },
  "ttl": 3600,
  "createdAt": 1700000000000
}
```

**Error Codes:**
- `404` - Key not found (cache miss)

---

### **PUT /cache/:key**

Set cached value.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "value": {
    "theme": "dark",
    "language": "en-US"
  },
  "ttl": 3600
}
```

**Response:**
```json
{
  "success": true,
  "key": "user:usr_abc123:preferences",
  "expiresAt": 1700003600000
}
```

---

### **DELETE /cache/:key**

Delete cached value.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "key": "user:usr_abc123:preferences"
}
```

---

### **POST /cache/invalidate**

Invalidate multiple cache keys.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "pattern": "user:usr_abc123:*"
}
```

**Response:**
```json
{
  "success": true,
  "keysInvalidated": 15
}
```

---

## 🔒 6. Security & Compliance

### **POST /security/audit-log**

Log security event.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "event": "password_changed",
  "userId": "usr_abc123",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "success": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "auditId": "audit_abc123"
}
```

---

### **GET /security/audit-log**

Get audit logs.

**Headers:**
```
Authorization: Bearer {accessToken}
X-Admin-Key: {adminKey}
```

**Query Parameters:**
- `userId` (optional): Filter by user
- `event` (optional): Filter by event type
- `startTime` (optional): Start timestamp
- `endTime` (optional): End timestamp
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "logs": [
    {
      "id": "audit_abc123",
      "event": "password_changed",
      "userId": "usr_abc123",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": 1700000000000,
      "metadata": {
        "success": true
      }
    }
  ],
  "total": 1
}
```

---

### **POST /security/encrypt**

Encrypt data.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "data": "sensitive information",
  "algorithm": "AES-256-GCM"
}
```

**Response:**
```json
{
  "encrypted": "base64_encrypted_data_here",
  "iv": "base64_iv_here",
  "tag": "base64_tag_here"
}
```

---

### **POST /security/decrypt**

Decrypt data.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "encrypted": "base64_encrypted_data_here",
  "iv": "base64_iv_here",
  "tag": "base64_tag_here",
  "algorithm": "AES-256-GCM"
}
```

**Response:**
```json
{
  "data": "sensitive information"
}
```

---

## 🔔 7. Webhooks & Events

### **POST /webhooks**

Register a webhook.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["task.created", "reminder.triggered", "session.ended"],
  "secret": "webhook_secret_key",
  "active": true
}
```

**Response:**
```json
{
  "id": "webhook_abc123",
  "url": "https://example.com/webhook",
  "events": ["task.created", "reminder.triggered", "session.ended"],
  "active": true,
  "createdAt": 1700000000000
}
```

---

### **GET /webhooks**

List webhooks.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "webhooks": [
    {
      "id": "webhook_abc123",
      "url": "https://example.com/webhook",
      "events": ["task.created", "reminder.triggered"],
      "active": true,
      "createdAt": 1700000000000
    }
  ],
  "total": 1
}
```

---

### **DELETE /webhooks/:webhookId**

Delete a webhook.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "webhookId": "webhook_abc123"
}
```

---

### **POST /webhooks/:webhookId/test**

Test a webhook.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "responseTime": 245
}
```

---

### **Webhook Payload Format**

When an event occurs, Dartmouth OS sends a POST request to your webhook URL:

**Headers:**
```
Content-Type: application/json
X-Dartmouth-Signature: sha256=...
X-Dartmouth-Event: task.created
```

**Payload:**
```json
{
  "id": "evt_abc123",
  "event": "task.created",
  "timestamp": 1700000000000,
  "data": {
    "taskId": "task_abc123",
    "userId": "usr_abc123",
    "title": "Call John",
    "status": "pending"
  }
}
```

---

### **GET /events/stream**

Server-Sent Events (SSE) stream.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (streaming):**
```
event: task.created
data: {"taskId":"task_abc123","title":"Call John"}

event: reminder.triggered
data: {"reminderId":"reminder_abc123","title":"Meeting in 5 minutes"}
```

---

## 🔗 8. External Integrations

### **GET /integrations**

List available integrations.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "integrations": [
    {
      "id": "google-calendar",
      "name": "Google Calendar",
      "description": "Sync calendar events",
      "status": "available",
      "scopes": ["calendar.read", "calendar.write"]
    },
    {
      "id": "slack",
      "name": "Slack",
      "description": "Send notifications to Slack",
      "status": "available",
      "scopes": ["chat:write", "channels:read"]
    }
  ]
}
```

---

### **POST /integrations/:integrationId/connect**

Connect an integration.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "credentials": {
    "apiKey": "integration_api_key",
    "apiSecret": "integration_api_secret"
  },
  "scopes": ["calendar.read", "calendar.write"]
}
```

**Response:**
```json
{
  "success": true,
  "integrationId": "google-calendar",
  "status": "connected",
  "connectedAt": 1700000000000
}
```

---

### **GET /integrations/:integrationId/status**

Get integration status.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "integrationId": "google-calendar",
  "status": "connected",
  "lastSync": 1700000000000,
  "syncStatus": "success",
  "itemsSynced": 45
}
```

---

### **POST /integrations/:integrationId/sync**

Trigger manual sync.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "syncId": "sync_abc123",
  "status": "in_progress"
}
```

---

### **DELETE /integrations/:integrationId/disconnect**

Disconnect an integration.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "integrationId": "google-calendar",
  "disconnectedAt": 1700000000000
}
```

---

## 📬 9. Notifications

### **POST /notifications/send**

Send a notification.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "userId": "usr_abc123",
  "type": "push",
  "title": "Meeting Reminder",
  "body": "Team meeting starts in 5 minutes",
  "data": {
    "eventId": "event_abc123",
    "deepLink": "/calendar/event_abc123"
  },
  "priority": "high",
  "sound": "default"
}
```

**Response:**
```json
{
  "success": true,
  "notificationId": "notif_abc123",
  "sentAt": 1700000000000
}
```

---

### **GET /notifications**

Get user notifications.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): `unread`, `read`, `all` (default: `all`)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_abc123",
      "type": "push",
      "title": "Meeting Reminder",
      "body": "Team meeting starts in 5 minutes",
      "status": "unread",
      "createdAt": 1700000000000
    }
  ],
  "total": 1,
  "unreadCount": 1
}
```

---

### **PUT /notifications/:notificationId/read**

Mark notification as read.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "notificationId": "notif_abc123"
}
```

---

### **DELETE /notifications/:notificationId**

Delete a notification.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "notificationId": "notif_abc123"
}
```

---

## 🧠 10. LLM Services

### **POST /llm/chat**

Send a message to LLM.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "What's the weather like today?"
    }
  ],
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "maxTokens": 500,
  "stream": false
}
```

**Response:**
```json
{
  "id": "chatcmpl_abc123",
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I don't have access to real-time weather data..."
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 25,
    "completionTokens": 35,
    "totalTokens": 60
  },
  "metadata": {
    "processingTime": 850,
    "cacheHit": false
  }
}
```

---

### **POST /llm/chat/stream**

Stream LLM response.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me a story"
    }
  ],
  "model": "gpt-4o-mini",
  "stream": true
}
```

**Response (streaming):**
```
data: {"id":"chatcmpl_abc123","delta":{"content":"Once"}}

data: {"id":"chatcmpl_abc123","delta":{"content":" upon"}}

data: {"id":"chatcmpl_abc123","delta":{"content":" a"}}

data: [DONE]
```

---

### **POST /llm/embeddings**

Generate embeddings.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "input": "The quick brown fox jumps over the lazy dog",
  "model": "text-embedding-3-small"
}
```

**Response:**
```json
{
  "embeddings": [0.123, -0.456, 0.789, ...],
  "dimensions": 1536,
  "model": "text-embedding-3-small",
  "usage": {
    "totalTokens": 10
  }
}
```

---

## 📚 11. RAG (Knowledge Base)

### **POST /rag/documents**

Add document to knowledge base.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "content": "Dartmouth OS is a platform for building AI agents...",
  "metadata": {
    "title": "Dartmouth OS Overview",
    "category": "documentation",
    "tags": ["platform", "agents", "ai"]
  },
  "agentId": "mccarthy-pa"
}
```

**Response:**
```json
{
  "id": "doc_abc123",
  "status": "indexed",
  "chunks": 5,
  "indexedAt": 1700000000000
}
```

---

### **GET /rag/documents**

List documents in knowledge base.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `agentId` (optional): Filter by agent
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "documents": [
    {
      "id": "doc_abc123",
      "title": "Dartmouth OS Overview",
      "category": "documentation",
      "chunks": 5,
      "indexedAt": 1700000000000
    }
  ],
  "total": 1
}
```

---

### **DELETE /rag/documents/:documentId**

Delete document from knowledge base.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "documentId": "doc_abc123"
}
```

---

### **POST /rag/search**

Search knowledge base.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "query": "How do I create an agent?",
  "agentId": "mccarthy-pa",
  "limit": 5,
  "threshold": 0.7
}
```

**Response:**
```json
{
  "results": [
    {
      "documentId": "doc_abc123",
      "content": "To create an agent, extend the BaseAgent class...",
      "score": 0.92,
      "metadata": {
        "title": "Agent Development Guide",
        "category": "documentation"
      }
    }
  ],
  "total": 1
}
```

---

## 😊 12. Sentiment Analysis

### **POST /sentiment/analyze**

Analyze sentiment of text.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "text": "I'm really frustrated with this service!",
  "language": "en"
}
```

**Response:**
```json
{
  "sentiment": "negative",
  "score": -0.85,
  "emotions": {
    "anger": 0.75,
    "frustration": 0.85,
    "sadness": 0.30,
    "joy": 0.05
  },
  "intensity": "high",
  "confidence": 0.92
}
```

---

### **POST /sentiment/analyze-batch**

Analyze sentiment of multiple texts.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "texts": [
    "I love this product!",
    "This is terrible.",
    "It's okay, I guess."
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "text": "I love this product!",
      "sentiment": "positive",
      "score": 0.95
    },
    {
      "text": "This is terrible.",
      "sentiment": "negative",
      "score": -0.90
    },
    {
      "text": "It's okay, I guess.",
      "sentiment": "neutral",
      "score": 0.10
    }
  ]
}
```

---

## 🎯 13. Intent Detection

### **POST /intent/detect**

Detect intent from text.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "text": "Remind me to call John at 3pm",
  "agentId": "mccarthy-pa",
  "context": {
    "previousIntent": "greeting",
    "conversationLength": 3
  }
}
```

**Response:**
```json
{
  "intent": "create_reminder",
  "confidence": 0.95,
  "entities": {
    "action": "call",
    "contact": "John",
    "time": "15:00"
  },
  "alternativeIntents": [
    {
      "intent": "create_task",
      "confidence": 0.45
    }
  ]
}
```

---

### **POST /intent/train**

Train custom intent model.

**Headers:**
```
Authorization: Bearer {accessToken}
X-Admin-Key: {adminKey}
Content-Type: application/json
```

**Request:**
```json
{
  "agentId": "mccarthy-pa",
  "trainingData": [
    {
      "text": "Set a reminder for tomorrow",
      "intent": "create_reminder"
    },
    {
      "text": "Add task to my list",
      "intent": "create_task"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "modelId": "model_abc123",
  "accuracy": 0.94,
  "trainedAt": 1700000000000
}
```

---

## 🎤 14. Speech-to-Text (STT)

### **POST /voice/stt**

Transcribe audio to text.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: audio/webm
```

**Request:**
```
<audio binary data>
```

**Response:**
```json
{
  "transcript": "What's on my calendar today?",
  "confidence": 0.95,
  "language": "en-US",
  "duration": 2.5,
  "provider": "deepgram",
  "metadata": {
    "processingTime": 320,
    "words": [
      {
        "word": "What's",
        "start": 0.0,
        "end": 0.3,
        "confidence": 0.98
      },
      {
        "word": "on",
        "start": 0.3,
        "end": 0.4,
        "confidence": 0.99
      }
    ]
  }
}
```

---

### **POST /voice/stt/stream**

Stream audio for real-time transcription.

**WebSocket Connection:**
```
wss://api.dartmouth-os.com/api/v2/voice/stt/stream
```

**Connection Headers:**
```
Authorization: Bearer {accessToken}
```

**Client → Server (audio chunks):**
```json
{
  "type": "audio",
  "data": "base64_audio_chunk",
  "format": "webm",
  "sampleRate": 16000
}
```

**Server → Client (transcripts):**
```json
{
  "type": "transcript",
  "text": "What's on my",
  "isFinal": false,
  "confidence": 0.85
}
```

```json
{
  "type": "transcript",
  "text": "What's on my calendar today?",
  "isFinal": true,
  "confidence": 0.95
}
```

---

### **GET /voice/stt/providers**

List available STT providers.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "providers": [
    {
      "id": "deepgram",
      "name": "Deepgram",
      "status": "available",
      "languages": ["en-US", "en-GB", "es-ES", "fr-FR"],
      "features": ["streaming", "punctuation", "diarization"],
      "pricing": {
        "perMinute": 0.0043
      }
    },
    {
      "id": "openai-whisper",
      "name": "OpenAI Whisper",
      "status": "available",
      "languages": ["en", "es", "fr", "de", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh"],
      "features": ["batch", "translation"],
      "pricing": {
        "perMinute": 0.006
      }
    },
    {
      "id": "native",
      "name": "Native (iOS/Android)",
      "status": "available",
      "languages": ["en-US", "en-GB"],
      "features": ["offline"],
      "pricing": {
        "perMinute": 0
      }
    }
  ]
}
```

---

## 🔊 15. Text-to-Speech (TTS)

### **POST /voice/tts**

Convert text to speech.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "text": "Hello! How can I help you today?",
  "voice": "alloy",
  "provider": "f5-tts",
  "speed": 1.0,
  "format": "wav"
}
```

**Response:**
```json
{
  "audioUrl": "https://r2.dartmouth-os.com/audio/tts_abc123.wav",
  "duration": 3.2,
  "provider": "f5-tts",
  "metadata": {
    "processingTime": 480,
    "audioFormat": "wav",
    "sampleRate": 24000,
    "bitrate": 128
  }
}
```

---

### **POST /voice/tts/stream**

Stream TTS audio.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "text": "This is a longer text that will be streamed as audio chunks...",
  "voice": "alloy",
  "provider": "f5-tts"
}
```

**Response (streaming audio chunks):**
```
<audio chunk 1>
<audio chunk 2>
<audio chunk 3>
...
```

---

### **GET /voice/tts/providers**

List available TTS providers.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "providers": [
    {
      "id": "f5-tts",
      "name": "F5-TTS",
      "status": "available",
      "voices": ["default", "emotional", "professional"],
      "languages": ["en-US", "en-GB"],
      "features": ["streaming", "emotional", "high-quality"],
      "pricing": {
        "perMinute": 0.001
      }
    },
    {
      "id": "openai-tts",
      "name": "OpenAI TTS",
      "status": "available",
      "voices": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
      "languages": ["en", "es", "fr", "de", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh"],
      "features": ["high-quality", "multiple-voices"],
      "pricing": {
        "perMinute": 0.015
      }
    },
    {
      "id": "native",
      "name": "Native (iOS/Android)",
      "status": "available",
      "voices": ["default"],
      "languages": ["en-US", "en-GB"],
      "features": ["offline"],
      "pricing": {
        "perMinute": 0
      }
    }
  ]
}
```

---

### **GET /voice/tts/voices**

List available voices for a provider.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `provider` (required): Provider ID

**Response:**
```json
{
  "provider": "f5-tts",
  "voices": [
    {
      "id": "default",
      "name": "Default",
      "gender": "neutral",
      "language": "en-US",
      "description": "Natural, balanced voice"
    },
    {
      "id": "emotional",
      "name": "Emotional",
      "gender": "neutral",
      "language": "en-US",
      "description": "Expressive voice with emotional range"
    }
  ]
}
```

---

## 📡 16. Audio Streaming

### **WebSocket /voice/stream**

Real-time bidirectional voice streaming.

**Connection:**
```
wss://api.dartmouth-os.com/api/v2/voice/stream
```

**Connection Headers:**
```
Authorization: Bearer {accessToken}
```

**Client → Server (audio input):**
```json
{
  "type": "audio_input",
  "data": "base64_audio_chunk",
  "format": "webm",
  "sampleRate": 16000,
  "final": false
}
```

**Server → Client (transcript):**
```json
{
  "type": "transcript",
  "text": "What's on my calendar today?",
  "isFinal": true,
  "confidence": 0.95
}
```

**Server → Client (agent response text):**
```json
{
  "type": "response_text",
  "text": "You have 3 events today: Team meeting at 10am...",
  "intent": "query_calendar"
}
```

**Server → Client (audio output):**
```json
{
  "type": "audio_output",
  "data": "base64_audio_chunk",
  "format": "wav",
  "sampleRate": 24000,
  "final": false
}
```

**Client → Server (interrupt):**
```json
{
  "type": "interrupt",
  "reason": "user_speaking"
}
```

**Server → Client (audio stopped):**
```json
{
  "type": "audio_stopped",
  "reason": "interrupted"
}
```

---

## 🎚️ 17. Voice Activity Detection (VAD)

### **POST /voice/vad**

Detect speech in audio.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: audio/webm
```

**Request:**
```
<audio binary data>
```

**Response:**
```json
{
  "speechDetected": true,
  "confidence": 0.95,
  "segments": [
    {
      "start": 0.5,
      "end": 3.2,
      "confidence": 0.97
    }
  ],
  "duration": 5.0,
  "speechDuration": 2.7,
  "silenceDuration": 2.3
}
```

---

### **POST /voice/vad/stream**

Real-time VAD for streaming audio.

**WebSocket Connection:**
```
wss://api.dartmouth-os.com/api/v2/voice/vad/stream
```

**Client → Server:**
```json
{
  "type": "audio",
  "data": "base64_audio_chunk"
}
```

**Server → Client:**
```json
{
  "type": "vad_result",
  "speechDetected": true,
  "confidence": 0.95,
  "timestamp": 1700000000000
}
```

---

## 🎵 18. Audio Processing

### **POST /voice/audio/enhance**

Enhance audio quality (noise reduction, normalization).

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: audio/webm
```

**Request:**
```
<audio binary data>
```

**Response:**
```json
{
  "audioUrl": "https://r2.dartmouth-os.com/audio/enhanced_abc123.wav",
  "improvements": {
    "noiseReduction": 0.85,
    "volumeNormalized": true,
    "clarityScore": 0.92
  },
  "metadata": {
    "processingTime": 650,
    "originalDuration": 5.0,
    "enhancedDuration": 5.0
  }
}
```

---

### **POST /voice/audio/analyze**

Analyze audio for emotion, tone, energy.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: audio/webm
```

**Request:**
```
<audio binary data>
```

**Response:**
```json
{
  "emotion": {
    "primary": "happy",
    "confidence": 0.85,
    "emotions": {
      "happy": 0.85,
      "neutral": 0.10,
      "sad": 0.05
    }
  },
  "tone": {
    "pitch": "medium",
    "energy": "high",
    "speed": "normal"
  },
  "quality": {
    "clarity": 0.92,
    "noiseLevel": 0.15,
    "volumeLevel": 0.75
  }
}
```

---

### **POST /voice/audio/convert**

Convert audio format.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "audioUrl": "https://example.com/audio.webm",
  "outputFormat": "wav",
  "sampleRate": 24000,
  "bitrate": 128
}
```

**Response:**
```json
{
  "audioUrl": "https://r2.dartmouth-os.com/audio/converted_abc123.wav",
  "format": "wav",
  "sampleRate": 24000,
  "bitrate": 128,
  "duration": 5.0
}
```

---

## 👁️ 19. Vision-Language Models

### **POST /vision/analyze**

Analyze image with vision-language model.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "What's in this image?",
  "model": "qwen2-vl"
}
```

**Response:**
```json
{
  "description": "The image shows a modern office space with desks, computers, and people working...",
  "objects": [
    {
      "name": "desk",
      "confidence": 0.95,
      "boundingBox": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 150
      }
    },
    {
      "name": "computer",
      "confidence": 0.92,
      "boundingBox": {
        "x": 150,
        "y": 180,
        "width": 100,
        "height": 80
      }
    }
  ],
  "metadata": {
    "model": "qwen2-vl",
    "processingTime": 1250
  }
}
```

---

### **POST /vision/ocr**

Extract text from image (OCR).

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "imageUrl": "https://example.com/document.jpg",
  "language": "en"
}
```

**Response:**
```json
{
  "text": "This is the extracted text from the image...",
  "blocks": [
    {
      "text": "Header Text",
      "confidence": 0.98,
      "boundingBox": {
        "x": 50,
        "y": 50,
        "width": 300,
        "height": 40
      }
    }
  ],
  "metadata": {
    "language": "en",
    "confidence": 0.96,
    "processingTime": 850
  }
}
```

---

### **POST /vision/classify**

Classify image.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "categories": ["office", "outdoor", "food", "people"]
}
```

**Response:**
```json
{
  "category": "office",
  "confidence": 0.92,
  "allCategories": {
    "office": 0.92,
    "people": 0.75,
    "outdoor": 0.15,
    "food": 0.05
  }
}
```

---

## 📄 20. Document Intelligence

### **POST /documents/parse**

Parse document (PDF, DOCX, etc.).

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request:**
```
file: <document file>
```

**Response:**
```json
{
  "text": "Full extracted text from document...",
  "pages": 15,
  "metadata": {
    "title": "Annual Report 2024",
    "author": "John Doe",
    "createdAt": 1700000000000
  },
  "structure": {
    "headings": [
      {
        "level": 1,
        "text": "Introduction",
        "page": 1
      }
    ],
    "tables": [
      {
        "page": 5,
        "rows": 10,
        "columns": 5
      }
    ]
  }
}
```

---

### **POST /documents/summarize**

Summarize document.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "documentUrl": "https://example.com/document.pdf",
  "length": "short"
}
```

**Response:**
```json
{
  "summary": "This document discusses the annual financial results...",
  "keyPoints": [
    "Revenue increased by 25%",
    "New product launch successful",
    "Expansion into 3 new markets"
  ],
  "sentiment": "positive",
  "metadata": {
    "originalLength": 15000,
    "summaryLength": 250,
    "compressionRatio": 0.017
  }
}
```

---

### **POST /documents/extract**

Extract structured data from document.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "documentUrl": "https://example.com/invoice.pdf",
  "schema": {
    "invoiceNumber": "string",
    "date": "date",
    "total": "number",
    "items": "array"
  }
}
```

**Response:**
```json
{
  "data": {
    "invoiceNumber": "INV-2024-001",
    "date": "2024-01-15",
    "total": 1250.00,
    "items": [
      {
        "description": "Product A",
        "quantity": 5,
        "price": 250.00
      }
    ]
  },
  "confidence": 0.95
}
```

---

## 🎵 21. Audio Analysis

### **POST /audio/transcribe-and-analyze**

Transcribe and analyze audio in one call.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: audio/webm
```

**Request:**
```
<audio binary data>
```

**Response:**
```json
{
  "transcript": "I'm really frustrated with this service!",
  "sentiment": {
    "sentiment": "negative",
    "score": -0.85,
    "emotions": {
      "frustration": 0.85,
      "anger": 0.75
    }
  },
  "audioAnalysis": {
    "emotion": "frustrated",
    "tone": {
      "pitch": "high",
      "energy": "high",
      "speed": "fast"
    }
  },
  "intent": "complaint",
  "metadata": {
    "duration": 3.5,
    "processingTime": 1200
  }
}
```

---

### **POST /audio/speaker-diarization**

Identify different speakers in audio.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: audio/webm
```

**Request:**
```
<audio binary data>
```

**Response:**
```json
{
  "speakers": 2,
  "segments": [
    {
      "speaker": "Speaker 1",
      "start": 0.0,
      "end": 2.5,
      "text": "Hello, how can I help you?"
    },
    {
      "speaker": "Speaker 2",
      "start": 2.5,
      "end": 5.0,
      "text": "I have a question about my order."
    }
  ]
}
```

---

## 🧩 22. Multi-Modal Context

### **POST /multimodal/context**

Create multi-modal context (text + voice + image + location).

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "text": "What's this building?",
  "audioUrl": "https://example.com/audio.webm",
  "imageUrl": "https://example.com/building.jpg",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "timestamp": 1700000000000
}
```

**Response:**
```json
{
  "context": {
    "textIntent": "query_location",
    "audioEmotion": "curious",
    "imageAnalysis": "Modern office building with glass facade",
    "locationInfo": "New York City, Manhattan",
    "combinedIntent": "identify_building"
  },
  "response": "This is the Empire State Building, a famous landmark in New York City.",
  "confidence": 0.92,
  "sources": ["vision", "location", "text"]
}
```

---

### **POST /multimodal/fusion**

Fuse multiple modalities for enhanced understanding.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "modalities": {
    "text": "I'm not feeling well",
    "audio": "base64_audio_data",
    "image": "https://example.com/user_photo.jpg"
  },
  "fusionStrategy": "weighted"
}
```

**Response:**
```json
{
  "fusedContext": {
    "primaryEmotion": "unwell",
    "confidence": 0.94,
    "signals": {
      "text": {
        "sentiment": "negative",
        "keywords": ["not feeling well"]
      },
      "audio": {
        "tone": "weak",
        "energy": "low"
      },
      "image": {
        "facialExpression": "tired",
        "posture": "slouched"
      }
    }
  },
  "recommendation": "User appears to be unwell. Suggest offering assistance or medical resources."
}
```

---

## 🤝 23. Agent-to-Agent Communication

### **POST /orchestration/agents/:agentId/call**

Call another agent from your agent.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "targetAgentId": "mccarthy-artwork",
  "method": "analyze",
  "parameters": {
    "imageUrl": "https://example.com/artwork.jpg",
    "dpi": 300
  },
  "timeout": 30000
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "dimensions": {
      "width": 4000,
      "height": 6000
    },
    "printSizes": [
      {
        "width": "33.87cm",
        "height": "50.80cm",
        "quality": "excellent"
      }
    ]
  },
  "metadata": {
    "targetAgent": "mccarthy-artwork",
    "executionTime": 1250
  }
}
```

---

### **POST /orchestration/agents/broadcast**

Broadcast message to multiple agents.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "targetAgents": ["mccarthy-pa", "mccarthy-artwork", "mccarthy-customersupport"],
  "message": {
    "type": "system_update",
    "data": {
      "version": "2.0.0",
      "changes": ["New voice features", "Performance improvements"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "delivered": 3,
  "failed": 0,
  "responses": [
    {
      "agentId": "mccarthy-pa",
      "status": "acknowledged"
    },
    {
      "agentId": "mccarthy-artwork",
      "status": "acknowledged"
    },
    {
      "agentId": "mccarthy-customersupport",
      "status": "acknowledged"
    }
  ]
}
```

---

## 🔄 24. Workflow Engine

### **POST /orchestration/workflows**

Create a workflow.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Customer Onboarding",
  "description": "Automated customer onboarding workflow",
  "steps": [
    {
      "id": "step1",
      "type": "agent_call",
      "agentId": "mccarthy-customersupport",
      "action": "send_welcome_email",
      "parameters": {
        "template": "welcome"
      }
    },
    {
      "id": "step2",
      "type": "agent_call",
      "agentId": "mccarthy-pa",
      "action": "create_task",
      "parameters": {
        "title": "Complete profile",
        "dueDate": "+7days"
      },
      "dependsOn": ["step1"]
    },
    {
      "id": "step3",
      "type": "webhook",
      "url": "https://example.com/webhook",
      "method": "POST",
      "dependsOn": ["step2"]
    }
  ],
  "trigger": {
    "type": "event",
    "event": "user.created"
  }
}
```

**Response:**
```json
{
  "workflowId": "workflow_abc123",
  "name": "Customer Onboarding",
  "status": "active",
  "createdAt": 1700000000000
}
```

---

### **GET /orchestration/workflows**

List workflows.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "workflows": [
    {
      "workflowId": "workflow_abc123",
      "name": "Customer Onboarding",
      "status": "active",
      "executionCount": 125,
      "successRate": 0.98,
      "createdAt": 1700000000000
    }
  ],
  "total": 1
}
```

---

### **POST /orchestration/workflows/:workflowId/execute**

Execute a workflow manually.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "parameters": {
    "userId": "usr_abc123",
    "email": "user@example.com"
  }
}
```

**Response:**
```json
{
  "executionId": "exec_abc123",
  "workflowId": "workflow_abc123",
  "status": "running",
  "startedAt": 1700000000000
}
```

---

### **GET /orchestration/workflows/:workflowId/executions/:executionId**

Get workflow execution status.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "executionId": "exec_abc123",
  "workflowId": "workflow_abc123",
  "status": "completed",
  "steps": [
    {
      "stepId": "step1",
      "status": "completed",
      "startedAt": 1700000000000,
      "completedAt": 1700000001000,
      "result": {
        "success": true
      }
    },
    {
      "stepId": "step2",
      "status": "completed",
      "startedAt": 1700000001000,
      "completedAt": 1700000002000,
      "result": {
        "taskId": "task_abc123"
      }
    }
  ],
  "startedAt": 1700000000000,
  "completedAt": 1700000002000,
  "duration": 2000
}
```

---

## 📋 25. Agent Registry

### **POST /orchestration/registry/register**

Register an agent in the registry.

**Headers:**
```
Authorization: Bearer {accessToken}
X-Admin-Key: {adminKey}
Content-Type: application/json
```

**Request:**
```json
{
  "agentId": "my-custom-agent",
  "name": "My Custom Agent",
  "description": "Custom agent for specific tasks",
  "capabilities": ["task_management", "data_processing"],
  "endpoint": "https://my-agent.example.com",
  "healthCheckEndpoint": "https://my-agent.example.com/health",
  "metadata": {
    "version": "1.0.0",
    "author": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "agentId": "my-custom-agent",
  "registeredAt": 1700000000000
}
```

---

### **GET /orchestration/registry/discover**

Discover agents by capability.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `capability` (optional): Filter by capability
- `status` (optional): Filter by status (`active`, `inactive`)

**Response:**
```json
{
  "agents": [
    {
      "agentId": "mccarthy-pa",
      "name": "McCarthy PA",
      "capabilities": ["voice", "text", "tasks", "reminders"],
      "status": "active",
      "endpoint": "/agents/mccarthy-pa"
    },
    {
      "agentId": "mccarthy-artwork",
      "name": "McCarthy Artwork Analyzer",
      "capabilities": ["dpi-calculation", "print-analysis"],
      "status": "active",
      "endpoint": "/agents/mccarthy-artwork"
    }
  ],
  "total": 2
}
```

---

### **DELETE /orchestration/registry/:agentId**

Unregister an agent.

**Headers:**
```
Authorization: Bearer {accessToken}
X-Admin-Key: {adminKey}
```

**Response:**
```json
{
  "success": true,
  "agentId": "my-custom-agent",
  "unregisteredAt": 1700000000000
}
```

---

## 🐝 26. Swarm Coordination

### **POST /orchestration/swarms**

Create a swarm (group of agents working together).

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Content Creation Swarm",
  "description": "Swarm for creating marketing content",
  "agents": [
    {
      "agentId": "content-research-agent",
      "role": "researcher"
    },
    {
      "agentId": "copywriter-agent",
      "role": "writer"
    },
    {
      "agentId": "adfusion-agent",
      "role": "designer"
    }
  ],
  "coordination": {
    "strategy": "sequential",
    "timeout": 300000
  }
}
```

**Response:**
```json
{
  "swarmId": "swarm_abc123",
  "name": "Content Creation Swarm",
  "status": "active",
  "agents": 3,
  "createdAt": 1700000000000
}
```

---

### **POST /orchestration/swarms/:swarmId/execute**

Execute a swarm task.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "task": "Create a social media campaign for Product X",
  "parameters": {
    "product": "Product X",
    "targetAudience": "millennials",
    "platforms": ["instagram", "facebook", "twitter"]
  }
}
```

**Response:**
```json
{
  "executionId": "exec_abc123",
  "swarmId": "swarm_abc123",
  "status": "running",
  "startedAt": 1700000000000,
  "estimatedCompletion": 1700000300000
}
```

---

### **GET /orchestration/swarms/:swarmId/executions/:executionId**

Get swarm execution status.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "executionId": "exec_abc123",
  "swarmId": "swarm_abc123",
  "status": "completed",
  "results": {
    "researcher": {
      "insights": "Target audience prefers visual content...",
      "keywords": ["trending", "viral", "engaging"]
    },
    "writer": {
      "copy": "Discover the future of...",
      "variations": 3
    },
    "designer": {
      "designs": [
        "https://r2.dartmouth-os.com/designs/design1.png",
        "https://r2.dartmouth-os.com/designs/design2.png"
      ]
    }
  },
  "startedAt": 1700000000000,
  "completedAt": 1700000250000,
  "duration": 250000
}
```

---

## 🧠 27. Cross-Agent Memory

### **POST /orchestration/memory/share**

Share memory across agents.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "key": "user:usr_abc123:preferences",
  "value": {
    "theme": "dark",
    "language": "en-US",
    "timezone": "America/New_York"
  },
  "sharedWith": ["mccarthy-pa", "mccarthy-artwork", "mccarthy-customersupport"],
  "ttl": 86400
}
```

**Response:**
```json
{
  "success": true,
  "key": "user:usr_abc123:preferences",
  "sharedWith": 3,
  "expiresAt": 1700086400000
}
```

---

### **GET /orchestration/memory/:key**

Get shared memory.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "key": "user:usr_abc123:preferences",
  "value": {
    "theme": "dark",
    "language": "en-US",
    "timezone": "America/New_York"
  },
  "sharedWith": ["mccarthy-pa", "mccarthy-artwork", "mccarthy-customersupport"],
  "createdAt": 1700000000000,
  "expiresAt": 1700086400000
}
```

---

### **POST /orchestration/memory/sync**

Sync memory across agents.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "sourceAgentId": "mccarthy-pa",
  "targetAgentIds": ["mccarthy-artwork", "mccarthy-customersupport"],
  "keys": ["user:usr_abc123:*"]
}
```

**Response:**
```json
{
  "success": true,
  "keysSynced": 15,
  "targetAgents": 2
}
```

---

## 📦 28. File Storage

### **POST /storage/upload**

Upload a file.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request:**
```
file: <file data>
metadata: {"category": "documents", "tags": ["important"]}
```

**Response:**
```json
{
  "fileId": "file_abc123",
  "url": "https://r2.dartmouth-os.com/files/file_abc123.pdf",
  "filename": "document.pdf",
  "size": 1024000,
  "contentType": "application/pdf",
  "uploadedAt": 1700000000000
}
```

---

### **GET /storage/files/:fileId**

Get file metadata.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "fileId": "file_abc123",
  "url": "https://r2.dartmouth-os.com/files/file_abc123.pdf",
  "filename": "document.pdf",
  "size": 1024000,
  "contentType": "application/pdf",
  "metadata": {
    "category": "documents",
    "tags": ["important"]
  },
  "uploadedAt": 1700000000000
}
```

---

### **GET /storage/files/:fileId/download**

Download a file.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```
<file binary data>
```

---

### **DELETE /storage/files/:fileId**

Delete a file.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "fileId": "file_abc123"
}
```

---

## 🗄️ 29. Database Operations

### **POST /database/query**

Execute a database query.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "query": "SELECT * FROM tasks WHERE user_id = ? AND status = ?",
  "parameters": ["usr_abc123", "pending"],
  "database": "primary"
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "task_abc123",
      "user_id": "usr_abc123",
      "title": "Call John",
      "status": "pending",
      "created_at": 1700000000000
    }
  ],
  "rowCount": 1,
  "executionTime": 45
}
```

---

### **POST /database/execute**

Execute a database command (INSERT, UPDATE, DELETE).

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "command": "INSERT INTO tasks (id, user_id, title, status, created_at) VALUES (?, ?, ?, ?, ?)",
  "parameters": ["task_abc123", "usr_abc123", "Call John", "pending", 1700000000000],
  "database": "primary"
}
```

**Response:**
```json
{
  "success": true,
  "rowsAffected": 1,
  "lastInsertId": "task_abc123",
  "executionTime": 35
}
```

---

## ⏱️ 30. Rate Limiting

### **GET /rate-limit/status**

Get current rate limit status.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "limits": {
    "requestsPerMinute": {
      "limit": 100,
      "remaining": 85,
      "resetAt": 1700000060000
    },
    "requestsPerDay": {
      "limit": 10000,
      "remaining": 9250,
      "resetAt": 1700086400000
    },
    "tokensPerMonth": {
      "limit": 1000000,
      "remaining": 875000,
      "resetAt": 1702598400000
    }
  }
}
```

---

### **Rate Limit Headers**

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1700000060
X-RateLimit-Retry-After: 15
```

---

## ❌ 31. Error Handling

### **Error Response Format**

All errors follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {
      "reason": "Token expired at 1700000000000"
    },
    "requestId": "req_abc123",
    "timestamp": 1700000000000
  }
}
```

---

### **Error Codes**

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| **400** | `VALIDATION_ERROR` | Invalid request data |
| **400** | `INVALID_PARAMETER` | Invalid parameter value |
| **401** | `UNAUTHORIZED` | Invalid or expired token |
| **401** | `AUTHENTICATION_REQUIRED` | No token provided |
| **403** | `FORBIDDEN` | Insufficient permissions |
| **403** | `AGENT_DISABLED` | Agent is disabled |
| **404** | `NOT_FOUND` | Resource not found |
| **404** | `AGENT_NOT_FOUND` | Agent not found |
| **409** | `CONFLICT` | Resource already exists |
| **429** | `RATE_LIMIT_EXCEEDED` | Too many requests |
| **500** | `INTERNAL_ERROR` | Server error |
| **503** | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| **504** | `TIMEOUT` | Request timeout |

---

### **Retry Strategy**

For `429` (Rate Limit) and `503` (Service Unavailable) errors:

1. Check `Retry-After` header
2. Wait specified seconds
3. Retry with exponential backoff
4. Max 3 retries

**Example:**
```typescript
async function retryRequest(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(request);
    } catch (error) {
      if (error.status === 429 || error.status === 503) {
        const retryAfter = error.headers['retry-after'] || (2 ** i);
        await sleep(retryAfter * 1000);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 🔌 32. WebSocket Protocol

### **Connection**

```
wss://api.dartmouth-os.com/api/v2/ws
```

**Connection Headers:**
```
Authorization: Bearer {accessToken}
```

---

### **Message Format**

**Client → Server:**
```json
{
  "type": "message_type",
  "id": "msg_abc123",
  "data": {
    // message-specific data
  }
}
```

**Server → Client:**
```json
{
  "type": "message_type",
  "id": "msg_abc123",
  "data": {
    // message-specific data
  },
  "timestamp": 1700000000000
}
```

---

### **Message Types**

#### **Ping/Pong (Heartbeat)**

**Client → Server:**
```json
{
  "type": "ping",
  "id": "ping_001"
}
```

**Server → Client:**
```json
{
  "type": "pong",
  "id": "ping_001",
  "timestamp": 1700000000000
}
```

#### **Subscribe to Events**

**Client → Server:**
```json
{
  "type": "subscribe",
  "id": "sub_001",
  "data": {
    "events": ["task.created", "reminder.triggered"]
  }
}
```

**Server → Client:**
```json
{
  "type": "subscribed",
  "id": "sub_001",
  "data": {
    "events": ["task.created", "reminder.triggered"]
  }
}
```

#### **Event Notification**

**Server → Client:**
```json
{
  "type": "event",
  "id": "evt_abc123",
  "data": {
    "event": "task.created",
    "payload": {
      "taskId": "task_abc123",
      "title": "Call John"
    }
  },
  "timestamp": 1700000000000
}
```

#### **Error**

**Server → Client:**
```json
{
  "type": "error",
  "id": "msg_abc123",
  "data": {
    "code": "INVALID_MESSAGE",
    "message": "Invalid message format"
  },
  "timestamp": 1700000000000
}
```

---

## 🔑 Authentication

### **API Key Authentication**

For server-to-server communication:

**Headers:**
```
X-API-Key: {apiKey}
```

---

### **JWT Token Authentication**

For user-based authentication:

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Token Format:**
```json
{
  "sub": "usr_abc123",
  "email": "user@example.com",
  "roles": ["user"],
  "permissions": ["read:own", "write:own"],
  "iat": 1700000000,
  "exp": 1700003600
}
```

---

## 📊 Response Metadata

All responses include metadata:

```json
{
  "data": {
    // response data
  },
  "metadata": {
    "requestId": "req_abc123",
    "timestamp": 1700000000000,
    "processingTime": 245,
    "version": "2.0.0"
  }
}
```

---

## 🌍 Supported Languages

Dartmouth OS supports the following languages:

| Language | Code | STT | TTS | LLM |
|----------|------|-----|-----|-----|
| English (US) | `en-US` | ✅ | ✅ | ✅ |
| English (UK) | `en-GB` | ✅ | ✅ | ✅ |
| Spanish | `es-ES` | ✅ | ✅ | ✅ |
| French | `fr-FR` | ✅ | ✅ | ✅ |
| German | `de-DE` | ✅ | ✅ | ✅ |
| Italian | `it-IT` | ✅ | ✅ | ✅ |
| Portuguese | `pt-PT` | ✅ | ✅ | ✅ |
| Dutch | `nl-NL` | ✅ | ✅ | ✅ |
| Polish | `pl-PL` | ✅ | ✅ | ✅ |
| Russian | `ru-RU` | ✅ | ✅ | ✅ |
| Japanese | `ja-JP` | ✅ | ✅ | ✅ |
| Korean | `ko-KR` | ✅ | ✅ | ✅ |
| Chinese | `zh-CN` | ✅ | ✅ | ✅ |

---

## 💰 Pricing

### **Platform Services**

| Service | Pricing Model | Cost |
|---------|---------------|------|
| **Authentication** | Free | $0 |
| **Agent Management** | Per request | $0.001/request |
| **Health & Monitoring** | Free | $0 |
| **Analytics** | Free | $0 |
| **Caching** | Storage + reads | $0.50/GB + $0.36/M reads |
| **Security** | Free | $0 |
| **Webhooks** | Free | $0 |
| **Integrations** | Free | $0 |
| **Notifications** | Per notification | $0.0001/notification |

### **Intelligence Services**

| Service | Pricing Model | Cost |
|---------|---------------|------|
| **LLM (GPT-4o-mini)** | Per token | $0.15/M input, $0.60/M output |
| **RAG** | Storage + queries | $0.50/GB + $0.001/query |
| **Sentiment Analysis** | Per request | $0.0001/request |
| **Intent Detection** | Per request | $0.0001/request |

### **Voice & Audio Services**

| Service | Pricing Model | Cost |
|---------|---------------|------|
| **STT (Deepgram)** | Per minute | $0.0043/min |
| **STT (Whisper)** | Per minute | $0.006/min |
| **TTS (F5-TTS)** | Per minute | $0.001/min |
| **TTS (OpenAI)** | Per minute | $0.015/min |
| **Audio Streaming** | Per minute | $0.005/min |
| **VAD** | Free | $0 |
| **Audio Processing** | Per minute | $0.002/min |

### **Multi-Modal Services**

| Service | Pricing Model | Cost |
|---------|---------------|------|
| **Vision (Qwen2-VL)** | Per image | $0.01/image |
| **OCR** | Per page | $0.005/page |
| **Document Parsing** | Per page | $0.01/page |
| **Audio Analysis** | Per minute | $0.002/min |

### **Orchestration Services**

| Service | Pricing Model | Cost |
|---------|---------------|------|
| **Agent-to-Agent** | Free | $0 |
| **Workflows** | Per execution | $0.01/execution |
| **Swarms** | Per execution | $0.05/execution |
| **Cross-Agent Memory** | Storage | $0.50/GB |

### **Storage & Database**

| Service | Pricing Model | Cost |
|---------|---------------|------|
| **File Storage (R2)** | Storage + operations | $0.015/GB + $0.36/M reads |
| **Database (D1)** | Reads + writes | $0.001/M reads, $1.00/M writes |

---

## 📚 SDKs & Libraries

### **Official SDKs**

- **JavaScript/TypeScript**: `@dartmouth/sdk`
- **Python**: `dartmouth-sdk`
- **Go**: `github.com/dartmouth-os/go-sdk`
- **Ruby**: `dartmouth-sdk`
- **PHP**: `dartmouth/sdk`

### **Installation**

**JavaScript/TypeScript:**
```bash
npm install @dartmouth/sdk
```

**Python:**
```bash
pip install dartmouth-sdk
```

---

## 🔗 Additional Resources

- **[Getting Started Guide](../../GETTING_STARTED.md)**
- **[Dartmouth OS V2.0 Spec](DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md)**
- **[Voice Services Spec](DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md)**
- **[Multi-Modal Services Spec](DARTMOUTH_MULTIMODAL_SERVICES_SPECIFICATION.md)**
- **[Orchestration Services Spec](DARTMOUTH_ORCHESTRATION_SERVICES_SPECIFICATION.md)**
- **[Agent Development Guide](../guides/AGENT_DEVELOPMENT_GUIDE.md)**
- **[FAM Specification](../../agents/fam/FAM_COMPLETE_SPECIFICATION.md)**

---

## 📞 Support

For API support:
- **Documentation**: https://docs.dartmouth-os.com
- **Status Page**: https://status.dartmouth-os.com
- **Slack**: #dartmouth-api-support
- **Email**: api-support@dartmouth-os.com

---

**Dartmouth OS V2.0 API - Agent-agnostic, comprehensive, everything you need.** 🚀

**Last Updated:** November 19, 2024  
**API Version:** 2.0.0

