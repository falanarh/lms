/**
 * Log Activity Management Page
 * 
 * Following the API → Hooks → UI pattern from coding principles
 * - Page component focuses solely on UI rendering and user interactions
 * - All business logic extracted to custom hooks
 * - Clean separation of concerns for better maintainability
 * - Type-safe with full TypeScript support
 */

'use client';

import React from 'react';
import { Breadcrumb } from '@/components/ui/Breadcrumb/Breadcrumb';
import { Button } from '@/components/ui/Button/Button';
import { RefreshCw } from 'lucide-react';
import { useLogActivityManagementPage, useLogActivityTableState } from '@/hooks/useLogActivity';
import { useToast } from '@/hooks/useToast';
import LogActivityStats from '@/components/log-activity/LogActivityStats';
import LogActivityFilters from '@/components/log-activity/LogActivityFilters';
import LogActivityTable from '@/components/log-activity/LogActivityTable';
import LogMasterDataManagement from '@/components/log-activity/LogMasterDataManagement';
import { Toast } from '@/components/ui/Toast/Toast';

export const dynamic = 'force-dynamic';

// ============================================================================
// Constants
// ============================================================================

const breadcrumbItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Log Activity Management', href: '/log-activity' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function LogActivityManagementPage() {
  const toastState = useToast();

  // ============================================================================
  // Business Logic Hook
  // ============================================================================

  // Shared filter state management
  const filterState = useLogActivityTableState();

  const {
    handleRefresh,
    handleExport,
    isExporting,
    exportError,
  } = useLogActivityManagementPage({
    onSuccess: toastState.showSuccess,
    onError: toastState.showError,
  });

  // Handle clear filters
  const handleClearFilters = () => {
    filterState.clearFilters();
    toastState.showSuccess('Filters cleared');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="py-6 space-y-8">
          {/* Breadcrumb */}
          <div className="hidden md:block -ml-2">
            <Breadcrumb separator="chevron" items={breadcrumbItems} />
          </div>

          <div className="block md:hidden -ml-2">
            <Breadcrumb separator="slash" items={breadcrumbItems} size="sm" />
          </div>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-bold text-3xl lg:text-4xl text-zinc-900 tracking-tight">
                Log Activity Management
              </h1>
              <p className="text-base text-zinc-600 leading-relaxed">
                Monitor and analyze user activities across the platform
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
                  {/* <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button> */}
                  <Button
                    onClick={handleRefresh}
                    // variant="outline"
                    size="sm"
                    className="flex justify-center items-center gap-1"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Refresh
                  </Button>
            </div>
          </div>

          {/* Statistics Section */}
          <LogActivityStats />

          {/* Advanced Filters */}
          <LogActivityFilters
            filterState={filterState}
            onClearFilters={handleClearFilters}
          />

          {/* Main Table */}
          <LogActivityTable
            filterState={filterState}
            onRefresh={handleRefresh}
            onExport={handleExport}
            isExporting={isExporting}
          />

          <LogMasterDataManagement />
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

      {/* Export Error Toast */}
      {exportError && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            variant="warning"
            message={`Export failed: ${exportError.message}`}
            onClose={() => {}}
            autoDismiss
            duration={5000}
          />
        </div>
      )}
    </div>
  );
}
