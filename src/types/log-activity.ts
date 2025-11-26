/**
 * Log Activity Types
 * 
 * Following API-First TypeScript principles
 * 100% API structure alignment without custom wrappers
 */

import { PaginatedApiResponse, ApiResponse } from './api-response';

// ============================================================================
// DB-aligned Entity Types (Log, LogType, CategoryLogType)
// ============================================================================

export interface CategoryLogType {
  id: string;
  name: string;
  description?: string | null;
}

export interface LogType {
  id: string;
  idCategoryLogType?: string | null;
  name: string;
  description?: string | null;
  categoryLogType?: CategoryLogType | null;
}

/**
 * LogActivity entity
 *
 * Aligned 1:1 dengan model Log di backend dan response /api/v1/logs
 * (tidak ada field tambahan atau rename di sisi frontend).
 */
export interface LogActivity {
  id: string;
  timestamp: string;
  idUser: string;
  nameUser: string;
  details: string;
  duration: number | null;
  idLogType: string;
  idCategoryLogType: string;
}

export interface LogActivityDetail extends LogActivity {
  logType?: {
    name: string;
    description?: string | null;
  };
  categoryLogType?: {
    name: string;
    description?: string | null;
  };
}

/**
 * Statistik agregat untuk log activity.
 * Struktur ini mengikuti kontrak API stats (jika tersedia).
 */
export interface LogActivityStats {
  totalLogs: number;
  totalUsers: number;
  averageSessionDuration: number;
  mostActiveLogType: string;
  dailyActivityCount: number;
  weeklyActivityCount: number;
  monthlyActivityCount: number;
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  TYPE: 'type',
  USER: 'user',
  DURATION: 'duration',
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

export interface LogActivityQueryParams {
  search?: string;
  idLogType?: string | string[];
  idCategoryLogType?: string | string[];
  idUser?: string;
  nameUser?: string;
  startDate?: string;
  endDate?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface LogActivityFilters {
  logTypes: string[];          // array of idLogType
  categories: string[];        // array of idCategoryLogType
  dateRange: {
    start?: Date;
    end?: Date;
  };
  users: string[];             // array of idUser atau nameUser
}

// ============================================================================
// Response Types (Generic API Response Pattern)
// ============================================================================

export type LogActivityListResponse = PaginatedApiResponse<LogActivity>;
export type LogActivityDetailResponse = ApiResponse<LogActivityDetail>;
export type LogActivityStatsResponse = ApiResponse<LogActivityStats>;
export type CategoryLogTypeListResponse = PaginatedApiResponse<CategoryLogType>;
export type LogTypeListResponse = PaginatedApiResponse<LogType>;
