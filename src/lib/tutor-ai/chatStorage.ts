/**
 * Local storage utilities for AI Tutor chat persistence
 */

import { ChatRoom, Message } from '@/types/tutor-ai';

const STORAGE_KEYS = {
  ROOMS: 'tutor-ai-rooms',
  MESSAGES: 'tutor-ai-messages',
  ACTIVE_ROOM: 'tutor-ai-active-room',
};

export const chatStorage = {
  // Rooms
  getRooms(): ChatRoom[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return data ? JSON.parse(data) : [];
  },

  saveRooms(rooms: ChatRoom[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  },

  addRoom(room: ChatRoom): void {
    const rooms = this.getRooms();
    rooms.unshift(room);
    this.saveRooms(rooms);
  },

  deleteRoom(roomId: string): void {
    const rooms = this.getRooms().filter((r) => r.id !== roomId);
    this.saveRooms(rooms);
    
    // Also delete messages for this room
    const messages = this.getAllMessages();
    delete messages[roomId];
    this.saveAllMessages(messages);
  },

  updateRoomTitle(roomId: string, title: string): void {
    const rooms = this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.title = title;
      this.saveRooms(rooms);
    }
  },

  updateRoomLastMessage(roomId: string): void {
    const rooms = this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.lastMessageAt = new Date().toISOString();
      this.saveRooms(rooms);
    }
  },

  // Messages
  getAllMessages(): Record<string, Message[]> {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : {};
  },

  saveAllMessages(messages: Record<string, Message[]>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  getMessagesForRoom(roomId: string): Message[] {
    const allMessages = this.getAllMessages();
    return allMessages[roomId] || [];
  },

  addMessage(message: Message): void {
    const allMessages = this.getAllMessages();
    if (!allMessages[message.roomId]) {
      allMessages[message.roomId] = [];
    }
    allMessages[message.roomId].push(message);
    this.saveAllMessages(allMessages);
    this.updateRoomLastMessage(message.roomId);
  },

  // Active room
  getActiveRoomId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROOM);
  },

  setActiveRoomId(roomId: string | null): void {
    if (typeof window === 'undefined') return;
    if (roomId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROOM, roomId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROOM);
    }
  },

  // Clear all data
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROOM);
  },
};
