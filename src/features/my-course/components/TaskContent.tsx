"use client";

import { Content } from "@/api/contents";
import FileUpload from "@/components/ui/FileUpload/FileUpload";
import { FileCheck, FileText, Clock, CheckCircle, Clipboard } from "lucide-react";
import { useState } from "react";

type TaskStatus = "NOT_SUBMITTED" | "SUBMITTED" | "GRADED";

interface TaskContentProps {
  content: Content;
  isSidebarOpen: boolean;
}

export const TaskContent = ({ content, isSidebarOpen }: TaskContentProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("NOT_SUBMITTED");
  const [taskScore, setTaskScore] = useState<number | null>(null);
  const [taskMaxScore, setTaskMaxScore] = useState<number | null>(null);
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);

  const rawDeadline = content.contentEnd;
  const deadlineDate = rawDeadline ? new Date(rawDeadline) : null;
  const isDeadlineValid = !!deadlineDate && !Number.isNaN(deadlineDate.getTime());
  const isBeforeDeadline = isDeadlineValid ? deadlineDate > new Date() : false;

  const deadlineLabel = isDeadlineValid
    ? deadlineDate.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not specified";

  const showUploadBox = taskStatus === "NOT_SUBMITTED";
  const showSubmittedFileInfo = taskStatus !== "NOT_SUBMITTED" && uploadedFiles.length > 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className={`relative w-full bg-white rounded-md overflow-y-auto transition-all duration-500 border border-gray-200 shadow-sm flex flex-col ${
        isSidebarOpen ? "aspect-[3/4] md:h-[520px]" : "aspect-[3/4] md:h-[520px]"
      }`}
    >
      <div className="hidden md:block absolute md:top-4 md:right-4 z-10">
        <div className="px-2 py-1 md:px-3 md:py-1 rounded-full md:text-base font-medium">Due: {deadlineLabel}</div>
      </div>

      <div className="p-3 md:p-4 md:pr-32 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 mb-4">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-5 h-5 md:w-6 md:h-6 text-purple-600 leading-none" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-lg font-semibold text-gray-900 mb-1 truncate">{content.name}</p>

            <p className="mt-1 text-xs text-gray-500 md:hidden">Due: {deadlineLabel}</p>
          </div>
        </div>
        <p className="text-gray-600 text-xs md:text-base leading-relaxed whitespace-pre-line break-words">
          {content.description}
        </p>
      </div>

      {content.contentUrl && (
        <div className="px-3 md:px-4 pb-2 flex-shrink-0">
          {(() => {
            const assignmentFiles = content.contentUrl.includes(",")
              ? content.contentUrl.split(",").map((url, index) => ({
                  name: `Assignment Document ${index + 1}`,
                  url: url.trim(),
                }))
              : [{ name: "Assignment Document", url: content.contentUrl }];

            const getGridCols = (count: number) => {
              if (count === 1) return "grid-cols-1";
              return "grid-cols-1 md:grid-cols-2";
            };

            return (
              <div className={`grid gap-2 ${getGridCols(assignmentFiles.length)}`}>
                {assignmentFiles.map((file, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-sm bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs md:text-base truncate">{file.name}</p>
                      </div>
                      <button
                        onClick={() => window.open(file.url, "_blank")}
                        className="px-2 py-1 md:px-3 md:py-1.5 bg-blue-600 text-white rounded text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      <div className="p-3 md:p-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-start justify-between mb-2 md:mb-3 flex-shrink-0 gap-2">
          <div>
            <h3 className="text-sm md:text-base font-medium text-gray-900">Your Submission</h3>
            <p className="mt-0.5 text-xs md:text-sm text-gray-500">
              Unggah file tugas Anda kemudian klik tombol kirim.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {taskStatus === "NOT_SUBMITTED" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs md:text-sm font-medium text-gray-700 border border-gray-200">
                <Clipboard className="w-4 h-4" />
                Not submitted
              </span>
            )}
            {taskStatus === "SUBMITTED" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs md:text-sm font-medium text-amber-700 border border-amber-200">
                <Clock className="w-4 h-4" />
                Submitted
              </span>
            )}
            {taskStatus === "GRADED" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs md:text-sm font-medium text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3  h-3" />
                Graded
              </span>
            )}
          </div>
        </div>

        {showSubmittedFileInfo && (
          <div className="mb-2 md:mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-sm bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-base font-medium text-gray-900 truncate">{uploadedFiles[0].name}</p>
              <p className="text-xs md:text-sm text-gray-500">{formatFileSize(uploadedFiles[0].size)}</p>
            </div>
            <div className="hidden md:block text-xs md:text-sm text-gray-500 text-right">
              <p>File terkumpul</p>
              {isDeadlineValid && <p className="text-xs text-gray-400">Sampai: {deadlineLabel}</p>}
            </div>
          </div>
        )}

        {taskStatus === "GRADED" && (
          <div className="mb-2 md:mb-3 grid grid-cols-1 md:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] gap-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 flex flex-col items-center justify-center">
              <p className="text-[11px] uppercase tracking-wide text-gray-700 mb-1">Score</p>
              <p className="text-2xl font-bold text-gray-800 leading-none">
                {taskScore !== null ? taskScore : "--"}
                {taskMaxScore !== null && (
                  <span className="text-sm font-semibold text-gray-700"> / {taskMaxScore}</span>
                )}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-gray-700 mb-1">Feedback pengajar</p>
              <p className="text-xs md:text-sm text-gray-900 whitespace-pre-line">
                {taskFeedback || "Belum ada feedback yang ditambahkan oleh pengajar."}
              </p>
            </div>
          </div>
        )}

        {showUploadBox && (
          <div className="mb-2 md:mb-3">
            <FileUpload
              acceptedFileTypes={["document"]}
              maxFileSizeMB={10}
              variant="slim"
              value={uploadedFiles[0] ?? null}
              onChange={(file) => {
                if (file) {
                  setUploadedFiles([file]);
                } else {
                  setUploadedFiles([]);
                }
              }}
              className="w-full"
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-3 flex-shrink-0 mt-auto">
          {taskStatus === "NOT_SUBMITTED" && (
            <>
              <button
                className="flex-1 px-3 py-2 md:px-4 md:py-3 rounded-lg font-medium text-xs md:text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  if (uploadedFiles.length === 0) {
                    alert("Silakan upload file tugas terlebih dahulu sebelum mengumpulkan.");
                    return;
                  }
                  setTaskStatus("SUBMITTED");
                  setTaskScore(null);
                  setTaskMaxScore(null);
                  setTaskFeedback(null);
                }}
              >
                Turn In
              </button>
            </>
          )}

          {taskStatus === "SUBMITTED" && (
            <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {isBeforeDeadline ? (
                <>
                  <button
                    className="flex-1 w-full md:w-auto px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setTaskStatus("NOT_SUBMITTED");
                    }}
                  >
                    Unsubmit
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full md:w-auto px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-gray-200 text-xs md:text-sm font-medium text-gray-500 cursor-not-allowed"
                    disabled
                  >
                    Turned In
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
