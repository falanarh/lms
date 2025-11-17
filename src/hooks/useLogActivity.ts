/**
 * Log Activity Custom Hook
 * 
 * Following API → Hooks → UI pattern from coding principles
 * - Entity-based hook for LogActivity domain
 * - Data fetching with TanStack Query
 * - State management and business logic separation
 */

'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLogActivities,
  getLogActivityById,
  getLogActivityStats,
  exportLogActivities,
  getLogActivitiesQueryOptions,
  getLogActivityStatsQueryOptions,
  getLogActivityDetailQueryOptions,
} from '@/api/logActivity';
import {
  LogActivity,
  LogActivityQueryParams,
  LogActivityStats,
  LogType,
  LogCategory,
  SortOption,
} from '@/types/log-activity';

// ============================================================================
// Entity-Based Hooks (Following Coding Principles)
// ============================================================================

/**
 * Hook for fetching log activities list with query parameters
 */
export const useLogActivities = (params: LogActivityQueryParams = {}) => {
  const {
    data: logActivities = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(getLogActivitiesQueryOptions(params));

  // Calculate total and pagination info from response
  const total = logActivities.length;
  const totalPages = params.limit ? Math.ceil(total / params.limit) : 1;

  return {
    data: logActivities as LogActivity[],
    isLoading,
    isFetching,
    error,
    refetch,
    total,
    totalPages,
  };
};

/**
 * Hook for fetching single log activity by ID
 */
export const useLogActivityById = (id: string) => {
  return useQuery({
    ...getLogActivityDetailQueryOptions(id),
    enabled: !!id,
  });
};

/**
 * Hook for fetching log activity statistics
 */
export const useLogActivityStats = () => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery(getLogActivityStatsQueryOptions());

  return {
    data: stats as LogActivityStats,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for exporting log activities
 */
export const useExportLogActivities = () => {
  const exportMutation = useMutation({
    mutationFn: ({ format, params }: { 
      format: 'csv' | 'excel' | 'pdf'; 
      params: LogActivityQueryParams;
    }) => exportLogActivities(format, params),
    onSuccess: () => {
      console.log('🔄 [EXPORT SUCCESS] Log activities exported successfully');
    },
    onError: (error) => {
      console.error('❌ [EXPORT ERROR] Failed to export log activities:', error);
    },
  });

  const handleExport = async (
    format: 'csv' | 'excel' | 'pdf',
    params: LogActivityQueryParams = {},
    filename?: string
  ) => {
    try {
      const blob = await exportMutation.mutateAsync({ format, params });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `log-activities-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  return {
    handleExport,
    isExporting: exportMutation.isPending,
    exportError: exportMutation.error,
  };
};

// ============================================================================
// Business Logic Hooks for Page Components
// ============================================================================

/**
 * Business logic hook for Log Activity Management Page
 */
export const useLogActivityManagementPage = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { handleExport, isExporting, exportError } = useExportLogActivities();

  // Handle refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['log-activities'],
    });
    queryClient.invalidateQueries({
      queryKey: ['log-activity-stats'],
    });
    onSuccess?.('Data refreshed successfully');
  };

  // Handle export with error handling
  const handleExportWithFeedback = async (
    format: 'csv' | 'excel' | 'pdf',
    params: LogActivityQueryParams = {}
  ) => {
    try {
      await handleExport(format, params);
      onSuccess?.(`Log activities exported as ${format.toUpperCase()}`);
    } catch (error) {
      onError?.(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    // This will be handled by the page component state
    onSuccess?.('Filters cleared');
  };

  return {
    handleRefresh,
    handleExport: handleExportWithFeedback,
    handleClearFilters,
    isExporting,
    exportError,
  };
};

// ============================================================================
// Utility Hooks for UI State Management
// ============================================================================

/**
 * Hook for managing log activity table state
 */
export const useLogActivityTableState = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLogTypes, setSelectedLogTypes] = React.useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [dateRange, setDateRange] = React.useState<{
    start?: Date;
    end?: Date;
  }>({});
  const [sortBy, setSortBy] = React.useState('newest');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(25);
  const [selectedUserName, setSelectedUserName] = React.useState<string>('');
  const [selectedCourseName, setSelectedCourseName] = React.useState<string>('');

  // Build query parameters
  const queryParams: LogActivityQueryParams = React.useMemo(() => ({
    search: searchQuery || undefined,
    logType: selectedLogTypes.length > 0 ? selectedLogTypes as LogType[] : undefined,
    category: selectedCategory !== 'all' ? selectedCategory as LogCategory : undefined,
    userName: selectedUserName || undefined,
    courseName: selectedCourseName || undefined,
    startDate: dateRange.start?.toISOString(),
    endDate: dateRange.end?.toISOString(),
    sort: sortBy as SortOption,
    page: currentPage,
    limit: itemsPerPage,
    includeMetadata: true,
  }), [
    searchQuery,
    selectedLogTypes,
    selectedCategory,
    selectedUserName,
    selectedCourseName,
    dateRange,
    sortBy,
    currentPage,
    itemsPerPage,
  ]);

  // Check if filters are active
  const hasActiveFilters = React.useMemo(() => {
    return !!(
      searchQuery ||
      selectedLogTypes.length > 0 ||
      selectedCategory !== 'all' ||
      selectedUserName ||
      selectedCourseName ||
      dateRange.start ||
      dateRange.end
    );
  }, [searchQuery, selectedLogTypes, selectedCategory, selectedUserName, selectedCourseName, dateRange]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLogTypes([]);
    setSelectedCategory('all');
    setSelectedUserName('');
    setSelectedCourseName('');
    setDateRange({});
    setCurrentPage(1);
  };

  return {
    // State
    searchQuery,
    selectedLogTypes,
    selectedCategory,
    dateRange,
    sortBy,
    currentPage,
    itemsPerPage,
    selectedUserName,
    selectedCourseName,
    queryParams,
    hasActiveFilters,

    // Setters
    setSearchQuery,
    setSelectedLogTypes,
    setSelectedCategory,
    setDateRange,
    setSortBy,
    setCurrentPage,
    setItemsPerPage,
    setSelectedUserName,
    setSelectedCourseName,
    clearFilters,
  };
};

