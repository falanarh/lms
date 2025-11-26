"use client";

import { Content } from "@/api/contents";
import { Link as LinkIcon, Package } from "lucide-react";
import { VideoContent } from "./VideoContent";
import { PdfContent } from "./PdfContent";
import { ScormContent } from "./ScormContent";
import { QuizContent } from "./QuizContent";
import { TaskContent } from "./TaskContent";
import { LinkContent } from "./LinkContent";

interface ContentPlayerProps {
  content: Content | null;
  isSidebarOpen?: boolean;
  onTaskSubmitted?: (contentId: string, isRequired: boolean) => void;
  onStartContent?: (contentId: string) => void;
  onFinishContent?: (contentId: string) => void;
}

export const ContentPlayer = ({
  content,
  isSidebarOpen = true,
  onTaskSubmitted,
  onStartContent,
  onFinishContent,
}: ContentPlayerProps) => {
  if (!content) {
    return (
      <div className="w-full flex justify-center px-4 lg:px-0">
        <div className="w-full aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              Select a content to start learning
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Choose from the course contents below
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render berdasarkan tipe content
  const renderContent = () => {
    switch (content.type.toLowerCase()) {
      case "video":
        return <VideoContent content={content} isSidebarOpen={isSidebarOpen} />;

      case "pdf":
        return <PdfContent content={content} isSidebarOpen={isSidebarOpen} />;

      case "link":
        return (
          <LinkContent
            url={content.contentUrl || ""}
            title={content.name}
            description={content.description}
            isSidebarOpen={isSidebarOpen}
          />
        );

      case "scorm":
        return <ScormContent content={content} isSidebarOpen={isSidebarOpen} />;

      case "quiz":
        return (
          <QuizContent
            content={content}
            isSidebarOpen={isSidebarOpen}
            onStartContent={onStartContent}
            onFinishContent={onFinishContent}
          />
        );

      case "task": {
        return (
          <TaskContent
            content={content}
            isSidebarOpen={isSidebarOpen}
            onTaskSubmitted={onTaskSubmitted}
          />
        );
      }

      default:
        return (
          <div className="w-full aspect-video md:aspect-auto md:h-[520px] md:min-h-[520px] md:max-h-[520px] bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                Unsupported content type
              </p>
            </div>
          </div>
        );
    }
  };

  return <div className="w-full">{renderContent()}</div>;
};
