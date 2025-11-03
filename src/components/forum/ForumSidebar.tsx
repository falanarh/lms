import React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Clock, ChevronsRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatTimeAgo } from "@/utils/timeUtils";
import type { Forum } from "@/api/forums";

interface ForumSidebarProps {
  forums: Forum[];
  currentForumId: string;
  onForumClick: (forumId: string) => void;
  isLoading?: boolean;
}

export function ForumSidebar({ forums, currentForumId, onForumClick, isLoading = false }: ForumSidebarProps) {
  const router = useRouter();

  // Filter out current forum dan sort yang lain
  const otherForums = forums
    .filter(f => f.id !== currentForumId)
    .slice(0, 8); // Show max 8 forums

  return (
    <div className="sticky top-8 space-y-6">
      {/* Forums Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Forum Lainnya
          </h3>
          <p className="text-sm text-gray-600 mt-1">Jelajahi diskusi di forum lain</p>
        </div>

        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            // Loading skeleton
            [...Array(5)].map((_, index) => (
              <div key={index} className="p-3 rounded-lg bg-gray-50 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : otherForums.length > 0 ? (
            otherForums.map((forum) => (
              <button
                key={forum.id}
                onClick={() => onForumClick(forum.id)}
                className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        forum.type === 'course'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {forum.type === 'course' ? 'Course' : 'General'}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-5">
                      {forum.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-4">
                      {forum.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{forum.totalTopics} topik</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(forum.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronsRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Tidak ada forum lain tersedia</p>
            </div>
          )}
        </div>

        {forums.length > 8 && (
          <div className="p-4 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              onClick={() => router.push('/forum')}
            >
              Lihat Semua Forum →
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Forum Aktif</h4>
            <p className="text-xs text-gray-600">Statistik minggu ini</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{forums.length}</div>
            <div className="text-xs text-gray-600">Total Forum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {forums.reduce((sum, f) => sum + f.totalTopics, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Topik</div>
          </div>
        </div>
      </div>
    </div>
  );
}