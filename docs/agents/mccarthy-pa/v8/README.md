# McCarthy PA Agent V8 - Documentation

**Voice + Text AI Personal Assistant powered by Dartmouth OS**

---

## 📚 Complete Documentation

### **🏗️ Architecture & Planning**
- **[Dartmouth Architecture](MCCARTHY_PA_DARTMOUTH_ARCHITECTURE.md)** ⭐ **START HERE**
  - Complete architecture overview
  - Migration strategy from Firebase V7
  - Cost analysis (70% reduction)
  - 7-week timeline

### **👨‍💻 Developer Guides**
- **[Developer Migration Guide](MCCARTHY_PA_DEVELOPER_GUIDE.md)** ⭐ **FOR DEVELOPERS**
  - Step-by-step migration instructions
  - Code examples (V7 → V8)
  - Data migration process
  - Testing & deployment

### **🎤 Voice Implementation**
- **[Voice Implementation Guide](MCCARTHY_PA_VOICE_IMPLEMENTATION.md)**
  - STT (Deepgram, Whisper, Native)
  - TTS (F5-TTS, OpenAI, Native)
  - Audio streaming (WebSocket/WebRTC)
  - VAD & interrupt handling

### **📖 API Reference**
- **[API Reference](MCCARTHY_PA_API_REFERENCE.md)**
  - Complete API documentation
  - Authentication endpoints
  - Chat & voice endpoints
  - Tasks, reminders, notes, calendar, contacts
  - Error handling & rate limiting

### **📋 Technical Specifications**
- **[Technical Specification V8](MCCARTHY_PA_TECHNICAL_SPECIFICATION_V8.md)**
  - Detailed technical spec
  - Database schema
  - Security & privacy
  - Performance requirements

---

## 🚀 Quick Start

### **For Your Meeting Today (Nov 19)**

1. **Read:** [Dartmouth Architecture](MCCARTHY_PA_DARTMOUTH_ARCHITECTURE.md) (15 min)
   - Understand the big picture
   - See cost savings (70%)
   - Review migration timeline

2. **Review:** [Developer Migration Guide](MCCARTHY_PA_DEVELOPER_GUIDE.md) (20 min)
   - See code examples
   - Understand what changes
   - Review data migration

3. **Explore:** [Voice Implementation](MCCARTHY_PA_VOICE_IMPLEMENTATION.md) (15 min)
   - Understand voice architecture
   - See F5-TTS integration
   - Review audio streaming

4. **Reference:** [API Reference](MCCARTHY_PA_API_REFERENCE.md) (as needed)
   - Complete API docs
   - Use during development

**Total Reading Time:** ~50 minutes

---

## 📊 Key Highlights

### **Cost Savings**
| Current (V7) | Future (V8) | Savings |
|--------------|-------------|---------|
| $45-120/month | $15-45/month | **70%** |

### **Performance Improvements**
| Metric | V7 (Firebase) | V8 (Dartmouth) |
|--------|---------------|----------------|
| **Cold Start** | 2-5s | 0ms (instant) |
| **Response Time** | 500-1000ms | 200-400ms |
| **Voice Latency** | 1-2s | 300-500ms |

### **New Capabilities**
- ✅ Real-time voice streaming (WebSocket/WebRTC)
- ✅ Multi-modal intelligence (voice + text + images)
- ✅ Agent-to-agent communication
- ✅ Built-in analytics & monitoring
- ✅ Multi-layer caching (60% cost savings)
- ✅ F5-TTS integration (high-quality, low-cost voice)

---

## 🗺️ Migration Timeline

### **Week 2-3: Parallel Development**
- Build V8 on Dartmouth OS
- Keep V7 running (no disruption)
- Test V8 with internal users

### **Week 4: Data Migration**
- Export Firestore data
- Import to Cloudflare D1
- Verify data integrity

### **Week 5-6: Gradual Rollout**
- 10% → 50% → 100% of users
- Monitor performance & costs

### **Week 7: Decommission V7**
- Shut down Firebase
- Full V8 production

---

## 🛠️ Technical Stack

### **Frontend (React Native)**
- React Native 0.72+
- React Native Paper (UI)
- Zustand (state management)
- react-native-voice (STT)
- react-native-tts (TTS)
- react-native-webrtc (streaming)

### **Backend (Dartmouth OS)**
- Cloudflare Workers (compute)
- Cloudflare D1 (database)
- Cloudflare R2 (storage)
- Cloudflare KV (cache)
- Deepgram (STT)
- F5-TTS (TTS)
- OpenAI GPT-4o-mini (LLM)
- Qwen2-VL (vision)

---

## 📞 Support

For questions or issues:
- **Meeting:** Today (Nov 19, 2024)
- **Slack:** #mccarthy-pa-development
- **Email:** [Contact]
- **Docs:** This folder

---

## 🔗 Related Documentation

- [Dartmouth OS V2.0 Spec](../../dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md)
- [Voice Services Spec](../../dartmouth-os/v2/DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md)
- [FAM Specification](../../fam/FAM_COMPLETE_SPECIFICATION.md)
- [Agent Development Guide](../../dartmouth-os/guides/AGENT_DEVELOPMENT_GUIDE.md)

---

**McCarthy PA V8 - Voice-first AI assistant, powered by Dartmouth OS.** 🎤🚀

