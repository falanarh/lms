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
  KnowledgeQueryParams,
  KnowledgeCentersResponse,
  KnowledgeCenterResponse,
} from '@/types/knowledge-center';
import type {
  PaginatedApiResponse,
  ApiResponse,
} from '@/types/api-response';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';

// Hardcoded penyelenggara data for dropdown (temporary until API ready)
export const PENYELENGGARA_DATA = [
  { value: 'Politeknik Statistika STIS', label: 'Politeknik Statistika STIS' },
  { value: 'Pusdiklat BPS', label: 'Pusdiklat BPS' },
  { value: 'Pusdiklat BPS RI', label: 'Pusdiklat BPS RI' },
  { value: 'Badan Pusat Statistik', label: 'Badan Pusat Statistik' },
  { value: 'BPS', label: 'BPS' },
];

const MEDIA_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:9999/api';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const DEFAULT_GC_TIME = 1000 * 60 * 10; // 10 minutes

const sanitizeArrayParam = <T extends string>(values?: T[]) => {
  if (!values?.length) return undefined;
  return Array.from(new Set(values.filter(Boolean))).sort();
};

const sanitizeKnowledgeParams = (params: KnowledgeQueryParams = {}) => {
  const normalized = {
    page: params.page ?? DEFAULT_PAGE,
    limit: params.limit ?? DEFAULT_LIMIT,
    sort: params.sort,
    search: params.search?.trim() || undefined,
    subject: sanitizeArrayParam(params.subject),
    penyelenggara: sanitizeArrayParam(params.penyelenggara),
    knowledgeType: sanitizeArrayParam(params.knowledgeType),
    mediaType: sanitizeArrayParam(params.mediaType),
    tags: sanitizeArrayParam(params.tags),
  };

  const query: Record<string, string | number | string[] | undefined> = {};
  (Object.keys(normalized) as Array<keyof typeof normalized>).forEach((key) => {
    const value = normalized[key];
    if (value === undefined) return;
    query[key] = value as string | number | string[];
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

  // Note: Knowledge Subject API functions have been moved to knowledge-subject.ts

  /**
   * Media upload helpers
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${MEDIA_SERVICE_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      return result.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async uploadPDF(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`${MEDIA_SERVICE_BASE_URL}/pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`PDF upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'PDF upload failed');
      }

      return result.data.fileUrl;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  },

  async uploadVideo(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${MEDIA_SERVICE_BASE_URL}/video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Video upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Video upload failed');
      }

      return result.data.videoUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  async uploadAudio(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch(`${MEDIA_SERVICE_BASE_URL}/audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Audio upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Audio upload failed');
      }

      return result.data.audioUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  },
};
