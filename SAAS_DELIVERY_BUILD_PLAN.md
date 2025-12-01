# SaaS Delivery Build Plan
**Last Updated:** 2025-11-20  
**Estimated Time:** 3-4 weeks  
**Priority:** High (Required for Customer Onboarding)

---

## 🎯 OBJECTIVE

Implement multi-tenancy and two delivery methods for Dartmouth OS agents:
1. **Custom Domain** - White-label experience on customer's domain
2. **Widget Script** - Embeddable chat widget for existing sites

---

## 📋 PHASES OVERVIEW

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: Multi-Tenancy Foundation** | 1 week | Tenant detection, config storage, API |
| **Phase 2: Custom Domain Support** | 3-4 days | Domain setup, verification, branding |
| **Phase 3: Widget Script** | 1 week | Widget loader, iframe, customisation |
| **Phase 4: Dashboard Integration** | 2-3 days | UI for copying scripts, previews |
| **Phase 5: Documentation & Testing** | 2-3 days | Guides, videos, end-to-end testing |

**Total Time:** 3-4 weeks

---

## 🔨 PHASE 1: MULTI-TENANCY FOUNDATION

**Duration:** 1 week (40 hours)  
**Goal:** Core tenant detection and configuration system

### Tasks

#### 1.1 Tenant Configuration Schema (4 hours)
- [ ] Design tenant config JSON schema
- [ ] Define KV key structure
- [ ] Create TypeScript interfaces
- [ ] Document all config options

**Files to Create:**
- `packages/worker/src/types/tenant.ts`
- `packages/worker/src/schemas/tenant.schema.ts`

**Deliverable:**
```typescript
interface TenantConfig {
  tenantId: string;
  domain: string;
  branding: BrandingConfig;
  agent: AgentConfig;
  features: FeatureFlags;
  limits: RateLimits;
  apiKeys: EncryptedKeys;
}
```

---

#### 1.2 Tenant Detection Middleware (8 hours)
- [ ] Create tenant detection middleware
- [ ] Implement domain-based detection
- [ ] Implement API key-based detection
- [ ] Add query parameter detection (for testing)
- [ ] Handle default tenant fallback
- [ ] Add error handling and logging

**Files to Create:**
- `packages/worker/src/middleware/tenant.ts`
- `packages/worker/src/services/TenantService.ts`

**Deliverable:**
```typescript
export async function detectTenant(
  request: Request, 
  env: Env
): Promise<TenantContext>
```

---

#### 1.3 Tenant Config Storage (KV) (6 hours)
- [ ] Create KV namespace for tenant configs
- [ ] Build tenant CRUD operations
- [ ] Implement config caching
- [ ] Add config validation
- [ ] Create migration script for existing data

**Files to Create:**
- `packages/worker/src/storage/TenantStorage.ts`
- `packages/worker/scripts/migrate-tenants.ts`

**Commands:**
```bash
# Create KV namespace
npx wrangler kv:namespace create TENANT_CONFIG

# Add to wrangler.toml
[[kv_namespaces]]
binding = "TENANT_CONFIG"
id = "xxx"
```

---

#### 1.4 Tenant API Endpoints (8 hours)
- [ ] `GET /api/v2/tenant/config` - Get tenant config
- [ ] `POST /api/v2/tenant` - Create tenant (admin)
- [ ] `PUT /api/v2/tenant/:id` - Update tenant (admin)
- [ ] `DELETE /api/v2/tenant/:id` - Delete tenant (admin)
- [ ] Add authentication/authorization
- [ ] Add input validation

**Files to Create:**
- `packages/worker/src/routes/tenant.ts`
- `packages/worker/src/controllers/TenantController.ts`

---

#### 1.5 Frontend Tenant Detection (6 hours)
- [ ] Create `useTenant()` hook
- [ ] Implement tenant config fetching
- [ ] Apply branding dynamically (colors, logo, title)
- [ ] Handle loading and error states
- [ ] Add tenant context provider

**Files to Create:**
- `packages/widget/src/hooks/useTenant.ts`
- `packages/widget/src/contexts/TenantContext.tsx`
- `packages/widget/src/utils/branding.ts`

---

#### 1.6 Testing (8 hours)
- [ ] Unit tests for tenant detection
- [ ] Integration tests for tenant API
- [ ] Test multiple tenants simultaneously
- [ ] Test domain detection
- [ ] Test API key detection
- [ ] Test default fallback

**Files to Create:**
- `packages/worker/src/__tests__/tenant.test.ts`
- `packages/worker/src/__tests__/tenant-api.test.ts`

---

### Phase 1 Deliverables

✅ Tenant detection working (domain, API key, query param)  
✅ Tenant config stored in KV  
✅ Tenant API endpoints functional  
✅ Frontend applies tenant branding  
✅ All tests passing  

---

## 🔨 PHASE 2: CUSTOM DOMAIN SUPPORT

**Duration:** 3-4 days (24-32 hours)  
**Goal:** Enable customers to use their own domains

### Tasks

#### 2.1 Domain Verification System (6 hours)
- [ ] Create domain verification endpoint
- [ ] Implement DNS check (CNAME validation)
- [ ] Add SSL certificate status check
- [ ] Build verification status API
- [ ] Add webhook for domain status updates

**Files to Create:**
- `packages/worker/src/services/DomainVerification.ts`
- `packages/worker/src/routes/domain.ts`

---

#### 2.2 Tenant Onboarding Script (4 hours)
- [ ] Create CLI tool for adding tenants
- [ ] Automate KV config creation
- [ ] Generate API keys
- [ ] Create onboarding checklist
- [ ] Add email notification

**Files to Create:**
- `packages/worker/scripts/onboard-tenant.ts`

**Usage:**
```bash
npm run onboard-tenant -- \
  --domain artworktools.com \
  --name "ArtworkTools Pro" \
  --agent mccarthy-artwork \
  --email customer@artworktools.com
```

---

#### 2.3 Cloudflare Pages Integration (4 hours)
- [ ] Document custom domain setup process
- [ ] Create Cloudflare API integration (optional)
- [ ] Build domain status dashboard
- [ ] Add SSL monitoring

**Files to Create:**
- `docs/CUSTOM_DOMAIN_SETUP.md`
- `packages/dashboard/src/pages/Domains.tsx`

---

#### 2.4 Customer Setup Guide (4 hours)
- [ ] Write step-by-step setup guide
- [ ] Create DNS configuration examples
- [ ] Add troubleshooting section
- [ ] Design printable PDF guide
- [ ] Record video tutorial

**Files to Create:**
- `docs/customer-guides/CUSTOM_DOMAIN_GUIDE.md`
- `docs/customer-guides/DNS_EXAMPLES.md`

---

#### 2.5 Testing (6-8 hours)
- [ ] Test custom domain setup end-to-end
- [ ] Test DNS propagation detection
- [ ] Test SSL certificate issuance
- [ ] Test multiple domains per tenant
- [ ] Test domain removal

---

### Phase 2 Deliverables

✅ Custom domain setup documented  
✅ Tenant onboarding script working  
✅ Domain verification system functional  
✅ Customer setup guide complete  
✅ Video tutorial recorded  

---

## 🔨 PHASE 3: WIDGET SCRIPT

**Duration:** 1 week (40 hours)  
**Goal:** Embeddable widget script for easy integration

### Tasks

#### 3.1 Widget Loader Script (10 hours)
- [ ] Build standalone JavaScript loader
- [ ] Implement iframe creation
- [ ] Add PostMessage communication
- [ ] Handle script tag attributes
- [ ] Add error handling and fallbacks
- [ ] Minify and optimize

**Files to Create:**
- `packages/widget/src/loader.ts`
- `packages/widget/build/widget.js` (output)

---

#### 3.2 Widget HTML Page (8 hours)
- [ ] Create widget HTML template
- [ ] Build React widget app
- [ ] Implement chat interface
- [ ] Add file upload support
- [ ] Style for light/dark themes
- [ ] Make responsive

**Files to Create:**
- `packages/widget/src/Widget.tsx`
- `packages/widget/src/components/WidgetChat.tsx`
- `packages/worker/src/widget.html`

---

#### 3.3 Widget Modes (8 hours)
- [ ] Floating mode (bottom-right/left)
- [ ] Inline mode (embed in div)
- [ ] Minimise/maximise functionality
- [ ] Close button
- [ ] Notification badge (unread messages)

**Features:**
```html
<!-- Floating mode -->
<script data-position="bottom-right"></script>

<!-- Inline mode -->
<div id="chat"></div>
<script data-embed-target="#chat"></script>
```

---

#### 3.4 Widget Customisation (6 hours)
- [ ] Theme support (light, dark, auto)
- [ ] Custom colors (primary, secondary)
- [ ] Custom fonts
- [ ] Custom logo
- [ ] Custom greeting message

**Attributes:**
```html
<script 
  data-theme="dark"
  data-primary-color="#10B981"
  data-font-family="Inter"
></script>
```

---

#### 3.5 CDN Hosting (4 hours)
- [ ] Set up Cloudflare Pages for widget CDN
- [ ] Configure caching headers
- [ ] Add versioning (widget.js, widget.v1.2.3.js)
- [ ] Set up automatic deployments
- [ ] Test CDN performance

**URL:**
```
https://cdn.mccarthyai.com/widget.js
https://cdn.mccarthyai.com/widget.v1.0.0.js
```

---

#### 3.6 Testing (4 hours)
- [ ] Test on various websites
- [ ] Test in different browsers
- [ ] Test mobile responsiveness
- [ ] Test with ad blockers
- [ ] Test CORS and security

---

### Phase 3 Deliverables

✅ Widget script functional  
✅ Floating and inline modes working  
✅ Customisation options implemented  
✅ Hosted on CDN  
✅ Cross-browser tested  

---

## 🔨 PHASE 4: DASHBOARD INTEGRATION

**Duration:** 2-3 days (16-24 hours)  
**Goal:** UI for customers to copy widget scripts

### Tasks

#### 4.1 Agent Dashboard UI (8 hours)
- [ ] Add "Get Embed Code" button to agent cards
- [ ] Build script generator
- [ ] Add copy-to-clipboard functionality
- [ ] Show script preview
- [ ] Add customisation options UI

**Files to Create:**
- `packages/dashboard/src/components/AgentCard.tsx`
- `packages/dashboard/src/components/WidgetScriptModal.tsx`

---

#### 4.2 Widget Preview (6 hours)
- [ ] Build live widget preview
- [ ] Show customisation changes in real-time
- [ ] Add mobile/desktop preview toggle
- [ ] Test widget in preview iframe

**Files to Create:**
- `packages/dashboard/src/components/WidgetPreview.tsx`

---

#### 4.3 Documentation Links (2 hours)
- [ ] Add links to setup guides
- [ ] Add troubleshooting links
- [ ] Add video tutorial embeds

---

#### 4.4 Testing (4-8 hours)
- [ ] Test script generation
- [ ] Test copy functionality
- [ ] Test preview accuracy
- [ ] User acceptance testing

---

### Phase 4 Deliverables

✅ Dashboard UI for widget scripts  
✅ Script generator working  
✅ Live preview functional  
✅ Documentation linked  

---

## 🔨 PHASE 5: DOCUMENTATION & TESTING

**Duration:** 2-3 days (16-24 hours)  
**Goal:** Complete documentation and end-to-end testing

### Tasks

#### 5.1 Customer Documentation (8 hours)
- [ ] Custom domain setup guide
- [ ] Widget script setup guide
- [ ] Customisation guide
- [ ] Troubleshooting guide
- [ ] FAQ

**Files to Create:**
- `docs/customer-guides/CUSTOM_DOMAIN.md`
- `docs/customer-guides/WIDGET_SCRIPT.md`
- `docs/customer-guides/CUSTOMISATION.md`
- `docs/customer-guides/TROUBLESHOOTING.md`
- `docs/customer-guides/FAQ.md`

---

#### 5.2 Developer Documentation (4 hours)
- [ ] Architecture overview
- [ ] API reference
- [ ] Tenant config reference
- [ ] Widget API reference
- [ ] Security best practices

**Files to Create:**
- `docs/developer/ARCHITECTURE.md`
- `docs/developer/API_REFERENCE.md`
- `docs/developer/TENANT_CONFIG.md`
- `docs/developer/WIDGET_API.md`

---

#### 5.3 Video Tutorials (4 hours)
- [ ] Custom domain setup (5 min)
- [ ] Widget script setup (3 min)
- [ ] Customisation options (5 min)
- [ ] Troubleshooting common issues (5 min)

---

#### 5.4 End-to-End Testing (8 hours)
- [ ] Test complete custom domain flow
- [ ] Test complete widget script flow
- [ ] Test with real customer domains
- [ ] Load testing (multiple tenants)
- [ ] Security testing
- [ ] Performance testing

---

#### 5.5 Launch Checklist (4 hours)
- [ ] All documentation complete
- [ ] All tests passing
- [ ] CDN configured
- [ ] Monitoring set up
- [ ] Support team trained
- [ ] Beta customers onboarded

---

### Phase 5 Deliverables

✅ Complete customer documentation  
✅ Complete developer documentation  
✅ Video tutorials published  
✅ End-to-end testing passed  
✅ Ready for production launch  

---

## 📊 TIMELINE SUMMARY

| Week | Focus | Deliverable |
|------|-------|-------------|
| **Week 1** | Multi-Tenancy Foundation | Tenant detection, config, API |
| **Week 2** | Custom Domain + Widget Start | Domain setup, widget loader |
| **Week 3** | Widget Completion | Widget modes, CDN, dashboard |
| **Week 4** | Documentation & Testing | Guides, videos, testing |

---

## 🚀 DEPLOYMENT PLAN

### Pre-Launch Checklist

**Infrastructure:**
- [ ] KV namespace created for tenant configs
- [ ] CDN set up for widget script
- [ ] Monitoring configured (Sentry, Cloudflare Analytics)
- [ ] Rate limiting enabled

**Code:**
- [ ] All code reviewed
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance optimised

**Documentation:**
- [ ] Customer guides published
- [ ] Developer docs published
- [ ] Video tutorials uploaded
- [ ] Support articles created

**Testing:**
- [ ] Beta customers onboarded
- [ ] Feedback collected
- [ ] Issues resolved
- [ ] Load testing passed

---

### Launch Sequence

1. **Soft Launch (Week 4)**
   - Onboard 2-3 beta customers
   - Monitor for issues
   - Collect feedback

2. **Public Launch (Week 5)**
   - Announce to all customers
   - Publish documentation
   - Open for new signups

3. **Post-Launch (Week 6+)**
   - Monitor usage and performance
   - Fix bugs
   - Add requested features
   - Scale infrastructure

---

## 📞 SUPPORT PLAN

### Customer Support

**Channels:**
- Email: support@mccarthyai.com
- Live chat: Dashboard
- Documentation: docs.mccarthyai.com
- Video tutorials: YouTube

**Response Times:**
- Critical issues: 1 hour
- High priority: 4 hours
- Medium priority: 24 hours
- Low priority: 48 hours

### Common Issues

**Custom Domain:**
- DNS propagation delays → Wait 1-48 hours
- SSL certificate issues → Check Cloudflare dashboard
- Domain verification failed → Check CNAME record

**Widget Script:**
- Widget not appearing → Check console for errors
- CORS errors → Verify tenant ID
- Styling issues → Check CSS conflicts

---

## 🎯 SUCCESS METRICS

### Technical Metrics
- [ ] 99.9% uptime
- [ ] <500ms response time (p95)
- [ ] <1% error rate
- [ ] 100% test coverage (critical paths)

### Business Metrics
- [ ] 10+ customers on custom domains (Month 1)
- [ ] 50+ customers using widget script (Month 1)
- [ ] <5% churn rate
- [ ] >90% customer satisfaction

### Performance Metrics
- [ ] Widget loads in <2 seconds
- [ ] CDN cache hit rate >95%
- [ ] Domain verification <5 minutes
- [ ] SSL certificate issuance <5 minutes

---

## 🔄 FUTURE ENHANCEMENTS

### Phase 6: Advanced Features (Future)
- [ ] Multi-agent support (multiple agents per tenant)
- [ ] Custom branding per agent
- [ ] A/B testing for agent prompts
- [ ] Analytics dashboard (usage, conversations)
- [ ] Webhook integrations
- [ ] API access for developers
- [ ] White-label mobile apps

---

**Status:** Ready to begin Phase 1  
**Next Step:** Create tenant configuration schema and middleware

