# ⏰ Snooze System Documentation

**Date:** November 29, 2025  
**Status:** In Development  
**Priority:** HIGH

---

## 📋 Overview

The Snooze System allows staff members to temporarily hide tickets and automatically resume them at a specified time. This helps manage workload and ensures tickets resurface when they need attention.

---

## 🎯 What is Snoozing?

**Snoozing** a ticket temporarily removes it from the active ticket list and automatically brings it back at a specified time.

### **Key Rules:**

1. **Only Assigned Tickets Can Be Snoozed**
   - ❌ Unassigned tickets CANNOT be snoozed
   - ✅ Only tickets assigned to a staff member can be snoozed
   - Reason: Snoozing is a personal workflow tool for assigned staff

2. **Snooze Creates a Staff Note**
   - Automatically adds a `@snoozed` mention to staff notes
   - Includes:
     - Staff member name who snoozed it
     - Date/time stamp
     - Duration of the snooze
     - When it will resume

3. **Automatic Resume**
   - Ticket automatically reappears when snooze expires
   - Status changes back to previous state (e.g., `open`, `in-progress`)
   - Staff member receives notification that ticket has resumed

---

## 🔔 How Snoozing Works

### 1. **Initiating a Snooze**
- Staff member opens an assigned ticket
- Clicks "Snooze" button
- Modal opens with snooze duration options:
  - Later Today (3 hours)
  - Tomorrow (next business day at 9:00 AM)
  - This Week (Friday at 9:00 AM)
  - Next Week (Following Monday at 9:00 AM)
  - Custom Date & Time
- Selects duration and clicks "Snooze Ticket"

### 2. **Validation**
- System checks if ticket is assigned
- If unassigned → Show error: "Only assigned tickets can be snoozed"
- If assigned → Proceed with snooze

### 3. **What Happens**
- Ticket status changes to `snoozed`
- Ticket removed from active lists (except "Snoozed" filter)
- **Staff note automatically created** with format:
  ```
  @snoozed by [Staff Name] on [Date/Time]
  Duration: [X hours/days]
  Will resume: [Date/Time]
  ```
- Snooze record created in database

### 4. **When Snooze Expires**
- Cron job or scheduled task checks for expired snoozes
- Ticket status reverts to previous status (e.g., `open`, `in-progress`)
- Ticket reappears in assigned staff's queue
- Optional: Notification sent to assigned staff

---

## 🎨 UI/UX Requirements

### Snooze Button
- ✅ Only enabled when ticket is assigned
- ❌ Disabled/hidden when ticket is unassigned
- Tooltip: "Only assigned tickets can be snoozed" (when disabled)

### Snooze Modal
- ✅ Title: "Snooze Ticket #[number]"
- ✅ Description: "Temporarily hide this ticket and automatically resume it later."
- ✅ Radio button selection for duration
- ✅ Custom date/time picker option
- ✅ "Snooze Ticket" button (purple theme)
- ✅ Validation before submission

### Staff Notes Section
- ✅ Auto-generated `@snoozed` note appears immediately
- ✅ Different styling for system-generated notes
- ✅ Shows who snoozed, when, and duration
- ✅ Cannot be edited or deleted (system note)

### Snoozed Tickets View
- Shows all snoozed tickets
- Displays "Resume at: [Date/Time]"
- Option to "Unsnooze" early
- Shows time remaining until resume

---

## 🗄️ Database Schema

### Current Tables

```sql
-- tickets table
CREATE TABLE tickets (
  ticket_id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  assigned_to TEXT,
  -- ... other fields
);

-- internal_notes table
CREATE TABLE internal_notes (
  note_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  note_text TEXT NOT NULL,
  is_system_note BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);
```

### Proposed Enhancement

Add snooze tracking fields:

```sql
-- Add to tickets table
ALTER TABLE tickets ADD COLUMN snoozed_until TEXT;
ALTER TABLE tickets ADD COLUMN snoozed_by TEXT;
ALTER TABLE tickets ADD COLUMN previous_status TEXT;

-- Or create dedicated snooze_history table
CREATE TABLE snooze_history (
  snooze_id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  snoozed_at TEXT NOT NULL,
  snooze_until TEXT NOT NULL,
  duration_hours INTEGER,
  resumed_at TEXT,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);
```

---

## 📊 Implementation Checklist

### ✅ Completed
- [x] SnoozeModal UI component
- [x] Duration selection options
- [x] Custom date/time picker
- [x] Modal integration in TicketDetailPage
- [x] Basic snooze handler

### 🚧 In Progress
- [ ] Add validation: Check if ticket is assigned
- [ ] Disable snooze button for unassigned tickets
- [ ] Auto-generate `@snoozed` staff note
- [ ] Update backend snooze endpoint

### 📋 To Do
- [ ] Store previous status before snoozing
- [ ] Create snooze_history record
- [ ] Build cron job/scheduled task for auto-resume
- [ ] Implement unsnooze functionality
- [ ] Add notification when ticket resumes
- [ ] Build "Snoozed Tickets" view
- [ ] Show time remaining on snoozed tickets
- [ ] Add snooze history to ticket detail

---

## 🔗 Staff Note Format

### Auto-Generated Snooze Note

**Format:**
```
@snoozed by [Staff First Name] on [Day, Mon DD, YYYY at HH:MM AM/PM]
Duration: [X hours] / [X days]
Will resume: [Day, Mon DD, YYYY at HH:MM AM/PM]
```

**Example:**
```
@snoozed by John on Friday, Nov 29, 2025 at 2:30 PM
Duration: 3 hours
Will resume: Friday, Nov 29, 2025 at 5:30 PM
```

**Technical Details:**
- Created as `is_system_note = 1` (cannot be edited/deleted)
- `staff_id` = staff member who snoozed it
- `note_text` = formatted message above
- Includes `@snoozed` mention for filtering
- Timestamp in user's timezone

---

## 🎯 User Stories

### Story 1: Staff Member Snoozes Ticket
> **As a** support agent  
> **I want to** snooze a ticket I'm working on  
> **So that** I can focus on urgent issues and have it resurface later

**Acceptance Criteria:**
- Can only snooze tickets assigned to me
- Can choose from preset durations or custom time
- Ticket disappears from my active queue
- Ticket automatically returns at specified time
- Staff note records the snooze action

### Story 2: Cannot Snooze Unassigned Ticket
> **As a** support agent  
> **I want to** be prevented from snoozing unassigned tickets  
> **So that** tickets don't get lost in the system

**Acceptance Criteria:**
- Snooze button is disabled for unassigned tickets
- Tooltip explains why it's disabled
- Error message if somehow attempted
- Only assigned tickets can be snoozed

### Story 3: View Snoozed Tickets
> **As a** support agent  
> **I want to** see all my snoozed tickets  
> **So that** I can track what's coming back and when

**Acceptance Criteria:**
- "Snoozed" filter shows all snoozed tickets
- Shows time remaining until resume
- Can unsnooze early if needed
- Shows who snoozed it and when

---

## 🚀 API Endpoints

### Snooze Ticket
```typescript
POST /api/tickets/:ticketId/snooze

Request Body:
{
  snoozeUntil: string,        // ISO datetime
  duration: string,           // e.g., "3h", "1d", "custom"
  staffId: string             // Staff member snoozing
}

Response:
{
  success: boolean,
  ticket: {
    ticketId: string,
    status: 'snoozed',
    snoozedUntil: string,
    snoozedBy: string
  },
  staffNote: {
    noteId: string,
    noteText: string,
    isSystemNote: true
  }
}

Validation:
- Check if ticket.assigned_to is not null
- Return 400 error if unassigned
```

### Unsnooze Ticket
```typescript
POST /api/tickets/:ticketId/unsnooze

Request Body:
{
  staffId: string             // Staff member unsnoozing
}

Response:
{
  success: boolean,
  ticket: {
    ticketId: string,
    status: string,           // Reverted to previous status
    snoozedUntil: null
  }
}
```

### Get Snoozed Tickets
```typescript
GET /api/tickets/snoozed?staffId=xxx

Response:
{
  tickets: [
    {
      ticketId: string,
      ticketNumber: string,
      subject: string,
      snoozedUntil: string,
      snoozedBy: string,
      snoozedAt: string,
      timeRemaining: string,  // e.g., "2 hours 15 minutes"
      canUnsnooze: boolean
    }
  ]
}
```

---

## ⚙️ Backend Logic

### Snooze Handler (Updated)

```typescript
async function snoozeTicket(ticketId: string, snoozeUntil: string, staffId: string) {
  // 1. Validate ticket is assigned
  const ticket = await getTicket(ticketId)
  if (!ticket.assigned_to) {
    throw new Error('Only assigned tickets can be snoozed')
  }
  
  // 2. Store previous status
  const previousStatus = ticket.status
  
  // 3. Update ticket
  await updateTicket(ticketId, {
    status: 'snoozed',
    snoozed_until: snoozeUntil,
    snoozed_by: staffId,
    previous_status: previousStatus
  })
  
  // 4. Calculate duration
  const now = new Date()
  const resumeTime = new Date(snoozeUntil)
  const durationMs = resumeTime.getTime() - now.getTime()
  const durationHours = Math.round(durationMs / (1000 * 60 * 60))
  
  // 5. Create staff note with @snoozed mention
  const staffName = await getStaffName(staffId)
  const noteText = `@snoozed by ${staffName} on ${formatDateTime(now)}
Duration: ${formatDuration(durationHours)}
Will resume: ${formatDateTime(resumeTime)}`
  
  await createInternalNote({
    ticket_id: ticketId,
    staff_id: staffId,
    note_text: noteText,
    is_system_note: true
  })
  
  return { success: true }
}
```

### Auto-Resume Cron Job

```typescript
// Run every minute
async function checkExpiredSnoozes() {
  const now = new Date().toISOString()
  
  // Find all snoozed tickets where snooze_until <= now
  const expiredTickets = await db.query(`
    SELECT ticket_id, previous_status, assigned_to
    FROM tickets
    WHERE status = 'snoozed'
    AND snoozed_until <= ?
  `, [now])
  
  for (const ticket of expiredTickets) {
    // Revert to previous status
    await updateTicket(ticket.ticket_id, {
      status: ticket.previous_status || 'open',
      snoozed_until: null,
      snoozed_by: null
    })
    
    // Optional: Send notification to assigned staff
    await sendNotification(ticket.assigned_to, {
      type: 'ticket_resumed',
      ticketId: ticket.ticket_id,
      message: 'A snoozed ticket has resumed'
    })
  }
}
```

---

## 📝 Notes

- **Assignment Required:** This is a hard requirement. Unassigned tickets cannot be snoozed under any circumstances.

- **Staff Note Tracking:** The `@snoozed` mention in staff notes provides an audit trail of all snooze actions.

- **Time Zones:** All times should be stored in UTC and displayed in the user's local timezone.

- **Business Hours:** "Tomorrow at 9:00 AM" and similar options should respect business hours configuration.

- **Multiple Snoozes:** A ticket can be snoozed multiple times. Each snooze creates a new staff note.

---

*Last Updated: November 29, 2025*

