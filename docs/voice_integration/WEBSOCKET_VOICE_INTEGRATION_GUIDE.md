# 🎤 WebSocket Voice Integration Guide
## Dokumentasi Lengkap Integrasi Endpoint `/api/ws/voice` dengan Frontend Tutor AI

> **Target**: Integrasi voice chat realtime menggunakan WebSocket antara backend FastAPI dan frontend Next.js pada halaman `/tutor-ai`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [WebSocket Protocol](#websocket-protocol)
4. [Data Structure Specification](#data-structure-specification)
5. [Frontend Integration Requirements](#frontend-integration-requirements)
6. [Implementation Guide](#implementation-guide)
7. [Code Examples](#code-examples)
8. [Error Handling](#error-handling)
9. [Testing Guidelines](#testing-guidelines)
10. [Troubleshooting](#troubleshooting)

---

## 1. Overview

### 1.1 Arsitektur Sistem

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │  ←─────────────────────→   │                 │
│  Frontend       │                             │  Backend        │
│  (Next.js)      │   /api/ws/voice             │  (FastAPI)      │
│                 │                             │                 │
│  - TalkingMode  │   Real-time Streaming       │  - STT Service  │
│  - MessageInput │   Audio + Text + Events     │  - RAG System   │
│  - ChatInterface│                             │  - TTS Service  │
│                 │                             │                 │
└─────────────────┘                             └─────────────────┘
```

### 1.2 Technology Stack

**Backend:**
- FastAPI (WebSocket support)
- Speech-to-Text (STT): Google/OpenAI/Gemini
- Text-to-Speech (TTS): Google/OpenAI/Gemini
- LangGraph untuk RAG system
- MongoDB untuk session management

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Web Audio API
- WebSocket API (Browser native)

### 1.3 Flow Diagram

```
User → Record Audio → Send Base64 → Backend
                                      ↓
                            ┌─────────────────┐
                            │ 1. STT (Speech  │
                            │    to Text)     │
                            └─────────────────┘
                                      ↓
                            ┌─────────────────┐
                            │ 2. RAG (LLM     │
                            │    Processing)  │
                            └─────────────────┘
                                      ↓
                            ┌─────────────────┐
                            │ 3. TTS (Text    │
                            │    to Speech)   │
                            └─────────────────┘
                                      ↓
User ← Play Audio ← Receive Base64 ← Backend
```

---

## 2. Backend Architecture

### 2.1 Endpoint Location

**File**: `app/api/websocket_routes.py`  
**Function**: `handle_voice_websocket(websocket: WebSocket)`  
**Route**: `/api/ws/voice`

### 2.2 Backend Configuration

```python
# app/core/config.py
class Settings:
    # WebSocket
    WS_MAX_CONNECTIONS = 100
    WS_HEARTBEAT_INTERVAL = 30
    
    # Audio Processing
    STT_PROVIDER = "gemini"  # or "openai", "google"
    TTS_PROVIDER = "gemini"  # or "openai", "google"
    AUDIO_SAMPLE_RATE = 16000
    AUDIO_CHANNELS = 1
    
    # Database
    DB_NAME = "tutor_ai"
    MONGO_URI = "mongodb://localhost:27017"
```

### 2.3 Dependencies

```python
# Backend menggunakan:
- fastapi (WebSocket support)
- python-multipart
- google-cloud-speech
- google-cloud-texttospeech
- openai
- langgraph
- pymongo
```

---

## 3. WebSocket Protocol

### 3.1 Connection Lifecycle

```
1. Client → Connect to ws://host/api/ws/voice
2. Server → Accept connection
3. Client → Send init action
4. Server → Respond with initialized event
5. Client → Send audio action (dapat multiple kali)
6. Server → Stream events (stt_start, stt_complete, rag_start, etc.)
7. Client → Send ping (optional untuk heartbeat)
8. Server → Respond with pong
9. Client/Server → Close connection
```

### 3.2 Message Format

**Semua message menggunakan JSON string format**

#### Client → Server Messages

```typescript
type ClientMessage = 
  | InitMessage 
  | AudioMessage 
  | PingMessage;

interface InitMessage {
  action: "init";
  thread_id: string;        // Unique session ID
  audio_format: "wav";      // Audio format (currently only "wav")
}

interface AudioMessage {
  action: "audio";
  data: string;             // Base64-encoded audio data (WAV format)
}

interface PingMessage {
  action: "ping";           // Heartbeat message
}
```

#### Server → Client Messages

```typescript
type ServerMessage = 
  | InitializedEvent
  | STTStartEvent
  | STTCompleteEvent
  | RAGStartEvent
  | RAGTokenEvent
  | RAGCompleteEvent
  | TTSStartEvent
  | TTSCompleteEvent
  | DoneEvent
  | ErrorEvent
  | PongEvent;

interface InitializedEvent {
  event: "initialized";
  thread_id: string;
  kb_id: string;            // Knowledge base ID
}

interface STTStartEvent {
  event: "stt_start";
}

interface STTCompleteEvent {
  event: "stt_complete";
  text: string;             // Transcribed text dari audio
}

interface RAGStartEvent {
  event: "rag_start";
}

interface RAGTokenEvent {
  event: "rag_token";
  token: string;            // Single token dari streaming LLM
}

interface RAGCompleteEvent {
  event: "rag_complete";
  text: string;             // Complete response text
}

interface TTSStartEvent {
  event: "tts_start";
}

interface TTSCompleteEvent {
  event: "tts_complete";
  audio: string;            // Base64-encoded audio response
  format: "wav" | "mp3";    // Audio format (depends on TTS provider)
}

interface DoneEvent {
  event: "done";
  duration: number;         // Total processing duration in seconds
}

interface ErrorEvent {
  event: "error";
  message: string;          // Error description
}

interface PongEvent {
  event: "pong";
}
```

### 3.3 Event Sequence

**Normal Flow:**

```
Client → { action: "init", thread_id: "xxx", audio_format: "wav" }
Server → { event: "initialized", thread_id: "xxx", kb_id: "yyy" }

Client → { action: "audio", data: "<base64-audio>" }
Server → { event: "stt_start" }
Server → { event: "stt_complete", text: "transcribed text" }
Server → { event: "rag_start" }
Server → { event: "rag_token", token: "Hello" }
Server → { event: "rag_token", token: " world" }
Server → { event: "rag_complete", text: "Hello world" }
Server → { event: "tts_start" }
Server → { event: "tts_complete", audio: "<base64-audio>", format: "wav" }
Server → { event: "done", duration: 5.23 }
```

**Error Flow:**

```
Client → { action: "audio", data: "invalid-data" }
Server → { event: "error", message: "Invalid audio format" }
```

---

## 4. Data Structure Specification

### 4.1 Audio Format Requirements

**Input Audio (Client → Server):**
- **Format**: WAV
- **Encoding**: Base64 string
- **Sample Rate**: 16000 Hz (recommended)
- **Channels**: Mono (1 channel)
- **Bit Depth**: 16-bit PCM

**Output Audio (Server → Client):**
- **Format**: WAV (Gemini) atau MP3 (OpenAI/Google)
- **Encoding**: Base64 string
- **Sample Rate**: Variable (depends on TTS provider)
- **Channels**: Mono (1 channel)

### 4.2 Base64 Encoding/Decoding

**JavaScript (Browser):**

```typescript
// Encoding: ArrayBuffer → Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decoding: Base64 → Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
```

### 4.3 Session Management

**Thread ID Format:**
- UUID v4 recommended
- Example: `"550e8400-e29b-41d4-a716-446655440000"`
- Persistent across page refreshes
- Stored in localStorage

**Knowledge Base ID (kb_id):**
- Retrieved from MongoDB session collection
- Format: String (user-specific or "default")
- Automatically linked to thread_id

---

## 5. Frontend Integration Requirements

### 5.1 Existing Components

**File Structure:**
```
src/
├── app/
│   └── tutor-ai/
│       └── page.tsx                    # Main page component
├── components/
│   └── tutor-ai/
│       ├── ChatInterface.tsx           # Chat UI container
│       ├── MessageInput.tsx            # Text + voice input
│       ├── TalkingMode.tsx             # Immersive voice UI
│       ├── Message.tsx                 # Message bubble
│       └── ChatSidebar.tsx             # Chat history sidebar
└── lib/
    └── tutor-ai/
        ├── chatStorage.ts              # LocalStorage utilities
        └── voiceWebSocket.ts           # WebSocket client (TO BE CREATED)
```

### 5.2 Current Implementation Analysis

**Component: TalkingMode.tsx**
- **Purpose**: Immersive full-screen voice interface
- **Current State**: UI only, no WebSocket integration
- **Required Changes**: 
  - Add WebSocket connection logic
  - Implement audio recording
  - Add audio playback
  - Display real-time status
  - Show transcribed text and AI response

**Component: MessageInput.tsx**
- **Purpose**: Text + voice input at bottom of chat
- **Current State**: Has mic button but non-functional
- **Required Changes**:
  - Add voice recording on mic button click
  - Send audio to WebSocket
  - Display loading state during processing

**Component: ChatInterface.tsx**
- **Purpose**: Main chat container
- **Current State**: Text-based chat working
- **Required Changes**:
  - Add voice message support
  - Display voice messages in chat history
  - Handle voice mode toggle

### 5.3 New Files to Create

1. **`src/lib/tutor-ai/voiceWebSocket.ts`**
   - WebSocket connection manager
   - Event handling
   - Auto-reconnection logic

2. **`src/lib/tutor-ai/audioRecorder.ts`**
   - MediaRecorder API wrapper
   - WAV encoding utilities
   - Audio buffer management

3. **`src/hooks/useVoiceChat.ts`**
   - React hook for voice chat
   - State management
   - WebSocket lifecycle

4. **`src/types/voice.ts`**
   - TypeScript interfaces
   - Match backend protocol exactly

---

## 6. Implementation Guide

### 6.1 Step-by-Step Implementation

#### Step 1: Create Type Definitions

**File: `src/types/voice.ts`**

```typescript
// ============================================================================
// CLIENT → SERVER MESSAGES
// ============================================================================

export interface InitMessage {
  action: "init";
  thread_id: string;
  audio_format: "wav";
}

export interface AudioMessage {
  action: "audio";
  data: string; // Base64-encoded audio
}

export interface PingMessage {
  action: "ping";
}

export type ClientMessage = InitMessage | AudioMessage | PingMessage;

// ============================================================================
// SERVER → CLIENT EVENTS
// ============================================================================

export interface InitializedEvent {
  event: "initialized";
  thread_id: string;
  kb_id: string;
}

export interface STTStartEvent {
  event: "stt_start";
}

export interface STTCompleteEvent {
  event: "stt_complete";
  text: string;
}

export interface RAGStartEvent {
  event: "rag_start";
}

export interface RAGTokenEvent {
  event: "rag_token";
  token: string;
}

export interface RAGCompleteEvent {
  event: "rag_complete";
  text: string;
}

export interface TTSStartEvent {
  event: "tts_start";
}

export interface TTSCompleteEvent {
  event: "tts_complete";
  audio: string; // Base64-encoded
  format: "wav" | "mp3";
}

export interface DoneEvent {
  event: "done";
  duration: number;
}

export interface ErrorEvent {
  event: "error";
  message: string;
}

export interface PongEvent {
  event: "pong";
}

export type ServerEvent =
  | InitializedEvent
  | STTStartEvent
  | STTCompleteEvent
  | RAGStartEvent
  | RAGTokenEvent
  | RAGCompleteEvent
  | TTSStartEvent
  | TTSCompleteEvent
  | DoneEvent
  | ErrorEvent
  | PongEvent;

// ============================================================================
// STATE TYPES
// ============================================================================

export type VoiceState = 
  | "idle"           // Not connected
  | "connecting"     // Establishing connection
  | "connected"      // Connected, waiting for init
  | "ready"          // Initialized, ready to send audio
  | "recording"      // Recording audio
  | "processing"     // Processing audio (STT → RAG → TTS)
  | "speaking"       // Playing audio response
  | "error";         // Error occurred

export type ProcessingStage = 
  | "stt"            // Speech-to-Text
  | "rag"            // RAG processing
  | "tts"            // Text-to-Speech
  | null;

export interface VoiceSession {
  threadId: string;
  kbId?: string;
  state: VoiceState;
  processingStage: ProcessingStage;
  transcribedText?: string;
  aiResponse?: string;
  audioResponse?: string;
  audioFormat?: "wav" | "mp3";
  error?: string;
  duration?: number;
}
```

#### Step 2: Create Audio Recorder Utility

**File: `src/lib/tutor-ai/audioRecorder.ts`**

```typescript
/**
 * Audio Recorder Utility
 * Handles audio recording using MediaRecorder API and WAV encoding
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType(),
      });

      this.audioChunks = [];

      // Collect audio chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
      console.log("🎤 Recording started");
    } catch (error) {
      console.error("❌ Failed to start recording:", error);
      throw new Error("Microphone access denied or not available");
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: "audio/wav",
        });
        console.log("✅ Recording stopped, size:", audioBlob.size);
        
        // Cleanup
        this.cleanup();
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Convert audio blob to base64 string
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix (e.g., "data:audio/wav;base64,")
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert audio blob to ArrayBuffer
   */
  async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to Blob
   */
  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Get supported MIME type for MediaRecorder
   */
  private getSupportedMimeType(): string {
    const types = [
      "audio/webm",
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log("📊 Using MIME type:", type);
        return type;
      }
    }

    console.warn("⚠️ No preferred MIME type supported, using default");
    return "";
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  /**
   * Check if recording is active
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}

/**
 * Create audio recorder instance
 */
export const createAudioRecorder = () => new AudioRecorder();
```

#### Step 3: Create WebSocket Manager

**File: `src/lib/tutor-ai/voiceWebSocket.ts`**

```typescript
/**
 * Voice WebSocket Manager
 * Handles WebSocket connection for real-time voice chat
 */

import type {
  ClientMessage,
  ServerEvent,
  VoiceSession,
  VoiceState,
  ProcessingStage,
} from "@/types/voice";

export type EventCallback = (event: ServerEvent) => void;

export interface VoiceWebSocketConfig {
  url: string;
  threadId: string;
  onEvent?: EventCallback;
  onStateChange?: (state: VoiceState) => void;
  onError?: (error: string) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export class VoiceWebSocket {
  private ws: WebSocket | null = null;
  private config: VoiceWebSocketConfig;
  private state: VoiceState = "idle";
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private session: Partial<VoiceSession> = {};

  constructor(config: VoiceWebSocketConfig) {
    this.config = {
      autoReconnect: true,
      maxReconnectAttempts: 3,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.updateState("connecting");
        console.log("🔌 Connecting to:", this.config.url);

        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected");
          this.updateState("connected");
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.initialize();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          this.handleError("WebSocket connection error");
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("🔌 WebSocket disconnected");
          this.stopHeartbeat();
          this.updateState("idle");
          this.attemptReconnect();
        };
      } catch (error) {
        console.error("❌ Failed to create WebSocket:", error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateState("idle");
  }

  /**
   * Initialize session
   */
  private initialize(): void {
    const message: ClientMessage = {
      action: "init",
      thread_id: this.config.threadId,
      audio_format: "wav",
    };
    this.send(message);
  }

  /**
   * Send audio data
   */
  sendAudio(base64Audio: string): void {
    if (this.state !== "ready") {
      console.warn("⚠️ Not ready to send audio, current state:", this.state);
      return;
    }

    const message: ClientMessage = {
      action: "audio",
      data: base64Audio,
    };
    this.send(message);
    this.updateState("processing");
  }

  /**
   * Send message to server
   */
  private send(message: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket not connected");
      return;
    }

    const jsonString = JSON.stringify(message);
    this.ws.send(jsonString);
    console.log("📤 Sent:", message.action);
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const event = JSON.parse(data) as ServerEvent;
      console.log("📥 Received:", event.event);

      // Update session based on event
      this.updateSession(event);

      // Call event callback
      if (this.config.onEvent) {
        this.config.onEvent(event);
      }

      // Update state based on event
      this.updateStateFromEvent(event);
    } catch (error) {
      console.error("❌ Failed to parse message:", error);
    }
  }

  /**
   * Update session data from event
   */
  private updateSession(event: ServerEvent): void {
    switch (event.event) {
      case "initialized":
        this.session = {
          threadId: event.thread_id,
          kbId: event.kb_id,
          state: "ready",
          processingStage: null,
        };
        break;
      case "stt_complete":
        this.session.transcribedText = event.text;
        break;
      case "rag_complete":
        this.session.aiResponse = event.text;
        break;
      case "tts_complete":
        this.session.audioResponse = event.audio;
        this.session.audioFormat = event.format;
        break;
      case "done":
        this.session.duration = event.duration;
        break;
      case "error":
        this.session.error = event.message;
        break;
    }
  }

  /**
   * Update state based on event
   */
  private updateStateFromEvent(event: ServerEvent): void {
    switch (event.event) {
      case "initialized":
        this.updateState("ready");
        break;
      case "stt_start":
      case "rag_start":
      case "tts_start":
        this.updateState("processing");
        break;
      case "tts_complete":
        this.updateState("speaking");
        break;
      case "done":
        this.updateState("ready");
        break;
      case "error":
        this.updateState("error");
        break;
    }
  }

  /**
   * Update current state
   */
  private updateState(newState: VoiceState): void {
    const oldState = this.state;
    this.state = newState;
    
    if (oldState !== newState) {
      console.log(`🔄 State: ${oldState} → ${newState}`);
      if (this.config.onStateChange) {
        this.config.onStateChange(newState);
      }
    }
  }

  /**
   * Handle error
   */
  private handleError(error: string): void {
    this.session.error = error;
    this.updateState("error");
    if (this.config.onError) {
      this.config.onError(error);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const message: ClientMessage = { action: "ping" };
      this.send(message);
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (!this.config.autoReconnect) {
      return;
    }

    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 3)) {
      console.error("❌ Max reconnection attempts reached");
      this.handleError("Failed to reconnect to server");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error("❌ Reconnection failed:", error);
      });
    }, delay);
  }

  /**
   * Get current state
   */
  getState(): VoiceState {
    return this.state;
  }

  /**
   * Get current session
   */
  getSession(): Partial<VoiceSession> {
    return this.session;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Check if ready to send audio
   */
  isReady(): boolean {
    return this.state === "ready";
  }
}

/**
 * Create voice WebSocket instance
 */
export const createVoiceWebSocket = (config: VoiceWebSocketConfig) => {
  return new VoiceWebSocket(config);
};
```

#### Step 4: Create React Hook

**File: `src/hooks/useVoiceChat.ts`**

```typescript
/**
 * Voice Chat Hook
 * React hook for managing voice chat functionality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createVoiceWebSocket, VoiceWebSocket } from "@/lib/tutor-ai/voiceWebSocket";
import { createAudioRecorder, AudioRecorder } from "@/lib/tutor-ai/audioRecorder";
import type { ServerEvent, VoiceState, VoiceSession } from "@/types/voice";

export interface UseVoiceChatConfig {
  wsUrl: string;
  threadId: string;
  autoConnect?: boolean;
  onTranscription?: (text: string) => void;
  onResponse?: (text: string) => void;
  onAudioReady?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
}

export interface UseVoiceChatReturn {
  // State
  state: VoiceState;
  session: Partial<VoiceSession>;
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  playAudio: (base64Audio: string, format: "wav" | "mp3") => void;
  stopAudio: () => void;
  
  // Data
  transcribedText: string | null;
  aiResponse: string | null;
  error: string | null;
}

export function useVoiceChat(config: UseVoiceChatConfig): UseVoiceChatReturn {
  // State
  const [state, setState] = useState<VoiceState>("idle");
  const [session, setSession] = useState<Partial<VoiceSession>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const wsRef = useRef<VoiceWebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Handle WebSocket events
   */
  const handleEvent = useCallback(
    (event: ServerEvent) => {
      switch (event.event) {
        case "initialized":
          console.log("✅ Session initialized:", event.thread_id);
          break;

        case "stt_complete":
          console.log("🎧 Transcription:", event.text);
          setTranscribedText(event.text);
          if (config.onTranscription) {
            config.onTranscription(event.text);
          }
          break;

        case "rag_complete":
          console.log("🧠 AI Response:", event.text);
          setAiResponse(event.text);
          if (config.onResponse) {
            config.onResponse(event.text);
          }
          break;

        case "tts_complete":
          console.log("🔊 Audio ready:", event.format);
          playAudio(event.audio, event.format);
          break;

        case "done":
          console.log("✅ Processing complete:", event.duration);
          break;

        case "error":
          console.error("❌ Error:", event.message);
          setError(event.message);
          if (config.onError) {
            config.onError(event.message);
          }
          break;
      }
    },
    [config]
  );

  /**
   * Handle state changes
   */
  const handleStateChange = useCallback((newState: VoiceState) => {
    setState(newState);
  }, []);

  /**
   * Handle errors
   */
  const handleError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      if (config.onError) {
        config.onError(errorMessage);
      }
    },
    [config]
  );

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async () => {
    try {
      // Create WebSocket if not exists
      if (!wsRef.current) {
        wsRef.current = createVoiceWebSocket({
          url: config.wsUrl,
          threadId: config.threadId,
          onEvent: handleEvent,
          onStateChange: handleStateChange,
          onError: handleError,
        });
      }

      // Connect
      await wsRef.current.connect();
      
      // Update session
      setSession(wsRef.current.getSession());
    } catch (error) {
      console.error("❌ Connection failed:", error);
      handleError("Failed to connect to server");
    }
  }, [config.wsUrl, config.threadId, handleEvent, handleStateChange, handleError]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setState("idle");
    setSession({});
  }, []);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      // Check if ready
      if (!wsRef.current || !wsRef.current.isReady()) {
        handleError("Not connected to server");
        return;
      }

      // Create audio recorder if not exists
      if (!recorderRef.current) {
        recorderRef.current = createAudioRecorder();
      }

      // Start recording
      await recorderRef.current.startRecording();
      setIsRecording(true);
      setTranscribedText(null);
      setAiResponse(null);
      setError(null);
    } catch (error) {
      console.error("❌ Recording failed:", error);
      handleError("Failed to start recording");
    }
  }, [handleError]);

  /**
   * Stop recording and send audio
   */
  const stopRecording = useCallback(async () => {
    try {
      if (!recorderRef.current || !wsRef.current) {
        return;
      }

      // Stop recording
      const audioBlob = await recorderRef.current.stopRecording();
      setIsRecording(false);

      // Convert to base64
      const base64Audio = await recorderRef.current.blobToBase64(audioBlob);

      // Send to server
      wsRef.current.sendAudio(base64Audio);
    } catch (error) {
      console.error("❌ Failed to stop recording:", error);
      handleError("Failed to process recording");
    }
  }, [handleError]);

  /**
   * Play audio response
   */
  const playAudio = useCallback(
    (base64Audio: string, format: "wav" | "mp3") => {
      try {
        // Create audio element if not exists
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        // Convert base64 to blob
        if (!recorderRef.current) {
          recorderRef.current = createAudioRecorder();
        }
        const mimeType = format === "wav" ? "audio/wav" : "audio/mpeg";
        const audioBlob = recorderRef.current.base64ToBlob(base64Audio, mimeType);

        // Create object URL and play
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        audioRef.current.play();

        // Callback
        if (config.onAudioReady) {
          config.onAudioReady(audioBlob);
        }

        // Cleanup on end
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      } catch (error) {
        console.error("❌ Failed to play audio:", error);
        handleError("Failed to play audio");
      }
    },
    [config, handleError]
  );

  /**
   * Stop audio playback
   */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (config.autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
      stopAudio();
    };
  }, [config.autoConnect]); // Only on mount

  // Update session when WebSocket session changes
  useEffect(() => {
    if (wsRef.current) {
      const interval = setInterval(() => {
        setSession(wsRef.current!.getSession());
      }, 100);
      return () => clearInterval(interval);
    }
  }, [state]);

  return {
    // State
    state,
    session,
    isRecording,
    isProcessing: state === "processing",
    isSpeaking: state === "speaking",

    // Actions
    connect,
    disconnect,
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,

    // Data
    transcribedText,
    aiResponse,
    error,
  };
}
```

#### Step 5: Update TalkingMode Component

**File: `src/components/tutor-ai/TalkingMode.tsx`** (Updated)

```typescript
/**
 * Talking Mode Component
 * Immersive voice interface with WebSocket integration
 */

'use client';

import { X, Mic, MicOff, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Aurora from './Aurora';
import { useVoiceChat } from '@/hooks/useVoiceChat';

interface TalkingModeProps {
  onClose: () => void;
  userName?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  threadId: string; // Add thread ID prop
}

export default function TalkingMode({ 
  onClose, 
  userName = 'User', 
  theme, 
  onToggleTheme,
  threadId 
}: TalkingModeProps) {
  const isDark = theme === 'dark';

  // Voice chat hook
  const {
    state,
    isRecording,
    isProcessing,
    isSpeaking,
    transcribedText,
    aiResponse,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  } = useVoiceChat({
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/ws/voice',
    threadId: threadId,
    autoConnect: true,
    onTranscription: (text) => {
      console.log('Transcription:', text);
    },
    onResponse: (text) => {
      console.log('AI Response:', text);
    },
    onError: (error) => {
      console.error('Voice chat error:', error);
    },
  });

  // Determine orb state based on voice state
  const getOrbState = (): 'idle' | 'listening' | 'speaking' => {
    if (isRecording) return 'listening';
    if (isSpeaking) return 'speaking';
    if (isProcessing) return 'listening';
    return 'idle';
  };

  const orbState = getOrbState();

  // Handle recording toggle
  const handleMicToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden animate-fade-in transition-colors duration-500 ${isDark ? 'bg-[#0a0e17]' : 'bg-gray-50'}`}>
      {/* Animated Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-500 animate-blob ${isDark ? 'bg-blue-900/20' : 'bg-blue-200/40'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-500 animate-blob animation-delay-2000 ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-200/40'}`} />
        <div className={`absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-500 animate-blob animation-delay-4000 ${isDark ? 'bg-cyan-900/15' : 'bg-cyan-200/30'}`} />
      </div>

      {/* Header Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-full transition-all backdrop-blur-sm ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-gray-900'}`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-all backdrop-blur-sm ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-gray-900'}`}
          aria-label="Close talking mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6">
        {/* Aurora Orb */}
        <div className="mb-12">
          <Aurora state={orbState} theme={theme} />
        </div>

        {/* Status Text */}
        <div className="text-center mb-8">
          <p className={`text-xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isRecording && 'Listening...'}
            {isProcessing && 'Processing...'}
            {isSpeaking && 'Speaking...'}
            {state === 'ready' && !isRecording && !isProcessing && !isSpeaking && 'Ready to listen'}
            {state === 'connecting' && 'Connecting...'}
            {state === 'error' && 'Connection Error'}
          </p>
          
          {/* Transcribed Text */}
          {transcribedText && (
            <p className={`text-sm mb-4 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You said: "{transcribedText}"
            </p>
          )}
          
          {/* AI Response Text */}
          {aiResponse && !isSpeaking && (
            <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {aiResponse}
            </p>
          )}
          
          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 mb-4">
              Error: {error}
            </p>
          )}
        </div>

        {/* Microphone Button */}
        <button
          onClick={handleMicToggle}
          disabled={state === 'connecting' || state === 'processing'}
          className={`
            relative group p-8 rounded-full transition-all duration-300 transform hover:scale-105
            ${isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
              : isDark
              ? 'bg-white/10 hover:bg-white/20 backdrop-blur-md'
              : 'bg-white/80 hover:bg-white shadow-lg'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <MicOff className={`w-8 h-8 ${isDark ? 'text-white' : 'text-white'}`} />
          ) : (
            <Mic className={`w-8 h-8 ${isDark ? 'text-white' : 'text-gray-900'}`} />
          )}
          
          {/* Pulsing ring effect when recording */}
          {isRecording && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse" />
            </>
          )}
        </button>

        <p className={`mt-6 text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {isRecording ? 'Click to stop recording' : 'Click to start talking'}
        </p>
      </div>
    </div>
  );
}
```

#### Step 6: Update Main Page to Pass Thread ID

**File: `src/app/tutor-ai/page.tsx`** (Update)

Add thread ID prop to TalkingMode:

```typescript
{showTalkingMode && (
  <TalkingMode
    onClose={handleToggleTalkingMode}
    userName="Student"
    theme={theme}
    onToggleTheme={toggleTheme}
    threadId={activeRoomId} // Pass active room ID as thread ID
  />
)}
```

#### Step 7: Add Environment Variables

**File: `.env.local`**

```bash
# WebSocket URL (Development)
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/ws/voice

# WebSocket URL (Production)
# NEXT_PUBLIC_WS_URL=wss://your-production-domain.com/api/ws/voice

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 7. Code Examples

### 7.1 Complete Integration Example

**Usage in Component:**

```typescript
import { useVoiceChat } from '@/hooks/useVoiceChat';

function VoiceComponent({ threadId }: { threadId: string }) {
  const {
    state,
    isRecording,
    transcribedText,
    aiResponse,
    startRecording,
    stopRecording,
  } = useVoiceChat({
    wsUrl: process.env.NEXT_PUBLIC_WS_URL!,
    threadId: threadId,
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

### 7.2 Manual WebSocket Usage

```typescript
import { createVoiceWebSocket } from '@/lib/tutor-ai/voiceWebSocket';
import { createAudioRecorder } from '@/lib/tutor-ai/audioRecorder';

async function manualVoiceChat(threadId: string) {
  // Create WebSocket
  const ws = createVoiceWebSocket({
    url: 'ws://localhost:8000/api/ws/voice',
    threadId: threadId,
    onEvent: (event) => {
      console.log('Event:', event);
    },
  });

  // Connect
  await ws.connect();

  // Create recorder
  const recorder = createAudioRecorder();

  // Start recording
  await recorder.startRecording();

  // Wait 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Stop recording
  const audioBlob = await recorder.stopRecording();
  const base64Audio = await recorder.blobToBase64(audioBlob);

  // Send audio
  ws.sendAudio(base64Audio);

  // Disconnect later
  setTimeout(() => {
    ws.disconnect();
  }, 10000);
}
```

### 7.3 Testing WebSocket Connection

```typescript
// Simple connection test
async function testConnection() {
  const ws = new WebSocket('ws://localhost:8000/api/ws/voice');

  ws.onopen = () => {
    console.log('✅ Connected');
    
    // Send init
    ws.send(JSON.stringify({
      action: 'init',
      thread_id: 'test-123',
      audio_format: 'wav',
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📥 Received:', data);
  };

  ws.onerror = (error) => {
    console.error('❌ Error:', error);
  };

  ws.onclose = () => {
    console.log('🔌 Disconnected');
  };
}
```

---

## 8. Error Handling

### 8.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection refused` | Backend not running | Start backend server |
| `Microphone access denied` | User denied permission | Request permission again |
| `Invalid audio format` | Wrong audio encoding | Use WAV format only |
| `Session not initialized` | Forgot to send init | Send init action first |
| `WebSocket disconnected` | Network issue | Implement auto-reconnect |

### 8.2 Error Handling Best Practices

```typescript
// 1. Always wrap WebSocket calls in try-catch
try {
  await voiceChat.connect();
} catch (error) {
  console.error('Connection failed:', error);
  // Show user-friendly error message
}

// 2. Handle microphone permissions
try {
  await recorder.startRecording();
} catch (error) {
  if (error.message.includes('denied')) {
    alert('Please allow microphone access');
  }
}

// 3. Monitor connection state
useEffect(() => {
  if (state === 'error') {
    // Show error UI
    // Attempt reconnection
  }
}, [state]);

// 4. Timeout for long operations
const timeout = setTimeout(() => {
  if (isProcessing) {
    console.warn('Processing timeout');
    // Handle timeout
  }
}, 30000); // 30 seconds

// 5. Validate data before sending
if (base64Audio && base64Audio.length > 0) {
  ws.sendAudio(base64Audio);
} else {
  console.error('Invalid audio data');
}
```

---

## 9. Testing Guidelines

### 9.1 Unit Testing

**Test Audio Recorder:**

```typescript
describe('AudioRecorder', () => {
  it('should start recording', async () => {
    const recorder = createAudioRecorder();
    await recorder.startRecording();
    expect(recorder.isRecording()).toBe(true);
  });

  it('should convert blob to base64', async () => {
    const recorder = createAudioRecorder();
    const blob = new Blob(['test'], { type: 'audio/wav' });
    const base64 = await recorder.blobToBase64(blob);
    expect(base64).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});
```

**Test WebSocket:**

```typescript
describe('VoiceWebSocket', () => {
  it('should connect successfully', async () => {
    const ws = createVoiceWebSocket({
      url: 'ws://localhost:8000/api/ws/voice',
      threadId: 'test-123',
    });
    await ws.connect();
    expect(ws.isConnected()).toBe(true);
    ws.disconnect();
  });

  it('should send audio data', async () => {
    const ws = createVoiceWebSocket({
      url: 'ws://localhost:8000/api/ws/voice',
      threadId: 'test-123',
    });
    await ws.connect();
    ws.sendAudio('dGVzdA=='); // base64 for "test"
    expect(ws.getState()).toBe('processing');
    ws.disconnect();
  });
});
```

### 9.2 Integration Testing

**Test Complete Flow:**

```typescript
describe('Voice Chat Flow', () => {
  it('should complete full voice interaction', async () => {
    const events: ServerEvent[] = [];
    
    const voiceChat = useVoiceChat({
      wsUrl: 'ws://localhost:8000/api/ws/voice',
      threadId: 'test-123',
      autoConnect: true,
      onEvent: (event) => events.push(event),
    });

    // Wait for connection
    await waitFor(() => expect(voiceChat.state).toBe('ready'));

    // Start recording
    await voiceChat.startRecording();
    expect(voiceChat.isRecording).toBe(true);

    // Wait and stop
    await new Promise(r => setTimeout(r, 2000));
    await voiceChat.stopRecording();

    // Wait for processing
    await waitFor(() => expect(voiceChat.state).toBe('ready'), {
      timeout: 30000,
    });

    // Verify events
    expect(events).toContainEqual(expect.objectContaining({ event: 'stt_complete' }));
    expect(events).toContainEqual(expect.objectContaining({ event: 'rag_complete' }));
    expect(events).toContainEqual(expect.objectContaining({ event: 'tts_complete' }));
    expect(events).toContainEqual(expect.objectContaining({ event: 'done' }));
  });
});
```

### 9.3 Manual Testing Checklist

- [ ] Backend server running on `http://localhost:8000`
- [ ] WebSocket accessible at `ws://localhost:8000/api/ws/voice`
- [ ] Microphone permission granted in browser
- [ ] Audio recording works (can see waveform/level indicator)
- [ ] Audio sent successfully (check browser DevTools → Network → WS)
- [ ] Transcription received and displayed
- [ ] AI response received and displayed
- [ ] Audio playback works
- [ ] Error handling works (disconnect backend, deny mic, etc.)
- [ ] Reconnection works after disconnect
- [ ] Multiple sessions work (different thread IDs)

---

## 10. Troubleshooting

### 10.1 Connection Issues

**Problem**: WebSocket fails to connect

```bash
# Check backend is running
curl http://localhost:8000/health

# Check WebSocket endpoint
wscat -c ws://localhost:8000/api/ws/voice

# Check CORS settings in backend
# File: app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 10.2 Audio Issues

**Problem**: No audio recorded

```javascript
// Check browser support
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.error('MediaDevices API not supported');
}

// Check microphone permission
navigator.permissions.query({ name: 'microphone' }).then((result) => {
  console.log('Microphone permission:', result.state);
});

// Test microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('❌ Microphone access denied:', error);
  });
```

**Problem**: Audio playback fails

```javascript
// Check audio format support
const audio = new Audio();
console.log('WAV support:', audio.canPlayType('audio/wav'));
console.log('MP3 support:', audio.canPlayType('audio/mpeg'));

// Try playing with autoplay policy
audio.play().catch(error => {
  console.error('Autoplay blocked:', error);
  // Show "Click to play" button
});
```

### 10.3 Performance Issues

**Problem**: High latency or slow processing

```javascript
// Monitor processing times
const startTime = Date.now();

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.event === 'done') {
    const totalTime = Date.now() - startTime;
    console.log('Total processing time:', totalTime, 'ms');
    console.log('Backend duration:', data.duration, 's');
    console.log('Network overhead:', totalTime - (data.duration * 1000), 'ms');
  }
};

// Optimize audio size
// - Reduce sample rate to 16kHz
// - Use mono instead of stereo
// - Compress audio if possible
```

### 10.4 Debug Logging

```typescript
// Enable verbose logging
const DEBUG = true;

function log(category: string, message: string, data?: any) {
  if (!DEBUG) return;
  
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${category}] ${message}`, data || '');
}

// Usage
log('WS', 'Connecting to', wsUrl);
log('Audio', 'Recording started');
log('Event', 'Received', event);
```

---

## 11. Deployment Considerations

### 11.1 Environment Configuration

**Development:**
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/ws/voice
```

**Production:**
```bash
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/api/ws/voice
```

### 11.2 Security

- Use WSS (WebSocket Secure) in production
- Implement authentication (JWT tokens)
- Validate all client inputs
- Rate limit connections
- Sanitize audio data

### 11.3 Scaling

- Use load balancer with sticky sessions
- Implement connection pooling
- Monitor WebSocket connections
- Set max connections per server
- Use Redis for session management

---

## 12. Additional Resources

### 12.1 Documentation Links

- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [MediaRecorder API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### 12.2 Testing Tools

- [wscat](https://github.com/websockets/wscat) - WebSocket CLI client
- [websocat](https://github.com/vi/websocat) - WebSocket CLI tool
- Browser DevTools → Network → WS tab

### 12.3 Example Audio Files

For testing, use:
- Sample rate: 16000 Hz
- Format: WAV (PCM)
- Duration: 3-5 seconds
- Content: Clear speech

---

## 13. Conclusion

This documentation provides a complete guide for integrating the WebSocket voice endpoint with the frontend. Follow the implementation steps carefully, ensure proper error handling, and test thoroughly before deployment.

**Key Takeaways:**
1. WebSocket protocol is event-based and bidirectional
2. Audio must be WAV format, base64-encoded
3. State management is crucial for UX
4. Error handling and reconnection logic are essential
5. Testing should cover both unit and integration scenarios

**Next Steps:**
1. Implement type definitions
2. Create audio recorder utility
3. Build WebSocket manager
4. Develop React hook
5. Update TalkingMode component
6. Test thoroughly
7. Deploy to production

Good luck with the integration! 🚀
