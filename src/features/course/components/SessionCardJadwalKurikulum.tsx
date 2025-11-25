"use client";
/**
 * Komponen: SessionCard
 * Tujuan: Card untuk menampilkan informasi session/kelas dengan status, materi, dan info detail.
 *
 * Ringkasan
 * - Styling: Tailwind CSS dengan color coding berdasarkan status (upcoming, ongoing, completed).
 * - Status Badge: Visual indicator untuk status session dengan warna berbeda.
 * - Materials: Menampilkan list materi dengan ikon dan ukuran file.
 * - Info Grid: Tanggal, durasi, dan instruktur dalam grid 3 kolom.
 * - Hover Effect: Card elevation dan color transition.
 *
 * Import
 * ```tsx
 * import { SessionCard } from "@/components/SessionCard";
 * ```
 *
 * Props
 * - title: string — judul session (wajib)
 * - topic: string — topik/subjek session (wajib)
 * - status: "upcoming" | "ongoing" | "completed" — status session (wajib)
 * - date: string — tanggal session
 * - duration: string — durasi session
 * - instructor: string — nama instruktur
 * - materials: Material[] — array materi yang tersedia
 * - icon?: React.ReactNode — custom icon (default: Calendar)
 * - onClick?: () => void — callback saat card diklik
 * - className?: string — kelas tambahan untuk container
 *
 * Material Interface
 * - type: "pdf" | "video" | "doc" | "ppt"
 * - title: string
 * - size: string (contoh: "2.4 MB")
 *
 * Contoh Penggunaan
 * ```tsx
 * <SessionCard
 *   title="Introduction to React"
 *   topic="Frontend Development"
 *   status="upcoming"
 *   date="15 Nov 2024"
 *   duration="2 jam"
 *   instructor="John Doe"
 *   materials={[
 *     { type: "pdf", title: "Slide Materi", size: "2.4 MB" },
 *     { type: "video", title: "Recording", size: "145 MB" }
 *   ]}
 * />
 * ```
 */
import React from "react";
import { Calendar, Clock, GraduationCap, FileText, Video } from "lucide-react";

export type SessionStatus = "upcoming" | "ongoing" | "completed";
export type MaterialType = "pdf" | "video" | "doc" | "ppt";

export interface Material {
  type: MaterialType;
  title: string;
  size: string;
}

export interface SessionCardProps {
  title: string;
  topic: string;
  status: SessionStatus;
  date?: string;
  duration?: string;
  instructor?: string;
  materials?: Material[];
  jp?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<
  SessionStatus,
  {
    label: string;
    badge: string;
    text: string;
    iconBg: string;
  }
> = {
  upcoming: {
    label: "Akan Datang",
    badge: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  ongoing: {
    label: "Berlangsung",
    badge: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
    text: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
  completed: {
    label: "Selesai",
    badge: "bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-600",
    text: "text-gray-600 dark:text-zinc-400 dark:text-zinc-400",
    iconBg: "bg-gray-100 dark:bg-zinc-700/50",
  },
};

const materialConfig: Record<
  MaterialType,
  {
    icon: typeof FileText;
    color: string;
    bg: string;
    border: string;
  }
> = {
  pdf: {
    icon: FileText,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-800",
  },
  video: {
    icon: Video,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  doc: {
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  ppt: {
    icon: FileText,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/30",
    border: "border-orange-200 dark:border-orange-800",
  },
};

export const SessionCard = React.forwardRef<HTMLDivElement, SessionCardProps>(
  function SessionCard(
    {
      title,
      topic,
      status,
      date,
      duration,
      instructor,
      materials = [],
      jp,
      icon,
      onClick,
      className,
    },
    ref,
  ) {
    const colors = statusConfig[status];
    const IconComponent = icon || (
      <Calendar className={`size-6 ${colors.text}`} />
    );

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={[
          "relative p-6",
          "bg-white dark:bg-zinc-800",
          "border border-gray-200 dark:border-zinc-700",
          "rounded-xl",
          "transition-all duration-200",
          "hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-600",
          "group",
          onClick ? "cursor-pointer" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {/* Icon */}
              <div
                className={[
                  "size-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  colors.iconBg,
                ].join(" ")}
              >
                {IconComponent}
              </div>

              {/* Title & Topic */}
              <div className="flex-1 min-w-0">
                <h5
                  className={[
                    "mb-1 font-semibold text-gray-900 dark:text-zinc-100 truncate",
                    "transition-colors",
                    onClick ? "group-hover:text-purple-600" : "",
                  ].join(" ")}
                >
                  {title}
                </h5>
                <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">{topic}</p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={[
              "px-3 py-1 rounded-lg text-xs font-medium border",
              "capitalize flex-shrink-0 ml-3",
              colors.badge,
              colors.text,
            ].join(" ")}
          >
            {colors.label}
          </span>

          {jp && (
            <span className="text-purple-700 dark:text-purple-400 font-medium px-3 py-1 rounded-lg text-xs font-medium border capitalize flex-shrink-0 ml-3">
              {jp} JP
            </span>
          )}
        </div>

        {(date || duration || instructor || jp) && (
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-zinc-700">
            {date && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <Calendar className="size-4 flex-shrink-0" />
                <span className="truncate">{date}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <Clock className="size-4 flex-shrink-0" />
                <span className="truncate">{duration}</span>
              </div>
            )}
            {instructor && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <GraduationCap className="size-4 flex-shrink-0" />
                <span className="truncate">{instructor}</span>
              </div>
            )}
          </div>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              Materi Tersedia:
            </p>
            <div className="flex flex-wrap gap-2">
              {materials.map((material, idx) => {
                const config = materialConfig[material.type];
                const Icon = config.icon;

                return (
                  <div
                    key={idx}
                    className={[
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                      "transition-colors",
                      config.bg,
                      config.border,
                    ].join(" ")}
                  >
                    <Icon className={`size-4 flex-shrink-0 ${config.color}`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                      {material.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">
                      ({material.size})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty Materials State */}
        {materials.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">Belum ada materi tersedia</p>
          </div>
        )}
      </div>
    );
  },
);

export default SessionCard;
