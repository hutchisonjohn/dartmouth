# 💬 INTERNAL COMMUNICATION SYSTEM - COMPLETE SPECIFICATION

**Version:** 1.0.0  
**Date:** November 28, 2025  
**Status:** Design Phase  
**For:** Customer Service AI Agent - Staff Dashboard

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Group Channels](#group-channels)
5. [@Mentions System](#mentions-system)
6. [Thread Conversations](#thread-conversations)
7. [Notifications](#notifications)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [UI Components](#ui-components)
11. [Permissions & Access Control](#permissions--access-control)

---

## 1. OVERVIEW

### **What Is It?**

An **internal communication system** built into the Customer Service dashboard that allows staff to:
- Communicate with each other **inside the system** (no external Slack/email needed)
- Create **private group channels** for teams (Graphic Design, Managers, Sales, etc.)
- Use **@mentions** to tag specific staff members in tickets or channels
- Have **threaded conversations** for organized discussions
- Receive **real-time notifications** for mentions and messages

### **Why Build This?**

1. **Unified Platform** - All communication happens in one place
2. **Context Preservation** - Conversations tied to tickets/orders/customers
3. **No External Tools** - No need for Slack, Teams, or email
4. **Better Collaboration** - Staff can collaborate on tickets in real-time
5. **Privacy & Security** - All data stays within your system

---

## 2. SYSTEM ARCHITECTURE

### **2.1 High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│  STAFF DASHBOARD (Frontend)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Group       │  │  @Mentions   │  │  Threads     │     │
│  │  Channels    │  │  System      │  │  System      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Real-Time Notifications (WebSocket)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Cloudflare Workers)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Internal Communication Service                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  - ChannelManager                                     │  │
│  │  - MessageRouter                                      │  │
│  │  - MentionDetector                                    │  │
│  │  - ThreadManager                                      │  │
│  │  - NotificationService                                │  │
│  │  - PresenceManager (who's online)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WebSocket Service (Real-time updates)               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (Cloudflare D1)                                   │
├─────────────────────────────────────────────────────────────┤
│  - channels                                                 │
│  - channel_members                                          │
│  - channel_messages                                         │
│  - mentions                                                 │
│  - threads                                                  │
│  - notifications                                            │
│  - staff_presence                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. FEATURES

### **3.1 Feature Overview**

| Feature | Description | Priority |
|---------|-------------|----------|
| **Group Channels** | Private channels for teams (Designers, Managers, Sales) | HIGH |
| **@Mentions** | Tag staff members in tickets or channels | HIGH |
| **Threads** | Threaded conversations for organized discussions | HIGH |
| **Real-time Notifications** | Instant notifications for mentions/messages | HIGH |
| **Presence Detection** | Show who's online/offline | MEDIUM |
| **Read/Unread Tracking** | Track which messages have been read | MEDIUM |
| **Message Search** | Search messages across channels | MEDIUM |
| **File Sharing** | Share files in channels (future) | LOW |

---

## 4. GROUP CHANNELS

### **4.1 What Are Group Channels?**

**Group Channels** are private chat rooms where specific groups of staff can communicate.

**Examples:**
- **Graphic Design** - All designers discuss artwork issues
- **Managers** - Owners, managers, team leads discuss strategy
- **Sales Team** - Sales reps coordinate on quotes and deals
- **Production** - Production staff discuss order status
- **General** - All staff (company-wide announcements)

### **4.2 Channel Types**

| Channel Type | Description | Who Can Create | Who Can Join |
|--------------|-------------|----------------|--------------|
| **Public** | All staff can see and join | Admin, Manager | Anyone |
| **Private** | Invite-only, hidden from non-members | Admin, Manager | Invited only |
| **Direct Message** | 1-on-1 conversation | Anyone | 2 people only |

### **4.3 Channel Structure**

```typescript
interface Channel {
  id: string;                    // UUID
  name: string;                  // "Graphic Design", "Managers"
  description: string;           // "Discuss artwork and design issues"
  type: 'public' | 'private' | 'dm';
  createdBy: string;             // Staff ID
  createdAt: Date;
  updatedAt: Date;
  
  // Settings
  archived: boolean;             // Archived channels (read-only)
  allowThreads: boolean;         // Allow threaded replies
  allowMentions: boolean;        // Allow @mentions
  
  // Metadata
  memberCount: number;
  messageCount: number;
  lastMessageAt: Date;
  lastMessageBy: string;
}
```

### **4.4 Channel Membership**

```typescript
interface ChannelMember {
  id: string;                    // UUID
  channelId: string;             // Channel ID
  staffId: string;               // Staff member ID
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  
  // Notification settings
  notificationsEnabled: boolean;
  mentionsOnly: boolean;         // Only notify on @mentions
  
  // Read tracking
  lastReadAt: Date;
  lastReadMessageId: string;
}
```

### **4.5 Channel Messages**

```typescript
interface ChannelMessage {
  id: string;                    // UUID
  channelId: string;             // Channel ID
  staffId: string;               // Sender ID
  content: string;               // Message text
  createdAt: Date;
  updatedAt: Date;
  
  // Threading
  threadId: string | null;       // Parent thread ID
  replyCount: number;            // Number of replies
  
  // Mentions
  mentions: string[];            // Array of staff IDs mentioned
  
  // Attachments (future)
  attachments: Attachment[];
  
  // Reactions (future)
  reactions: Reaction[];
  
  // Metadata
  edited: boolean;
  editedAt: Date | null;
  deleted: boolean;
  deletedAt: Date | null;
}
```

### **4.6 How Channels Work**

#### **Creating a Channel**

**Admin/Manager Flow:**
1. Click "Create Channel" in sidebar
2. Enter channel details:
   - Name: "Graphic Design"
   - Description: "Discuss artwork and design issues"
   - Type: Private
3. Add members:
   - Select staff members from list
   - Assign roles (owner, admin, member)
4. Set permissions:
   - Allow threads: Yes
   - Allow mentions: Yes
5. Click "Create"

**Result:**
- Channel created in database
- Members added to `channel_members` table
- Members notified of new channel
- Channel appears in their sidebar

#### **Joining a Channel**

**Public Channels:**
- Staff can browse public channels
- Click "Join" to become a member
- Immediately see channel messages

**Private Channels:**
- Only visible to members
- Must be invited by admin/owner
- Invitation notification sent

#### **Messaging in a Channel**

**Flow:**
1. Staff opens channel
2. Types message in input box
3. Can @mention other members
4. Can attach files (future)
5. Clicks "Send"

**Backend:**
1. Message saved to `channel_messages` table
2. Mentions extracted and saved to `mentions` table
3. WebSocket broadcasts message to all online members
4. Notifications sent to mentioned members
5. Unread count updated for all members

---

## 5. @MENTIONS SYSTEM

### **5.1 What Are @Mentions?**

**@Mentions** allow staff to tag specific people in messages to get their attention.

**Where @Mentions Work:**
- Group Channels
- Ticket internal notes
- Thread replies

**Examples:**
```
@Mike - Can you help with this artwork issue?
@Jessica - Customer asking about VIP benefits
@Tom - Please prioritize this refund request
@Team - Order PERP-8901 is in production
```

### **5.2 Mention Types**

| Mention Type | Syntax | Description |
|--------------|--------|-------------|
| **User Mention** | `@Mike` | Tag specific person |
| **Team Mention** | `@Team` | Tag all channel members |
| **Here Mention** | `@here` | Tag all online members |
| **Channel Mention** | `@channel` | Tag all members (even offline) |

### **5.3 Mention Structure**

```typescript
interface Mention {
  id: string;                    // UUID
  type: 'user' | 'team' | 'here' | 'channel';
  
  // Source
  sourceType: 'channel' | 'ticket' | 'thread';
  sourceId: string;              // Channel/Ticket/Thread ID
  messageId: string;             // Message ID
  
  // People
  mentionedBy: string;           // Staff ID who created mention
  mentionedUsers: string[];      // Array of staff IDs mentioned
  
  // Content
  content: string;               // Full message text
  excerpt: string;               // First 100 chars
  
  // Metadata
  createdAt: Date;
  read: boolean;
  readAt: Date | null;
  
  // Context
  ticketId: string | null;       // If mention is in ticket
  orderId: string | null;        // If mention relates to order
  priority: 'normal' | 'high' | 'critical';
}
```

### **5.4 How @Mentions Work**

#### **Creating a Mention**

**Staff Types:**
```
@Mike - Can you help with this artwork issue? The customer uploaded a low-res file.
```

**Backend Processing:**
1. **Mention Detection:**
   - Regex: `/@(\w+)/g`
   - Finds: `@Mike`
   - Looks up staff member "Mike" in database

2. **Mention Creation:**
   - Create `Mention` record
   - Link to message/ticket/thread
   - Set `mentionedUsers: [mike_id]`

3. **Notification:**
   - Send real-time notification to Mike
   - Add to Mike's "Mentions" inbox
   - Show unread badge

4. **Message Rendering:**
   - Highlight `@Mike` in blue
   - Make it clickable (opens Mike's profile)

#### **Viewing Mentions**

**Mentions Inbox:**
- Click "Mentions" in sidebar
- See all mentions (unread first)
- Filter by:
  - Staff member
  - Time range
  - Read/unread
  - Priority
  - Source (channel, ticket, thread)

**Mention Details:**
- Click mention to see full context
- See entire conversation
- Reply directly
- Mark as read

---

## 6. THREAD CONVERSATIONS

### **6.1 What Are Threads?**

**Threads** allow staff to have organized side conversations without cluttering the main channel.

**Example:**

**Main Channel Message:**
```
@Mike - Can you help with this artwork issue?
```

**Thread Replies:**
```
├─ Mike: Sure! I can see the file. It's 150 DPI but we need 300 DPI.
├─ Jessica: Thanks! Also, this is a VIP customer, so let's prioritize.
└─ Mike: Got it, I'll contact them now and offer our design team's help.
```

### **6.2 Thread Structure**

```typescript
interface Thread {
  id: string;                    // UUID
  parentMessageId: string;       // Original message ID
  channelId: string;             // Channel ID (if in channel)
  ticketId: string | null;       // Ticket ID (if in ticket)
  
  // Participants
  participants: string[];        // Array of staff IDs in thread
  
  // Metadata
  messageCount: number;
  createdAt: Date;
  lastMessageAt: Date;
  lastMessageBy: string;
}
```

### **6.3 How Threads Work**

#### **Starting a Thread**

**Staff Flow:**
1. Hover over any message
2. Click "Reply in thread" button
3. Thread panel opens on right side
4. Type reply
5. Click "Send"

**Backend:**
1. Create `Thread` record (if first reply)
2. Create `ChannelMessage` with `threadId`
3. Update `Thread.messageCount`
4. Notify thread participants
5. Update parent message with reply count

#### **Viewing Threads**

**In Channel:**
- Parent message shows "3 replies" badge
- Click to open thread panel
- See all replies in chronological order

**Thread Panel:**
- Shows parent message at top
- Shows all replies below
- Shows who's typing
- Shows read receipts (future)

---

## 7. NOTIFICATIONS

### **7.1 Notification Types**

| Type | Trigger | Example |
|------|---------|---------|
| **Mention** | Someone @mentions you | "@Mike - Can you help?" |
| **Reply** | Someone replies to your message | "Mike replied to your message" |
| **Channel** | New message in channel | "New message in #Graphic Design" |
| **Thread** | New reply in thread you're in | "New reply in thread" |
| **Assignment** | Ticket assigned to you | "Ticket #1847 assigned to you" |
| **Escalation** | Ticket escalated to you | "Critical ticket escalated" |

### **7.2 Notification Structure**

```typescript
interface Notification {
  id: string;                    // UUID
  staffId: string;               // Recipient staff ID
  type: 'mention' | 'reply' | 'channel' | 'thread' | 'assignment' | 'escalation';
  
  // Content
  title: string;                 // "New mention from Mike"
  message: string;               // "@Mike - Can you help?"
  
  // Source
  sourceType: 'channel' | 'ticket' | 'thread';
  sourceId: string;
  messageId: string | null;
  
  // Metadata
  createdAt: Date;
  read: boolean;
  readAt: Date | null;
  
  // Actions
  actionUrl: string;             // Deep link to source
  actionLabel: string;           // "View Message"
}
```

### **7.3 Notification Delivery**

#### **Real-time (WebSocket)**
- Instant notification when online
- Toast notification in dashboard
- Badge count updated
- Sound played (optional)

#### **In-App Notification Center**
- Click bell icon in header
- See all notifications
- Mark as read
- Clear all

#### **No External Notifications**
- No email
- No SMS
- No Slack
- Everything stays in dashboard

---

## 8. DATABASE SCHEMA

### **8.1 Tables**

#### **channels**
```sql
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('public', 'private', 'dm')),
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Settings
  archived BOOLEAN DEFAULT FALSE,
  allow_threads BOOLEAN DEFAULT TRUE,
  allow_mentions BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  member_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  last_message_at DATETIME,
  last_message_by TEXT,
  
  FOREIGN KEY (created_by) REFERENCES staff_users(id)
);

CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_archived ON channels(archived);
```

#### **channel_members**
```sql
CREATE TABLE channel_members (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'member')),
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Notification settings
  notifications_enabled BOOLEAN DEFAULT TRUE,
  mentions_only BOOLEAN DEFAULT FALSE,
  
  -- Read tracking
  last_read_at DATETIME,
  last_read_message_id TEXT,
  
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE,
  UNIQUE(channel_id, staff_id)
);

CREATE INDEX idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX idx_channel_members_staff ON channel_members(staff_id);
```

#### **channel_messages**
```sql
CREATE TABLE channel_messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Threading
  thread_id TEXT,
  reply_count INTEGER DEFAULT 0,
  
  -- Mentions
  mentions TEXT, -- JSON array of staff IDs
  
  -- Metadata
  edited BOOLEAN DEFAULT FALSE,
  edited_at DATETIME,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at DATETIME,
  
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id),
  FOREIGN KEY (thread_id) REFERENCES threads(id)
);

CREATE INDEX idx_channel_messages_channel ON channel_messages(channel_id);
CREATE INDEX idx_channel_messages_thread ON channel_messages(thread_id);
CREATE INDEX idx_channel_messages_created ON channel_messages(created_at DESC);
```

#### **threads**
```sql
CREATE TABLE threads (
  id TEXT PRIMARY KEY,
  parent_message_id TEXT NOT NULL,
  channel_id TEXT,
  ticket_id TEXT,
  
  -- Participants
  participants TEXT, -- JSON array of staff IDs
  
  -- Metadata
  message_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME,
  last_message_by TEXT,
  
  FOREIGN KEY (parent_message_id) REFERENCES channel_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE INDEX idx_threads_parent ON threads(parent_message_id);
CREATE INDEX idx_threads_channel ON threads(channel_id);
CREATE INDEX idx_threads_ticket ON threads(ticket_id);
```

#### **mentions**
```sql
CREATE TABLE mentions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('user', 'team', 'here', 'channel')),
  
  -- Source
  source_type TEXT NOT NULL CHECK(source_type IN ('channel', 'ticket', 'thread')),
  source_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  
  -- People
  mentioned_by TEXT NOT NULL,
  mentioned_users TEXT NOT NULL, -- JSON array of staff IDs
  
  -- Content
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  
  -- Context
  ticket_id TEXT,
  order_id TEXT,
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('normal', 'high', 'critical')),
  
  FOREIGN KEY (mentioned_by) REFERENCES staff_users(id),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (message_id) REFERENCES channel_messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_mentions_mentioned_users ON mentions(mentioned_users);
CREATE INDEX idx_mentions_read ON mentions(read);
CREATE INDEX idx_mentions_created ON mentions(created_at DESC);
```

#### **notifications**
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('mention', 'reply', 'channel', 'thread', 'assignment', 'escalation')),
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Source
  source_type TEXT CHECK(source_type IN ('channel', 'ticket', 'thread')),
  source_id TEXT,
  message_id TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  
  -- Actions
  action_url TEXT,
  action_label TEXT,
  
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_staff ON notifications(staff_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### **staff_presence**
```sql
CREATE TABLE staff_presence (
  staff_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('online', 'away', 'offline')),
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  current_channel_id TEXT,
  
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE,
  FOREIGN KEY (current_channel_id) REFERENCES channels(id) ON DELETE SET NULL
);

CREATE INDEX idx_staff_presence_status ON staff_presence(status);
```

---

## 9. API ENDPOINTS

### **9.1 Channel Endpoints**

#### **GET /api/channels**
Get all channels for current staff member

**Response:**
```json
{
  "channels": [
    {
      "id": "channel_123",
      "name": "Graphic Design",
      "description": "Discuss artwork and design issues",
      "type": "private",
      "memberCount": 5,
      "unreadCount": 3,
      "lastMessage": {
        "content": "Can someone review this artwork?",
        "from": "Mike",
        "at": "2025-11-28T10:30:00Z"
      }
    }
  ]
}
```

#### **POST /api/channels**
Create a new channel (Admin/Manager only)

**Request:**
```json
{
  "name": "Graphic Design",
  "description": "Discuss artwork and design issues",
  "type": "private",
  "members": ["staff_1", "staff_2", "staff_3"],
  "allowThreads": true,
  "allowMentions": true
}
```

#### **GET /api/channels/:channelId/messages**
Get messages in a channel

**Query Params:**
- `limit`: Number of messages (default: 50)
- `before`: Message ID (pagination)
- `after`: Message ID (pagination)

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "staffId": "staff_1",
      "staffName": "Mike",
      "content": "@Jessica - Can you help with this?",
      "mentions": ["staff_2"],
      "threadId": null,
      "replyCount": 0,
      "createdAt": "2025-11-28T10:30:00Z"
    }
  ],
  "hasMore": true
}
```

#### **POST /api/channels/:channelId/messages**
Send a message to a channel

**Request:**
```json
{
  "content": "@Mike - Can you help with this artwork issue?",
  "threadId": null
}
```

#### **POST /api/channels/:channelId/members**
Add members to a channel (Admin/Owner only)

**Request:**
```json
{
  "staffIds": ["staff_4", "staff_5"],
  "role": "member"
}
```

---

### **9.2 Mention Endpoints**

#### **GET /api/mentions**
Get all mentions for current staff member

**Query Params:**
- `read`: Filter by read status (true/false)
- `priority`: Filter by priority (normal/high/critical)
- `limit`: Number of mentions (default: 50)

**Response:**
```json
{
  "mentions": [
    {
      "id": "mention_123",
      "type": "user",
      "from": "Mike",
      "content": "@Jessica - Can you help with this?",
      "excerpt": "@Jessica - Can you help with this?",
      "sourceType": "channel",
      "sourceId": "channel_123",
      "channelName": "Graphic Design",
      "read": false,
      "createdAt": "2025-11-28T10:30:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### **PUT /api/mentions/:mentionId/read**
Mark a mention as read

---

### **9.3 Thread Endpoints**

#### **GET /api/threads/:threadId/messages**
Get messages in a thread

**Response:**
```json
{
  "thread": {
    "id": "thread_123",
    "parentMessage": {
      "id": "msg_123",
      "content": "@Mike - Can you help?",
      "from": "Jessica"
    },
    "messageCount": 3
  },
  "messages": [
    {
      "id": "msg_124",
      "staffId": "staff_1",
      "staffName": "Mike",
      "content": "Sure! I can see the file.",
      "createdAt": "2025-11-28T10:32:00Z"
    }
  ]
}
```

#### **POST /api/threads/:threadId/messages**
Reply to a thread

**Request:**
```json
{
  "content": "Thanks! This is a VIP customer."
}
```

---

### **9.4 Notification Endpoints**

#### **GET /api/notifications**
Get all notifications for current staff member

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "mention",
      "title": "New mention from Mike",
      "message": "@Jessica - Can you help?",
      "actionUrl": "/channels/channel_123?message=msg_123",
      "actionLabel": "View Message",
      "read": false,
      "createdAt": "2025-11-28T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

#### **PUT /api/notifications/:notificationId/read**
Mark a notification as read

#### **PUT /api/notifications/read-all**
Mark all notifications as read

---

## 10. UI COMPONENTS

### **10.1 Sidebar Navigation**

```
┌─────────────────────────┐
│ 🏠 Dashboard            │
│ 📥 Inbox                │
│ 🎫 All Tickets          │
│ 🤖 AI Chat              │
├─────────────────────────┤
│ CHANNELS                │
│ ├─ # General            │
│ ├─ # Graphic Design  (3)│ ← Unread count
│ ├─ # Managers           │
│ ├─ # Sales Team         │
│ └─ + Create Channel     │
├─────────────────────────┤
│ DIRECT MESSAGES         │
│ ├─ Mike                 │
│ ├─ Jessica           (1)│
│ └─ Tom                  │
├─────────────────────────┤
│ 👥 Customers            │
│ 👤 Staff                │
│ 📱 Communication        │
│ ⚙️ Settings             │
└─────────────────────────┘
```

### **10.2 Channel View**

```
┌─────────────────────────────────────────────────────────────┐
│ # Graphic Design                                   🔔 ⚙️ ℹ️  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mike                                          10:30 AM    │
│  @Jessica - Can you help with this artwork issue? The      │
│  customer uploaded a low-res file.                          │
│  [Reply in thread] [React] [...]                            │
│                                                             │
│  Jessica                                       10:32 AM    │
│  Sure! I can see the file. It's 150 DPI but we need        │
│  300 DPI. I'll contact the customer.                        │
│  [Reply in thread] [React] [...]                            │
│                                                             │
│  Mike                                          10:35 AM    │
│  Thanks! Also, this is a VIP customer, so let's             │
│  prioritize the design optimization.                        │
│  [Reply in thread] [React] [...]                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Type a message... @mention someone                          │
│ [📎] [😊] [Send]                                            │
└─────────────────────────────────────────────────────────────┘
```

### **10.3 Thread Panel**

```
┌─────────────────────────────────────────────────────────────┐
│ Thread                                                   [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PARENT MESSAGE:                                            │
│  Mike                                          10:30 AM    │
│  @Jessica - Can you help with this artwork issue?          │
│                                                             │
│  ───────────────────────────────────────────────────────   │
│                                                             │
│  Jessica                                       10:32 AM    │
│  Sure! I can see the file. It's 150 DPI but we need        │
│  300 DPI.                                                   │
│                                                             │
│  Mike                                          10:35 AM    │
│  Thanks! This is a VIP customer.                            │
│                                                             │
│  Jessica                                       10:40 AM    │
│  Got it, I'll prioritize this.                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Reply to thread...                                          │
│ [Send]                                                      │
└─────────────────────────────────────────────────────────────┘
```

### **10.4 Mentions Inbox**

```
┌─────────────────────────────────────────────────────────────┐
│ Mentions                                    [Mark all read] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔵 Mike mentioned you in #Graphic Design    10:30 AM      │
│     @Jessica - Can you help with this artwork issue?        │
│     [View Message]                                          │
│                                                             │
│  🔵 Tom mentioned you in #Managers           9:15 AM       │
│     @Jessica - Please review this quote before sending      │
│     [View Message]                                          │
│                                                             │
│  ⚪ Sarah mentioned you in Ticket #1847      Yesterday     │
│     @Jessica - Customer asking about VIP benefits           │
│     [View Ticket]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. PERMISSIONS & ACCESS CONTROL

### **11.1 Role-Based Permissions**

| Action | Agent | Team Lead | Manager | Admin |
|--------|-------|-----------|---------|-------|
| **View public channels** | ✅ | ✅ | ✅ | ✅ |
| **Join public channels** | ✅ | ✅ | ✅ | ✅ |
| **Create public channels** | ❌ | ✅ | ✅ | ✅ |
| **Create private channels** | ❌ | ✅ | ✅ | ✅ |
| **Invite to private channels** | ❌ | ✅ | ✅ | ✅ |
| **Delete channels** | ❌ | ❌ | ✅ | ✅ |
| **Archive channels** | ❌ | ✅ | ✅ | ✅ |
| **Send messages** | ✅ | ✅ | ✅ | ✅ |
| **Delete own messages** | ✅ | ✅ | ✅ | ✅ |
| **Delete any messages** | ❌ | ❌ | ✅ | ✅ |
| **@mention anyone** | ✅ | ✅ | ✅ | ✅ |
| **@mention @team/@here/@channel** | ❌ | ✅ | ✅ | ✅ |

### **11.2 Channel-Level Permissions**

**Channel Owner:**
- Can edit channel settings
- Can add/remove members
- Can delete channel
- Can assign admins

**Channel Admin:**
- Can add/remove members
- Can edit channel settings
- Cannot delete channel

**Channel Member:**
- Can send messages
- Can create threads
- Can @mention members
- Cannot add/remove members

---

## 12. IMPLEMENTATION TIMELINE

### **Phase 1: Core Channels (Week 1, 8-10 hours)**
- ✅ Database schema
- ✅ Channel CRUD APIs
- ✅ Channel membership APIs
- ✅ Basic channel UI
- ✅ Message sending/receiving

### **Phase 2: @Mentions (Week 1, 4-6 hours)**
- ✅ Mention detection
- ✅ Mention creation
- ✅ Mentions inbox
- ✅ Mention notifications

### **Phase 3: Threads (Week 2, 4-6 hours)**
- ✅ Thread creation
- ✅ Thread replies
- ✅ Thread UI panel
- ✅ Thread notifications

### **Phase 4: Real-time (Week 2, 4-6 hours)**
- ✅ WebSocket integration
- ✅ Real-time message delivery
- ✅ Presence detection
- ✅ Typing indicators

### **Phase 5: Notifications (Week 2, 2-3 hours)**
- ✅ Notification service
- ✅ Notification center UI
- ✅ Toast notifications
- ✅ Badge counts

**Total:** ~22-31 hours

---

## 13. SUCCESS METRICS

### **Adoption Metrics:**
- % of staff using channels daily
- Number of messages sent per day
- Number of active channels
- Average response time in channels

### **Engagement Metrics:**
- Messages per staff member per day
- @mentions per staff member per day
- Thread participation rate
- Channel membership growth

### **Business Impact:**
- Reduced email volume
- Faster issue resolution
- Improved team collaboration
- Reduced need for meetings

---

## 14. FUTURE ENHANCEMENTS

### **Phase 2 Features (Post-MVP):**
- 📎 File sharing in channels
- 😊 Message reactions (emoji)
- 📌 Pinned messages
- 🔍 Advanced search (full-text)
- 📊 Channel analytics
- 🔔 Custom notification settings per channel
- 📱 Mobile app support
- 🎥 Video/audio calls (future)

---

**Document Version:** 1.0.0  
**Last Updated:** November 28, 2025  
**Status:** Complete - Ready for Implementation  
**Author:** AI Assistant + John Hutchison

