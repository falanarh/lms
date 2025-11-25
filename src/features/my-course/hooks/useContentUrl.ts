import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Content } from '@/api/contents';

export const useContentUrl = (courseId: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeContentId = searchParams.get('contentId') || null;

  const setActiveContentId = useCallback((contentId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (contentId) {
      params.set('contentId', contentId);
    } else {
      params.delete('contentId');
    }
    
    router.push(`/my-course/${courseId}?${params.toString()}`, { scroll: false });
  }, [courseId, router, searchParams]);

  const updateContentInUrl = useCallback((content: Content | null) => {
    if (content) {
      setActiveContentId(content.id);
    } else {
      setActiveContentId(null);
    }
  }, [setActiveContentId]);

  return {
    activeContentId,
    setActiveContentId,
    updateContentInUrl,
  };
};
