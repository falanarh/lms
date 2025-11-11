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
import React, { useState } from "react";
import { FileText, Video, Download, Eye, Link, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type MaterialType = "PDF" | "VIDEO" | "LINK" | "SCORM";

export interface ActivityCardProps {
  title: string;
  type: MaterialType;
  contentUrl?: string;
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

const FileViewerModal = ({
  isOpen,
  onClose,
  url,
  title,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  type: MaterialType;
}) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`size-8 rounded-lg flex items-center justify-center ${materialConfig[type].bgColor}`}>
              {React.createElement(materialConfig[type].icon, {
                className: `size-4 ${materialConfig[type].iconColor}`,
              })}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">{type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {type !== "LINK" && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
          {type === "PDF" && (
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              <iframe
                src={url}
                className="w-full h-full"
                title={title}
              />
            </div>
          )}

          {type === "VIDEO" && (
            <div className="w-full">
              <video controls className="w-full rounded-lg shadow-lg">
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {type === "LINK" && (
            <div className="text-center py-12">
              <ExternalLink className="size-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">External Link</h4>
              <p className="text-gray-600 mb-6">Click the button below to open the link</p>
              <Button
                onClick={() => window.open(url, "_blank")}
                className="mx-auto"
              >
                <ExternalLink className="size-4 mr-2" />
                Open Link
              </Button>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto">
                <p className="text-xs text-gray-500 break-all">{url}</p>
              </div>
            </div>
          )}

          {type === "SCORM" && (
            <div className="text-center py-12">
              <FileText className="size-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">SCORM Package</h4>
              <p className="text-gray-600 mb-6">Download to view the SCORM content</p>
              <Button onClick={handleDownload}>
                <Download className="size-4 mr-2" />
                Download SCORM Package
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActivityCard = React.forwardRef<HTMLDivElement, ActivityCardProps>(
  function ActivityCard(
    {
      title,
      type,
      contentUrl,
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
    const [showViewer, setShowViewer] = useState(false);

    // ✅ Handle view action
    const handleView = () => {
      if (onAction) {
        onAction();
      } else if (contentUrl) {
        setShowViewer(true);
      }
    };

    // ✅ Handle download action
    const handleDownload = async () => {
      if (!contentUrl) return;
      
      try {
        const response = await fetch(contentUrl);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("Download error:", error);
        window.open(contentUrl, "_blank");
      }
    };

    return (
      <>
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
                <p className="font-medium text-sm text-gray-900 truncate">
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
            
            {/* Right: Action Buttons */}
            {(showAction || contentUrl) && (
              <div className="flex items-center gap-2">
                {/* View Button */}
                {contentUrl && (
                  <button
                    onClick={handleView}
                    className={[
                      "flex items-center gap-2 px-3 py-2",
                      "rounded-lg text-sm font-medium",
                      "transition-colors flex-shrink-0",
                      "text-gray-700 hover:text-gray-900",
                      "bg-gray-100 hover:bg-gray-200",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-blue-500",
                      "focus-visible:ring-offset-2",
                    ].join(" ")}
                    aria-label={`View ${title}`}
                  >
                    <Eye className="size-4" />
                    <span className="hidden sm:inline">Lihat</span>
                  </button>
                )}
                
                {/* Download Button */}
                {contentUrl && type !== "LINK" && (
                  <button
                    onClick={handleDownload}
                    className={[
                      "flex items-center gap-2 px-3 py-2",
                      "rounded-lg text-sm font-medium",
                      "transition-colors flex-shrink-0",
                      "text-gray-700 hover:text-gray-900",
                      "bg-gray-100 hover:bg-gray-200",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-blue-500",
                      "focus-visible:ring-offset-2",
                    ].join(" ")}
                    aria-label={`Download ${title}`}
                  >
                    <Download className="size-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ✅ File Viewer Modal */}
        {contentUrl && (
          <FileViewerModal
            isOpen={showViewer}
            onClose={() => setShowViewer(false)}
            url={contentUrl}
            title={title}
            type={type}
          />
        )}
      </>
    );
  }
);

export default ActivityCard;