/**
 * Talking Mode Component
 * Immersive voice interface with glowing orb animation
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
  threadId: string;
}

export default function TalkingMode({ onClose, userName = 'User', theme, onToggleTheme, threadId }: TalkingModeProps) {
  // Voice chat hook integration
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
    threadId: "13679bd8-fb87-443f-979e-08d87fed1121", // threadId, // Use static threadId temporarily
    autoConnect: true,
    onTranscription: (text) => console.log('Transcription:', text),
    onResponse: (text) => console.log('AI Response:', text),
    onError: (error) => console.error('Voice chat error:', error),
  });

  // Map voice state to orb state
  const getOrbState = (): 'idle' | 'listening' | 'speaking' => {
    if (isRecording) return 'listening';
    if (isSpeaking) return 'speaking';
    if (isProcessing) return 'listening'; // Use listening visual for processing too
    return 'idle';
  };

  const orbState = getOrbState();
  const isDark = theme === 'dark';

  // Determine Aurora visuals based on state and theme
  const getAuroraProps = () => {
    let colorStops = ['#1D4ED8', '#BBF7D0', '#FEF9C3']; // Default Blue/Indigo
    let amplitude = 1.0;
    let speed = 1.0;

    if (orbState === 'listening') {
      // Red/Orange for listening
      colorStops = isDark
        ? ["#7F1D1D", "#DC2626", "#FCA5A5"]
        : ["#FCA5A5", "#EF4444", "#991B1B"];
      amplitude = 1.5;
      speed = 2.0;
    } else if (orbState === 'speaking') {
      // Green/Cyan for speaking
      colorStops = isDark
        ? ["#064E3B", "#10B981", "#6EE7B7"]
        : ["#6EE7B7", "#10B981", "#065F46"];
      amplitude = 1.2;
      speed = 1.5;
    } else {
      // Idle Blue/Indigo
      colorStops = isDark
        ? ["#1E3A8A", "#3B82F6", "#93C5FD"]
        : ["#BFDBFE", "#3B82F6", "#1E40AF"];
      amplitude = 0.8;
      speed = 0.5;
    }

    return { colorStops, amplitude, speed };
  };

  const auroraProps = getAuroraProps();

  // Handle mic toggle
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
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden animate-fade-in transition-colors duration-500 ${isDark ? 'bg-[#0a0e17]' : 'bg-gray-50'
      }`}>
      {/* Animated Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Animated gradient blobs */}
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-500 animate-blob ${isDark ? 'bg-blue-900/20' : 'bg-blue-200/40'
          }`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-500 animate-blob animation-delay-2000 ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-200/40'
          }`} />
        <div className={`absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-500 animate-blob animation-delay-4000 ${isDark ? 'bg-cyan-900/15' : 'bg-cyan-200/30'
          }`} />

        {/* Floating color orbs */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-xl animate-float" />
        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl animate-float animation-delay-2000" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl animate-float animation-delay-4000" />
      </div>

      {/* Header Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-full transition-all backdrop-blur-sm ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-900'
            }`}
        >
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-all backdrop-blur-sm ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-900'
            }`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-6 text-center">

        {/* Glowing Orb with Aurora Gradient Animation */}
        <div className="relative mb-12">
          {/* Animated background glow */}
          <div className={`absolute inset-[-30px] rounded-full blur-3xl opacity-60 animate-pulse-slow ${isDark
            ? 'bg-gradient-to-br from-cyan-500/40 via-blue-500/40 to-indigo-600/40'
            : 'bg-gradient-to-br from-cyan-400/30 via-blue-400/30 to-indigo-500/30'
            }`} />

          {/* Core with Aurora gradient */}
          <div className={`relative w-48 h-48 rounded-full shadow-lg transition-all duration-1000 overflow-hidden ${isDark
            ? 'shadow-blue-500/50'
            : 'shadow-blue-400/30'
            } ${orbState === 'listening' ? 'scale-100' :
              orbState === 'speaking' ? 'scale-110 animate-pulse-slow' : 'scale-95 opacity-80'
            }`}>

            {/* Base dark layer */}
            <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-blue-950' : 'bg-blue-100'}`} />

            {/* Aurora Layer 1 - Flowing wave */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <Aurora
                colorStops={auroraProps.colorStops}
                amplitude={auroraProps.amplitude}
                blend={0.5}
                speed={auroraProps.speed}
              />
            </div>

            {/* Aurora Layer 2 - Counter wave */}
            <div className="hidden" />

            {/* Aurora Layer 3 - Vertical sweep */}
            <div className="hidden" />

            {/* Aurora Layer 4 - Radial pulse */}
            <div className="hidden" />

            {/* Aurora Layer 5 - Diagonal flow */}
            <div className="hidden" />

            {/* Color overlay for richness */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br opacity-30 ${isDark
              ? 'from-blue-500 via-emerald-300 to-amber-200'
              : 'from-blue-400 via-emerald-300 to-amber-200'
              }`} />

            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-cyan-200/10" />
          </div>

          {/* Outer Glow Rings */}
          <div className={`absolute inset-[-20px] rounded-full border transition-all duration-1000 ${isDark ? 'border-cyan-500/30' : 'border-cyan-400/30'
            } ${orbState === 'listening' ? 'scale-110 opacity-100 animate-ping-slow' : 'scale-100 opacity-0'
            }`} />
          <div className={`absolute inset-[-40px] rounded-full border transition-all duration-1000 delay-75 ${isDark ? 'border-blue-500/20' : 'border-blue-400/20'
            } ${orbState === 'listening' ? 'scale-110 opacity-100 animate-ping-slow' : 'scale-100 opacity-0'
            }`} />
        </div>

        {/* Text Prompts */}
        <h2 className={`text-2xl md:text-3xl font-medium mb-3 tracking-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'
          }`}>
          {isRecording ? `I'm listening, ${userName}...` :
            isProcessing ? 'Processing...' :
              isSpeaking ? 'Speaking...' :
                error ? 'Something went wrong' :
                  'Tap microphone to speak'}
        </h2>
        <p className={`text-lg transition-colors duration-500 ${isDark ? 'text-blue-200/60' : 'text-gray-500'
          }`}>
          {transcribedText ? `"${transcribedText}"` :
            aiResponse && !isSpeaking ? aiResponse :
              error ? error :
                "What's on your mind?"}
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
        <div className={`flex items-center gap-4 p-2 rounded-full backdrop-blur-md border transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/40 border-gray-200/50 shadow-sm'
          }`}>
          <button
            onClick={onClose}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
              }`}
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={handleMicToggle}
            disabled={state === 'connecting' || state === 'processing'}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording
              ? (isDark ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20')
              : (isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
              } ${state === 'connecting' || state === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes aurora-1 {
          0% { background-position: 0% 0%; transform: translateX(0) translateY(0); }
          25% { background-position: 50% 50%; transform: translateX(10px) translateY(-10px); }
          50% { background-position: 100% 100%; transform: translateX(0) translateY(-20px); }
          75% { background-position: 50% 50%; transform: translateX(-10px) translateY(-10px); }
          100% { background-position: 0% 0%; transform: translateX(0) translateY(0); }
        }

        @keyframes aurora-2 {
          0% { background-position: 100% 100%; transform: translateX(0) translateY(-20px); }
          25% { background-position: 50% 50%; transform: translateX(-10px) translateY(-10px); }
          50% { background-position: 0% 0%; transform: translateX(0) translateY(0); }
          75% { background-position: 50% 50%; transform: translateX(10px) translateY(-10px); }
          100% { background-position: 100% 100%; transform: translateX(0) translateY(-20px); }
        }

        @keyframes aurora-3 {
          0% { background-position: 50% 0%; }
          50% { background-position: 50% 100%; }
          100% { background-position: 50% 0%; }
        }

        @keyframes aurora-pulse {
          0%, 100% {
            background-position: 50% 50%;
            background-size: 100% 100%;
            opacity: 0.5;
          }
          50% {
            background-position: 50% 50%;
            background-size: 150% 150%;
            opacity: 0.3;
          }
        }

        @keyframes aurora-diagonal {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }

        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-aurora-1 {
          animation: aurora-1 12s ease-in-out infinite;
        }

        .animate-aurora-2 {
          animation: aurora-2 15s ease-in-out infinite;
        }

        .animate-aurora-3 {
          animation: aurora-3 10s ease-in-out infinite;
        }

        .animate-aurora-pulse {
          animation: aurora-pulse 8s ease-in-out infinite;
        }

        .animate-aurora-diagonal {
          animation: aurora-diagonal 14s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}

