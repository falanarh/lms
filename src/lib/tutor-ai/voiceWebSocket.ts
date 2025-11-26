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
