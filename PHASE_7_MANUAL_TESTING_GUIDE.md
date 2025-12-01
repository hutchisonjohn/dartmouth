# Phase 7: Manual Testing Guide

**Quick guide for testing Dartmouth OS V2.0 locally**

---

## 🚀 **SETUP (Already Done)**

✅ Worker running: `npm run dev` in `packages/worker`  
✅ API Key configured: `.dev.vars` file  
✅ Local URL: http://localhost:8787

---

## 🧪 **QUICK TESTS**

### **Test 1: FAM Agent (Basic Chat)**

**Endpoint:** `POST http://localhost:8787/api/v2/chat`

**Request:**
```json
{
  "agentId": "fam",
  "message": "Hello! My name is John.",
  "sessionId": "test-session-123"
}
```

**Expected:** Friendly greeting response with name acknowledgment

---

### **Test 2: FAM Agent (Memory)**

**Request:**
```json
{
  "agentId": "fam",
  "message": "What's my name?",
  "sessionId": "test-session-123"
}
```

**Expected:** "Your name is John" (remembers from previous message)

---

### **Test 3: Artwork Analyzer (Calculation)**

**Request:**
```json
{
  "agentId": "mccarthy-artwork",
  "message": "What size can I print 4000x6000 pixels at 300 DPI?",
  "sessionId": "artwork-test-123"
}
```

**Expected:** 
- CM dimensions first
- Inches second
- Quality rating
- Friendly personality

---

### **Test 4: Health Check**

**Endpoint:** `GET http://localhost:8787/api/v2/health`

**Expected:**
```json
{
  "status": "healthy",
  "agents": [
    { "agentId": "fam", "status": "healthy" },
    { "agentId": "mccarthy-artwork", "status": "healthy" },
    { "agentId": "test-agent", "status": "healthy" }
  ]
}
```

---

### **Test 5: Agents List**

**Endpoint:** `GET http://localhost:8787/api/v2/agents`

**Expected:**
```json
{
  "total": 3,
  "healthy": 3,
  "unhealthy": 0,
  "agents": [...]
}
```

---

## 🌐 **UI TESTING**

### **Test FAM UI**
1. Open: `D:\coding\agent-army-system\public\test-fam.html`
2. Type: "Hi, I'm Sarah"
3. Type: "What's my name?"
4. Expected: Agent remembers "Sarah"

### **Test Artwork Analyzer UI**
1. Open: `D:\coding\agent-army-system\public\index.html`
2. Type: "What size can I print 4000x6000 pixels at 300 DPI?"
3. Expected: Calculation with CM first, personality, quality rating

---

## ✅ **SUCCESS CRITERIA**

- ✅ All 3 agents respond
- ✅ FAM remembers conversation context
- ✅ Artwork Analyzer performs calculations correctly
- ✅ Health endpoints return "healthy"
- ✅ UI connects and displays responses

---

## 🐛 **IF SOMETHING FAILS**

1. Check worker is running: `npm run dev` in `packages/worker`
2. Check API key in `.dev.vars`
3. Check browser console for errors
4. Check terminal for worker errors

---

## 📊 **CURRENT STATUS**

✅ **Automated Tests:** 97.7% pass (43/44)  
⏳ **Manual Tests:** Ready to run  
✅ **Worker:** Running on http://localhost:8787

---

**Ready to test!** 🎉

