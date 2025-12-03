# 🚀 NEW FEATURES BEYOND ORIGINAL ARCHITECTURE

**Document Created:** December 4, 2025  
**Last Updated:** December 4, 2025 (Late Night)  
**Purpose:** Document all significant features added during development that were NOT in the original blueprint or build plan

---

## 📋 OVERVIEW

During the development of McCarthy AI Dartmouth OS, numerous features were added that go beyond the original architecture documents. These additions represent significant enhancements to the system's capabilities, user experience, and AI intelligence.

**Original Architecture Documents:**
- `DARTMOUTH_OS_BLUEPRINT_2025.md` - System blueprint
- `MASTER_API_ARCHITECTURE.md` - API design
- Original build plan documents

**This document covers features added between December 2-4, 2025.**

---

## 🔥 MAJOR NEW FEATURES

### 1. MULTI-TENANT REGIONAL SETTINGS SYSTEM (PLANNED)

**Status:** 🔜 To Be Implemented

**What It Does:** Provides configurable regional settings at both tenant (Dartmouth OS) level and agent level, enabling true multi-tenant SaaS deployment for any country.

**Architecture:**
```
Dartmouth OS Settings (TENANT DEFAULTS)
├── Timezone: Australia/Brisbane (default)
├── Language: Australian English (default)
├── Measurement: Metric (default)
├── Currency: AUD (default)
├── Date Format: DD/MM/YYYY (default)
└── Time Format: 12-hour (default)
    │
    ├── Agent A (inherits tenant defaults)
    │
    ├── Agent B (OVERRIDES for US market)
    │   ├── Timezone: America/New_York
    │   ├── Language: American English
    │   ├── Measurement: Imperial
    │   └── Currency: USD
    │
    └── Agent C (inherits tenant defaults)
```

**Tenant-Level Settings (Dartmouth OS Settings):**
| Setting | Default | Options |
|---------|---------|---------|
| **Timezone** | Australia/Brisbane | All IANA timezones |
| **Language/Spelling** | Australian English (en-AU) | en-AU, en-GB, en-US, en-CA |
| **Measurement System** | Metric | Metric, Imperial |
| **Currency** | AUD | AUD, USD, GBP, EUR, NZD, CAD, etc. |
| **Date Format** | DD/MM/YYYY | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD |
| **Time Format** | 12-hour | 12-hour, 24-hour |
| **Business Name** | (required) | Text |
| **Business Email** | (required) | Email |
| **Business Phone** | (optional) | Phone |
| **Business Address** | (optional) | Text |
| **Business Website** | (optional) | URL |

**Agent-Level Overrides:**
- Each agent can override ANY tenant setting
- If agent setting is NULL → inherits from tenant
- Enables different agents for different regions/markets

**Database Tables:**
```sql
-- Tenant Settings (one row per tenant)
CREATE TABLE tenant_settings (
  tenant_id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  business_website TEXT,
  timezone TEXT DEFAULT 'Australia/Brisbane',
  language TEXT DEFAULT 'en-AU',
  measurement_system TEXT DEFAULT 'metric',
  currency TEXT DEFAULT 'AUD',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT '12h',
  created_at TEXT,
  updated_at TEXT
);

-- Agent Overrides (nullable = inherit from tenant)
ALTER TABLE agents ADD COLUMN timezone TEXT;
ALTER TABLE agents ADD COLUMN language TEXT;
ALTER TABLE agents ADD COLUMN measurement_system TEXT;
ALTER TABLE agents ADD COLUMN currency TEXT;
ALTER TABLE agents ADD COLUMN date_format TEXT;
ALTER TABLE agents ADD COLUMN time_format TEXT;
```

**UI Location:**
```
Settings (sidebar)
├── Dartmouth OS Settings ← NEW
│   ├── Business Information
│   ├── Regional Settings
│   └── Date/Time Formats
│
└── AI Agent
    └── Regional Overrides ← NEW (per agent)
```

**KnowledgeService Integration:**
- Loads tenant settings from database
- Injects regional context into AI prompts dynamically
- Example prompt injection:
```
# Regional Settings
- Timezone: Australia/Brisbane
- Language: Australian English (use colour, metre, organisation)
- Measurement: Metric (cm, kg, km)
- Currency: AUD ($)
- Date Format: DD/MM/YYYY
```

**Impact:** Enables true SaaS deployment for any country without code changes.

---

### 2. KNOWLEDGE SERVICE (AI Learning Enhancement)

**What It Does:** Connects the AI to all stored knowledge sources in real-time.

**Components:**
| Component | Description |
|-----------|-------------|
| **System Message Config Loader** | Loads role, personality, do's/don'ts from database |
| **Learning Examples Injector** | Fetches top 5 high-quality (4+ stars) responses as few-shot examples |
| **RAG Document Search** | Keyword-based search across uploaded knowledge documents |
| **Knowledge Context Builder** | Combines all sources into a single context (~11,000 chars) |

**Files Created:**
- `packages/worker/src/services/KnowledgeService.ts`

**Impact:** AI responses now use actual business knowledge, policies, and past high-quality responses instead of generic LLM output.

---

### 2. LIVE CHAT SYSTEM (Complete Widget + Dashboard)

**NOT in original architecture.** This is a full real-time chat system.

**Customer-Facing Widget:**
| Feature | Description |
|---------|-------------|
| Embeddable JavaScript widget | Single script tag deployment |
| Pre-chat form | Collects name & email before chat |
| Real-time messaging | Polling-based updates |
| Session persistence | Survives page refresh |
| File attachments | Base64 encoded uploads |
| Customizable appearance | Colors, messages, button text |
| Business hours display | Shows open/closed status |
| Online/Offline indicator | Staff availability status |
| Pill-shaped button | With configurable text |
| AI sparkles icon | Custom branding |
| New chat button (+) | Start fresh conversation |

**Staff Dashboard:**
| Feature | Description |
|---------|-------------|
| 4-Tab Interface | AI, Staff Live, Queued, Closed |
| Tab Counts | Badge numbers per tab |
| Conversation List | Customer info, priority, sentiment |
| Threaded Messages | Like email, not chat bubbles |
| Take Over Button | AI → Staff handoff |
| Pick Up Button | Queue → Staff assignment |
| Close Chat Modal | Resolved vs Inactive options |
| Reply Input | Staff can respond directly |

**AI Integration:**
| Feature | Description |
|---------|-------------|
| AI-First Handling | All new chats go to AI |
| Human Escalation | Detects "speak to human" phrases |
| Callback Requests | Detects "call me back" phrases |
| Phone Capture | Collects callback numbers |
| Callback Tickets | Creates high-priority tickets |
| Staff Availability Check | Before escalation |

**Files Created:**
- `packages/chat-widget/` - Entire new package
- `packages/worker/src/controllers/chat-messages.ts`
- `packages/worker/src/controllers/chat.ts`
- `packages/customer-service-dashboard/src/pages/ChatDashboardPage.tsx`
- `packages/customer-service-dashboard/src/pages/ChatWidgetSettingsPage.tsx`
- `packages/customer-service-dashboard/src/pages/ChatEmbedCodePage.tsx`

**Database Tables:**
- `chat_conversations`
- `chat_messages`
- `chat_widget_settings`

---

### 3. RAG KNOWLEDGE BASE UI

**What It Does:** Allows admins to upload and manage documents the AI uses for responses.

**Features:**
| Feature | Description |
|---------|-------------|
| Drag & Drop Upload | Easy document upload |
| Category Selection | Policies, Products, FAQ, General, Other |
| Document List | Title, filename, category, word count, date |
| Delete Documents | Remove outdated content |
| Reprocess All | Refresh embeddings |
| Format Support | .md, .txt, .pdf (max 5MB) |

**Files Created:**
- `packages/customer-service-dashboard/src/pages/AIAgentKnowledgePage.tsx`
- `packages/worker/src/controllers/ai-agent.ts`

**Database Table:**
- `ai_knowledge_documents`

---

### 4. SYSTEM MESSAGE CONFIGURATION UI

**What It Does:** Allows admins to configure the AI's personality without code changes.

**Configurable Sections:**
| Section | Purpose |
|---------|---------|
| Role Definition | Who is the AI? |
| Personality Traits | How should it behave? |
| Responsibilities | What should it do? |
| Do's | Best practices |
| Don'ts | Things to avoid |
| Tone of Voice | Response style |
| Custom Instructions | Additional rules |

**Features:**
- Save configuration
- Reset to default
- Full preview
- Character count
- Tips for better AI

**Files Created:**
- `packages/customer-service-dashboard/src/pages/AIAgentSystemMessagePage.tsx`

**Database Table:**
- `ai_system_message_config`

---

### 5. TICKET MERGING SYSTEM

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Multi-Select | Checkbox selection on ticket list |
| Merge Button | Appears when 2+ selected |
| Same Email Restriction | Can only merge tickets from same customer |
| Chronological Messages | All messages combined in time order |
| Primary Ticket | First selected becomes primary |
| Staff Note | Records merge action with date/time |
| Merge Banner | Shows on merged ticket detail |

**Files Modified:**
- `packages/customer-service-dashboard/src/pages/TicketsPage.tsx`
- `packages/customer-service-dashboard/src/pages/TicketDetailPage.tsx`
- `packages/worker/src/controllers/tickets.ts`

**Database Columns Added:**
- `tickets.merged_from`
- `tickets.merged_at`
- `tickets.merged_by`

---

### 6. BULK TICKET REASSIGNMENT

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Multi-Select | Same as merge feature |
| Reassign Button | Appears when tickets selected |
| Staff Dropdown | Select target staff member |
| Staff Note | Records bulk action with date/time |
| Success Notification | Confirms reassignment |

**Files Modified:**
- `packages/customer-service-dashboard/src/pages/TicketsPage.tsx`
- `packages/worker/src/controllers/tickets.ts`

---

### 7. TICKET SEARCH SYSTEM

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Search Icon | Next to ticket count |
| Expandable Input | Click to show search box |
| Multi-Field Search | Ticket #, customer name, email, description |
| Comma-Separated | Search multiple ticket numbers at once |
| Real-Time Filter | Results update as you type |

**Files Modified:**
- `packages/customer-service-dashboard/src/pages/TicketsPage.tsx`

---

### 8. 30-MINUTE SNOOZE OPTION

**Original only had 1hr, 4hr, tomorrow, next week.**

**Features:**
| Feature | Description |
|---------|-------------|
| 30m Option | Quick snooze for brief follow-ups |
| Auto-Unsnooze | Cron job checks every 5 minutes |
| Staff Note | Records snooze with date/time |

**Files Modified:**
- `packages/customer-service-dashboard/src/components/SnoozeModal.tsx`
- `packages/worker/src/workers/snooze-expiry-checker.ts`

---

### 9. STAFF AVAILABILITY SYSTEM

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Status Toggle | Online / Away / Offline |
| Sidebar Display | Shows current status |
| Chat Integration | Only online staff get escalations |
| Persistent State | Saved to database |

**Files Created:**
- `packages/customer-service-dashboard/src/components/StaffAvailabilityToggle.tsx`

**Database Column Added:**
- `staff_users.availability_status`

---

### 10. BUSINESS HOURS CONFIGURATION

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Day-by-Day Config | Mon-Sun (Sunday last) |
| Open/Close Times | Dropdown selectors |
| Open/Closed Toggle | Per day |
| Timezone Setting | Dropdown selector |
| Chat Widget Integration | Shows hours to customers |

**Files Created:**
- `packages/customer-service-dashboard/src/pages/BusinessHoursPage.tsx`

**Database Table:**
- `business_hours`

---

### 11. AI AGENT ANALYTICS DASHBOARD

**NOT in original architecture.** Original only mentioned basic metrics.

**Features:**
| Feature | Description |
|---------|-------------|
| Stats Cards | Total drafts, Avg quality, Helpful rate, Approval rate |
| Quality Distribution | Bar chart of scores 1-5 |
| Actions Breakdown | Approved, Edited, Rejected counts |
| Performance by Intent | Table with metrics per intent type |
| Learning Examples | List of high-quality responses |
| Time Range Filter | 7d, 30d, 90d, All time |

**Files Created:**
- `packages/customer-service-dashboard/src/pages/AIAgentAnalyticsPage.tsx`
- `packages/worker/src/controllers/analytics.ts`

---

### 12. STAFF MANAGEMENT UI

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Staff List Page | Card layout with all staff |
| Add Staff | Form with all fields |
| Edit Staff | Update existing staff |
| Profile Fields | Job title, phone, department |
| Permission Display | Admin/Staff badge |

**Files Created:**
- `packages/customer-service-dashboard/src/pages/StaffPage.tsx`

**Database Columns Added:**
- `staff_users.job_title`
- `staff_users.phone`
- `staff_users.department`

---

### 13. DUPLICATE TICKET DETECTION & AUTO-ARCHIVE

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Email Matching | Same subject + same sender |
| Time Window | Within 5 minutes |
| Auto-Archive | Duplicate marked as resolved |
| Staff Note | Records duplicate detection |

**Files Modified:**
- `packages/worker/src/services/EmailHandler.ts`
- `packages/worker/src/services/TicketManager.ts`

---

### 14. SOFT DELETE FOR TICKETS

**NOT in original architecture.** Original assumed hard delete.

**Features:**
| Feature | Description |
|---------|-------------|
| Soft Delete | Sets deleted_at timestamp |
| Admin Only | Permission restricted |
| Hidden from List | Filtered out of queries |
| Recoverable | Data preserved |

**Database Columns Added:**
- `tickets.deleted_at`
- `tickets.deleted_by`

---

### 15. COLLAPSIBLE SIDEBAR NAVIGATION

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Collapsible Sections | Tickets, Customers, Staff, Settings |
| Nested Menus | Assigned under Tickets > Open |
| Default Collapsed | All sections closed on refresh |
| Icon-Only Mode | Sidebar can collapse to icons |
| Staff Counts | Shows ticket counts per staff member |

**Files Modified:**
- `packages/customer-service-dashboard/src/components/layout/Sidebar.tsx`

---

### 16. SCHEDULED REPLIES

**NOT in original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Schedule Modal | Date/time picker |
| Today's Date Default | Starts from current date |
| Edit Scheduled | Modify before sending |
| Cancel Scheduled | Remove from queue |
| Cron Job | Sends at scheduled time |

**Files Created:**
- `packages/customer-service-dashboard/src/components/ScheduleReplyModal.tsx`
- `packages/worker/src/workers/scheduled-message-sender.ts`

---

### 17. RLHF DATA COLLECTION SYSTEM

**Enhanced beyond original architecture.**

**Features:**
| Feature | Description |
|---------|-------------|
| Quality Score | 1-5 stars |
| Helpful Toggle | Yes/No |
| Improvement Notes | Free text |
| Edit Distance | Characters changed |
| Learning Examples | Auto-created from 4+ star responses |

**Database Tables:**
- `ai_draft_responses` (enhanced)
- `ai_learning_examples`

---

## 📊 SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| **Major New Features** | 18 |
| **New Database Tables** | 9 (including tenant_settings) |
| **New Database Columns** | 20+ |
| **New Frontend Pages** | 13+ |
| **New Backend Controllers** | 5+ |
| **New Services** | 3+ |
| **New Packages** | 1 (chat-widget) |

---

## 🔮 PLANNED FUTURE FEATURES

These are documented for future implementation:

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| **Multi-Tenant Regional Settings** | 🔴 Critical | To Build | Tenant + Agent level settings for SaaS |
| Vector Embeddings | High | Pending | Semantic search for RAG |
| Pattern Extraction | Medium | Pending | Learn from staff edits |
| Queue Auto-Assign | Medium | Pending | Round-robin for chat |
| AI Resolution Detection | Low | Pending | Auto-close on "thank you" |
| Post-Chat Survey | Medium | Pending | Thumbs up/down in widget |
| Chat Analytics | Medium | Pending | Add chat metrics to Analytics Dashboard |
| Shopify Integration | High | Pending | Order lookups |
| WhatsApp Integration | Medium | Pending | Multi-channel support |
| Instagram DM Integration | Medium | Pending | Multi-channel support |
| Facebook Messenger Integration | Medium | Pending | Multi-channel support |

---

## 📁 FILE INVENTORY

### New Files Created (Dec 2-4, 2025)

**Backend (packages/worker/src/):**
```
controllers/
  - ai-agent.ts
  - analytics.ts
  - chat.ts
  - chat-messages.ts

services/
  - KnowledgeService.ts

workers/
  - scheduled-message-sender.ts
  - snooze-expiry-checker.ts

migrations/
  - 0015_add_ai_learning_feedback.sql
  - 0017_add_ticket_soft_delete.sql
  - 0018_add_merged_from_field.sql
  - 0019_add_merge_details.sql
  - 0020_add_staff_availability_status.sql
  - 0021_add_business_hours_settings.sql
  - 0022_add_chat_conversations.sql
  - 0023_add_staff_profile_fields.sql
  - 0024_chat_conversations_tables.sql
  - 0025_chat_attachments.sql
  - 0026_chat_resolution_tracking.sql
  - 0027_ai_agent_config.sql
```

**Frontend (packages/customer-service-dashboard/src/):**
```
pages/
  - AIAgentAnalyticsPage.tsx
  - AIAgentKnowledgePage.tsx
  - AIAgentSystemMessagePage.tsx
  - AIAgentWidgetPage.tsx
  - BusinessHoursPage.tsx
  - ChatDashboardPage.tsx
  - ChatEmbedCodePage.tsx
  - ChatWidgetSettingsPage.tsx
  - StaffPage.tsx
  - StaffPerformancePage.tsx

components/
  - AIDraftFeedbackModal.tsx
  - AIDraftResponsePanel.tsx
  - MergeConfirmModal.tsx
  - ScheduleReplyModal.tsx
  - SnoozeModal.tsx
  - StaffAvailabilityToggle.tsx
```

**Chat Widget (packages/chat-widget/):**
```
- package.json
- tsconfig.json
- vite.config.ts
- src/widget.ts
- index.html
```

---

**Document Version:** 1.0  
**Last Updated:** December 4, 2025  
**Author:** AI Assistant  

---

*This document should be updated whenever significant new features are added that weren't in the original architecture.*

