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
    isDeleting,
    isUpdating,
  } = useKnowledgeManagementPage({
    router,
    onSuccess: toastState.showSuccess,
    onError: toastState.showError,
  });

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
        onDelete={() => {}} // Placeholder for delete functionality
        onDuplicate={() => {}} // Placeholder for duplicate functionality
        onToggleStatus={handleToggleStatus}
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
          <div className="pt-2 hidden md:block">
            <Breadcrumb separator="chevron" items={breadcrumbItems} />
          </div>

          <div className="pt-2 block md:hidden">
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
    </div>
  );
}
