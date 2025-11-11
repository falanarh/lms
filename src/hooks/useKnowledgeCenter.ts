/**
 * Knowledge Center Custom Hooks
 *
 * Entity-based hooks following the API → Hooks → UI pattern
 * Each hook manages state for a specific domain entity
 */

import { useCallback, useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getKnowledgeDetailQueryOptions,
  getKnowledgeQueryOptions,
  knowledgeCenterApi,
} from '@/api/knowledge-center';
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

interface UseKnowledgeDetailPageParams {
  id: string;
}

export const useKnowledgeDetailPage = ({ id }: UseKnowledgeDetailPageParams) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const detailQuery = useKnowledgeDetail(id);

  const relatedParams = useMemo<KnowledgeQueryParams>(
    () => ({
      page: 1,
      limit: 4,
      sort: SORT_OPTIONS.POPULAR,
      subject: detailQuery.data?.subject ? [detailQuery.data.subject] : undefined,
    }),
    [detailQuery.data?.subject],
  );

  const relatedQuery = useQuery({
    ...getKnowledgeQueryOptions(relatedParams),
    enabled: Boolean(detailQuery.data?.subject),
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
    setIsLiking(true);
    try {
      // Placeholder for real API mutation
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setIsLiking(false);
    }
  }, [detailQuery.data]);

  return {
    knowledge: detailQuery.data ?? null,
    relatedKnowledge,
    isLoading: detailQuery.isLoading,
    error: detailQuery.error,
    isBookmarked,
    isLiking,
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
    mutationKey: ['knowledge-centers', 'create'],
    mutationFn: (payload: CreateKnowledgeCenterRequest) => knowledgeCenterApi.createKnowledgeCenter(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-centers'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-centers', 'detail', data.id] });
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

  // Upload states
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);

  // ============================================================================
  // Media Upload Handlers
  // ============================================================================

  const handleMediaUpload = useCallback(
    async (file: File, type: 'video' | 'audio' | 'pdf') => {
      setIsUploadingMedia(true);
      try {
        // Lazy import to avoid circular dependencies
        const { knowledgeApi } = await import('@/api');

        let uploadedUrl = '';
        if (type === 'video') {
          uploadedUrl = await knowledgeApi.uploadVideo(file);
        } else if (type === 'audio') {
          uploadedUrl = await knowledgeApi.uploadAudio(file);
        } else {
          uploadedUrl = await knowledgeApi.uploadPDF(file);
        }

        // Get the latest knowledgeContent from form state to preserve contentType
        const currentKnowledgeContent = wizard.form.getFieldValue('knowledgeContent') || {};
        console.log('📤 Upload complete - preserving contentType from:', currentKnowledgeContent);

        wizard.form.setFieldValue('knowledgeContent', {
          ...currentKnowledgeContent,
          mediaUrl: uploadedUrl,
        });

        onSuccess('Media uploaded successfully');
      } catch (error) {
        console.error('Media upload failed:', error);
        onError('Failed to upload media. Please try again.');
      } finally {
        setIsUploadingMedia(false);
      }
    },
    [wizard.form, onSuccess, onError]
  );

  const handleNotesUpload = useCallback(
    async (file: File) => {
      setIsUploadingPDF(true);
      try {
        const { knowledgeApi } = await import('@/api');
        const uploadedUrl = await knowledgeApi.uploadPDF(file);

        wizard.form.setFieldValue('webinar', {
          ...(formValues.webinar || {}),
          contentText: uploadedUrl,
        });

        onSuccess('PDF uploaded successfully');
      } catch (error) {
        console.error('PDF upload failed:', error);
        onError('Failed to upload PDF. Please try again.');
      } finally {
        setIsUploadingPDF(false);
      }
    },
    [wizard.form, formValues.webinar, onSuccess, onError]
  );

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
      // Dynamic import to avoid circular dependencies
      const { KNOWLEDGE_TYPES, CONTENT_TYPES } = await import('@/types/knowledge-center');
      const { knowledgeApi } = await import('@/api');

      if (!formValues.type) {
        onError('Please select a content type first!');
        return;
      }

      if (!formValues.idSubject) {
        onError('Please select a subject first!');
        return;
      }

      try {
        // Handle thumbnail upload
        let thumbnailUrl =
          typeof formValues.thumbnail === 'string' && formValues.thumbnail
            ? formValues.thumbnail
            : 'https://via.placeholder.com/300x200';

        if (formValues.thumbnail instanceof File) {
          try {
            thumbnailUrl = await knowledgeApi.uploadImage(formValues.thumbnail);
          } catch (uploadError) {
            console.error('Failed to upload thumbnail:', uploadError);
            onError('Failed to upload thumbnail. Please try again.');
            return;
          }
        }

        // Build API payload
        const apiData: any = {
          createdBy: formValues.createdBy,
          idSubject: formValues.idSubject,
          title: formValues.title,
          description: formValues.description,
          type: formValues.type,
          penyelenggara: formValues.penyelenggara,
          thumbnail: thumbnailUrl,
          isFinal: status === 'published',
          publishedAt: formValues.publishedAt || new Date().toISOString(),
          tags: formValues.tags,
        };

        // Add webinar data if applicable
        if (formValues.type === KNOWLEDGE_TYPES.WEBINAR && formValues.webinar) {
          apiData.webinar = {
            zoomDate: formValues.webinar.zoomDate || new Date().toISOString(),
            zoomLink: formValues.webinar.zoomLink || '',
            recordLink: formValues.webinar.recordLink || '',
            youtubeLink: formValues.webinar.youtubeLink || '',
            vbLink: formValues.webinar.vbLink || '',
            jpCount: formValues.webinar.jpCount || 0,
          };
        }

        // Add content data if applicable
        if (formValues.type === KNOWLEDGE_TYPES.CONTENT && formValues.knowledgeContent) {
          const contentType = formValues.knowledgeContent.contentType || CONTENT_TYPES.ARTICLE;

          apiData.knowledgeContent = {
            contentType,
            document: formValues.knowledgeContent.document || '',
          };

          // Only include mediaUrl for non-article content types
          if (contentType !== CONTENT_TYPES.ARTICLE) {
            apiData.knowledgeContent.mediaUrl = formValues.knowledgeContent.mediaUrl || '';
            console.log('📤 Including mediaUrl for content type:', contentType);
          } else {
            console.log('📝 Article type - mediaUrl excluded from submission');
          }

          console.log('📤 Final knowledgeContent to be sent:', apiData.knowledgeContent);
        }

        // Submit to API
        await createKnowledgeMutation.mutateAsync(apiData);

        // Navigate to knowledge center on success
        router.push('/knowledge-center');
      } catch (error) {
        console.error('Failed to create knowledge:', error);
        onError('Failed to create knowledge. Please try again.');
      }
    },
    [formValues, createKnowledgeMutation, router, onError]
  );

  return {
    // Upload handlers
    handleMediaUpload,
    handleNotesUpload,
    isUploadingMedia,
    isUploadingPDF,

    // Navigation handlers
    handleNextStep,
    handleStepNavigation,

    // Submission handler
    handleSubmit,
    isCreating: createKnowledgeMutation.isPending,
  };
};
