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
import { knowledgeApi } from '@/api';
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

  // Upload states
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  
  // Track which button was clicked for loading state
  const [submittingAs, setSubmittingAs] = useState<'draft' | 'published' | null>(null);
  
  // Track if we're currently uploading any files
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // ============================================================================
  // Media Upload Handlers
  // ============================================================================

  const handleMediaUpload = useCallback(
    async (file: File, type: 'video' | 'audio' | 'pdf') => {
      setIsUploadingMedia(true);
      try {
        // Use upload function map for cleaner code
        const uploadFn = {
          video: knowledgeApi.uploadVideo,
          audio: knowledgeApi.uploadAudio,
          pdf: knowledgeApi.uploadPDF,
        }[type];

        const uploadedUrl = await uploadFn(file);
        
        // Sanitize URL to handle special characters like spaces
        const sanitizedUrl = encodeMediaUrl(uploadedUrl);

        // Update form using nested field path
        wizard.form.setFieldValue('knowledgeContent.mediaUrl' as any, sanitizedUrl as any);

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
        const uploadedUrl = await knowledgeApi.uploadPDF(file);
        
        // Sanitize URL to handle special characters like spaces
        const sanitizedUrl = encodeMediaUrl(uploadedUrl);

        // Update form using nested field path
        wizard.form.setFieldValue('webinar.contentText' as any, sanitizedUrl as any);

        onSuccess('PDF uploaded successfully');
      } catch (error) {
        console.error('PDF upload failed:', error);
        onError('Failed to upload PDF. Please try again.');
      } finally {
        setIsUploadingPDF(false);
      }
    },
    [wizard.form, onSuccess, onError]
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
        router.push('/knowledge-center');
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
