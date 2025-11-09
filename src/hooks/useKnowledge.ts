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
  getKnowledgeSubjectsQueryOptions,
  getKnowledgeCentersQueryOptions,
  getKnowledgeCenterByIdQueryOptions,
  KnowledgeQueryParams,
  KnowledgeSubject,
  KnowledgeCenter,
  CreateKnowledgeSubjectRequest,
  UpdateKnowledgeSubjectRequest,
  CreateKnowledgeCenterRequest,
  UpdateKnowledgeCenterRequest
} from '@/api/knowledge';
import { Knowledge } from '@/types/knowledge-center';

// Keep only essential hooks that are still being used

// Utility Hooks for Knowledge Center components
export function useKnowledgeStats() {
  // Mock stats for now - could be replaced with real API call
  const stats = {
    total_knowledge: 150,
    total_webinars: 45,
    total_views: 15234,
    total_likes: 892,
    top_subjects: [
      { name: 'Statistika', count: 25 },
      { name: 'Ekonomi', count: 18 },
      { name: 'Metodologi', count: 12 }
    ]
  };

  return {
    stats,
    isLoading: false,
    error: null,
  };
}

export function usePopularKnowledge(limit: number = 6) {
  const { centers, isLoading } = useKnowledgeCenters();

  // Transform KnowledgeCenter to Knowledge format and sort by likeCount
  const popularKnowledge = centers
    .map(center => {
      // Transform from KnowledgeCenter API format to Knowledge component format
      const transformed: Knowledge = {
        id: center.id,
        title: center.title,
        description: center.description,
        subject: center.subject?.name || '',
        knowledge_type: center.type === 'webinar' ? 'webinar' : 'konten',
        penyelenggara: center.penyelenggara,
        thumbnail: center.thumbnail,
        author: center.createdBy,
        like_count: center.likeCount,
        dislike_count: 0, // Not available in new API
        view_count: center.viewCount,
        tags: [], // Not available in new API
        published_at: center.publishedAt,
        created_at: center.createdAt,
        updated_at: center.updatedAt,
        // Add webinar specific fields if applicable
        ...(center.type === 'webinar' && center.webinar ? {
          tgl_zoom: center.webinar.zoomDate,
          link_zoom: center.webinar.zoomLink,
          link_record: center.webinar.recordLink,
          link_youtube: center.webinar.youtubeLink,
          link_vb: center.webinar.vbLink,
          content_richtext: center.webinar.contentText,
          jumlah_jp: center.webinar.jpCount,
        } : {}),
        // Add content specific fields if applicable
        ...(center.type === 'content' && center.knowledgeContent ? {
          media_resource: center.knowledgeContent.mediaUrl,
          media_type: center.knowledgeContent.contentType,
          content_richtext: center.knowledgeContent.text,
        } : {}),
      };
      return transformed;
    })
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, limit);

  return {
    data: popularKnowledge,
    isLoading,
  };
}

export function useUpcomingWebinars(limit: number = 6) {
  const { centers, isLoading } = useKnowledgeCenters();

  // Filter webinars, transform to Knowledge format, and sort by date
  const now = new Date();
  const upcomingWebinars = centers
    .filter(center => center.type === 'webinar' && center.webinar)
    .map(center => {
      // Transform from KnowledgeCenter API format to Knowledge component format
      const transformed: Knowledge = {
        id: center.id,
        title: center.title,
        description: center.description,
        subject: center.subject?.name || '',
        knowledge_type: 'webinar',
        penyelenggara: center.penyelenggara,
        thumbnail: center.thumbnail,
        author: center.createdBy,
        like_count: center.likeCount,
        dislike_count: 0,
        view_count: center.viewCount,
        tags: [],
        published_at: center.publishedAt,
        created_at: center.createdAt,
        updated_at: center.updatedAt,
        // Webinar specific fields
        tgl_zoom: center.webinar?.zoomDate,
        link_zoom: center.webinar?.zoomLink,
        link_record: center.webinar?.recordLink,
        link_youtube: center.webinar?.youtubeLink,
        link_vb: center.webinar?.vbLink,
        content_richtext: center.webinar?.contentText,
        jumlah_jp: center.webinar?.jpCount,
      };
      return {
        ...transformed,
        webinarDate: center.webinar?.zoomDate ? new Date(center.webinar.zoomDate) : null
      };
    })
    .filter(webinar => webinar.webinarDate && webinar.webinarDate > now)
    .sort((a, b) => (a.webinarDate?.getTime() || 0) - (b.webinarDate?.getTime() || 0))
    .slice(0, limit);

  return {
    upcomingWebinars,
    isLoading,
  };
}

export function useAddSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.addSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error) => {
      console.error('Failed to add subject:', error);
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; icon?: string } }) =>
      knowledgeApi.updateSubject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error) => {
      console.error('Failed to update subject:', error);
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error) => {
      console.error('Failed to delete subject:', error);
    },
  });
}


// Knowledge Subjects Hooks
export function useKnowledgeSubjects() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeSubjectsQueryOptions());

  return {
    subjects: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useCreateKnowledgeSubject(onSuccess?: (message: string) => void, onError?: (message: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectData: CreateKnowledgeSubjectRequest) =>
      knowledgeApi.createKnowledgeSubject(subjectData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-subjects'] });
      const successMessage = `Subject "${data.name}" berhasil dibuat!`;
      onSuccess?.(successMessage);
    },
    onError: (error) => {
      console.error('Failed to create knowledge subject:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat subject. Silakan coba lagi.';
      onError?.(errorMessage);
    },
  });
}

export function useUpdateKnowledgeSubject(onSuccess?: (message: string) => void, onError?: (message: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKnowledgeSubjectRequest }) =>
      knowledgeApi.updateKnowledgeSubject(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-subjects'] });
      const successMessage = `Subject "${data.name}" berhasil diperbarui!`;
      onSuccess?.(successMessage);
    },
    onError: (error) => {
      console.error('Failed to update knowledge subject:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui subject. Silakan coba lagi.';
      onError?.(errorMessage);
    },
  });
}

export function useDeleteKnowledgeSubject(onSuccess?: (message: string) => void, onError?: (message: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.deleteKnowledgeSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-subjects'] });
      const successMessage = 'Subject berhasil dihapus!';
      onSuccess?.(successMessage);
    },
    onError: (error) => {
      console.error('Failed to delete knowledge subject:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus subject. Silakan coba lagi.';
      onError?.(errorMessage);
    },
  });
}

// Knowledge Centers Hooks (New API)
export function useKnowledgeCenters() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeCentersQueryOptions());

  return {
    centers: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useKnowledgeCenter(id: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(getKnowledgeCenterByIdQueryOptions(id));

  return {
    center: data,
    isLoading,
    error,
    refetch,
  };
}

export function useCreateKnowledgeCenter(onSuccess?: (message: string) => void, onError?: (message: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (centerData: CreateKnowledgeCenterRequest) =>
      knowledgeApi.createKnowledgeCenter(centerData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-centers'] });
      const successMessage = `Knowledge "${data.title}" berhasil dibuat!`;
      onSuccess?.(successMessage);
    },
    onError: (error) => {
      console.error('Failed to create knowledge center:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat knowledge. Silakan coba lagi.';
      onError?.(errorMessage);
    },
  });
}

export function useUpdateKnowledgeCenter(onSuccess?: (message: string) => void, onError?: (message: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKnowledgeCenterRequest }) =>
      knowledgeApi.updateKnowledgeCenter(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-centers'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-center', data.id] });
      const successMessage = `Knowledge "${data.title}" berhasil diperbarui!`;
      onSuccess?.(successMessage);
    },
    onError: (error) => {
      console.error('Failed to update knowledge center:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui knowledge. Silakan coba lagi.';
      onError?.(errorMessage);
    },
  });
}

export function useDeleteKnowledgeCenter(onSuccess?: (message: string) => void, onError?: (message: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.deleteKnowledgeCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-centers'] });
      const successMessage = 'Knowledge berhasil dihapus!';
      onSuccess?.(successMessage);
    },
    onError: (error) => {
      console.error('Failed to delete knowledge center:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus knowledge. Silakan coba lagi.';
      onError?.(errorMessage);
    },
  });
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
    published_at: new Date().toISOString(),
    tags: [] as string[],
    // Webinar specific fields
    tgl_zoom: '',
    link_zoom: '',
    link_youtube: '',
    link_record: '',
    link_vb: '',
    file_notulensi_pdf: undefined as string | undefined,
    jumlah_jp: undefined as number | undefined,
    // Content specific fields
    media_resource: undefined as string | undefined,
    content_richtext: '',
    thumbnail: undefined as string | undefined,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
  const [contentType, setContentType] = React.useState<'article' | 'video' | 'podcast' | 'pdf' | null>(null);
  const [currentTagInput, setCurrentTagInput] = React.useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = React.useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = React.useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = React.useState(false);

  const updateFormData = React.useCallback((field: string, value: unknown) => {
    setFormData(prev => {
      const prevValue = (prev as Record<string, unknown>)[field];
      if (Object.is(prevValue, value)) {
        return prev;
      }
      if (errors[field]) {
        setErrors(prevErrors => ({ ...prevErrors, [field]: '' }));
      }
      return { ...prev, [field]: value };
    });
  }, [errors]);

  const validateStep = React.useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Step 2 validation
    if (step === 2) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!formData.subject) {
        newErrors.subject = 'Subject is required';
      }
      if (!formData.penyelenggara) {
        newErrors.penyelenggara = 'Penyelenggara is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleThumbnailSelect = React.useCallback(async (file: File) => {
    try {
      // Show loading state
      setIsUploadingThumbnail(true);
      setThumbnailPreview(null);

      // Upload image to external API
      const imageUrl = await knowledgeApi.uploadImage(file);

      // Store the image URL instead of the file
      updateFormData('thumbnail', imageUrl);

      // Set preview URL
      setThumbnailPreview(imageUrl);
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
      // Reset preview on error
      setThumbnailPreview(null);
      // Reset thumbnail data
      updateFormData('thumbnail', undefined);
      // Could also show error toast here
    } finally {
      setIsUploadingThumbnail(false);
    }
  }, [updateFormData]);

  const handleThumbnailRemove = React.useCallback(() => {
    updateFormData('thumbnail', undefined);
    setThumbnailPreview(null);
  }, [updateFormData]);

  const handleAddTag = React.useCallback((e: React.KeyboardEvent<HTMLInputElement> | string) => {
    let tagValue = '';

    if (typeof e === 'string') {
      // Direct string input (for programmatic calls)
      tagValue = e;
    } else {
      // Check if key pressed is Enter or comma
      if (e.key !== 'Enter' && e.key !== ',') {
        return; // Don't add tag for other keys
      }

      if (e.key === ',') {
        // Prevent comma from being typed in the input
        e.preventDefault();
      }

      tagValue = currentTagInput.trim();
    }

    if (!tagValue) return;

    // Split by comma if present (in case of paste or multiple tags)
    const newTags = tagValue.split(',').map(tag => tag.trim()).filter(tag => tag);

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ...newTags].filter((tag, index, arr) => arr.indexOf(tag) === index)
    }));

    setCurrentTagInput('');
  }, [currentTagInput]);

  const handleRemoveTag = React.useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Multimedia upload handlers
  const handleMediaUpload = React.useCallback(async (file: File, type: 'video' | 'audio' | 'pdf') => {
    try {
      setIsUploadingMedia(true);
      let uploadUrl = '';

      // Upload based on file type
      switch (type) {
        case 'video':
          uploadUrl = await knowledgeApi.uploadVideo(file);
          break;
        case 'audio':
          uploadUrl = await knowledgeApi.uploadAudio(file);
          break;
        case 'pdf':
          uploadUrl = await knowledgeApi.uploadPDF(file);
          break;
      }

      // Store the uploaded file URL instead of the file object
      updateFormData('media_resource', uploadUrl);
      return uploadUrl;
    } catch (error) {
      console.error(`Failed to upload ${type} file:`, error);
      updateFormData('media_resource', undefined);
      throw error;
    } finally {
      setIsUploadingMedia(false);
    }
  }, [updateFormData]);

  const handlePDFUpload = React.useCallback(async (file: File) => {
    try {
      setIsUploadingPDF(true);
      const uploadUrl = await knowledgeApi.uploadPDF(file);
      updateFormData('file_notulensi_pdf', uploadUrl);
      return uploadUrl;
    } catch (error) {
      console.error('Failed to upload PDF file:', error);
      updateFormData('file_notulensi_pdf', undefined);
      throw error;
    } finally {
      setIsUploadingPDF(false);
    }
  }, [updateFormData]);

  const resetForm = React.useCallback(() => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      penyelenggara: '',
      knowledge_type: undefined,
      author: '',
      published_at: new Date().toISOString(),
      tags: [],
      tgl_zoom: '',
      link_zoom: '',
      link_youtube: '',
      link_record: '',
      link_vb: '',
      file_notulensi_pdf: undefined,
      jumlah_jp: undefined,
      media_resource: undefined,
      content_richtext: '',
      thumbnail: undefined,
    });
    setErrors({});
    setThumbnailPreview(null);
    setContentType(null);
    setCurrentTagInput('');
  }, []);

  return {
    // State
    formData,
    errors,
    thumbnailPreview,
    contentType,
    currentTagInput,
    isUploadingThumbnail,
    isUploadingMedia,
    isUploadingPDF,

    // Actions
    updateFormData,
    validateStep,
    handleThumbnailSelect,
    handleThumbnailRemove,
    setContentType,
    resetForm,
    handleAddTag,
    handleRemoveTag,
    setCurrentTagInput,
    handleMediaUpload,
    handlePDFUpload,
  };
}

// Hook for Knowledge Grid that transforms KnowledgeCenter data to Knowledge format
export function useKnowledgeGrid(params: {
  search?: string;
  knowledge_type?: ('webinar' | 'konten')[];
  subject?: string[];
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const {
    centers,
    isLoading,
    error,
    refetch,
  } = useKnowledgeCenters();

  // Transform the data based on filters and sorting
  const transformedData = React.useMemo(() => {
    let filteredCenters = [...centers];

    // Apply search filter
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredCenters = filteredCenters.filter(center =>
        center.title.toLowerCase().includes(searchLower) ||
        center.description.toLowerCase().includes(searchLower) ||
        center.subject?.name.toLowerCase().includes(searchLower) ||
        center.penyelenggara.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (params.knowledge_type && params.knowledge_type.length > 0) {
      filteredCenters = filteredCenters.filter(center => {
        const centerType = center.type === 'webinar' ? 'webinar' : 'konten';
        return params.knowledge_type!.includes(centerType);
      });
    }

    // Apply subject filter
    if (params.subject && params.subject.length > 0) {
      filteredCenters = filteredCenters.filter(center =>
        center.subject && params.subject!.includes(center.subject.name)
      );
    }

    // Apply sorting
    switch (params.sort) {
      case 'most_liked':
        filteredCenters.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case 'most_viewed':
        filteredCenters.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'newest':
        filteredCenters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filteredCenters.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'upcoming_webinar':
        const now = new Date();
        filteredCenters = filteredCenters.filter(center =>
          center.type === 'webinar' &&
          center.webinar?.zoomDate &&
          new Date(center.webinar.zoomDate) > now
        );
        filteredCenters.sort((a, b) => {
          const dateA = a.webinar?.zoomDate ? new Date(a.webinar.zoomDate).getTime() : 0;
          const dateB = b.webinar?.zoomDate ? new Date(b.webinar.zoomDate).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'popular':
        // Sort by a combination of likes and views
        filteredCenters.sort((a, b) =>
          (b.likeCount * 10 + b.viewCount) - (a.likeCount * 10 + a.viewCount)
        );
        break;
      default:
        // Default to newest
        filteredCenters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Transform to Knowledge format
    return filteredCenters.map(center => ({
      id: center.id,
      title: center.title,
      description: center.description,
      subject: center.subject?.name || '',
      knowledge_type: center.type === 'webinar' ? 'webinar' : 'konten',
      penyelenggara: center.penyelenggara,
      thumbnail: center.thumbnail,
      author: center.createdBy,
      like_count: center.likeCount,
      dislike_count: 0,
      view_count: center.viewCount,
      tags: [],
      published_at: center.publishedAt,
      created_at: center.createdAt,
      updated_at: center.updatedAt,
      // Webinar specific fields
      ...(center.type === 'webinar' && center.webinar ? {
        tgl_zoom: center.webinar.zoomDate,
        link_zoom: center.webinar.zoomLink,
        link_record: center.webinar.recordLink,
        link_youtube: center.webinar.youtubeLink,
        link_vb: center.webinar.vbLink,
        content_richtext: center.webinar.contentText,
        jumlah_jp: center.webinar.jpCount,
      } : {}),
      // Content specific fields
      ...(center.type === 'content' && center.knowledgeContent ? {
        media_resource: center.knowledgeContent.mediaUrl,
        media_type: center.knowledgeContent.contentType,
        content_richtext: center.knowledgeContent.text,
      } : {}),
    } as Knowledge));
  }, [centers, params]);

  // Apply pagination
  const paginatedData = React.useMemo(() => {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    return transformedData.slice(startIndex, startIndex + limit);
  }, [transformedData, params.page, params.limit]);

  return {
    data: paginatedData,
    total: transformedData.length,
    page: params.page || 1,
    limit: params.limit || 12,
    totalPages: Math.ceil(transformedData.length / (params.limit || 12)),
    isLoading,
    error,
    refetch,
  };
}

// Hook for knowledge detail page that transforms KnowledgeCenter data to Knowledge format
export function useKnowledgeDetail(id: string) {
  const { center, isLoading, error } = useKnowledgeCenter(id);

  // Transform the data to Knowledge format for compatibility with components
  const knowledge = React.useMemo(() => {
    if (!center) return null;

    return {
      id: center.id,
      title: center.title,
      description: center.description,
      subject: center.subject?.name || '',
      knowledge_type: center.type === 'webinar' ? 'webinar' : 'konten',
      type: center.type, // Add the original type field
      penyelenggara: center.penyelenggara,
      thumbnail: center.thumbnail,
      author: center.createdBy,
      like_count: center.likeCount,
      dislike_count: 0,
      view_count: center.viewCount,
      tags: [],
      published_at: center.publishedAt,
      created_at: center.createdAt,
      updated_at: center.updatedAt,
      // Webinar specific fields
      ...(center.type === 'webinar' && center.webinar ? {
        tgl_zoom: center.webinar.zoomDate,
        link_zoom: center.webinar.zoomLink,
        link_record: center.webinar.recordLink,
        link_youtube: center.webinar.youtubeLink,
        link_vb: center.webinar.vbLink,
        content_richtext: center.webinar.contentText,
        jumlah_jp: center.webinar.jpCount,
      } : {}),
      // Content specific fields - include the full knowledgeContent object
      ...(center.type === 'content' && center.knowledgeContent ? {
        media_resource: center.knowledgeContent.mediaUrl,
        media_type: center.knowledgeContent.contentType,
        content_richtext: center.knowledgeContent.document, // Use document instead of text
        knowledgeContent: center.knowledgeContent, // Include the full object
      } : {}),
    } as Knowledge;
  }, [center]);

  // Get related knowledge based on the same subject or type
  const { centers: allCenters } = useKnowledgeCenters();
  const relatedKnowledge = React.useMemo(() => {
    if (!knowledge || !allCenters.length) return [];

    return allCenters
      .filter(center =>
        center.id !== knowledge.id && // Exclude the current item
        (
          center.subject?.name === knowledge.subject || // Same subject
          center.type === knowledge.knowledge_type // Same type
        )
      )
      .slice(0, 6) // Limit to 6 related items
      .map(center => ({
        id: center.id,
        title: center.title,
        description: center.description,
        subject: center.subject?.name || '',
        knowledge_type: center.type === 'webinar' ? 'webinar' : 'konten',
        penyelenggara: center.penyelenggara,
        thumbnail: center.thumbnail,
        author: center.createdBy,
        like_count: center.likeCount,
        dislike_count: 0,
        view_count: center.viewCount,
        tags: [],
        published_at: center.publishedAt,
        created_at: center.createdAt,
        updated_at: center.updatedAt,
        ...(center.type === 'webinar' && center.webinar ? {
          tgl_zoom: center.webinar.zoomDate,
          link_zoom: center.webinar.zoomLink,
          link_record: center.webinar.recordLink,
          link_youtube: center.webinar.youtubeLink,
          link_vb: center.webinar.vbLink,
          content_richtext: center.webinar.contentText,
          jumlah_jp: center.webinar.jpCount,
        } : {}),
        ...(center.type === 'content' && center.knowledgeContent ? {
          media_resource: center.knowledgeContent.mediaUrl,
          media_type: center.knowledgeContent.contentType,
          content_richtext: center.knowledgeContent.text,
        } : {}),
      } as Knowledge));
  }, [knowledge, allCenters]);

  return {
    knowledge,
    relatedKnowledge,
    isLoading,
    error,
  };
}

// Hook for knowledge detail interactions (like increment views)
export function useKnowledgeDetailInteractions(id: string) {
  const queryClient = useQueryClient();

  const handleIncrementViews = React.useCallback(() => {
    // This would typically make an API call to increment views
    // For now, we'll just update the local cache optimistically
    queryClient.setQueryData(['knowledge-center', id], (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: {
          ...old.data,
          viewCount: old.data.viewCount + 1,
        },
      };
    });
  }, [queryClient, id]);

  return {
    handleIncrementViews,
  };
}

// Hook for toggling like on knowledge
export function useToggleLikeKnowledge() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      // This would make an API call to toggle like
      // For now, we'll just simulate it with optimistic update
      return id;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['knowledge-center', id] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['knowledge-center', id]);

      // Optimistically update
      queryClient.setQueryData(['knowledge-center', id], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            likeCount: old.data.likeCount + 1,
          },
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['knowledge-center', id], context.previousData);
      }
    },
    onSettled: (_, __, id) => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: ['knowledge-center', id] });
    },
  });

  return mutation;
}

// Hook for related knowledge (alias for usePopularKnowledge with different logic)
export function useRelatedKnowledge(currentKnowledgeId: string, limit: number = 6) {
  const { centers } = useKnowledgeCenters();

  const relatedKnowledge = React.useMemo(() => {
    const currentCenter = centers.find(c => c.id === currentKnowledgeId);
    if (!currentCenter) return [];

    return centers
      .filter(center =>
        center.id !== currentKnowledgeId && // Exclude the current item
        (
          center.subject?.name === currentCenter.subject?.name || // Same subject
          center.type === currentCenter.type // Same type
        )
      )
      .slice(0, limit)
      .map(center => ({
        id: center.id,
        title: center.title,
        description: center.description,
        subject: center.subject?.name || '',
        knowledge_type: center.type === 'webinar' ? 'webinar' : 'konten',
        penyelenggara: center.penyelenggara,
        thumbnail: center.thumbnail,
        author: center.createdBy,
        like_count: center.likeCount,
        dislike_count: 0,
        view_count: center.viewCount,
        tags: [],
        published_at: center.publishedAt,
        created_at: center.createdAt,
        updated_at: center.updatedAt,
        ...(center.type === 'webinar' && center.webinar ? {
          tgl_zoom: center.webinar.zoomDate,
          link_zoom: center.webinar.zoomLink,
          link_record: center.webinar.recordLink,
          link_youtube: center.webinar.youtubeLink,
          link_vb: center.webinar.vbLink,
          content_richtext: center.webinar.contentText,
          jumlah_jp: center.webinar.jpCount,
        } : {}),
        ...(center.type === 'content' && center.knowledgeContent ? {
          media_resource: center.knowledgeContent.mediaUrl,
          media_type: center.knowledgeContent.contentType,
          content_richtext: center.knowledgeContent.text,
        } : {}),
      } as Knowledge));
  }, [centers, currentKnowledgeId, limit]);

  return {
    relatedKnowledge,
    isLoading: false, // Since we're using client-side filtering
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
