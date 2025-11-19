/**
 * Knowledge Center API - Single Source of Truth Types
 *
 * This file contains all API functions for the Knowledge Center feature.
 * Following the API → Hooks → UI pattern from coding principles.
 * All types imported from @/types/knowledge-center.ts
 */

import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

import {
  KnowledgeCenter,
  CreateKnowledgeCenterRequest,
  UpdateKnowledgeCenterRequest,
  KnowledgeQueryParams,
  KnowledgeCentersResponse,
  KnowledgeCenterResponse,
  ApiResponse,
  KnowledgeCenterStatsData,
  KnowledgeOverviewStatsData,
  KnowledgeLastActivitiesResponse,
} from '@/types/knowledge-center';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';

// Hardcoded penyelenggara data for dropdown (temporary until API ready)
export const PENYELENGGARA_DATA = [
  { value: 'Politeknik Statistika STIS', label: 'Politeknik Statistika STIS' },
  { value: 'Pusdiklat BPS', label: 'Pusdiklat BPS' },
  { value: 'Pusdiklat BPS RI', label: 'Pusdiklat BPS RI' },
  { value: 'Badan Pusat Statistik', label: 'Badan Pusat Statistik' },
  { value: 'BPS', label: 'BPS' },
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const DEFAULT_GC_TIME = 1000 * 60 * 10; // 10 minutes

const sanitizeKnowledgeParams = (params: KnowledgeQueryParams = {}) => {
  const query: Record<string, any> = {};

  // Pagination parameters (API uses perPage, not limit)
  query.page = params.page ?? DEFAULT_PAGE;
  query.perPage = params.perPage ?? params.limit ?? DEFAULT_LIMIT;

  // Handle legacy sort parameter and convert to orderBy format
  if (params.sort) {
    switch (params.sort) {
      case 'newest':
        query['orderBy[0][createdAt]'] = 'desc';
        break;
      case 'oldest':
        query['orderBy[0][createdAt]'] = 'asc';
        break;
      case 'mostLiked':
        query['orderBy[0][likeCount]'] = 'desc';
        break;
      case 'mostViewed':
        query['orderBy[0][viewCount]'] = 'desc';
        break;
      case 'title':
        query['orderBy[0][title]'] = 'asc';
        break;
      case 'popular':
        query['orderBy[0][viewCount]'] = 'desc';
        query['orderBy[1][likeCount]'] = 'desc';
        break;
      default:
        query['orderBy[0][createdAt]'] = 'desc';
    }
  }

  // Handle structured orderBy parameter
  if (params.orderBy && params.orderBy.length > 0) {
    params.orderBy.forEach((order, index) => {
      query[`orderBy[${index}][${order.field}]`] = order.direction;
    });
  }

  // Handle filter parameters with operators
  Object.keys(params).forEach((key) => {
    const value = params[key as keyof KnowledgeQueryParams];
    if (value === undefined || key === 'page' || key === 'perPage' || key === 'limit' || key === 'sort' || key === 'orderBy') {
      return;
    }

    // Handle API filter parameters (with operators like [contains], [gte], etc.)
    if (key.includes('[') && key.includes(']')) {
      query[key] = value;
      return;
    }

    // Handle legacy parameters and convert to API format
    switch (key) {
      case 'search':
        if (typeof value === 'string' && value.trim()) {
          query['title[contains]'] = value.trim();
          query['title[mode]'] = 'insensitive';
        }
        break;
      case 'knowledgeType':
        if (Array.isArray(value) && value.length > 0) {
          // For single value, use 'type' parameter
          if (value.length === 1) {
            query['type'] = value[0];
          } else {
            // For multiple values, use 'type[in]' with comma-separated values
            query['type[in]'] = value.join(',');
          }
        } else if (typeof value === 'string') {
          query['type'] = value;
        }
        break;
      case 'subject':
        // Handle subject filtering using subject[id] parameter
        if (Array.isArray(value) && value.length > 0) {
          // Filter out 'all' and use subject IDs
          const validSubjects = value.filter(subject => subject !== 'all');
          if (validSubjects.length > 0) {
            if (validSubjects.length === 1) {
              query['subject[id]'] = validSubjects[0];
            } else {
              query['subject[id][in]'] = validSubjects.join(',');
            }
          }
        } else if (typeof value === 'string' && value !== 'all') {
          query['subject[id]'] = value;
        }
        break;
      case 'penyelenggara':
      case 'mediaType':
      case 'tags':
        // These might need custom handling based on API structure
        // For now, skip them as they're not in the API documentation
        break;
      default:
        // Pass through other parameters as-is
        query[key] = value;
    }
  });

  return query;
};

const serializeKnowledgeParams = (params: KnowledgeQueryParams = {}) =>
  JSON.stringify(sanitizeKnowledgeParams(params));

export const getKnowledgeQueryKey = (params: KnowledgeQueryParams = {}) => [
  'knowledge-centers',
  serializeKnowledgeParams(params),
] as const;

export const getKnowledgeDetailQueryKey = (id: string) => ['knowledge-centers', 'detail', id] as const;

// Helper functions for building API-compliant query parameters
export const buildKnowledgeQueryParams = {
  // Pagination helpers
  pagination: (page: number = 1, perPage: number = 12) => ({
    page,
    perPage,
  }),

  // Sorting helpers
  sortBy: (field: string, direction: 'asc' | 'desc' = 'desc') => ({
    orderBy: [{ field, direction }],
  }),

  // Multi-field sorting
  sortByMultiple: (sorts: Array<{ field: string; direction: 'asc' | 'desc' }>) => ({
    orderBy: sorts,
  }),

  // Common sorting presets
  sortPresets: {
    newest: () => ({ orderBy: [{ field: 'createdAt', direction: 'desc' }] }),
    oldest: () => ({ orderBy: [{ field: 'createdAt', direction: 'asc' }] }),
    mostPopular: () => ({ 
      orderBy: [
        { field: 'viewCount', direction: 'desc' },
        { field: 'likeCount', direction: 'desc' }
      ] 
    }),
    mostLiked: () => ({ orderBy: [{ field: 'likeCount', direction: 'desc' }] }),
    alphabetical: () => ({ orderBy: [{ field: 'title', direction: 'asc' }] }),
  },

  // Filter helpers
  filters: {
    byTitle: (title: string, operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' = 'contains', mode: 'insensitive' | 'default' = 'insensitive') => ({
      [`title[${operator}]`]: title,
      'title[mode]': mode,
    }),
    byType: (type: 'webinar' | 'content') => ({ type }),
    byTypes: (types: Array<'webinar' | 'content'>) => ({ 'type[in]': types.join(',') }),
    byViewCount: (min?: number, max?: number) => {
      const filters: any = {};
      if (min !== undefined) filters['viewCount[gte]'] = min;
      if (max !== undefined) filters['viewCount[lte]'] = max;
      return filters;
    },
    byLikeCount: (min?: number, max?: number) => {
      const filters: any = {};
      if (min !== undefined) filters['likeCount[gte]'] = min;
      if (max !== undefined) filters['likeCount[lte]'] = max;
      return filters;
    },
    byDateRange: (
      field: 'createdAt' | 'updatedAt' | 'publishedAt',
      startDate?: string,
      endDate?: string
    ) => {
      const filters: any = {};
      if (startDate) filters[`${field}[gte]`] = startDate;
      if (endDate) filters[`${field}[lte]`] = endDate;
      return filters;
    },
    bySubject: (subjectId: string) => ({ 'subject[id]': subjectId }),
    bySubjects: (subjectIds: string[]) => ({ 'subject[id][in]': subjectIds.join(',') }),
    publishedOnly: () => ({ 'publishedAt[not]': 'null' }),
    recentlyCreated: (days: number = 30) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return { 'createdAt[gte]': date.toISOString().split('T')[0] };
    },
    recentlyUpdated: (days: number = 30) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return { 'updatedAt[gte]': date.toISOString().split('T')[0] };
    },
  },

  // Combine multiple parameters
  combine: (...params: Partial<KnowledgeQueryParams>[]) => {
    return params.reduce((acc, param) => ({ ...acc, ...param }), {});
  },
};

export const fetchKnowledgeCenters = async (
  params: KnowledgeQueryParams = {},
): Promise<KnowledgeCentersResponse> => {
  try {
    const response = await axios.get<KnowledgeCentersResponse>(API_ENDPOINTS.KNOWLEDGE_CENTERS, {
      ...API_CONFIG,
      params: sanitizeKnowledgeParams(params),
    });

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch knowledge centers');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to connect to knowledge center server');
    }
    throw error;
  }
};

export const fetchKnowledgeCenterById = async (id: string): Promise<KnowledgeCenter> => {
  try {
    const response = await axios.get<KnowledgeCenterResponse>(
      API_ENDPOINTS.KNOWLEDGE_CENTER_BY_ID(id),
      API_CONFIG,
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch knowledge center detail');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to connect to knowledge center server');
    }
    throw error;
  }
};

export const getKnowledgeQueryOptions = (params: KnowledgeQueryParams = {}) =>
  queryOptions({
    queryKey: getKnowledgeQueryKey(params),
    queryFn: () => fetchKnowledgeCenters(params),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });

const deleteKnowledgeCentersApi = async (ids: string[]): Promise<void> => {
  if (!ids || ids.length === 0) {
    return;
  }
  try {
    const response = await axios.delete<ApiResponse<null>>(API_ENDPOINTS.KNOWLEDGE_CENTERS, {
      ...API_CONFIG,
      data: { ids },
    });

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to delete knowledge center(s)');
    }
  } catch (error) {
    console.error('Error deleting knowledge center(s):', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete knowledge center(s)');
    }
    throw error;
  }
};

export const getKnowledgeDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: getKnowledgeDetailQueryKey(id),
    queryFn: () => fetchKnowledgeCenterById(id),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });

// Knowledge CRUD operations
export const knowledgeCenterApi = {
  /**
   * Knowledge Center queries
   */
  async fetchKnowledgeCenters(params: KnowledgeQueryParams = {}) {
    return fetchKnowledgeCenters(params);
  },

  async fetchKnowledgeCenterById(id: string) {
    return fetchKnowledgeCenterById(id);
  },

  async fetchKnowledgeCenterStats() {
    try {
      const response = await axios.get<ApiResponse<KnowledgeCenterStatsData>>(
        API_ENDPOINTS.KNOWLEDGE_CENTERS_STATS, 
        API_CONFIG
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch knowledge center stats');
      }

      return response.data.data.stats;
    } catch (error) {
      console.error('Error fetching knowledge center stats:', error);
      throw error;
    }
  },

  async fetchKnowledgeOverviewStats() {
    try {
      const response = await axios.get<ApiResponse<KnowledgeOverviewStatsData>>(
        API_ENDPOINTS.KNOWLEDGE_CENTERS_OVERVIEW,
        API_CONFIG,
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch knowledge center overview stats');
      }

      return response.data.data.stats;
    } catch (error) {
      console.error('Error fetching knowledge center overview stats:', error);
      throw error;
    }
  },

  async fetchKnowledgeLastActivities() {
    try {
      const response = await axios.get<ApiResponse<KnowledgeLastActivitiesResponse>>(
        API_ENDPOINTS.KNOWLEDGE_CENTERS_LAST_ACTIVITIES,
        API_CONFIG,
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch knowledge center last activities');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching knowledge center last activities:', error);
      throw error;
    }
  },

  /**
   * External Knowledge Center API (legacy endpoints)
   */
  async createKnowledgeCenter(centerData: CreateKnowledgeCenterRequest): Promise<KnowledgeCenter> {
    try {
      const response = await axios.post(API_ENDPOINTS.KNOWLEDGE_CENTERS, centerData, API_CONFIG);

      if (response.data.status !== 201) {
        throw new Error(response.data.message || 'Failed to create knowledge center');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error creating knowledge center:', error);
      throw error;
    }
  },

  async updateKnowledgeCenter(id: string, centerData: UpdateKnowledgeCenterRequest): Promise<KnowledgeCenter> {
    try {
      const response = await axios.patch(
        API_ENDPOINTS.KNOWLEDGE_CENTER_BY_ID(id),
        centerData,
        API_CONFIG
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to update knowledge center');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error updating knowledge center:', error);
      throw error;
    }
  },

  async updateKnowledgeCenterStatus(id: string, isFinal: boolean): Promise<KnowledgeCenter> {
    try {
      const response = await axios.patch<KnowledgeCenterResponse>(
        API_ENDPOINTS.KNOWLEDGE_CENTER_STATUS(id),
        { isFinal },
        API_CONFIG,
      );

      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to update knowledge center status');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error updating knowledge center status:', error);
      throw error;
    }
  },

  // Note: Knowledge Subject API functions have been moved to knowledge-subject.ts

  /**
   * Media upload helpers - Using S3/R2 endpoint
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Construct full URL using R2 public URL
      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
      return `${publicUrl}/${result.fileName}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async uploadPDF(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`PDF upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Construct full URL using R2 public URL
      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
      return `${publicUrl}/${result.fileName}`;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  },

  async uploadVideo(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Video upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Construct full URL using R2 public URL
      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
      return `${publicUrl}/${result.fileName}`;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  async uploadAudio(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Audio upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Construct full URL using R2 public URL
      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
      return `${publicUrl}/${result.fileName}`;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  },

  async deleteKnowledgeCenters(ids: string[]): Promise<void> {
    return deleteKnowledgeCentersApi(ids);
  },

  async deleteKnowledgeCenter(id: string): Promise<void> {
    return deleteKnowledgeCentersApi([id]);
  },

  async searchKnowledgeCenters(query: string): Promise<any> {
    try {
      const url = `${API_ENDPOINTS.KNOWLEDGE_CENTERS_SEARCH}?keyword=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching knowledge centers:', error);
      throw error;
    }
  },
};

// View count increment API function
export const incrementKnowledgeCenterView = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.KNOWLEDGE_CENTERS}/${id}/engage`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ view: true }),
    });

    if (!response.ok) {
      // Don't throw error for view count failures to avoid disrupting user experience
      console.warn(`Failed to increment view count for knowledge center ${id}:`, response.status);
      return;
    }

    // Optionally handle success response
    const result = await response.json();
    console.log('View count incremented successfully:', result);
  } catch (error) {
    // Silently handle errors to avoid disrupting user experience
    console.warn('Error incrementing view count:', error);
  }
};

// Like/Unlike knowledge center API function
export const toggleKnowledgeCenterLike = async (id: string, like: boolean): Promise<{ success: boolean; message?: string }> => {
  const response = await fetch(`${API_ENDPOINTS.KNOWLEDGE_CENTERS}/${id}/engage`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ like }),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${like ? 'like' : 'unlike'} knowledge center: ${response.status}`);
  }

  return response.json();
};
