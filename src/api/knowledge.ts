/**
 * API Layer for Knowledge Hub
 * Following the API → Hooks → UI pattern from coding principles
 */

// Types imported from types/knowledge-center.ts
import { Knowledge, MediaType, Webinar, Konten, KnowledgeAnalytics } from '@/types/knowledge-center';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';
import axios from 'axios';

export interface WebinarSchedule {
  id: string;
  title: string;
  description: string;
  tgl_zoom: string;
  zoom_link: string;
  youtube_link: string;
  speaker: string;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
}

export interface Comment {
  id: string;
  knowledgeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Penyelenggara {
  id: string;
  name: string;
  description?: string;
}

// Knowledge Subjects types
export interface KnowledgeSubject {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  listKnowledgeCenter: any[];
}

export interface KnowledgeSubjectsResponse {
  success: boolean;
  status: number;
  message: string;
  data: KnowledgeSubject[];
  pageMeta: {
    page: number;
    perPage: number;
    hasPrev: boolean;
    hasNext: boolean;
    totalPageCount: number;
    showingFrom: number;
    showingTo: number;
    resultCount: number;
    totalResultCount: number;
  };
}

export interface CreateKnowledgeSubjectRequest {
  name: string;
  icon: string;
}

export interface UpdateKnowledgeSubjectRequest {
  name?: string;
  icon?: string;
}

// KnowledgeAnalytics imported from types/knowledge-center.ts

export interface KnowledgeQueryParams {
  search?: string;
  knowledge_type?: ('webinar' | 'konten')[];
  subject?: string[];
  sort?: 'newest' | 'oldest' | 'most_liked' | 'most_viewed' | 'upcoming_webinar' | 'popular' | 'likes' | 'title';
  page?: number;
  limit?: number;
}

export interface KnowledgeResponse {
  data: Knowledge[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// API base URL - change this to your backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// API Functions
export const knowledgeApi = {
  /**
   * Fetch knowledge items with filtering and pagination
   */
  async fetchKnowledge(params: KnowledgeQueryParams = {}): Promise<KnowledgeResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add query parameters
      if (params.search) queryParams.append('search', params.search);
      if (params.knowledge_type?.length) queryParams.append('knowledge_type', params.knowledge_type.join(','));
      if (params.subject?.length) queryParams.append('subject', params.subject.join(','));
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE_URL}/knowledge?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      // Return empty response on error
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        total_pages: 0,
      };
    }
  },

  /**
   * Fetch single knowledge item by ID
   */
  async fetchKnowledgeById(id: string): Promise<Knowledge | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${id}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge by ID:', error);
      return null;
    }
  },

  /**
   * Fetch webinar schedule - returns upcoming webinars from knowledge data
   */
  async fetchWebinarSchedule(): Promise<Webinar[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/webinars/schedule`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching webinar schedule:', error);
      return [];
    }
  },

  /**
   * Fetch knowledge analytics
   */
  async fetchKnowledgeAnalytics(): Promise<KnowledgeAnalytics> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/analytics`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge analytics:', error);
      // Return default analytics on error
      return {
        total_knowledge: 0,
        total_webinars: 0,
        total_published: 0,
        total_likes: 0,
        total_dislikes: 0,
        total_views: 0,
        upcoming_webinars: 0,
        top_subjects: [],
        popular_knowledge: [],
      };
    }
  },

  /**
   * Create new knowledge
   */
  async createKnowledge(data: Partial<Knowledge>): Promise<Knowledge> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating knowledge:', error);
      throw error;
    }
  },

  /**
   * Update knowledge
   */
  async updateKnowledge(id: string, data: Partial<Knowledge>): Promise<Knowledge | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating knowledge:', error);
      throw error;
    }
  },

  /**
   * Delete knowledge
   */
  async deleteKnowledge(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) return false;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      throw error;
    }
  },

  /**
   * Like/unlike knowledge
   */
  async toggleLikeKnowledge(id: string): Promise<{ liked: boolean; totalLikes: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<{ totalViews: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${id}/view`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  },

  /**
   * Fetch related knowledge items
   */
  async fetchRelatedKnowledge(id: string, limit: number = 6): Promise<Knowledge[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${id}/related?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching related knowledge:', error);
      return [];
    }
  },

  /**
   * Fetch knowledge by author
   */
  async fetchKnowledgeByAuthor(author: string, limit: number = 5): Promise<Knowledge[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/author/${encodeURIComponent(author)}?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge by author:', error);
      return [];
    }
  },

  /**
   * Get knowledge reading progress
   */
  async getReadingProgress(userId: string, knowledgeId: string): Promise<{
    isCompleted: boolean;
    progress: number;
    lastPosition: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${knowledgeId}/progress/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return {
        isCompleted: false,
        progress: 0,
        lastPosition: 0,
      };
    }
  },

  /**
   * Update reading progress
   */
  async updateReadingProgress(userId: string, knowledgeId: string, progress: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${knowledgeId}/progress/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
      throw error;
    }
  },

  /**
   * Get knowledge comments
   */
  async fetchKnowledgeComments(knowledgeId: string): Promise<Comment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${knowledgeId}/comments`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge comments:', error);
      return [];
    }
  },

  /**
   * Add comment to knowledge
   */
  async addKnowledgeComment(knowledgeId: string, content: string, userId: string): Promise<Comment> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${knowledgeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error adding knowledge comment:', error);
      throw error;
    }
  },

  /**
   * Get knowledge recommendations
   */
  async fetchKnowledgeRecommendations(userId: string, limit: number = 8): Promise<Knowledge[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/recommendations/${userId}?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge recommendations:', error);
      return [];
    }
  },

  /**
   * Fetch subjects
   */
  async fetchSubjects(): Promise<Subject[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  },

  /**
   * Fetch penyelenggara
   */
  async fetchPenyelenggara(): Promise<Penyelenggara[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/penyelenggara`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching penyelenggara:', error);
      return [];
    }
  },

  /**
   * Add new subject
   */
  async addSubject(subject: { name: string; icon?: string }): Promise<Subject> {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subject),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  },

  /**
   * Update subject
   */
  async updateSubject(id: string, subject: { name?: string; icon?: string }): Promise<Subject | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subject),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  /**
   * Delete subject
   */
  async deleteSubject(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) return false;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  },

  /**
   * Knowledge Subjects API Functions
   */
  async fetchKnowledgeSubjects(): Promise<KnowledgeSubject[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.KNOWLEDGE_SUBJECTS, {
        ...API_CONFIG,
        baseURL: undefined, // Use full URL from endpoints
      });

      if (response.data.status !== 200) {
        throw new Error(response.data.message || "Failed to fetch knowledge subjects");
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching knowledge subjects:', error);
      // Return empty array on error
      return [];
    }
  },

  async createKnowledgeSubject(subjectData: CreateKnowledgeSubjectRequest): Promise<KnowledgeSubject> {
    try {
      const response = await axios.post(
        API_ENDPOINTS.KNOWLEDGE_SUBJECTS,
        subjectData,
        {
          ...API_CONFIG,
          baseURL: undefined, // Use full URL from endpoints
        }
      );

      if (response.data.status !== 201) {
        throw new Error(response.data.message || "Failed to create knowledge subject");
      }

      return response.data.data;
    } catch (error) {
      console.error('Error creating knowledge subject:', error);
      throw error;
    }
  },

  async updateKnowledgeSubject(id: string, subjectData: UpdateKnowledgeSubjectRequest): Promise<KnowledgeSubject> {
    try {
      const response = await axios.patch(
        API_ENDPOINTS.KNOWLEDGE_SUBJECT_BY_ID(id),
        subjectData,
        {
          ...API_CONFIG,
          baseURL: undefined, // Use full URL from endpoints
        }
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || "Failed to update knowledge subject");
      }

      return response.data.data;
    } catch (error) {
      console.error('Error updating knowledge subject:', error);
      throw error;
    }
  },

  async deleteKnowledgeSubject(id: string): Promise<boolean> {
    try {
      const response = await axios.delete(API_ENDPOINTS.KNOWLEDGE_SUBJECT_BY_ID(id), {
        ...API_CONFIG,
        baseURL: undefined, // Use full URL from endpoints
      });

      if (response.data.status !== 200) {
        throw new Error(response.data.message || "Failed to delete knowledge subject");
      }

      return true;
    } catch (error) {
      console.error('Error deleting knowledge subject:', error);
      throw error;
    }
  },
};

// Query Options for React Query
export const getKnowledgeQueryOptions = (params: KnowledgeQueryParams = {}) => ({
  queryKey: ['knowledge', params],
  queryFn: () => knowledgeApi.fetchKnowledge(params),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes
});

export const getKnowledgeByIdQueryOptions = (id: string) => ({
  queryKey: ['knowledge', id],
  queryFn: () => knowledgeApi.fetchKnowledgeById(id),
  staleTime: 1000 * 60 * 10, // 10 minutes
  gcTime: 1000 * 60 * 15, // 15 minutes
});

export const getWebinarScheduleQueryOptions = () => ({
  queryKey: ['webinar-schedule'],
  queryFn: () => knowledgeApi.fetchWebinarSchedule(),
  staleTime: 1000 * 60 * 2, // 2 minutes
  gcTime: 1000 * 60 * 5, // 5 minutes
  refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
});

export const getKnowledgeAnalyticsQueryOptions = () => ({
  queryKey: ['knowledge-analytics'],
  queryFn: () => knowledgeApi.fetchKnowledgeAnalytics(),
  staleTime: 1000 * 60 * 10, // 10 minutes
  gcTime: 1000 * 60 * 15, // 15 minutes
  refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
});

export const getRelatedKnowledgeQueryOptions = (id: string, limit: number = 6) => ({
  queryKey: ['knowledge', id, 'related', limit],
  queryFn: () => knowledgeApi.fetchRelatedKnowledge(id, limit),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes
});

export const getKnowledgeByAuthorQueryOptions = (author: string, limit: number = 5) => ({
  queryKey: ['knowledge', 'by-author', author, limit],
  queryFn: () => knowledgeApi.fetchKnowledgeByAuthor(author, limit),
  staleTime: 1000 * 60 * 3, // 3 minutes
  gcTime: 1000 * 60 * 6, // 6 minutes
});

export const getReadingProgressQueryOptions = (userId: string, knowledgeId: string) => ({
  queryKey: ['reading-progress', userId, knowledgeId],
  queryFn: () => knowledgeApi.getReadingProgress(userId, knowledgeId),
  staleTime: 1000 * 60 * 1, // 1 minute
  gcTime: 1000 * 60 * 3, // 3 minutes
});

export const getKnowledgeCommentsQueryOptions = (knowledgeId: string) => ({
  queryKey: ['knowledge-comments', knowledgeId],
  queryFn: () => knowledgeApi.fetchKnowledgeComments(knowledgeId),
  staleTime: 1000 * 60 * 2, // 2 minutes
  gcTime: 1000 * 60 * 5, // 5 minutes
});

export const getKnowledgeRecommendationsQueryOptions = (userId: string, limit: number = 8) => ({
  queryKey: ['knowledge-recommendations', userId, limit],
  queryFn: () => knowledgeApi.fetchKnowledgeRecommendations(userId, limit),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes
});

export const getSubjectsQueryOptions = () => ({
  queryKey: ['subjects'],
  queryFn: () => knowledgeApi.fetchSubjects(),
  staleTime: 1000 * 60 * 30, // 30 minutes
  gcTime: 1000 * 60 * 60, // 1 hour
});

export const getPenyelenggaraQueryOptions = () => ({
  queryKey: ['penyelenggara'],
  queryFn: () => knowledgeApi.fetchPenyelenggara(),
  staleTime: 1000 * 60 * 30, // 30 minutes
  gcTime: 1000 * 60 * 60, // 1 hour
});

// Knowledge Subjects Query Options
export const getKnowledgeSubjectsQueryOptions = () => ({
  queryKey: ['knowledge-subjects'],
  queryFn: () => knowledgeApi.fetchKnowledgeSubjects(),
  staleTime: 1000 * 60 * 30, // 30 minutes
  gcTime: 1000 * 60 * 60, // 1 hour
});