# 🔮 FEATURES TO ADD LATER (POST-MVP)

**Date:** November 28, 2025  
**Status:** Planned for Future Phases  
**Current Phase:** MVP (Email + AI + Dashboard + Group Chat)

---

## 📋 **OVERVIEW**

This document tracks all features that we've decided to add **AFTER** the MVP is complete and deployed. These are important features but not critical for the initial launch.

**Why Not Now?**
- MVP focuses on core functionality (email → tickets → AI responses)
- These features require additional integrations and complexity
- Better to launch MVP first, then add features incrementally
- Allows us to validate core system before expanding

---

## 🔄 **PHASE 6: INTEGRATIONS (After MVP)**

### **6.1 Shopify Integration**

**What:** Connect to Shopify API to fetch customer and order data

**Features:**
- Look up customer by email
- Get customer order history
- Get order status and tracking
- Get product catalog
- Check inventory levels

**Why Later:**
- Requires Shopify API credentials
- Need to understand Shopify data structure
- Can use placeholder data in MVP
- Not critical for email support

**Estimated Time:** 16 hours

**Status:** Not started

---

### **6.2 PERP Integration**

**What:** Connect to PERP system (production management) via REST API

**Features:**
- Get production order status
- Get artwork approval status
- Get VIP wallet balance
- Get invoices
- Get production timeline

**Why Later:**
- PERP API already exists (documented in `CustomerService-PerpAPI.md`)
- Need to test API endpoints
- Can use placeholder data in MVP
- Not critical for email support

**Estimated Time:** 20 hours

**Status:** API documented, integration not started

---

### **6.3 Product Knowledge System**

**What:** Sync product catalog from Shopify into RAG system for AI to search

**Features:**
- Sync products from Shopify
- Generate embeddings for products
- Store in RAG system
- AI can search products by description
- AI can recommend products
- AI can check inventory

**Why Later:**
- Requires Shopify integration first
- Requires RAG system tuning
- Not critical for basic support
- Can add after MVP is working

**Estimated Time:** 8 hours

**Status:** Not started

**Dependencies:** Shopify Integration, RAG Engine (already built)

---

## 🤖 **PHASE 7: ADDITIONAL CHANNELS (After MVP)**

### **7.1 Live Chat Widget**

**What:** Embeddable chat widget for website visitors

**Features:**
- JavaScript widget for website
- Real-time chat with AI
- Automatic ticket creation
- Handoff to human staff
- Mobile responsive

**Why Later:**
- Email support is more urgent
- Requires WebSocket implementation
- Requires widget hosting
- Can add after email is working

**Estimated Time:** 24 hours

**Status:** Not started

---

### **7.2 WhatsApp Integration**

**What:** Receive and send WhatsApp messages via Twilio

**Features:**
- Receive WhatsApp messages
- Send WhatsApp replies
- Create tickets from WhatsApp
- AI responds via WhatsApp
- Media support (images, files)

**Why Later:**
- Requires Twilio account
- Requires WhatsApp Business API approval
- Email is higher priority
- Can add incrementally

**Estimated Time:** 12 hours

**Status:** Not started

**Dependencies:** Twilio account, WhatsApp Business API

---

### **7.3 Instagram/Facebook Integration**

**What:** Receive and send Instagram DMs and Facebook Messenger messages

**Features:**
- Receive Instagram DMs
- Receive Facebook Messenger messages
- Send replies via Instagram/Facebook
- Create tickets from social messages
- AI responds via social channels

**Why Later:**
- Requires Meta Business account
- Requires app approval
- Email is higher priority
- Social support is lower volume

**Estimated Time:** 16 hours (8 hours per platform)

**Status:** Not started

**Dependencies:** Meta Business account, App approval

---

## 🤝 **PHASE 8: AGENT COLLABORATION (After MVP)**

### **8.1 Sales Agent**

**What:** Specialized AI agent for sales inquiries (quotes, pricing)

**Features:**
- Generate custom quotes
- Calculate pricing with bulk discounts
- Recommend products
- Place orders in Shopify
- Hand off from Customer Service Agent

**Why Later:**
- Customer Service Agent is higher priority
- Requires Shopify integration
- Requires Product Knowledge System
- Can add after CS Agent is working

**Estimated Time:** 56 hours

**Status:** Planned (detailed in `CUSTOMER_SERVICE_BUILD_PLAN_UPDATED.md`)

---

### **8.2 Agent-to-Agent Handoff**

**What:** Seamless handoff between Customer Service Agent and Sales Agent

**Features:**
- CS Agent detects pricing questions
- Hands off to Sales Agent with context
- Sales Agent generates quote
- Hands back to CS Agent
- Conversation context preserved

**Why Later:**
- Requires Sales Agent to be built first
- Requires Agent Handoff Protocol (already built)
- Not needed until multiple agents exist

**Estimated Time:** 4 hours (protocol already built, just needs integration)

**Status:** Protocol built, integration not started

**Dependencies:** Sales Agent

---

## 🚀 **PHASE 9: REAL-TIME FEATURES (After MVP)**

### **9.1 WebSocket Service**

**What:** Real-time updates using Cloudflare Durable Objects

**Features:**
- Real-time message delivery (no polling)
- Typing indicators
- Presence detection (who's online)
- Instant notifications
- Live dashboard updates

**Why Later:**
- Polling works fine for MVP
- Requires Durable Objects setup
- Adds complexity
- Can add after MVP is stable

**Estimated Time:** 8 hours

**Status:** Not started (currently using polling)

---

### **9.2 File Attachments**

**What:** Upload and share files in tickets and channels

**Features:**
- Upload files to tickets
- Upload files to channels
- Store in Cloudflare R2
- Preview images
- Download files

**Why Later:**
- Not critical for MVP
- Requires R2 bucket setup
- Requires file upload UI
- Can add after core features work

**Estimated Time:** 12 hours

**Status:** Not started

---

### **9.3 Message Reactions**

**What:** React to messages with emoji (like Slack)

**Features:**
- Add emoji reactions to messages
- See who reacted
- Remove reactions
- Popular reactions (👍, ❤️, 😂, 🎉)

**Why Later:**
- Nice-to-have, not critical
- Requires UI updates
- Can add after core chat works

**Estimated Time:** 4 hours

**Status:** Not started

---

## 📊 **PHASE 10: ANALYTICS & REPORTING (After MVP)**

### **10.1 Analytics Dashboard**

**What:** Comprehensive analytics for customer service performance

**Features:**
- AI resolution rate
- Average response time
- Customer satisfaction (CSAT)
- Ticket volume by channel
- Staff performance metrics
- Peak hours analysis

**Why Later:**
- Need data first (requires MVP to be running)
- Not critical for launch
- Can add after system is stable

**Estimated Time:** 24 hours

**Status:** Not started

---

### **10.2 Advanced Search**

**What:** Full-text search across tickets, messages, channels

**Features:**
- Search tickets by content
- Search messages in channels
- Filter by date, staff, customer
- Search customer history
- Export search results

**Why Later:**
- Basic filtering works for MVP
- Requires search index
- Can add after MVP is working

**Estimated Time:** 8 hours

**Status:** Not started

---

## 🎨 **PHASE 11: UI ENHANCEMENTS (After MVP)**

### **11.1 Pinned Messages**

**What:** Pin important messages in channels

**Features:**
- Pin messages to top of channel
- Unpin messages
- See all pinned messages
- Notifications for pinned messages

**Why Later:**
- Nice-to-have feature
- Not critical for MVP
- Can add after core chat works

**Estimated Time:** 4 hours

**Status:** Not started

---

### **11.2 Custom Notification Settings**

**What:** Per-channel notification preferences

**Features:**
- Mute channels
- Mentions-only mode
- Custom notification sounds
- Desktop notifications
- Email notifications (optional)

**Why Later:**
- Basic notifications work for MVP
- Can add after system is stable

**Estimated Time:** 6 hours

**Status:** Not started

---

### **11.3 Dark Mode**

**What:** Dark theme for dashboard

**Features:**
- Toggle light/dark mode
- Persistent preference
- Automatic (system preference)

**Why Later:**
- Nice-to-have feature
- Not critical for MVP
- Can add after MVP is stable

**Estimated Time:** 4 hours

**Status:** Not started

---

## 📱 **PHASE 12: MOBILE (Future)**

### **12.1 Mobile App**

**What:** Native mobile app for iOS and Android

**Features:**
- View tickets
- Reply to customers
- Group chat
- Push notifications
- Camera for file uploads

**Why Later:**
- Web dashboard works on mobile
- Native app is significant effort
- Better to validate system first
- Can add if demand exists

**Estimated Time:** 200+ hours

**Status:** Not planned yet

---

## 🎥 **PHASE 13: ADVANCED FEATURES (Future)**

### **13.1 Video/Audio Calls**

**What:** Voice and video calls with customers

**Features:**
- Voice calls via browser
- Video calls via browser
- Call recording
- Call transcription
- Call notes

**Why Later:**
- Not requested yet
- Requires WebRTC
- Significant complexity
- Can add if needed

**Estimated Time:** 40+ hours

**Status:** Not planned yet

---

### **13.2 AI Voice Assistant**

**What:** Voice-based AI customer service

**Features:**
- Customers call phone number
- AI answers with voice
- Speech-to-text
- Text-to-speech
- Handoff to human

**Why Later:**
- Not requested yet
- Requires Twilio Voice
- Requires voice AI (ElevenLabs, etc.)
- Can add if needed

**Estimated Time:** 40+ hours

**Status:** Not planned yet

---

## 📋 **SUMMARY**

### **Immediate (MVP - Current):**
- ✅ Gmail Integration
- ✅ Email-to-Ticket
- ✅ AI Customer Service Agent
- ✅ Snooze Tickets
- ✅ Staff @Mentions
- ✅ Internal Notes
- ✅ Staff Group Chat
- ✅ Dashboard (Tailwind UI)
- ✅ Admin Settings

### **Phase 6 (Next - Integrations):**
- ⏳ Shopify Integration (16 hours)
- ⏳ PERP Integration (20 hours)
- ⏳ Product Knowledge System (8 hours)

### **Phase 7 (Additional Channels):**
- ⏳ Live Chat Widget (24 hours)
- ⏳ WhatsApp Integration (12 hours)
- ⏳ Instagram/Facebook Integration (16 hours)

### **Phase 8 (Agent Collaboration):**
- ⏳ Sales Agent (56 hours)
- ⏳ Agent-to-Agent Handoff (4 hours)

### **Phase 9 (Real-time Features):**
- ⏳ WebSocket Service (8 hours)
- ⏳ File Attachments (12 hours)
- ⏳ Message Reactions (4 hours)

### **Phase 10 (Analytics):**
- ⏳ Analytics Dashboard (24 hours)
- ⏳ Advanced Search (8 hours)

### **Phase 11 (UI Enhancements):**
- ⏳ Pinned Messages (4 hours)
- ⏳ Custom Notifications (6 hours)
- ⏳ Dark Mode (4 hours)

### **Phase 12+ (Future):**
- 🔮 Mobile App (200+ hours)
- 🔮 Video/Audio Calls (40+ hours)
- 🔮 AI Voice Assistant (40+ hours)

---

## 🎯 **PRIORITIZATION**

### **High Priority (Phase 6-7):**
1. Shopify Integration - Customer/order lookup is very useful
2. PERP Integration - Production status is critical for business
3. Live Chat Widget - Customers prefer live chat
4. Product Knowledge - AI needs product info

### **Medium Priority (Phase 8-9):**
1. Sales Agent - Automate quote generation
2. WhatsApp - Popular channel
3. WebSockets - Better UX
4. File Attachments - Useful for support

### **Low Priority (Phase 10-11):**
1. Analytics - Nice to have, not urgent
2. UI Enhancements - Polish, not critical
3. Social Channels - Lower volume

### **Future (Phase 12+):**
1. Mobile App - Only if demand exists
2. Voice Features - Only if requested

---

**STATUS:** 📝 DOCUMENTED - All future features tracked

**NEXT ACTION:** Complete MVP first, then revisit this list

**Last Updated:** November 28, 2025

