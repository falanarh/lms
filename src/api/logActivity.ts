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
import {
  LogActivity,
  LogActivityQueryParams,
  LogActivityListResponse,
  LogActivityDetailResponse,
  LogActivityStatsResponse,
  LogActivityStats,
  LOG_TYPES,
  LOG_TYPE_CATEGORIES,
  SORT_OPTIONS,
} from '@/types/log-activity';

// ============================================================================
// API Endpoints
// ============================================================================

const LOG_ACTIVITY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/log-activities`,
  DETAIL: (id: string) => `${API_BASE_URL}/log-activities/${id}`,
  STATS: `${API_BASE_URL}/log-activities/stats`,
  EXPORT: `${API_BASE_URL}/log-activities/export`,
} as const;

// ============================================================================
// Fallback Data for Error Handling
// ============================================================================

const fallbackLogActivities: LogActivity[] = [
  // Authentication Logs
  {
    id: '1',
    userId: 'user-001',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    logType: LOG_TYPES.LOGIN,
    trigger: 'web_login',
    timestamp: new Date().toISOString(),
    detail: 'User logged in successfully',
    duration: 0,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-001',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-002',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    logType: LOG_TYPES.LOGIN,
    trigger: 'mobile_login',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    detail: 'User logged in from mobile device',
    duration: 0,
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    sessionId: 'session-002',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },

  // Course Activity Logs
  {
    id: '3',
    userId: 'user-002',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    logType: LOG_TYPES.START_COURSE,
    trigger: 'course_enrollment',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    detail: 'Started React Fundamentals course',
    duration: 3600,
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '4',
    userId: 'user-003',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@example.com',
    logType: LOG_TYPES.END_COURSE,
    trigger: 'course_completion',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    detail: 'Completed JavaScript Basics course',
    duration: 7200,
    courseId: 'course-002',
    courseName: 'JavaScript Basics',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: '5',
    userId: 'user-004',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
    logType: LOG_TYPES.START_SECTION,
    trigger: 'section_navigation',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    detail: 'Started section: Introduction to Components',
    duration: 1800,
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    sectionId: 'section-001',
    sectionName: 'Introduction to Components',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '6',
    userId: 'user-004',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
    logType: LOG_TYPES.END_SECTION,
    trigger: 'section_completion',
    timestamp: new Date(Date.now() - 9000000).toISOString(),
    detail: 'Completed section: Introduction to Components',
    duration: 1800,
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    sectionId: 'section-001',
    sectionName: 'Introduction to Components',
    createdAt: new Date(Date.now() - 9000000).toISOString(),
  },
  {
    id: '7',
    userId: 'user-005',
    userName: 'David Brown',
    userEmail: 'david.brown@example.com',
    logType: LOG_TYPES.ABSENT_COURSE,
    trigger: 'attendance_check',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    detail: 'Marked absent for scheduled live session',
    duration: 0,
    courseId: 'course-003',
    courseName: 'Advanced Node.js',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },

  // Content Interaction Logs
  {
    id: '8',
    userId: 'user-006',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@example.com',
    logType: LOG_TYPES.START_CONTENT,
    trigger: 'content_access',
    timestamp: new Date(Date.now() - 12600000).toISOString(),
    detail: 'Started watching: React Hooks Tutorial',
    duration: 900,
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    sectionId: 'section-002',
    sectionName: 'React Hooks',
    contentId: 'content-001',
    contentName: 'React Hooks Tutorial',
    createdAt: new Date(Date.now() - 12600000).toISOString(),
  },
  {
    id: '9',
    userId: 'user-006',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@example.com',
    logType: LOG_TYPES.END_CONTENT,
    trigger: 'content_completion',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    detail: 'Completed watching: React Hooks Tutorial',
    duration: 900,
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    sectionId: 'section-002',
    sectionName: 'React Hooks',
    contentId: 'content-001',
    contentName: 'React Hooks Tutorial',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },

  // Assessment Logs
  {
    id: '10',
    userId: 'user-007',
    userName: 'Robert Taylor',
    userEmail: 'robert.taylor@example.com',
    logType: LOG_TYPES.START_QUIZ,
    trigger: 'quiz_attempt',
    timestamp: new Date(Date.now() - 16200000).toISOString(),
    detail: 'Started quiz: React Components Assessment',
    duration: 1200,
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    contentId: 'quiz-001',
    contentName: 'React Components Assessment',
    createdAt: new Date(Date.now() - 16200000).toISOString(),
  },
  {
    id: '11',
    userId: 'user-007',
    userName: 'Robert Taylor',
    userEmail: 'robert.taylor@example.com',
    logType: LOG_TYPES.END_QUIZ,
    trigger: 'quiz_submission',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    detail: 'Completed quiz: React Components Assessment (Score: 85%)',
    duration: 1200,
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    contentId: 'quiz-001',
    contentName: 'React Components Assessment',
    metadata: { score: 85, totalQuestions: 20, correctAnswers: 17 },
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },

  // Forum Activity Logs
  {
    id: '12',
    userId: 'user-003',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@example.com',
    logType: LOG_TYPES.CREATE_TOPIC,
    trigger: 'forum_interaction',
    timestamp: new Date(Date.now() - 19800000).toISOString(),
    detail: 'Created new discussion topic',
    topicId: 'topic-001',
    topicTitle: 'How to handle state in React?',
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    createdAt: new Date(Date.now() - 19800000).toISOString(),
  },
  {
    id: '13',
    userId: 'user-008',
    userName: 'Lisa Anderson',
    userEmail: 'lisa.anderson@example.com',
    logType: LOG_TYPES.CREATE_COMMENT,
    trigger: 'forum_interaction',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    detail: 'Added comment to discussion topic',
    topicId: 'topic-001',
    topicTitle: 'How to handle state in React?',
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: '14',
    userId: 'user-008',
    userName: 'Lisa Anderson',
    userEmail: 'lisa.anderson@example.com',
    logType: LOG_TYPES.EDIT_COMMENT,
    trigger: 'forum_interaction',
    timestamp: new Date(Date.now() - 23400000).toISOString(),
    detail: 'Edited comment in discussion topic',
    topicId: 'topic-001',
    topicTitle: 'How to handle state in React?',
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    createdAt: new Date(Date.now() - 23400000).toISOString(),
  },
  {
    id: '15',
    userId: 'user-009',
    userName: 'Chris Martinez',
    userEmail: 'chris.martinez@example.com',
    logType: LOG_TYPES.DELETE_COMMENT,
    trigger: 'moderation_action',
    timestamp: new Date(Date.now() - 25200000).toISOString(),
    detail: 'Deleted inappropriate comment',
    topicId: 'topic-002',
    topicTitle: 'Best practices for React development',
    courseId: 'course-001',
    courseName: 'React Fundamentals',
    createdAt: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    id: '16',
    userId: 'user-010',
    userName: 'Amanda White',
    userEmail: 'amanda.white@example.com',
    logType: LOG_TYPES.MARK_FLAG_TOPIC,
    trigger: 'moderation_action',
    timestamp: new Date(Date.now() - 27000000).toISOString(),
    detail: 'Flagged topic for inappropriate content',
    topicId: 'topic-003',
    topicTitle: 'Off-topic discussion',
    courseId: 'course-002',
    courseName: 'JavaScript Basics',
    createdAt: new Date(Date.now() - 27000000).toISOString(),
  },

  // Achievement Logs
  {
    id: '17',
    userId: 'user-003',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@example.com',
    logType: LOG_TYPES.UPGRADE_BADGE,
    trigger: 'achievement_unlock',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    detail: 'Earned "Course Completion Master" badge',
    metadata: { badgeName: 'Course Completion Master', badgeLevel: 'Gold', coursesCompleted: 5 },
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: '18',
    userId: 'user-011',
    userName: 'Kevin Lee',
    userEmail: 'kevin.lee@example.com',
    logType: LOG_TYPES.UPGRADE_BADGE,
    trigger: 'achievement_unlock',
    timestamp: new Date(Date.now() - 30600000).toISOString(),
    detail: 'Earned "Forum Contributor" badge',
    metadata: { badgeName: 'Forum Contributor', badgeLevel: 'Silver', postsCreated: 25 },
    createdAt: new Date(Date.now() - 30600000).toISOString(),
  },

  // Additional diverse logs for better testing
  {
    id: '19',
    userId: 'user-012',
    userName: 'Rachel Green',
    userEmail: 'rachel.green@example.com',
    logType: LOG_TYPES.LOGIN,
    trigger: 'web_login',
    timestamp: new Date(Date.now() - 32400000).toISOString(),
    detail: 'User logged in successfully',
    duration: 0,
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    sessionId: 'session-003',
    createdAt: new Date(Date.now() - 32400000).toISOString(),
  },
  {
    id: '20',
    userId: 'user-013',
    userName: 'Tom Wilson',
    userEmail: 'tom.wilson@example.com',
    logType: LOG_TYPES.START_COURSE,
    trigger: 'course_enrollment',
    timestamp: new Date(Date.now() - 34200000).toISOString(),
    detail: 'Started Python for Beginners course',
    duration: 2400,
    courseId: 'course-004',
    courseName: 'Python for Beginners',
    createdAt: new Date(Date.now() - 34200000).toISOString(),
  },
  {
    id: '21',
    userId: 'user-014',
    userName: 'Sophie Clark',
    userEmail: 'sophie.clark@example.com',
    logType: LOG_TYPES.START_CONTENT,
    trigger: 'content_access',
    timestamp: new Date(Date.now() - 36000000).toISOString(),
    detail: 'Started reading: Introduction to Variables',
    duration: 600,
    courseId: 'course-004',
    courseName: 'Python for Beginners',
    sectionId: 'section-003',
    sectionName: 'Python Basics',
    contentId: 'content-002',
    contentName: 'Introduction to Variables',
    createdAt: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    id: '22',
    userId: 'user-015',
    userName: 'Alex Turner',
    userEmail: 'alex.turner@example.com',
    logType: LOG_TYPES.START_QUIZ,
    trigger: 'quiz_attempt',
    timestamp: new Date(Date.now() - 37800000).toISOString(),
    detail: 'Started quiz: Python Fundamentals Test',
    duration: 1800,
    courseId: 'course-004',
    courseName: 'Python for Beginners',
    contentId: 'quiz-002',
    contentName: 'Python Fundamentals Test',
    createdAt: new Date(Date.now() - 37800000).toISOString(),
  },
  {
    id: '23',
    userId: 'user-016',
    userName: 'Maria Garcia',
    userEmail: 'maria.garcia@example.com',
    logType: LOG_TYPES.CREATE_TOPIC,
    trigger: 'forum_interaction',
    timestamp: new Date(Date.now() - 39600000).toISOString(),
    detail: 'Created new discussion topic',
    topicId: 'topic-004',
    topicTitle: 'Python vs JavaScript: Which to learn first?',
    courseId: 'course-004',
    courseName: 'Python for Beginners',
    createdAt: new Date(Date.now() - 39600000).toISOString(),
  },
  {
    id: '24',
    userId: 'user-017',
    userName: 'James Rodriguez',
    userEmail: 'james.rodriguez@example.com',
    logType: LOG_TYPES.UPGRADE_BADGE,
    trigger: 'achievement_unlock',
    timestamp: new Date(Date.now() - 41400000).toISOString(),
    detail: 'Earned "Quick Learner" badge',
    metadata: { badgeName: 'Quick Learner', badgeLevel: 'Bronze', lessonsCompleted: 10 },
    createdAt: new Date(Date.now() - 41400000).toISOString(),
  },
  {
    id: '25',
    userId: 'user-018',
    userName: 'Jennifer Kim',
    userEmail: 'jennifer.kim@example.com',
    logType: LOG_TYPES.END_COURSE,
    trigger: 'course_completion',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    detail: 'Completed Web Development Bootcamp',
    duration: 14400,
    courseId: 'course-005',
    courseName: 'Web Development Bootcamp',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

const fallbackStats: LogActivityStats = {
  totalLogs: 25,
  totalUsers: 18,
  averageSessionDuration: 2340,
  mostActiveLogType: LOG_TYPES.START_CONTENT,
  dailyActivityCount: 25,
  weeklyActivityCount: 25,
  monthlyActivityCount: 25,
};

// ============================================================================
// Utility Functions for Data Processing
// ============================================================================

/**
 * Apply filters and sorting to log activities data
 */
const applyFiltersAndSorting = (data: LogActivity[], params: LogActivityQueryParams): LogActivity[] => {
  let filteredData = [...data];

  // Apply search filter
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredData = filteredData.filter(log => 
      log.userName?.toLowerCase().includes(searchTerm) ||
      log.userEmail?.toLowerCase().includes(searchTerm) ||
      log.detail?.toLowerCase().includes(searchTerm) ||
      log.courseName?.toLowerCase().includes(searchTerm) ||
      log.sectionName?.toLowerCase().includes(searchTerm) ||
      log.contentName?.toLowerCase().includes(searchTerm) ||
      log.topicTitle?.toLowerCase().includes(searchTerm)
    );
  }

  // Apply log type filter
  if (params.logType) {
    const logTypes = Array.isArray(params.logType) ? params.logType : [params.logType];
    filteredData = filteredData.filter(log => logTypes.includes(log.logType));
  }

  // Apply category filter
  if (params.category) {
    filteredData = filteredData.filter(log => LOG_TYPE_CATEGORIES[log.logType] === params.category);
  }

  // Apply user name filter
  if (params.userName) {
    const userNameTerm = params.userName.toLowerCase();
    filteredData = filteredData.filter(log => 
      log.userName?.toLowerCase().includes(userNameTerm)
    );
  }

  // Apply course name filter
  if (params.courseName) {
    const courseNameTerm = params.courseName.toLowerCase();
    filteredData = filteredData.filter(log => 
      log.courseName?.toLowerCase().includes(courseNameTerm)
    );
  }

  // Apply date range filter
  if (params.startDate) {
    const startDate = new Date(params.startDate);
    filteredData = filteredData.filter(log => new Date(log.timestamp) >= startDate);
  }

  if (params.endDate) {
    const endDate = new Date(params.endDate);
    filteredData = filteredData.filter(log => new Date(log.timestamp) <= endDate);
  }

  // Apply sorting
  if (params.sort) {
    switch (params.sort) {
      case SORT_OPTIONS.NEWEST:
        filteredData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case SORT_OPTIONS.OLDEST:
        filteredData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case SORT_OPTIONS.TYPE:
        filteredData.sort((a, b) => a.logType.localeCompare(b.logType));
        break;
      case SORT_OPTIONS.USER:
        filteredData.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
        break;
      case SORT_OPTIONS.DURATION:
        filteredData.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        break;
      default:
        // Default to newest first
        filteredData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } else {
    // Default sorting: newest first
    filteredData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Apply pagination
  if (params.page && params.limit) {
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    filteredData = filteredData.slice(startIndex, endIndex);
  }

  return filteredData;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch log activities with query parameters
 */
export const getLogActivities = async (params: LogActivityQueryParams = {}): Promise<LogActivity[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Build query parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.logType) {
      if (Array.isArray(params.logType)) {
        params.logType.forEach(type => queryParams.append('logType[]', type));
      } else {
        queryParams.append('logType', params.logType);
      }
    }
    if (params.category) queryParams.append('category', params.category);
    if (params.userName) queryParams.append('userName', params.userName);
    if (params.courseName) queryParams.append('courseName', params.courseName);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.includeMetadata) queryParams.append('includeMetadata', 'true');

    const url = `${LOG_ACTIVITY_ENDPOINTS.LIST}?${queryParams.toString()}`;
    const response = await axios.get<LogActivityListResponse>(url, API_CONFIG);
    
    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch log activities');
    }
    
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('🔄 [API FALLBACK] Log activities service unavailable, using fallback data');
        return applyFiltersAndSorting(fallbackLogActivities, params);
      }
      throw new Error(error.response?.data?.message || 'Failed to connect to log activities service');
    }
    throw error;
  }
};

/**
 * Fetch single log activity by ID
 */
export const getLogActivityById = async (id: string): Promise<LogActivity> => {
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
    
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('🔄 [API FALLBACK] Log activity stats service unavailable, using fallback data');
        return fallbackStats;
      }
      throw new Error(error.response?.data?.message || 'Failed to connect to stats service');
    }
    throw error;
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
