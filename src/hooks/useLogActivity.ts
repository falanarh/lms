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
  exportLogActivities,
  getLogActivitiesQueryOptions,
  getLogActivityStatsQueryOptions,
  getLogActivityDetailQueryOptions,
  getCategoryLogTypesQueryOptions,
  getLogTypesQueryOptions,
  createCategoryLogType,
  createLogType,
  updateCategoryLogType,
  deleteCategoryLogType,
  updateLogType,
  deleteLogType,
} from '@/api/logActivity';
import {
  LogActivity,
  LogActivityQueryParams,
  LogActivityStats,
  SortOption,
  CategoryLogType,
  LogType,
  LogActivityListResponse,
} from '@/types/log-activity';

// ============================================================================
// Entity-Based Hooks (Following Coding Principles)
// ============================================================================

/**
 * Hook for fetching log activities list with query parameters
 * Uses backend pageMeta for accurate pagination, similar to Knowledge Center.
 */
export const useLogActivities = (params: LogActivityQueryParams = {}) => {
  const queryResult = useQuery(getLogActivitiesQueryOptions(params));

  const response = queryResult.data as LogActivityListResponse | undefined;
  const items = (response?.data || []) as LogActivity[];
  const pageMeta = response?.pageMeta;

  const total = pageMeta?.totalResultCount ?? items.length;
  const page = pageMeta?.page ?? params.page ?? 1;
  const fallbackLimit = items.length || 10;
  const limit = pageMeta?.perPage ?? params.limit ?? fallbackLimit;
  const totalPages = pageMeta?.totalPageCount ?? (limit ? Math.max(1, Math.ceil(total / limit)) : 1);

  return {
    data: items,
    page,
    limit,
    total,
    totalPages,
    pageMeta,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
};

/**
 * Hook for fetching all category log types (master data)
 */
export const useCategoryLogTypes = () => {
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery(getCategoryLogTypesQueryOptions());

  return {
    data: categories as CategoryLogType[],
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching all log types (master data)
 */
export const useLogTypes = () => {
  const {
    data: logTypes = [],
    isLoading,
    error,
    refetch,
  } = useQuery(getLogTypesQueryOptions());

  return {
    data: logTypes as LogType[],
    isLoading,
    error,
    refetch,
  };
};

export const useCreateCategoryLogType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategoryLogType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-log-types'] });
    },
  });
};

export const useCreateLogType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLogType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log-types'] });
    },
  });
};

export const useUpdateCategoryLogType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; description?: string } }) =>
      updateCategoryLogType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-log-types'] });
    },
  });
};

export const useDeleteCategoryLogType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryLogType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-log-types'] });
    },
  });
};

export const useUpdateLogType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; description?: string; idCategoryLogType?: string | null } }) =>
      updateLogType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log-types'] });
    },
  });
};

export const useDeleteLogType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLogType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log-types'] });
    },
  });
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
  const [selectedLogTypes, setSelectedLogTypes] = React.useState<string[]>([]); // array of idLogType
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all'); // idCategoryLogType or 'all'
  const [dateRange, setDateRange] = React.useState<{
    start?: Date;
    end?: Date;
  }>({});
  const [sortBy, setSortBy] = React.useState('newest');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(25);
  const [selectedUserName, setSelectedUserName] = React.useState<string>('');

  // Build query parameters (DB-aligned)
  const queryParams: LogActivityQueryParams = React.useMemo(() => ({
    search: searchQuery || undefined,
    idLogType: selectedLogTypes.length > 0 ? selectedLogTypes : undefined,
    idCategoryLogType: selectedCategory !== 'all' ? selectedCategory : undefined,
    nameUser: selectedUserName || undefined,
    startDate: dateRange.start?.toISOString(),
    endDate: dateRange.end?.toISOString(),
    sort: sortBy as SortOption,
    page: currentPage,
    limit: itemsPerPage,
  }), [
    searchQuery,
    selectedLogTypes,
    selectedCategory,
    selectedUserName,
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
      dateRange.start ||
      dateRange.end
    );
  }, [searchQuery, selectedLogTypes, selectedCategory, selectedUserName, dateRange]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLogTypes([]);
    setSelectedCategory('all');
    setSelectedUserName('');
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
    clearFilters,
  };
};

