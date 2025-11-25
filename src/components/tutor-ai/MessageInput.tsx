/**
 * Message Input Component
 * Floating design inspired by Slothpilot
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Mic } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  theme: 'light' | 'dark';
}

export default function MessageInput({ onSendMessage, disabled, theme }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = theme === 'dark';

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="relative z-10 px-4 pb-6">
      {/* Solid background for bottom area */}
      <div
        className={`absolute left-0 right-0 bottom-0 -z-10 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
          }`}
        style={{ top: '32px' }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Floating input container */}
        <div className={`backdrop-blur-md rounded-[28px] shadow-lg border px-3 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3 transition-colors duration-300 ${isDark
          ? 'bg-gray-800/80 border-gray-700/50'
          : 'bg-white/80 border-gray-200/50'
          }`}>
          {/* Paperclip icon */}
          <button
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${isDark
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            aria-label="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Message to AI Tutor..."
              disabled={disabled}
              rows={1}
              className={`w-full px-2 py-2 bg-transparent border-0 resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-32 overflow-y-auto text-[15px] transition-colors duration-300 ${isDark
                ? 'text-gray-100 placeholder:text-gray-500'
                : 'text-gray-900 placeholder:text-gray-500'
                }`}
              style={{
                minHeight: '24px',
              }}
            />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Emoji button */}
            <button
              className={`p-2 rounded-full transition-colors ${isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              aria-label="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Mic button */}
            <button
              className={`p-2 rounded-full transition-colors ${isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              aria-label="Voice message"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Send button */}
            {message.trim() && (
              <button
                onClick={handleSend}
                disabled={disabled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center gap-2 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                aria-label="Send message"
              >
                Send
                <Send className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer text */}
        <p className={`text-center text-xs mt-2 transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
          TutorAI can make mistakes. Check our Terms & Conditions.
        </p>
      </div>
    </div>
  );
}
