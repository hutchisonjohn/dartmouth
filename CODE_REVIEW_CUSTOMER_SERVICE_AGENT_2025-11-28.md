# 🔍 CODE REVIEW - CustomerServiceAgent - November 28, 2025

**Reviewer:** AI Assistant  
**Scope:** CustomerServiceAgent + 4 Handlers  
**Status:** ⚠️ CRITICAL ISSUES FOUND

---

## 🚨 **CRITICAL ISSUES**

### **1. CustomerServiceAgent.ts - Missing Import Paths**

**Issue:** Import paths are incorrect - will fail at runtime.

**Location:** Lines 17-23

**Problem:**
```typescript
import {
  ShopifyIntegration,
  PERPIntegration,
  TicketManager,
  AgentHandoffProtocol,
  AnalyticsService,
} from '../../worker/src/services';
```

**Why This is Wrong:**
- `../../worker/src/services` assumes CustomerServiceAgent is in `packages/customer-service-agent/src/`
- Worker package is at `packages/worker/src/services/`
- This path will NOT resolve correctly

**Severity:** 🔴 CRITICAL - Will break at runtime

**Fix Required:**
```typescript
import {
  ShopifyIntegration,
  PERPIntegration,
  TicketManager,
  AgentHandoffProtocol,
  AnalyticsService,
} from '@/services'; // Use alias or correct relative path
```

---

### **2. All Handlers - Same Import Path Issue**

**Issue:** All handlers have incorrect import paths.

**Locations:**
- `OrderStatusHandler.ts` line 10
- `ProductionStatusHandler.ts` line 10
- `InvoiceHandler.ts` line 10

**Problem:**
```typescript
import type { ShopifyIntegration, PERPIntegration } from '../../../worker/src/services';
```

**Severity:** 🔴 CRITICAL - Will break at runtime

**Fix Required:**
```typescript
import type { ShopifyIntegration, PERPIntegration } from '@/services';
```

---

### **3. CustomerServiceAgent.ts - Missing BaseAgent Import**

**Issue:** BaseAgent import path is incorrect.

**Location:** Line 16

**Problem:**
```typescript
import { BaseAgent } from '@dartmouth/core';
import type { AgentRequest, AgentResponse } from '@dartmouth/core';
```

**Why This is Wrong:**
- `@dartmouth/core` package doesn't exist yet
- BaseAgent is in `packages/dartmouth-core/`
- Need to set up proper package aliases

**Severity:** 🔴 CRITICAL - Will break at compile time

**Fix Required:**
- Set up TypeScript path aliases in `tsconfig.json`
- OR use relative paths: `import { BaseAgent } from '../../dartmouth-core/BaseAgent';`

---

### **4. CustomerServiceAgent.ts - Missing Method Implementation**

**Issue:** `processMessage()` method signature doesn't match BaseAgent.

**Location:** Line 130

**Problem:**
```typescript
async processMessage(request: AgentRequest): Promise<AgentResponse> {
  // ...
  const baseResponse = await super.processMessage(request);
  // ...
}
```

**Why This is Wrong:**
- We're calling `super.processMessage(request)` but BaseAgent might have a different signature
- Need to check BaseAgent's actual method signature
- Might need to pass additional parameters

**Severity:** 🟡 MEDIUM - Might work, but could have type mismatches

**Fix Required:**
- Review BaseAgent.processMessage() signature
- Ensure parameters match

---

### **5. CustomerServiceAgent.ts - No Validation**

**Issue:** No validation on config parameters.

**Location:** Constructor (lines 66-103)

**Problem:**
```typescript
constructor(config: CustomerServiceConfig) {
  super({...});
  
  this.db = config.db;
  this.shopify = new ShopifyIntegration({...});
  // No validation!
}
```

**What if:**
- `config.db` is null?
- `config.shopifyApiUrl` is empty?
- `config.perpApiKey` is missing?

**Severity:** 🟡 MEDIUM - Will cause cryptic errors at runtime

**Fix Required:**
```typescript
constructor(config: CustomerServiceConfig) {
  // Validate config
  if (!config.db) throw new Error('Database is required');
  if (!config.shopifyApiUrl) throw new Error('Shopify API URL is required');
  if (!config.perpApiUrl) throw new Error('PERP API URL is required');
  
  // ... proceed with initialization
}
```

---

### **6. All Handlers - No Error Handling for Missing Services**

**Issue:** Handlers assume services are always available.

**Location:** All handlers

**Problem:**
```typescript
const shopifyOrder = await this.shopify.getOrder(orderNumber);
```

**What if:**
- Shopify API is down?
- PERP API returns 500?
- Network timeout?

**Severity:** 🟡 MEDIUM - Will crash on API failures

**Fix Required:**
- Wrap all API calls in try-catch
- Return graceful error messages
- Log errors for monitoring

---

### **7. OrderStatusHandler.ts - Hardcoded Shopify Method**

**Issue:** Calling `this.shopify.getOrder()` but ShopifyIntegration doesn't have this method.

**Location:** Line 38

**Problem:**
```typescript
const shopifyOrder = await this.shopify.getOrder(orderNumber);
```

**Why This is Wrong:**
- ShopifyIntegration has `getCustomerByEmail()`, `getCustomerOrders()`, etc.
- But NO `getOrder(orderNumber)` method
- This will throw "method not found" error

**Severity:** 🔴 CRITICAL - Will break at runtime

**Fix Required:**
```typescript
// Need to implement getOrder() in ShopifyIntegration
// OR use getCustomerOrders() and filter by order number
```

---

### **8. CustomerServiceAgent.ts - Missing Ticket Methods**

**Issue:** Calling methods that don't exist on TicketManager.

**Location:** Lines 236, 260

**Problem:**
```typescript
await this.ticketManager.escalateTicket(ticket.ticket_id, reason.type, reason.details);
await this.ticketManager.addInternalNote(ticketId, {...});
```

**Why This is Wrong:**
- TicketManager has `escalateTicket(ticketId, reason)` (2 params, not 3)
- TicketManager might not have `addInternalNote()` method
- Need to verify TicketManager API

**Severity:** 🔴 CRITICAL - Will break at runtime

**Fix Required:**
- Review TicketManager methods
- Use correct method signatures
- OR implement missing methods

---

### **9. CustomerServiceAgent.ts - sendResponse() Never Called**

**Issue:** `sendResponse()` method is defined but never called.

**Location:** Lines 363-398

**Problem:**
```typescript
async sendResponse(ticketId: string, response: AgentResponse, gmailIntegration: any): Promise<void> {
  // ... implementation
}
```

**Why This is Wrong:**
- Method is never called in `processMessage()`
- Gmail integration is never passed to the agent
- Auto-reply vs draft logic is not triggered

**Severity:** 🔴 CRITICAL - Feature doesn't work

**Fix Required:**
- Call `sendResponse()` in `processMessage()`
- Pass GmailIntegration to constructor
- Wire up auto-reply/draft logic

---

### **10. All Handlers - No Unit Tests**

**Issue:** No tests written for any handlers.

**Severity:** 🟡 MEDIUM - Can't verify functionality

**Fix Required:**
- Write unit tests for each handler
- Mock Shopify/PERP responses
- Test error cases

---

## ⚠️ **MEDIUM ISSUES**

### **11. CustomerServiceAgent.ts - Inconsistent Error Handling**

**Issue:** Some methods have try-catch, others don't.

**Severity:** 🟡 MEDIUM

---

### **12. OrderStatusHandler.ts - Magic Numbers**

**Issue:** Hardcoded values like `5` days for shipping.

**Location:** Line 172

**Severity:** 🟢 LOW - Should be configurable

---

### **13. All Handlers - No Logging**

**Issue:** Limited logging for debugging.

**Severity:** 🟢 LOW - Nice to have

---

## ✅ **WHAT'S GOOD**

1. ✅ Good code structure and organization
2. ✅ Clear separation of concerns
3. ✅ Good TypeScript types
4. ✅ Comprehensive escalation logic
5. ✅ Good user-facing messages
6. ✅ Extends BaseAgent correctly (in theory)

---

## 🎯 **MUST FIX BEFORE CONTINUING**

### **Critical (Must Fix Now):**
1. 🔴 Fix all import paths (CustomerServiceAgent + all handlers)
2. 🔴 Fix `getOrder()` method call in OrderStatusHandler
3. 🔴 Fix `escalateTicket()` and `addInternalNote()` method calls
4. 🔴 Wire up `sendResponse()` method
5. 🔴 Set up TypeScript path aliases

### **Important (Fix Before Testing):**
6. 🟡 Add config validation in constructor
7. 🟡 Add error handling to all API calls
8. 🟡 Verify BaseAgent method signatures

### **Nice to Have (Fix Later):**
9. 🟢 Write unit tests
10. 🟢 Add more logging
11. 🟢 Make magic numbers configurable

---

## 📝 **ACTION PLAN**

### **Phase 1: Fix Critical Issues (1 hour)**
1. Set up TypeScript path aliases
2. Fix all import paths
3. Implement missing ShopifyIntegration methods
4. Fix TicketManager method calls
5. Wire up sendResponse()

### **Phase 2: Fix Important Issues (30 minutes)**
6. Add config validation
7. Add error handling
8. Verify BaseAgent compatibility

### **Phase 3: Write Tests (1 hour)**
9. Write unit tests for CustomerServiceAgent
10. Write unit tests for all handlers
11. Test error cases

---

## 🚦 **RECOMMENDATION**

**DO NOT CONTINUE** until critical issues are fixed.

**Why?**
- Import paths are broken - code won't even compile
- Missing methods will cause runtime errors
- sendResponse() doesn't work - core feature is broken

**Timeline:**
- Fix critical issues: 1 hour
- Fix important issues: 30 minutes
- Write tests: 1 hour
- **Total: 2.5 hours before continuing**

---

**Review Status:** 🔴 CRITICAL ISSUES FOUND  
**Next Action:** Fix all critical issues immediately  
**Estimated Fix Time:** 1-2 hours


