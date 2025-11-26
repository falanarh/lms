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
  playAudio: (base64Audio: string, format: "wav") => void;
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
    (base64Audio: string, format: "wav") => {
      try {
        // Create audio element if not exists
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        // Convert base64 to blob
        if (!recorderRef.current) {
          recorderRef.current = createAudioRecorder();
        }
        const mimeType = "audio/wav";
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
