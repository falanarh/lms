"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { useCreateForum, useUpdateForum } from "@/api/forums";
import { useQueryClient } from "@tanstack/react-query";
import type { Forum, CreateForumRequest, UpdateForumRequest } from "@/api/forums";

interface ForumModalProps {
  isOpen: boolean;
  onClose: () => void;
  forum?: Forum | null; // null for create, existing forum for edit
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

export function ForumModal({ isOpen, onClose, forum }: ForumModalProps) {
  const queryClient = useQueryClient();
  const createForumMutation = useCreateForum();
  const updateForumMutation = useUpdateForum();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general" as "course" | "general",
    idCourse: "",
  });

  const isEditing = !!forum;
  const isLoading = createForumMutation.isPending || updateForumMutation.isPending;

  // Reset form when modal opens/closes or forum changes
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
    }
  }, [isOpen, forum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert("⚠️ Judul forum harus diisi");
      return;
    }

    if (formData.title.trim().length < 3) {
      alert("⚠️ Judul forum minimal 3 karakter");
      return;
    }

    if (!formData.description.trim()) {
      alert("⚠️ Deskripsi forum harus diisi");
      return;
    }

    if (formData.description.trim().length < 10) {
      alert("⚠️ Deskripsi forum minimal 10 karakter");
      return;
    }

    if (formData.type === "course" && !formData.idCourse) {
      alert("⚠️ Pilih course untuk forum bertipe 'Course'");
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

        alert("✅ Forum berhasil diperbarui!");
      } else {
        // Create new forum
        const createData: CreateForumRequest = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          idCourse: formData.type === "course" ? formData.idCourse : undefined,
        };

        await createForumMutation.mutateAsync(createData);

        alert("✅ Forum berhasil dibuat!");
      }

      // Invalidate and refetch forums data
      queryClient.invalidateQueries({ queryKey: ["forums"] });

      // Close modal
      onClose();
    } catch (error) {
      console.error("Failed to save forum:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan forum. Silakan coba lagi.";
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isEditing
                    ? "bg-orange-100 text-orange-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isEditing ? "Edit Forum" : "Buat Forum Baru"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {isEditing
                      ? "Perbarui informasi forum yang ada"
                      : "Tambah forum baru untuk diskusi"
                    }
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Forum Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipe Forum <span className="text-red-500">*</span>
              </label>
              <Dropdown
                label="Pilih tipe forum"
                items={forumTypeOptions}
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as "course" | "general" })}
                placeholder="Pilih tipe forum"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                {formData.type === "course"
                  ? "Forum untuk diskusi terkait course tertentu"
                  : "Forum untuk diskusi umum dan topik teknologi lainnya"
                }
              </p>
            </div>

            {/* Course Selection (only for course forums) */}
            {formData.type === "course" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Course Terkait <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  label="Pilih course"
                  items={mockCourseOptions}
                  value={formData.idCourse}
                  onChange={(value) => setFormData({ ...formData, idCourse: value })}
                  placeholder="Pilih course terkait"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Pilih course yang terkait dengan forum ini
                </p>
              </div>
            )}

            {/* Forum Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Judul Forum <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Masukkan judul forum (minimal 3 karakter)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* Forum Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Deskripsi Forum <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Jelaskan tujuan dan fokus forum ini (minimal 10 karakter)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Deskripsi akan membantu pengguna memahami tujuan dari forum ini
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className={`px-6 ${
                  isEditing
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {isLoading
                  ? (isEditing ? "Menyimpan..." : "Membuat...")
                  : (isEditing ? "Perbarui Forum" : "Buat Forum")
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}