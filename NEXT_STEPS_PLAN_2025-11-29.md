# 🎯 Next Steps Plan - Customer Service System
**Date:** November 29, 2025  
**Current Status:** 🟡 Core Email-to-Ticket Working, Full System 35% Complete  
**Confidence Level:** 35% (revised after demo comparison)  
**See:** `DEMO_VS_PRODUCTION_COMPARISON.md` for 30+ missing features

---

## 🚨 IMMEDIATE PRIORITIES (Next 30 Minutes)

### **1. Test Message History Fix** ⚠️ CRITICAL
**Status:** Table recreated, needs verification  
**Action:**
```powershell
# Send TEST 11 email
# Then trigger poll:
Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"

# Check if messages saved:
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT * FROM ticket_messages ORDER BY created_at DESC LIMIT 5;"
```

**Expected Result:** Message history should save without foreign key error

---

### **2. Fix AI Processing Error** ⚠️ CRITICAL
**Current Error:**
```
D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined'
```

**Debug Steps:**
1. Check which parameter is undefined in AI agent call
2. Look at `processTicketWithAI()` in `email-poller.ts`
3. Check `CustomerServiceAgent.processTicket()` method
4. Add null checks for all parameters

**Files to Check:**
- `packages/worker/src/workers/email-poller.ts` (line ~66)
- `packages/worker/src/agents/CustomerServiceAgent.ts`
- `packages/worker/src/services/TicketManager.ts`

---

### **3. End-to-End Test** ✅ VERIFICATION
**Test Flow:**
```
1. Send TEST 11 email
2. Wait for cron (or trigger manually)
3. Verify ticket created ✅
4. Verify message history saved ⚠️
5. Verify AI draft created in Gmail ⚠️
6. Verify dashboard shows ticket ✅
7. Verify no errors in logs ⚠️
```

---

## 📋 SHORT TERM (Next Session - 2-3 Hours)

### **Phase 1: Fix Remaining Bugs** (30 mins)
- [ ] Fix AI processing undefined error
- [ ] Verify message history saves
- [ ] Test complete workflow end-to-end
- [ ] Ensure no errors in logs

### **Phase 2: Ticket Detail View** (45 mins)
**Create:** `packages/customer-service-dashboard/src/pages/TicketDetail.tsx`

**Features:**
- Show full ticket information
- Display all messages (customer + agent)
- Show linked emails
- Display internal notes
- Show ticket timeline

**API Endpoint:**
```typescript
GET /api/tickets/:ticketNumber
Response: {
  ticket: { ... },
  messages: [ ... ],
  emails: [ ... ],
  notes: [ ... ]
}
```

---

### **Phase 3: Reply Functionality** (45 mins)
**Add to Ticket Detail:**
- Reply text area
- Send button
- Preview before sending
- Attach files (future)

**API Endpoint:**
```typescript
POST /api/tickets/:ticketNumber/reply
Body: {
  content: "Response text",
  staffId: "staff_123",
  sendImmediately: true
}
```

**Backend Changes:**
1. Add reply endpoint to `packages/worker/src/routes/tickets.ts`
2. Use `GmailIntegration.sendEmail()` or `createDraft()`
3. Save message to `ticket_messages` table
4. Update ticket `updated_at` timestamp

---

### **Phase 4: Staff Dashboard** (30 mins)
**Create:** `packages/customer-service-dashboard/src/pages/Dashboard.tsx`

**Widgets:**
- Open tickets count
- Tickets by priority (urgent, high, medium, low)
- Tickets by category
- Average response time
- SLA compliance rate
- Recent activity

---

## 🎯 MEDIUM TERM (This Week - 10-15 Hours)

### **Day 1-2: Staff Management**
- [ ] Staff list page
- [ ] Add/edit/deactivate staff
- [ ] Role management (admin, manager, agent)
- [ ] Staff performance metrics

### **Day 2-3: Ticket Assignment**
- [ ] Auto-assign based on workload
- [ ] Manual assignment
- [ ] Reassignment
- [ ] Assignment history
- [ ] Notifications to assigned staff

### **Day 3-4: Internal Notes**
- [ ] Add notes to tickets
- [ ] @mention other staff
- [ ] Note visibility (private/team)
- [ ] Note attachments
- [ ] Note search

### **Day 4-5: Ticket Escalation**
- [ ] Escalate to manager
- [ ] Escalation reasons
- [ ] Escalation notifications
- [ ] Escalation history
- [ ] Auto-escalation rules (SLA breach)

### **Day 5: SLA Monitoring**
- [ ] SLA dashboard
- [ ] SLA alerts (email/Slack)
- [ ] SLA breach reports
- [ ] Custom SLA rules by priority/category
- [ ] SLA performance trends

---

## 🚀 LONG TERM (Next 2 Weeks - 20-30 Hours)

### **Week 1: Advanced Features**

#### **Analytics Dashboard**
- Ticket volume trends
- Response time trends
- Customer satisfaction scores
- Staff performance leaderboard
- Category distribution
- Priority distribution
- Peak hours analysis

#### **Email Templates**
- Common response templates
- Template variables (customer name, order number, etc.)
- Template categories
- Template search
- Template usage analytics

#### **Automation Rules**
- Auto-assign based on keywords
- Auto-prioritize based on customer
- Auto-categorize based on content
- Auto-close after X days
- Auto-escalate if no response

---

### **Week 2: Customer Experience**

#### **Customer Portal**
- View own tickets
- Create new tickets
- Reply to tickets
- Upload attachments
- Track ticket status
- Rate responses

#### **Knowledge Base**
- FAQ articles
- Search functionality
- Article categories
- Article analytics (views, helpful votes)
- Auto-suggest articles based on ticket content

#### **Canned Responses**
- Quick replies
- Keyboard shortcuts
- Response analytics
- Personalization variables
- Multi-language support

---

## 🔮 FUTURE PHASES (Month 2+)

### **Multi-Channel Support**
- [ ] Live chat widget
- [ ] SMS integration (Twilio)
- [ ] WhatsApp integration
- [ ] Facebook Messenger
- [ ] Instagram DMs
- [ ] Twitter DMs
- [ ] Phone call logging

### **Advanced AI Features**
- [ ] Sentiment analysis
- [ ] Intent detection
- [ ] Auto-categorization (improved)
- [ ] Response quality scoring
- [ ] Customer satisfaction prediction
- [ ] Churn risk detection

### **Integrations**
- [ ] Slack notifications
- [ ] Microsoft Teams
- [ ] Zapier webhooks
- [ ] Salesforce CRM
- [ ] HubSpot CRM
- [ ] Stripe billing
- [ ] Shopify (enhanced)

### **Reporting**
- [ ] Custom report builder
- [ ] Scheduled reports (email)
- [ ] Export to CSV/PDF
- [ ] Data visualization
- [ ] Comparative analysis
- [ ] Forecasting

---

## 🎯 Success Metrics

### **Week 1 Goals**
- [ ] 100% of emails create tickets
- [ ] 0% duplicate tickets
- [ ] < 5 minute average processing time
- [ ] 95% AI draft accuracy
- [ ] 0 critical errors in logs

### **Month 1 Goals**
- [ ] Handle 100+ tickets/day
- [ ] < 1 hour average first response time
- [ ] 90% SLA compliance
- [ ] 80% customer satisfaction
- [ ] 5+ staff members using system

### **Month 3 Goals**
- [ ] Handle 500+ tickets/day
- [ ] < 30 minute average first response time
- [ ] 95% SLA compliance
- [ ] 85% customer satisfaction
- [ ] 20+ staff members using system
- [ ] 3+ channels integrated

---

## 🛠️ Technical Debt to Address

### **High Priority**
1. **Add unit tests** - Currently 0% coverage
2. **Add integration tests** - No automated testing
3. **Implement retry logic** - API calls can fail
4. **Add transaction handling** - Multi-step operations not atomic
5. **Improve error recovery** - System doesn't recover from errors well

### **Medium Priority**
1. **Database migrations** - Need versioned schema changes
2. **Logging improvements** - Structured logging, log levels
3. **Performance optimization** - Cache more aggressively
4. **Code documentation** - Add JSDoc comments
5. **Type safety** - Stricter TypeScript config

### **Low Priority**
1. **Code refactoring** - Some methods too long
2. **Dependency updates** - Keep packages current
3. **Security audit** - Review all endpoints
4. **Accessibility** - WCAG 2.1 AA compliance
5. **Mobile responsiveness** - Dashboard mobile view

---

## 📊 Resource Requirements

### **Development Time**
- **Immediate fixes:** 1-2 hours
- **Short term features:** 5-10 hours
- **Medium term features:** 10-15 hours
- **Long term features:** 20-30 hours
- **Total (MVP to Full):** ~50 hours

### **Infrastructure Costs**
```
Current (MVP):
- Cloudflare Workers: $5/month (included in plan)
- D1 Database: $5/month (included in plan)
- OpenAI API: ~$20/month (100 tickets/day)
- Gmail API: Free
Total: ~$30/month

Scaled (1000 tickets/day):
- Cloudflare Workers: $5/month
- D1 Database: $25/month
- OpenAI API: ~$200/month
- Additional services: ~$50/month
Total: ~$280/month
```

### **Team Requirements**
- **Phase 1 (MVP):** 1 developer
- **Phase 2 (Full features):** 1-2 developers
- **Phase 3 (Scale):** 2-3 developers + 1 DevOps

---

## 🎓 Learning & Documentation

### **Documentation Needed**
- [ ] API reference (complete)
- [ ] Database schema documentation
- [ ] Deployment guide (production)
- [ ] Troubleshooting guide (expanded)
- [ ] Staff training materials
- [ ] Customer help articles

### **Training Required**
- [ ] Staff onboarding (2 hours)
- [ ] Admin training (4 hours)
- [ ] Developer onboarding (8 hours)

---

## 🔄 Maintenance Plan

### **Daily**
- Monitor logs for errors
- Check SLA compliance
- Review AI draft quality

### **Weekly**
- Review ticket metrics
- Update email templates
- Staff performance review
- Database backup verification

### **Monthly**
- Security audit
- Performance optimization
- Feature prioritization
- Cost analysis
- Customer feedback review

---

## 🎯 Decision Points

### **Before Scaling to Production**
- [ ] Complete end-to-end testing
- [ ] Load testing (simulate 100+ tickets/day)
- [ ] Security review
- [ ] Backup & disaster recovery plan
- [ ] Monitoring & alerting setup
- [ ] Staff training complete

### **Before Adding New Channels**
- [ ] Email channel proven stable
- [ ] Staff comfortable with system
- [ ] SLA compliance > 90%
- [ ] Customer satisfaction > 80%

### **Before Multi-Tenant**
- [ ] Single tenant working perfectly
- [ ] Database schema supports multi-tenancy
- [ ] Authentication & authorization robust
- [ ] Data isolation verified

---

## 📈 Growth Path

```
Phase 1: MVP (Current)
  └─ Email → Tickets → Dashboard
  └─ 1 customer, 10 tickets/day
  └─ 1-2 staff members

Phase 2: Enhanced
  └─ + AI drafts, assignments, notes
  └─ 1 customer, 50 tickets/day
  └─ 5-10 staff members

Phase 3: Multi-Channel
  └─ + Chat, SMS, WhatsApp
  └─ 1 customer, 200 tickets/day
  └─ 10-20 staff members

Phase 4: Multi-Tenant
  └─ + Customer portal, knowledge base
  └─ 5-10 customers, 1000+ tickets/day
  └─ 50+ staff members

Phase 5: Enterprise
  └─ + Advanced analytics, integrations
  └─ 50+ customers, 10,000+ tickets/day
  └─ 200+ staff members
```

---

## 🎉 Milestones

### **✅ Completed**
- [x] Email polling working
- [x] Ticket creation working
- [x] Dashboard displaying tickets
- [x] No duplicate tickets
- [x] Correct subject lines

### **🚧 In Progress**
- [ ] Message history saving
- [ ] AI draft creation
- [ ] Error-free operation

### **📋 Next Up**
- [ ] Ticket detail view
- [ ] Reply functionality
- [ ] Staff management
- [ ] Ticket assignment

---

## 💡 Key Insights

1. **Start Small, Scale Fast** - MVP is working, now add features incrementally
2. **AI is Helper, Not Replacement** - Staff review all AI responses
3. **Monitoring is Critical** - Logs and metrics essential for reliability
4. **Customer Experience First** - Fast, accurate responses matter most
5. **Documentation Saves Time** - Good docs = less support burden

---

## 🔗 Quick Commands

```powershell
# Deploy
cd packages/worker; npx wrangler deploy

# Start frontend
cd packages/customer-service-dashboard; npm run dev

# View logs
npx wrangler tail dartmouth-os-worker --format pretty

# Trigger poll
Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"

# Check tickets
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT * FROM tickets ORDER BY created_at DESC LIMIT 5;"

# Check messages
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT * FROM ticket_messages ORDER BY created_at DESC LIMIT 5;"
```

---

**Next Session Start Here:**
1. Read this plan
2. Check PROJECT_STATUS_2025-11-29.md for current state
3. Test message history (TEST 11)
4. Fix AI processing error
5. Build ticket detail view

---

*Plan created: 2025-11-29 12:55 PM*  
*Estimated completion: 2-4 weeks for full MVP*  
*Current progress: 75% complete*

