"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronsRight, Edit2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Forum } from "./ForumList";

export interface ForumCardProps {
  forum: Forum;
  className?: string;
  onEdit?: (forum: Forum) => void;
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

const TYPE_META: Record<Forum["type"], { label: string; bgColor: string; accent: string; image: string }> = {
  course: {
    label: "Course Forum",
    bgColor: "bg-blue-50",
    accent: "var(--color-primary,#2563eb)",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&crop=center",
  },
  general: {
    label: "General Forum",
    bgColor: "bg-green-50",
    accent: "var(--success,#16a34a)",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop&crop=center",
  },
};

export function ForumCard({ forum, className, onEdit }: ForumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const meta = TYPE_META[forum.type];

  const handleForumClick = () => {
    router.push(`/forum/${forum.id}`);
  };

  return (
    <article
      className={[
        "bg-white overflow-hidden cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:-translate-y-1",
        "rounded-2xl shadow-[0px_0px_1px_0px_rgba(12,26,75,0.24),0px_3px_8px_-1px_rgba(50,50,71,0.05)]",
        "h-full flex flex-col",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleForumClick}
    >
      {/* Card Image */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={meta.image}
          alt={forum.title}
          className={`w-full h-full object-cover rounded-t-2xl transition-transform duration-300 ease-out ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        {/* Type badge overlay on image */}
        <Badge
          className="absolute top-4 right-4 font-semibold"
          style={{
            backgroundColor: meta.accent,
            color: 'white',
            borderColor: 'transparent'
          }}
        >
          {meta.label}
        </Badge>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col h-full">
        {/* Title */}
        <h3 className="font-semibold text-base leading-[1.36] overflow-hidden font-inter mb-4" style={{
          color: "#16192C",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical"
        }}>
          {forum.title}
        </h3>

        {/* Description - Flexible height */}
        {forum.description && (
          <div className="flex-1 mb-4">
            <p className="leading-relaxed text-sm font-inter overflow-hidden" style={{
              color: "#425466",
              lineHeight: "23px",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical"
            }}>
              {forum.description}
            </p>
          </div>
        )}

        {/* Spacer for cards without description */}
        {!forum.description && (
          <div className="flex-1 mb-4"></div>
        )}

        {/* Stats - Fixed position */}
        <div className="flex items-center gap-6 text-sm mb-10">
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: "#16192C" }}>
              {forum.totalTopics} topics
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#425466" }}>
              {timeAgo(forum.lastActivity)}
            </span>
          </div>
        </div>

        {/* CTA Button - Fixed at bottom */}
        <div className="flex justify-start mt-auto">
          <Button
            rightIcon={<ChevronsRight className="w-5 h-5 mt-1 -ml-1 group-hover:translate-x-1 transition-transform" />}
            className="group font-medium"
            style={{
              backgroundColor: meta.accent,
              borderColor: meta.accent
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleForumClick();
            }}
          >
            Lihat forum
          </Button>
          {onEdit && (
            <Button
              leftIcon={<Edit2 className="w-4 h-4 text-gray-600" />}
              variant="outline"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 ml-2 w-10 h-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(forum);
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export default ForumCard;