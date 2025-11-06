/**
 * Custom hooks for Knowledge Hub
 * Following the entity-based hooks pattern from coding principles
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  knowledgeApi,
  getKnowledgeQueryOptions,
  getKnowledgeByIdQueryOptions,
  getWebinarScheduleQueryOptions,
  getKnowledgeAnalyticsQueryOptions,
  getRelatedKnowledgeQueryOptions,
  getKnowledgeByAuthorQueryOptions,
  getReadingProgressQueryOptions,
  getKnowledgeCommentsQueryOptions,
  getKnowledgeRecommendationsQueryOptions,
  getSubjectsQueryOptions,
  getPenyelenggaraQueryOptions,
  KnowledgeQueryParams
} from '@/api/knowledge';
import { Knowledge } from '@/types/knowledge-center';

// Main Knowledge Hook
export function useKnowledge(params: KnowledgeQueryParams = {}) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeQueryOptions(params));

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 12,
    totalPages: data?.total_pages || 0,
    isLoading,
    error,
    refetch,
  };
}

// Single Knowledge Hook
export function useKnowledgeById(id: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeByIdQueryOptions(id));

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Webinar Schedule Hook - returns all webinars from knowledge data
export function useWebinarSchedule() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getWebinarScheduleQueryOptions());

  return {
    schedule: data || [],
    isLoading,
    error,
    refetch,
  };
}

// Knowledge Analytics Hook
export function useKnowledgeAnalytics() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeAnalyticsQueryOptions());

  return {
    analytics: data,
    isLoading,
    error,
    refetch,
  };
}

// Knowledge Categories Hook
export function useKnowledgeCategories() {
  const { data } = useKnowledge({ limit: 1000 });

  const categories = data ? [
    ...new Set(data.map(item => item.subject).filter(Boolean))
  ].sort() : [];

  return {
    categories,
    isLoading: false,
  };
}

// Popular Knowledge Hook
export function usePopularKnowledge(limit: number = 10) {
  return useKnowledge({
    sort: 'most_liked',
    limit,
  });
}

// Upcoming Webinars Hook - filters webinars to show only upcoming ones
export function useUpcomingWebinars(limit: number = 6) {
  const { schedule, isLoading, error } = useWebinarSchedule();

  const upcomingWebinars = React.useMemo(() => {
    if (!schedule) return [];

    const now = new Date();

    // Filter upcoming webinars and sort by date (nearest first)
    return schedule
      .filter(webinar => {
        const webinarDate = new Date(webinar.tgl_zoom);
        return webinarDate > now; // Only future webinars
      })
      .sort((a, b) => {
        const dateA = new Date(a.tgl_zoom);
        const dateB = new Date(b.tgl_zoom);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, limit); // Limit the number of results
  }, [schedule, limit]);

  return {
    upcomingWebinars,
    isLoading,
    error,
  };
}

// Knowledge by Type Hook
export function useKnowledgeByType(type: 'webinar' | 'konten', params: Omit<KnowledgeQueryParams, 'knowledge_type'> = {}) {
  return useKnowledge({
    ...params,
    knowledge_type: [type],
  });
}

// Knowledge by Subject Hook
export function useKnowledgeBySubject(subject: string, params: Omit<KnowledgeQueryParams, 'subject'> = {}) {
  return useKnowledge({
    ...params,
    subject: [subject],
  });
}

// Featured Knowledge Hook
export function useFeaturedKnowledge(limit: number = 6) {
  const { data, isLoading, error } = useKnowledge({ limit: 1000 });

  // For now, take the first items as featured since there's no is_featured field
  const featuredData = data ? data.slice(0, limit) : [];

  return {
    data: featuredData,
    isLoading,
    error,
  };
}

// Search Knowledge Hook
export function useSearchKnowledge(query: string, params: Omit<KnowledgeQueryParams, 'search'> = {}) {
  return useKnowledge({
    ...params,
    search: query,
  });
}

// Create Knowledge Mutation Hook
export function useCreateKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.createKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
    onError: (error) => {
      console.error('Failed to create knowledge:', error);
    },
  });
}

// Update Knowledge Mutation Hook
export function useUpdateKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Knowledge> }) =>
      knowledgeApi.updateKnowledge(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge', id] });
    },
    onError: (error) => {
      console.error('Failed to update knowledge:', error);
    },
  });
}

// Delete Knowledge Mutation Hook
export function useDeleteKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.deleteKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
    onError: (error) => {
      console.error('Failed to delete knowledge:', error);
    },
  });
}

// Toggle Like Knowledge Mutation Hook
export function useToggleLikeKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.toggleLikeKnowledge,
    onSuccess: (_, knowledgeId) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge', knowledgeId] });
    },
    onError: (error) => {
      console.error('Failed to toggle like:', error);
    },
  });
}

// Increment Views Mutation Hook
export function useIncrementViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.incrementViews,
    onSuccess: (_, knowledgeId) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge', knowledgeId] });
    },
    onError: (error) => {
      console.error('Failed to increment views:', error);
    },
  });
}

// Utility Hook for Knowledge Stats
export function useKnowledgeStats() {
  const { analytics, isLoading, error } = useKnowledgeAnalytics();

  const stats = analytics ? {
    totalKnowledge: analytics.total_knowledge,
    totalWebinars: analytics.total_webinars,
    totalViews: analytics.total_views,
    totalLikes: analytics.total_likes,
    popularSubjects: analytics.top_subjects.slice(0, 5),
    monthlyGrowth: [], // Not available in new type
  } : null;

  return {
    stats,
    isLoading,
    error,
  };
}

// Utility Hook for Knowledge Filters
export function useKnowledgeFilters() {
  const [filters, setFilters] = React.useState<KnowledgeQueryParams>({});

  const updateFilter = React.useCallback((key: keyof KnowledgeQueryParams, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = React.useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof KnowledgeQueryParams];
      return value !== undefined && value !== null && value !== '' &&
             (Array.isArray(value) ? value.length > 0 : true);
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}

// Utility Hook for Pagination
export function useKnowledgePagination(totalPages: number, onPageChange: (page: number) => void) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange(page);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onPageChange]);

  const resetPage = React.useCallback(() => {
    setCurrentPage(1);
    onPageChange(1);
  }, [onPageChange]);

  return {
    currentPage,
    handlePageChange,
    resetPage,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };
}

// Detail Knowledge Hooks
export function useRelatedKnowledge(id: string, limit: number = 6) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getRelatedKnowledgeQueryOptions(id, limit));

  return {
    relatedKnowledge: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useKnowledgeByAuthor(author: string, limit: number = 5) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeByAuthorQueryOptions(author, limit));

  return {
    authorKnowledge: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useReadingProgress(userId: string, knowledgeId: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getReadingProgressQueryOptions(userId, knowledgeId));

  return {
    progress: data,
    isLoading,
    error,
    refetch,
  };
}

export function useKnowledgeComments(knowledgeId: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeCommentsQueryOptions(knowledgeId));

  return {
    comments: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useKnowledgeRecommendations(userId: string, limit: number = 8) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeRecommendationsQueryOptions(userId, limit));

  return {
    recommendations: data || [],
    isLoading,
    error,
    refetch,
  };
}

// Mutation Hooks for Detail Page
export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, knowledgeId, progress }: {
      userId: string;
      knowledgeId: string;
      progress: number
    }) => knowledgeApi.updateReadingProgress(userId, knowledgeId, progress),
    onSuccess: (_, { userId, knowledgeId }) => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', userId, knowledgeId] });
    },
    onError: (error) => {
      console.error('Failed to update reading progress:', error);
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ knowledgeId, content, userId }: {
      knowledgeId: string;
      content: string;
      userId: string
    }) => knowledgeApi.addKnowledgeComment(knowledgeId, content, userId),
    onSuccess: (_, { knowledgeId }) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-comments', knowledgeId] });
    },
    onError: (error) => {
      console.error('Failed to add comment:', error);
    },
  });
}

// Utility Hook for Detail Page
export function useKnowledgeDetail(id: string, userId?: string) {
  const { data: knowledge, isLoading: knowledgeLoading, error: knowledgeError } = useKnowledgeById(id);
  const { relatedKnowledge, isLoading: relatedLoading } = useRelatedKnowledge(id);
  const { authorKnowledge, isLoading: authorLoading } = useKnowledgeByAuthor(knowledge?.author || '');
  const { progress, isLoading: progressLoading } = useReadingProgress(userId || '', id);
  const { comments, isLoading: commentsLoading } = useKnowledgeComments(id);
  const { recommendations, isLoading: recommendationsLoading } = useKnowledgeRecommendations(userId || '');

  return {
    knowledge,
    relatedKnowledge,
    authorKnowledge,
    progress,
    comments,
    recommendations,
    isLoading: knowledgeLoading || relatedLoading || authorLoading || progressLoading || commentsLoading || recommendationsLoading,
    error: knowledgeError,
  };
}

// Hook for managing detail page interactions
export function useKnowledgeDetailInteractions(id: string, userId?: string) {
  const [showComments, setShowComments] = React.useState(false);
  const [showRecommendations, setShowRecommendations] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [volume, setVolume] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const incrementViewsMutation = useIncrementViews();
  const updateProgressMutation = useUpdateReadingProgress();
  const addCommentMutation = useAddComment();

  const handleIncrementViews = React.useCallback(() => {
    incrementViewsMutation.mutate(id);
  }, [id, incrementViewsMutation]);

  const handleUpdateProgress = React.useCallback((progress: number) => {
    if (userId) {
      updateProgressMutation.mutate({ userId, knowledgeId: id, progress });
    }
  }, [userId, id, updateProgressMutation]);

  const handleAddComment = React.useCallback((content: string) => {
    if (userId) {
      addCommentMutation.mutate({ knowledgeId: id, content, userId });
    }
  }, [userId, id, addCommentMutation]);

  const toggleComments = React.useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  const toggleRecommendations = React.useCallback(() => {
    setShowRecommendations(prev => !prev);
  }, []);

  const togglePlayback = React.useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSpeedChange = React.useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const handleVolumeChange = React.useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  return {
    // State
    showComments,
    showRecommendations,
    isPlaying,
    playbackSpeed,
    volume,
    isFullscreen,

    // Mutation states
    isUpdatingViews: incrementViewsMutation.isPending,
    isUpdatingProgress: updateProgressMutation.isPending,
    isAddingComment: addCommentMutation.isPending,

    // Actions
    handleIncrementViews,
    handleUpdateProgress,
    handleAddComment,
    toggleComments,
    toggleRecommendations,
    togglePlayback,
    handleSpeedChange,
    handleVolumeChange,
    toggleFullscreen,
  };
}

// Create Knowledge Hooks
export function useSubjects() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getSubjectsQueryOptions());

  return {
    subjects: data || [],
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
  } = useQuery(getPenyelenggaraQueryOptions());

  return {
    penyelenggara: data || [],
    isLoading,
    error,
    refetch,
  };
}

// Hook for managing create knowledge form state
export function useCreateKnowledgeForm() {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    subject: '',
    penyelenggara: '',
    knowledge_type: undefined as 'webinar' | 'konten' | undefined,
    author: '',
    tags: [] as string[],
    published_at: new Date().toISOString(),
    status: 'draft' as 'draft' | 'published',
    // Webinar specific fields
    tgl_zoom: '',
    link_zoom: '',
    link_youtube: '',
    link_record: '',
    link_vb: '',
    file_notulensi_pdf: undefined as File | undefined,
    jumlah_jp: undefined as number | undefined,
    // Content specific fields
    media_resource: undefined as File | undefined,
    media_type: undefined as 'video' | 'audio' | 'pdf' | 'article' | undefined,
    content_richtext: '',
    thumbnail: undefined as File | undefined,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
  const [currentTagInput, setCurrentTagInput] = React.useState<string>('');
  const [contentType, setContentType] = React.useState<'article' | 'video' | 'podcast' | 'pdf' | null>(null);

  const updateFormData = React.useCallback((field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateStep = React.useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation logic can be added here based on step requirements
    // For now, we'll return true as the current form has validation commented out

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleThumbnailSelect = React.useCallback((file: File) => {
    updateFormData('thumbnail', file);

    // Create preview URL for image
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [updateFormData]);

  const handleThumbnailRemove = React.useCallback(() => {
    updateFormData('thumbnail', undefined);
    setThumbnailPreview(null);
  }, [updateFormData]);

  const handleAddTag = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = currentTagInput.trim();

      if (newTag && !formData.tags.includes(newTag)) {
        updateFormData('tags', [...formData.tags, newTag]);
        setCurrentTagInput('');
      }
    }
  }, [currentTagInput, formData.tags, updateFormData]);

  const handleRemoveTag = React.useCallback((tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  }, [formData.tags, updateFormData]);

  const resetForm = React.useCallback(() => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      penyelenggara: '',
      knowledge_type: undefined,
      author: '',
      tags: [],
      published_at: new Date().toISOString(),
      status: 'draft',
      tgl_zoom: '',
      link_zoom: '',
      link_youtube: '',
      link_record: '',
      link_vb: '',
      file_notulensi_pdf: undefined,
      jumlah_jp: undefined,
      media_resource: undefined,
      media_type: undefined,
      content_richtext: '',
      thumbnail: undefined,
    });
    setErrors({});
    setThumbnailPreview(null);
    setCurrentTagInput('');
    setContentType(null);
  }, []);

  return {
    // State
    formData,
    errors,
    thumbnailPreview,
    currentTagInput,
    contentType,

    // Actions
    updateFormData,
    validateStep,
    handleThumbnailSelect,
    handleThumbnailRemove,
    handleAddTag,
    handleRemoveTag,
    setCurrentTagInput,
    setContentType,
    resetForm,
  };
}

// Hook for managing create knowledge wizard
export function useCreateKnowledgeWizard() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const form = useCreateKnowledgeForm();

  const handleNext = React.useCallback(() => {
    if (form.validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [currentStep, form]);

  const handlePrevious = React.useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = React.useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  }, []);

  const resetWizard = React.useCallback(() => {
    setCurrentStep(1);
    form.resetForm();
  }, [form]);

  return {
    // State
    currentStep,
    form,

    // Actions
    handleNext,
    handlePrevious,
    goToStep,
    resetWizard,
  };
}