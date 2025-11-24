/**
 * Main Chat Interface Component
 * Premium "Floating Dock" design with warm/natural aesthetics
 */

'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types/tutor-ai';
import Message from './Message';
import MessageInput from './MessageInput';
import { MessageSquare, Sparkles, Headphones, Sun, Moon } from 'lucide-react';

interface ChatInterfaceProps {
  messages: MessageType[];
  activeRoomTitle: string | null;
  onSendMessage: (content: string) => void;
  isTyping: boolean;
  onToggleTalkingMode: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function ChatInterface({
  messages,
  activeRoomTitle,
  onSendMessage,
  isTyping,
  onToggleTalkingMode,
  theme,
  onToggleTheme,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  return (
    <div className={`flex-1 flex flex-col relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50/75'}`}>

      {/* Premium Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex justify-center pointer-events-none">
        <header className={`
          pointer-events-auto
          w-full max-w-5xl
          rounded-2xl
          border
          backdrop-blur-xl
          shadow-lg
          transition-all duration-300
          flex items-center justify-between
          px-3 py-2 md:px-4 md:py-3
          ${isDark
            ? 'bg-[#2c2c2e]/80 border-white/10 shadow-black/40'
            : 'bg-white/80 border-stone-200/50 shadow-stone-200/40'
          }
        `}>
          {/* Left: Identity */}
          <div className="flex items-center gap-2 md:gap-3.5">
            {/* Abstract Avatar - Warm/Natural Tone */}
            <div className={`
              w-8 h-8 md:w-10 md:h-10 rounded-xl rotate-3 
              flex items-center justify-center
              shadow-sm
              transition-transform duration-300 hover:rotate-0
              ${isDark
                ? 'bg-gradient-to-br from-amber-700 to-orange-900'
                : 'bg-gradient-to-br from-amber-200 to-orange-100'
              }
            `}>
              <div className={`
                w-1.5 h-1.5 md:w-2 md:h-2 rounded-full
                ${isDark ? 'bg-orange-200' : 'bg-orange-500'}
              `} />
              <div className={`
                w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ml-0.5 mb-1.5 md:mb-2
                ${isDark ? 'bg-amber-200' : 'bg-amber-600'}
              `} />
            </div>

            <div className="flex flex-col">
              <h1 className={`
                text-xs md:text-sm font-bold tracking-wide
                ${isDark ? 'text-stone-200' : 'text-stone-800'}
              `}>
                {activeRoomTitle || 'Study Mate'}
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={`
                  w-1.5 h-1.5 rounded-full animate-pulse
                  ${isDark ? 'bg-emerald-500' : 'bg-emerald-600'}
                `}></span>
                <span className={`
                  text-[10px] font-medium tracking-wider uppercase
                  ${isDark ? 'text-stone-500' : 'text-stone-400'}
                `}>
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 pl-2 md:pl-4 border-l border-stone-200/10 dark:border-white/5">
            <button
              onClick={onToggleTheme}
              className={`
                p-1.5 md:p-2 rounded-lg transition-all duration-200
                ${isDark
                  ? 'text-stone-400 hover:text-stone-100 hover:bg-white/5'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }
              `}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onToggleTalkingMode}
              className={`
                flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg transition-all duration-200 ml-1
                ${isDark
                  ? 'bg-white/5 hover:bg-white/10 text-stone-200'
                  : 'bg-stone-100 hover:text-stone-900 hover:bg-stone-200 text-stone-600'
                }
              `}
              title="Voice Mode"
            >
              <Headphones className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Voice</span>
            </button>
          </div>
        </header>
      </div>

      {/* Messages area with custom scrollbar */}
      {/* Added pt-28 to account for floating header */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 md:px-6 pt-24 md:pt-28 pb-32 relative z-0 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-4">
          {messages.length === 0 ? (
            // Clean empty state
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center max-w-md">
                <div className="relative inline-block mb-6">
                  <div className={`
                    w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl
                    ${isDark
                      ? 'bg-gradient-to-br from-stone-800 to-stone-700 shadow-black/30'
                      : 'bg-white shadow-stone-200/50'
                    }
                  `}>
                    <MessageSquare className={`w-10 h-10 ${isDark ? 'text-stone-400' : 'text-stone-300'}`} strokeWidth={1.5} />
                  </div>
                </div>

                <h2 className={`text-2xl font-bold mb-2 tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-stone-800'}`}>
                  Hello, Student
                </h2>
                <p className={`mb-8 text-sm transition-colors duration-300 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  I'm your personal study companion. <br className="hidden sm:block" />
                  Ready to learn something new?
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { text: 'See what I can do', emoji: '✨' },
                    { text: 'Jelaskan konsep machine learning', emoji: '🤖' },
                    { text: 'Cara kerja blockchain?', emoji: '⛓️' },
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(example.text)}
                      className={`group px-4 py-3 border rounded-xl text-sm transition-all duration-200 text-left shadow-sm hover:shadow-md flex items-center gap-3 ${isDark
                        ? 'bg-[#2c2c2e] hover:bg-[#3a3a3c] border-white/5 hover:border-white/10 text-stone-200'
                        : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900'
                        }`}
                    >
                      <span className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">{example.emoji}</span>
                      <span className="font-medium">{example.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <Message key={message.id} message={message} theme={theme} />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2 items-end animate-fade-in">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-[#2c2c2e]' : 'bg-white border border-stone-100'}`}>
                    <Sparkles className={`w-4 h-4 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
                  </div>
                  <div className={`border px-4 py-3 rounded-2xl shadow-sm ${isDark ? 'bg-[#2c2c2e] border-white/5' : 'bg-white border-stone-100'
                    }`}>
                    <div className="flex gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-stone-500' : 'bg-stone-400'}`} style={{ animationDelay: '0s' }} />
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-stone-500' : 'bg-stone-400'}`} style={{ animationDelay: '0.15s' }} />
                      <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-stone-500' : 'bg-stone-400'}`} style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Modern input area */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <MessageInput onSendMessage={onSendMessage} disabled={isTyping} theme={theme} />
      </div>
    </div>
  );
}
