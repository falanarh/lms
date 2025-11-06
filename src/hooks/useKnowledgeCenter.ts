/**
 * Knowledge Center Custom Hooks
 *
 * Entity-based hooks following the API → Hooks → UI pattern
 * Each hook manages state for a specific domain entity
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  knowledgeApi,
  taxonomyApi,
  analyticsApi,
  scheduleApi,
  settingsApi,
} from '@/api/knowledge-center';
import {
  KnowledgeQueryParams,
  CreateKnowledgeFormData,
  Subject,
  Penyelenggara,
  Tag,
  WebinarSchedule,
  KnowledgeCenterSettings,
} from '@/types/knowledge-center';

// Query keys for cache management
export const KNOWLEDGE_QUERY_KEYS = {
  all: ['knowledge'] as const,
  lists: () => [...KNOWLEDGE_QUERY_KEYS.all, 'list'] as const,
  list: (params: KnowledgeQueryParams) => [...KNOWLEDGE_QUERY_KEYS.lists(), params] as const,
  details: () => [...KNOWLEDGE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...KNOWLEDGE_QUERY_KEYS.details(), id] as const,
} as const;

export const TAXONOMY_QUERY_KEYS = {
  subjects: ['subjects'] as const,
  penyelenggara: ['penyelenggara'] as const,
  tags: ['tags'] as const,
} as const;

export const ANALYTICS_QUERY_KEYS = {
  analytics: ['analytics'] as const,
} as const;

export const SCHEDULE_QUERY_KEYS = {
  schedule: ['schedule'] as const,
} as const;

export const SETTINGS_QUERY_KEYS = {
  settings: ['settings'] as const,
} as const;

const SUBJECT_FALLBACK_NAMES: string[] = [
  'Ekonomi Makro',
  'Ekonomi Mikro',
  'Statistik Sosial',
  'Statistik Industri',
  'Statistik Pertanian',
  'Statistik Perdagangan',
  'Statistik Ketenagakerjaan',
  'Statistik Kesehatan',
  'Statistik Lingkungan',
  'Statistik Pendidikan',
  'Statistik Transportasi',
  'Statistik Pariwisata',
  'Statistik Energi',
  'Statistik Teknologi',
  'Statistik Keuangan',
  'Statistik Pertambangan',
  'Statistik Perikanan',
  'Statistik Kehutanan',
  'Statistik Perumahan',
  'Statistik Kependudukan',
  'Sistem Informasi',
  'Transformasi Digital',
  'Analitik Data',
  'Kebijakan Publik',
  'Geospasial',
  'Pembangunan Daerah',
  'Demografi',
  'Metodologi Survei',
  'Pengembangan SDM',
  'Inovasi Layanan',
  'Manajemen Pengetahuan',
  'Governansi Data',
  'Integrasi Sistem',
  'Keamanan Informasi',
  'Internet of Things',
  'Kecerdasan Buatan',
  'Ekonomi Kreatif',
  'Ekonomi Maritim',
  'Ekonomi Syariah',
  'Logistik Nasional',
  'Reformasi Birokrasi',
  'Pelayanan Publik',
  'Komunikasi Publik',
  'Budaya Statistik',
  'Harmonisasi Regulasi',
  'Kemitraan Strategis',
  'Pengelolaan Arsip',
  'Pengelolaan Risiko',
  'Manajemen Perubahan',
  'Pengadaan Barang/Jasa',
  'Perencanaan Strategis',
  'Monitoring & Evaluasi',
  'Layanan Data',
  'Ekonomi Digital',
  'Big Data',
  'Open Data',
  'Kota Cerdas',
  'Analisis Kebijakan',
  'Pengembangan Kurikulum',
  'Pelatihan Teknis',
  'Pengembangan Modul',
  'Kompetensi ASN',
  'Kepemimpinan Transformasional',
  'Inovasi Organisasi',
  'Manajemen Kinerja',
  'Manajemen Talenta',
  'Pengembangan SDM Statistik',
];

const SUBJECT_FALLBACKS: Subject[] = SUBJECT_FALLBACK_NAMES.map((name, index) => ({
  id: `fallback-subject-${index + 1}`,
  name,
}));

// Main Knowledge hooks
export function useKnowledge(params: KnowledgeQueryParams = {}) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: KNOWLEDGE_QUERY_KEYS.list(params),
    queryFn: () => knowledgeApi.getKnowledge(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.total_pages || 0,
    isLoading,
    error,
    refetch,
  };
}

export function useKnowledgeDetail(id: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: KNOWLEDGE_QUERY_KEYS.detail(id),
    queryFn: () => knowledgeApi.getKnowledgeById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes for details
    gcTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    data: data?.data,
    isLoading,
    error,
    refetch,
  };
}

export function useCreateKnowledge() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateKnowledgeFormData) => knowledgeApi.createKnowledge(data),
    onSuccess: () => {
      // Invalidate all knowledge lists to refresh
      queryClient.invalidateQueries({
        queryKey: KNOWLEDGE_QUERY_KEYS.lists(),
      });
    },
    onError: (error) => {
      console.error('Failed to create knowledge:', error);
    },
  });

  return {
    createKnowledge: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

export function useUpdateKnowledge() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateKnowledgeFormData> }) =>
      knowledgeApi.updateKnowledge(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate the specific item and all lists
      queryClient.invalidateQueries({
        queryKey: KNOWLEDGE_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: KNOWLEDGE_QUERY_KEYS.lists(),
      });
    },
    onError: (error) => {
      console.error('Failed to update knowledge:', error);
    },
  });

  return {
    updateKnowledge: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

export function useDeleteKnowledge() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.deleteKnowledge(id),
    onSuccess: () => {
      // Invalidate all knowledge lists to refresh
      queryClient.invalidateQueries({
        queryKey: KNOWLEDGE_QUERY_KEYS.lists(),
      });
    },
    onError: (error) => {
      console.error('Failed to delete knowledge:', error);
    },
  });

  return {
    deleteKnowledge: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

// Interaction hooks (like/dislike)
export function useKnowledgeInteraction() {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.likeKnowledge(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: KNOWLEDGE_QUERY_KEYS.detail(id) });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(KNOWLEDGE_QUERY_KEYS.detail(id));

      // Optimistically update
      queryClient.setQueryData(KNOWLEDGE_QUERY_KEYS.detail(id), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            like_count: old.data.like_count + 1,
          },
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(KNOWLEDGE_QUERY_KEYS.detail(id), context.previousData);
      }
    },
    onSettled: (_, __, id) => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_QUERY_KEYS.detail(id) });
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.dislikeKnowledge(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KNOWLEDGE_QUERY_KEYS.detail(id) });

      const previousData = queryClient.getQueryData(KNOWLEDGE_QUERY_KEYS.detail(id));

      queryClient.setQueryData(KNOWLEDGE_QUERY_KEYS.detail(id), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            dislike_count: old.data.dislike_count + 1,
          },
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(KNOWLEDGE_QUERY_KEYS.detail(id), context.previousData);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_QUERY_KEYS.detail(id) });
    },
  });

  return {
    like: likeMutation.mutate,
    dislike: dislikeMutation.mutate,
    isLiking: likeMutation.isPending,
    isDisliking: dislikeMutation.isPending,
  };
}

// Taxonomy hooks
export function useSubjects() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: TAXONOMY_QUERY_KEYS.subjects,
    queryFn: taxonomyApi.getSubjects,
    staleTime: 1000 * 60 * 30, // 30 minutes for taxonomy data
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const fetchedSubjects = Array.isArray(data) ? data.filter(Boolean) as Subject[] : [];

  // Merge fetched subjects with curated fallback list, ensuring uniqueness by name
  const subjectMap = new Map<string, Subject>();

  fetchedSubjects.forEach((subject) => {
    if (!subject?.name) return;
    subjectMap.set(subject.name.trim().toLowerCase(), subject);
  });

  SUBJECT_FALLBACKS.forEach((fallback) => {
    const key = fallback.name.trim().toLowerCase();
    if (!subjectMap.has(key)) {
      subjectMap.set(key, fallback);
    }
  });

  const resolvedSubjects = Array.from(subjectMap.values());

  return {
    subjects: resolvedSubjects,
    isLoading,
    error,
    refetch,
  };
}

export function usePenyelenggara() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: TAXONOMY_QUERY_KEYS.penyelenggara,
    queryFn: taxonomyApi.getPenyelenggara,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  return {
    penyelenggara: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useTags() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: TAXONOMY_QUERY_KEYS.tags,
    queryFn: taxonomyApi.getTags,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  return {
    tags: data || [],
    isLoading,
    error,
    refetch,
  };
}

// Taxonomy management hooks
export function useSubjectManagement() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: taxonomyApi.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.subjects });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subject> }) =>
      taxonomyApi.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.subjects });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taxonomyApi.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.subjects });
    },
  });

  return {
    createSubject: createMutation.mutate,
    updateSubject: updateMutation.mutate,
    deleteSubject: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePenyelenggaraManagement() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: taxonomyApi.createPenyelenggara,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.penyelenggara });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Penyelenggara> }) =>
      taxonomyApi.updatePenyelenggara(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.penyelenggara });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taxonomyApi.deletePenyelenggara,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.penyelenggara });
    },
  });

  return {
    createPenyelenggara: createMutation.mutate,
    updatePenyelenggara: updateMutation.mutate,
    deletePenyelenggara: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTagManagement() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: taxonomyApi.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.tags });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tag> }) =>
      taxonomyApi.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.tags });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taxonomyApi.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.tags });
    },
  });

  return {
    createTag: createMutation.mutate,
    updateTag: updateMutation.mutate,
    deleteTag: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Analytics hook
export function useKnowledgeAnalytics() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.analytics,
    queryFn: analyticsApi.getKnowledgeAnalytics,
    staleTime: 1000 * 60 * 5, // 5 minutes for analytics
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    analytics: data,
    isLoading,
    error,
    refetch,
  };
}

// Schedule hook
export function useWebinarSchedule() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SCHEDULE_QUERY_KEYS.schedule,
    queryFn: scheduleApi.getWebinarSchedule,
    staleTime: 1000 * 60 * 2, // 2 minutes for schedule
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    schedule: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useWebinarScheduleManagement() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WebinarSchedule> }) =>
      scheduleApi.updateWebinarSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.schedule });
    },
  });

  return {
    updateSchedule: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

// Settings hook
export function useKnowledgeSettings() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.settings,
    queryFn: settingsApi.getKnowledgeSettings,
    staleTime: 1000 * 60 * 60, // 1 hour for settings
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });

  return {
    settings: data,
    isLoading,
    error,
    refetch,
  };
}

export function useKnowledgeSettingsManagement() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: Partial<KnowledgeCenterSettings>) =>
      settingsApi.updateKnowledgeSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.settings });
    },
  });

  return {
    updateSettings: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

// Utility function to get current user ID (following existing pattern)
export const getCurrentUserId = () => "b157852b-82ff-40ed-abf8-2f8fe26377aa";
