"use client";

import { useState } from "react";
import { Video, Plus, Pencil, Trash2, ExternalLink, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast/Toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { useCourse, useUpdateZoomUrl, useDeleteZoomUrl } from "@/hooks/useCourse";
import { useForm } from "@tanstack/react-form";
import { updateZoomUrlSchema } from "@/schemas/course.schema";
import { ZodError } from "zod";

interface ZoomManagementProps {
  courseId: string;
}

export function ZoomManagement({ courseId }: ZoomManagementProps) {
  const { data: courseData, isPending: isLoadingCourse } = useCourse(courseId);
  
  const { mutate: updateZoomUrl, isPending: isUpdating } = useUpdateZoomUrl({
    mutationConfig: {
      onSuccess: () => {
        setIsEditing(false);
        showToastMessage("success", "Link Zoom berhasil disimpan!");
      },
      onError: (error: any) => {
        showToastMessage("warning", error?.message || "Gagal menyimpan link Zoom!");
      },
    },
  });
  
  const { mutate: deleteZoomUrl, isPending: isDeleting } = useDeleteZoomUrl({
    mutationConfig: {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        showToastMessage("success", "Link Zoom berhasil dihapus!");
      },
      onError: (error: any) => {
        showToastMessage("warning", error?.message || "Gagal menghapus link Zoom!");
      },
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "warning" | "info">("success");
  const [copied, setCopied] = useState(false);

  const form = useForm({
    defaultValues: {
      zoomUrl: courseData?.zoomUrl || "",
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate with Zod v4
        const validatedData = updateZoomUrlSchema.parse(value);
        updateZoomUrl({ courseId, data: validatedData });
      } catch (error) {
        if (error instanceof ZodError) {
          showToastMessage("warning", error.issues[0].message);
        }
      }
    },
  });

  const showToastMessage = (variant: "success" | "warning" | "info", message: string) => {
    setToastVariant(variant);
    setToastMessage(message);
    setShowToast(true);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToastMessage("warning", "Gagal menyalin ke clipboard");
    }
  };

  const handleEdit = () => {
    form.setFieldValue("zoomUrl", courseData?.zoomUrl || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  const handleDelete = () => {
    deleteZoomUrl(courseId);
  };

  const handleJoinMeeting = () => {
    if (courseData?.zoomUrl) {
      window.open(courseData.zoomUrl, "_blank");
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const hasZoomUrl = courseData?.zoomUrl && courseData.zoomUrl.trim() !== "";

  // Empty State
  if (!hasZoomUrl && !isEditing) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-zinc-200">
            Zoom Meeting
          </h2>
        </div>

        <div className="border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-12 flex flex-col items-center justify-center">
          <div className="size-16 mb-4 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <Video size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-base mb-2 font-medium text-gray-700 dark:text-zinc-300">
            Belum Ada Link Zoom
          </p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 text-center max-w-md mb-6">
            Tambahkan link Zoom Meeting untuk course ini agar peserta dapat mengikuti kelas secara online
          </p>
          <Button onClick={handleEdit} leftIcon={<Plus size={18} />}>
            Tambah Link Zoom
          </Button>
        </div>

        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <Toast
              variant={toastVariant}
              message={toastMessage}
              onClose={() => setShowToast(false)}
              autoDismiss={true}
              duration={2000}
            />
          </div>
        )}
      </div>
    );
  }

  // Edit/Create Form
  if (isEditing) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-zinc-200">
            {hasZoomUrl ? "Edit Link Zoom" : "Tambah Link Zoom"}
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-6">
            <div className="mb-6">
              <form.Field
                name="zoomUrl"
                validators={{
                  onChange: ({ value }) => {
                    try {
                      updateZoomUrlSchema.parse({ zoomUrl: value });
                      return undefined;
                    } catch (error) {
                      if (error instanceof ZodError) {
                        return error.issues[0].message;
                      }
                      return "Validation error";
                    }
                  },
                }}
                children={(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Link Zoom Meeting <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="url"
                      placeholder="https://zoom.us/j/1234567890?pwd=xxxxx"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          form.handleSubmit();
                        } else if (e.key === "Escape") {
                          handleCancel();
                        }
                      }}
                      autoFocus
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
                      Paste link Zoom Meeting lengkap dari Zoom
                    </p>
                  </div>
                )}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={isUpdating}
              >
                Batal
              </Button>
            </div>
          </div>
        </form>

        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <Toast
              variant={toastVariant}
              message={toastMessage}
              onClose={() => setShowToast(false)}
              autoDismiss={true}
              duration={2000}
            />
          </div>
        )}
      </div>
    );
  }

  // Display Meeting Info
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-zinc-200">
          Zoom Meeting
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            leftIcon={<Pencil size={16} />}
            disabled={isDeleting}
          >
            Edit
          </Button>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            size="sm"
            leftIcon={<Trash2 size={16} />}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
            disabled={isDeleting}
          >
            Hapus
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Video size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Zoom Meeting Link</h3>
              <p className="text-sm text-blue-100">Klik tombol di bawah untuk join meeting</p>
            </div>
          </div>
          <Button
            onClick={handleJoinMeeting}
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-blue-600 border-0"
            leftIcon={<ExternalLink size={18} />}
          >
            Join Zoom Meeting
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Link Meeting</p>
              <p className="text-sm text-gray-700 dark:text-zinc-300 break-all font-mono bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg">
                {courseData?.zoomUrl}
              </p>
            </div>
            <button
              onClick={() => handleCopy(courseData?.zoomUrl || "")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-zinc-400 transition-colors flex-shrink-0"
              aria-label="Copy meeting URL"
              title="Salin Link"
            >
              {copied ? (
                <Check size={18} className="text-green-600 dark:text-green-400" />
              ) : (
                <Copy size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Link Zoom?"
        description="Apakah Anda yakin ingin menghapus link Zoom Meeting ini? Peserta tidak akan bisa mengakses link meeting lagi."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Toast
            variant={toastVariant}
            message={toastMessage}
            onClose={() => setShowToast(false)}
            autoDismiss={true}
            duration={2000}
          />
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in-from-bottom-5 {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation-duration: 200ms;
          animation-fill-mode: both;
        }
        .slide-in-from-bottom-5 {
          animation-name: slide-in-from-bottom-5;
        }
      `}</style>
    </div>
  );
}