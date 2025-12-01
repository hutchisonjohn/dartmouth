# Customer Service System - Features Documentation

## Table of Contents
1. [Ticket Management](#ticket-management)
2. [Assignment & Reassignment](#assignment--reassignment)
3. [Escalation System](#escalation-system)
4. [Snooze System](#snooze-system)
5. [Response System](#response-system)
6. [Staff Notes](#staff-notes)
7. [Filtering & Queues](#filtering--queues)
8. [UI/UX Features](#uiux-features)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Bulk Operations](#bulk-operations)

---

## 1. Ticket Management

### Ticket Creation
- **Email-to-Ticket**: Automatic ticket creation from incoming emails
- **AI Processing**: Sentiment analysis and priority detection
- **Ticket Numbering**: Sequential ticket numbers (TKT-000001, TKT-000002, etc.)
- **Customer Detection**: Automatic customer profile linking

### Ticket Status
- **Open**: New tickets that need attention
- **In-Progress**: Tickets currently being worked on
- **Snoozed**: Temporarily hidden tickets
- **Resolved**: Completed tickets
- **Closed**: Archived tickets

### Ticket Priority
- **Low**: Standard inquiries
- **Medium**: Important but not urgent
- **High**: Urgent customer issues
- **Critical**: Emergency situations requiring immediate attention

### Ticket Sentiment
- **Positive**: Happy customers
- **Neutral**: Standard inquiries
- **Negative**: Unhappy customers
- **Very Negative**: Extremely upset customers (FURIOUS, TERRIBLE, etc.)

---

## 2. Assignment & Reassignment

### Individual Assignment
- **Manual Assignment**: Assign tickets to specific staff members
- **Reassign Modal**: 
  - Shows all staff members with online/offline status
  - Displays open ticket count for each staff member
  - Prevents assignment to offline staff (grayed out)
  - Shows "You're the only staff member online" message when applicable
  - Radio button selection for single staff member

### Bulk Assignment ⭐ NEW
**Purpose**: Allow staff members with appropriate privileges to reassign multiple tickets at once

**Use Cases**:
- Staff member went home sick
- Staff member on holiday/vacation
- Staff member left the company
- Staff member has too many tickets
- Load balancing across team
- Emergency redistribution

**How It Works**:
1. **Enable Bulk Mode**: Click "Bulk Assign" button in any queue view
2. **Select Tickets**: 
   - Individual selection via checkboxes (one by one)
   - "Select All" option for entire queue
3. **Reassign Button Appears**: Once one or more tickets selected
4. **Opens Reassign Modal**: Same modal as individual reassignment
5. **Bulk Reassignment**: All selected tickets assigned to chosen staff member

**Permissions Required**:
- Team Lead role or higher
- Manager role
- Admin role

**UI Elements**:
- Bulk Assign toggle button (top right of queue)
- Checkboxes appear next to each ticket when enabled
- "Select All" / "Deselect All" options
- Selected count display (e.g., "5 tickets selected")
- Reassign button (only visible when tickets selected)

**Database Operations**:
- Updates `assigned_to` field for all selected tickets
- Creates internal note for each ticket: "Bulk reassigned from [Previous Staff] to [New Staff] by [Current User]"
- Sends notification to new assignee
- Updates ticket status to 'in-progress' if currently 'open'

---

## 3. Escalation System

### Overview
Escalation is a **request for assistance**, NOT a reassignment or priority change.

### How It Works
1. Staff member needs help with a ticket
2. Opens Escalate Modal
3. Selects one or more staff members to request help from
4. Writes reason for escalation
5. System automatically adds @mentions to message
6. Sends alert notification to selected staff

### Escalate Modal Features
- **All Staff Members**: Shows entire team (not just leads/managers)
- **Multiple Selection**: Checkboxes to select multiple staff for help
- **Required Reason Field**: Text area explaining why help is needed
- **Auto @Mentions**: Selected staff automatically added to message as @FirstName
- **Fixed Header/Footer**: Only middle content scrolls
- **Consistent Design**: Matches Reassign and Snooze modals

### Visual Indicators
- **@ Icon**: Shows ticket has mentions
- **Bell Icon**: Shows ticket has alerts
- **Colored Badges**: Escalated mentions appear in different color in @mentions queue
- **Priority Position**: Escalated mentions appear at top of mentions list

### Database Schema
```sql
-- Escalations tracked in mentions table
mentions (
  mention_id TEXT PRIMARY KEY,
  ticket_id TEXT,
  mentioned_user_id TEXT,
  mentioned_by_user_id TEXT,
  message_content TEXT,
  is_escalation BOOLEAN DEFAULT 0,
  is_read BOOLEAN DEFAULT 0,
  created_at TIMESTAMP
)
```

### API Endpoints
- `POST /api/tickets/:id/escalate` - Create escalation
- `GET /api/mentions` - Get all mentions for user
- `PATCH /api/mentions/:id/read` - Mark mention as read

---

## 4. Snooze System

### Overview
Temporarily hide tickets and automatically resume them later.

### Rules
- **Only Assigned Tickets**: Can only snooze tickets assigned to someone
- **Unassigned Cannot Snooze**: Prevents orphaned tickets

### Snooze Options
1. **Later Today** (4 hours from now)
2. **Tomorrow** (Next day, 9:00 AM)
3. **This Week** (Next Monday, 9:00 AM)
4. **Next Week** (Monday after next, 9:00 AM)
5. **Custom Date & Time** (datetime picker)

### Snooze Modal Features
- **Radio Button Selection**: Single option selection
- **Custom Date/Time Picker**: For precise control
- **Confirmation Button**: "Snooze Ticket" at bottom
- **Fixed Header/Footer**: Only middle content scrolls
- **Consistent Design**: Matches other modals

### Auto-Generated Staff Note Format
```
🕒 Snoozed by [Staff First Name] on [Date] at [Time]
Duration: [X hours/days]
Resume: [Date] at [Time]
```

Example:
```
🕒 Snoozed by Sam on Nov 29, 2025 at 2:30 PM
Duration: 4 hours
Resume: Nov 29, 2025 at 6:30 PM
```

### Database Operations
- Updates ticket `status` to 'snoozed'
- Creates internal note with snooze details
- Sets resume time for automatic unsnoozed
- Ticket automatically returns to 'open' status at resume time

### API Endpoints
- `POST /api/tickets/:id/snooze` - Snooze ticket
- `POST /api/tickets/:id/unsnooze` - Manually unsnooze
- Background job checks for tickets to unsnooze every 5 minutes

---

## 5. Response System

### Response Area
- **Collapsible Section**: Hide/show with click or Ctrl+R
- **Default State**: Visible by default
- **Rich Text Editor**: For formatting responses
- **Attachment Support**: Upload files to responses
- **Template Insertion**: Quick action buttons

### Quick Action Templates
- `@order-status` - Insert order status template
- `@tracking` - Insert tracking information template
- `@vip-wallet` - Insert VIP wallet balance template
- `@refund` - Insert refund policy template
- `@return` - Insert return policy template

### Send Reply Options
- **Send Reply**: Immediate send to customer
- **Schedule Reply**: Set specific date/time to send
- **Save as Draft**: Save without sending

### Schedule Reply Modal
- Date picker
- Time picker
- Timezone selection
- Preview before scheduling

---

## 6. Staff Notes

### Internal Notes (Staff Notes)
- **Collapsible Section**: Hide/show with click or Ctrl+I
- **Default State**: Hidden by default
- **Internal Only**: Never visible to customers
- **Rich Text Support**: Formatting, lists, etc.
- **Auto-Generated Notes**: System creates notes for actions

### Auto-Generated Note Examples
- Ticket reassignment
- Status changes
- Snooze/unsnooze actions
- Escalations
- Priority changes

### Staff Note Features
- Timestamp on every note
- Staff member name (first name only)
- Edit history tracking
- Search within notes

---

## 7. Filtering & Queues

### Sidebar Navigation Queues
1. **All Tickets** (excludes resolved/closed)
2. **My Tickets** (assigned to current user, excludes resolved)
3. **Open** (unresolved + assigned, status: open or in-progress)
4. **Unassigned** (unresolved + not assigned)
5. **Snoozed** (status: snoozed)
6. **VIP** (VIP customers, excludes resolved)
7. **Resolved** (status: resolved or closed)
8. **Staff Queues**:
   - Sam Johnson (open/in-progress tickets)
   - Ted Smith (open/in-progress tickets)

### Filter Options (Dropdowns)
- **Status Filter**: All, Open, In-Progress, Snoozed, Resolved
- **Priority Filter**: All, Low, Medium, High, Critical
- **Assignment Filter**: 
  - All Tickets
  - My Tickets
  - VIP Tickets
  - Sam Johnson
  - Ted Smith
  - Unassigned
- **Sentiment Filter**: All, Positive, Neutral, Negative, Very Negative

### Queue Counts
- Real-time ticket counts next to each queue
- Badge indicators (indigo for active, gray for inactive)
- Updates automatically when tickets change

---

## 8. UI/UX Features

### Sidebar Navigation
- **Collapsible**: Click hamburger to expand/collapse
- **Default State**: Collapsed (icon-only view)
- **Icon View**: Shows icons + counts only (64px wide)
- **Expanded View**: Shows full labels + counts (256px wide)
- **Fixed Position**: Hamburger icon stays in place
- **Keyboard Shortcut**: Ctrl+B to toggle

### Ticket Detail View
- **Three-Row Header**: Compact layout for Shopify sidebar
- **Customer Info**: Name, email, VIP status, Shopify icon
- **Ticket Metadata**: Date/time, subject, status, priority, sentiment
- **Message History**: Scrollable conversation view
- **Fixed Bottom Section**: Response Area + Staff Notes stay at bottom
- **Resizable**: Drag handle to expand/contract bottom section

### Shopify Sidebar
- **Slides In/Out**: From right side
- **Customer Profile**: Name, email, order history
- **Order Details**: Recent orders, total spent
- **Quick Actions**: View in Shopify, refund, etc.

### Badges & Indicators
- **Consistent Design**: Rounded badges with colored backgrounds
- **Status Badges**: Color-coded (green=open, yellow=in-progress, etc.)
- **Priority Badges**: Color-coded (red=critical, orange=high, etc.)
- **VIP Star**: ⭐ next to customer name
- **Shopify Icon**: 🛍️ for customers with purchase history
- **Unassigned Badge**: Gray outline badge

### Button Consistency
- **All Buttons**: `rounded-lg` corners
- **Modal Buttons**: Consistent indigo theme across all modals
- **Action Buttons**: Same design/color in Reassign, Escalate, Snooze
- **Send Reply Button**: Darker background with visible outline

---

## 9. Keyboard Shortcuts

### Global Shortcuts
- **Ctrl+B**: Toggle sidebar navigation (expand/collapse)

### Ticket Detail Shortcuts
- **Ctrl+R**: Toggle Response Area (show/hide)
- **Ctrl+I**: Toggle Staff Notes (show/hide)

### Planned Shortcuts
- **Ctrl+S**: Send reply
- **Ctrl+D**: Save as draft
- **Ctrl+E**: Escalate ticket
- **Ctrl+N**: Add staff note
- **Ctrl+/**: Show all shortcuts

---

## 10. Bulk Operations

### Bulk Assign (Detailed)

#### Access Control
```javascript
// Permissions check
const canBulkAssign = (user) => {
  return ['team_lead', 'manager', 'admin'].includes(user.role);
};
```

#### UI Flow
1. **Enable Bulk Mode**
   ```
   [Bulk Assign] button appears in queue header
   → Click to enable
   → Checkboxes appear next to each ticket
   → "Select All" / "Deselect All" options appear
   ```

2. **Select Tickets**
   ```
   □ TKT-000001 | Customer Name | Subject
   □ TKT-000002 | Customer Name | Subject
   ☑ TKT-000003 | Customer Name | Subject (selected)
   □ TKT-000004 | Customer Name | Subject
   
   [Select All] [Deselect All]
   
   "3 tickets selected" badge
   ```

3. **Reassign**
   ```
   [Reassign Selected] button appears (indigo, prominent)
   → Click to open Reassign Modal
   → Select staff member
   → Confirm reassignment
   → All selected tickets reassigned
   ```

#### Database Operations
```sql
-- For each selected ticket
UPDATE tickets 
SET assigned_to = :new_staff_id,
    status = 'in-progress',
    updated_at = CURRENT_TIMESTAMP
WHERE ticket_id IN (:selected_ticket_ids);

-- Create internal note for each
INSERT INTO internal_notes (
  note_id,
  ticket_id,
  user_id,
  content,
  created_at
) VALUES (
  :note_id,
  :ticket_id,
  :current_user_id,
  'Bulk reassigned from [Previous Staff] to [New Staff] by [Current User]',
  CURRENT_TIMESTAMP
);
```

#### Notifications
- **New Assignee**: Email + in-app notification
- **Previous Assignee**: In-app notification (if different)
- **Notification Content**: 
  ```
  [Current User] bulk reassigned 5 tickets to you:
  - TKT-000001: Subject line
  - TKT-000002: Subject line
  - TKT-000003: Subject line
  - TKT-000004: Subject line
  - TKT-000005: Subject line
  ```

#### API Endpoint
```typescript
POST /api/tickets/bulk-assign

Request Body:
{
  ticket_ids: string[],
  new_assignee_id: string,
  reason?: string
}

Response:
{
  success: boolean,
  updated_count: number,
  failed_tickets: string[],
  message: string
}
```

#### Error Handling
- **Permission Denied**: Show error if user lacks privileges
- **Invalid Tickets**: Skip tickets that can't be reassigned
- **Partial Success**: Show which tickets succeeded/failed
- **Rollback**: If critical error, rollback all changes

#### UI Components Needed
```typescript
// BulkAssignMode.tsx
interface BulkAssignModeProps {
  tickets: Ticket[];
  onAssign: (ticketIds: string[], assigneeId: string) => void;
  currentUser: User;
}

// BulkSelectCheckbox.tsx
interface BulkSelectCheckboxProps {
  ticketId: string;
  isSelected: boolean;
  onToggle: (ticketId: string) => void;
}

// BulkAssignButton.tsx
interface BulkAssignButtonProps {
  selectedCount: number;
  onReassign: () => void;
  disabled: boolean;
}
```

---

## Implementation Checklist

### Bulk Assign Feature
- [ ] Add `canBulkAssign` permission check to user context
- [ ] Create `BulkAssignMode` component
- [ ] Add "Bulk Assign" toggle button to queue header
- [ ] Create checkbox column in tickets table
- [ ] Add "Select All" / "Deselect All" functionality
- [ ] Create selected tickets state management
- [ ] Add "Reassign Selected" button (appears when tickets selected)
- [ ] Modify ReassignModal to handle bulk operations
- [ ] Create `POST /api/tickets/bulk-assign` endpoint
- [ ] Add bulk assignment logic to backend controller
- [ ] Create internal notes for each reassigned ticket
- [ ] Send notifications to new assignee
- [ ] Add error handling for partial failures
- [ ] Add loading states during bulk operation
- [ ] Add success/failure toast notifications
- [ ] Update ticket counts after bulk assignment
- [ ] Add audit log entry for bulk assignment
- [ ] Write tests for bulk assignment
- [ ] Document bulk assignment in user guide

---

## Feature Status

### ✅ Complete
- Email-to-ticket system
- AI sentiment analysis
- Ticket detail view
- Shopify sidebar
- Response Area with templates
- Staff Notes
- Reassign Modal (individual)
- Escalate Modal
- Snooze Modal
- Filtering & Queues
- Sidebar navigation (collapsible)
- Keyboard shortcuts (Ctrl+B, Ctrl+R, Ctrl+I)
- Consistent UI design
- Badge system
- Resizable bottom section

### 🚧 In Progress
- Schedule Reply functionality
- Real Shopify data integration
- Customer profile data

### 📋 Planned
- **Bulk Assign** (documented above)
- Bulk status change
- Bulk priority change
- Advanced search
- Saved filters
- Custom views
- Email templates management
- Canned responses
- Macros
- Reporting & analytics
- Performance metrics
- SLA tracking
- Customer satisfaction surveys

---

## Notes for Developers

### Adding New Features
1. Document feature in this file first
2. Create UI mockups if needed
3. Define API endpoints
4. Write database migrations
5. Implement backend logic
6. Implement frontend UI
7. Add tests
8. Update user documentation

### Code Standards
- Use TypeScript for type safety
- Follow existing UI patterns (modals, badges, buttons)
- Maintain consistent color scheme (indigo primary)
- Add keyboard shortcuts where applicable
- Include loading states and error handling
- Write meaningful internal notes for system actions

### Testing Requirements
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing checklist for UI changes

---

**Last Updated**: November 29, 2025
**Version**: 1.0
**Maintainer**: Development Team

