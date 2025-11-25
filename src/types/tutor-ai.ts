/**
 * Types for AI Tutor Chatbot
 */

export interface ChatRoom {
  id: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
}

export interface Source {
  title: string;
  url: string;
  domain: string;
}

export interface Message {
  id: string;
  roomId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  sources?: Source[];
}

export interface ChatState {
  rooms: ChatRoom[];
  messages: Record<string, Message[]>;
  activeRoomId: string | null;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string; // Optional, fallback to initials if not provided
}
