/**
 * API Configuration
 *
 * This file contains all API endpoint configurations.
 * Environment variables are used to avoid hardcoded URLs.
 */

// Get API base URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-lms-kappa.vercel.app/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Forum endpoints
  FORUMS: `${API_BASE_URL}/forums`,
  FORUM_BY_ID: (id: string) => `${API_BASE_URL}/forums/${id}`,

  // Topic endpoints
  TOPICS: `${API_BASE_URL}/topics`,
  TOPIC_BY_ID: (id: string) => `${API_BASE_URL}/topics/${id}`,
  TOPIC_VOTE: (id: string) => `${API_BASE_URL}/topics/${id}/vote`,
  TOPIC_RESOLVE: (id: string) => `${API_BASE_URL}/topics/${id}/resolve`,

  // Discussion endpoints
  DISCUSSIONS: `${API_BASE_URL}/discussions`,
  DISCUSSION_BY_ID: (id: string) => `${API_BASE_URL}/discussions/${id}`,
  DISCUSSION_VOTE: (id: string) => `${API_BASE_URL}/discussions/${id}/vote`,
  DISCUSSION_REPLIES: (forumId: string) => `${API_BASE_URL}/discussions/${forumId}/replies`,

  // Knowledge Subjects endpoints
  KNOWLEDGE_SUBJECTS: `${API_BASE_URL}/knowledge-subjects`,
  KNOWLEDGE_SUBJECT_BY_ID: (id: string) => `${API_BASE_URL}/knowledge-subjects/${id}`,

  // Knowledge Centers endpoints
  KNOWLEDGE_CENTERS: `${API_BASE_URL}/knowledge-centers`,
  KNOWLEDGE_CENTER_BY_ID: (id: string) => `${API_BASE_URL}/knowledge-centers/${id}`,
  KNOWLEDGE_CENTERS_STATS: `${API_BASE_URL}/knowledge-centers/stats`,
} as const;

// API Configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export default API_ENDPOINTS;
export const API_COURSE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://service-courses.vercel.app/api/v1";
