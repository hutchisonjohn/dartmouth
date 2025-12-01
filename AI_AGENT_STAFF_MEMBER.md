# AI Agent as Staff Member
**Priority**: MEDIUM
**Time**: 30 minutes
**Created**: November 29, 2025

---

## 🤖 ISSUE: AI Agent Not a Staff Member

### Problem
The AI Agent processes tickets and can generate draft responses, but it's not set up as an assignable staff member in the system.

### Current Staff Members
1. **John Hutchison** - `00000000-0000-0000-0000-000000000001`
2. **Ted Smith** - `00000000-0000-0000-0000-000000000002`
3. **Sam Johnson** - `00000000-0000-0000-0000-000000000003`
4. ❌ **AI Agent** - NOT IN SYSTEM

---

## 📋 WHAT NEEDS TO BE DONE

### 1. Add AI Agent to Database
**Table**: `staff_users`

```sql
INSERT INTO staff_users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  'ai-agent@dtf.com.au',
  'N/A', -- AI doesn't need login
  'AI',
  'Agent',
  'agent',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

### 2. Add to Frontend Staff Lists

**File**: `packages/customer-service-dashboard/src/pages/TicketsPage.tsx`
```typescript
const staffNames: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001': 'John Hutchison',
  '00000000-0000-0000-0000-000000000002': 'Ted Smith',
  '00000000-0000-0000-0000-000000000003': 'Sam Johnson',
  '00000000-0000-0000-0000-000000000004': 'AI Agent', // NEW
}
```

**File**: `packages/customer-service-dashboard/src/components/ReassignModal.tsx`
```typescript
const staffMembersBase = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'John Hutchison', role: 'Admin', online: true },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Ted Smith', role: 'Agent', online: false },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Sam Johnson', role: 'Agent', online: false },
  { id: '00000000-0000-0000-0000-000000000004', name: 'AI Agent', role: 'AI', online: true }, // NEW - Always online
]
```

**File**: `packages/customer-service-dashboard/src/components/EscalateModal.tsx`
```typescript
const staffMembers = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'John Hutchison', role: 'Admin' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Ted Smith', role: 'Agent' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Sam Johnson', role: 'Agent' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'AI Agent', role: 'AI' }, // NEW
]
```

### 3. Add AI Agent to Sidebar

**File**: `packages/customer-service-dashboard/src/components/layout/Sidebar.tsx`

Add new menu item under "Assigned":
```typescript
<Link
  to="/tickets?assigned=00000000-0000-0000-0000-000000000004"
  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg ${
    location.search.includes('assigned=00000000-0000-0000-0000-000000000004')
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-gray-700 hover:bg-gray-50'
  }`}
>
  <span>🤖 AI Agent</span>
  {ticketCounts.ai > 0 && (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
      location.search.includes('assigned=00000000-0000-0000-0000-000000000004')
        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
        : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400 font-semibold'
    }`}>
      {ticketCounts.ai}
    </span>
  )}
</Link>
```

### 4. Add AI Count to DashboardLayout

**File**: `packages/customer-service-dashboard/src/components/layout/DashboardLayout.tsx`
```typescript
const ticketCounts = {
  // ... existing counts ...
  ai: tickets.filter((t: any) => 
    t.assigned_to === '00000000-0000-0000-0000-000000000004' &&
    (t.status === 'open' || t.status === 'in-progress')
  ).length,
}
```

### 5. Update AI Agent to Auto-Assign

**File**: `packages/worker/src/agents/CustomerServiceAgent.ts`

When AI processes a ticket, it should assign to itself:
```typescript
// After creating draft response
await this.db.prepare(`
  UPDATE tickets 
  SET assigned_to = '00000000-0000-0000-0000-000000000004',
      status = 'in-progress'
  WHERE ticket_id = ?
`).bind(ticketId).run();
```

---

## 🎯 USE CASES

### Use Case 1: AI Handles Simple Queries
1. Customer emails: "What's my order status?"
2. AI Agent auto-assigns ticket to itself
3. AI generates draft response
4. Staff reviews and approves
5. Email sent to customer

### Use Case 2: AI Escalates Complex Issues
1. Customer emails: "I'm FURIOUS! Wrong item shipped!"
2. AI Agent assigns to itself
3. AI detects high priority + negative sentiment
4. AI escalates to human staff member
5. Human takes over

### Use Case 3: Filter AI Tickets
1. Staff clicks "AI Agent" in sidebar
2. See all tickets currently handled by AI
3. Review AI's draft responses
4. Approve or modify as needed

### Use Case 4: Reassign from AI to Human
1. Open ticket assigned to AI Agent
2. Click "Reassign"
3. Select human staff member
4. Human takes over ticket

---

## 🤖 AI AGENT SPECIAL PROPERTIES

### Always Online
- AI Agent is always available (24/7)
- Show green dot in ReassignModal
- Never grayed out

### Cannot Login
- AI doesn't need dashboard access
- No password required
- Just exists as assignee

### Auto-Assignment
- AI can assign tickets to itself
- AI can escalate to humans
- Humans can reassign to AI

### Visual Indicator
- Use 🤖 emoji in UI
- Different color badge (purple?)
- Clear "AI" label

---

## 📊 SIDEBAR LAYOUT (Updated)

```
📋 Tickets
  ├─ All Tickets (14)
  ├─ My Tickets (3)
  ├─ Open (5)
  ├─ Assigned
  │   ├─ Sam Johnson (1)
  │   ├─ Ted Smith (1)
  │   └─ 🤖 AI Agent (2)  ← NEW
  ├─ Unassigned (6)
  ├─ Snoozed (3)
  ├─ VIP (6)
  └─ Resolved (3)
```

---

## 🎨 UI DESIGN

### AI Agent Badge
```typescript
// In tickets table
{ticket.assigned_to === '00000000-0000-0000-0000-000000000004' ? (
  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
    🤖 AI Agent
  </span>
) : (
  // Regular staff badge
)}
```

### ReassignModal AI Entry
```typescript
<label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-indigo-500 bg-indigo-50">
  <input type="radio" ... />
  <div className="w-2 h-2 rounded-full mr-3 bg-green-500" /> {/* Always online */}
  <div className="flex-1">
    <p className="text-sm font-medium text-gray-900">🤖 AI Agent</p>
    <p className="text-xs text-gray-500">Online • AI-powered</p>
  </div>
  <div className="text-right min-w-[60px]">
    <p className="text-xs text-gray-500">2 open</p>
  </div>
</label>
```

---

## 🧪 TESTING

### Test 1: Database Entry
```powershell
cd D:\coding\DARTMOUTH_OS_PROJECT\packages\worker
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT * FROM staff_users WHERE id = '00000000-0000-0000-0000-000000000004';"
```

### Test 2: Assign to AI
1. Open any ticket
2. Click "Reassign"
3. Select "AI Agent"
4. Verify assignment works

### Test 3: AI Queue
1. Click "AI Agent" in sidebar
2. Verify shows AI's tickets
3. Verify count is accurate

### Test 4: Filter by AI
1. Go to tickets page
2. Select "AI Agent" from assignment filter
3. Verify shows only AI's tickets

---

## 📝 IMPLEMENTATION STEPS

### Step 1: Database (5 min)
```powershell
cd D:\coding\DARTMOUTH_OS_PROJECT\packages\worker
npx wrangler d1 execute dartmouth-os-db --remote --command "INSERT INTO staff_users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000004', 'ai-agent@dtf.com.au', 'N/A', 'AI', 'Agent', 'agent', 1, datetime('now'), datetime('now'));"
```

### Step 2: Frontend Staff Lists (10 min)
- Update TicketsPage.tsx (staffNames)
- Update ReassignModal.tsx (staffMembersBase)
- Update EscalateModal.tsx (staffMembers)

### Step 3: Sidebar (10 min)
- Add AI Agent link
- Add AI count to DashboardLayout
- Add active styling

### Step 4: UI Polish (5 min)
- Add 🤖 emoji
- Purple badge color
- "AI-powered" label

### Step 5: Test (5 min)
- Verify database entry
- Test reassignment
- Test filtering
- Test queue display

---

## ⏱️ TIME ESTIMATE

- Database: 5 minutes
- Frontend updates: 20 minutes
- UI polish: 5 minutes
- Testing: 5 minutes
- **Total: 35 minutes**

---

## 🎯 PRIORITY

**Priority**: MEDIUM (not blocking MVP)

**When to do**:
- After fixing critical email bug
- After fixing staff notes display
- After fixing escalation notes
- Before Shopify integration

**Why it matters**:
- Shows which tickets AI is handling
- Allows staff to review AI's work
- Enables AI → Human handoff
- Provides AI performance metrics

---

## 📚 RELATED FEATURES

### Future Enhancements
1. **AI Performance Metrics**
   - How many tickets AI handled
   - AI response accuracy
   - AI escalation rate

2. **AI Training**
   - Staff can mark AI responses as good/bad
   - AI learns from corrections
   - Improves over time

3. **AI Confidence Score**
   - Show AI's confidence in draft
   - Low confidence = auto-escalate
   - High confidence = auto-send?

---

## ✅ CHECKLIST

- [ ] Add AI Agent to database
- [ ] Update TicketsPage.tsx staffNames
- [ ] Update ReassignModal.tsx staffMembersBase
- [ ] Update EscalateModal.tsx staffMembers
- [ ] Add AI Agent to Sidebar
- [ ] Add AI count to DashboardLayout
- [ ] Add AI filtering to TicketsPage
- [ ] Add 🤖 emoji and purple badge
- [ ] Test reassignment to AI
- [ ] Test AI queue filtering
- [ ] Test AI ticket count
- [ ] Update documentation

---

**Status**: 📋 DOCUMENTED - Ready to implement
**Priority**: MEDIUM
**Time**: 35 minutes
**When**: After critical bugs fixed

---

**Created**: November 29, 2025 - 12:05 AM
**Added to**: START_TOMORROW_SESSION.md

