# 🎤 DARTMOUTH VOICE SERVICES - Complete Specification
## Layer 7: Voice & Audio Platform Services

**Version:** 2.0.0  
**Date:** November 19, 2024  
**Status:** Active Development  
**Purpose:** Comprehensive voice and audio services for all agents

---

## 📖 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Services](#services)
4. [Tech Stack](#tech-stack)
5. [Cost Analysis](#cost-analysis)
6. [Implementation Guide](#implementation-guide)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)

---

## 🎯 **OVERVIEW**

### **What are Dartmouth Voice Services?**

**Dartmouth Voice Services** is a complete voice and audio platform (Layer 7) that enables voice-first agents. It provides:

- **Speech-to-Text (STT)** - Convert voice to text
- **Text-to-Speech (TTS)** - Convert text to voice
- **Audio Streaming** - Real-time audio processing
- **Voice Activity Detection (VAD)** - Detect when user is speaking
- **Interrupt Handling** - Handle user interruptions mid-response

### **Why Voice Services?**

Voice is the **most natural interface** for AI agents:
- ✅ **Faster** - 3x faster than typing
- ✅ **Hands-free** - Use while driving, cooking, working
- ✅ **Accessible** - Better for users with disabilities
- ✅ **Natural** - Conversational, human-like
- ✅ **Multi-tasking** - Use while doing other things

### **Which Agents Use Voice?**

| Agent | Voice Usage | Priority |
|-------|-------------|----------|
| **PA Agent** | Primary interface | 🔴 Critical |
| **CustomerSupport AI** | Phone support | 🟡 High |
| **Artwork Analyzer** | Optional (future) | 🟢 Low |
| **FAM** | Optional (future) | 🟢 Low |

---

## 🏗️ **ARCHITECTURE**

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (iOS/Android/Web)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Microphone   │  │  Speaker     │  │  UI          │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebRTC / HTTP
┌─────────────────────────────────────────────────────────────┐
│              DARTMOUTH VOICE SERVICES (Layer 7)              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  VOICE GATEWAY (Cloudflare Workers)                  │   │
│  │  - Route audio requests                              │   │
│  │  - Handle WebRTC connections                         │   │
│  │  - Manage audio streams                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  STT SERVICE (Speech-to-Text)                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Native STT │  │ F5-TTS     │  │ Whisper    │     │   │
│  │  │ (Primary)  │  │ (Backup)   │  │ (Fallback) │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TTS SERVICE (Text-to-Speech)                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Native TTS │  │ F5-TTS     │  │ ElevenLabs │     │   │
│  │  │ (Primary)  │  │ (Backup)   │  │ (Premium)  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AUDIO STREAMING SERVICE                             │   │
│  │  - Real-time audio processing                        │   │
│  │  - WebRTC signaling                                  │   │
│  │  - Audio buffering                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  VAD SERVICE (Voice Activity Detection)              │   │
│  │  - Detect speech start/end                           │   │
│  │  - Filter background noise                           │   │
│  │  - Silence detection                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  INTERRUPT HANDLER                                   │   │
│  │  - Detect user interruptions                         │   │
│  │  - Stop current TTS playback                         │   │
│  │  - Queue new STT request                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DARTMOUTH CORE (Layers 1-6)               │
│  LLM | RAG | Database | Auth | Analytics                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 **SERVICES**

### **1. Speech-to-Text (STT)**

**Purpose:** Convert voice audio to text

**Providers (Priority Order):**

1. **Native STT (iOS/Android)** - PRIMARY
   - Cost: **FREE**
   - Quality: Good
   - Latency: Low (on-device)
   - Languages: 50+
   - Use: 90% of requests

2. **F5-TTS (Self-Hosted)** - BACKUP
   - Cost: **$0.01/min** (compute)
   - Quality: Excellent
   - Latency: Medium (API call)
   - Languages: 100+
   - Use: 8% of requests (when native unavailable)

3. **OpenAI Whisper** - FALLBACK
   - Cost: **$0.006/min**
   - Quality: Excellent
   - Latency: Low (API call)
   - Languages: 99
   - Use: 2% of requests (when F5-TTS fails)

**API Endpoint:**
```
POST /api/v2/voice/stt
```

**Request:**
```json
{
  "audioUrl": "https://example.com/audio.mp3",
  "language": "en-US",
  "provider": "auto" // or "native", "f5", "whisper"
}
```

**Response:**
```json
{
  "transcript": "Hello, how can I help you today?",
  "confidence": 0.95,
  "language": "en-US",
  "duration": 3.2,
  "provider": "native",
  "cost": 0.0
}
```

---

### **2. Text-to-Speech (TTS)**

**Purpose:** Convert text to voice audio

**Providers (Priority Order):**

1. **Native TTS (iOS/Android)** - PRIMARY
   - Cost: **FREE**
   - Quality: Good
   - Latency: Low (on-device)
   - Voices: 10-20 per language
   - Use: 90% of requests

2. **F5-TTS (Self-Hosted)** - BACKUP
   - Cost: **$0.01/min** (compute)
   - Quality: Excellent (natural, expressive)
   - Latency: Medium (API call)
   - Voices: Unlimited (voice cloning)
   - Use: 8% of requests (premium quality)

3. **ElevenLabs** - PREMIUM
   - Cost: **$0.30/1K chars** ($0.30/min)
   - Quality: Exceptional (human-like)
   - Latency: Low (API call)
   - Voices: 1000+ (voice cloning)
   - Use: 2% of requests (premium users only)

**API Endpoint:**
```
POST /api/v2/voice/tts
```

**Request:**
```json
{
  "text": "Hello, how can I help you today?",
  "voice": "alloy", // or voice ID
  "language": "en-US",
  "provider": "auto", // or "native", "f5", "elevenlabs"
  "format": "mp3" // or "wav", "opus"
}
```

**Response:**
```json
{
  "audioUrl": "https://r2.dartmouth-os.com/audio/abc123.mp3",
  "duration": 3.2,
  "voice": "alloy",
  "provider": "native",
  "cost": 0.0,
  "expiresAt": 1700000000000
}
```

---

### **3. Audio Streaming**

**Purpose:** Real-time audio processing for voice conversations

**Protocol:** WebRTC

**Features:**
- Real-time bidirectional audio
- Low latency (<100ms)
- Automatic echo cancellation
- Noise suppression
- Automatic gain control

**API Endpoint:**
```
WS /api/v2/voice/stream
```

**WebSocket Protocol:**

```javascript
// Client connects
const ws = new WebSocket('wss://api.dartmouth-os.com/api/v2/voice/stream');

// Send audio chunks
ws.send(JSON.stringify({
  type: 'audio',
  data: audioChunkBase64,
  format: 'pcm16',
  sampleRate: 16000
}));

// Receive transcripts
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'transcript') {
    console.log('User said:', message.text);
  }
  if (message.type === 'audio') {
    // Play TTS audio
    playAudio(message.data);
  }
};
```

---

### **4. Voice Activity Detection (VAD)**

**Purpose:** Detect when user is speaking

**Features:**
- Detect speech start
- Detect speech end
- Filter background noise
- Silence detection
- Configurable sensitivity

**API Endpoint:**
```
POST /api/v2/voice/vad
```

**Request:**
```json
{
  "audioUrl": "https://example.com/audio.mp3",
  "sensitivity": 0.5 // 0.0 (low) to 1.0 (high)
}
```

**Response:**
```json
{
  "speechDetected": true,
  "speechStart": 0.5, // seconds
  "speechEnd": 3.2, // seconds
  "confidence": 0.92,
  "backgroundNoise": 0.15 // 0.0 (silent) to 1.0 (loud)
}
```

---

### **5. Interrupt Handling**

**Purpose:** Handle user interruptions during agent responses

**Features:**
- Detect user speaking during TTS playback
- Stop TTS immediately
- Queue new STT request
- Resume conversation naturally

**Flow:**

```
1. Agent speaking (TTS playing)
2. User starts speaking (VAD detects)
3. Stop TTS playback immediately
4. Start STT recording
5. Process user input
6. Generate new response
7. Resume TTS playback
```

**API Endpoint:**
```
POST /api/v2/voice/interrupt
```

**Request:**
```json
{
  "sessionId": "sess_abc123",
  "action": "stop" // or "resume"
}
```

**Response:**
```json
{
  "success": true,
  "ttsStoppedAt": 1700000000000,
  "sttStartedAt": 1700000000100
}
```

---

## 🛠️ **TECH STACK**

### **Native STT/TTS (iOS/Android)**

**iOS:**
- `AVSpeechSynthesizer` (TTS)
- `SFSpeechRecognizer` (STT)
- Cost: FREE
- Quality: Good
- Latency: Low (on-device)

**Android:**
- `TextToSpeech` (TTS)
- `SpeechRecognizer` (STT)
- Cost: FREE
- Quality: Good
- Latency: Low (on-device)

**Implementation:**
```typescript
// iOS (React Native)
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

// STT
Voice.start('en-US');
Voice.onSpeechResults = (e) => {
  const transcript = e.value[0];
  console.log('User said:', transcript);
};

// TTS
Tts.speak('Hello, how can I help you?');
```

---

### **F5-TTS (Self-Hosted)**

**What is F5-TTS?**
- Open-source TTS model
- High-quality, natural voices
- Voice cloning support
- Self-hostable (cost-effective)

**Deployment:**
```bash
# Deploy to Cloudflare Workers AI
wrangler deploy --name f5-tts

# Or self-host on GPU server
docker run -p 8000:8000 f5-tts/server
```

**Cost:**
- Cloudflare Workers AI: $0.01/min
- Self-hosted GPU: $0.005/min (amortized)

**API:**
```bash
curl -X POST https://f5-tts.dartmouth-os.com/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how can I help you?",
    "voice": "default",
    "language": "en-US"
  }'
```

---

### **OpenAI Whisper (Fallback STT)**

**Why Whisper?**
- Excellent accuracy (99+ languages)
- Robust to accents, noise
- Fast API (<1s latency)
- Affordable ($0.006/min)

**API:**
```bash
curl -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "file=@audio.mp3" \
  -F "model=whisper-1" \
  -F "language=en"
```

---

### **ElevenLabs (Premium TTS)**

**Why ElevenLabs?**
- Human-like voices
- Voice cloning
- Emotional expression
- Multi-language support

**Cost:**
- $0.30/1K characters (~$0.30/min)
- Premium users only

**API:**
```bash
curl -X POST https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how can I help you?",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.5
    }
  }'
```

---

### **WebRTC (Audio Streaming)**

**Why WebRTC?**
- Real-time bidirectional audio
- Low latency (<100ms)
- Built-in echo cancellation
- Automatic gain control

**Implementation:**
```typescript
// Client (React Native)
import { RTCPeerConnection } from 'react-native-webrtc';

const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// Get user audio
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// Create offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// Send offer to server
fetch('https://api.dartmouth-os.com/api/v2/voice/stream', {
  method: 'POST',
  body: JSON.stringify({ offer })
});
```

---

## 💰 **COST ANALYSIS**

### **Cost Comparison (Per Minute)**

| Provider | Cost/Min | Quality | Latency | Use Case |
|----------|----------|---------|---------|----------|
| **Native (iOS/Android)** | $0.00 | Good | Low | Primary (90%) |
| **F5-TTS (Self-Hosted)** | $0.01 | Excellent | Medium | Backup (8%) |
| **OpenAI Whisper** | $0.006 | Excellent | Low | Fallback (2%) |
| **ElevenLabs** | $0.30 | Exceptional | Low | Premium (0.1%) |

### **Monthly Cost Projections**

**Scenario 1: 100 conversations/day (3 min avg)**
- Total minutes: 100 × 3 × 30 = 9,000 min/month
- Native (90%): 8,100 min × $0.00 = $0
- F5-TTS (8%): 720 min × $0.01 = $7.20
- Whisper (2%): 180 min × $0.006 = $1.08
- **Total: $8.28/month**

**Scenario 2: 1,000 conversations/day (3 min avg)**
- Total minutes: 1,000 × 3 × 30 = 90,000 min/month
- Native (90%): 81,000 min × $0.00 = $0
- F5-TTS (8%): 7,200 min × $0.01 = $72
- Whisper (2%): 1,800 min × $0.006 = $10.80
- **Total: $82.80/month**

**Scenario 3: 10,000 conversations/day (3 min avg)**
- Total minutes: 10,000 × 3 × 30 = 900,000 min/month
- Native (90%): 810,000 min × $0.00 = $0
- F5-TTS (8%): 72,000 min × $0.01 = $720
- Whisper (2%): 18,000 min × $0.006 = $108
- **Total: $828/month**

### **Cost Optimization Strategies**

1. **Native First** - Use free native STT/TTS whenever possible (90% of requests)
2. **F5-TTS Backup** - Use self-hosted F5-TTS for high-quality needs (8%)
3. **Whisper Fallback** - Use OpenAI Whisper only when native/F5 unavailable (2%)
4. **ElevenLabs Premium** - Use only for premium users (0.1%)
5. **Audio Caching** - Cache TTS audio for common phrases (50% hit rate)
6. **Voice Profiles** - Store user voice preferences to reduce API calls

---

## 📚 **IMPLEMENTATION GUIDE**

### **Step 1: Set Up Voice Gateway**

```typescript
// packages/dartmouth-core/src/services/VoiceService.ts

export class VoiceService {
  constructor(
    private config: VoiceConfig,
    private storage: R2Bucket,
    private cache: KVNamespace
  ) {}

  async transcribe(audio: ArrayBuffer, options: STTOptions): Promise<STTResult> {
    // 1. Check cache
    const cacheKey = `stt:${hash(audio)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2. Try native STT (if available)
    if (options.provider === 'native' || options.provider === 'auto') {
      // Native STT handled on client (iOS/Android)
      // This endpoint only called as fallback
    }

    // 3. Try F5-TTS
    if (options.provider === 'f5' || options.provider === 'auto') {
      try {
        const result = await this.f5STT(audio, options);
        await this.cache.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
        return result;
      } catch (error) {
        console.error('F5-TTS failed:', error);
      }
    }

    // 4. Fallback to Whisper
    const result = await this.whisperSTT(audio, options);
    await this.cache.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
    return result;
  }

  async synthesize(text: string, options: TTSOptions): Promise<TTSResult> {
    // 1. Check cache
    const cacheKey = `tts:${hash(text + options.voice)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2. Try native TTS (if available)
    if (options.provider === 'native' || options.provider === 'auto') {
      // Native TTS handled on client (iOS/Android)
      // This endpoint only called as fallback
    }

    // 3. Try F5-TTS
    if (options.provider === 'f5' || options.provider === 'auto') {
      try {
        const result = await this.f5TTS(text, options);
        await this.cache.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
        return result;
      } catch (error) {
        console.error('F5-TTS failed:', error);
      }
    }

    // 4. Premium: ElevenLabs
    if (options.provider === 'elevenlabs') {
      const result = await this.elevenLabsTTS(text, options);
      await this.cache.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
      return result;
    }

    throw new Error('No TTS provider available');
  }

  private async f5STT(audio: ArrayBuffer, options: STTOptions): Promise<STTResult> {
    // Call F5-TTS API
    const response = await fetch('https://f5-tts.dartmouth-os.com/transcribe', {
      method: 'POST',
      body: audio,
      headers: { 'Content-Type': 'audio/wav' }
    });
    return await response.json();
  }

  private async whisperSTT(audio: ArrayBuffer, options: STTOptions): Promise<STTResult> {
    // Call OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', new Blob([audio]), 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', options.language || 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.config.openaiApiKey}` },
      body: formData
    });

    const data = await response.json();
    return {
      transcript: data.text,
      confidence: 0.95,
      language: options.language || 'en',
      duration: 0,
      provider: 'whisper',
      cost: 0.006
    };
  }

  private async f5TTS(text: string, options: TTSOptions): Promise<TTSResult> {
    // Call F5-TTS API
    const response = await fetch('https://f5-tts.dartmouth-os.com/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: options.voice, language: options.language })
    });

    const audioBuffer = await response.arrayBuffer();
    
    // Upload to R2
    const audioKey = `audio/${Date.now()}.mp3`;
    await this.storage.put(audioKey, audioBuffer);
    const audioUrl = `https://r2.dartmouth-os.com/${audioKey}`;

    return {
      audioUrl,
      duration: 0,
      voice: options.voice,
      provider: 'f5',
      cost: 0.01,
      expiresAt: Date.now() + 3600000
    };
  }

  private async elevenLabsTTS(text: string, options: TTSOptions): Promise<TTSResult> {
    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${options.voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.config.elevenLabsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const audioBuffer = await response.arrayBuffer();
    
    // Upload to R2
    const audioKey = `audio/${Date.now()}.mp3`;
    await this.storage.put(audioKey, audioBuffer);
    const audioUrl = `https://r2.dartmouth-os.com/${audioKey}`;

    return {
      audioUrl,
      duration: 0,
      voice: options.voice,
      provider: 'elevenlabs',
      cost: 0.30,
      expiresAt: Date.now() + 3600000
    };
  }
}
```

---

### **Step 2: Implement Client (React Native)**

```typescript
// PA Agent: src/services/VoiceService.ts

import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { DartmouthClient } from '@dartmouth/client';

export class VoiceService {
  private dartmouth: DartmouthClient;
  private isListening = false;
  private isSpeaking = false;

  constructor() {
    this.dartmouth = new DartmouthClient({
      apiKey: process.env.DARTMOUTH_API_KEY,
      agentId: 'mccarthy-pa'
    });

    // Configure native TTS
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);

    // Configure native STT
    Voice.onSpeechResults = this.handleSpeechResults.bind(this);
    Voice.onSpeechEnd = this.handleSpeechEnd.bind(this);
  }

  async startListening() {
    if (this.isListening) return;
    
    try {
      // Use native STT (free)
      await Voice.start('en-US');
      this.isListening = true;
    } catch (error) {
      console.error('Native STT failed:', error);
      // Fallback to Dartmouth STT
      // (record audio and send to API)
    }
  }

  async stopListening() {
    if (!this.isListening) return;
    
    await Voice.stop();
    this.isListening = false;
  }

  async speak(text: string) {
    if (this.isSpeaking) {
      await Tts.stop();
    }

    try {
      // Use native TTS (free)
      await Tts.speak(text);
      this.isSpeaking = true;
    } catch (error) {
      console.error('Native TTS failed:', error);
      // Fallback to Dartmouth TTS
      const result = await this.dartmouth.voice.synthesize({
        text,
        voice: 'alloy',
        provider: 'f5'
      });
      // Play audio from URL
      await this.playAudio(result.audioUrl);
    }
  }

  async stopSpeaking() {
    if (!this.isSpeaking) return;
    
    await Tts.stop();
    this.isSpeaking = false;
  }

  private handleSpeechResults(event: any) {
    const transcript = event.value[0];
    console.log('User said:', transcript);
    // Send to agent for processing
    this.processUserInput(transcript);
  }

  private handleSpeechEnd() {
    this.isListening = false;
  }

  private async processUserInput(transcript: string) {
    // Send to Dartmouth for processing
    const response = await this.dartmouth.chat({
      message: transcript,
      sessionId: this.sessionId
    });

    // Speak response
    await this.speak(response.content);
  }

  private async playAudio(url: string) {
    // Use React Native Sound or Expo AV
    // to play audio from URL
  }
}
```

---

## 📚 **API REFERENCE**

**Full API documentation:**
- [DARTMOUTH_API_V2_DOCUMENTATION.md](./DARTMOUTH_API_V2_DOCUMENTATION.md) - Section 14-18 (Voice Services)

**Quick Links:**
- `POST /api/v2/voice/stt` - Speech-to-Text
- `POST /api/v2/voice/tts` - Text-to-Speech
- `WS /api/v2/voice/stream` - Audio Streaming
- `POST /api/v2/voice/vad` - Voice Activity Detection
- `POST /api/v2/voice/interrupt` - Interrupt Handling

---

## ✅ **BEST PRACTICES**

### **1. Use Native First**
- Always try native STT/TTS first (free, fast, good quality)
- Fallback to Dartmouth only when native unavailable

### **2. Cache Aggressively**
- Cache TTS audio for common phrases (50% hit rate)
- Cache STT results for duplicate audio
- Use Cloudflare KV for edge caching

### **3. Handle Interruptions**
- Detect user speech during TTS playback
- Stop TTS immediately
- Start STT recording
- Resume conversation naturally

### **4. Optimize Audio Quality**
- Use appropriate sample rate (16kHz for STT, 44.1kHz for TTS)
- Compress audio (Opus codec for streaming)
- Filter background noise (VAD)

### **5. Monitor Costs**
- Track STT/TTS usage per user
- Alert on cost spikes
- Enforce rate limits for abuse prevention

### **6. Test Thoroughly**
- Test on real devices (iOS/Android)
- Test with different accents, languages
- Test in noisy environments
- Test interrupt handling

---

## 📞 **SUPPORT**

- **Documentation:** [docs/dartmouth-os/v2/](.)
- **API Reference:** [DARTMOUTH_API_V2_DOCUMENTATION.md](./DARTMOUTH_API_V2_DOCUMENTATION.md)
- **Voice Implementation:** [MCCARTHY_PA_VOICE_IMPLEMENTATION.md](../agents/mccarthy-pa/v8/MCCARTHY_PA_VOICE_IMPLEMENTATION.md)

---

**STATUS: READY TO BUILD** 🚀

All voice services specifications complete. Ready for implementation.

