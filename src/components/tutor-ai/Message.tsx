/**
 * Individual Message Component
 * Perfect WhatsApp/iMessage-style with tail
 */

'use client';

import { Message as MessageType } from '@/types/tutor-ai';
import { Bot, User, Check, CheckCheck, Moon, BookOpen, Lightbulb, Globe } from 'lucide-react';
import { BsMoonFill } from "react-icons/bs";

interface MessageProps {
  message: MessageType;
  theme: 'light' | 'dark';
}

export default function Message({ message, theme }: MessageProps) {
  const isUser = message.role === 'user';
  const hasSources = message.sources && message.sources.length > 0;
  const isDark = theme === 'dark';

  const timestamp = new Date(message.timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
      {/* Message bubble dengan tail WhatsApp/iMessage style */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full md:max-w-[75%] lg:max-w-[65%]`}>
        <div className="relative w-full">
          {/* Message content */}
          <div
            className={`px-4 py-2.5 relative transition-colors duration-300 w-full ${isUser
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : isDark
                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                : 'bg-white text-gray-900 border border-gray-200'
              }`}
            style={{
              borderRadius: '14px',
            }}
          >
            {hasSources ? (
              <div className="space-y-4">
                {/* Sources Section */}
                <div>
                  <div className={`flex items-center gap-2 mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    <BookOpen className="w-4 h-4" />
                    <span>Sources</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar max-w-full">
                    {message.sources?.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-shrink-0 w-40 md:w-48 p-3 border rounded-xl transition-colors text-left group/card ${isDark
                          ? 'bg-gray-700/50 hover:bg-gray-700 border-gray-600'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                          }`}
                      >
                        <p className={`text-xs font-medium line-clamp-2 mb-2 group-hover/card:text-blue-600 transition-colors ${isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                          {source.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Globe className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{source.domain}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Answer Section */}
                <div className="w-full min-w-0">
                  <div className={`flex items-center gap-2 mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    <Lightbulb className="w-4 h-4" />
                    <span>Answer</span>
                  </div>
                  <p className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words min-w-0 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                    {message.content}
                  </p>
                </div>
              </div>
            ) : (
              /* Regular Message */
              <p className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words ${isUser ? 'text-white' : (isDark ? 'text-gray-200' : 'text-gray-800')
                }`}>
                {message.content}
              </p>
            )}

            {/* Timestamp and status */}
            <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[11px] ${isUser ? 'text-blue-100' : 'text-gray-400'
                }`}>
                {timestamp}
              </span>
              {isUser && (
                <CheckCheck className="w-3.5 h-3.5 text-blue-100" strokeWidth={2.5} />
              )}
            </div>
          </div>

          {/* Tail SVG - positioned at bottom corner */}
          <div
            className={`absolute bottom-[1px] ${isUser ? '-right-[14px]' : '-left-[13.5px]'} w-6 h-6`}
            style={{
              transform: isUser ? 'none' : 'scaleX(-1)',
              rotate: isUser ? '48deg' : '-48deg',
            }}
          >
            <div className="relative">
              <BsMoonFill
                className={`w-full h-full transition-colors duration-300 ${isUser
                  ? 'text-blue-600 fill-blue-600'
                  : isDark
                    ? 'text-gray-800 fill-gray-800 stroke-gray-700'
                    : 'text-white fill-white stroke-gray-200'
                  }`}
                style={{
                  clipPath: 'inset(65% 0 0 50%)',
                  strokeWidth: isUser ? 0 : 0.55,
                }}
              />
              {!isUser && (
                <div className={`absolute w-2 h-2 -bottom-[2px] left-[6px] rounded-full transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'
                  }`}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
