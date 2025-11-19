# McCarthy PA Agent - API Reference

**Document Version:** 1.0  
**Date:** November 19, 2024  
**Base URL:** `https://api.dartmouth-os.com/api/v2`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Chat & Voice](#chat--voice)
3. [Tasks](#tasks)
4. [Reminders](#reminders)
5. [Notes](#notes)
6. [Calendar](#calendar)
7. [Contacts](#contacts)
8. [Settings](#settings)
9. [Error Handling](#error-handling)

---

## 🔐 Authentication

### **POST /auth/login**

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### **POST /auth/register**

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

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
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 💬 Chat & Voice

### **POST /agents/mccarthy-pa/chat**

Send a text message to McCarthy PA.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "message": "Remind me to call John at 3pm",
  "sessionId": "session123"
}
```

**Response:**
```json
{
  "response": "Got it! I'll remind you to call John at 3pm",
  "intent": "create_reminder",
  "entities": {
    "contact": "John",
    "time": "15:00"
  },
  "sessionId": "session123"
}
```

### **POST /agents/mccarthy-pa/voice**

Send voice input to McCarthy PA.

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
  "transcript": "Remind me to call John at 3pm",
  "response": "Got it! I'll remind you to call John at 3pm",
  "audioUrl": "https://r2.dartmouth-os.com/audio/response123.wav",
  "intent": "create_reminder",
  "entities": {
    "contact": "John",
    "time": "15:00"
  }
}
```

### **WebSocket /agents/mccarthy-pa/voice/stream**

Real-time voice streaming.

**Connection:**
```javascript
const socket = io('wss://api.dartmouth-os.com', {
  auth: { token: accessToken }
});
```

**Events:**

**Client → Server:**
```javascript
// Send audio chunk
socket.emit('audio-chunk', { audio: audioBuffer, final: false });

// Send final audio chunk
socket.emit('audio-chunk', { audio: audioBuffer, final: true });
```

**Server → Client:**
```javascript
// Receive transcript
socket.on('transcript', (data) => {
  console.log(data.text); // "Remind me to call John at 3pm"
});

// Receive audio response
socket.on('audio-response', (data) => {
  playAudio(data.audio); // ArrayBuffer
});
```

---

## ✅ Tasks

### **GET /agents/mccarthy-pa/tasks**

Get all tasks for the authenticated user.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `completed`, `cancelled`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`)
- `limit` (optional): Number of tasks to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "tasks": [
    {
      "id": "task123",
      "title": "Call John",
      "description": "Discuss project proposal",
      "status": "pending",
      "priority": "high",
      "dueDate": 1700000000000,
      "createdAt": 1699900000000,
      "updatedAt": 1699900000000
    }
  ],
  "total": 1
}
```

### **GET /agents/mccarthy-pa/tasks/:id**

Get a specific task.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "task123",
  "title": "Call John",
  "description": "Discuss project proposal",
  "status": "pending",
  "priority": "high",
  "dueDate": 1700000000000,
  "createdAt": 1699900000000,
  "updatedAt": 1699900000000
}
```

### **POST /agents/mccarthy-pa/tasks**

Create a new task.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Call John",
  "description": "Discuss project proposal",
  "priority": "high",
  "dueDate": 1700000000000
}
```

**Response:**
```json
{
  "id": "task123",
  "title": "Call John",
  "description": "Discuss project proposal",
  "status": "pending",
  "priority": "high",
  "dueDate": 1700000000000,
  "createdAt": 1699900000000,
  "updatedAt": 1699900000000
}
```

### **PUT /agents/mccarthy-pa/tasks/:id**

Update a task.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "id": "task123",
  "title": "Call John",
  "description": "Discuss project proposal",
  "status": "completed",
  "priority": "high",
  "dueDate": 1700000000000,
  "createdAt": 1699900000000,
  "updatedAt": 1700000001000
}
```

### **DELETE /agents/mccarthy-pa/tasks/:id**

Delete a task.

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

## ⏰ Reminders

### **GET /agents/mccarthy-pa/reminders**

Get all reminders.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `sent`, `dismissed`)
- `limit` (optional): Number of reminders to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "reminders": [
    {
      "id": "reminder123",
      "title": "Call John",
      "description": "Discuss project proposal",
      "remindAt": 1700000000000,
      "status": "pending",
      "createdAt": 1699900000000,
      "updatedAt": 1699900000000
    }
  ],
  "total": 1
}
```

### **POST /agents/mccarthy-pa/reminders**

Create a new reminder.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Call John",
  "description": "Discuss project proposal",
  "remindAt": 1700000000000
}
```

**Response:**
```json
{
  "id": "reminder123",
  "title": "Call John",
  "description": "Discuss project proposal",
  "remindAt": 1700000000000,
  "status": "pending",
  "createdAt": 1699900000000,
  "updatedAt": 1699900000000
}
```

### **DELETE /agents/mccarthy-pa/reminders/:id**

Delete a reminder.

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

## 📝 Notes

### **GET /agents/mccarthy-pa/notes**

Get all notes.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `tags` (optional): Filter by tags (comma-separated)
- `limit` (optional): Number of notes to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "notes": [
    {
      "id": "note123",
      "title": "Meeting Notes",
      "content": "Discussed project timeline...",
      "tags": ["work", "project"],
      "createdAt": 1699900000000,
      "updatedAt": 1699900000000
    }
  ],
  "total": 1
}
```

### **POST /agents/mccarthy-pa/notes**

Create a new note.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Meeting Notes",
  "content": "Discussed project timeline...",
  "tags": ["work", "project"]
}
```

**Response:**
```json
{
  "id": "note123",
  "title": "Meeting Notes",
  "content": "Discussed project timeline...",
  "tags": ["work", "project"],
  "createdAt": 1699900000000,
  "updatedAt": 1699900000000
}
```

### **PUT /agents/mccarthy-pa/notes/:id**

Update a note.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "content": "Updated content..."
}
```

**Response:**
```json
{
  "id": "note123",
  "title": "Meeting Notes",
  "content": "Updated content...",
  "tags": ["work", "project"],
  "createdAt": 1699900000000,
  "updatedAt": 1700000001000
}
```

### **DELETE /agents/mccarthy-pa/notes/:id**

Delete a note.

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

## 📅 Calendar

### **GET /agents/mccarthy-pa/calendar**

Get calendar events.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `start` (optional): Start timestamp (default: now)
- `end` (optional): End timestamp (default: 30 days from now)
- `limit` (optional): Number of events to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "events": [
    {
      "id": "event123",
      "title": "Team Meeting",
      "description": "Weekly sync",
      "startTime": 1700000000000,
      "endTime": 1700003600000,
      "location": "Conference Room A",
      "attendees": ["john@example.com", "jane@example.com"],
      "createdAt": 1699900000000,
      "updatedAt": 1699900000000
    }
  ],
  "total": 1
}
```

### **POST /agents/mccarthy-pa/calendar**

Create a calendar event.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly sync",
  "startTime": 1700000000000,
  "endTime": 1700003600000,
  "location": "Conference Room A",
  "attendees": ["john@example.com", "jane@example.com"]
}
```

**Response:**
```json
{
  "id": "event123",
  "title": "Team Meeting",
  "description": "Weekly sync",
  "startTime": 1700000000000,
  "endTime": 1700003600000,
  "location": "Conference Room A",
  "attendees": ["john@example.com", "jane@example.com"],
  "createdAt": 1699900000000,
  "updatedAt": 1699900000000
}
```

---

## 👥 Contacts

### **GET /agents/mccarthy-pa/contacts**

Get all contacts.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `limit` (optional): Number of contacts to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "contacts": [
    {
      "id": "contact123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "notes": "Project manager",
      "createdAt": 1699900000000,
      "updatedAt": 1699900000000
    }
  ],
  "total": 1
}
```

### **POST /agents/mccarthy-pa/contacts**

Create a new contact.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notes": "Project manager"
}
```

**Response:**
```json
{
  "id": "contact123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notes": "Project manager",
  "createdAt": 1699900000000,
  "updatedAt": 1699900000000
}
```

---

## ⚙️ Settings

### **GET /agents/mccarthy-pa/settings**

Get user settings.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "voiceEnabled": true,
  "voiceProvider": "deepgram",
  "ttsProvider": "f5-tts",
  "language": "en-US",
  "timezone": "America/New_York",
  "notificationsEnabled": true
}
```

### **PUT /agents/mccarthy-pa/settings**

Update user settings.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "voiceEnabled": false,
  "notificationsEnabled": true
}
```

**Response:**
```json
{
  "voiceEnabled": false,
  "voiceProvider": "deepgram",
  "ttsProvider": "f5-tts",
  "language": "en-US",
  "timezone": "America/New_York",
  "notificationsEnabled": true
}
```

---

## ❌ Error Handling

### **Error Response Format**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

### **Error Codes**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### **Rate Limiting**

- **100 requests/minute per user**
- **1000 voice minutes/month per user**

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

**API Reference Complete! 🚀**

