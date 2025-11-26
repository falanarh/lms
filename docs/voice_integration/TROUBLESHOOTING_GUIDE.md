# 🔧 Troubleshooting Guide - Voice WebSocket Integration

## 📖 Table of Contents

1. [Connection Issues](#connection-issues)
2. [Audio Recording Problems](#audio-recording-problems)
3. [Audio Playback Issues](#audio-playback-issues)
4. [WebSocket Communication Errors](#websocket-communication-errors)
5. [Performance Issues](#performance-issues)
6. [Browser Compatibility](#browser-compatibility)
7. [Mobile-Specific Issues](#mobile-specific-issues)
8. [Backend Integration Issues](#backend-integration-issues)
9. [Debugging Tools & Techniques](#debugging-tools--techniques)
10. [Common Error Messages](#common-error-messages)

---

## 1. Connection Issues

### ❌ Problem: WebSocket Connection Refused

**Symptoms:**
- Error: `WebSocket connection to 'ws://localhost:8000/api/ws/voice' failed`
- State stuck on "connecting"
- Console shows network error

**Solutions:**

1. **Check Backend is Running**
   ```bash
   # Test HTTP endpoint
   curl http://localhost:8000/health
   
   # Should return: {"status": "healthy"}
   ```

2. **Verify WebSocket URL**
   ```javascript
   // In browser console
   console.log(process.env.NEXT_PUBLIC_WS_URL);
   
   // Should be: ws://localhost:8000/api/ws/voice
   ```

3. **Check Port Availability**
   ```bash
   # Linux/Mac
   lsof -i :8000
   
   # Windows
   netstat -ano | findstr :8000
   ```

4. **Test WebSocket Directly**
   ```bash
   # Install wscat
   npm install -g wscat
   
   # Test connection
   wscat -c ws://localhost:8000/api/ws/voice
   
   # Should connect successfully
   ```

5. **Check Firewall/Network**
   - Disable firewall temporarily
   - Try on different network
   - Check VPN/proxy settings

### ❌ Problem: CORS Error

**Symptoms:**
- Console error about CORS policy
- Cross-origin request blocked
- Access-Control-Allow-Origin missing

**Solutions:**

1. **Update Backend CORS Settings**
   ```python
   # app/main.py
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # In dev - allow all
       # allow_origins=["https://yourdomain.com"],  # In production
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Use Correct Protocol**
   - Development: `ws://` with `http://`
   - Production: `wss://` with `https://`

### ❌ Problem: Connection Drops Frequently

**Symptoms:**
- WebSocket disconnects randomly
- State changes from "ready" to "idle"
- Need to reconnect often

**Solutions:**

1. **Implement Heartbeat**
   ```typescript
   // Already implemented in VoiceWebSocket class
   // Sends ping every 30 seconds
   ```

2. **Check Network Stability**
   ```bash
   # Test connection stability
   ping localhost
   ```

3. **Increase Backend Timeout**
   ```python
   # backend/app/core/config.py
   WS_TIMEOUT = 300  # 5 minutes
   ```

4. **Enable Auto-Reconnect**
   ```typescript
   // In useVoiceChat config
   autoReconnect: true,
   maxReconnectAttempts: 5
   ```

---

## 2. Audio Recording Problems

### ❌ Problem: Microphone Permission Denied

**Symptoms:**
- Error: `NotAllowedError: Permission denied`
- Recording doesn't start
- No audio captured

**Solutions:**

1. **Use HTTPS or Localhost**
   - Microphone requires secure context
   - Development: Use `localhost` (secure context)
   - Production: Must use HTTPS

2. **Request Permission Properly**
   ```javascript
   try {
     const stream = await navigator.mediaDevices.getUserMedia({ 
       audio: true 
     });
     // Permission granted
   } catch (error) {
     if (error.name === 'NotAllowedError') {
       alert('Please allow microphone access');
     }
   }
   ```

3. **Check Browser Settings**
   - Chrome: `chrome://settings/content/microphone`
   - Firefox: Settings → Privacy & Security → Permissions → Microphone
   - Safari: Preferences → Websites → Microphone

4. **Reset Permissions**
   ```javascript
   // Check current permission status
   navigator.permissions.query({ name: 'microphone' })
     .then(result => {
       console.log('Microphone permission:', result.state);
     });
   ```

### ❌ Problem: No Audio Recorded / Empty Blob

**Symptoms:**
- Recording starts but blob is empty
- Audio size is 0 bytes
- No sound in recording

**Solutions:**

1. **Check Microphone is Working**
   ```bash
   # Test microphone in browser
   # Go to: https://www.onlinemictest.com/
   ```

2. **Verify MediaRecorder Format**
   ```javascript
   // Check supported MIME types
   const types = [
     'audio/webm',
     'audio/webm;codecs=opus',
     'audio/ogg;codecs=opus',
   ];
   
   types.forEach(type => {
     console.log(type, MediaRecorder.isTypeSupported(type));
   });
   ```

3. **Wait for Data**
   ```javascript
   recorder.ondataavailable = (event) => {
     if (event.data.size > 0) {
       chunks.push(event.data);
     } else {
       console.warn('Empty audio chunk received');
     }
   };
   ```

4. **Set Time Slice**
   ```javascript
   // Record in chunks
   recorder.start(1000); // 1 second chunks
   ```

### ❌ Problem: Audio Quality is Poor

**Symptoms:**
- Recording is noisy
- Low volume
- Distorted sound

**Solutions:**

1. **Improve Audio Constraints**
   ```javascript
   const constraints = {
     audio: {
       channelCount: 1,
       sampleRate: 16000,
       echoCancellation: true,
       noiseSuppression: true,
       autoGainControl: true,
     }
   };
   ```

2. **Check Microphone Settings**
   - System settings → Sound → Input
   - Increase input volume
   - Test different microphone

3. **Use Better Codec**
   ```javascript
   const recorder = new MediaRecorder(stream, {
     mimeType: 'audio/webm;codecs=opus',
     audioBitsPerSecond: 128000
   });
   ```

---

## 3. Audio Playback Issues

### ❌ Problem: Audio Not Playing

**Symptoms:**
- Audio blob received but no sound
- Audio element not playing
- Playback fails silently

**Solutions:**

1. **Check Browser Autoplay Policy**
   ```javascript
   audio.play().catch(error => {
     console.error('Autoplay blocked:', error);
     // Show "Click to play" button
   });
   ```

2. **Verify Audio Format**
   ```javascript
   // Check supported formats
   const audio = new Audio();
   console.log('WAV:', audio.canPlayType('audio/wav'));
   console.log('MP3:', audio.canPlayType('audio/mpeg'));
   ```

3. **Create Audio Element Properly**
   ```javascript
   const audio = new Audio();
   audio.src = URL.createObjectURL(blob);
   audio.load(); // Important!
   await audio.play();
   ```

4. **Check Blob Conversion**
   ```javascript
   // Debug blob creation
   console.log('Blob size:', blob.size);
   console.log('Blob type:', blob.type);
   
   // Try creating object URL
   const url = URL.createObjectURL(blob);
   console.log('Object URL:', url);
   ```

### ❌ Problem: Audio Playback is Choppy

**Symptoms:**
- Audio stutters
- Playback is interrupted
- Sound cuts in and out

**Solutions:**

1. **Preload Audio**
   ```javascript
   audio.preload = 'auto';
   audio.load();
   await audio.play();
   ```

2. **Check Network Speed**
   ```javascript
   // Monitor download speed
   console.log('Audio size:', blob.size / 1024, 'KB');
   ```

3. **Use Audio Buffer**
   ```javascript
   // Use Web Audio API for better control
   const audioContext = new AudioContext();
   const arrayBuffer = await blob.arrayBuffer();
   const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
   ```

---

## 4. WebSocket Communication Errors

### ❌ Problem: Messages Not Received

**Symptoms:**
- Send message but no response
- Events not triggering
- WebSocket open but silent

**Solutions:**

1. **Check Message Format**
   ```javascript
   // Must be JSON string
   const message = JSON.stringify({
     action: "audio",
     data: base64Audio
   });
   ws.send(message);
   ```

2. **Verify Connection State**
   ```javascript
   console.log('ReadyState:', ws.readyState);
   // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
   
   if (ws.readyState === WebSocket.OPEN) {
     ws.send(message);
   }
   ```

3. **Monitor Network Tab**
   - Open DevTools → Network → WS
   - Click on WebSocket connection
   - Check Messages tab
   - Verify frames sent/received

4. **Add Event Listeners**
   ```javascript
   ws.onmessage = (event) => {
     console.log('📥 Received:', event.data);
     const data = JSON.parse(event.data);
     console.log('Parsed:', data);
   };
   ```

### ❌ Problem: Session Not Initialized

**Symptoms:**
- Error: "Session not initialized"
- Cannot send audio
- State stuck on "connected"

**Solutions:**

1. **Send Init Message**
   ```javascript
   ws.onopen = () => {
     // MUST send init first
     ws.send(JSON.stringify({
       action: "init",
       thread_id: "your-thread-id",
       audio_format: "wav"
     }));
   };
   ```

2. **Wait for Initialized Event**
   ```javascript
   ws.onmessage = (event) => {
     const data = JSON.parse(event.data);
     if (data.event === 'initialized') {
       console.log('✅ Session ready');
       // Now can send audio
     }
   };
   ```

3. **Check Thread ID**
   ```javascript
   // Thread ID must be valid string
   console.log('Thread ID:', threadId);
   console.log('Type:', typeof threadId);
   ```

### ❌ Problem: Base64 Encoding Issues

**Symptoms:**
- Backend error: "Invalid audio format"
- Audio not transcribed
- Decoding error on server

**Solutions:**

1. **Verify Base64 Format**
   ```javascript
   // Base64 should only contain: A-Z, a-z, 0-9, +, /, =
   const base64Regex = /^[A-Za-z0-9+/=]+$/;
   console.log('Valid base64:', base64Regex.test(base64Audio));
   ```

2. **Remove Data URL Prefix**
   ```javascript
   // Wrong: "data:audio/wav;base64,SGVsbG8="
   // Right: "SGVsbG8="
   
   const base64 = dataUrl.split(',')[1];
   ```

3. **Check Encoding**
   ```javascript
   // Correct way to encode
   const reader = new FileReader();
   reader.onloadend = () => {
     const base64 = reader.result.split(',')[1];
     // Use this base64
   };
   reader.readAsDataURL(blob);
   ```

---

## 5. Performance Issues

### ❌ Problem: Slow Processing / High Latency

**Symptoms:**
- Takes too long to get response
- UI feels sluggish
- Timeout errors

**Solutions:**

1. **Monitor Processing Time**
   ```javascript
   const startTime = Date.now();
   
   ws.onmessage = (event) => {
     const data = JSON.parse(event.data);
     if (data.event === 'done') {
       const totalTime = Date.now() - startTime;
       console.log('Total time:', totalTime, 'ms');
       console.log('Backend time:', data.duration * 1000, 'ms');
       console.log('Network overhead:', 
         totalTime - (data.duration * 1000), 'ms');
     }
   };
   ```

2. **Optimize Audio Size**
   ```javascript
   // Reduce sample rate
   { audio: { sampleRate: 16000 } }  // Instead of 44100
   
   // Use mono instead of stereo
   { audio: { channelCount: 1 } }
   
   // Limit recording duration
   maxDuration: 30  // seconds
   ```

3. **Check Backend Performance**
   ```bash
   # Monitor backend logs
   tail -f backend.log
   
   # Check CPU/memory usage
   top -p $(pgrep -f uvicorn)
   ```

4. **Use Production Mode**
   ```bash
   # Next.js
   npm run build
   npm start
   
   # Backend
   uvicorn app.main:app --workers 4
   ```

### ❌ Problem: Memory Leak

**Symptoms:**
- Browser memory increases over time
- Tab becomes unresponsive
- Performance degrades

**Solutions:**

1. **Cleanup Resources**
   ```javascript
   // Stop tracks
   stream.getTracks().forEach(track => track.stop());
   
   // Revoke object URLs
   URL.revokeObjectURL(audioUrl);
   
   // Clear refs
   audioRef.current = null;
   ```

2. **Use useEffect Cleanup**
   ```javascript
   useEffect(() => {
     // Setup
     
     return () => {
       // Cleanup
       ws?.close();
       recorder?.cleanup();
     };
   }, []);
   ```

3. **Monitor Memory**
   ```javascript
   // Chrome DevTools → Memory → Take heap snapshot
   // Look for detached nodes and unreleased objects
   ```

---

## 6. Browser Compatibility

### ❌ Problem: Not Working in Safari

**Symptoms:**
- Works in Chrome but not Safari
- Different behavior on iOS
- API not available

**Solutions:**

1. **Check Safari Support**
   ```javascript
   // WebRTC/MediaRecorder may need polyfill
   if (!window.MediaRecorder) {
     console.error('MediaRecorder not supported');
     // Show error message or use fallback
   }
   ```

2. **Use Vendor Prefixes**
   ```javascript
   navigator.getUserMedia = 
     navigator.getUserMedia ||
     navigator.webkitGetUserMedia ||
     navigator.mozGetUserMedia;
   ```

3. **Test on Safari Technology Preview**
   - Download latest Safari TP
   - Test WebSocket and audio APIs

### ❌ Problem: Firefox Audio Issues

**Symptoms:**
- Audio format not supported
- Different MIME types needed

**Solutions:**

1. **Use Opus Codec**
   ```javascript
   const mimeType = 'audio/ogg;codecs=opus';
   if (MediaRecorder.isTypeSupported(mimeType)) {
     recorder = new MediaRecorder(stream, { mimeType });
   }
   ```

2. **Check Firefox Support**
   ```javascript
   // Firefox preferences: about:config
   // media.navigator.streams.enabled = true
   // media.getusermedia.screensharing.enabled = true
   ```

---

## 7. Mobile-Specific Issues

### ❌ Problem: iOS Not Recording

**Symptoms:**
- No microphone on iOS
- getUserMedia fails on iPhone
- Works on desktop but not mobile

**Solutions:**

1. **Use HTTPS**
   - iOS requires HTTPS for getUserMedia
   - Even in development, use HTTPS or ngrok

2. **Handle iOS Restrictions**
   ```javascript
   // iOS needs user gesture to access mic
   button.addEventListener('click', async () => {
     const stream = await navigator.mediaDevices.getUserMedia({
       audio: true
     });
   });
   ```

3. **Test on Real Device**
   - Safari on iOS has different behavior
   - Use remote debugging

### ❌ Problem: Android Audio Issues

**Symptoms:**
- Poor audio quality on Android
- Recording stops unexpectedly

**Solutions:**

1. **Test Different Browsers**
   - Chrome (most compatible)
   - Firefox
   - Samsung Internet

2. **Handle Screen Sleep**
   ```javascript
   // Keep screen awake during recording
   const wakeLock = await navigator.wakeLock?.request('screen');
   ```

---

## 8. Backend Integration Issues

### ❌ Problem: Backend Not Responding

**Symptoms:**
- Timeout errors
- No events from backend
- Process seems stuck

**Solutions:**

1. **Check Backend Logs**
   ```bash
   # View logs
   tail -f app.log
   
   # Or if using Docker
   docker logs -f container_name
   ```

2. **Verify STT/TTS Services**
   ```python
   # Check API keys
   print(os.getenv('GOOGLE_API_KEY'))
   print(os.getenv('OPENAI_API_KEY'))
   ```

3. **Test Backend Directly**
   ```bash
   # Use Python script to test
   python test_voice_service.py
   ```

4. **Check Backend Dependencies**
   ```bash
   pip list | grep google
   pip list | grep openai
   ```

### ❌ Problem: Wrong Audio Format from Backend

**Symptoms:**
- Cannot play audio received
- Format mismatch error
- Empty audio response

**Solutions:**

1. **Check TTS Provider**
   ```python
   # backend/app/core/config.py
   TTS_PROVIDER = "gemini"  # or "openai", "google"
   
   # Different providers return different formats:
   # Gemini → WAV
   # OpenAI → MP3
   # Google → MP3
   ```

2. **Handle Multiple Formats**
   ```javascript
   function playAudio(base64, format) {
     const mimeType = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
     const blob = base64ToBlob(base64, mimeType);
     // ...
   }
   ```

---

## 9. Debugging Tools & Techniques

### 🔍 Browser DevTools

**Network Tab:**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: WS (WebSocket)
4. Click on connection
5. View Messages tab
6. See all frames sent/received
```

**Console Logging:**
```javascript
// Add detailed logging
const DEBUG = true;

function log(category, message, data) {
  if (DEBUG) {
    console.log(`[${category}]`, message, data || '');
  }
}

// Usage
log('WS', 'Connecting to', wsUrl);
log('Audio', 'Recording started');
log('Event', 'Received', event);
```

### 🔍 WebSocket Testing Tools

**wscat:**
```bash
# Install
npm install -g wscat

# Connect
wscat -c ws://localhost:8000/api/ws/voice

# Send message
> {"action":"init","thread_id":"test","audio_format":"wav"}

# View response
< {"event":"initialized","thread_id":"test","kb_id":"default"}
```

**websocat:**
```bash
# Install
cargo install websocat

# Connect and send
echo '{"action":"ping"}' | websocat ws://localhost:8000/api/ws/voice
```

### 🔍 Audio Debugging

**Test Audio File:**
```javascript
// Load and send test audio file
const response = await fetch('/test-audio.wav');
const blob = await response.blob();
const base64 = await blobToBase64(blob);
ws.send(JSON.stringify({ action: 'audio', data: base64 }));
```

**Monitor Audio Levels:**
```javascript
// Visualize audio input
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const microphone = audioContext.createMediaStreamSource(stream);
microphone.connect(analyser);

const dataArray = new Uint8Array(analyser.frequencyBinCount);
function checkLevel() {
  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
  console.log('Audio level:', average);
  requestAnimationFrame(checkLevel);
}
checkLevel();
```

---

## 10. Common Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `WebSocket connection failed` | Backend not running | Start backend server |
| `NotAllowedError` | Microphone permission denied | Grant permission in browser |
| `InvalidStateError` | MediaRecorder in wrong state | Check recorder.state before calling methods |
| `TypeError: Cannot read property 'send'` | WebSocket not connected | Check ws.readyState === WebSocket.OPEN |
| `JSON parse error` | Invalid message format | Verify JSON.stringify() on send |
| `Session not initialized` | Forgot init message | Send init before audio |
| `Invalid audio format` | Wrong encoding or format | Verify WAV format and base64 encoding |
| `Timeout error` | Slow processing or network | Increase timeout, check backend logs |
| `CORS policy error` | CORS not configured | Update backend CORS settings |
| `autoplay policy` | Browser blocks autoplay | Add user interaction before playing |

---

## 🆘 Getting Help

If you're still stuck:

1. **Check Documentation**
   - Read `WEBSOCKET_VOICE_INTEGRATION_GUIDE.md`
   - Review `QUICK_REFERENCE.md`

2. **Search Existing Issues**
   - Check project issues on GitHub
   - Search Stack Overflow

3. **Create Detailed Bug Report**
   ```
   **Environment:**
   - Browser: Chrome 120.0
   - OS: Windows 11
   - Backend: Running on port 8000
   
   **Steps to Reproduce:**
   1. Click mic button
   2. Speak for 5 seconds
   3. Click stop
   
   **Expected:**
   Transcription should appear
   
   **Actual:**
   No transcription, error in console
   
   **Error Message:**
   ```
   [Paste error here]
   ```
   
   **Screenshots:**
   [Attach screenshots]
   ```

4. **Enable Debug Mode**
   ```bash
   # .env.local
   NEXT_PUBLIC_DEBUG_MODE=true
   ```

5. **Collect Logs**
   - Browser console logs
   - Network tab WebSocket frames
   - Backend logs

---

**Last Updated**: November 26, 2025  
**Version**: 1.0.0
