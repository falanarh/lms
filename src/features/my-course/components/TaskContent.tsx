"use client";

import { Content } from "@/api/contents";
import FileUpload from "@/components/ui/FileUpload/FileUpload";
import { Toast } from "@/components/ui/Toast/Toast";
import {
  FileCheck,
  FileText,
  Clock,
  CheckCircle,
  Clipboard,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DUMMY_USER_ID } from "@/config/api";
import {
  useTaskAttempt,
  useTaskDetail,
  useSubmitTaskAttempt,
  useUpdateTaskAttempt,
} from "@/hooks/useTask";
import type { TaskDetail, TaskAttempt } from "@/api/tasks";

type TaskStatus = "NOT_SUBMITTED" | "SUBMITTED" | "GRADED";

interface TaskContentProps {
  content: Content;
  isSidebarOpen: boolean;
  onTaskSubmitted?: (contentId: string, isRequired: boolean) => void;
}

export const TaskContent = ({
  content,
  isSidebarOpen,
  onTaskSubmitted,
}: TaskContentProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("NOT_SUBMITTED");
  const [taskScore, setTaskScore] = useState<number | null>(null);
  const [taskMaxScore, setTaskMaxScore] = useState<number | null>(null);
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isLocalUnsubmit, setIsLocalUnsubmit] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [keepSubmittedFile, setKeepSubmittedFile] = useState<boolean>(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<
    "info" | "warning" | "success"
  >("success");

  const { data: taskDetail } = useTaskDetail(content.id, { retry: false });
  const { data: attemptData, refetch: refetchAttempt } = useTaskAttempt(
    DUMMY_USER_ID,
    content.id,
    { retry: false }
  );
  const submitAttemptMutation = useSubmitTaskAttempt();
  const updateAttemptMutation = useUpdateTaskAttempt();

  const typedTaskDetail = taskDetail as TaskDetail | null | undefined;
  const typedAttemptData = attemptData as TaskAttempt | null | undefined;

  const rawDeadline = typedTaskDetail?.dueDate || null;
  const deadlineDate = rawDeadline ? new Date(rawDeadline) : null;
  const isDeadlineValid =
    !!deadlineDate && !Number.isNaN(deadlineDate.getTime());
  const isBeforeDeadline = isDeadlineValid ? deadlineDate > new Date() : false;

  const deadlineLabel = isDeadlineValid
    ? deadlineDate.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const showUploadBox = taskStatus === "NOT_SUBMITTED";

  const submittedUrl = typedAttemptData?.urlFile || null;

  const showSubmittedFileInfo =
    (taskStatus !== "NOT_SUBMITTED" || isLocalUnsubmit) &&
    keepSubmittedFile &&
    submittedUrl !== null &&
    submittedUrl !== "";

  // Display submitted file name (with timestamp from server)
  const submittedFileName = useMemo(() => {
    if (!submittedUrl) return null;

    try {
      const url = new URL(submittedUrl);
      const pathname = url.pathname;
      const encodedName = pathname.split("/").pop();
      if (!encodedName) return submittedUrl;
      return decodeURIComponent(encodedName);
    } catch {
      const parts = submittedUrl.split("/");
      const encodedName = parts[parts.length - 1] || submittedUrl;
      try {
        return decodeURIComponent(encodedName);
      } catch {
        return encodedName;
      }
    }
  }, [submittedUrl]);

  // Generate preview URL untuk file yang diupload
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const url = URL.createObjectURL(uploadedFiles[0]);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [uploadedFiles]);

  useEffect(() => {
    if (isLocalUnsubmit) {
      setTaskStatus("NOT_SUBMITTED");
      setTaskScore(null);
      setTaskFeedback(null);
      // Keep submitted file visible during unsubmit
      return;
    }

    // Handle case when attemptData is undefined (404 - belum pernah submit)
    if (typedAttemptData === undefined || typedAttemptData === null) {
      setTaskStatus("NOT_SUBMITTED");
      setTaskScore(null);
      setTaskFeedback(null);
      setHasSubmitted(false);
      setKeepSubmittedFile(false); // No submitted file to keep
      return;
    }

    // Handle case when attempt exists but urlFile is null
    if (typedAttemptData.urlFile === null || typedAttemptData.urlFile === "") {
      setTaskStatus("NOT_SUBMITTED");
      setTaskScore(null);
      setTaskFeedback(null);
      setHasSubmitted(false);
      setKeepSubmittedFile(false); // No submitted file to keep
      return;
    }

    setHasSubmitted(true);
    setKeepSubmittedFile(true); // Has submitted file

    if (
      typedAttemptData.status === "GRADED" ||
      typedAttemptData.totalScore !== null
    ) {
      setTaskStatus("GRADED");
      setTaskScore(typedAttemptData.totalScore);
      setTaskFeedback(typedAttemptData.feedback);
    } else {
      setTaskStatus("SUBMITTED");
      setTaskScore(null);
      setTaskFeedback(null);
    }
  }, [typedAttemptData, isLocalUnsubmit]);

  async function uploadToR2(
    file: File
  ): Promise<{ publicUrl: string; fileName: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    const fileName = data?.fileName;
    if (!fileName || !publicBase) throw new Error("Invalid upload response");
    return {
      publicUrl: `${publicBase}/${fileName}`,
      fileName: fileName,
    };
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);

    try {
      const { publicUrl, fileName } = await uploadToR2(file);

      // Set data setelah upload berhasil
      setUploadedFiles([file]);
      setUploadedFileUrl(publicUrl);
      setUploadedFileName(fileName);

      setShowToast(true);
      setToastMessage("Dokumen berhasil diupload!");
      setToastVariant("success");
    } catch (error) {
      console.error("Upload error:", error);
      setShowToast(true);
      setToastMessage("Gagal mengupload dokumen. Coba lagi.");
      setToastVariant("warning");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFiles([]);
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setKeepSubmittedFile(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const openFilePreview = () => {
    if (uploadedFileUrl) {
      window.open(uploadedFileUrl, "_blank");
    } else if (submittedUrl) {
      window.open(submittedUrl, "_blank");
    } else if (filePreviewUrl) {
      window.open(filePreviewUrl, "_blank");
    }
  };

  return (
    <div
      className={`relative w-full bg-white rounded-md overflow-y-auto transition-all duration-500 border border-gray-200 shadow-sm flex flex-col ${
        isSidebarOpen
          ? "aspect-3/4 md:aspect-auto md:h-[520px] md:min-h-[520px] md:max-h-[520px]"
          : "aspect-3/4 md:aspect-auto md:h-[520px] md:min-h-[520px] md:max-h-[520px]"
      }`}
    >
      <div className="hidden md:block absolute md:top-4 md:right-4 z-10">
        <div className="px-2 py-1 md:px-3 md:py-1 rounded-full md:text-base font-medium">
          Deadline: {deadlineLabel}
        </div>
      </div>

      <div className="p-3 md:p-4 md:pr-32 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 mb-4">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-5 h-5 md:w-6 md:h-6 text-purple-600 leading-none" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-lg font-semibold text-gray-900 mb-1 truncate">
              {typedTaskDetail?.name || content.name}
            </p>

            <p className="mt-1 text-xs text-gray-500 md:hidden">
              Due: {deadlineLabel}
            </p>
          </div>
        </div>
        <p className="text-gray-600 text-xs md:text-base leading-relaxed whitespace-pre-line break-words">
          {typedTaskDetail?.description || content.description}
        </p>
      </div>

      {(typedTaskDetail?.taskUrl || content.contentUrl) && (
        <div className="px-3 md:px-4 pb-2 flex-shrink-0">
          {(() => {
            const taskUrl =
              typedTaskDetail?.taskUrl || content.contentUrl || "";
            const assignmentFiles = taskUrl.includes(",")
              ? taskUrl.split(",").map((url, index) => ({
                  name: `Assignment Document ${index + 1}`,
                  url: url.trim(),
                }))
              : [{ name: "Assignment Document", url: taskUrl }];

            const getGridCols = (count: number) => {
              if (count === 1) return "grid-cols-1";
              return "grid-cols-1 md:grid-cols-2";
            };

            return (
              <div
                className={`grid gap-2 ${getGridCols(assignmentFiles.length)}`}
              >
                {assignmentFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-sm bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs md:text-base truncate">
                          {file.name}
                        </p>
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
            <h3 className="text-sm md:text-base font-medium text-gray-900">
              Your Submission
            </h3>
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

        {showSubmittedFileInfo && submittedFileName && (
          <div className="mb-2 md:mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-sm bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <button
                onClick={openFilePreview}
                className="text-xs md:text-base font-medium text-gray-900 truncate hover:underline text-left w-full"
              >
                {submittedFileName}
              </button>
              <p className="text-xs md:text-sm text-gray-500">
                {uploadedFiles[0]
                  ? formatFileSize(uploadedFiles[0].size)
                  : "File terkumpul"}
              </p>
            </div>
            {isLocalUnsubmit && (
              <button
                onClick={() => {
                  setKeepSubmittedFile(false);
                  setUploadedFiles([]);
                }}
                className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                title="Hapus file"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        )}

        {taskStatus === "GRADED" && (
          <div className="mb-2 md:mb-3 grid grid-cols-1 md:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-2.5 flex flex-col items-center justify-center">
              <p className="text-xs md:text-sm tracking-wide text-gray-700 mb-1">
                Score
              </p>
              <p className="text-xl font-semibold text-gray-800 leading-none">
                {taskScore !== null ? taskScore : "--"}
                {taskMaxScore !== null && (
                  <span className="text-sm font-semibold text-gray-700">
                    {" "}
                    / {taskMaxScore}
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
              <p className="text-xs md:text-sm tracking-wide text-gray-700 mb-1">
                Feedback pengajar
              </p>
              <p className="text-xs md:text-sm text-gray-900 whitespace-pre-line">
                {taskFeedback ||
                  "Belum ada feedback yang ditambahkan oleh pengajar."}
              </p>
            </div>
          </div>
        )}

        {showUploadBox && (
          <div className="mb-2 md:mb-3 space-y-2">
            {uploadedFiles.length > 0 && !keepSubmittedFile ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-sm bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={openFilePreview}
                    className="text-xs md:text-base font-medium text-gray-900 truncate hover:underline text-left w-full"
                  >
                    {uploadedFileName || uploadedFiles[0].name}
                  </button>
                  <p className="text-xs md:text-sm text-gray-500">
                    {formatFileSize(uploadedFiles[0].size)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors flex-shrink-0"
                  title="Hapus file"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ) : null}
            {uploadedFiles.length === 0 &&
              !keepSubmittedFile &&
              !isUploading && (
                <FileUpload
                  acceptedFileTypes={["document"]}
                  maxFileSizeMB={10}
                  variant="slim"
                  value={null}
                  onChange={(file) => {
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  className="w-full"
                  disabled={isUploading}
                />
              )}
            {isUploading && (
              <div className="text-center py-4 text-sm text-gray-500">
                Mengupload dokumen...
              </div>
            )}
            {uploadedFiles.length === 0 &&
              keepSubmittedFile &&
              isLocalUnsubmit && (
                <div className="text-center py-4 text-sm text-gray-500">
                  Klik tombol X di atas untuk menghapus file sebelumnya dan
                  upload file baru
                </div>
              )}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-3 flex-shrink-0 mt-auto">
          {taskStatus === "NOT_SUBMITTED" && (
            <>
              <button
                className="flex-1 px-3 py-2 md:px-4 md:py-3 rounded-lg font-medium text-xs md:text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={() => {
                  (async () => {
                    // Case 1: Resubmit after unsubmit without uploading new file
                    if (
                      uploadedFiles.length === 0 &&
                      isLocalUnsubmit &&
                      submittedUrl
                    ) {
                      try {
                        setIsSubmitting(true);

                        await updateAttemptMutation.mutateAsync({
                          idTask: typedAttemptData!.id,
                          payload: {
                            idUser: DUMMY_USER_ID,
                            idContent: content.id,
                            urlFile: submittedUrl,
                          },
                        });

                        setIsLocalUnsubmit(false);
                        setKeepSubmittedFile(true);

                        await refetchAttempt();

                        setShowToast(true);
                        setToastMessage("Tugas berhasil dikumpulkan!");
                        setToastVariant("success");

                        if (onTaskSubmitted) {
                          onTaskSubmitted(
                            content.id,
                            typedTaskDetail?.isRequired ?? false
                          );
                        }
                      } catch (e) {
                        console.error("Error resubmitting task:", e);
                        setShowToast(true);
                        setToastMessage("Gagal mengumpulkan tugas. Coba lagi.");
                        setToastVariant("warning");
                      } finally {
                        setIsSubmitting(false);
                      }
                      return;
                    }

                    // Case 2: Submit with newly uploaded file
                    if (!uploadedFileUrl) {
                      setShowToast(true);
                      setToastMessage(
                        "Silakan upload file tugas terlebih dahulu sebelum mengumpulkan."
                      );
                      setToastVariant("warning");
                      return;
                    }

                    try {
                      setIsSubmitting(true);
                      const publicUrl = uploadedFileUrl;

                      if (typedAttemptData?.id) {
                        await updateAttemptMutation.mutateAsync({
                          idTask: typedAttemptData.id,
                          payload: {
                            idUser: DUMMY_USER_ID,
                            idContent: content.id,
                            urlFile: publicUrl,
                          },
                        });
                      } else {
                        await submitAttemptMutation.mutateAsync({
                          idUser: DUMMY_USER_ID,
                          idContent: content.id,
                          urlFile: publicUrl,
                        });
                      }

                      setIsLocalUnsubmit(false);
                      setKeepSubmittedFile(true);
                      setUploadedFiles([]);
                      setUploadedFileUrl(null);
                      setUploadedFileName(null);

                      await refetchAttempt();

                      setShowToast(true);
                      setToastMessage("Tugas berhasil dikumpulkan!");
                      setToastVariant("success");

                      if (onTaskSubmitted) {
                        onTaskSubmitted(
                          content.id,
                          typedTaskDetail?.isRequired ?? false
                        );
                      }
                    } catch (e) {
                      console.error("Error submitting task:", e);
                      setShowToast(true);
                      setToastMessage("Gagal mengumpulkan tugas. Coba lagi.");
                      setToastVariant("warning");
                    } finally {
                      setIsSubmitting(false);
                    }
                  })();
                }}
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? "Mengumpulkan..." : "Turn In"}
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
                      setIsLocalUnsubmit(true);
                      setKeepSubmittedFile(true);
                    }}
                    disabled={isSubmitting}
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

          {taskStatus === "GRADED" && (
            <div className="flex-1">
              <button
                className="w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-gray-200 text-xs md:text-sm font-medium text-gray-500 cursor-not-allowed"
                disabled
              >
                Turned In
              </button>
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Toast
            message={toastMessage}
            variant={toastVariant}
            onClose={() => setShowToast(false)}
            autoDismiss
            duration={3000}
          />
        </div>
      )}
    </div>
  );
};
