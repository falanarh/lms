/**
 * Popular Knowledge Hook
 *
 * Hook untuk mengambil knowledge yang populer
 * Digunakan oleh komponen PopularCarousel
 */

import { useMemo } from 'react';
import { useKnowledge } from './useKnowledgeCenter';
import { SORT_OPTIONS } from '@/types/knowledge-center';

export const usePopularKnowledge = () => {
  const { data: knowledgeItems, isLoading, error } = useKnowledge({
    page: 1,
    limit: 10,
    sort: SORT_OPTIONS.POPULAR,
  });

  const popularKnowledge = useMemo(() => {
    if (!knowledgeItems || knowledgeItems.length === 0) {
      return [];
    }

    return knowledgeItems;
  }, [knowledgeItems]);

  return {
    popularKnowledge,
    isLoading,
    error,
    hasData: popularKnowledge.length > 0,
  };
};

export type UsePopularKnowledgeReturn = ReturnType<typeof usePopularKnowledge>;