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
import { FileText, Video, Download, Eye, Link, X, ExternalLink, CircleQuestionMarkIcon, FileQuestion, TimerIcon, MessageCircleIcon, HelpCircleIcon, BrainIcon, HelpCircle, ListTodo, Edit3, List, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScormPreviewModal } from "@/components/ScormPlayer";

export type MaterialType = "PDF" | "VIDEO" | "LINK" | "SCORM" | "QUIZ" | "TASK";

export interface ActivityCardProps {
  title: string;
  type: MaterialType;
  contentUrl?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  showAction?: boolean;
  className?: string;
  // Quiz specific props
  questionCount?: number;
  onManageQuestions?: () => void;
  contentId?: string;
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
    icon: Package,
    color: "yellow",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
    label: "SCORM",
  },
  QUIZ: {
    icon: HelpCircle,
    color: "red",
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
    label: "QUIZ",
  },
  TASK: {
    icon: ListTodo,
    color: "gray",
    bgColor: "bg-gray-100",
    iconColor: "text-gray-600",
    label: "TASK",
  },
};

// Helper function to convert YouTube URL to embed format
const getYouTubeEmbedUrl = (url: string): string => {
  let videoId = '';

  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0] || '';
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0] || '';
  }

  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0`;
  }

  return url; // Return original URL if parsing fails
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

  // Check if this is a YouTube URL
  const isYouTubeUrl = url && (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('youtube-nocookie.com')
  );

  const handleDownload = async () => {
    // For S3/R2 files with CORS restrictions, open directly in new tab
    // This allows the browser to handle the download with proper headers
    try {
      // Try to open in new tab directly (best for CORS-restricted storage)
      const link = document.createElement("a");
      link.href = url;
      link.download = title;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Add to DOM and click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also open in new tab as fallback if direct download doesn't work
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }, 100);

    } catch (error) {
      console.error("Download error:", error);
      // Fallback: just open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`size-8 rounded-lg flex items-center justify-center ${materialConfig[isYouTubeUrl ? "VIDEO" : type].bgColor}`}>
              {React.createElement(materialConfig[isYouTubeUrl ? "VIDEO" : type].icon, {
                className: `size-4 ${materialConfig[isYouTubeUrl ? "VIDEO" : type].iconColor}`,
              })}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">
                {isYouTubeUrl ? "YouTube Video" : type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {type !== "LINK" && !isYouTubeUrl && (
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
          {/* Handle PDF and TASK documents (both typically contain documents) */}
          {(type === "PDF" || type === "TASK") && (
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              <iframe
                src={url}
                className="w-full h-full"
                title={title}
              />
            </div>
          )}

          {/* Handle YouTube videos - either from LINK type with YouTube URL or VIDEO type */}
          {(type === "VIDEO" || (type === "LINK" && isYouTubeUrl)) && (
            <div className="w-full">
              {isYouTubeUrl ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={getYouTubeEmbedUrl(url)}
                    className="w-full h-full"
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                  />
                </div>
              ) : (
                <video controls className="w-full rounded-lg shadow-lg">
                  <source src={url} type="video/mp4" />
                  Your browser does not support video tag.
                </video>
              )}
            </div>
          )}

          {type === "LINK" && !isYouTubeUrl && (
            <div className="text-center py-12">
              <ExternalLink className="size-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">External Link</h4>
              <p className="text-gray-600 mb-6">Click button below to open link</p>
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
      // Quiz specific props
      questionCount,
      onManageQuestions,
      contentId,
    },
    ref
  ) {
    // Check if contentUrl is a YouTube URL
    const isYouTubeUrl = contentUrl && (
      contentUrl.includes('youtube.com') ||
      contentUrl.includes('youtu.be') ||
      contentUrl.includes('youtube-nocookie.com')
    );

    // If it's a YouTube URL, treat it as video type
    const displayType = isYouTubeUrl ? "VIDEO" : type;
    const config = materialConfig[displayType];
    const Icon = config.icon;
    const [showViewer, setShowViewer] = useState(false);
    const [showScormPreview, setShowScormPreview] = useState(false);
    const [scormLaunchUrl, setScormLaunchUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleView = async () => {
      if (onAction) {
        onAction();
        return;
      }
    
      if (type === "SCORM" && contentUrl) {
        try {
          console.log('🎬 Starting SCORM preview for:', contentUrl);
          setIsLoading(true);
          
          const apiUrl = `${process.env.NEXT_PUBLIC_COURSE_BASE_URL}/scorm/extract`;
          console.log('📡 Calling API:', apiUrl);
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scormUrl: contentUrl }),
          });
    
          console.log('📥 Response status:', response.status);
    
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }
    
          const result = await response.json();
          console.log('✅ API Response:', result);
          
          // ✅ Access the nested data: result.data.data.launchUrl
          const launchUrl = result.data?.data?.launchUrl;
          
          if (launchUrl) {
            console.log('🚀 Launch URL:', launchUrl);
            setScormLaunchUrl(launchUrl);
            setShowScormPreview(true);
          } else {
            console.error('❌ No launchUrl found. Full response:', result);
            throw new Error('Could not extract SCORM package - no launch URL in response');
          }
        } catch (error) {
          console.error('💥 SCORM Preview Error:', error);
          
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Unknown error occurred';
          
          alert(`Failed to load SCORM content:\n\n${errorMessage}\n\nPlease check the browser console for more details.`);
        } finally {
          setIsLoading(false);
        }
      } else if (contentUrl) {
        setShowViewer(true);
      }
    };

    // Handle download action
    const handleDownload = async () => {
      if (!contentUrl) return;

      // For S3/R2 files with CORS restrictions, open directly in new tab
      // This allows the browser to handle the download with proper headers
      try {
        // Try to open in new tab directly (best for CORS-restricted storage)
        const link = document.createElement("a");
        link.href = contentUrl;
        link.download = title;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        // Add to DOM and click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Also open in new tab as fallback if direct download doesn't work
        setTimeout(() => {
          window.open(contentUrl, "_blank", "noopener,noreferrer");
        }, 100);

      } catch (error) {
        console.error("Download error:", error);
        // Fallback: just open in new tab
        window.open(contentUrl, "_blank", "noopener,noreferrer");
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
                    {isYouTubeUrl ? "YouTube" : config.label}
                  </span>
                  {/* Question count for quiz */}
                  {type === "QUIZ" && questionCount !== undefined && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-blue-600 font-medium">
                        {questionCount} soal
                      </span>
                    </>
                  )}
                  {/* Optional Description */}
                  {description && type !== "QUIZ" && (
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
            <div className="flex items-center gap-2">
              {/* Manage Questions Button for Quiz */}
              {type === "QUIZ" && onManageQuestions && (
                <button
                  onClick={onManageQuestions}
                  className={[
                    "flex items-center gap-2 px-3 py-2",
                    "rounded-lg text-sm font-medium",
                    "transition-colors flex-shrink-0",
                    "text-blue-700 hover:text-blue-900",
                    "bg-blue-100 hover:bg-blue-200",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-blue-500",
                    "focus-visible:ring-offset-2",
                  ].join(" ")}
                  aria-label={`Manage questions for ${title}`}
                >
                  <Edit3 className="size-4" />
                  <span className="hidden sm:inline">Kelola Soal</span>
                </button>
              )}

              {/* View Button */}
              {contentUrl && (showAction || type !== "QUIZ") && (
                <button
                  onClick={handleView}
                  disabled={isLoading}
                  className={[
                    "flex items-center gap-2 px-3 py-2",
                    "rounded-lg text-sm font-medium",
                    "transition-colors flex-shrink-0",
                    isLoading 
                      ? "text-gray-400 bg-gray-100 cursor-not-allowed" 
                      : "text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-blue-500",
                    "focus-visible:ring-offset-2",
                  ].join(" ")}
                  aria-label={`View ${title}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" />
                      <span className="hidden sm:inline">
                        {type === "SCORM" ? "Preview" : "Lihat"}
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Download Button */}
              {contentUrl && type !== "LINK" && type !== "QUIZ" && (
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
          </div>
        </div>

        {/* File Viewer Modal */}
        {contentUrl && (
          <FileViewerModal
            isOpen={showViewer}
            onClose={() => setShowViewer(false)}
            url={contentUrl}
            title={title}
            type={displayType}
          />
        )}

        {/* SCORM Preview Modal */}
        {type === "SCORM" && scormLaunchUrl && (
          <ScormPreviewModal
            isOpen={showScormPreview}
            onClose={() => setShowScormPreview(false)}
            scormUrl={scormLaunchUrl} // Use the extracted launch URL
            title={title}
            description={description}
          />
        )}
      </>
    );
  }
);

export default ActivityCard;