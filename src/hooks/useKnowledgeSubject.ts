/**
 * Knowledge Subject Custom Hooks
 *
 * Entity-based hooks following the API → Hooks → UI pattern
 * Manages state for knowledge subject domain entity
 */

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { knowledgeSubjectApi } from '@/api/knowledge-subject';
import {
  CreateKnowledgeSubjectRequest,
  UpdateKnowledgeSubjectRequest,
} from '@/types/knowledge-subject';

// Query keys
export const KNOWLEDGE_SUBJECTS_QUERY_KEY = ['knowledge-subjects'] as const;
export const KNOWLEDGE_SUBJECT_DETAIL_QUERY_KEY = (id: string) => ['knowledge-subjects', 'detail', id] as const;

/**
 * Hook untuk mengambil semua knowledge subjects
 */
export const useKnowledgeSubjects = () => {
  return useQuery({
    queryKey: KNOWLEDGE_SUBJECTS_QUERY_KEY,
    queryFn: () => knowledgeSubjectApi.fetchKnowledgeSubjects(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Hook untuk mengambil detail knowledge subject berdasarkan ID
 */
export const useKnowledgeSubject = (id: string) => {
  return useQuery({
    queryKey: KNOWLEDGE_SUBJECT_DETAIL_QUERY_KEY(id),
    queryFn: async () => {
      // Kita bisa menggunakan endpoint detail individual subject
      return await knowledgeSubjectApi.fetchKnowledgeSubjectById(id);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Hook untuk membuat knowledge subject baru
 */
export const useCreateKnowledgeSubject = (
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['knowledge-subjects', 'create'],
    mutationFn: (payload: CreateKnowledgeSubjectRequest) =>
      knowledgeSubjectApi.createKnowledgeSubject(payload),
    onSuccess: (data) => {
      // Invalidate cache untuk refresh data
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_SUBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: KNOWLEDGE_SUBJECT_DETAIL_QUERY_KEY(data.id)
      });
      onSuccess?.('Knowledge subject berhasil dibuat');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal membuat knowledge subject';
      onError?.(message);
    },
  });

  return {
    ...mutation,
    createKnowledgeSubject: mutation.mutateAsync,
  };
};

/**
 * Hook untuk mengupdate knowledge subject
 */
export const useUpdateKnowledgeSubject = (
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['knowledge-subjects', 'update'],
    mutationFn: ({ id, data }: { id: string; data: UpdateKnowledgeSubjectRequest }) =>
      knowledgeSubjectApi.updateKnowledgeSubject(id, data),
    onSuccess: (data) => {
      // Invalidate cache untuk refresh data
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_SUBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: KNOWLEDGE_SUBJECT_DETAIL_QUERY_KEY(data.id)
      });
      onSuccess?.('Knowledge subject berhasil diupdate');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal mengupdate knowledge subject';
      onError?.(message);
    },
  });

  return {
    ...mutation,
    updateKnowledgeSubject: mutation.mutateAsync,
  };
};

/**
 * Hook untuk menghapus knowledge subject
 */
export const useDeleteKnowledgeSubject = (
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['knowledge-subjects', 'delete'],
    mutationFn: (id: string) => knowledgeSubjectApi.deleteKnowledgeSubject(id),
    onSuccess: (_, deletedId) => {
      // Invalidate cache untuk refresh data
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_SUBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: KNOWLEDGE_SUBJECT_DETAIL_QUERY_KEY(deletedId)
      });
      onSuccess?.('Knowledge subject berhasil dihapus');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menghapus knowledge subject';
      onError?.(message);
    },
  });

  return {
    ...mutation,
    deleteKnowledgeSubject: mutation.mutateAsync,
  };
};

/**
 * Hook untuk knowledge subject management (CRUD operations)
 * Menggabungkan semua operasi CRUD dalam satu hook
 */
export const useKnowledgeSubjectManager = () => {
  const queryClient = useQueryClient();

  // Query operations
  const subjectsQuery = useKnowledgeSubjects();

  // Mutation operations
  const createMutation = useCreateKnowledgeSubject();
  const updateMutation = useUpdateKnowledgeSubject();
  const deleteMutation = useDeleteKnowledgeSubject();

  // Utility functions
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: KNOWLEDGE_SUBJECTS_QUERY_KEY });
  }, [queryClient]);

  const getSubjectById = useCallback((id: string) => {
    return subjectsQuery.data?.find((subject) => subject.id === id);
  }, [subjectsQuery.data]);

  const getSubjectByName = useCallback((name: string) => {
    return subjectsQuery.data?.find((subject) =>
      subject.name.toLowerCase() === name.toLowerCase()
    );
  }, [subjectsQuery.data]);

  return {
    // Data
    subjects: subjectsQuery.data || [],
    isLoading: subjectsQuery.isLoading,
    error: subjectsQuery.error,
    refetch,

    // CRUD operations
    create: createMutation.createKnowledgeSubject,
    update: updateMutation.updateKnowledgeSubject,
    delete: deleteMutation.deleteKnowledgeSubject,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Utilities
    getSubjectById,
    getSubjectByName,
  };
};

// Type exports untuk type safety
export type UseKnowledgeSubjectsReturn = ReturnType<typeof useKnowledgeSubjects>;
export type UseKnowledgeSubjectReturn = ReturnType<typeof useKnowledgeSubject>;
export type UseCreateKnowledgeSubjectReturn = ReturnType<typeof useCreateKnowledgeSubject>;
export type UseUpdateKnowledgeSubjectReturn = ReturnType<typeof useUpdateKnowledgeSubject>;
export type UseDeleteKnowledgeSubjectReturn = ReturnType<typeof useDeleteKnowledgeSubject>;
export type UseKnowledgeSubjectManagerReturn = ReturnType<typeof useKnowledgeSubjectManager>;