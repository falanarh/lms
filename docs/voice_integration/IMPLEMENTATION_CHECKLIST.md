# 📋 Implementation Checklist
## WebSocket Voice Integration - Step-by-Step Checklist

### Phase 1: Setup & Preparation ✅

- [ ] **Review Backend Documentation**
  - [ ] Read `app/api/websocket_routes.py`
  - [ ] Understand protocol flow (init → audio → events)
  - [ ] Note all event types and data structures
  - [ ] Verify backend is running on port 8000

- [ ] **Setup Environment Variables**
  - [ ] Create/update `.env.local` file
  - [ ] Add `NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/ws/voice`
  - [ ] Add `NEXT_PUBLIC_API_URL=http://localhost:8000`
  - [ ] Verify env vars are loaded (check `process.env`)

- [ ] **Install Dependencies** (if needed)
  - [ ] Check if any new packages needed
  - [ ] Run `npm install` or `yarn install`
  - [ ] Verify TypeScript configuration

---

### Phase 2: Type Definitions 📝

- [ ] **Create Type Definitions File**
  - [ ] Create `src/types/voice.ts`
  - [ ] Define all client message types (InitMessage, AudioMessage, PingMessage)
  - [ ] Define all server event types (InitializedEvent, STTStartEvent, etc.)
  - [ ] Define state types (VoiceState, ProcessingStage)
  - [ ] Define session type (VoiceSession)
  - [ ] Export all types properly

- [ ] **Verify Types**
  - [ ] No TypeScript errors
  - [ ] Types match backend protocol exactly
  - [ ] All required fields included
  - [ ] Optional fields marked correctly

---

### Phase 3: Audio Recorder Utility 🎤

- [ ] **Create AudioRecorder Class**
  - [ ] Create `src/lib/tutor-ai/audioRecorder.ts`
  - [ ] Implement `startRecording()` method
    - [ ] Request microphone permission
    - [ ] Configure audio constraints (16kHz, mono)
    - [ ] Create MediaRecorder instance
    - [ ] Handle permission errors
  - [ ] Implement `stopRecording()` method
    - [ ] Stop MediaRecorder
    - [ ] Return audio Blob
    - [ ] Cleanup resources
  - [ ] Implement `blobToBase64()` method
    - [ ] Use FileReader API
    - [ ] Remove data URL prefix
    - [ ] Return clean base64 string
  - [ ] Implement `base64ToBlob()` method
    - [ ] Decode base64 string
    - [ ] Create Uint8Array
    - [ ] Return Blob with correct MIME type
  - [ ] Add helper methods
    - [ ] `arrayBufferToBase64()`
    - [ ] `getSupportedMimeType()`
    - [ ] `isRecording()`
    - [ ] `cleanup()`

- [ ] **Test Audio Recorder**
  - [ ] Test in browser console
  - [ ] Verify microphone permission dialog
  - [ ] Test recording start/stop
  - [ ] Verify audio blob creation
  - [ ] Test base64 conversion
  - [ ] Check audio file size (should be reasonable)

---

### Phase 4: WebSocket Manager 🔌

- [ ] **Create VoiceWebSocket Class**
  - [ ] Create `src/lib/tutor-ai/voiceWebSocket.ts`
  - [ ] Implement `connect()` method
    - [ ] Create WebSocket instance
    - [ ] Setup event handlers (onopen, onmessage, onerror, onclose)
    - [ ] Send init message after connection
    - [ ] Return Promise
  - [ ] Implement `disconnect()` method
    - [ ] Close WebSocket
    - [ ] Cleanup timers
    - [ ] Reset state
  - [ ] Implement `sendAudio()` method
    - [ ] Check connection state
    - [ ] Create audio message
    - [ ] Send as JSON string
  - [ ] Implement `send()` helper
    - [ ] Verify WebSocket is open
    - [ ] Stringify message
    - [ ] Send to server
  - [ ] Implement event handling
    - [ ] Parse incoming JSON
    - [ ] Update internal session
    - [ ] Call event callbacks
    - [ ] Update state based on events
  - [ ] Add reconnection logic
    - [ ] Exponential backoff
    - [ ] Max retry attempts
    - [ ] Auto-reconnect flag
  - [ ] Add heartbeat/ping
    - [ ] Send ping every 30s
    - [ ] Handle pong response

- [ ] **Test WebSocket Manager**
  - [ ] Test connection to backend
  - [ ] Test init message
  - [ ] Test audio sending
  - [ ] Test event receiving
  - [ ] Test error handling
  - [ ] Test reconnection
  - [ ] Test heartbeat

---

### Phase 5: React Hook 🪝

- [ ] **Create useVoiceChat Hook**
  - [ ] Create `src/hooks/useVoiceChat.ts`
  - [ ] Setup state variables
    - [ ] `state: VoiceState`
    - [ ] `session: VoiceSession`
    - [ ] `isRecording: boolean`
    - [ ] `transcribedText: string | null`
    - [ ] `aiResponse: string | null`
    - [ ] `error: string | null`
  - [ ] Setup refs
    - [ ] `wsRef: VoiceWebSocket`
    - [ ] `recorderRef: AudioRecorder`
    - [ ] `audioRef: HTMLAudioElement`
  - [ ] Implement `connect()` function
    - [ ] Create WebSocket instance
    - [ ] Setup callbacks
    - [ ] Connect to server
  - [ ] Implement `disconnect()` function
    - [ ] Close WebSocket
    - [ ] Cleanup resources
  - [ ] Implement `startRecording()` function
    - [ ] Check WebSocket ready
    - [ ] Create audio recorder
    - [ ] Start recording
    - [ ] Reset previous state
  - [ ] Implement `stopRecording()` function
    - [ ] Stop recorder
    - [ ] Get audio blob
    - [ ] Convert to base64
    - [ ] Send to server
  - [ ] Implement `playAudio()` function
    - [ ] Convert base64 to blob
    - [ ] Create object URL
    - [ ] Play audio
    - [ ] Cleanup on end
  - [ ] Add event handlers
    - [ ] Handle initialized event
    - [ ] Handle STT complete
    - [ ] Handle RAG complete
    - [ ] Handle TTS complete
    - [ ] Handle errors
  - [ ] Add auto-connect on mount
  - [ ] Add cleanup on unmount

- [ ] **Test useVoiceChat Hook**
  - [ ] Test in simple component
  - [ ] Verify state updates
  - [ ] Test all actions (connect, record, etc.)
  - [ ] Check callbacks work
  - [ ] Verify cleanup on unmount

---

### Phase 6: Update TalkingMode Component 🎨

- [ ] **Update TalkingMode.tsx**
  - [ ] Add `threadId` prop to component interface
  - [ ] Import `useVoiceChat` hook
  - [ ] Initialize voice chat hook
    - [ ] Pass WebSocket URL
    - [ ] Pass thread ID
    - [ ] Set autoConnect to true
    - [ ] Add callbacks (onTranscription, onResponse, onError)
  - [ ] Create orb state logic
    - [ ] Map voice state to orb state
    - [ ] idle → idle
    - [ ] recording → listening
    - [ ] processing → listening
    - [ ] speaking → speaking
  - [ ] Update UI to show state
    - [ ] Display current status (Listening, Processing, etc.)
    - [ ] Show transcribed text
    - [ ] Show AI response
    - [ ] Show error messages
  - [ ] Implement mic button handler
    - [ ] Toggle recording on click
    - [ ] Start recording if not recording
    - [ ] Stop recording if recording
    - [ ] Disable during processing
  - [ ] Add visual feedback
    - [ ] Change button color when recording
    - [ ] Add pulsing animation
    - [ ] Show loading state
  - [ ] Add cleanup on unmount
    - [ ] Disconnect WebSocket
    - [ ] Stop recording if active

- [ ] **Test TalkingMode Component**
  - [ ] Open talking mode
  - [ ] Click mic button
  - [ ] Verify recording starts
  - [ ] Speak into microphone
  - [ ] Click mic button again
  - [ ] Verify audio sent
  - [ ] Verify transcription displayed
  - [ ] Verify AI response displayed
  - [ ] Verify audio playback
  - [ ] Test error scenarios
  - [ ] Test closing modal

---

### Phase 7: Update Main Page 📄

- [ ] **Update page.tsx**
  - [ ] Find TalkingMode component usage
  - [ ] Add `threadId` prop
  - [ ] Pass `activeRoomId` as thread ID
  - [ ] Verify prop is passed correctly

- [ ] **Update MessageInput.tsx** (Optional)
  - [ ] Add voice button functionality
  - [ ] Import voice chat hook
  - [ ] Implement quick voice message
  - [ ] Show recording state in input area

- [ ] **Update ChatInterface.tsx** (Optional)
  - [ ] Add voice message type to Message component
  - [ ] Display voice messages in chat history
  - [ ] Add audio player for voice messages
  - [ ] Show transcription with audio

---

### Phase 8: Testing & Debugging 🧪

- [ ] **Unit Tests**
  - [ ] Test AudioRecorder methods
  - [ ] Test VoiceWebSocket methods
  - [ ] Test useVoiceChat hook
  - [ ] All tests pass

- [ ] **Integration Tests**
  - [ ] Test full voice flow
  - [ ] Test error handling
  - [ ] Test reconnection
  - [ ] Test multiple sessions

- [ ] **Manual Testing**
  - [ ] Backend running ✓
  - [ ] Frontend running ✓
  - [ ] WebSocket connects ✓
  - [ ] Microphone permission granted ✓
  - [ ] Audio recording works ✓
  - [ ] Audio sent to server ✓
  - [ ] Transcription received ✓
  - [ ] AI response received ✓
  - [ ] Audio playback works ✓
  - [ ] Error handling works ✓
  - [ ] Reconnection works ✓
  - [ ] Multiple sessions work ✓

- [ ] **Browser Testing**
  - [ ] Chrome ✓
  - [ ] Firefox ✓
  - [ ] Safari ✓
  - [ ] Edge ✓
  - [ ] Mobile browsers (iOS Safari, Chrome Mobile) ✓

- [ ] **Debug Common Issues**
  - [ ] Check browser console for errors
  - [ ] Check Network tab for WebSocket frames
  - [ ] Verify audio format and size
  - [ ] Check backend logs
  - [ ] Test with different microphones
  - [ ] Test with different audio durations

---

### Phase 9: Optimization & Polish ✨

- [ ] **Performance Optimization**
  - [ ] Add loading states
  - [ ] Optimize audio encoding
  - [ ] Add request timeout
  - [ ] Implement debouncing (if needed)
  - [ ] Minimize re-renders

- [ ] **User Experience**
  - [ ] Add visual feedback for all states
  - [ ] Add sound effects (optional)
  - [ ] Add animations
  - [ ] Add tooltips/help text
  - [ ] Add keyboard shortcuts
  - [ ] Improve error messages
  - [ ] Add retry button

- [ ] **Accessibility**
  - [ ] Add ARIA labels
  - [ ] Add keyboard navigation
  - [ ] Add screen reader support
  - [ ] Test with accessibility tools
  - [ ] Ensure contrast ratios

- [ ] **Code Quality**
  - [ ] Add comments
  - [ ] Remove console.logs (or make them conditional)
  - [ ] Format code
  - [ ] Run linter
  - [ ] Fix all TypeScript warnings

---

### Phase 10: Documentation & Deployment 📚

- [ ] **Update Documentation**
  - [ ] Update README.md
  - [ ] Add usage examples
  - [ ] Document environment variables
  - [ ] Add troubleshooting guide
  - [ ] Add API reference

- [ ] **Prepare for Production**
  - [ ] Update environment variables for production
    - [ ] Change WS_URL to WSS (secure WebSocket)
    - [ ] Use production backend URL
  - [ ] Add error tracking (Sentry, etc.)
  - [ ] Add analytics events
  - [ ] Test in production-like environment
  - [ ] Load testing
  - [ ] Security audit

- [ ] **Deploy**
  - [ ] Deploy backend changes
  - [ ] Deploy frontend changes
  - [ ] Verify WebSocket connectivity in production
  - [ ] Monitor logs and errors
  - [ ] Test end-to-end in production

---

## 📊 Progress Tracking

**Overall Progress: 0%**

- [ ] Phase 1: Setup & Preparation (0%)
- [ ] Phase 2: Type Definitions (0%)
- [ ] Phase 3: Audio Recorder (0%)
- [ ] Phase 4: WebSocket Manager (0%)
- [ ] Phase 5: React Hook (0%)
- [ ] Phase 6: TalkingMode Component (0%)
- [ ] Phase 7: Main Page Updates (0%)
- [ ] Phase 8: Testing & Debugging (0%)
- [ ] Phase 9: Optimization & Polish (0%)
- [ ] Phase 10: Documentation & Deployment (0%)

---

## 🐛 Known Issues & Solutions

| Issue | Solution | Status |
|-------|----------|--------|
| WebSocket connection refused | Start backend server | - |
| Microphone permission denied | Request permission in HTTPS context | - |
| Audio not playing | Check browser autoplay policy | - |
| Large audio file size | Compress audio or reduce duration | - |
| Slow processing | Optimize backend or use better hardware | - |

---

## 💡 Tips & Best Practices

1. **Always test backend first** - Use `wscat` or browser console to test WebSocket endpoint
2. **Start simple** - Test basic connection before adding complex features
3. **Log everything** - Add comprehensive logging for debugging
4. **Handle errors gracefully** - Always assume things can fail
5. **Test on real devices** - Mobile behavior can be different
6. **Use TypeScript strictly** - Type safety prevents bugs
7. **Read backend logs** - They show what's happening on server side
8. **Test edge cases** - Very short audio, very long audio, no speech, etc.
9. **Monitor performance** - Check audio file sizes and processing times
10. **Keep UI responsive** - Show loading states and progress

---

## 🎯 Success Criteria

The integration is complete when:

✅ WebSocket connects successfully  
✅ Audio recording works smoothly  
✅ Audio is sent to backend  
✅ Transcription is displayed  
✅ AI response is generated  
✅ Audio response plays automatically  
✅ All states are handled properly  
✅ Errors are caught and displayed  
✅ Reconnection works  
✅ UI is responsive and polished  
✅ Code is clean and well-documented  
✅ All tests pass  
✅ Works in production  

---

**Last Updated**: November 26, 2025  
**Version**: 1.0.0
