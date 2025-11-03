"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast/Toast";
import { useCreateForum, useUpdateForum } from "@/api/forums";
import { useQueryClient } from "@tanstack/react-query";
import type { Forum, CreateForumRequest, UpdateForumRequest } from "@/api/forums";

export interface ForumDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  forum?: Forum | null; // null for create, existing forum for edit
  onShowToast?: (toast: { variant: 'success' | 'warning'; message: string }) => void;
}

const forumTypeOptions = [
  { value: "course", label: "Course Forum" },
  { value: "general", label: "General Forum" },
];

const mockCourseOptions = [
  { value: "123e4567-e89b-12d3-a456-426614174001", label: "Pengembangan Web Fundamental" },
  { value: "123e4567-e89b-12d3-a456-426614174002", label: "React dan Next.js" },
  { value: "123e4567-e89b-12d3-a456-426614174003", label: "Database dan Backend" },
];

export function ForumDrawer({ isOpen, onClose, forum, onShowToast }: ForumDrawerProps) {
  const queryClient = useQueryClient();
  const createForumMutation = useCreateForum();
  const updateForumMutation = useUpdateForum();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general" as "course" | "general",
    idCourse: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!forum;
  const isLoading = createForumMutation.isPending || updateForumMutation.isPending;

  // Reset form when drawer opens/closes or forum changes
  useEffect(() => {
    if (isOpen) {
      if (forum) {
        // Edit mode - populate with existing data
        setFormData({
          title: forum.title || "",
          description: forum.description || "",
          type: forum.type || "general",
          idCourse: forum.idCourse || "",
        });
      } else {
        // Create mode - reset to empty
        setFormData({
          title: "",
          description: "",
          type: "general",
          idCourse: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, forum]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul forum harus diisi";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Judul forum minimal 3 karakter";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Deskripsi forum harus diisi";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Deskripsi forum minimal 10 karakter";
    }

    if (formData.type === "course" && !formData.idCourse) {
      newErrors.idCourse = "Pilih course untuk forum bertipe 'Course'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && forum) {
        // Update existing forum
        const updateData: UpdateForumRequest = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          idCourse: formData.type === "course" ? formData.idCourse : undefined,
        };

        await updateForumMutation.mutateAsync({
          id: forum.id,
          data: updateData
        });

        // Show success toast
        onShowToast?.({
          variant: 'success',
          message: 'Forum berhasil diperbarui!'
        });

        // Close drawer
        onClose();
      } else {
        // Create new forum
        const createData: CreateForumRequest = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          idCourse: formData.type === "course" ? formData.idCourse : undefined,
        };

        await createForumMutation.mutateAsync(createData);

        // Show success toast
        onShowToast?.({
          variant: 'success',
          message: 'Forum baru berhasil dibuat!'
        });

        // Close drawer
        onClose();
      }

      // Invalidate and refetch forums data
      queryClient.invalidateQueries({ queryKey: ["forums"] });
    } catch (error) {
      console.error("Failed to save forum:", error);

      // Show error toast
      onShowToast?.({
        variant: 'warning',
        message: error instanceof Error ? error.message : "Gagal menyimpan forum. Silakan coba lagi."
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-50 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                {isEditing ? "Edit Forum" : "Buat Forum Baru"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing
                  ? "Perbarui informasi forum yang ada"
                  : "Tambah forum baru untuk diskusi"
                }
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content - No scroll */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 px-6 py-6 space-y-6">
            {/* Forum Type */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-zinc-900">
                Tipe Forum
              </label>
              <div className="grid grid-cols-1 gap-3">
                {forumTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.type === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="forumType"
                      value={option.value}
                      checked={formData.type === option.value}
                      onChange={(e) => {
                        setFormData({ ...formData, type: e.target.value as "course" | "general" });
                        if (e.target.value !== "course") {
                          setFormData(prev => ({ ...prev, idCourse: "" }));
                        }
                      }}
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="ml-3 text-sm font-medium text-zinc-900">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Forum Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Judul Forum
              </label>
              <Input
                type="text"
                placeholder="e.g. Introduction to React"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: "" });
                  }
                }}
                className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Forum Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <Textarea
                placeholder="Deskripsi singkat tentang konten forum..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: "" });
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Course Selection (only for course forums) */}
            {formData.type === "course" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Course Terkait
                </label>
                <select
                  value={formData.idCourse}
                  onChange={(e) => {
                    setFormData({ ...formData, idCourse: e.target.value });
                    if (errors.idCourse) {
                      setErrors({ ...errors, idCourse: "" });
                    }
                  }}
                  className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                  disabled={isLoading}
                >
                  <option value="">Pilih Course</option>
                  {mockCourseOptions.map((course) => (
                    <option key={course.value} value={course.value}>
                      {course.label}
                    </option>
                  ))}
                </select>
                {errors.idCourse && (
                  <p className="text-xs text-red-500 mt-1">{errors.idCourse}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions - Fixed at bottom */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 h-10 rounded-lg border border-gray-200 text-zinc-900 hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="px-4 py-2 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 text-sm"
              >
                {isEditing ? (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Perbarui Forum
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Buat Forum
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}