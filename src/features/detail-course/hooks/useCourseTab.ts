import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { CourseTabType } from '../types/tab';

const DEFAULT_TAB: CourseTabType = 'information';

export const useCourseTab = (courseId: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeTab = (searchParams.get('tab') as CourseTabType) || DEFAULT_TAB;

  const setActiveTab = useCallback((tab: CourseTabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/course/${courseId}?${params.toString()}`);
  }, [courseId, router, searchParams]);

  return {
    activeTab,
    setActiveTab,
  };
};
