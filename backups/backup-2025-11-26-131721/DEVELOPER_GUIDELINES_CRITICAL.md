# 🚨 CRITICAL DEVELOPER GUIDELINES - DARTMOUTH OS

**Created:** 2025-11-22  
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL  
**Audience:** ALL Developers (Current + Future)

---

## 🎯 OWNERSHIP & ARCHITECTURE

### **CRITICAL UNDERSTANDING:**

```
┌─────────────────────────────────────────────────────────┐
│  DARTMOUTH OS = JOHN'S PLATFORM                         │
│  - John owns 100% of the architecture                   │
│  - John owns 100% of the codebase                       │
│  - John owns 100% of the vision                         │
│  - Developers are PAID HELPERS                          │
│  - Developers MUST follow John's architecture           │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ BUILDING DARTMOUTH OS INFRASTRUCTURE

### **IF YOU'RE BUILDING PLATFORM SERVICES:**

#### **✅ YOU MUST:**

1. **Build for REUSABILITY**
   - ✅ Service must work for ALL agents (not just PA Agent)
   - ✅ Service must be generic and configurable
   - ✅ Service must follow Dartmouth OS patterns
   - ✅ Service must have clear API contracts

2. **Follow Dartmouth OS Architecture**
   - ✅ Use existing patterns (see FAM, Artwork Agent)
   - ✅ Use TypeScript with strict types
   - ✅ Use Cloudflare Workers best practices
   - ✅ Use monorepo structure (`packages/`)

3. **Document EVERYTHING**
   - ✅ API documentation (endpoints, parameters, responses)
   - ✅ Code comments (why, not just what)
   - ✅ Usage examples (how other agents will use it)
   - ✅ Testing documentation

4. **Get Approval BEFORE Building**
   - ✅ Share design document
   - ✅ Get architecture approval from John/AI
   - ✅ Confirm API contracts
   - ✅ Confirm it meets ALL agent needs (not just PA)

5. **Write Tests**
   - ✅ Unit tests for all functions
   - ✅ Integration tests for API endpoints
   - ✅ Test with multiple agents (not just PA)

---

### **❌ YOU MUST NOT:**

1. **Build PA Agent-Specific Infrastructure**
   - ❌ Don't hardcode PA Agent logic in platform services
   - ❌ Don't optimize only for PA Agent use cases
   - ❌ Don't skip features other agents need

2. **Deviate from Architecture**
   - ❌ Don't use different patterns than existing code
   - ❌ Don't introduce new tech stack without approval
   - ❌ Don't skip TypeScript types
   - ❌ Don't bypass Dartmouth OS layers

3. **Skip Documentation**
   - ❌ Don't commit without API docs
   - ❌ Don't skip code comments
   - ❌ Don't skip usage examples

4. **Make Unilateral Decisions**
   - ❌ Don't change architecture without approval
   - ❌ Don't add dependencies without approval
   - ❌ Don't change API contracts without approval

---

## 🎯 HYBRID APPROACH - WHO BUILDS WHAT

### **DEVELOPER BUILDS (with strict guidelines):**

#### **1. Voice Services (Layer 7) - Week 2-3**

**Why Developer:** Voice is PA Agent's core feature, developer knows requirements

**CRITICAL REQUIREMENTS:**
```typescript
// ✅ GOOD: Generic, reusable
class VoiceService {
  async speechToText(
    audioStream: ReadableStream,
    options: STTOptions
  ): Promise<STTResult> {
    // Works for ANY agent
  }
}

// ❌ BAD: PA Agent specific
class VoiceService {
  async transcribeTaskCommand(audio: Buffer): Promise<Task> {
    // Only works for PA Agent!
  }
}
```

**Must Support:**
- ✅ PA Agent (voice commands)
- ✅ Customer Service Agent (phone support)
- ✅ Any future voice agent
- ✅ Multiple languages (configurable)
- ✅ Multiple providers (Native, Deepgram, Whisper)

**Deliverables:**
- ✅ `packages/voice-services/` (complete package)
- ✅ API documentation
- ✅ Usage examples for multiple agents
- ✅ Tests

---

#### **2. PA Agent Backend - Week 5**

**Why Developer:** PA Agent specific, developer knows requirements

**REQUIREMENTS:**
```typescript
// ✅ Extends FAM (follows pattern)
class McCarthyPAAgent extends BaseAgent {
  // PA-specific handlers
}
```

**Must Follow:**
- ✅ Extend FAM (don't rebuild base agent)
- ✅ Use Voice Services (Layer 7)
- ✅ Use Calendar Services (Layer 4)
- ✅ Use Auth Services (Layer 3)
- ✅ Register with Agent Registry

---

#### **3. React Native Frontend - Week 6-7**

**Why Developer:** Mobile app, developer's expertise

**REQUIREMENTS:**
- ✅ Connect to Dartmouth OS APIs
- ✅ Use standard API contracts
- ✅ Handle offline gracefully
- ✅ Follow React Native best practices

---

### **JOHN + AI BUILD:**

#### **1. Calendar/Email APIs (Layer 4) - Week 3-4**

**Why John/AI:** Universal platform services, used by many agents

**Must Support:**
- ✅ PA Agent (personal calendar)
- ✅ Customer Service Agent (appointment booking)
- ✅ Cold Outreach Agent (email campaigns)
- ✅ Any agent needing calendar/email

---

#### **2. JWT Auth (Layer 3) - Week 4**

**Why John/AI:** Security-critical, universal service

**Must Support:**
- ✅ All agents
- ✅ Multi-tenancy
- ✅ Role-based access control

---

#### **3. Other Agents - Parallel**

**Why John/AI:** Build other agents while developer works on PA

- Customer Service Agent
- Sales Agent
- Research Agent
- etc.

---

## 🔍 CODE REVIEW REQUIREMENTS

### **ALL Platform Service PRs MUST:**

1. **Architecture Review**
   - ✅ Follows Dartmouth OS patterns
   - ✅ Reusable by multiple agents
   - ✅ No agent-specific logic in platform layer

2. **API Review**
   - ✅ Clear API contracts
   - ✅ Documented endpoints
   - ✅ Versioned APIs
   - ✅ Backward compatible

3. **Code Quality**
   - ✅ TypeScript strict mode
   - ✅ No `any` types
   - ✅ Comprehensive comments
   - ✅ Error handling

4. **Testing**
   - ✅ Unit tests (80%+ coverage)
   - ✅ Integration tests
   - ✅ Tested with multiple agents

5. **Documentation**
   - ✅ API documentation
   - ✅ Usage examples
   - ✅ Architecture notes

---

## 🚨 EXAMPLES: GOOD vs BAD

### **Example 1: Voice Services**

#### ❌ BAD (PA Agent Specific):
```typescript
// packages/voice-services/VoiceService.ts
class VoiceService {
  async handleTaskCommand(audio: Buffer): Promise<Task> {
    const text = await this.stt(audio);
    // Parse as task command
    return parseTaskCommand(text);
  }
}
```

**Why Bad:**
- Hardcoded for PA Agent tasks
- Can't be used by Customer Service
- Can't be used by other agents

---

#### ✅ GOOD (Generic, Reusable):
```typescript
// packages/voice-services/VoiceService.ts
class VoiceService {
  /**
   * Convert speech to text
   * @param audioStream - Audio input stream
   * @param options - STT configuration
   * @returns Transcribed text with metadata
   */
  async speechToText(
    audioStream: ReadableStream,
    options: STTOptions = {}
  ): Promise<STTResult> {
    const provider = this.selectProvider(options);
    const result = await provider.transcribe(audioStream);
    
    return {
      text: result.text,
      confidence: result.confidence,
      language: result.language,
      duration: result.duration,
      provider: provider.name
    };
  }
  
  /**
   * Convert text to speech
   * @param text - Text to convert
   * @param options - TTS configuration
   * @returns Audio stream
   */
  async textToSpeech(
    text: string,
    options: TTSOptions = {}
  ): Promise<ReadableStream> {
    const provider = this.selectProvider(options);
    return await provider.synthesize(text, options);
  }
}

// Usage by PA Agent:
const voiceService = new VoiceService();
const result = await voiceService.speechToText(audioStream);
// PA Agent interprets result.text as task command

// Usage by Customer Service Agent:
const voiceService = new VoiceService();
const result = await voiceService.speechToText(audioStream);
// Customer Service interprets result.text as support question
```

**Why Good:**
- Generic STT/TTS
- Works for ANY agent
- Each agent interprets text differently
- Reusable across platform

---

### **Example 2: Calendar Service**

#### ❌ BAD (PA Agent Specific):
```typescript
// packages/integration-services/CalendarService.ts
class CalendarService {
  async addFamilyEvent(
    title: string,
    time: Date,
    familyMembers: string[]
  ): Promise<Event> {
    // Hardcoded for PA Agent family coordination
  }
}
```

**Why Bad:**
- Hardcoded for PA Agent use case
- Can't be used by Customer Service (appointment booking)
- Can't be used by other agents

---

#### ✅ GOOD (Generic, Reusable):
```typescript
// packages/integration-services/CalendarService.ts
class CalendarService {
  /**
   * Create calendar event
   * @param calendarId - Target calendar
   * @param event - Event details
   * @returns Created event
   */
  async createEvent(
    calendarId: string,
    event: CalendarEvent
  ): Promise<Event> {
    // Generic event creation
    const provider = this.getProvider(calendarId);
    return await provider.createEvent(event);
  }
  
  /**
   * List events in date range
   * @param calendarId - Target calendar
   * @param range - Date range
   * @returns List of events
   */
  async listEvents(
    calendarId: string,
    range: DateRange
  ): Promise<Event[]> {
    const provider = this.getProvider(calendarId);
    return await provider.listEvents(range);
  }
}

// Usage by PA Agent:
const calendar = new CalendarService();
await calendar.createEvent('family-calendar', {
  title: 'Pick up kids',
  start: new Date('2025-11-22T15:00:00'),
  attendees: ['john@dtf.com.au', 'wife@example.com']
});

// Usage by Customer Service Agent:
const calendar = new CalendarService();
await calendar.createEvent('support-calendar', {
  title: 'Customer callback',
  start: new Date('2025-11-22T14:00:00'),
  attendees: ['support@dtf.com.au', 'customer@example.com']
});
```

**Why Good:**
- Generic calendar operations
- Works for ANY agent
- Each agent uses for different purposes
- Reusable across platform

---

## 📋 DEVELOPER CHECKLIST

### **Before Starting ANY Platform Service:**

- [ ] Read this document completely
- [ ] Review existing Dartmouth OS code (FAM, Artwork Agent)
- [ ] Review architecture documentation
- [ ] Create design document
- [ ] Get approval from John/AI
- [ ] Confirm API contracts
- [ ] Confirm it meets ALL agent needs (not just PA)

### **During Development:**

- [ ] Follow TypeScript strict mode
- [ ] Use existing patterns
- [ ] Write comprehensive comments
- [ ] Write tests as you go
- [ ] Document APIs
- [ ] Test with multiple use cases

### **Before Submitting PR:**

- [ ] All tests passing
- [ ] API documentation complete
- [ ] Usage examples for multiple agents
- [ ] Code reviewed by yourself first
- [ ] No agent-specific logic in platform layer
- [ ] Follows Dartmouth OS patterns

---

## 🎯 SUCCESS CRITERIA

### **Platform Service is GOOD if:**

1. ✅ **Reusable:** Works for multiple agents
2. ✅ **Generic:** No agent-specific logic
3. ✅ **Documented:** Clear API docs + examples
4. ✅ **Tested:** 80%+ coverage, multiple use cases
5. ✅ **Follows Patterns:** Matches existing Dartmouth OS code
6. ✅ **Approved:** John/AI reviewed and approved

### **Platform Service is BAD if:**

1. ❌ **PA Agent Specific:** Only works for PA Agent
2. ❌ **Hardcoded:** Specific to one use case
3. ❌ **Undocumented:** No API docs or examples
4. ❌ **Untested:** No tests or low coverage
5. ❌ **Different Patterns:** Doesn't match Dartmouth OS style
6. ❌ **Unapproved:** Built without design review

---

## 🚀 REMEMBER

### **YOU ARE BUILDING FOR THE PLATFORM, NOT JUST PA AGENT!**

```
When building Voice Services:
❌ Don't think: "How does PA Agent need voice?"
✅ Think: "How do ALL agents need voice?"

When building Calendar API:
❌ Don't think: "How does PA Agent need calendar?"
✅ Think: "How do ALL agents need calendar?"

When building ANY platform service:
❌ Don't think: "What does MY agent need?"
✅ Think: "What does THE PLATFORM need?"
```

---

## 💰 OWNERSHIP REMINDER

```
┌─────────────────────────────────────────────────────────┐
│  JOHN OWNS DARTMOUTH OS                                 │
│                                                          │
│  - You are a paid helper                                │
│  - You follow John's architecture                       │
│  - You build what John needs                            │
│  - You get approval before building                     │
│  - You document everything                              │
│  - You build for reusability                            │
│                                                          │
│  If you build platform services, they become part of    │
│  JOHN'S PLATFORM and must work for ALL agents.          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 BOTTOM LINE

### **IF YOU'RE BUILDING DARTMOUTH OS INFRASTRUCTURE:**

1. **It's NOT yours** - It's John's platform
2. **It's NOT for PA Agent** - It's for ALL agents
3. **It's NOT optional** - Follow these guidelines strictly
4. **It's NOT negotiable** - Get approval before building

### **IF YOU DON'T FOLLOW THESE GUIDELINES:**

- ❌ Your PR will be rejected
- ❌ You'll need to rebuild
- ❌ You'll waste time
- ❌ You'll delay the project

### **IF YOU DO FOLLOW THESE GUIDELINES:**

- ✅ Your PR will be approved quickly
- ✅ Your code will be reused by all agents
- ✅ You'll contribute to the platform
- ✅ You'll help the project succeed

---

**🚨 THIS IS CRITICAL - READ IT, UNDERSTAND IT, FOLLOW IT!**

---

**Last Updated:** 2025-11-22  
**Status:** ACTIVE - MANDATORY FOR ALL DEVELOPERS  
**Owner:** John Hutchison


