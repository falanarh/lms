/**
 * API Configuration
 *
 * This file contains all API endpoint configurations.
 * Environment variables are used to avoid hardcoded URLs.
 */

// Get API base URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-lms-kappa.vercel.app';

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

  // Knowledge Center endpoints
  KNOWLEDGE: `${API_BASE_URL}/knowledge`,
  KNOWLEDGE_BY_ID: (id: string) => `${API_BASE_URL}/knowledge/${id}`,
  KNOWLEDGE_LIKE: (id: string) => `${API_BASE_URL}/knowledge/${id}/like`,
  KNOWLEDGE_DISLIKE: (id: string) => `${API_BASE_URL}/knowledge/${id}/dislike`,
  KNOWLEDGE_VIEW: (id: string) => `${API_BASE_URL}/knowledge/${id}/view`,
  KNOWLEDGE_UPLOAD: `${API_BASE_URL}/knowledge/upload`,

  // Taxonomy endpoints
  SUBJECTS: `${API_BASE_URL}/knowledge/subjects`,
  PENYELENGGARA: `${API_BASE_URL}/knowledge/penyelenggara`,
  TAGS: `${API_BASE_URL}/knowledge/tags`,

  // Analytics endpoint
  KNOWLEDGE_ANALYTICS: `${API_BASE_URL}/knowledge/analytics`,

  // Schedule endpoint
  WEBINAR_SCHEDULE: `${API_BASE_URL}/knowledge/webinar/schedule`,

  // Settings endpoint
  KNOWLEDGE_SETTINGS: `${API_BASE_URL}/knowledge/settings`,
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
