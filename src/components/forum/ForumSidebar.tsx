import React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Clock, ChevronsRight, TrendingUp, Users, Activity } from "lucide-react";
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

  const totalTopics = forums.reduce((sum, f) => sum + f.totalTopics, 0);
  const activeForumsCount = forums.filter(f =>
    new Date(f.lastActivity).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="sticky top-8 space-y-6">
      {/* Forums Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Forum Lainnya</h3>
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
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 relative"
              >
                <div className="flex items-start justify-between">
                  {/* Main content area */}
                  <div className="flex flex-col">
                    <h4 className="font-medium text-sm text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 leading-5 mb-1">
                      {forum.title}
                    </h4>

                    {forum.totalTopics > 10 && (
                      <div className="mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                          <Activity className="w-2.5 h-2.5 mr-1" />
                          Aktif
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-justify text-gray-600 mt-1 line-clamp-2 leading-4">
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

                  {/* Right side column with badge and arrow */}
                  <div className="flex flex-col justify-between items-end h-full min-h-[100px]">
                    {/* Course/General badge at top */}
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        forum.type === 'course'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {forum.type === 'course' ? 'Course' : 'General'}
                      </span>
                    </div>

                    {/* Double arrow icon at bottom */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronsRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm">Tidak ada forum lain tersedia</p>
            </div>
          )}
        </div>

        {forums.length > 8 && (
          <div className="p-4 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full text-center text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              onClick={() => router.push('/forum')}
            >
              Lihat Semua Forum
              <ChevronsRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Statistik Forum</h4>
            <p className="text-xs text-gray-600">Data saat ini</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xl font-semibold text-gray-900">{forums.length}</div>
            <div className="text-xs text-gray-600">Total Forum</div>
            {activeForumsCount > 0 && (
              <div className="text-xs text-green-600 mt-1">{activeForumsCount} aktif</div>
            )}
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xl font-semibold text-gray-900">{totalTopics}</div>
            <div className="text-xs text-gray-600">Total Topik</div>
            {totalTopics > 0 && (
              <div className="text-xs text-blue-600 mt-1">Tersedia</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <h4 className="font-semibold text-gray-900 text-sm mb-3">Navigasi Cepat</h4>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full text-left text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors justify-start"
            onClick={() => router.push('/forum')}
          >
            Daftar Forum
          </Button>
          <Button
            variant="ghost"
            className="w-full text-left text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors justify-start"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Kembali ke Atas
          </Button>
        </div>
      </div>
    </div>
  );
}