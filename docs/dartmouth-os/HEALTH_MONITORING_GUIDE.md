# 🏥 Dartmouth OS - Health Monitoring Guide

**Version:** 2.0.0  
**Date:** November 20, 2024  
**Status:** Active

---

## 📖 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Health Check Endpoints](#health-check-endpoints)
3. [Health Status Types](#health-status-types)
4. [Monitoring Strategy](#monitoring-strategy)
5. [Alert Thresholds](#alert-thresholds)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 **OVERVIEW**

Dartmouth OS includes a comprehensive health monitoring system that tracks the health and performance of all registered agents.

### **Key Features:**

- ✅ **Automatic Health Checks** - Periodic health checks for all agents
- ✅ **Real-time Status** - Get current health status instantly
- ✅ **Performance Metrics** - Track response times, error rates, success rates
- ✅ **Alert System** - Automatic alerts when agents become unhealthy
- ✅ **Agent-Specific Checks** - Check individual agent health
- ✅ **System-Wide Checks** - Check all agents at once

---

## 🔗 **HEALTH CHECK ENDPOINTS**

### **1. Overall Health Check**

Check the health of all registered agents.

**Endpoint:**
```
GET /api/v2/health
```

**Response:**
```json
{
  "status": "healthy",
  "agents": [
    {
      "agentId": "fam",
      "status": "healthy",
      "responseTime": 45,
      "errorCount": 0,
      "successCount": 1523,
      "lastCheck": 1700000000000
    },
    {
      "agentId": "mccarthy-artwork",
      "status": "healthy",
      "responseTime": 52,
      "errorCount": 2,
      "successCount": 847,
      "lastCheck": 1700000000000
    },
    {
      "agentId": "test-agent",
      "status": "healthy",
      "responseTime": 12,
      "errorCount": 0,
      "successCount": 50,
      "lastCheck": 1700000000000
    }
  ],
  "timestamp": 1700000000000
}
```

**Status Codes:**
- `200` - All agents healthy
- `503` - One or more agents unhealthy

---

### **2. Specific Agent Health Check**

Check the health of a specific agent.

**Endpoint:**
```
GET /api/v2/health?agentId={agentId}
```

**Example:**
```
GET /api/v2/health?agentId=fam
```

**Response:**
```json
{
  "agentId": "fam",
  "status": "healthy",
  "responseTime": 45,
  "errorCount": 0,
  "successCount": 1523,
  "lastCheck": 1700000000000,
  "details": {
    "name": "Foundational Agent McCarthy (FAM)",
    "version": "1.0.0"
  }
}
```

**Status Codes:**
- `200` - Agent healthy
- `503` - Agent unhealthy
- `404` - Agent not found

---

### **3. Agent List**

Get a list of all registered agents with their health status.

**Endpoint:**
```
GET /api/v2/agents
```

**Response:**
```json
{
  "total": 3,
  "healthy": 3,
  "unhealthy": 0,
  "unknown": 0,
  "agents": [
    {
      "id": "fam",
      "name": "Foundational Agent McCarthy (FAM)",
      "status": "active",
      "healthStatus": "healthy",
      "registeredAt": 1700000000000,
      "lastCheck": 1700000000000
    },
    {
      "id": "mccarthy-artwork",
      "name": "McCarthy Artwork Analyzer",
      "status": "active",
      "healthStatus": "healthy",
      "registeredAt": 1700000000000,
      "lastCheck": 1700000000000
    },
    {
      "id": "test-agent",
      "name": "Test Agent",
      "status": "active",
      "healthStatus": "healthy",
      "registeredAt": 1700000000000,
      "lastCheck": 1700000000000
    }
  ]
}
```

---

## 📊 **HEALTH STATUS TYPES**

### **Agent Health Status**

| Status | Description | Action Required |
|--------|-------------|-----------------|
| `healthy` | Agent responding normally, low error rate | ✅ None |
| `degraded` | Agent responding slowly or elevated error rate | ⚠️ Monitor closely |
| `unhealthy` | Agent not responding or high error rate | 🔴 Immediate action |

### **System Health Status**

| Status | Description | Condition |
|--------|-------------|-----------|
| `healthy` | All agents healthy | 100% agents healthy |
| `degraded` | Some agents degraded or unhealthy | 1-50% agents unhealthy |
| `unhealthy` | Most agents unhealthy | >50% agents unhealthy |

---

## 🔍 **MONITORING STRATEGY**

### **Automatic Health Checks**

Dartmouth OS automatically runs health checks at regular intervals.

**Default Configuration:**
- **Interval:** 60 seconds (1 minute)
- **Alert Threshold:** 3 consecutive failures
- **Response Timeout:** 5 seconds

**What's Checked:**
1. Agent responsiveness (can process test message)
2. Response time (< 1 second = healthy, > 1 second = degraded)
3. Error count (tracked over time)
4. Success count (tracked over time)

### **Manual Health Checks**

You can trigger manual health checks at any time using the endpoints above.

**Use Cases:**
- After deploying new code
- After configuration changes
- When investigating issues
- For monitoring dashboards

---

## 🚨 **ALERT THRESHOLDS**

### **When Alerts Are Triggered**

Alerts are triggered when:

1. **Agent becomes unhealthy** - Agent fails health check
2. **High error rate** - Error count exceeds threshold
3. **Slow response time** - Response time > 5 seconds
4. **Multiple failures** - 3+ consecutive health check failures

### **Alert Actions**

When an alert is triggered:

1. **Log Warning** - Alert logged to console/monitoring
2. **Update Status** - Agent status updated to `unhealthy`
3. **Notify Team** - (Future) Send alert to PagerDuty/Slack
4. **Auto-Recovery** - (Future) Attempt automatic recovery

---

## 🔧 **TROUBLESHOOTING**

### **Agent Shows as Unhealthy**

**Possible Causes:**
1. Agent code has a bug
2. Dependencies unavailable (LLM API, database)
3. High load causing timeouts
4. Configuration error

**Steps to Fix:**
1. Check agent logs for errors
2. Verify dependencies are available
3. Test agent manually with `/api/v2/chat`
4. Check configuration (API keys, environment variables)
5. Restart worker if needed

---

### **High Response Times**

**Possible Causes:**
1. LLM API slow
2. Database query slow
3. High load
4. Network issues

**Steps to Fix:**
1. Check LLM API status
2. Optimize database queries
3. Add caching
4. Scale up resources

---

### **High Error Rates**

**Possible Causes:**
1. Invalid API keys
2. Rate limits exceeded
3. Code bugs
4. Invalid requests

**Steps to Fix:**
1. Verify API keys are valid
2. Check rate limits
3. Review error logs
4. Fix code bugs

---

## 📈 **MONITORING BEST PRACTICES**

### **1. Set Up Alerts**

Configure alerts for:
- Agent health status changes
- High error rates
- Slow response times
- System-wide issues

### **2. Monitor Regularly**

Check health status:
- Before deployments
- After deployments
- During high traffic
- Daily health checks

### **3. Track Metrics**

Monitor over time:
- Response times (trend)
- Error rates (trend)
- Success rates (trend)
- Agent availability (uptime)

### **4. Document Issues**

When issues occur:
- Document the problem
- Document the solution
- Update runbooks
- Improve monitoring

---

## 🧪 **TESTING HEALTH MONITORING**

### **Manual Test**

```bash
# Test overall health
curl https://api.dartmouth-os.com/api/v2/health

# Test specific agent
curl https://api.dartmouth-os.com/api/v2/health?agentId=fam

# Test agent list
curl https://api.dartmouth-os.com/api/v2/agents
```

### **Automated Test**

```bash
# Run health verification script
node tools/scripts/verify-health.js
```

---

## 📞 **SUPPORT**

- **Documentation:** [docs/dartmouth-os/](.)
- **API Reference:** [DARTMOUTH_API_V2_DOCUMENTATION.md](v2/DARTMOUTH_API_V2_DOCUMENTATION.md)
- **GitHub:** [github.com/hutchisonjohn/dartmouth](https://github.com/hutchisonjohn/dartmouth)

---

**STATUS: HEALTH MONITORING ACTIVE** 🏥

All health monitoring systems operational and ready for production use.

