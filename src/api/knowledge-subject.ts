/**
 * Knowledge Subject API
 *
 * API functions specifically for Knowledge Subject domain entity
 * Separated from knowledge-center.ts for better maintainability
 * Following the API → Hooks → UI pattern
 */

import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

import {
  KnowledgeSubject,
  CreateKnowledgeSubjectRequest,
  UpdateKnowledgeSubjectRequest,
  KnowledgeSubjectsResponse,
  KnowledgeSubjectResponse,
} from '@/types/knowledge-subject';
import type {
  PaginatedApiResponse,
  ApiResponse,
} from '@/types/api-response';
import { API_CONFIG } from '@/config/api';

// Base URL for Knowledge Subject API
const KNOWLEDGE_SUBJECT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
const KNOWLEDGE_SUBJECT_BASE_URL = `${KNOWLEDGE_SUBJECT_API_BASE}/knowledge-subjects`;

// Default cache settings
const DEFAULT_STALE_TIME = 1000 * 60 * 10; // 10 minutes
const DEFAULT_GC_TIME = 1000 * 60 * 15; // 15 minutes

// Query keys
export const KNOWLEDGE_SUBJECTS_QUERY_KEY = ['knowledge-subjects'] as const;
export const KNOWLEDGE_SUBJECT_DETAIL_QUERY_KEY = (id: string) => ['knowledge-subjects', 'detail', id] as const;

// Query options for React Query
export const getKnowledgeSubjectsQueryOptions = () =>
  queryOptions({
    queryKey: KNOWLEDGE_SUBJECTS_QUERY_KEY,
    queryFn: fetchKnowledgeSubjects,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });

export const getKnowledgeSubjectDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: KNOWLEDGE_SUBJECT_DETAIL_QUERY_KEY(id),
    queryFn: () => fetchKnowledgeSubjectById(id),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });

// API Functions

/**
 * Fetch all knowledge subjects
 */
export const fetchKnowledgeSubjects = async (): Promise<KnowledgeSubject[]> => {
  try {
    const response = await axios.get<KnowledgeSubjectsResponse>(KNOWLEDGE_SUBJECT_BASE_URL, {
      ...API_CONFIG,
      baseURL: undefined,
    });

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch knowledge subjects');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching knowledge subjects:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to connect to knowledge subject server');
    }
    throw error;
  }
};

/**
 * Fetch a single knowledge subject by ID
 */
export const fetchKnowledgeSubjectById = async (id: string): Promise<KnowledgeSubject> => {
  try {
    const response = await axios.get<KnowledgeSubjectResponse>(
      `${KNOWLEDGE_SUBJECT_BASE_URL}/${id}`,
      {
        ...API_CONFIG,
        baseURL: undefined,
      }
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch knowledge subject detail');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching knowledge subject by ID:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to connect to knowledge subject server');
    }
    throw error;
  }
};

/**
 * Create a new knowledge subject
 */
export const createKnowledgeSubject = async (
  subjectData: CreateKnowledgeSubjectRequest
): Promise<KnowledgeSubject> => {
  try {
    const response = await axios.post<KnowledgeSubjectResponse>(
      KNOWLEDGE_SUBJECT_BASE_URL,
      subjectData,
      {
        ...API_CONFIG,
        baseURL: undefined,
      }
    );

    if (response.data.status !== 201) {
      throw new Error(response.data.message || 'Failed to create knowledge subject');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error creating knowledge subject:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create knowledge subject');
    }
    throw error;
  }
};

/**
 * Update an existing knowledge subject
 */
export const updateKnowledgeSubject = async (
  id: string,
  subjectData: UpdateKnowledgeSubjectRequest
): Promise<KnowledgeSubject> => {
  try {
    const response = await axios.patch<KnowledgeSubjectResponse>(
      `${KNOWLEDGE_SUBJECT_BASE_URL}/${id}`,
      subjectData,
      {
        ...API_CONFIG,
        baseURL: undefined,
      }
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to update knowledge subject');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error updating knowledge subject:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update knowledge subject');
    }
    throw error;
  }
};

/**
 * Delete a knowledge subject
 */
export const deleteKnowledgeSubject = async (id: string): Promise<boolean> => {
  try {
    const response = await axios.delete<ApiResponse<boolean>>(
      `${KNOWLEDGE_SUBJECT_BASE_URL}/${id}`,
      {
        ...API_CONFIG,
        baseURL: undefined,
      }
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to delete knowledge subject');
    }

    return true;
  } catch (error) {
    console.error('Error deleting knowledge subject:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete knowledge subject');
    }
    throw error;
  }
};

// Advanced query functions

/**
 * Fetch knowledge subjects with pagination and filtering
 */
export const fetchKnowledgeSubjectsWithPagination = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: 'name' | 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
  } = {}
): Promise<PaginatedApiResponse<KnowledgeSubject>> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search.trim());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const url = queryParams.toString()
      ? `${KNOWLEDGE_SUBJECT_BASE_URL}?${queryParams.toString()}`
      : KNOWLEDGE_SUBJECT_BASE_URL;

    const response = await axios.get<PaginatedApiResponse<KnowledgeSubject>>(url, {
      ...API_CONFIG,
      baseURL: undefined,
    });

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to fetch knowledge subjects with pagination');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching knowledge subjects with pagination:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to connect to knowledge subject server');
    }
    throw error;
  }
};

/**
 * Search knowledge subjects by name
 */
export const searchKnowledgeSubjects = async (searchTerm: string): Promise<KnowledgeSubject[]> => {
  if (!searchTerm.trim()) {
    return [];
  }

  try {
    const response = await axios.get<KnowledgeSubjectsResponse>(
      `${KNOWLEDGE_SUBJECT_BASE_URL}/search?q=${encodeURIComponent(searchTerm.trim())}`,
      {
        ...API_CONFIG,
        baseURL: undefined,
      }
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to search knowledge subjects');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error searching knowledge subjects:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to search knowledge subjects');
    }
    throw error;
  }
};

// Batch operations

/**
 * Create multiple knowledge subjects in a batch
 */
export const createKnowledgeSubjectsBatch = async (
  subjectsData: CreateKnowledgeSubjectRequest[]
): Promise<KnowledgeSubject[]> => {
  try {
    const response = await axios.post<KnowledgeSubjectsResponse>(
      `${KNOWLEDGE_SUBJECT_BASE_URL}/batch`,
      { subjects: subjectsData },
      {
        ...API_CONFIG,
        baseURL: undefined,
      }
    );

    if (response.data.status !== 201) {
      throw new Error(response.data.message || 'Failed to create knowledge subjects in batch');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error creating knowledge subjects in batch:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create knowledge subjects in batch');
    }
    throw error;
  }
};

/**
 * Delete multiple knowledge subjects in a batch
 */
export const deleteKnowledgeSubjectsBatch = async (ids: string[]): Promise<boolean> => {
  try {
    const response = await axios.delete<ApiResponse<boolean>>(
      `${KNOWLEDGE_SUBJECT_BASE_URL}/batch`,
      {
        ...API_CONFIG,
        baseURL: undefined,
        data: { ids },
      }
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || 'Failed to delete knowledge subjects in batch');
    }

    return true;
  } catch (error) {
    console.error('Error deleting knowledge subjects in batch:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete knowledge subjects in batch');
    }
    throw error;
  }
};

// API object with all knowledge subject functions
export const knowledgeSubjectApi = {
  // Basic CRUD
  fetchKnowledgeSubjects,
  fetchKnowledgeSubjectById,
  createKnowledgeSubject,
  updateKnowledgeSubject,
  deleteKnowledgeSubject,

  // Advanced queries
  fetchKnowledgeSubjectsWithPagination,
  searchKnowledgeSubjects,

  // Batch operations
  createKnowledgeSubjectsBatch,
  deleteKnowledgeSubjectsBatch,
};

// Default export
export default knowledgeSubjectApi;