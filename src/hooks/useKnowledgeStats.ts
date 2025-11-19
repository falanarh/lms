/**
 * Knowledge Stats Hook
 *
 * Hook untuk mengambil data statistik knowledge center dari API stats endpoint
 * Digunakan oleh komponen KnowledgeStats
 */

import { useQuery } from '@tanstack/react-query';
import { knowledgeCenterApi } from '@/api/knowledge-center';
import type { KnowledgeCenterStats, KnowledgeOverviewStats, KnowledgeLastActivity } from '@/types/knowledge-center';
import { knowledgeKeys } from '@/lib/query-keys';
import { CACHE_TIMES } from '@/constants/knowledge';

/**
 * Data type for knowledge stats
 */
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

/**
 * Hook untuk mengambil data statistik knowledge center dari API stats endpoint
 */
export const useKnowledgeStats = () => {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: knowledgeKeys.stats(),
    queryFn: knowledgeCenterApi.fetchKnowledgeCenterStats,
    ...CACHE_TIMES.stats,
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

/**
 * Hook untuk mengambil data aktivitas terakhir knowledge center
 */
export const useKnowledgeLastActivities = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: knowledgeKeys.lastActivities(),
    queryFn: knowledgeCenterApi.fetchKnowledgeLastActivities,
    ...CACHE_TIMES.stats,
  });

  return {
    activities: (data || []) as KnowledgeLastActivity[],
    isLoading,
    error,
  };
};

/**
 * Hook untuk mengambil data statistik knowledge center overview dari API overview stats endpoint
 */
export const useKnowledgeOverviewStats = () => {
  const { data: overviewData, isLoading, error } = useQuery({
    queryKey: knowledgeKeys.overviewStats(),
    queryFn: knowledgeCenterApi.fetchKnowledgeOverviewStats,
    ...CACHE_TIMES.stats,
  });

  const stats: KnowledgeOverviewStats = {
    totalPosts: overviewData?.totalPosts ?? 0,
    totalPublished: overviewData?.totalPublished ?? 0,
    totalScheduled: overviewData?.totalScheduled ?? 0,
    totalDrafts: overviewData?.totalDrafts ?? 0,
    totalWebinars: overviewData?.totalWebinars ?? 0,
    totalVideos: overviewData?.totalVideos ?? 0,
    totalPdfs: overviewData?.totalPdfs ?? 0,
    totalPodcasts: overviewData?.totalPodcasts ?? 0,
    totalArticles: overviewData?.totalArticles ?? 0,
  };

  return {
    stats,
    isLoading,
    error,
  };
};

export type UseKnowledgeStatsReturn = ReturnType<typeof useKnowledgeStats>;