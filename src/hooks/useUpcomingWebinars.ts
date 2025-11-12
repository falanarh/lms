/**
 * Upcoming Webinars Hook
 *
 * Hook untuk mengambil webinar yang akan datang
 * Digunakan oleh komponen UpcomingWebinars
 */

import { useMemo } from 'react';
import { useKnowledge } from './useKnowledgeCenter';
import { KnowledgeCenter } from '@/types';

export const useUpcomingWebinars = () => {
  const { data: knowledgeItems, isLoading, error } = useKnowledge({
    page: 1,
    limit: 10,
    knowledgeType: 'webinar', // Use single string instead of array
  });

  const upcomingWebinars = useMemo<KnowledgeCenter[]>(() => {
    if (!knowledgeItems || knowledgeItems.length === 0) {
      return [];
    }

    const now = new Date();

    return knowledgeItems
      .filter(item => {
        // Filter untuk webinar yang belum dimulai
        if (item.type !== 'webinar' || !item.webinar?.zoomDate) {
          return false;
        }

        const webinarDate = new Date(item.webinar.zoomDate);
        return webinarDate > now;
      })
      .sort((a, b) => new Date(a.webinar!.zoomDate).getTime() - new Date(b.webinar!.zoomDate).getTime())
      .slice(0, 6); // Maksimal 6 upcoming webinars
  }, [knowledgeItems]);

  return {
    upcomingWebinars,
    isLoading,
    error,
    hasWebinars: upcomingWebinars.length > 0,
  };
};

export type UseUpcomingWebinarsReturn = ReturnType<typeof useUpcomingWebinars>;