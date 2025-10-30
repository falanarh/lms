"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { ForumListContainer } from "@/components/shared/ForumList/ForumList";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ForumModal } from "@/components/ui/Modal/ForumModal";
import { useForums } from "@/hooks/useForums";
import type { Forum } from "@/api/forums";

// Fallback data jika API gagal
const fallbackForums: Forum[] = [
  {
    id: "1",
    title: "Pengembangan Web Fundamental",
    description:
      "Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.",
    type: "course",
    lastActivity: "2023-10-28T10:30:00Z",
    totalTopics: 42,
  },
  {
    id: "2",
    title: "React dan Next.js",
    description:
      "Berbagi pengetahuan tentang React, Next.js, dan ekosistemnya.",
    type: "course",
    lastActivity: "2023-10-27T15:45:00Z",
    totalTopics: 38,
  },
  {
    id: "3",
    title: "Umum",
    description:
      "Diskusi umum tentang topik teknologi dan pengembangan perangkat lunak.",
    type: "general",
    lastActivity: "2023-10-28T08:15:00Z",
    totalTopics: 67,
  },
];

export default function ForumPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingForum, setEditingForum] = useState<Forum | null>(null);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Forum", isActive: true },
  ];

  const { data: forums = fallbackForums, isLoading, error, refetch } = useForums();

  return (
    <div className="container mx-auto px-16 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Forum Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Forum</h1>
          <p className="text-gray-600">
            Temukan berbagai diskusi menarik seputar teknologi dan pengembangan perangkat lunak.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
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

      <ForumListContainer
        forums={forums}
        className=""
        title=""
        showSearch={true}
        searchPlaceholder="Cari forum berdasarkan judul atau deskripsi..."
        enableFilter={true}
        isLoading={isLoading}
        onEditForum={(forum) => setEditingForum(forum)}
      />

      {/* Create/Edit Forum Modal */}
      <ForumModal
        isOpen={isCreateModalOpen || !!editingForum}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingForum(null);
        }}
        forum={editingForum}
      />
    </div>
  );
}
