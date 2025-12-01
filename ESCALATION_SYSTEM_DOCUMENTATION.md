# 🚨 Escalation System Documentation

**Date:** November 29, 2025  
**Status:** In Development  
**Priority:** HIGH

---

## 📋 Overview

The Escalation System allows staff members to request assistance from other team members when they need help, advice, or specialized skills to resolve a ticket.

**Key Point:** Escalation is NOT reassignment. It's a collaborative request for help.

---

## 🎯 What is an Escalation?

An **escalation** is when a staff member:
- Needs assistance on how to resolve a ticket
- Requires advice from more experienced staff
- Needs help/skills from another team member to resolve a particular query

**It does NOT:**
- ❌ Transfer ownership of the ticket
- ❌ Automatically change ticket priority to CRITICAL
- ❌ Change the assigned staff member

**It DOES:**
- ✅ Send an @mention message to selected staff
- ✅ Create an alert notification for selected staff
- ✅ Link the message to the specific ticket
- ✅ Appear in the recipient's @mentions window

---

## 🔔 How Escalations Work

### 1. **Initiating an Escalation**
- Staff member clicks "Escalate" button on a ticket
- Modal opens showing ALL available staff members (not just Team Leads/Managers)
- Staff member can select **multiple** people to notify (checkboxes, not radio buttons)
- Staff member writes a message explaining what help they need
- Clicks "Send Escalation"

### 2. **What Happens**
- Selected staff receive an **immediate alert notification** (bell icon)
- An **@mention message** is created and linked to the ticket
- The message includes:
  - The ticket number/link
  - The requesting staff member's name
  - The message/reason for escalation

### 3. **Recipient Experience**
- Escalated ticket mentions appear in their **@Mentions** window
- Escalation mentions are displayed with:
  - **Different color** (higher visual priority)
  - **At the top** of all other mention messages
  - **Linked to the ticket** for easy access

### 4. **Ticket Indicators**
When a ticket has been escalated:
- Shows **@ icon** (mention indicator)
- Shows **🔔 Bell icon** (alert indicator)
- Icons are **colored accordingly** (as per demo)
- Visible on both ticket list and ticket detail views

---

## 🎨 UI/UX Requirements

### Escalate Modal
- ✅ Title: "Escalate Ticket #[number]"
- ✅ Description: "Request assistance from other staff members to help resolve this ticket."
- ✅ Staff selection with checkboxes (multiple selection)
- ✅ Shows all staff (not filtered by role)
- ✅ Shows online/offline status for each staff member
- ✅ Message field with placeholder: "@mention message asking for help or advice on this ticket..."
- ✅ Info note explaining notification behavior
- ✅ "Send Escalation" button (orange theme)

### @Mentions Window (To Be Built)
- [ ] Separate section for escalation mentions
- [ ] Escalations displayed at the top
- [ ] Different background color for escalations (e.g., light orange/amber)
- [ ] Shows ticket number and link
- [ ] Shows requesting staff member
- [ ] Shows timestamp
- [ ] Click to open ticket

### Ticket List View
- [ ] Show @ icon when ticket has escalation mentions
- [ ] Show 🔔 icon when ticket has active alerts
- [ ] Icons should be colored (not gray)
- [ ] Tooltip on hover explaining the icons

### Ticket Detail View
- [ ] Show @ icon in header when escalated
- [ ] Show 🔔 icon in header when escalated
- [ ] Section showing escalation history
- [ ] Who escalated, when, and to whom
- [ ] The escalation message/reason

---

## 🗄️ Database Schema

### Current Tables
```sql
-- mentions table (exists)
CREATE TABLE mentions (
  mention_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  message_id TEXT,
  mentioned_by TEXT NOT NULL,
  mentioned_user TEXT NOT NULL,
  mention_text TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
  FOREIGN KEY (mentioned_by) REFERENCES staff(staff_id),
  FOREIGN KEY (mentioned_user) REFERENCES staff(staff_id)
);

-- notifications table (exists)
CREATE TABLE notifications (
  notification_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES staff(staff_id)
);
```

### Proposed Enhancement
Add `is_escalation` flag to mentions table:
```sql
ALTER TABLE mentions ADD COLUMN is_escalation BOOLEAN DEFAULT 0;
```

This allows us to:
- Filter escalation mentions separately
- Display them with higher priority
- Style them differently in the UI

---

## 📊 Implementation Status

### ✅ Completed
- [x] EscalateModal UI component
- [x] Multiple staff selection (checkboxes)
- [x] Message/reason input field
- [x] Online/offline status display
- [x] Modal integration in TicketDetailPage
- [x] Documentation created

### 🚧 In Progress
- [ ] Backend API endpoint for creating escalations
- [ ] Create mention record when escalation is sent
- [ ] Create notification record for each selected staff
- [ ] Update ticket to show escalation indicators

### 📋 To Do
- [ ] Build @Mentions page/component
- [ ] Implement escalation filtering in @Mentions
- [ ] Add @ and 🔔 icons to ticket list view
- [ ] Add @ and 🔔 icons to ticket detail header
- [ ] Style escalation mentions differently (color, position)
- [ ] Add escalation history section to ticket detail
- [ ] Real-time notifications (WebSocket or polling)
- [ ] Mark escalation as resolved/addressed

---

## 🔗 Related Features

### @Mentions System
- Staff can @mention other staff in internal notes
- Staff can @mention other staff in escalations
- All mentions appear in centralized @Mentions window
- Escalation mentions have higher priority

### Notifications System
- Bell icon in header shows unread notifications
- Escalations trigger immediate notifications
- Notifications link directly to the ticket
- Can be marked as read/unread

### Internal Notes
- Staff can leave private notes on tickets
- Notes can include @mentions
- @mentions in notes also trigger notifications
- Different from escalations (no special priority)

---

## 🎯 User Stories

### Story 1: Junior Agent Needs Help
> **As a** junior support agent  
> **I want to** escalate a ticket to a senior agent  
> **So that** I can get advice on how to handle a complex customer issue

**Acceptance Criteria:**
- Can select multiple senior agents to notify
- Can explain what help I need in a message
- Selected agents receive immediate notification
- Agents can see my request in their @Mentions
- Ticket shows it has been escalated

### Story 2: Technical Issue Requires Specialist
> **As a** support agent  
> **I want to** escalate a ticket to a technical specialist  
> **So that** they can help resolve a technical problem

**Acceptance Criteria:**
- Can select any staff member (not just managers)
- Can select multiple specialists if needed
- Message is linked to the ticket
- Specialists can quickly access the ticket from notification

### Story 3: Viewing Escalation Requests
> **As a** senior staff member  
> **I want to** see escalation requests at the top of my @Mentions  
> **So that** I can prioritize helping colleagues who need assistance

**Acceptance Criteria:**
- Escalations appear at top of @Mentions
- Escalations have different color/styling
- Can see who needs help and why
- Can click to open the ticket directly

---

## 🚀 API Endpoints (To Be Implemented)

### Create Escalation
```typescript
POST /api/tickets/:ticketId/escalate

Request Body:
{
  staffIds: string[],        // Array of staff IDs to notify
  message: string,           // The escalation message
  requestedBy: string        // Staff ID of person requesting help
}

Response:
{
  success: boolean,
  escalation: {
    escalationId: string,
    ticketId: string,
    mentions: Mention[],     // Created mention records
    notifications: Notification[]  // Created notification records
  }
}
```

### Get Escalations for Staff
```typescript
GET /api/mentions/escalations?staffId=xxx

Response:
{
  escalations: [
    {
      mentionId: string,
      ticketId: string,
      ticketNumber: string,
      requestedBy: string,
      requestedByName: string,
      message: string,
      isRead: boolean,
      createdAt: string
    }
  ]
}
```

---

## 📝 Notes

- **Role-Based vs. Skill-Based:** The system doesn't filter by "Team Lead" or "Manager" roles. Any staff member can escalate to any other staff member based on who has the skills/knowledge needed.

- **Not a Priority Change:** Escalating doesn't automatically make a ticket "CRITICAL". The ticket priority remains unchanged unless manually updated.

- **Collaborative, Not Transfer:** The original staff member remains assigned to the ticket. Escalation is about getting help, not passing the ticket off.

- **Visual Indicators:** The @ and 🔔 icons on tickets are important visual cues that help staff quickly identify which tickets have escalation activity.

---

## 🎨 Design References

See the demo site for visual reference:
- Escalation modal design
- @ and 🔔 icon placement
- @Mentions window layout
- Color coding for escalations

---

*Last Updated: November 29, 2025*

