/**
 * Knowledge Center Custom Hooks
 *
 * Entity-based hooks following the API → Hooks → UI pattern
 * Each hook manages state for a specific domain entity
 */

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getKnowledgeDetailQueryOptions,
  getKnowledgeQueryOptions,
  knowledgeCenterApi,
  incrementKnowledgeCenterView,
  toggleKnowledgeCenterLike,
} from '@/api/knowledge-center';
import { knowledgeApi } from '@/api';
import { knowledgeKeys } from '@/lib/query-keys';
import { CACHE_TIMES } from '@/constants/knowledge';
import {
  transformFormDataToAPI,
  validateFormDataForSubmission,
  getDefaultThumbnailUrl,
} from '@/lib/knowledge-center/transform';
import { encodeMediaUrl } from '@/utils/urlUtils';
import {
  CreateKnowledgeCenterRequest,
  KnowledgeCenter,
  KnowledgeQueryParams,
  SORT_OPTIONS,
} from '@/types/knowledge-center';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

export const useKnowledge = (params: KnowledgeQueryParams = {}) => {
  const queryResult = useQuery({
    ...getKnowledgeQueryOptions(params),
    placeholderData: keepPreviousData,
  });

  const response = queryResult.data;
  const items = (response?.data || []) as KnowledgeCenter[];
  const pageMeta = response?.pageMeta;

  const legacyMeta =
    (response as unknown as {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    }) || {};

  const total =
    pageMeta?.totalResultCount ??
    legacyMeta.total ??
    items.length;

  const page = pageMeta?.page ?? legacyMeta.page ?? params.page ?? DEFAULT_PAGE;
  const limit = pageMeta?.perPage ?? legacyMeta.limit ?? params.limit ?? DEFAULT_LIMIT;
  const totalPages =
    pageMeta?.totalPageCount ??
    legacyMeta.totalPages ??
    (limit ? Math.max(1, Math.ceil(total / limit)) : 1);

  return {
    data: items,
    page,
    limit,
    total,
    totalPages,
    pageMeta,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
};

export type UseKnowledgeReturn = ReturnType<typeof useKnowledge>;

export const useKnowledgeDetail = (id: string) => {
  return useQuery({
    ...getKnowledgeDetailQueryOptions(id),
    enabled: Boolean(id),
  });
};

// Hook for incrementing view count with mutation
export const useIncrementViewCount = () => {
  return useMutation({
    mutationFn: incrementKnowledgeCenterView,
    onError: (error) => {
      // Silently log errors without disrupting user experience
      console.warn('Failed to increment view count:', error);
    },
    onSuccess: () => {
      console.log('View count incremented successfully');
    },
  });
};

// Hook for toggling like status
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, like }: { id: string; like: boolean }) => 
      toggleKnowledgeCenterLike(id, like),
    onMutate: async ({ id, like }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: knowledgeKeys.detail(id) });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(knowledgeKeys.detail(id));
      
      // Optimistically update the cache
      queryClient.setQueryData(knowledgeKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          likeCount: like ? old.likeCount + 1 : Math.max(0, old.likeCount - 1)
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(knowledgeKeys.detail(variables.id), context.previousData);
      }
      console.error('Failed to toggle like:', err);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ 
        queryKey: knowledgeKeys.detail(variables.id),
        exact: true,
      });
      
      // Invalidate knowledge list queries to update like counts in lists
      queryClient.invalidateQueries({ 
        queryKey: knowledgeKeys.lists(),
        exact: false,
        refetchType: 'active',
      });
    },
  });
};

interface UseKnowledgeDetailPageParams {
  id: string;
}

export const useKnowledgeDetailPage = ({ id }: UseKnowledgeDetailPageParams) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const viewCountIncrementedRef = useRef(false);

  const queryClient = useQueryClient();
  const detailQuery = useKnowledgeDetail(id);
  const likeMutation = useToggleLike();

  // Increment view count when knowledge center data is loaded (only once)
  useEffect(() => {
    if (detailQuery.data && !viewCountIncrementedRef.current) {
      viewCountIncrementedRef.current = true;
      // Optimistically update view count in React Query cache so UI updates immediately
      queryClient.setQueryData(knowledgeKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          viewCount: (old.viewCount ?? 0) + 1,
        };
      });

      // Fire-and-forget API call to increment view count on the server
      incrementKnowledgeCenterView(id);
    }
  }, [detailQuery.data, id, queryClient]);

  // Initialize like status based on knowledge center data
  useEffect(() => {
    if (detailQuery.data) {
      // TODO: Update this when API returns isLikedByUser field
      // For now, initialize as false - this will be managed by user interactions
      setIsLiked(false);
    }
  }, [detailQuery.data]);

  const relatedParams = useMemo<KnowledgeQueryParams>(
    () => ({
      page: 1,
      limit: 7,
      sort: SORT_OPTIONS.POPULAR,
      subject: detailQuery.data?.idSubject ? [detailQuery.data.idSubject] : undefined,
    }),
    [detailQuery.data?.idSubject],
  );

  const relatedQuery = useQuery({
    ...getKnowledgeQueryOptions(relatedParams),
    enabled: Boolean(detailQuery.data?.idSubject),
    placeholderData: keepPreviousData,
  });

  const relatedKnowledge = useMemo(() => {
    const list = (relatedQuery.data?.data || []) as KnowledgeCenter[];
    return list.filter((item) => item.id !== detailQuery.data?.id);
  }, [relatedQuery.data?.data, detailQuery.data?.id]);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined' || !detailQuery.data) return;
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: detailQuery.data.title,
          text: detailQuery.data.description,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.error('Failed to share knowledge center:', error);
    }
  }, [detailQuery.data]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => !prev);
  }, []);

  const handleLike = useCallback(async () => {
    if (!detailQuery.data) return;
    
    const newLikeStatus = !isLiked;
    
    try {
      // Optimistically update local state
      setIsLiked(newLikeStatus);
      
      // Call the API
      await likeMutation.mutateAsync({
        id: detailQuery.data.id,
        like: newLikeStatus,
      });
    } catch (error) {
      // Revert local state on error
      setIsLiked(isLiked);
      console.error('Failed to toggle like:', error);
    }
  }, [detailQuery.data, isLiked, likeMutation]);

  return {
    knowledge: detailQuery.data ?? null,
    relatedKnowledge,
    isLoading: detailQuery.isLoading,
    error: detailQuery.error,
    isBookmarked,
    isLiked,
    isLiking: likeMutation.isPending,
    handleShare,
    handleBookmark,
    handleLike,
  };
};

export const useCreateKnowledgeCenter = (
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...knowledgeKeys.all, 'create'],
    mutationFn: (payload: CreateKnowledgeCenterRequest) => knowledgeCenterApi.createKnowledgeCenter(payload),
    onSuccess: (data) => {
      // Targeted invalidation for all list queries (with any filters)
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.lists(),
        exact: false,
        refetchType: 'active',
      });

      // Seed detail cache optimistically
      queryClient.setQueryData(knowledgeKeys.detail(data.id), data);

      // Invalidate stats if they exist
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.stats(),
        exact: true,
      });
      onSuccess?.('Knowledge center berhasil dibuat');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal membuat knowledge center';
      onError?.(message);
    },
  });

  return {
    ...mutation,
    createKnowledgeCenter: mutation.mutateAsync,
  };
};

// Utility function to get current user ID (following existing pattern)
export const getCurrentUserId = () => 'b157852b-82ff-40ed-abf8-2f8fe26377aa';

/**
 * Helper to parse API error response and set field errors
 */
const parseApiErrors = (error: any, form: any, onError: (msg: string) => void) => {
  // Try to extract error details from response
  const response = error?.response?.data;
  
  // Case 1: Structured field errors (e.g., { errors: { field: ['message'] } })
  if (response?.errors && typeof response.errors === 'object') {
    Object.entries(response.errors).forEach(([fieldPath, messages]: [string, any]) => {
      const errorMessages = Array.isArray(messages) ? messages : [messages];
      form.setFieldMeta(fieldPath as any, (prev: any) => ({
        ...prev,
        errors: errorMessages,
      }));
    });
    onError(response.message || 'Validation failed. Please check the form.');
    return true;
  }
  
  // Case 2: Array of field errors (e.g., [{ field: 'title', message: 'Required' }])
  if (Array.isArray(response?.errors)) {
    response.errors.forEach((err: any) => {
      if (err.field && err.message) {
        form.setFieldMeta(err.field as any, (prev: any) => ({
          ...prev,
          errors: [err.message],
        }));
      }
    });
    onError(response.message || 'Validation failed. Please check the form.');
    return true;
  }
  
  // Case 3: Simple message
  if (response?.message) {
    onError(response.message);
    return true;
  }
  
  // Case 4: Generic error
  onError(error?.message || 'An error occurred. Please try again.');
  return false;
};

/**
 * Custom hook for Create Knowledge Page
 * Handles all business logic including:
 * - Media uploads (video, audio, PDF)
 * - Subject management (CRUD operations)
 * - Form submission and data transformation
 * - Step navigation with validation
 * - Toast notifications
 *
 * @param wizard - The wizard form hook instance
 * @param router - Next.js router for navigation
 * @param onSuccess - Success callback for toast
 * @param onError - Error callback for toast
 */
interface UseCreateKnowledgePageParams {
  wizard: any; // UseKnowledgeWizardFormReturn type
  router: any; // NextRouter type
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const useCreateKnowledgePage = ({
  wizard,
  router,
  onSuccess,
  onError,
}: UseCreateKnowledgePageParams) => {
  const { formValues, currentStep, validateCurrentStep, nextStep, goToStep } = wizard;

  // Mutations
  const createKnowledgeMutation = useCreateKnowledgeCenter(onSuccess, onError);

  // Track which button was clicked for loading state
  const [submittingAs, setSubmittingAs] = useState<'draft' | 'published' | null>(null);
  
  // Track if we're currently uploading any files
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // ============================================================================
  // Step Navigation with Validation
  // ============================================================================

  const handleNextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    } else {
      onError('Please fill in all required fields correctly');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateCurrentStep, nextStep, onError]);

  const handleStepNavigation = useCallback(
    async (targetStep: number) => {
      if (targetStep === currentStep) return;

      if (targetStep > currentStep) {
        const isValid = await validateCurrentStep();
        if (!isValid) return;
      }

      goToStep(targetStep);
    },
    [currentStep, goToStep, validateCurrentStep]
  );

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = useCallback(
    async (status: 'draft' | 'published') => {
      // Set which button was clicked
      setSubmittingAs(status);
      
      // Validate form data
      const validationError = validateFormDataForSubmission(formValues);
      if (validationError) {
        onError(validationError);
        setSubmittingAs(null);
        return;
      }

      try {
        // Set uploading state before starting any uploads
        setIsUploadingFiles(true);
        
        // Clone formValues to update with uploaded URLs
        const updatedFormValues = { ...formValues };

        // 1. Handle thumbnail upload
        let thumbnailUrl =
          typeof formValues.thumbnail === 'string' && formValues.thumbnail
            ? formValues.thumbnail
            : getDefaultThumbnailUrl();

        if (formValues.thumbnail instanceof File) {
          try {
            const uploadedUrl = await knowledgeApi.uploadImage(formValues.thumbnail);
            thumbnailUrl = encodeMediaUrl(uploadedUrl);
          } catch (uploadError) {
            console.error('Failed to upload thumbnail:', uploadError);
            parseApiErrors(uploadError, wizard.form, onError);
            setIsUploadingFiles(false);
            setSubmittingAs(null);
            return;
          }
        }

        // 2. Handle media upload for Content (video, audio, or PDF)
        if (updatedFormValues.knowledgeContent?.mediaUrl instanceof File) {
          try {
            const file = updatedFormValues.knowledgeContent.mediaUrl;
            const contentType = updatedFormValues.knowledgeContent.contentType;
            
            let uploadedUrl: string;
            if (contentType === 'video') {
              uploadedUrl = await knowledgeApi.uploadVideo(file);
            } else if (contentType === 'podcast') {
              uploadedUrl = await knowledgeApi.uploadAudio(file);
            } else if (contentType === 'file') {
              uploadedUrl = await knowledgeApi.uploadPDF(file);
            } else {
              throw new Error('Invalid content type for media upload');
            }
            
            updatedFormValues.knowledgeContent.mediaUrl = encodeMediaUrl(uploadedUrl);
          } catch (uploadError) {
            console.error('Failed to upload media:', uploadError);
            parseApiErrors(uploadError, wizard.form, onError);
            wizard.form.setFieldMeta('knowledgeContent.mediaUrl' as any, (prev: any) => ({
              ...prev,
              errors: ['Failed to upload media file. Please try again.'],
            }));
            setIsUploadingFiles(false);
            setSubmittingAs(null);
            return;
          }
        }

        // 3. Handle PDF notes upload for Webinar
        if (updatedFormValues.webinar?.noteFile instanceof File) {
          try {
            const uploadedUrl = await knowledgeApi.uploadPDF(updatedFormValues.webinar.noteFile);
            updatedFormValues.webinar.contentText = encodeMediaUrl(uploadedUrl);
            // Remove noteFile after uploading (it's now in contentText)
            delete updatedFormValues.webinar.noteFile;
          } catch (uploadError) {
            console.error('Failed to upload PDF notes:', uploadError);
            parseApiErrors(uploadError, wizard.form, onError);
            wizard.form.setFieldMeta('webinar.noteFile' as any, (prev: any) => ({
              ...prev,
              errors: ['Failed to upload PDF notes. Please try again.'],
            }));
            setIsUploadingFiles(false);
            setSubmittingAs(null);
            return;
          }
        }

        // Transform form data to API payload using utility
        const apiData = transformFormDataToAPI(updatedFormValues, status, thumbnailUrl);

        // Submit to API
        await createKnowledgeMutation.mutateAsync(apiData);

        // Clear uploading state and navigate to knowledge center on success
        setIsUploadingFiles(false);
        router.push('/knowledge-center/manage');
      } catch (error) {
        console.error('Failed to create knowledge:', error);
        
        // Parse and set field-specific errors from API
        const hasFieldErrors = parseApiErrors(error, wizard.form, onError);
        
        // If there are field errors, scroll to first error
        if (hasFieldErrors) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        setIsUploadingFiles(false);
        setSubmittingAs(null);
      }
    },
    [formValues, createKnowledgeMutation, router, onError, wizard.form]
  );

  return {
    // Navigation handlers
    handleNextStep,
    handleStepNavigation,

    // Submission handler
    handleSubmit,
    isCreating: isUploadingFiles || createKnowledgeMutation.isPending, // Show loading during file upload or API submission
    submittingAs, // Track which button is being submitted
  };
};

// ============================================================================
// Knowledge Center Management Hook
// ============================================================================

interface UseKnowledgeManagementPageParams {
  router: any;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const useKnowledgeManagementPage = ({
  router,
  onSuccess,
  onError,
}: UseKnowledgeManagementPageParams) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete knowledge center mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeCenterApi.deleteKnowledgeCenter(id),
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.lists(),
        exact: false,
        refetchType: 'active',
      });
      onSuccess('Knowledge center deleted successfully');
    },
    onError: (error: any) => {
      onError(error.message || 'Failed to delete knowledge center');
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  // Update knowledge center status mutation (publish/unpublish)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isFinal }: { id: string; isFinal: boolean }) =>
      knowledgeCenterApi.updateKnowledgeCenterStatus(id, isFinal),
    onMutate: async ({ id, isFinal }) => {
      setIsUpdating(true);

      // Cancel outgoing refetches for all knowledge lists
      await queryClient.cancelQueries({ queryKey: knowledgeKeys.lists() });

      // Snapshot previous list data for rollback
      const previousQueries = queryClient.getQueriesData({
        queryKey: knowledgeKeys.lists(),
      });

      // Optimistically update all list caches
      queryClient.setQueriesData(
        { queryKey: knowledgeKeys.lists() },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((item: KnowledgeCenter) =>
              item.id === id
                ? {
                    ...item,
                    isFinal,
                    publishedAt: isFinal ? new Date().toISOString() : item.publishedAt,
                  }
                : item,
            ),
          };
        },
      );

      // Optimistically update detail cache if exists
      queryClient.setQueryData(
        knowledgeKeys.detail(id),
        (old: KnowledgeCenter | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isFinal,
            publishedAt: isFinal ? new Date().toISOString() : old.publishedAt,
          };
        },
      );

      return { previousQueries };
    },
    onError: (error: any, _variables, context) => {
      // Rollback list caches on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      onError(error.message || 'Failed to update knowledge center');
    },
    onSuccess: (_data, variables) => {
      // Keep success message behavior, but include publish/draft context
      const statusMessage = variables.isFinal
        ? 'Knowledge center updated and published successfully'
        : 'Knowledge center updated as draft successfully';
      onSuccess(statusMessage);
    },
    onSettled: (_data, _error, variables) => {
      setIsUpdating(false);

      // Ensure we are back in sync with server
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.lists(),
        refetchType: 'active',
      });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: knowledgeKeys.detail(variables.id),
          exact: true,
        });
      }

      queryClient.invalidateQueries({ queryKey: knowledgeKeys.stats() });
    },
  });

  // Handle edit action
  const handleEdit = useCallback((knowledge: KnowledgeCenter) => {
    router.push(`/knowledge-center/${knowledge.id}/edit`);
  }, [router]);

  // Handle delete action
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this knowledge center? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        // Error handled by mutation
      }
    }
  }, [deleteMutation]);

  // Handle duplicate action
  const handleDuplicate = useCallback((knowledge: KnowledgeCenter) => {
    // Create a copy with modified title
    const duplicateData = {
      ...knowledge,
      title: `Copy of ${knowledge.title}`,
      isFinal: false, // Always create as draft
    };
    
    // Navigate to create page with pre-filled data
    const queryParams = new URLSearchParams({
      duplicate: knowledge.id,
      data: JSON.stringify(duplicateData),
    });
    
    router.push(`/knowledge-center/create?${queryParams.toString()}`);
  }, [router]);

  // Handle toggle status (publish/unpublish)
  const handleToggleStatus = useCallback(async (id: string, isFinal: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({ id, isFinal });
    } catch {
      // Error handled by mutation
    }
  }, [updateStatusMutation]);

  // Handle bulk delete action
  const handleBulkDelete = useCallback(async (ids: string[]) => {
    const count = ids.length;
    const confirmMessage = `Are you sure you want to delete ${count} knowledge center${count > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setIsDeleting(true);
        await knowledgeCenterApi.deleteKnowledgeCenters(ids);
        queryClient.invalidateQueries({
          queryKey: knowledgeKeys.lists(),
          exact: false,
          refetchType: 'active',
        });
        onSuccess(`${count} knowledge center${count > 1 ? 's' : ''} deleted successfully`);
      } catch (error: any) {
        onError(error.message || 'Failed to delete knowledge centers');
      } finally {
        setIsDeleting(false);
      }
    }
  }, [queryClient, onSuccess, onError]);

  // Delete helpers without browser confirm (UI should handle confirmation)
  const deleteKnowledge = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Error handled by mutation
    }
  }, [deleteMutation]);

  const bulkDeleteKnowledge = useCallback(async (ids: string[]) => {
    try {
      setIsDeleting(true);
      await knowledgeCenterApi.deleteKnowledgeCenters(ids);
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.lists(),
        exact: false,
        refetchType: 'active',
      });
      onSuccess(`${ids.length} knowledge center${ids.length > 1 ? 's' : ''} deleted successfully`);
    } catch (error: any) {
      onError(error.message || 'Failed to delete knowledge centers');
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient, onSuccess, onError]);

  return {
    handleEdit,
    handleDelete,
    handleBulkDelete,
    handleDuplicate,
    handleToggleStatus,
    deleteKnowledge,
    bulkDeleteKnowledge,
    isDeleting,
    isUpdating,
  };
};

// ============================================================================
// Knowledge Center Edit Hook
// ============================================================================

interface UseEditKnowledgePageParams {
  knowledgeId: string;
  wizard: any;
  router: any;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const useEditKnowledgePage = ({
  knowledgeId,
  wizard,
  router,
  onSuccess,
  onError,
}: UseEditKnowledgePageParams) => {
  const queryClient = useQueryClient();
  const [submittingAs, setSubmittingAs] = useState<'draft' | 'published' | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Fetch existing knowledge center data
  const {
    data: knowledgeData,
    isLoading,
    error,
  } = useKnowledgeDetail(knowledgeId);

  // Populate form with existing data when loaded
  useEffect(() => {
    if (knowledgeData && wizard.form) {
      console.log('🔍 Edit mode - Raw knowledge data:', knowledgeData);
      
      // Normalisasi publishedAt agar cocok dengan input datetime-local (YYYY-MM-DDTHH:MM)
      const rawPublishedAt = knowledgeData.publishedAt;
      const normalizedPublishedAt = rawPublishedAt && rawPublishedAt.includes('T')
        ? rawPublishedAt.slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      // Normalisasi zoomDate webinar agar cocok dengan input datetime-local (YYYY-MM-DDTHH:MM)
      const rawZoomDate = knowledgeData.webinar?.zoomDate;
      const normalizedZoomDate = rawZoomDate && rawZoomDate.includes('T')
        ? rawZoomDate.slice(0, 16)
        : (rawZoomDate || '');

      const webinarFormData = knowledgeData.webinar
        ? { ...knowledgeData.webinar, zoomDate: normalizedZoomDate }
        : null;

      const formData = {
        title: knowledgeData.title || '',
        description: knowledgeData.description || '',
        idSubject: knowledgeData.idSubject || '',
        penyelenggara: knowledgeData.penyelenggara || '',
        createdBy: knowledgeData.createdBy || '',
        type: knowledgeData.type || undefined,
        publishedAt: normalizedPublishedAt,
        tags: knowledgeData.tags || [],
        thumbnail: knowledgeData.thumbnail || '',
        webinar: webinarFormData,
        knowledgeContent: knowledgeData.knowledgeContent || null,
      };
      
      console.log('🔍 Edit mode - Form data to populate:', formData);

      // Set form values with proper state update
      Object.entries(formData).forEach(([key, value]) => {
        wizard.form.setFieldValue(key as any, value as any);
      });

      // Set thumbnail preview if exists (for edit mode)
      if (knowledgeData.thumbnail) {
        console.log('🖼️ Setting thumbnail preview:', knowledgeData.thumbnail);
        // For edit mode, we need to set both the form value and preview directly
        // since handleThumbnailSelect expects a File, not a URL
        wizard.form.setFieldValue('thumbnail' as any, knowledgeData.thumbnail as any);
        // Set thumbnail preview from URL for edit mode
        wizard.setThumbnailPreviewFromUrl(knowledgeData.thumbnail);
      }

      // Force form state update and clear any validation errors after populating data
      setTimeout(() => {
        // Debug: Log form values to ensure they're set correctly
        console.log('Edit mode - Form values after populate:', wizard.formValues);
        console.log('Edit mode - Thumbnail preview after populate:', wizard.thumbnailPreview);
        
        // Clear any existing validation errors
        if (wizard.form.validateAllFields) {
          wizard.form.validateAllFields('change');
        }

        // Di mode edit, langsung lompat ke Step 2 (Basic Info) dan kunci Step 1
        if (wizard.currentStep === 1) {
          wizard.goToStep(2);
        }
      }, 100);
    }
  }, [knowledgeData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateKnowledgeCenterRequest> }) =>
      knowledgeCenterApi.updateKnowledgeCenter(id, data),
    onMutate: (variables) => {
      const status = variables.data.isFinal ? 'published' : 'draft';
      setSubmittingAs(status as 'draft' | 'published');
    },
    onSuccess: (data, variables) => {
      const status = variables.data.isFinal ? 'published' : 'draft';
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.lists(),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.detail(knowledgeId),
        exact: true,
      });
      
      const message = status === 'published' 
        ? 'Knowledge center updated and published successfully!' 
        : 'Knowledge center updated as draft successfully!';
      
      onSuccess(message);
      
      // Navigate back to detail page
      router.push(`/knowledge-center/${knowledgeId}`);
    },
    onError: (error: any) => {
      onError(error.message || 'Failed to update knowledge center');
    },
    onSettled: () => {
      setSubmittingAs(null);
    },
  });

  // Handle next step with validation
  const handleNextStep = useCallback(async () => {
    const currentStepNumber = wizard.currentStep;
    
    try {
      // Validate current step using wizard's validation method
      const isValid = await wizard.validateCurrentStep();
      
      if (isValid) {
        // Move to next step
        wizard.nextStep();
      } else {
        onError(`Please fill in all required fields for step ${currentStepNumber}`);
      }
    } catch {
      onError(`Please fill in all required fields for step ${currentStepNumber}`);
    }
  }, [wizard, onError]);

  // Handle step navigation
  const handleStepNavigation = useCallback((stepNumber: number) => {
    if (stepNumber <= 1) {
      return;
    }
    wizard.goToStep(stepNumber);
  }, [wizard]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (submitAs: 'draft' | 'published') => {
      // Get current form values
      const formData = wizard.formValues as any;

      // Set which button was clicked (sama seperti create)
      setSubmittingAs(submitAs);

      // Shared validation helper (same dengan create)
      const validationError = validateFormDataForSubmission(formData);
      if (validationError) {
        onError(validationError);
        setSubmittingAs(null);
        return;
      }

      try {
        // Set uploading state sebelum mulai upload thumbnail/file
        setIsUploadingFiles(true);

        // Clone form values supaya aman dimodifikasi
        const updatedFormValues = { ...formData };

        // 1. Handle thumbnail upload jika user memilih thumbnail baru (File)
        let thumbnailUrl =
          typeof formData.thumbnail === 'string' && formData.thumbnail
            ? formData.thumbnail
            : getDefaultThumbnailUrl();

        if (formData.thumbnail instanceof File) {
          try {
            const uploadedUrl = await knowledgeApi.uploadImage(formData.thumbnail);
            thumbnailUrl = encodeMediaUrl(uploadedUrl);
          } catch (uploadError: any) {
            console.error('Failed to upload thumbnail during update:', uploadError);
            parseApiErrors(uploadError, wizard.form, onError);
            setIsUploadingFiles(false);
            setSubmittingAs(null);
            return;
          }
        }

        // 2. Handle media upload untuk Content (video / podcast / file) bila user pilih file baru
        if (updatedFormValues.knowledgeContent?.mediaUrl instanceof File) {
          try {
            const file = updatedFormValues.knowledgeContent.mediaUrl;
            const contentType = updatedFormValues.knowledgeContent.contentType;

            let uploadedUrl: string;
            if (contentType === 'video') {
              uploadedUrl = await knowledgeApi.uploadVideo(file);
            } else if (contentType === 'podcast') {
              uploadedUrl = await knowledgeApi.uploadAudio(file);
            } else if (contentType === 'file') {
              uploadedUrl = await knowledgeApi.uploadPDF(file);
            } else {
              throw new Error('Invalid content type for media upload');
            }

            updatedFormValues.knowledgeContent.mediaUrl = encodeMediaUrl(uploadedUrl);
          } catch (uploadError: any) {
            console.error('Failed to upload media during update:', uploadError);
            parseApiErrors(uploadError, wizard.form, onError);
            wizard.form.setFieldMeta('knowledgeContent.mediaUrl' as any, (prev: any) => ({
              ...prev,
              errors: ['Failed to upload media file. Please try again.'],
            }));
            setIsUploadingFiles(false);
            setSubmittingAs(null);
            return;
          }
        }

        // 3. Handle PDF notes upload untuk Webinar bila user upload file baru
        if (updatedFormValues.webinar?.noteFile instanceof File) {
          try {
            const uploadedUrl = await knowledgeApi.uploadPDF(updatedFormValues.webinar.noteFile);
            updatedFormValues.webinar.contentText = encodeMediaUrl(uploadedUrl);
            // Hapus noteFile setelah di-upload karena API pakai contentText
            delete updatedFormValues.webinar.noteFile;
          } catch (uploadError: any) {
            console.error('Failed to upload PDF notes during update:', uploadError);
            parseApiErrors(uploadError, wizard.form, onError);
            wizard.form.setFieldMeta('webinar.noteFile' as any, (prev: any) => ({
              ...prev,
              errors: ['Failed to upload PDF notes. Please try again.'],
            }));
            setIsUploadingFiles(false);
            setSubmittingAs(null);
            return;
          }
        }

        // 4. Transform form data ke payload API (reuse util yang sama dengan create)
        const apiData = transformFormDataToAPI(
          updatedFormValues,
          submitAs,
          thumbnailUrl,
        );

        // 5. Submit update ke API
        await updateMutation.mutateAsync({
          id: knowledgeId,
          data: apiData,
        });

        // Clear uploading state on success
        setIsUploadingFiles(false);
      } catch (error: any) {
        onError(
          error.message ||
            `Failed to ${
              submitAs === 'published' ? 'publish' : 'save'
            } knowledge center`,
        );
        setIsUploadingFiles(false);
        setSubmittingAs(null);
      }
    },
    [wizard, knowledgeId, updateMutation, onError],
  );

  return {
    // Navigation handlers
    handleNextStep,
    handleStepNavigation,

    // Submission handler
    handleSubmit,
    isUpdating: isUploadingFiles || updateMutation.isPending,
    submittingAs,

    // Data loading
    isLoading,
    error,
  };
};

// Hook for deleting knowledge center
export const useDeleteKnowledgeCenter = (
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...knowledgeKeys.all, 'delete'],
    mutationFn: (id: string) => knowledgeCenterApi.deleteKnowledgeCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.lists(),
        exact: false,
        refetchType: 'active',
      });
      onSuccess?.('Knowledge center deleted successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete knowledge center';
      onError?.(message);
    },
  });

  return {
    ...mutation,
    deleteKnowledgeCenter: mutation.mutateAsync,
  };
};

// Hook for bulk deleting knowledge centers
export const useBulkDeleteKnowledgeCenter = (
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...knowledgeKeys.all, 'bulk-delete'],
    mutationFn: (ids: string[]) => knowledgeCenterApi.deleteKnowledgeCenters(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({
        queryKey: knowledgeKeys.lists(),
        exact: false,
        refetchType: 'active',
      });
      const count = ids.length;
      onSuccess?.(`${count} knowledge center${count > 1 ? 's' : ''} deleted successfully`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete knowledge centers';
      onError?.(message);
    },
  });

  return {
    ...mutation,
    bulkDeleteKnowledgeCenter: mutation.mutateAsync,
  };
};

// Hook for live search functionality
export const useKnowledgeCenterSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: knowledgeKeys.search(query),
    queryFn: () => knowledgeCenterApi.searchKnowledgeCenters(query),
    enabled: enabled && query.length >= 2, // Only search when query is at least 2 characters
    ...CACHE_TIMES.searchResults,
    refetchOnWindowFocus: false,
  });
};
