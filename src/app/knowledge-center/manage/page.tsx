/**
 * Knowledge Center Management Page
 * 
 * Following the API → Hooks → UI pattern from coding principles
 * - Page component focuses solely on UI rendering and user interactions
 * - All business logic extracted to custom hooks
 * - Clean separation of concerns for better maintainability
 * - Type-safe with full TypeScript support
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import Tabs, { TabItem } from '@/components/ui/Tabs';
import { Toast } from '@/components/ui/Toast/Toast';
import { createToastState } from '@/utils/toastUtils';
import KnowledgeManagementList from '@/components/knowledge-center/manage/KnowledgeManagementList';
import KnowledgeManagementStats from '@/components/knowledge-center/manage/KnowledgeManagementStats';
import { useKnowledgeManagementPage } from '@/hooks/useKnowledgeCenter';
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal';

export const dynamic = 'force-dynamic';

// ============================================================================
// Constants
// ============================================================================

const breadcrumbItems = [
  { label: 'Knowledge Center', href: '/knowledge-center' },
  { label: 'Management', href: '/knowledge-center/manage' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function KnowledgeManagementPage() {
  const router = useRouter();
  const toastState = createToastState();
  const [activeTab, setActiveTab] = useState('knowledge-list');

  // ============================================================================
  // Business Logic Hook
  // ============================================================================

  const {
    handleEdit,
    handleToggleStatus,
    deleteKnowledge,
    bulkDeleteKnowledge,
    isDeleting,
    isUpdating,
  } = useKnowledgeManagementPage({
    router,
    onSuccess: toastState.showSuccess,
    onError: toastState.showError,
  });

  // Delete confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [targetIds, setTargetIds] = useState<string[]>([]);

  // Publish/Unpublish confirmation modal state
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish' | 'unschedule'>('publish');
  const [publishTargetId, setPublishTargetId] = useState<string | null>(null);
  const [publishTargetTitle, setPublishTargetTitle] = useState<string>('');

  const requestDelete = (id: string) => {
    setDeleteMode('single');
    setTargetId(id);
    setConfirmOpen(true);
  };

  const requestBulkDelete = (ids: string[]) => {
    setDeleteMode('bulk');
    setTargetIds(ids);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteMode === 'single' && targetId) {
        await deleteKnowledge(targetId);
      } else if (deleteMode === 'bulk' && targetIds.length > 0) {
        await bulkDeleteKnowledge(targetIds);
      }
      setConfirmOpen(false);
      setTargetId(null);
      setTargetIds([]);
    } catch {
      // Error handled by hook toasts
    }
  };

  const requestPublishToggle = (id: string, currentStatus: boolean, title: string) => {
    // For now, we'll keep the simple logic but this will be enhanced
    // to handle scheduled status in the future
    setPublishAction(currentStatus ? 'unpublish' : 'publish');
    setPublishTargetId(id);
    setPublishTargetTitle(title);
    setPublishConfirmOpen(true);
  };

  const handleConfirmPublish = async () => {
    try {
      if (publishTargetId) {
        const newStatus = publishAction === 'publish';
        await handleToggleStatus(publishTargetId, newStatus);
      }
      setPublishConfirmOpen(false);
      setPublishTargetId(null);
      setPublishTargetTitle('');
    } catch {
      // Error handled by hook toasts
    }
  };

  // ============================================================================
  // Tab Configuration
  // ============================================================================

  const tabItems: TabItem[] = [
    { key: 'knowledge-list', label: 'Knowledge Centers' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'settings', label: 'Settings' },
  ];

  const panels = {
    'knowledge-list': (
      <KnowledgeManagementList
        onEdit={handleEdit}
        onDelete={requestDelete}
        onBulkDelete={requestBulkDelete}
        onDuplicate={() => {}} // Placeholder for duplicate functionality
        onToggleStatus={requestPublishToggle}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
      />
    ),
    'analytics': (
      <KnowledgeManagementStats />
    ),
    'settings': (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <p className="text-gray-600">Knowledge center settings will be available here.</p>
      </div>
    ),
  } as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="py-6 space-y-6">
          {/* Breadcrumb */}
          <div className="pt-2 hidden md:block -ml-2">
            <Breadcrumb separator="chevron" items={breadcrumbItems} />
          </div>

          <div className="pt-2 block md:hidden -ml-2">
            <Breadcrumb separator="slash" items={breadcrumbItems} size="sm" />
          </div>

          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="font-bold text-3xl lg:text-4xl text-zinc-900 tracking-tight">
              Knowledge Center Management
            </h1>
            <p className="text-base text-zinc-600 leading-relaxed">
              Kelola knowledge center, lihat analytics, dan atur pengaturan
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-8">
          <Tabs
            items={tabItems}
            panels={panels}
            activeKey={activeTab}
            onChange={setActiveTab}
            variant="underline"
            size="lg"
          />
        </div>
      </div>

      {/* Toast Notifications */}
      {toastState.toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            variant={toastState.toast.variant}
            message={toastState.toast.message}
            onClose={toastState.dismissToast}
            autoDismiss
            duration={5000}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deleteMode === 'single' ? 'Hapus Knowledge Center' : 'Hapus Knowledge Center Terpilih'}
        message={
          deleteMode === 'single'
            ? 'Apakah Anda yakin ingin menghapus knowledge center ini? Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${targetIds.length} knowledge center terpilih? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Publish/Unpublish Confirmation Modal */}
      <ConfirmModal
        isOpen={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        onConfirm={handleConfirmPublish}
        title={
          publishAction === 'publish' 
            ? 'Publikasikan Knowledge Center' 
            : publishAction === 'unschedule'
            ? 'Batalkan Jadwal Knowledge Center'
            : 'Batalkan Publikasi Knowledge Center'
        }
        message={
          publishAction === 'publish'
            ? `Apakah Anda yakin ingin mempublikasikan "${publishTargetTitle}"? Knowledge center ini akan dapat diakses oleh semua pengguna.`
            : publishAction === 'unschedule'
            ? `Apakah Anda yakin ingin membatalkan jadwal publikasi "${publishTargetTitle}"? Knowledge center ini akan menjadi draft.`
            : `Apakah Anda yakin ingin membatalkan publikasi "${publishTargetTitle}"? Knowledge center ini akan menjadi draft dan tidak dapat diakses oleh pengguna lain.`
        }
        confirmText={
          publishAction === 'publish' 
            ? 'Publikasikan' 
            : publishAction === 'unschedule'
            ? 'Batalkan Jadwal'
            : 'Batalkan Publikasi'
        }
        cancelText="Batal"
        variant={publishAction === 'publish' ? 'info' : 'warning'}
        isLoading={isUpdating}
      />
    </div>
  );
}
