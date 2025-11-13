/**
 * Knowledge Stats Hook
 *
 * Hook untuk mengambil data statistik knowledge center dari API stats endpoint
 * Digunakan oleh komponen KnowledgeStats
 */

import { useQuery } from '@tanstack/react-query';
import { knowledgeCenterApi } from '@/api/knowledge-center';
import type { KnowledgeCenterStats } from '@/types/knowledge-center';

export interface KnowledgeStatsData extends KnowledgeCenterStats {
  // Extend with additional computed fields if needed in the future
  totalContent?: number;
  publishedCount?: number;
  draftCount?: number;
  averageViews?: number;
  averageLikes?: number;
  topSubjects?: Array<{
    subject: string;
    count: number;
  }>;
}

export const useKnowledgeStats = () => {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['knowledge-centers', 'stats'],
    queryFn: knowledgeCenterApi.fetchKnowledgeCenterStats,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
  });

  // Transform API response to match component expectations
  const stats: KnowledgeStatsData = {
    totalKnowledge: statsData?.totalKnowledge || 0,
    totalWebinars: statsData?.totalWebinars || 0,
    totalViews: statsData?.totalViews || 0,
    totalLikes: statsData?.totalLikes || 0,
    // Additional computed fields (can be added later if API provides them)
    totalContent: 0,
    publishedCount: 0,
    draftCount: 0,
    averageViews: 0,
    averageLikes: 0,
    topSubjects: [],
  };

  return {
    stats,
    isLoading,
    error,
  };
};

export type UseKnowledgeStatsReturn = ReturnType<typeof useKnowledgeStats>;