"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { ForumListContainer } from "@/components/shared/ForumList/ForumList";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ForumDrawer } from "@/components/ui/Drawer/ForumDrawer";
import { Toast } from "@/components/ui/Toast/Toast";
import { useForums } from "@/hooks/useForums";
import { createToastState } from "@/utils/toastUtils";
import type { Forum } from "@/api/forums";

export default function ForumPage() {
  const { data: forums = [], isLoading, error, refetch } = useForums();
  const toastState = createToastState();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Forum", isActive: true },
  ];

  // State untuk UI
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingForum, setEditingForum] = useState<Forum | null>(null);

  // Event handlers
  const handleCreateForum = () => setIsCreateDrawerOpen(true);
  const handleEditForum = (forum: Forum) => setEditingForum(forum);
  const handleCloseDrawer = () => {
    setIsCreateDrawerOpen(false);
    setEditingForum(null);
  };

  const handleShowToast = (message: { variant: 'success' | 'warning'; message: string }) => {
    if (message.variant === 'success') {
      toastState.showSuccess(message.message);
    }
  };

  return (
    <div className="container mx-auto px-16 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Forum Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Forum</h1>
          <p className="text-gray-600">
            Temukan berbagai diskusi menarik seputar teknologi dan pengembangan perangkat lunak.
          </p>
        </div>
        <Button
          onClick={handleCreateForum}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          Buat Forum
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-800">Gagal memuat forum</h3>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Forum List */}
      <ForumListContainer
        forums={forums}
        showSearch={true}
        searchPlaceholder="Cari forum berdasarkan judul atau deskripsi..."
        enableFilter={true}
        isLoading={isLoading}
        onEditForum={handleEditForum}
      />

      {/* Create/Edit Forum Drawer */}
      <ForumDrawer
        isOpen={isCreateDrawerOpen || !!editingForum}
        onClose={handleCloseDrawer}
        forum={editingForum}
        onShowToast={handleShowToast}
      />

      {/* Toast */}
      {toastState.toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
          <Toast
            variant={toastState.toast?.variant}
            message={toastState.toast?.message}
            onClose={toastState.dismissToast}
            autoDismiss
            duration={4000}
            dismissible
          />
        </div>
      )}
    </div>
  );
}
