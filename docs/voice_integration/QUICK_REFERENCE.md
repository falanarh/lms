# 🚀 Quick Reference Guide - Voice WebSocket Integration

## 📦 Files to Create

```
src/
├── types/
│   └── voice.ts                    # Type definitions
├── lib/
│   └── tutor-ai/
│       ├── audioRecorder.ts        # Audio recording utility
│       └── voiceWebSocket.ts       # WebSocket manager
├── hooks/
│   └── useVoiceChat.ts             # React hook
└── components/
    └── tutor-ai/
        └── TalkingMode.tsx         # Update this file
```

---

## 🔌 WebSocket Protocol Cheat Sheet

### Client Messages

```typescript
// 1. Initialize session
{
  action: "init",
  thread_id: "your-thread-id",
  audio_format: "wav"
}

// 2. Send audio
{
  action: "audio",
  data: "base64-encoded-audio-data"
}

// 3. Heartbeat
{
  action: "ping"
}
```

### Server Events

```typescript
// Events you'll receive (in order):
1. { event: "initialized", thread_id: "...", kb_id: "..." }
2. { event: "stt_start" }
3. { event: "stt_complete", text: "transcribed text" }
4. { event: "rag_start" }
5. { event: "rag_token", token: "..." }  // Multiple times
6. { event: "rag_complete", text: "full response" }
7. { event: "tts_start" }
8. { event: "tts_complete", audio: "base64", format: "wav" }
9. { event: "done", duration: 5.23 }

// Error event (can happen anytime):
{ event: "error", message: "error description" }

// Heartbeat response:
{ event: "pong" }
```

---

## 🎤 Audio Format Requirements

| Property | Value |
|----------|-------|
| **Format** | WAV |
| **Encoding** | Base64 string |
| **Sample Rate** | 16000 Hz |
| **Channels** | Mono (1) |
| **Bit Depth** | 16-bit PCM |

---

## 💻 Code Snippets

### Quick WebSocket Test

```javascript
// Test in browser console
const ws = new WebSocket('ws://localhost:8000/api/ws/voice');
ws.onopen = () => {
  console.log('✅ Connected');
  ws.send(JSON.stringify({ 
    action: 'init', 
    thread_id: 'test-123', 
    audio_format: 'wav' 
  }));
};
ws.onmessage = (e) => console.log('📥', JSON.parse(e.data));
ws.onerror = (e) => console.error('❌', e);
```

### Record Audio

```javascript
// Request microphone and record
const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: { sampleRate: 16000, channelCount: 1 } 
});
const recorder = new MediaRecorder(stream);
const chunks = [];

recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/wav' });
  // Convert to base64 and send
};

recorder.start();
// ... speak ...
recorder.stop();
```

### Convert Blob to Base64

```javascript
function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}
```

### Play Audio from Base64

```javascript
function playBase64Audio(base64, format) {
  const byteCharacters = atob(base64);
  const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { 
    type: format === 'wav' ? 'audio/wav' : 'audio/mpeg' 
  });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
}
```

---

## 🎯 Usage Example

```typescript
import { useVoiceChat } from '@/hooks/useVoiceChat';

function MyComponent() {
  const {
    state,
    isRecording,
    transcribedText,
    aiResponse,
    startRecording,
    stopRecording,
  } = useVoiceChat({
    wsUrl: process.env.NEXT_PUBLIC_WS_URL!,
    threadId: 'my-session-id',
    autoConnect: true,
  });

  return (
    <div>
      <p>Status: {state}</p>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop' : 'Start'}
      </button>
      {transcribedText && <p>You: {transcribedText}</p>}
      {aiResponse && <p>AI: {aiResponse}</p>}
    </div>
  );
}
```

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `WebSocket connection failed` | Check backend is running: `curl http://localhost:8000/health` |
| `NotAllowedError: Permission denied` | Request mic in HTTPS or localhost context |
| `Invalid audio format` | Ensure audio is WAV format, base64-encoded |
| `Session not initialized` | Send init message before audio message |
| `TypeError: Cannot read property 'send'` | Check WebSocket is connected before sending |

---

## 🔍 Debugging Commands

```bash
# Test backend health
curl http://localhost:8000/health

# Test WebSocket with wscat
wscat -c ws://localhost:8000/api/ws/voice

# Send init message
> {"action":"init","thread_id":"test","audio_format":"wav"}

# Check browser WebSocket frames
# Open DevTools → Network → WS tab
```

---

## ⚙️ Environment Setup

```bash
# .env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/ws/voice
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEBUG_MODE=true
```

---

## 📊 State Flow Diagram

```
idle → connecting → connected → ready
                                  ↓
                            recording
                                  ↓
                            processing
                                  ↓
                            speaking
                                  ↓
                            ready (loop)
```

---

## 🎨 TalkingMode Integration (Minimal)

```typescript
// In TalkingMode.tsx
import { useVoiceChat } from '@/hooks/useVoiceChat';

export default function TalkingMode({ threadId, onClose, theme }: Props) {
  const {
    state,
    isRecording,
    transcribedText,
    aiResponse,
    startRecording,
    stopRecording,
  } = useVoiceChat({
    wsUrl: process.env.NEXT_PUBLIC_WS_URL!,
    threadId,
    autoConnect: true,
  });

  const handleMicClick = () => {
    isRecording ? stopRecording() : startRecording();
  };

  return (
    <div>
      {/* Your existing UI */}
      <button onClick={handleMicClick}>
        {isRecording ? 'Stop' : 'Start'}
      </button>
      <p>{state}</p>
      {transcribedText && <p>You: {transcribedText}</p>}
      {aiResponse && <p>AI: {aiResponse}</p>}
    </div>
  );
}
```

---

## 🧪 Quick Test Checklist

```
1. ✓ Backend running (curl http://localhost:8000/health)
2. ✓ Frontend running (npm run dev)
3. ✓ WebSocket URL correct (.env.local)
4. ✓ Microphone permission granted
5. ✓ Click mic button → recording starts
6. ✓ Speak 3-5 seconds
7. ✓ Click mic button → recording stops
8. ✓ Transcription appears
9. ✓ AI response appears
10. ✓ Audio plays automatically
```

---

## 📚 Key Files to Reference

1. **Backend Protocol**: `app/api/websocket_routes.py`
2. **Test Client**: `test_websocket_voice.html`
3. **Main Guide**: `WEBSOCKET_VOICE_INTEGRATION_GUIDE.md`
4. **Checklist**: `IMPLEMENTATION_CHECKLIST.md`

---

## 🎯 One-Liner Commands

```bash
# Start backend (if Python/FastAPI)
uvicorn app.main:app --reload --port 8000

# Start frontend
npm run dev

# Test WebSocket
wscat -c ws://localhost:8000/api/ws/voice

# Build for production
npm run build

# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_WS_URL)"
```

---

## 💡 Pro Tips

1. **Always log events** - Use `console.log` to track WebSocket events
2. **Test backend first** - Verify WebSocket works before frontend integration
3. **Handle all states** - idle, connecting, recording, processing, speaking, error
4. **Provide visual feedback** - Show status to user at all times
5. **Test on real devices** - Mobile behavior can differ
6. **Use TypeScript strictly** - Prevent type-related bugs
7. **Read error messages** - They usually tell you what's wrong
8. **Monitor network tab** - See actual WebSocket frames sent/received

---

## 🚨 Before Deployment

- [ ] Change `ws://` to `wss://` in production
- [ ] Update NEXT_PUBLIC_WS_URL to production URL
- [ ] Test on production-like environment
- [ ] Enable error tracking (Sentry, etc.)
- [ ] Add rate limiting
- [ ] Test auto-reconnection
- [ ] Verify HTTPS and WSS work together
- [ ] Load test with multiple users
- [ ] Check browser compatibility
- [ ] Test on mobile devices

---

**Last Updated**: November 26, 2025  
**Version**: 1.0.0

---

For detailed documentation, see `WEBSOCKET_VOICE_INTEGRATION_GUIDE.md`
