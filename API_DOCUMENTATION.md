# 📚 API Documentation - Dartmouth Agent Army

Complete API reference for the Agent Army system.

**Base URL:** `https://your-worker.workers.dev`  
**Version:** 1.0.0  
**Last Updated:** November 17, 2025

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Health & Status](#health--status)
3. [Chat Endpoints](#chat-endpoints)
4. [Test Endpoints](#test-endpoints)
5. [Session Management](#session-management)
6. [Feedback](#feedback)
7. [Error Handling](#error-handling)
8. [Rate Limits](#rate-limits)
9. [Examples](#examples)

---

## 🔐 Authentication

Currently, the API is open for testing. Production authentication will be added in Phase 3.

**Future:** Bearer token authentication
```http
Authorization: Bearer YOUR_API_KEY
```

---

## 🏥 Health & Status

### GET /health

Check system health and service status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T04:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "up",
    "cache": "up",
    "llm": "up"
  }
}
```

**Status Codes:**
- `200` - All systems operational
- `503` - One or more services down

---

### GET /health/ready

Readiness check for load balancers.

**Response:**
```json
{
  "ready": true,
  "timestamp": "2025-11-17T04:00:00.000Z"
}
```

---

### GET /health/live

Liveness check for orchestrators.

**Response:**
```json
{
  "alive": true,
  "timestamp": "2025-11-17T04:00:00.000Z"
}
```

---

## 💬 Chat Endpoints

### POST /api/v1/agents/:agentId/chat

Send a message to an agent and receive a response.

**Path Parameters:**
- `agentId` (string, required) - The agent identifier

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "sessionId": "optional-session-id",
  "userId": "optional-user-id",
  "metadata": {
    "source": "web",
    "language": "en"
  }
}
```

**Response:**
```json
{
  "content": "Hello! I'm doing great, thank you for asking. How can I help you today?",
  "metadata": {
    "sessionId": "sess_abc123",
    "messageId": "msg_xyz789",
    "processingTimeMs": 1250,
    "validationPassed": true,
    "intent": "greeting",
    "confidence": 0.95,
    "handler": "GreetingHandler"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `429` - Rate limit exceeded
- `500` - Server error

---

### GET /api/v1/agents/:agentId/sessions/:sessionId

Retrieve session details and conversation history.

**Path Parameters:**
- `agentId` (string, required) - The agent identifier
- `sessionId` (string, required) - The session identifier

**Response:**
```json
{
  "sessionId": "sess_abc123",
  "agentId": "agent-001",
  "userId": "user-456",
  "startedAt": "2025-11-17T03:00:00.000Z",
  "lastActivityAt": "2025-11-17T04:00:00.000Z",
  "messageCount": 10,
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Hello",
      "timestamp": "2025-11-17T03:00:00.000Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "Hello! How can I help you?",
      "timestamp": "2025-11-17T03:00:01.000Z"
    }
  ],
  "summary": {
    "short": "User greeted the agent and asked about services.",
    "detailed": "The conversation started with a greeting...",
    "topics": ["greeting", "services"],
    "keyPoints": ["User is interested in services"],
    "sentiment": "positive"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Session not found
- `500` - Server error

---

### DELETE /api/v1/agents/:agentId/sessions/:sessionId

Delete a session and all associated data.

**Path Parameters:**
- `agentId` (string, required) - The agent identifier
- `sessionId` (string, required) - The session identifier

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully",
  "sessionId": "sess_abc123"
}
```

**Status Codes:**
- `200` - Success
- `404` - Session not found
- `500` - Server error

---

## 🧪 Test Endpoints

### POST /test/chat

Test the chat functionality without creating a persistent session.

**Request Body:**
```json
{
  "message": "What is 2+2?"
}
```

**Response:**
```json
{
  "content": "2 + 2 = 4",
  "metadata": {
    "sessionId": "test-session",
    "messageId": "msg_test_001",
    "processingTimeMs": 850,
    "validationPassed": true,
    "intent": "calculation",
    "confidence": 0.98,
    "handler": "CalculationHandler",
    "calculationResult": {
      "expression": "2+2",
      "result": 4,
      "isValid": true
    }
  }
}
```

---

### POST /test/intent

Test intent detection without generating a response.

**Request Body:**
```json
{
  "message": "How do I reset my password?"
}
```

**Response:**
```json
{
  "intent": "how_to",
  "confidence": 0.92,
  "alternativeIntents": [
    { "intent": "information", "confidence": 0.65 },
    { "intent": "fallback", "confidence": 0.15 }
  ],
  "entities": {
    "action": "reset",
    "object": "password"
  }
}
```

---

### POST /test/validation

Test response validation.

**Request Body:**
```json
{
  "response": "The capital of France is Paris.",
  "question": "What is the capital of France?"
}
```

**Response:**
```json
{
  "isValid": true,
  "issues": [],
  "suggestedFix": null,
  "confidence": 0.95
}
```

---

### POST /test/calculation

Test the calculation engine.

**Request Body:**
```json
{
  "expression": "15 * 20"
}
```

**Response:**
```json
{
  "expression": "15 * 20",
  "result": 300,
  "isValid": true,
  "processingTimeMs": 5
}
```

---

### GET /test/session/:id

Retrieve test session details.

**Path Parameters:**
- `id` (string, required) - The test session identifier

**Response:**
```json
{
  "sessionId": "test-session-001",
  "messages": [...],
  "state": {...}
}
```

---

### POST /test/batch

Test multiple messages in sequence.

**Request Body:**
```json
{
  "messages": [
    "Hello!",
    "What is 5+5?",
    "Thank you!"
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "message": "Hello!",
      "response": "Hello! How can I help you?",
      "intent": "greeting",
      "processingTimeMs": 800
    },
    {
      "message": "What is 5+5?",
      "response": "5 + 5 = 10",
      "intent": "calculation",
      "processingTimeMs": 650
    },
    {
      "message": "Thank you!",
      "response": "You're welcome!",
      "intent": "greeting",
      "processingTimeMs": 750
    }
  ],
  "totalProcessingTimeMs": 2200,
  "sessionId": "test-batch-001"
}
```

---

## 📝 Feedback

### POST /api/v1/agents/:agentId/feedback

Submit feedback about an agent response.

**Path Parameters:**
- `agentId` (string, required) - The agent identifier

**Request Body:**
```json
{
  "sessionId": "sess_abc123",
  "messageId": "msg_xyz789",
  "rating": 5,
  "comment": "Very helpful response!",
  "userId": "user-456",
  "tags": ["helpful", "accurate"]
}
```

**Response:**
```json
{
  "success": true,
  "feedbackId": "fb_001",
  "message": "Thank you for your feedback!"
}
```

**Rating Scale:**
- `1` - Very poor
- `2` - Poor
- `3` - Average
- `4` - Good
- `5` - Excellent

---

## ❌ Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Message is required",
    "details": {
      "field": "message",
      "reason": "Field cannot be empty"
    }
  }
}
```

### Error Codes

| Code | Description | Status |
|------|-------------|--------|
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `SERVICE_UNAVAILABLE` | Service temporarily down | 503 |
| `AUTHENTICATION_REQUIRED` | Missing auth token | 401 |
| `INSUFFICIENT_PERMISSIONS` | Unauthorized access | 403 |

---

## ⏱️ Rate Limits

**Current Limits:**
- Test endpoints: 100 requests/minute
- Production endpoints: 60 requests/minute
- Burst: 10 requests/second

**Headers:**
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1700200000
```

**Rate Limit Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 30
  }
}
```

---

## 📖 Examples

### Example 1: Simple Chat

```bash
curl -X POST https://your-worker.workers.dev/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

**Response:**
```json
{
  "content": "Hello! How can I help you today?",
  "metadata": {
    "sessionId": "test-session",
    "messageId": "msg_001",
    "processingTimeMs": 800,
    "intent": "greeting"
  }
}
```

---

### Example 2: Calculation

```bash
curl -X POST https://your-worker.workers.dev/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 25 * 4?"}'
```

**Response:**
```json
{
  "content": "25 × 4 = 100",
  "metadata": {
    "sessionId": "test-session",
    "messageId": "msg_002",
    "processingTimeMs": 650,
    "intent": "calculation",
    "calculationResult": {
      "expression": "25*4",
      "result": 100,
      "isValid": true
    }
  }
}
```

---

### Example 3: Multi-turn Conversation

```javascript
// JavaScript example
const baseUrl = 'https://your-worker.workers.dev';
let sessionId = null;

// Message 1
const response1 = await fetch(`${baseUrl}/api/v1/agents/agent-001/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' })
});
const data1 = await response1.json();
sessionId = data1.metadata.sessionId;

// Message 2 (same session)
const response2 = await fetch(`${baseUrl}/api/v1/agents/agent-001/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: 'What is 10+10?',
    sessionId: sessionId 
  })
});
const data2 = await response2.json();

// Get session history
const history = await fetch(
  `${baseUrl}/api/v1/agents/agent-001/sessions/${sessionId}`
);
const sessionData = await history.json();
console.log(sessionData.messages);
```

---

### Example 4: Python Client

```python
import requests

class AgentClient:
    def __init__(self, base_url, agent_id):
        self.base_url = base_url
        self.agent_id = agent_id
        self.session_id = None
    
    def chat(self, message):
        url = f"{self.base_url}/api/v1/agents/{self.agent_id}/chat"
        payload = {"message": message}
        
        if self.session_id:
            payload["sessionId"] = self.session_id
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        if not self.session_id:
            self.session_id = data["metadata"]["sessionId"]
        
        return data["content"]
    
    def get_history(self):
        url = f"{self.base_url}/api/v1/agents/{self.agent_id}/sessions/{self.session_id}"
        response = requests.get(url)
        return response.json()

# Usage
client = AgentClient("https://your-worker.workers.dev", "agent-001")
print(client.chat("Hello!"))
print(client.chat("What is 5+5?"))
print(client.get_history())
```

---

### Example 5: Batch Testing

```bash
curl -X POST https://your-worker.workers.dev/test/batch \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      "Hello!",
      "What is 2+2?",
      "How do I reset my password?",
      "Thank you!"
    ]
  }'
```

---

## 🔧 Advanced Usage

### Custom Metadata

Include custom metadata in requests:

```json
{
  "message": "Hello!",
  "metadata": {
    "source": "mobile_app",
    "version": "1.2.3",
    "language": "en",
    "timezone": "America/New_York",
    "customField": "customValue"
  }
}
```

### Streaming Responses (Future)

```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Tell me a story', stream: true })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(new TextDecoder().decode(value));
}
```

---

## 📊 Response Times

**Typical Response Times:**
- Greeting: 500-1000ms
- Calculation: 400-800ms
- Information: 1000-2000ms
- How-to: 1200-2500ms

**Factors Affecting Speed:**
- LLM provider (Anthropic fastest)
- Message complexity
- Database queries
- Cache hits/misses

---

## 🔒 Security

### CORS

Allowed origins configured in worker.

**Headers:**
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Input Validation

All inputs are validated:
- Message length: 1-10,000 characters
- Session ID format: alphanumeric + hyphens
- Agent ID format: alphanumeric + hyphens

### Data Privacy

- Messages encrypted in transit (HTTPS)
- Database encrypted at rest
- PII handling compliant
- Session data expires after 30 days

---

## 📞 Support

- **Documentation:** https://github.com/hutchisonjohn/dartmouth
- **Issues:** https://github.com/hutchisonjohn/dartmouth/issues
- **Email:** support@yourdomain.com

---

## 📝 Changelog

### Version 1.0.0 (2025-11-17)
- Initial release
- Chat endpoints
- Test endpoints
- Session management
- Feedback system
- Health checks

---

**API Documentation Version:** 1.0.0  
**Last Updated:** November 17, 2025  
**Status:** Production Ready ✅

