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
