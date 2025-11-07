"use client";
/**
 * Komponen: ActivityCard
 * Tujuan: Card item untuk menampilkan materi pembelajaran (PDF, Video, Doc, PPT) dengan ikon dan info.
 *
 * Ringkasan
 * - Styling: Tailwind CSS dengan color coding otomatis berdasarkan tipe material.
 * - Material Types: Support PDF, Video, Doc, PPT dengan ikon dan warna berbeda.
 * - Badge: Menampilkan tipe file dalam badge kecil.
 * - Action Button: Opsional tombol download/view di sisi kanan.
 * - Hover Effect: Subtle hover untuk interaktivitas.
 *
 * Import
 * ```tsx
 * import { ActivityCard } from "@/components/ActivityCard";
 * ```
 *
 * Props
 * - title: string — nama/judul material (wajib)
 * - type: "pdf" | "video" | "doc" | "ppt" — tipe material (wajib)
 * - size: string — ukuran file (contoh: "2.4 MB")
 * - description?: string — deskripsi tambahan material
 * - onAction?: () => void — callback saat tombol action diklik
 * - actionLabel?: string — label tombol action (default: "Lihat")
 * - showAction?: boolean — tampilkan tombol action (default: false)
 * - className?: string — kelas tambahan untuk container
 *
 * Contoh Penggunaan
 * ```tsx
 * // Basic - tanpa action
 * <ActivityCard
 *   title="Slide Pengantar Next.js"
 *   type="pdf"
 *   size="2.4 MB"
 * />
 *
 * // Dengan action button
 * <ActivityCard
 *   title="Recording Sesi 1"
 *   type="video"
 *   size="145 MB"
 *   description="Durasi: 1 jam 30 menit"
 *   showAction
 *   actionLabel="Download"
 *   onAction={() => handleDownload('video-1.mp4')}
 * />
 *
 * // List dari session materials
 * {selectedSession.materials.map((material, index) => (
 *   <ActivityCard
 *     key={index}
 *     title={material.title}
 *     type={material.type}
 *     size={material.size}
 *     showAction
 *     onAction={() => handleViewMaterial(material.id)}
 *   />
 * ))}
 * ```
 *
 * CSS Variables yang digunakan (fallback tersedia):
 * - --surface, --border, --radius-lg
 * - --color-foreground, --color-foreground-muted
 */
import React from "react";
import { FileText, Video, Download, Eye, Link } from "lucide-react";

export type MaterialType = "PDF" | "VIDEO" | "LINK" | "SCORM";

export interface ActivityCardProps {
  title: string;
  type: MaterialType;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  showAction?: boolean;
  className?: string;
}

const materialConfig: Record<
  MaterialType,
  {
    icon: typeof FileText;
    color: string;
    bgColor: string;
    iconColor: string;
    label: string;
  }
> = {
  PDF: {
    icon: FileText,
    color: "green",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    label: "PDF",
  },
  VIDEO: {
    icon: Video,
    color: "blue",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    label: "VIDEO",
  },
  LINK: {
    icon: Link,
    color: "orange",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    label: "LINK",
  },
  SCORM: {
    icon: FileText,
    color: "yellow",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
    label: "SCORM",
  },
};

export const ActivityCard = React.forwardRef<HTMLDivElement, ActivityCardProps>(
  function ActivityCard(
    {
      title,
      type,
      description,
      onAction,
      actionLabel = "Lihat",
      showAction = false,
      className,
    },
    ref
  ) {
    const config = materialConfig[type];
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        className={[
          "p-4",
          "bg-[var(--surface,white)]",
          "border border-[var(--border,rgba(0,0,0,0.12))]",
          "rounded-[var(--radius-lg,12px)]",
          "transition-all duration-200",
          "hover:shadow-sm hover:border-gray-300",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div
              className={[
                "size-10 rounded-lg flex items-center justify-center flex-shrink-0",
                config.bgColor,
              ].join(" ")}
            >
              <Icon className={`size-5 ${config.iconColor}`} />
            </div>

            {/* Title & Meta */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-500 truncate">
                {title}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* Type Badge */}
                <span
                  className={[
                    "px-2 py-0.5 rounded text-xs font-medium",
                    "border",
                    `border-${config.color}-200`,
                    `bg-${config.color}-50`,
                    `text-${config.color}-700`,
                  ].join(" ")}
                >
                  {config.label}
                </span>

                {/* Optional Description */}
                {description && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-[var(--color-foreground-muted,#6b7280)]">
                      {description}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Button */}
          {showAction && onAction && (
            <button
              onClick={onAction}
              className={[
                "flex items-center gap-2 px-3 py-2",
                "rounded-lg text-sm font-medium",
                "transition-colors flex-shrink-0",
                "text-gray-700 hover:text-gray-900",
                "bg-gray-100 hover:bg-gray-200",
                "focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)]",
                "focus-visible:ring-offset-2",
              ].join(" ")}
              aria-label={`${actionLabel} ${title}`}
            >
              {actionLabel === "Download" ? (
                <Download className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              <span className="hidden sm:inline">{actionLabel}</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default ActivityCard;