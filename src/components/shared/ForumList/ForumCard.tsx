"use client";

import React from "react";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Clock4, MessagesSquare, Users } from "lucide-react";
import { Forum } from "./ForumList";

export interface ForumCardProps {
  forum: Forum;
  className?: string;
}

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

export function ForumCard({ forum, className }: ForumCardProps) {
  const meta = TYPE_META[forum.type];
  const accentColor = meta.accent;
  const isCourseForum = meta.tone === "primary";

  return (
    <article
      className={[
        "relative w-full overflow-hidden",
        "bg-white",
        "border border-gray-100",
        "rounded-xl",
        "shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:border-gray-200 hover:-translate-y-1",
        "group",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Top accent bar */}
      <div 
        className="absolute left-0 top-0 right-0 h-1" 
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="flex flex-col h-full p-6">
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              {isCourseForum ? (
                <Users className="w-5 h-5" style={{ color: accentColor }} />
              ) : (
                <MessagesSquare className="w-5 h-5" style={{ color: accentColor }} />
              )}
            </div>
            <div>
              <Badge 
                size="sm" 
                variant="secondary"
                className="font-medium text-xs uppercase tracking-wider"
              >
                {isCourseForum ? "Course" : "General"}
              </Badge>
              <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                <Clock4 className="w-3 h-3" />
                <span>{timeAgo(forum.lastActivity)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card content */}
        <div className="flex flex-col flex-grow">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-[var(--color-primary,#2563eb)] transition-colors duration-200 leading-tight mb-3">
            {forum.title}
          </h3>
          
          {/* Description */}
          {forum.description && (
            <p className="text-sm leading-relaxed text-gray-600 mb-6 line-clamp-2">
              {forum.description}
            </p>
          )}

          {/* Stats and action section */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div 
                className="px-3 py-1.5 rounded-full flex items-center gap-2"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="font-medium text-sm" style={{ color: accentColor }}>
                  {forum.totalTopics} Topik
                </span>
              </div>
            </div>
            
            <Button
              rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />}
              size="sm"
              variant="ghost"
              className="group font-medium text-sm hover:bg-transparent hover:text-[var(--color-primary,#2563eb)]"
            >
              Lihat Forum
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ForumCard;