# Customer Service API Endpoints

**Base URL:** `https://dartmouth-os-worker.dartmouth.workers.dev/api`

## Authentication

All endpoints except `/auth/login` require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### POST /auth/login
Login and get JWT token.

**Request:**
```json
{
  "email": "john@dtf.com.au",
  "password": "changeme123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "john@dtf.com.au",
    "firstName": "John",
    "lastName": "Hutchison",
    "role": "admin"
  }
}
```

### GET /auth/me
Get current user info.

**Response:**
```json
{
  "user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "john@dtf.com.au",
    "firstName": "John",
    "lastName": "Hutchison",
    "role": "admin",
    "isActive": true,
    "isAvailable": true
  }
}
```

### POST /auth/logout
Logout (client-side token removal).

---

## Tickets

### GET /tickets
List tickets with optional filters.

**Query Parameters:**
- `status` - Filter by status (open, pending, in-progress, resolved, closed, escalated, snoozed)
- `priority` - Filter by priority (low, normal, high, critical, urgent)
- `assignedTo` - Filter by assigned staff ID
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "tickets": [
    {
      "ticket_id": "uuid",
      "ticket_number": "T-00001",
      "customer_email": "customer@example.com",
      "customer_name": "John Doe",
      "subject": "Order inquiry",
      "status": "open",
      "priority": "normal",
      "category": "order_status",
      "created_at": "2025-11-28T10:00:00Z"
    }
  ]
}
```

### GET /tickets/:id
Get single ticket with messages and notes.

**Response:**
```json
{
  "ticket": { /* ticket object */ },
  "messages": [ /* array of messages */ ],
  "notes": [ /* array of internal notes */ ]
}
```

### PUT /tickets/:id/assign
Assign ticket to staff member. **Requires Manager or Admin role.**

**Request:**
```json
{
  "assignedTo": "staff-user-id"
}
```

### PUT /tickets/:id/status
Update ticket status.

**Request:**
```json
{
  "status": "resolved"
}
```

### POST /tickets/:id/reply
Reply to ticket.

**Request:**
```json
{
  "content": "Thank you for contacting us..."
}
```

### POST /tickets/:id/notes
Add internal note to ticket.

**Request:**
```json
{
  "content": "Customer called, very happy with service",
  "noteType": "general"
}
```

### POST /tickets/:id/snooze
Snooze ticket until specified time.

**Request:**
```json
{
  "snoozedUntil": "2025-11-29T09:00:00Z",
  "reason": "Waiting for customer response"
}
```

### POST /tickets/:id/unsnooze
Unsnooze ticket.

---

## Mentions

### GET /mentions
List mentions for current user.

**Query Parameters:**
- `unreadOnly` - Only show unread mentions (true/false)

**Response:**
```json
{
  "mentions": [
    {
      "id": "uuid",
      "ticket_id": "ticket-uuid",
      "from_first_name": "John",
      "from_last_name": "Hutchison",
      "message": "Can you help with this?",
      "priority": "normal",
      "is_read": false,
      "created_at": "2025-11-28T10:00:00Z"
    }
  ]
}
```

### GET /mentions/:id
Get single mention with thread replies.

### POST /mentions
Create new mention.

**Request:**
```json
{
  "ticketId": "ticket-uuid",
  "toStaffId": "staff-uuid",
  "message": "Can you help with this customer?",
  "priority": "normal",
  "type": "ticket"
}
```

### POST /mentions/:id/reply
Reply to mention thread.

**Request:**
```json
{
  "message": "Sure, I'll take a look"
}
```

### PUT /mentions/:id/read
Mark mention as read.

---

## Settings

**All settings endpoints require Admin role.**

### GET /settings
List all system settings.

**Response:**
```json
{
  "settings": [
    {
      "setting_key": "ai_response_mode",
      "setting_value": "draft",
      "setting_type": "string",
      "description": "AI response mode: auto or draft"
    }
  ]
}
```

### GET /settings/:key
Get single setting by key.

### PUT /settings/:key
Update setting value.

**Request:**
```json
{
  "value": "auto"
}
```

---

## Staff

### GET /staff
List all active staff members.

**Response:**
```json
{
  "staff": [
    {
      "id": "uuid",
      "email": "john@dtf.com.au",
      "first_name": "John",
      "last_name": "Hutchison",
      "role": "admin",
      "is_active": true,
      "is_available": true
    }
  ]
}
```

### GET /staff/:id
Get single staff member details.

### PUT /staff/:id/presence
Update staff availability status.

**Request:**
```json
{
  "isAvailable": true
}
```

---

## Test Credentials

**Admin:**
- Email: `john@dtf.com.au`
- Password: `changeme123`
- Role: admin

**Agent (Ted):**
- Email: `john+ted@dtf.com.au`
- Password: `changeme123`
- Role: agent

**Agent (Sam):**
- Email: `john+sam@dtf.com.au`
- Password: `changeme123`
- Role: agent

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error


