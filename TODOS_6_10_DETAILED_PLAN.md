# Detailed Plan for TODOs #6-10

**Created**: December 1, 2025  
**Purpose**: Discuss and align on implementation approach before coding

---

## 📋 TODO #6: Add AI Agent as Staff Member (35 min)

### What I Think This Means:
- Create an AI agent user in the `staff_users` table
- Display AI responses in the ticket conversation with a special badge (e.g., "🤖 AI Assistant")
- Show AI confidence scores when available
- Track which messages were sent by AI vs human staff

### Questions for You:
1. **Should the AI agent appear in the staff list?** (e.g., in the reassign dropdown, staff sidebar menu)
2. **What should the AI agent's name be?** (e.g., "AI Assistant", "McCarthy AI", "Dartmouth AI")
3. **Should AI responses be editable by staff before sending?** Or are they already sent and we're just displaying them?
4. **Where do AI responses come from?** Is this for future functionality, or is there already an AI response system I should integrate with?
5. **Should AI confidence scores be visible to customers or only to staff?**
6. **What role should the AI agent have?** (admin, manager, agent)

### My Proposed Implementation:
1. Create migration `0012_add_ai_agent_staff.sql`:
   - Insert AI agent into `staff_users` with special ID (e.g., `ai-agent-001`)
   - Email: `ai@system.internal`
   - Name: "AI Assistant" (or whatever you prefer)
   - Role: `agent`
   - Mark as special (maybe add `is_ai` boolean column?)

2. Update `TicketDetailPage.tsx`:
   - Check if `sender_type === 'ai'` in ticket messages
   - Display special badge: `🤖 AI Assistant` instead of regular staff badge
   - Show confidence score if available: `AI Confidence: 95%`
   - Different background color (e.g., light blue instead of white)

3. Update `DashboardLayout.tsx`:
   - Exclude AI agent from staff list in sidebar (or include with special icon?)
   - Exclude AI agent from reassign dropdown (can't reassign to AI)

### Estimated Time: 35 minutes

---

## 📋 TODO #7: Fix Staff Notes Display Layout (1.5 hours)

### What I Think This Means:
- The staff notes section needs better visual design
- Escalation notes should stand out more clearly
- Better spacing, formatting, and hierarchy

### Questions for You:
1. **What specifically is wrong with the current layout?** Can you describe what you don't like?
2. **Should escalation notes have a different background color?** (e.g., yellow for escalations, white for regular notes)
3. **Should we group notes by type?** (e.g., "Escalations" section, "General Notes" section)
4. **Should staff notes show timestamps?** (they currently do, but is the format good?)
5. **Should we add avatars/icons for staff members in notes?**
6. **Should resolved escalations be collapsed or hidden?** Or always visible?

### My Proposed Implementation:
1. Improve visual hierarchy:
   - Larger, bolder headings for escalation notes
   - Clear visual separation between note types
   - Better spacing (more padding/margins)

2. Color coding:
   - Escalation notes: Yellow/amber background
   - Regular notes: White/gray background
   - Resolved escalations: Green tint

3. Add staff avatars:
   - Show staff member's initials in a circle next to each note
   - Color-coded by staff member

4. Better formatting:
   - Use cards/boxes for each note
   - Add subtle shadows for depth
   - Improve typography (font sizes, weights)

### Estimated Time: 1.5 hours

---

## 📋 TODO #8: Implement Bulk Ticket Reassignment (2 hours)

### What I Think This Means:
- Select multiple tickets from the ticket list
- Reassign all selected tickets to a staff member at once
- Possibly bulk status changes too

### Questions for You:
1. **Should this be checkboxes on the ticket list?** (check multiple tickets, then "Reassign Selected" button)
2. **What bulk actions do you want?**
   - Bulk reassign (assign to staff member)
   - Bulk status change (mark as resolved, in-progress, etc.)
   - Bulk close
   - Bulk delete?
3. **Should there be a limit on how many tickets can be selected at once?** (e.g., max 50)
4. **Should bulk actions require confirmation?** (e.g., "Are you sure you want to reassign 25 tickets to Sam?")
5. **Should this be available to all roles or just admin/manager?**
6. **Should bulk actions create internal notes?** (e.g., "Bulk reassigned by John")

### My Proposed Implementation:
1. Add checkboxes to ticket list:
   - Checkbox in table header (select all visible)
   - Checkbox for each ticket row
   - Show count of selected tickets

2. Add bulk action bar (appears when tickets selected):
   - "X tickets selected"
   - "Reassign" button → opens modal with staff dropdown
   - "Change Status" button → opens modal with status dropdown
   - "Close" button → bulk close with confirmation
   - "Deselect All" button

3. Backend endpoints:
   - `POST /api/tickets/bulk-reassign` - reassign multiple tickets
   - `POST /api/tickets/bulk-status` - change status for multiple tickets
   - `POST /api/tickets/bulk-close` - close multiple tickets

4. Add confirmation modals:
   - Show summary before executing (e.g., "Reassign 15 tickets to Sam?")
   - Show success message after (e.g., "15 tickets reassigned successfully")

### Estimated Time: 2 hours

---

## 📋 TODO #9: Add Email Signature Functionality

### What I Think This Means:
- Staff members can have email signatures
- Signatures automatically added to outgoing emails
- Tenant default signature + per-staff override

### Questions for You:
1. **Is this part of Email System V2?** (I already built the backend for this)
2. **Should we build the UI now or wait until Email V2 is fully live?**
3. **Where should signature settings be?**
   - In user profile/settings?
   - In a separate "Signatures" page?
   - In the email compose area?
4. **What placeholders should be supported?**
   - `{{agent_name}}` - Staff member's name
   - `{{agent_email}}` - Staff member's email
   - `{{agent_role}}` - Staff member's role
   - `{{tenant_name}}` - Company name
   - Others?
5. **Should signatures be HTML or plain text?** (I built it for HTML)
6. **Should there be a signature preview?**

### My Proposed Implementation:
**Option A: Wait for Email V2** (Recommended)
- The backend is already built in `MailChannelsService.ts`
- Wait until Email V2 is live and tested
- Then build the UI for managing signatures

**Option B: Build UI Now**
1. Add "Signatures" page to dashboard:
   - Rich text editor for signature
   - Placeholder buttons (click to insert)
   - Live preview
   - Save button

2. Add signature management endpoints:
   - `GET /api/staff/:id/signature` - get staff signature
   - `PUT /api/staff/:id/signature` - update staff signature
   - `GET /api/tenants/:id/signature` - get tenant default

3. Update settings page:
   - Add "Email Signature" section
   - Link to full signature editor

### Estimated Time: 2-3 hours (if building UI now)

---

## 📋 TODO #10: Implement Merge Tickets Feature (3 hours)

### What I Think This Means:
- Combine duplicate tickets into one
- Preserve all messages and notes from both tickets
- Update references and close the duplicate

### Questions for You:
1. **How should staff select which tickets to merge?**
   - From ticket detail page (e.g., "Merge with..." button)?
   - From ticket list (select 2+ tickets, then "Merge" button)?
2. **Which ticket becomes the "primary" ticket?** (keeps the ticket number)
   - Oldest ticket?
   - User selects?
   - Ticket with most messages?
3. **What happens to the merged ticket?**
   - Closed with status "merged"?
   - Deleted?
   - Marked as duplicate?
4. **Should merged messages be clearly marked?**
   - E.g., "--- Messages from Ticket #1234 ---"
   - Different background color?
   - Timestamp preserved?
5. **What about ticket metadata?**
   - Which ticket's priority/category/tags are kept?
   - Merge or keep primary?
6. **Should merging be reversible?** (can you "unmerge"?)
7. **Should this require admin/manager role?** Or can agents merge?

### My Proposed Implementation:
1. Add "Merge Ticket" button to ticket detail page:
   - Opens modal: "Merge this ticket with..."
   - Search/select another ticket by number or subject
   - Show preview of both tickets
   - Select which is primary (or auto-select oldest)

2. Merge process:
   - Copy all messages from secondary ticket to primary
   - Add separator message: "--- Merged from Ticket #1234 ---"
   - Copy all internal notes
   - Copy all escalations
   - Update secondary ticket status to "merged"
   - Add reference: `merged_into_ticket_id`
   - Create internal note on both tickets: "Merged with Ticket #XXXX"

3. Backend endpoint:
   - `POST /api/tickets/:id/merge`
   - Body: `{ mergeWithTicketId: "ticket_123" }`
   - Returns: updated primary ticket

4. Database changes:
   - Add `merged_into_ticket_id` column to `tickets` table
   - Add "merged" to status enum

5. UI updates:
   - Show merged messages with special styling
   - Show "Merged from Ticket #1234" badge
   - Link to original merged ticket (for reference)

### Estimated Time: 3 hours

---

## 🎯 Summary & Questions

### Total Estimated Time: 8-9 hours

### Priority Order (My Recommendation):
1. **#6 - AI Agent** (35 min) - Quick win, foundational
2. **#8 - Bulk Reassignment** (2 hours) - High value, frequently requested
3. **#7 - Staff Notes Layout** (1.5 hours) - Polish, improves UX
4. **#10 - Merge Tickets** (3 hours) - Complex but valuable
5. **#9 - Signatures** (wait for Email V2 or 2-3 hours) - Already built backend

### Key Questions to Discuss:
1. **AI Agent (#6)**: What's the purpose? Is this for future AI responses or existing functionality?
2. **Staff Notes (#7)**: What specifically needs fixing? Can you show me or describe?
3. **Bulk Actions (#8)**: What actions do you want? Just reassign or more?
4. **Signatures (#9)**: Build UI now or wait for Email V2 to be fully live?
5. **Merge Tickets (#10)**: How should the merge UI work? Which ticket is primary?

---

**Let's discuss! What are your thoughts on each of these?**

