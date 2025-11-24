import { MaterialType } from "@/features/course/components/ActivityCard";
import React, { useState } from "react";
import { FileText, Video, Download, Eye, Link, X, ExternalLink, HelpCircle, ListTodo } from "lucide-react";

import { Button } from "@/components/ui/Button";

const materialConfig: {
  [key in MaterialType]: {
    icon: typeof FileText;
    color: string;
    bgColor: string;
    iconColor: string;
    label: string;
  }
} = {

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
  QUIZ: {
    icon: HelpCircle,
    color: "purple",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    label: "QUIZ",
  },
  TASK: {
    icon: ListTodo,
    color: "indigo",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    label: "TASK",
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