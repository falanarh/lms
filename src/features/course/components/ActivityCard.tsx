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
 * - timeLimit?: number — waktu limit dalam menit (untuk Quiz/Task)
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
 * // Quiz dengan time limit
 * <ActivityCard
 *   title="Quiz Pemahaman Dasar"
 *   type="QUIZ"
 *   description="10 soal pilihan ganda"
 *   timeLimit={30}
 *   questionCount={10}
 * />
 * ```
 */
import React, { useEffect, useState } from "react";
import {
  FileText,
  Video,
  Download,
  Eye,
  Link,
  X,
  ExternalLink,
  HelpCircle,
  ListTodo,
  Edit3,
  Package,
  Clock,
} from "lucide-react";
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
  // Time restriction (in minutes)
  timeLimit?: number;
  onView?: () => void;
  // Callback to register view handler for external use
  onViewHandlerReady?: (viewHandler: () => void) => void;
}

const materialConfig: Record<
  MaterialType,
  {
    icon: typeof FileText;
    color: string;
    bgColor: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    label: string;
  }
> = {
  PDF: {
    icon: FileText,
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    badgeBg: "bg-green-100 dark:bg-green-900/30",
    badgeText: "text-green-700 dark:text-green-300",
    badgeBorder: "border-green-300 dark:border-green-700",
    label: "PDF",
  },
  VIDEO: {
    icon: Video,
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-100 dark:bg-blue-900/30",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-300 dark:border-blue-700",
    label: "VIDEO",
  },
  LINK: {
    icon: Link,
    color: "orange",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    badgeBg: "bg-orange-100 dark:bg-orange-900/30",
    badgeText: "text-orange-700 dark:text-orange-300",
    badgeBorder: "border-orange-300 dark:border-orange-700",
    label: "LINK",
  },
  SCORM: {
    icon: Package,
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-700 dark:text-yellow-400",
    badgeBg: "bg-yellow-100 dark:bg-yellow-900/30",
    badgeText: "text-yellow-700 dark:text-yellow-300",
    badgeBorder: "border-yellow-300 dark:border-yellow-700",
    label: "SCORM",
  },
  QUIZ: {
    icon: HelpCircle,
    color: "purple",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-100 dark:bg-purple-900/30",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-300 dark:border-purple-700",
    label: "QUIZ",
  },
  TASK: {
    icon: ListTodo,
    color: "indigo",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/30",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    badgeBorder: "border-indigo-300 dark:border-indigo-700",
    label: "TASK",
  },
};

const convertToScormProxy = (fullUrl: string) => {
  const base = "https://pub-b50c5924d2c64c1397f8e200306b9bfb.r2.dev/";

  let path = fullUrl.replace(base, "");
  path = path.replace(/^\/+/, "");

  return `/api/scorm/${path}`;
};

// Helper function to convert YouTube URL to embed format
const getYouTubeEmbedUrl = (url: string): string => {
  let videoId = "";
  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1]?.split("&")[0] || "";
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (url.includes("youtube.com/embed/")) {
    videoId = url.split("embed/")[1]?.split("?")[0] || "";
  }
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0`;
  }
  return url;
};

// Helper function to format time limit
const formatTimeLimit = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${remainingMinutes} menit`;
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

  const isYouTubeUrl =
    url &&
    (url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("youtube-nocookie.com"));

  const handleDownload = async () => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = title;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between bg-gray-50 dark:bg-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`size-8 rounded-lg flex items-center justify-center ${materialConfig[isYouTubeUrl ? "VIDEO" : type].bgColor}`}
            >
              {React.createElement(
                materialConfig[isYouTubeUrl ? "VIDEO" : type].icon,
                {
                  className: `size-4 ${materialConfig[isYouTubeUrl ? "VIDEO" : type].iconColor}`,
                },
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                {title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
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
          {(type === "PDF" || type === "TASK") && (
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              <iframe src={url} className="w-full h-full" title={title} />
            </div>
          )}

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
              <ExternalLink className="size-16 mx-auto mb-4 text-gray-400 dark:text-zinc-600" />
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-zinc-100">
                External Link
              </h4>
              <p className="text-gray-600 dark:text-zinc-400 mb-6">
                Click button below to open link
              </p>
              <Button
                onClick={() => window.open(url, "_blank")}
                className="mx-auto"
              >
                <ExternalLink className="size-4 mr-2" />
                Open Link
              </Button>
              <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg max-w-2xl mx-auto">
                <p className="text-xs text-gray-500 dark:text-zinc-400 break-all">
                  {url}
                </p>
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
      questionCount,
      onManageQuestions,
      contentId,
      timeLimit,
      onView,
      onViewHandlerReady,
    },
    ref,
  ) {
    const isYouTubeUrl =
      contentUrl &&
      (contentUrl.includes("youtube.com") ||
        contentUrl.includes("youtu.be") ||
        contentUrl.includes("youtube-nocookie.com"));

    const displayType = isYouTubeUrl ? "VIDEO" : type;
    const config = materialConfig[displayType];
    const Icon = config.icon;

    const [showViewer, setShowViewer] = useState(false);
    const [showScormPreview, setShowScormPreview] = useState(false);
    const [scormLaunchUrl, setScormLaunchUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleView = async () => {
      // If onView callback is provided, call it
      if (onView) {
        onView();
      }

      if (onAction) {
        onAction();
        return;
      }

      if (type === "SCORM" && contentUrl) {
        const proxyUrl = convertToScormProxy(contentUrl);

        const absoluteUrl =
          typeof window !== "undefined"
            ? window.location.origin + proxyUrl
            : proxyUrl;

        console.log("🔁 Final SCORM URL:", absoluteUrl);

        setScormLaunchUrl(absoluteUrl);
        setShowScormPreview(true);
        return;
      }

      // if (type === "SCORM" && contentUrl) {
      //   try {
      //     console.log("🎬 Starting SCORM preview for:", contentUrl);
      //     setIsLoading(true);

      //     const apiUrl = `${process.env.NEXT_PUBLIC_COURSE_BASE_URL}/scorm/extract`;
      //     console.log("📡 Calling API:", apiUrl);

      //     const response = await fetch(apiUrl, {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({ scormUrl: contentUrl }),
      //     });

      //     console.log("📥 Response status:", response.status);

      //     if (!response.ok) {
      //       const errorText = await response.text();
      //       console.error("❌ API Error:", errorText);
      //       throw new Error(
      //         `API request failed: ${response.status} ${response.statusText}`,
      //       );
      //     }

      //     const result = await response.json();
      //     console.log("✅ API Response:", result);

      //     const launchUrl = result.data?.data?.launchUrl;

      //     if (launchUrl) {
      //       console.log("🚀 Launch URL:", launchUrl);
      //       setScormLaunchUrl(launchUrl);
      //       setShowScormPreview(true);
      //     } else {
      //       console.error("❌ No launchUrl found. Full response:", result);
      //       throw new Error(
      //         "Could not extract SCORM package - no launch URL in response",
      //       );
      //     }
      //   } catch (error) {
      //     console.error("💥 SCORM Preview Error:", error);

      //     const errorMessage =
      //       error instanceof Error ? error.message : "Unknown error occurred";

      //     alert(
      //       `Failed to load SCORM content:\n\n${errorMessage}\n\nPlease check the browser console for more details.`,
      //     );
      //   } finally {
      //     setIsLoading(false);
      //   }
      // }
      else if (contentUrl) {
        setShowViewer(true);
      }
    };

    useEffect(() => {
      if (onViewHandlerReady) {
        // Register the view handler for external use
        onViewHandlerReady(handleView);
      }
    }, [onViewHandlerReady, handleView]);

    const handleDownload = async () => {
      if (!contentUrl) return;

      try {
        const link = document.createElement("a");
        link.href = contentUrl;
        link.download = title;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          window.open(contentUrl, "_blank", "noopener,noreferrer");
        }, 100);
      } catch (error) {
        console.error("Download error:", error);
        window.open(contentUrl, "_blank", "noopener,noreferrer");
      }
    };

    return (
      <>
        <div
          ref={ref}
          className={[
            "p-4",
            "bg-white dark:bg-zinc-800",
            "border border-gray-200 dark:border-zinc-700",
            "rounded-lg",
            "transition-all duration-200",
            "hover:shadow-sm hover:border-gray-300 dark:hover:border-zinc-600",
            "h-full",
            "flex flex-col",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex items-center justify-between gap-4 flex-1">
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
                {/* Title with Type Badge */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">
                    {title}
                  </p>
                  {/* Type Badge */}
                  <span
                    className={[
                      "px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0",
                      config.badgeBg,
                      config.badgeText,
                      config.badgeBorder,
                    ].join(" ")}
                  >
                    {isYouTubeUrl ? "YouTube" : config.label}
                  </span>
                </div>

                {/* Description and Meta Info */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600 dark:text-zinc-400">
                  {/* Description */}
                  {description && (
                    <span className="line-clamp-1">{description}</span>
                  )}

                  {/* Quiz specific info */}
                  {type === "QUIZ" && (
                    <>
                      {description && questionCount !== undefined && (
                        <span className="text-gray-300 dark:text-zinc-600">
                          •
                        </span>
                      )}
                      {questionCount !== undefined && (
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {questionCount} soal
                        </span>
                      )}
                      {timeLimit !== undefined && (
                        <>
                          <span className="text-gray-300 dark:text-zinc-600">
                            •
                          </span>
                          <span className="flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400">
                            <Clock className="size-3" />
                            {formatTimeLimit(timeLimit)}
                          </span>
                        </>
                      )}
                    </>
                  )}

                  {/* Task specific info */}
                  {type === "TASK" && timeLimit !== undefined && (
                    <>
                      {description && (
                        <span className="text-gray-300 dark:text-zinc-600">
                          •
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400">
                        <Clock className="size-3" />
                        {formatTimeLimit(timeLimit)}
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
                    "text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300",
                    "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-purple-500",
                    "focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-800",
                  ].join(" ")}
                  aria-label={`Manage questions for ${title}`}
                >
                  <Edit3 className="size-4" />
                  <span className="hidden sm:inline">Kelola Soal</span>
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
            scormUrl={scormLaunchUrl || ""}
            title={title}
            description={description}
          />
        )}
      </>
    );
  },
);

export default ActivityCard;
