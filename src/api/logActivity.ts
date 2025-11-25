/**
 * Log Activity API Layer
 * 
 * Following API → Hooks → UI pattern from coding principles
 * - Structured API with consistent response format
 * - Error handling with fallback data
 * - TanStack Query integration
 */

import axios from 'axios';
import { queryOptions } from '@tanstack/react-query';
import { API_BASE_URL, API_CONFIG } from '@/config/api';
import { ApiResponse } from '@/types/api-response';
import {
  LogActivity,
  LogActivityDetail,
  LogActivityQueryParams,
  LogActivityListResponse,
  LogActivityDetailResponse,
  LogActivityStatsResponse,
  LogActivityStats,
  CategoryLogType,
  LogType,
  CategoryLogTypeListResponse,
  LogTypeListResponse,
} from '@/types/log-activity';

// ============================================================================
// API Endpoints
// ============================================================================

const LOG_ACTIVITY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/logs`,
  DETAIL: (id: string) => `${API_BASE_URL}/logs/${id}`,
  STATS: `${API_BASE_URL}/logs/stats`,
  EXPORT: `${API_BASE_URL}/logs/export`,
} as const;

const LOG_MASTER_ENDPOINTS = {
  CATEGORY_LIST: `${API_BASE_URL}/category-log-types`,
  LOG_TYPE_LIST: `${API_BASE_URL}/log-types`,
} as const;

// ============================================================================
// Fallback Data for Error Handling (aligned with new schema)
// ============================================================================

const fallbackLogActivities: LogActivity[] = [];

const fallbackStats: LogActivityStats = {
  totalLogs: 0,
  totalUsers: 0,
  averageSessionDuration: 0,
  mostActiveLogType: '',
  dailyActivityCount: 0,
  weeklyActivityCount: 0,
  monthlyActivityCount: 0,
};

// ============================================================================
// Utility Functions for Data Processing
// ============================================================================

/**
 * Apply filters and sorting to log activities data
 */
const applyFiltersAndSorting = (
  data: LogActivity[],
  _params: LogActivityQueryParams
): LogActivity[] => {
  // Untuk fallback (saat API tidak tersedia), kita kembalikan data apa adanya.
  // Ini menjaga kesederhanaan dan tetap selaras dengan skema LogActivity baru.
  return data;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch log activities with query parameters (returns full paginated response)
 */
export const getLogActivities = async (
  params: LogActivityQueryParams = {},
): Promise<LogActivityListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Build query parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.idLogType) {
      const values = Array.isArray(params.idLogType)
        ? params.idLogType
        : [params.idLogType];
      values.forEach((value) => queryParams.append('idLogType', value));
    }
    if (params.idCategoryLogType) {
      const values = Array.isArray(params.idCategoryLogType)
        ? params.idCategoryLogType
        : [params.idCategoryLogType];
      values.forEach((value) => queryParams.append('idCategoryLogType', value));
    }
    if (params.idUser) queryParams.append('idUser', params.idUser);
    if (params.nameUser) queryParams.append('nameUser', params.nameUser);

    // Map start/endDate to Prisma-style createdAt range filters,
    // following the Knowledge Center pattern (createdAt[gte]/createdAt[lte]).
    if (params.startDate) {
      queryParams.append('createdAt[gte]', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('createdAt[lte]', params.endDate);
    }

    // Map legacy sort option to structured orderBy params (Knowledge Center style)
    if (params.sort) {
      switch (params.sort) {
        case 'newest':
          queryParams.append('orderBy[0][createdAt]', 'desc');
          break;
        case 'oldest':
          queryParams.append('orderBy[0][createdAt]', 'asc');
          break;
        case 'type':
          queryParams.append('orderBy[0][idLogType]', 'asc');
          break;
        case 'user':
          queryParams.append('orderBy[0][nameUser]', 'asc');
          break;
        case 'duration':
          queryParams.append('orderBy[0][duration]', 'desc');
          break;
        default:
          queryParams.append('orderBy[0][createdAt]', 'desc');
      }
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('perPage', params.limit.toString());

    const url = `${LOG_ACTIVITY_ENDPOINTS.LIST}?${queryParams.toString()}`;
    const response = await axios.get<LogActivityListResponse>(url, API_CONFIG);
    
    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch log activities');
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('🔄 [API FALLBACK] Log activities service unavailable, using fallback data');

        const filtered = applyFiltersAndSorting(fallbackLogActivities, params);
        const resultCount = filtered.length;
        const perPage = params.limit ?? (resultCount || 10);

        return {
          success: true,
          status: 200,
          message: 'Fallback log activities',
          data: filtered,
          pageMeta: {
            page: params.page ?? 1,
            perPage,
            hasPrev: false,
            hasNext: false,
            totalPageCount: 1,
            showingFrom: resultCount > 0 ? 1 : 0,
            showingTo: resultCount,
            resultCount,
            totalResultCount: resultCount,
          },
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to connect to log activities service');
    }
    throw error;
  }
};

/**
 * Fetch all category log types
 */
export const getCategoryLogTypes = async (): Promise<CategoryLogType[]> => {
  try {
    const response = await axios.get<CategoryLogTypeListResponse>(
      LOG_MASTER_ENDPOINTS.CATEGORY_LIST,
      API_CONFIG
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch category log types');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('🔄 [API FALLBACK] Category log types service unavailable, using empty list');
        return [];
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch category log types');
    }
    throw error;
  }
};

type CreateCategoryLogTypePayload = {
  name: string;
  description?: string;
};

type CreateLogTypePayload = {
  name: string;
  description?: string;
  idCategoryLogType?: string | null;
};

export const createCategoryLogType = async (
  payload: CreateCategoryLogTypePayload,
): Promise<CategoryLogType> => {
  try {
    const response = await axios.post<ApiResponse<CategoryLogType>>(
      LOG_MASTER_ENDPOINTS.CATEGORY_LIST,
      payload,
      API_CONFIG,
    );

    if (response.data.status !== 201 && response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to create category log type');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create category log type');
    }
    throw error;
  }
};

export const createLogType = async (
  payload: CreateLogTypePayload,
): Promise<LogType> => {
  try {
    const response = await axios.post<ApiResponse<LogType>>(
      LOG_MASTER_ENDPOINTS.LOG_TYPE_LIST,
      payload,
      API_CONFIG,
    );

    if (response.data.status !== 201 && response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to create log type');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create log type');
    }
    throw error;
  }
};

export const updateCategoryLogType = async (
  id: string,
  payload: CreateCategoryLogTypePayload,
): Promise<CategoryLogType> => {
  try {
    const response = await axios.patch<ApiResponse<CategoryLogType>>(
      `${LOG_MASTER_ENDPOINTS.CATEGORY_LIST}/${id}`,
      payload,
      API_CONFIG,
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to update category log type');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update category log type');
    }
    throw error;
  }
};

export const deleteCategoryLogType = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete<ApiResponse<null>>(
      `${LOG_MASTER_ENDPOINTS.CATEGORY_LIST}/${id}`,
      API_CONFIG,
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to delete category log type');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete category log type');
    }
    throw error;
  }
};

export const updateLogType = async (
  id: string,
  payload: CreateLogTypePayload,
): Promise<LogType> => {
  try {
    const response = await axios.patch<ApiResponse<LogType>>(
      `${LOG_MASTER_ENDPOINTS.LOG_TYPE_LIST}/${id}`,
      payload,
      API_CONFIG,
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to update log type');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update log type');
    }
    throw error;
  }
};

export const deleteLogType = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete<ApiResponse<null>>(
      `${LOG_MASTER_ENDPOINTS.LOG_TYPE_LIST}/${id}`,
      API_CONFIG,
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to delete log type');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete log type');
    }
    throw error;
  }
};

/**
 * Fetch all log types
 */
export const getLogTypes = async (): Promise<LogType[]> => {
  try {
    const response = await axios.get<LogTypeListResponse>(
      LOG_MASTER_ENDPOINTS.LOG_TYPE_LIST,
      API_CONFIG
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch log types');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('🔄 [API FALLBACK] Log types service unavailable, using empty list');
        return [];
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch log types');
    }
    throw error;
  }
};

/**
 * Fetch single log activity by ID
 */
export const getLogActivityById = async (id: string): Promise<LogActivityDetail> => {
  try {
    const response = await axios.get<LogActivityDetailResponse>(
      LOG_ACTIVITY_ENDPOINTS.DETAIL(id),
      API_CONFIG
    );
    
    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch log activity');
    }
    
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('🔄 [API FALLBACK] Log activity service unavailable, searching in fallback data');
        
        // Search in fallback data
        const fallbackLog = fallbackLogActivities.find(log => log.id === id);
        if (fallbackLog) {
          return fallbackLog;
        }
        
        throw new Error('Log activity not found');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch log activity');
    }
    throw error;
  }
};

/**
 * Fetch log activity statistics
 */
export const getLogActivityStats = async (): Promise<LogActivityStats> => {
  try {
    const response = await axios.get<LogActivityStatsResponse>(
      LOG_ACTIVITY_ENDPOINTS.STATS,
      API_CONFIG
    );
    
    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch log activity stats');
    }
    
    // The backend currently wraps stats inside data.stats with different field names.
    // Normalize it into our LogActivityStats structure used by the UI.
    const rawData: any = response.data.data ?? {};
    const rawStats: any = rawData.stats ?? rawData;

    const normalized: LogActivityStats = {
      totalLogs: typeof rawStats.totalLogs === 'number' ? rawStats.totalLogs : 0,
      totalUsers: typeof rawStats.activeUsers === 'number' ? rawStats.activeUsers : 0,
      // Backend does not yet provide session duration; keep 0 for now.
      averageSessionDuration: 0,
      mostActiveLogType: typeof rawStats.mostActive === 'string' ? rawStats.mostActive : '',
      dailyActivityCount: typeof rawStats.todayCount === 'number' ? rawStats.todayCount : 0,
      weeklyActivityCount: typeof rawStats.weekCount === 'number' ? rawStats.weekCount : 0,
      // Backend may add this later; default to 0 to keep UI stable.
      monthlyActivityCount: typeof rawStats.monthCount === 'number' ? rawStats.monthCount : 0,
    };

    return normalized;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn('\ud83d\udd04 [API FALLBACK] Log activity stats service unavailable or failed, using fallback data', error);
      return fallbackStats;
    }
    console.error('\u274c [API ERROR] Unexpected error while fetching log activity stats:', error);
    return fallbackStats;
  }
};

/**
 * Export log activities
 */
export const exportLogActivities = async (
  format: 'csv' | 'excel' | 'pdf',
  params: LogActivityQueryParams = {}
): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    // Add filter parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(`${key}[]`, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const url = `${LOG_ACTIVITY_ENDPOINTS.EXPORT}?${queryParams.toString()}`;
    const response = await axios.get(url, {
      ...API_CONFIG,
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to export log activities');
    }
    throw error;
  }
};

// ============================================================================
// TanStack Query Options
// ============================================================================

/**
 * Query options for log activities list
 */
export const getLogActivitiesQueryOptions = (params: LogActivityQueryParams = {}) => {
  return queryOptions({
    queryKey: ['log-activities', params],
    queryFn: () => getLogActivities(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount: number, error: Error) => {
      // Don't retry on 404 or network errors
      if (error.message?.includes('service unavailable')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
};

/**
 * Query options for single log activity
 */
export const getLogActivityDetailQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['log-activity', id],
    queryFn: () => getLogActivityById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};

/**
 * Query options for log activity statistics
 */
export const getLogActivityStatsQueryOptions = () => {
  return queryOptions({
    queryKey: ['log-activity-stats'],
    queryFn: getLogActivityStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount: number, error: Error) => {
      if (error.message?.includes('service unavailable')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Query options for category log types list
 */
export const getCategoryLogTypesQueryOptions = () => {
  return queryOptions({
    queryKey: ['category-log-types'],
    queryFn: () => getCategoryLogTypes(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Query options for log types list
 */
export const getLogTypesQueryOptions = () => {
  return queryOptions({
    queryKey: ['log-types'],
    queryFn: () => getLogTypes(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build query key for cache invalidation
 */
export const getLogActivitiesQueryKey = (params: LogActivityQueryParams = {}) => {
  return ['log-activities', params];
};

/**
 * Transform query params for API compatibility
 */
export const transformQueryParams = (params: LogActivityQueryParams): Record<string, unknown> => {
  const transformed: Record<string, unknown> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        transformed[`${key}[]`] = value;
      } else {
        transformed[key] = value;
      }
    }
  });
  
  return transformed;
};
