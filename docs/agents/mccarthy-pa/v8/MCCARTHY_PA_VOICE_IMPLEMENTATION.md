# McCarthy PA Agent - Voice Implementation Guide

**Document Version:** 1.0  
**Date:** November 19, 2024  
**Purpose:** Complete guide for implementing voice features (STT, TTS, streaming)

---

## 📋 Table of Contents

1. [Voice Architecture Overview](#voice-architecture-overview)
2. [Speech-to-Text (STT)](#speech-to-text-stt)
3. [Text-to-Speech (TTS)](#text-to-speech-tts)
4. [F5-TTS Integration](#f5-tts-integration)
5. [Audio Streaming](#audio-streaming)
6. [Voice Activity Detection (VAD)](#voice-activity-detection-vad)
7. [Interrupt Handling](#interrupt-handling)
8. [Offline Mode](#offline-mode)
9. [Testing Voice Features](#testing-voice-features)
10. [Troubleshooting](#troubleshooting)

---

## 🎤 Voice Architecture Overview

### **Voice Flow**

```
USER SPEAKS
    │
    ▼
┌─────────────────────────────────────┐
│  React Native App                   │
│  - Capture audio (microphone)       │
│  - VAD (detect speech)              │
│  - Stream to Dartmouth OS           │
└─────────────────┬───────────────────┘
                  │ WebSocket/WebRTC
                  ▼
┌─────────────────────────────────────┐
│  Dartmouth OS - Voice Services      │
│  - STT (Deepgram/Whisper/Native)    │
│  - Audio Analysis (emotion)         │
│  - Intent Detection                 │
│  - Handler Execution                │
│  - TTS (F5-TTS/OpenAI/Native)       │
│  - Stream audio back                │
└─────────────────┬───────────────────┘
                  │ WebSocket/WebRTC
                  ▼
┌─────────────────────────────────────┐
│  React Native App                   │
│  - Play audio (speaker)             │
│  - Show transcript                  │
│  - Handle interrupts                │
└─────────────────────────────────────┘
    │
    ▼
USER HEARS RESPONSE
```

### **Voice Providers**

| Provider | Type | Cost | Quality | Latency | Use Case |
|----------|------|------|---------|---------|----------|
| **Deepgram** | STT | $0.0043/min | ⭐⭐⭐⭐⭐ | 300ms | Primary STT |
| **OpenAI Whisper** | STT | $0.006/min | ⭐⭐⭐⭐ | 1-2s | Fallback STT |
| **Native (iOS/Android)** | STT | Free | ⭐⭐⭐ | 500ms | Offline STT |
| **F5-TTS** | TTS | $0.001/min | ⭐⭐⭐⭐⭐ | 500ms | Primary TTS |
| **OpenAI TTS** | TTS | $0.015/min | ⭐⭐⭐⭐ | 800ms | Fallback TTS |
| **Native (iOS/Android)** | TTS | Free | ⭐⭐⭐ | 300ms | Offline TTS |

---

## 🎙️ Speech-to-Text (STT)

### **1. Deepgram (Primary)**

**Why Deepgram?**
- ✅ Real-time streaming (300ms latency)
- ✅ High accuracy (95%+)
- ✅ Supports 30+ languages
- ✅ Punctuation & formatting
- ✅ Cost-effective ($0.0043/min)

#### **Backend Implementation (Cloudflare Workers)**

```typescript
// packages/worker/src/services/VoiceService.ts
import { Deepgram } from '@deepgram/sdk';

export class VoiceService {
  private deepgram: Deepgram;

  constructor(apiKey: string) {
    this.deepgram = new Deepgram(apiKey);
  }

  async transcribeStream(audioStream: ReadableStream): Promise<string> {
    const source = {
      stream: audioStream,
      mimetype: 'audio/webm',
    };

    const response = await this.deepgram.transcription.live({
      punctuate: true,
      language: 'en-US',
      model: 'nova-2',
      smart_format: true,
    });

    let transcript = '';

    response.addListener('transcriptReceived', (transcription) => {
      const text = transcription.channel.alternatives[0].transcript;
      if (text) {
        transcript += text + ' ';
      }
    });

    return transcript.trim();
  }

  async transcribeFile(audioBuffer: ArrayBuffer): Promise<string> {
    const source = {
      buffer: audioBuffer,
      mimetype: 'audio/webm',
    };

    const response = await this.deepgram.transcription.preRecorded(source, {
      punctuate: true,
      language: 'en-US',
      model: 'nova-2',
      smart_format: true,
    });

    return response.results.channels[0].alternatives[0].transcript;
  }
}
```

#### **Frontend Implementation (React Native)**

```typescript
// packages/mccarthy-pa/src/services/VoiceInputService.ts
import Voice from '@react-native-voice/voice';
import { io, Socket } from 'socket.io-client';

export class VoiceInputService {
  private socket: Socket;
  private isRecording = false;

  constructor(accessToken: string) {
    this.socket = io('wss://api.dartmouth-os.com', {
      auth: { token: accessToken },
    });
  }

  async startRecording(onTranscript: (text: string) => void) {
    this.isRecording = true;

    // Listen for transcripts from server
    this.socket.on('transcript', (data) => {
      onTranscript(data.text);
    });

    // Start capturing audio
    await Voice.start('en-US');

    // Stream audio chunks to server
    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value.length > 0) {
        this.socket.emit('audio-chunk', { audio: e.value[0] });
      }
    };

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        this.socket.emit('audio-final', { audio: e.value[0] });
      }
    };
  }

  async stopRecording() {
    this.isRecording = false;
    await Voice.stop();
    this.socket.emit('audio-end');
  }
}
```

### **2. OpenAI Whisper (Fallback)**

```typescript
// packages/worker/src/services/VoiceService.ts
import OpenAI from 'openai';

export class VoiceService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async transcribeWithWhisper(audioBuffer: ArrayBuffer): Promise<string> {
    const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const response = await this.openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
    });

    return response.text;
  }
}
```

### **3. Native (Offline Mode)**

```typescript
// packages/mccarthy-pa/src/services/NativeVoiceService.ts
import Voice from '@react-native-voice/voice';

export class NativeVoiceService {
  async transcribe(onResult: (text: string) => void) {
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        onResult(e.value[0]);
      }
    };

    await Voice.start('en-US');
  }

  async stop() {
    await Voice.stop();
  }
}
```

---

## 🔊 Text-to-Speech (TTS)

### **1. F5-TTS (Primary)**

**Why F5-TTS?**
- ✅ Open-source (no vendor lock-in)
- ✅ Self-hostable (control costs)
- ✅ High quality (natural, emotional voice)
- ✅ Fast (500ms latency)
- ✅ Cost-effective ($0.001/min vs $0.015/min for OpenAI)

See [F5-TTS Integration](#f5-tts-integration) section below for full implementation.

### **2. OpenAI TTS (Fallback)**

```typescript
// packages/worker/src/services/VoiceService.ts
import OpenAI from 'openai';

export class VoiceService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async textToSpeech(text: string): Promise<ArrayBuffer> {
    const response = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
      speed: 1.0,
    });

    return response.arrayBuffer();
  }
}
```

#### **Frontend Implementation**

```typescript
// packages/mccarthy-pa/src/services/VoiceOutputService.ts
import Tts from 'react-native-tts';
import Sound from 'react-native-sound';

export class VoiceOutputService {
  async speak(text: string, audioUrl?: string) {
    if (audioUrl) {
      // Play audio from URL (Dartmouth TTS)
      const sound = new Sound(audioUrl, '', (error) => {
        if (error) {
          console.error('Failed to load sound', error);
          return;
        }
        sound.play();
      });
    } else {
      // Use native TTS (offline mode)
      await Tts.speak(text);
    }
  }

  async stop() {
    await Tts.stop();
  }
}
```

### **3. Native (Offline Mode)**

```typescript
// packages/mccarthy-pa/src/services/NativeVoiceService.ts
import Tts from 'react-native-tts';

export class NativeVoiceService {
  async speak(text: string) {
    await Tts.setDefaultLanguage('en-US');
    await Tts.setDefaultRate(0.5);
    await Tts.speak(text);
  }

  async stop() {
    await Tts.stop();
  }
}
```

---

## 🎵 F5-TTS Integration

### **What is F5-TTS?**

F5-TTS is an open-source, self-hostable TTS model that produces high-quality, natural-sounding speech.

**Links:**
- Homepage: https://swivid.github.io/F5-TTS/
- GitHub: https://github.com/SWivid/F5-TTS
- Demo: https://huggingface.co/spaces/mrfakename/E2-F5-TTS

### **Deployment Options**

#### **Option 1: Cloudflare Workers AI (Easiest)**

```typescript
// packages/worker/src/services/F5TTSService.ts
export class F5TTSService {
  async textToSpeech(text: string, env: Env): Promise<ArrayBuffer> {
    // Use Cloudflare Workers AI to run F5-TTS
    const response = await env.AI.run('@cf/swivid/f5-tts', {
      text,
      voice: 'default',
    });

    return response.audio;
  }
}
```

**Pros:**
- ✅ No infrastructure management
- ✅ Auto-scaling
- ✅ Pay-per-use

**Cons:**
- ⚠️ Depends on Cloudflare Workers AI availability

#### **Option 2: Self-Hosted (Cheapest for High Volume)**

**Step 1: Set up GPU server**

```bash
# Hetzner GPU instance (RTX 3060, $50/month)
# or AWS EC2 g4dn.xlarge ($0.526/hour = ~$380/month)

# Install dependencies
apt-get update
apt-get install -y python3 python3-pip git ffmpeg

# Clone F5-TTS
git clone https://github.com/SWivid/F5-TTS.git
cd F5-TTS

# Install Python dependencies
pip3 install -r requirements.txt

# Download model weights
python3 scripts/download_models.py
```

**Step 2: Create API server**

```python
# server.py
from flask import Flask, request, send_file
from f5_tts import F5TTS
import io

app = Flask(__name__)
model = F5TTS.from_pretrained("F5-TTS")

@app.route('/tts', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data['text']
    voice = data.get('voice', 'default')
    
    # Generate audio
    audio = model.generate(text, voice=voice)
    
    # Return audio file
    audio_io = io.BytesIO()
    audio.save(audio_io, format='WAV')
    audio_io.seek(0)
    
    return send_file(audio_io, mimetype='audio/wav')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**Step 3: Run server**

```bash
python3 server.py
```

**Step 4: Integrate with Dartmouth OS**

```typescript
// packages/worker/src/services/F5TTSService.ts
export class F5TTSService {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint; // e.g., 'https://f5-tts.example.com'
  }

  async textToSpeech(text: string): Promise<ArrayBuffer> {
    const response = await fetch(`${this.endpoint}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'default' }),
    });

    return response.arrayBuffer();
  }
}
```

**Pros:**
- ✅ Unlimited TTS generations (fixed $50/month)
- ✅ Full control
- ✅ No vendor lock-in

**Cons:**
- ⚠️ Requires infrastructure management
- ⚠️ Need to handle scaling

#### **Option 3: Hybrid (Recommended for MVP)**

```typescript
// packages/worker/src/services/VoiceService.ts
export class VoiceService {
  async textToSpeech(text: string, env: Env): Promise<ArrayBuffer> {
    try {
      // Try F5-TTS (self-hosted) first
      if (env.F5_TTS_ENDPOINT) {
        return await this.f5tts.textToSpeech(text);
      }
    } catch (error) {
      console.warn('F5-TTS failed, falling back to OpenAI', error);
    }

    // Fallback to OpenAI TTS
    return await this.openai.textToSpeech(text);
  }
}
```

**Strategy:**
1. **MVP:** Use OpenAI TTS ($0.015/min)
2. **When volume > 1000 mins/month:** Deploy self-hosted F5-TTS
3. **Cost break-even:** 3,333 mins/month ($50 self-hosted vs $50 OpenAI)

---

## 📡 Audio Streaming

### **WebSocket Implementation**

#### **Backend (Cloudflare Workers)**

```typescript
// packages/worker/src/routes/voice.ts
export async function handleVoiceStream(request: Request, env: Env): Promise<Response> {
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  server.addEventListener('message', async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'audio-chunk') {
      // Process audio chunk (STT)
      const transcript = await voiceService.transcribe(data.audio);
      server.send(JSON.stringify({ type: 'transcript', text: transcript }));

      // If final chunk, generate response
      if (data.final) {
        const response = await agent.chat(transcript);
        const audio = await voiceService.textToSpeech(response);
        server.send(JSON.stringify({ type: 'audio-response', audio }));
      }
    }
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
```

#### **Frontend (React Native)**

```typescript
// packages/mccarthy-pa/src/services/VoiceStreamService.ts
import { io, Socket } from 'socket.io-client';

export class VoiceStreamService {
  private socket: Socket;

  constructor(accessToken: string) {
    this.socket = io('wss://api.dartmouth-os.com', {
      auth: { token: accessToken },
    });
  }

  async startStream(
    onTranscript: (text: string) => void,
    onAudioResponse: (audio: ArrayBuffer) => void
  ) {
    // Listen for transcripts
    this.socket.on('transcript', (data) => {
      onTranscript(data.text);
    });

    // Listen for audio responses
    this.socket.on('audio-response', (data) => {
      onAudioResponse(data.audio);
    });

    // Start capturing audio
    // (use react-native-voice or react-native-audio-record)
  }

  sendAudioChunk(audioChunk: ArrayBuffer, final: boolean = false) {
    this.socket.emit('audio-chunk', { audio: audioChunk, final });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
```

---

## 🎚️ Voice Activity Detection (VAD)

### **Silero VAD (Recommended)**

```typescript
// packages/mccarthy-pa/src/services/VADService.ts
import { SileroVAD } from '@ricky0123/vad-react-native';

export class VADService {
  private vad: SileroVAD;

  async initialize() {
    this.vad = await SileroVAD.new();
  }

  async detectSpeech(audioBuffer: Float32Array): Promise<boolean> {
    const probability = await this.vad.predict(audioBuffer);
    return probability > 0.5; // 50% threshold
  }

  async detectSpeechStart(
    audioStream: ReadableStream,
    onSpeechStart: () => void,
    onSpeechEnd: () => void
  ) {
    let isSpeaking = false;
    let silenceFrames = 0;
    const SILENCE_THRESHOLD = 10; // 10 frames of silence = speech end

    for await (const chunk of audioStream) {
      const isSpeech = await this.detectSpeech(chunk);

      if (isSpeech) {
        if (!isSpeaking) {
          isSpeaking = true;
          onSpeechStart();
        }
        silenceFrames = 0;
      } else {
        if (isSpeaking) {
          silenceFrames++;
          if (silenceFrames >= SILENCE_THRESHOLD) {
            isSpeaking = false;
            onSpeechEnd();
          }
        }
      }
    }
  }
}
```

---

## ⏸️ Interrupt Handling

### **Allow User to Interrupt PA**

```typescript
// packages/mccarthy-pa/src/services/VoiceInterruptService.ts
export class VoiceInterruptService {
  private isPlaying = false;
  private currentAudio: Sound | null = null;

  async playResponse(audioUrl: string, onInterrupt: () => void) {
    this.isPlaying = true;

    this.currentAudio = new Sound(audioUrl, '', (error) => {
      if (error) {
        console.error('Failed to load sound', error);
        return;
      }

      // Listen for user speech while playing
      Voice.onSpeechStart = () => {
        if (this.isPlaying) {
          this.interrupt();
          onInterrupt();
        }
      };

      this.currentAudio.play((success) => {
        this.isPlaying = false;
      });
    });
  }

  interrupt() {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.stop();
      this.isPlaying = false;
    }
  }
}
```

---

## 📴 Offline Mode

### **Native Voice (No Internet)**

```typescript
// packages/mccarthy-pa/src/services/OfflineVoiceService.ts
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import NetInfo from '@react-native-community/netinfo';

export class OfflineVoiceService {
  async handleVoiceCommand(onResult: (text: string) => void) {
    // Check internet connection
    const netInfo = await NetInfo.fetch();

    if (netInfo.isConnected) {
      // Use Dartmouth Voice Services
      // (see VoiceInputService above)
    } else {
      // Use native voice (offline)
      Voice.onSpeechResults = async (e) => {
        if (e.value && e.value.length > 0) {
          const transcript = e.value[0];
          onResult(transcript);

          // Process locally (limited functionality)
          const response = await this.processOffline(transcript);

          // Speak response
          await Tts.speak(response);
        }
      };

      await Voice.start('en-US');
    }
  }

  async processOffline(transcript: string): Promise<string> {
    // Basic offline processing (no LLM)
    if (transcript.includes('time')) {
      return `The time is ${new Date().toLocaleTimeString()}`;
    }
    if (transcript.includes('date')) {
      return `Today is ${new Date().toLocaleDateString()}`;
    }
    return "I'm offline right now. Please connect to the internet for full functionality.";
  }
}
```

---

## 🧪 Testing Voice Features

### **Unit Tests**

```typescript
// packages/worker/src/services/__tests__/VoiceService.test.ts
import { VoiceService } from '../VoiceService';
import { mockEnv } from '../../test-utils';

describe('VoiceService', () => {
  let service: VoiceService;
  let env: Env;

  beforeEach(() => {
    env = mockEnv();
    service = new VoiceService(env.DEEPGRAM_API_KEY, env.OPENAI_API_KEY);
  });

  test('transcribe - success', async () => {
    const audioBuffer = new ArrayBuffer(1024); // Mock audio
    const transcript = await service.transcribe(audioBuffer);
    expect(transcript).toBeDefined();
    expect(typeof transcript).toBe('string');
  });

  test('textToSpeech - success', async () => {
    const text = 'Hello, world!';
    const audio = await service.textToSpeech(text, env);
    expect(audio).toBeDefined();
    expect(audio.byteLength).toBeGreaterThan(0);
  });
});
```

### **Integration Tests**

```typescript
// packages/worker/src/__tests__/integration/voice.test.ts
import { testClient } from '../../test-utils';
import * as fs from 'fs';

describe('Voice API', () => {
  test('Transcribe audio file', async () => {
    const audioFile = fs.readFileSync('./test-audio.webm');
    const response = await testClient.post(
      '/api/v2/voice/transcribe',
      audioFile,
      {
        headers: {
          'Content-Type': 'audio/webm',
          Authorization: 'Bearer test-token',
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.transcript).toBeDefined();
  });

  test('Generate speech', async () => {
    const response = await testClient.post(
      '/api/v2/voice/tts',
      { text: 'Hello, world!' },
      { headers: { Authorization: 'Bearer test-token' } }
    );

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('audio/wav');
  });
});
```

### **E2E Tests (React Native)**

```typescript
// packages/mccarthy-pa/e2e/voice.e2e.ts
import { device, element, by, expect as detoxExpect } from 'detox';

describe('Voice', () => {
  test('Voice command - create task', async () => {
    await element(by.id('voice-button')).tap();
    // Simulate voice input (requires device/emulator with audio)
    await device.sendUserActivity({ type: 'voice', text: 'Create a task called Test' });
    await detoxExpect(element(by.text('Test'))).toBeVisible();
  });
});
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. "Microphone permission denied"**

**Solution:**
```typescript
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const checkMicrophonePermission = async () => {
  const result = await check(PERMISSIONS.IOS.MICROPHONE);
  if (result !== RESULTS.GRANTED) {
    const requestResult = await request(PERMISSIONS.IOS.MICROPHONE);
    if (requestResult !== RESULTS.GRANTED) {
      Alert.alert('Permission Required', 'Please enable microphone access in Settings');
    }
  }
};
```

#### **2. "Deepgram API error"**

**Solution:**
```typescript
// Check API key
console.log('Deepgram API key:', env.DEEPGRAM_API_KEY?.substring(0, 10) + '...');

// Add error handling
try {
  const transcript = await voiceService.transcribe(audio);
} catch (error) {
  console.error('Deepgram error:', error);
  // Fallback to Whisper
  const transcript = await voiceService.transcribeWithWhisper(audio);
}
```

#### **3. "Audio not playing"**

**Solution:**
```typescript
// Check audio format
console.log('Audio format:', response.headers['content-type']);

// Try different audio formats
const audio = new Sound(audioUrl, '', (error) => {
  if (error) {
    console.error('Failed to load sound', error);
    // Try fallback format
    const audioMp3 = audioUrl.replace('.wav', '.mp3');
    const sound = new Sound(audioMp3, '', () => sound.play());
  }
});
```

---

## 📚 Additional Resources

- [Deepgram Docs](https://developers.deepgram.com/)
- [OpenAI Audio API](https://platform.openai.com/docs/guides/speech-to-text)
- [F5-TTS GitHub](https://github.com/SWivid/F5-TTS)
- [React Native Voice](https://github.com/react-native-voice/voice)
- [React Native TTS](https://github.com/ak1394/react-native-tts)
- [Silero VAD](https://github.com/snakers4/silero-vad)

---

**Voice implementation complete! 🎤🔊**

