/**
 * Knowledge Stats Hook
 *
 * Hook untuk mengambil data statistik knowledge center
 * Digunakan oleh komponen KnowledgeStats
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useKnowledge } from './useKnowledgeCenter';

export interface KnowledgeStatsData {
  totalKnowledge: number;
  totalWebinars: number;
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  publishedCount: number;
  draftCount: number;
  averageViews: number;
  averageLikes: number;
  topSubjects: Array<{
    subject: string;
    count: number;
  }>;
}

export const useKnowledgeStats = () => {
  const { data: knowledgeItems, isLoading } = useKnowledge({
    page: 1,
    limit: 1000 // Ambil semua data untuk statistik
  });

  const stats = useMemo<KnowledgeStatsData>(() => {
    if (!knowledgeItems || knowledgeItems.length === 0) {
      return {
        totalKnowledge: 0,
        totalWebinars: 0,
        totalContent: 0,
        totalViews: 0,
        totalLikes: 0,
        publishedCount: 0,
        draftCount: 0,
        averageViews: 0,
        averageLikes: 0,
        topSubjects: [],
      };
    }

    // Hitung statistik dasar
    const totalKnowledge = knowledgeItems.length;
    const totalWebinars = knowledgeItems.filter(item => item.type === 'webinar').length;
    const totalContent = knowledgeItems.filter(item => item.type === 'content').length;
    const totalViews = knowledgeItems.reduce((sum, item) => sum + item.viewCount, 0);
    const totalLikes = knowledgeItems.reduce((sum, item) => sum + item.likeCount, 0);
    const publishedCount = knowledgeItems.filter(item => item.isFinal).length;
    const draftCount = totalKnowledge - publishedCount;
    const averageViews = totalKnowledge > 0 ? Math.round(totalViews / totalKnowledge) : 0;
    const averageLikes = totalKnowledge > 0 ? Math.round(totalLikes / totalKnowledge) : 0;

    // Hitung top subjects
    const subjectCounts: Record<string, number> = {};
    knowledgeItems.forEach(item => {
      if (item.subject) {
        subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
      }
    });

    const topSubjects = Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalKnowledge,
      totalWebinars,
      totalContent,
      totalViews,
      totalLikes,
      publishedCount,
      draftCount,
      averageViews,
      averageLikes,
      topSubjects,
    };
  }, [knowledgeItems]);

  return {
    stats,
    isLoading,
  };
};

export type UseKnowledgeStatsReturn = ReturnType<typeof useKnowledgeStats>;