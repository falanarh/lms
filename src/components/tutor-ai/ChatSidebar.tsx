/**
 * Chat Sidebar Component
 * Modern redesign with floating card aesthetic
 */

'use client';

import { ChatRoom, UserProfile } from '@/types/tutor-ai';
import { Plus, MessageSquare, Trash2, X, Search, Sparkles, CircleHelp, Bot } from 'lucide-react';
import { TbLayoutSidebarLeftCollapseFilled, TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";

interface ChatSidebarProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  onDeleteRoom: (roomId: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  theme: 'light' | 'dark';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user: UserProfile;
}

export default function ChatSidebar({
  rooms,
  activeRoomId,
  onSelectRoom,
  onCreateRoom,
  onDeleteRoom,
  isMobileOpen,
  onMobileClose,
  theme,
  isCollapsed = false,
  onToggleCollapse,
  user,
}: ChatSidebarProps) {
  const isDark = theme === 'dark';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours}j`;
    if (diffInHours < 48) return 'Kemarin';
    const days = Math.floor(diffInHours / 24);
    if (days < 7) return `${days}h`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-80'} max-w-[85vw] border-r flex flex-col transition-all duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none backdrop-blur-xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDark
            ? 'bg-gray-900 border-gray-800'
            : 'bg-gray-50 border-gray-200'
          }`}
      >
        {/* Modern header with glass effect */}
        <div className="p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                {/* <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Bot className="w-5 h-5 text-white" />
                </div> */}
                <h2 className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>TutorAI</h2>
              </div>
            )}

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Toggle */}
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className={`hidden lg:flex p-2 rounded-xl transition-all ${isDark
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-100'
                    : 'hover:bg-white/80 text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {isCollapsed ? <TbLayoutSidebarLeftCollapseFilled className="w-6 h-6" /> : <TbLayoutSidebarRightCollapseFilled className="w-6 h-6" />}
                </button>
              )}

              {/* Mobile Close */}
              <button className={`p-2 rounded-xl transition-all lg:hidden ${isDark
                ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-100'
                : 'hover:bg-white/60 text-gray-500 hover:text-gray-900'
                }`}>
                <X className="w-5 h-5" onClick={onMobileClose} />
              </button>
            </div>
          </div>

          {/* New chat button - Gradient & Floating */}
          <button
            onClick={() => {
              onCreateRoom();
              onMobileClose();
            }}
            className={`group w-full flex items-center justify-center gap-2 ${isCollapsed ? 'px-0 py-3.5' : 'px-4 py-3.5'} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 font-medium hover:-translate-y-0.5`}
            title="New Chat"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
            {!isCollapsed && <span>Obrolan Baru</span>}
          </button>

          {/* Search bar - Minimalist */}
          {!isCollapsed && (
            <div className="relative mt-4 group">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark
                ? 'text-gray-500 group-focus-within:text-blue-400'
                : 'text-gray-400 group-focus-within:text-blue-500'
                }`} />
              <input
                type="text"
                placeholder="Cari percakapan..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:ring-blue-500/20 focus:border-blue-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
              />
            </div>
          )}
        </div>

        {/* Chat list - Floating Cards */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 custom-scrollbar">
          {rooms.length === 0 ? (
            !isCollapsed && (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className={`w-16 h-16 rounded-2xl shadow-sm border flex items-center justify-center mb-4 transition-colors duration-300 ${isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-100'
                  }`}>
                  <MessageSquare className={`w-7 h-7 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                </div>
                <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}>Belum ada riwayat</p>
                <p className={`text-xs leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Mulai percakapan baru untuk menyimpan riwayat chat Anda di sini
                </p>
              </div>
            )
          ) : (
            <>
              {!isCollapsed && (
                <div className={`sticky top-0 z-20 px-2 py-2 mb-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 backdrop-blur-xl ${isDark
                  ? 'text-gray-500 bg-gray-900/90'
                  : 'text-gray-400 bg-gray-50/90'
                  }`}>
                  Baru Saja
                </div>
              )}
              {rooms.map((room) => {
                const isActive = room.id === activeRoomId;
                return (
                  <div
                    key={room.id}
                    className={`group relative transition-all duration-200 rounded-2xl ${isActive
                      ? isDark
                        ? 'bg-gray-800 shadow-md shadow-blue-900/10 ring-1 ring-blue-500/20 z-10'
                        : 'bg-white shadow-md shadow-blue-900/5 ring-1 ring-blue-500/10 z-10'
                      : isDark
                        ? 'hover:bg-gray-800 hover:shadow-sm hover:ring-1 hover:ring-gray-700/50'
                        : 'hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200/50'
                      }`}
                  >
                    <button
                      onClick={() => {
                        onSelectRoom(room.id);
                        onMobileClose();
                      }}
                      className={`w-full text-left ${isCollapsed ? 'p-3 flex justify-center' : 'p-3.5 pr-10'}`}
                      title={isCollapsed ? room.title : undefined}
                    >
                      {isCollapsed ? (
                        <MessageSquare className={`w-5 h-5 ${isActive ? 'text-blue-600' : (isDark ? 'text-gray-400' : 'text-gray-500')}`} />
                      ) : (
                        <div className="flex items-start gap-3">
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`text-sm font-semibold truncate transition-colors ${isActive
                                ? 'text-blue-600'
                                : isDark
                                  ? 'text-gray-100 group-hover:text-white'
                                  : 'text-gray-900 group-hover:text-gray-900'
                                }`}>
                                {room.title}
                              </h3>
                              <span className={`text-[10px] flex-shrink-0 font-medium px-1.5 py-0.5 rounded-md transition-colors duration-300 ${isDark
                                ? 'text-gray-500 bg-gray-700/50'
                                : 'text-gray-400 bg-gray-50'
                                }`}>
                                {formatDate(room.lastMessageAt)}
                              </span>
                            </div>
                            <p className={`text-xs truncate transition-colors ${isActive
                              ? 'text-blue-600/70'
                              : isDark
                                ? 'text-gray-400'
                                : 'text-gray-500'
                              }`}>
                              {isActive ? 'Sedang aktif...' : 'Tap untuk membuka'}
                            </p>
                          </div>
                        </div>
                      )}
                    </button>

                    {/* Delete button - Only visible on hover/active and when not collapsed */}
                    {!isCollapsed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Hapus obrolan ini?')) {
                            onDeleteRoom(room.id);
                          }
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 ${isActive
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Help & FAQ */}
        <div className={`px-4 py-2 mt-auto border-t transition-colors duration-300 ${isDark ? 'border-gray-800/50' : 'border-gray-200/50'}`}>
          <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all duration-200 group ${isDark
            ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
            title="Help & FAQ"
          >
            <CircleHelp className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Help & FAQ</span>}
          </button>
        </div>

        {/* User Profile Footer */}
        <div className={`p-4 border-t backdrop-blur-sm transition-colors duration-300 ${isDark
          ? 'border-gray-800/50 bg-gray-900/50'
          : 'border-gray-200/50 bg-white/50'
          }`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-sm shadow-sm ring-2 ring-white/20">
              {getInitials(user.name)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate transition-colors ${isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                  {user.name}
                </p>
                <p className={`text-xs truncate transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
