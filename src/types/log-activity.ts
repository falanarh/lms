/**
 * Log Activity Types
 * 
 * Following API-First TypeScript principles
 * 100% API structure alignment without custom wrappers
 */

import { PaginatedApiResponse, ApiResponse } from './api-response';

// ============================================================================
// Base Types & Enums
// ============================================================================

export const LOG_TYPES = {
  LOGIN: 'login',
  START_COURSE: 'start_course',
  END_COURSE: 'end_course',
  START_SECTION: 'start_section_in_course',
  END_SECTION: 'end_section_in_course',
  START_CONTENT: 'start_content_in_section',
  END_CONTENT: 'end_content_in_section',
  ABSENT_COURSE: 'absent_in_course',
  START_QUIZ: 'start_quiz_in_course',
  END_QUIZ: 'end_quiz_in_course',
  CREATE_TOPIC: 'create_topic_in_course',
  CREATE_COMMENT: 'create_comment_in_topic',
  EDIT_COMMENT: 'edit_comment_in_topic',
  DELETE_COMMENT: 'delete_comment_in_topic',
  MARK_FLAG_TOPIC: 'mark_flag_topic',
  UPGRADE_BADGE: 'upgrade_badge_level_up',
} as const;

export type LogType = typeof LOG_TYPES[keyof typeof LOG_TYPES];

export const LOG_CATEGORIES = {
  AUTHENTICATION: 'authentication',
  COURSE_ACTIVITY: 'course_activity',
  CONTENT_INTERACTION: 'content_interaction',
  ASSESSMENT: 'assessment',
  FORUM_ACTIVITY: 'forum_activity',
  ACHIEVEMENT: 'achievement',
} as const;

export type LogCategory = typeof LOG_CATEGORIES[keyof typeof LOG_CATEGORIES];

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  TYPE: 'type',
  USER: 'user',
  DURATION: 'duration',
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

// ============================================================================
// API Entity Types (100% API Structure)
// ============================================================================

export interface LogActivity {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  logType: LogType;
  trigger?: string;
  timestamp: string;
  detail?: string;
  duration?: number; // in seconds
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  courseId?: string;
  courseName?: string;
  sectionId?: string;
  sectionName?: string;
  contentId?: string;
  contentName?: string;
  topicId?: string;
  topicTitle?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface LogActivityStats {
  totalLogs: number;
  totalUsers: number;
  averageSessionDuration: number;
  mostActiveLogType: LogType;
  dailyActivityCount: number;
  weeklyActivityCount: number;
  monthlyActivityCount: number;
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export interface LogActivityQueryParams {
  search?: string;
  logType?: LogType | LogType[];
  category?: LogCategory;
  userName?: string;
  courseName?: string;
  startDate?: string;
  endDate?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
  includeMetadata?: boolean;
}

export interface LogActivityFilters {
  logTypes: LogType[];
  categories: LogCategory[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  users: string[];
  courses: string[];
  minDuration?: number;
  maxDuration?: number;
}

// ============================================================================
// Response Types (Generic API Response Pattern)
// ============================================================================

export type LogActivityListResponse = PaginatedApiResponse<LogActivity>;
export type LogActivityDetailResponse = ApiResponse<LogActivity>;
export type LogActivityStatsResponse = ApiResponse<LogActivityStats>;

// ============================================================================
// UI Helper Types
// ============================================================================

export interface LogActivityTableColumn {
  key: keyof LogActivity | 'actions';
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: LogActivity) => React.ReactNode;
}

export interface LogActivityExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Partial<LogActivityFilters>;
}

// ============================================================================
// Utility Types for Log Categorization
// ============================================================================

export const LOG_TYPE_CATEGORIES: Record<LogType, LogCategory> = {
  [LOG_TYPES.LOGIN]: LOG_CATEGORIES.AUTHENTICATION,
  [LOG_TYPES.START_COURSE]: LOG_CATEGORIES.COURSE_ACTIVITY,
  [LOG_TYPES.END_COURSE]: LOG_CATEGORIES.COURSE_ACTIVITY,
  [LOG_TYPES.START_SECTION]: LOG_CATEGORIES.COURSE_ACTIVITY,
  [LOG_TYPES.END_SECTION]: LOG_CATEGORIES.COURSE_ACTIVITY,
  [LOG_TYPES.START_CONTENT]: LOG_CATEGORIES.CONTENT_INTERACTION,
  [LOG_TYPES.END_CONTENT]: LOG_CATEGORIES.CONTENT_INTERACTION,
  [LOG_TYPES.ABSENT_COURSE]: LOG_CATEGORIES.COURSE_ACTIVITY,
  [LOG_TYPES.START_QUIZ]: LOG_CATEGORIES.ASSESSMENT,
  [LOG_TYPES.END_QUIZ]: LOG_CATEGORIES.ASSESSMENT,
  [LOG_TYPES.CREATE_TOPIC]: LOG_CATEGORIES.FORUM_ACTIVITY,
  [LOG_TYPES.CREATE_COMMENT]: LOG_CATEGORIES.FORUM_ACTIVITY,
  [LOG_TYPES.EDIT_COMMENT]: LOG_CATEGORIES.FORUM_ACTIVITY,
  [LOG_TYPES.DELETE_COMMENT]: LOG_CATEGORIES.FORUM_ACTIVITY,
  [LOG_TYPES.MARK_FLAG_TOPIC]: LOG_CATEGORIES.FORUM_ACTIVITY,
  [LOG_TYPES.UPGRADE_BADGE]: LOG_CATEGORIES.ACHIEVEMENT,
};

export const LOG_TYPE_LABELS: Record<LogType, string> = {
  [LOG_TYPES.LOGIN]: 'User Login',
  [LOG_TYPES.START_COURSE]: 'Start Course',
  [LOG_TYPES.END_COURSE]: 'End Course',
  [LOG_TYPES.START_SECTION]: 'Start Section',
  [LOG_TYPES.END_SECTION]: 'End Section',
  [LOG_TYPES.START_CONTENT]: 'Start Content',
  [LOG_TYPES.END_CONTENT]: 'End Content',
  [LOG_TYPES.ABSENT_COURSE]: 'Absent in Course',
  [LOG_TYPES.START_QUIZ]: 'Start Quiz',
  [LOG_TYPES.END_QUIZ]: 'End Quiz',
  [LOG_TYPES.CREATE_TOPIC]: 'Create Topic',
  [LOG_TYPES.CREATE_COMMENT]: 'Create Comment',
  [LOG_TYPES.EDIT_COMMENT]: 'Edit Comment',
  [LOG_TYPES.DELETE_COMMENT]: 'Delete Comment',
  [LOG_TYPES.MARK_FLAG_TOPIC]: 'Mark/Flag Topic',
  [LOG_TYPES.UPGRADE_BADGE]: 'Upgrade Badge',
};

export const CATEGORY_LABELS: Record<LogCategory, string> = {
  [LOG_CATEGORIES.AUTHENTICATION]: 'Authentication',
  [LOG_CATEGORIES.COURSE_ACTIVITY]: 'Course Activity',
  [LOG_CATEGORIES.CONTENT_INTERACTION]: 'Content Interaction',
  [LOG_CATEGORIES.ASSESSMENT]: 'Assessment',
  [LOG_CATEGORIES.FORUM_ACTIVITY]: 'Forum Activity',
  [LOG_CATEGORIES.ACHIEVEMENT]: 'Achievement',
};

// ============================================================================
// Color & Icon Mapping for UI
// ============================================================================

export const LOG_TYPE_COLORS: Record<LogType, string> = {
  [LOG_TYPES.LOGIN]: 'bg-blue-100 text-blue-800',
  [LOG_TYPES.START_COURSE]: 'bg-green-100 text-green-800',
  [LOG_TYPES.END_COURSE]: 'bg-green-100 text-green-800',
  [LOG_TYPES.START_SECTION]: 'bg-indigo-100 text-indigo-800',
  [LOG_TYPES.END_SECTION]: 'bg-indigo-100 text-indigo-800',
  [LOG_TYPES.START_CONTENT]: 'bg-purple-100 text-purple-800',
  [LOG_TYPES.END_CONTENT]: 'bg-purple-100 text-purple-800',
  [LOG_TYPES.ABSENT_COURSE]: 'bg-red-100 text-red-800',
  [LOG_TYPES.START_QUIZ]: 'bg-orange-100 text-orange-800',
  [LOG_TYPES.END_QUIZ]: 'bg-orange-100 text-orange-800',
  [LOG_TYPES.CREATE_TOPIC]: 'bg-cyan-100 text-cyan-800',
  [LOG_TYPES.CREATE_COMMENT]: 'bg-teal-100 text-teal-800',
  [LOG_TYPES.EDIT_COMMENT]: 'bg-yellow-100 text-yellow-800',
  [LOG_TYPES.DELETE_COMMENT]: 'bg-red-100 text-red-800',
  [LOG_TYPES.MARK_FLAG_TOPIC]: 'bg-pink-100 text-pink-800',
  [LOG_TYPES.UPGRADE_BADGE]: 'bg-amber-100 text-amber-800',
};

export const CATEGORY_COLORS: Record<LogCategory, string> = {
  [LOG_CATEGORIES.AUTHENTICATION]: 'bg-blue-500',
  [LOG_CATEGORIES.COURSE_ACTIVITY]: 'bg-green-500',
  [LOG_CATEGORIES.CONTENT_INTERACTION]: 'bg-purple-500',
  [LOG_CATEGORIES.ASSESSMENT]: 'bg-orange-500',
  [LOG_CATEGORIES.FORUM_ACTIVITY]: 'bg-cyan-500',
  [LOG_CATEGORIES.ACHIEVEMENT]: 'bg-amber-500',
};
