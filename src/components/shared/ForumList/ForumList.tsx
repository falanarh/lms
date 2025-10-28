"use client";

import React from "react";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChevronsRight, Clock4, MessagesSquare, LayoutGrid, List, Grid } from "lucide-react";
import ForumCard from "./ForumCard";

export type Forum = {
  id: string;
  title: string;
  description?: string;
  type: "course" | "general";
  /** ISO 8601 date string */
  lastActivity: string;
  totalTopics: number;
};

export type ViewMode = "list" | "card" | "grid";

export interface ForumListProps {
  forum: Forum;
  className?: string;
  viewMode?: ViewMode;
}

export interface ForumListContainerProps {
  forums: Forum[];
  className?: string;
}

const TYPE_META: Record<Forum["type"], { label: string; accent: string; tone: "primary" | "success" }> = {
  course: {
    label: "Course Forum",
    accent: "var(--color-primary,#2563eb)",
    tone: "primary",
  },
  general: {
    label: "General Forum",
    accent: "var(--success,#16a34a)",
    tone: "success",
  },
};

// Helper to format date difference
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds} detik lalu`;
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}

export function ForumList({ forum, className, viewMode = "card" }: ForumListProps) {
  const meta = TYPE_META[forum.type];
  const accentColor = meta.accent;

  // Card view (original design)
  if (viewMode === "card") {
    return (
      <article
        className={[
          "relative w-full overflow-hidden",
          "grid grid-cols-12 gap-0",
          "bg-gradient-to-br from-gray-50 to-white",
          "border border-gray-100",
          "rounded-lg",
          "transition-all duration-300 ease-out",
          "hover:scale-[1.01] hover:shadow-xl",
          "group",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Left accent bar with icon */}
        <div 
          className="col-span-1 flex flex-col items-center justify-between py-6"
          style={{ backgroundColor: accentColor, color: 'white' }}
        >
          <ThreadsIcon className="w-6 h-6 mt-2" />
          <div className="h-16 w-px bg-white/30 my-auto"></div>
          <div className="rotate-180 [writing-mode:vertical-lr] text-xs font-medium tracking-wider opacity-80 mb-2">
            {meta.label}
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-span-11 p-5 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-[var(--color-primary,#2563eb)] transition-colors duration-200">
                  {forum.title}
                </h3>
                <span className="text-xs text-gray-400 font-mono">#{forum.id}</span>
              </div>
              
              {forum.description && (
                <p className="text-sm leading-relaxed text-gray-600 line-clamp-2 mt-2 pr-4">
                  {forum.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-end">
              <Badge size="sm" variant="soft" tone={meta.tone} className="font-medium uppercase tracking-wider text-[0.65rem]">
                {meta.tone === "primary" ? "Active" : "Community"}
              </Badge>
            </div>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="relative">
                  <span className="absolute inset-0 opacity-30 rounded-md" style={{ backgroundColor: accentColor }}></span>
                  <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-50 border border-gray-300" aria-hidden="true">
                    <MessagesSquare className="w-3.5 h-3.5" />
                  </span>
                </div>
                <span className="font-mono">
                  <span className="font-bold">{forum.totalTopics}</span> Topik
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-50 border border-gray-300" aria-hidden="true">
                  <Clock4 className="w-3.5 h-3.5" />
                </span>
                <span className="font-mono">{timeAgo(forum.lastActivity)}</span>
              </div>
            </div>

            <Button
              rightIcon={<ChevronsRight className="w-5 h-5 mt-1 -ml-1 group-hover:translate-x-1 transition-transform" />}
              className="group font-medium"
              style={{ 
                backgroundColor: accentColor,
                borderColor: accentColor
              }}
            >
              Lihat forum
            </Button>
          </div>
        </div>
      </article>
    );
  }
  
  // List view (simplified horizontal layout)
  return (
    <article
      className={[
        "relative w-full overflow-hidden",
        "flex items-center justify-between",
        "bg-white",
        "border border-gray-100",
        "rounded-lg p-4",
        "transition-all duration-300 ease-out",
        "hover:bg-gray-50",
        "group",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-4">
        <div 
          className="flex-shrink-0 w-2 h-12 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--color-primary,#2563eb)] transition-colors duration-200">
              {forum.title}
            </h3>
            <Badge size="sm" variant="soft" tone={meta.tone} className="font-medium uppercase tracking-wider text-[0.65rem]">
              {meta.tone === "primary" ? "Active" : "Community"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <MessagesSquare className="w-3 h-3" />
              <span>{forum.totalTopics} Topik</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock4 className="w-3 h-3" />
              <span>{timeAgo(forum.lastActivity)}</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        rightIcon={<ChevronsRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        size="sm"
        className="group font-medium"
        style={{ 
          backgroundColor: accentColor,
          borderColor: accentColor
        }}
      >
        Lihat
      </Button>
    </article>
  );
}

// Container component with view toggle
export function ForumListContainer({ forums, className }: ForumListContainerProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("card");
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Forum Diskusi</h2>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
          <button
            className={`p-2 rounded ${viewMode === "card" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setViewMode("card")}
            aria-label="Tampilan Card"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setViewMode("grid")}
            aria-label="Tampilan Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setViewMode("list")}
            aria-label="Tampilan List"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forums.map((forum) => (
            <ForumCard key={forum.id} forum={forum} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {forums.map((forum) => (
            <ForumList key={forum.id} forum={forum} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ForumList;

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20a1 1 0 0 1-1-1v-3h10l3 3H8Z" fill="currentColor" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
