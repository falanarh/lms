/**
 * AI Tutor Chatbot Page
 * Clean, minimal chatbot interface inspired by Claude AI
 */

'use client';

import { useState, useEffect } from 'react';
import { ChatRoom, Message } from '@/types/tutor-ai';
import { chatStorage } from '@/lib/tutor-ai/chatStorage';
import ChatSidebar from '@/components/tutor-ai/ChatSidebar';
import ChatInterface from '@/components/tutor-ai/ChatInterface';
import { Menu } from 'lucide-react';
import TalkingMode from '@/components/tutor-ai/TalkingMode';

type ChatState = Record<string, Message[]>;

// Mock AI response generator (replace with actual API call later)
const generateAIResponse = (userMessage: string): Message => {
  // Demo for source-based response
  if (userMessage.toLowerCase().includes('android') || userMessage.toLowerCase().includes('dream')) {
    return {
      id: `msg-${Date.now()}-ai`,
      roomId: '', // Set by caller
      role: 'assistant',
      timestamp: new Date().toISOString(),
      content: `Current State of AI:
• Lack of Subjective Experience: Presently, AI lacks the capacity for subjective experience. While AI can process vast amounts of information and perform complex tasks, it doesn't have personal experiences or emotions.
• Mimicking Human Behavior: Some AI systems are designed to mimic human behavior, including aspects of creativity and association, but this mimicry doesn't equate to actual dreaming.

Future Possibilities:
• Advancements in AI: Future developments in AI and neuroscience might bring us closer to creating machines with more sophisticated forms of processing. However, the creation of genuine subjective experiences in machines remains speculative and raises profound ethical and philosophical questions.
• Artificial Consciousness Research: Research into artificial consciousness explores whether it might be possible to create machines that possess a form of self-awareness or subjective experience. If achieved, such machines might have the capability for experiences analogous to dreaming.

Conclusion:
From a current scientific and technological standpoint, androids do not dream of electric sheep. They lack the biological and neurological foundations required for dreaming as humans experience it.

However, advances in AI could potentially lead to systems that simulate aspects of dreaming or creativity, though these would still be fundamentally different from human dreams. The question remains a compelling intersection of philosophy, science fiction, and emerging technology.`,
      sources: [
        {
          title: 'Do androids dream of electric sheep?',
          url: 'https://www.philipkdick.com',
          domain: 'www.philipkdick.com'
        },
        {
          title: 'Androids explained: Why LLMS will rule the world',
          url: 'https://www.dailyllm.com',
          domain: 'www.dailyllm.com'
        },
        {
          title: 'View 87+ more external sources',
          url: '#',
          domain: 'View All Sources'
        }
      ]
    };
  }

  const responses = [
    `Terima kasih atas pertanyaan Anda tentang "${userMessage}". Saya akan dengan senang hati membantu menjelaskannya.`,
    `Itu pertanyaan yang bagus! Mengenai "${userMessage}", saya dapat memberikan penjelasan berikut...`,
    `Saya memahami Anda ingin tahu lebih lanjut tentang "${userMessage}". Mari kita bahas bersama.`,
  ];

  return {
    id: `msg-${Date.now()}-ai`,
    roomId: '', // Set by caller
    role: 'assistant',
    timestamp: new Date().toISOString(),
    content: responses[Math.floor(Math.random() * responses.length)]
  };
};

export default function TutorAIPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatState>({});
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isTalkingMode, setIsTalkingMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadedRooms = chatStorage.getRooms();
    setRooms(loadedRooms);

    if (loadedRooms.length > 0) {
      const initialRoomId = loadedRooms[0].id;
      setActiveRoomId(initialRoomId);
      chatStorage.setActiveRoomId(initialRoomId);

      // Load messages for all rooms
      const allMessages = chatStorage.getAllMessages();
      setMessages(allMessages);
    } else {
      // Create initial empty room if none exist
      handleCreateRoom();
    }
  }, []);

  const handleCreateRoom = () => {
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      title: `Chat ${rooms.length + 1}`,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };

    chatStorage.addRoom(newRoom);
    setRooms((prev) => [newRoom, ...prev]);
    setActiveRoomId(newRoom.id);
    chatStorage.setActiveRoomId(newRoom.id);
    setMessages((prev) => ({ ...prev, [newRoom.id]: [] }));
  };

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    chatStorage.setActiveRoomId(roomId);
  };

  const handleDeleteRoom = (roomId: string) => {
    chatStorage.deleteRoom(roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    setMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[roomId];
      return newMessages;
    });

    // If deleted room was active, switch to another room
    if (roomId === activeRoomId) {
      const remainingRooms = rooms.filter((r) => r.id !== roomId);
      if (remainingRooms.length > 0) {
        setActiveRoomId(remainingRooms[0].id);
        chatStorage.setActiveRoomId(remainingRooms[0].id);
      } else {
        setActiveRoomId(null);
        chatStorage.setActiveRoomId(null);
        handleCreateRoom();
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeRoomId) {
      handleCreateRoom();
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      roomId: activeRoomId,
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    // Add user message
    chatStorage.addMessage(userMessage);
    setMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), userMessage],
    }));

    // Update room title if it's the first message
    const currentMessages = messages[activeRoomId] || [];
    if (currentMessages.length === 0) {
      const newTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');
      chatStorage.updateRoomTitle(activeRoomId, newTitle);
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoomId ? { ...r, title: newTitle } : r))
      );
    }

    // Simulate AI typing
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Handle "See what I can do" demo trigger
    if (content === 'See what I can do') {
      const demoResponse1: Message = {
        id: `msg-${Date.now()}-demo-1`,
        roomId: activeRoomId,
        content: 'Halo! Saya adalah AI Tutor Anda. Saya bisa membantu menjelaskan berbagai topik pelajaran, menjawab pertanyaan, atau berdiskusi tentang materi akademik. Silakan tanya apa saja!',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      const demoResponse2: Message = {
        id: `msg-${Date.now()}-demo-2`,
        roomId: activeRoomId,
        content: `Current State of AI:
• Lack of Subjective Experience: Presently, AI lacks the capacity for subjective experience. While AI can process vast amounts of information and perform complex tasks, it doesn't have personal experiences or emotions.
• Mimicking Human Behavior: Some AI systems are designed to mimic human behavior, including aspects of creativity and association, but this mimicry doesn't equate to actual dreaming.

Future Possibilities:
• Advancements in AI: Future developments in AI and neuroscience might bring us closer to creating machines with more sophisticated forms of processing. However, the creation of genuine subjective experiences in machines remains speculative and raises profound ethical and philosophical questions.

Conclusion:
From a current scientific and technological standpoint, androids do not dream of electric sheep. They lack the biological and neurological foundations required for dreaming as humans experience it.`,
        role: 'assistant',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        sources: [
          {
            title: 'Do androids dream of electric sheep?',
            url: 'https://www.philipkdick.com',
            domain: 'www.philipkdick.com'
          },
          {
            title: 'Androids explained: Why LLMS will rule the world',
            url: 'https://www.dailyllm.com',
            domain: 'www.dailyllm.com'
          },
          {
            title: 'View 87+ more external sources',
            url: '#',
            domain: 'View All Sources'
          }
        ]
      };

      chatStorage.addMessage(demoResponse1);
      chatStorage.addMessage(demoResponse2);

      setMessages((prev) => ({
        ...prev,
        [activeRoomId]: [...(prev[activeRoomId] || []), demoResponse1, demoResponse2],
      }));

      setIsTyping(false);
      return;
    }

    // Create AI response
    const generatedMessage = generateAIResponse(content);
    const aiMessage: Message = {
      ...generatedMessage,
      roomId: activeRoomId,
      id: `msg-${Date.now()}-ai`, // Ensure unique ID
      timestamp: new Date().toISOString(),
    };

    // Add AI message
    chatStorage.addMessage(aiMessage);
    setMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), aiMessage],
    }));

    setIsTyping(false);
  };

  const activeRoomTitle = rooms.find((r) => r.id === activeRoomId)?.title || null;

  return (
    <div className={`flex h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Talking Mode Overlay */}
      {isTalkingMode && (
        <TalkingMode
          onClose={() => setIsTalkingMode(false)}
          userName="Student"
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      )}

      {/* Sidebar */}
      {!isTalkingMode && (
        <ChatSidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
          onDeleteRoom={handleDeleteRoom}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
          theme={theme}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={{
            name: "Haji Nawi",
            email: "hajinawi@gmail.com"
          }}
        />
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Mobile Header */}
        {!isTalkingMode && (
          <div className={`lg:hidden flex items-center p-4 border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 -ml-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className={`ml-3 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Tutor</span>
          </div>
        )}

        <ChatInterface
          messages={activeRoomId ? messages[activeRoomId] || [] : []}
          activeRoomTitle={activeRoomTitle}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          onToggleTalkingMode={() => setIsTalkingMode(true)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </div>
    </div>
  );
}
