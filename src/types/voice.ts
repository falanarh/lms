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
  format: "wav";
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
  audioFormat?: "wav";
  error?: string;
  duration?: number;
}
