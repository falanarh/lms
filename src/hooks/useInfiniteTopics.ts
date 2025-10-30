import { useState, useCallback, useEffect } from 'react';
import type { Forum } from '@/components/shared/ForumList/ForumList';

// Types untuk API response
export interface TopicsResponse {
  topics: Forum[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  nextPage?: number;
}

// Types untuk API parameters
export interface FetchTopicsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'latest' | 'upvoted' | 'replies';
  categoryId?: string;
}

// Mock API delay untuk simulasi
const API_DELAY = 800; // ms

/**
 * Mock API untuk mengambil data topics
 * Dalam production, ini akan diganti dengan actual API calls
 */
export const topicsApi = {
  async fetchTopics(params: FetchTopicsParams = {}): Promise<TopicsResponse> {
    // Simulasi API delay
    await new Promise(resolve => setTimeout(resolve, API_DELAY));

    const { page = 1, limit = 3, search = '', sortBy = 'upvoted' } = params;

    // Mock data - dalam production ini akan diganti dengan database query
    const allMockTopics: Forum[] = [
      {
        id: "1",
        title: "Pengembangan Web Fundamental",
        description: "Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.",
        type: "course",
        lastActivity: "2023-10-28T10:30:00Z",
        totalTopics: 42,
      },
      {
        id: "2",
        title: "React dan Next.js",
        description: "Berbagi pengetahuan tentang React, Next.js, dan ekosistemnya.",
        type: "course",
        lastActivity: "2023-10-27T15:45:00Z",
        totalTopics: 38,
      },
      {
        id: "3",
        title: "Mobile Development",
        description: "Diskusi tentang pengembangan aplikasi mobile iOS dan Android.",
        type: "course",
        lastActivity: "2023-10-26T09:20:00Z",
        totalTopics: 25,
      },
      {
        id: "4",
        title: "Backend & Database",
        description: "Belajar tentang backend development, database design, dan API development.",
        type: "course",
        lastActivity: "2023-10-25T14:15:00Z",
        totalTopics: 31,
      },
      {
        id: "5",
        title: "DevOps & Deployment",
        description: "Best practices untuk deployment, CI/CD, dan infrastructure management.",
        type: "course",
        lastActivity: "2023-10-24T11:30:00Z",
        totalTopics: 18,
      },
      {
        id: "6",
        title: "UI/UX Design",
        description: "Diskusi tentang design principles, user experience, dan interface design.",
        type: "course",
        lastActivity: "2023-10-23T16:45:00Z",
        totalTopics: 27,
      },
      {
        id: "7",
        title: "Machine Learning",
        description: "Pengenalan machine learning, AI, dan data science fundamentals.",
        type: "course",
        lastActivity: "2023-10-22T13:20:00Z",
        totalTopics: 22,
      },
      {
        id: "8",
        title: "Cybersecurity",
        description: "Diskusi tentang security best practices, ethical hacking, dan data protection.",
        type: "course",
        lastActivity: "2023-10-21T10:10:00Z",
        totalTopics: 19,
      },
      {
        id: "9",
        title: "General Discussion",
        description: "Forum untuk diskusi umum yang tidak termasuk kategori spesifik.",
        type: "general",
        lastActivity: "2023-10-28T08:00:00Z",
        totalTopics: 156,
      },
      {
        id: "10",
        title: "Career & Networking",
        description: "Berbagi pengalaman tentang karir, job opportunities, dan networking.",
        type: "general",
        lastActivity: "2023-10-27T12:30:00Z",
        totalTopics: 89,
      },
    ];

    // Filter berdasarkan search
    let filteredTopics = allMockTopics;
    if (search) {
      filteredTopics = allMockTopics.filter(topic =>
        topic.title.toLowerCase().includes(search.toLowerCase()) ||
        (topic.description && topic.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort berdasarkan sortBy
    switch (sortBy) {
      case 'latest':
        filteredTopics.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        break;
      case 'upvoted':
        // Mock sorting - dalam production akan berdasarkan actual likes/upvotes
        filteredTopics.sort((a, b) => b.totalTopics - a.totalTopics);
        break;
      case 'replies':
        filteredTopics.sort((a, b) => b.totalTopics - a.totalTopics);
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTopics = filteredTopics.slice(startIndex, endIndex);

    const hasMore = endIndex < filteredTopics.length;

    return {
      topics: paginatedTopics,
      hasMore,
      totalCount: filteredTopics.length,
      currentPage: page,
      nextPage: hasMore ? page + 1 : undefined,
    };
  },

  // Method untuk refetch data (misalnya setelah search atau filter change)
  async refetchTopics(params: FetchTopicsParams = {}): Promise<TopicsResponse> {
    return this.fetchTopics({ ...params, page: 1 });
  },
};

/**
 * Custom hook untuk infinite scroll topics
 *
 * Features:
 * - Automatic data fetching dengan pagination
 * - Loading states dan error handling
 * - Cache management untuk prevent duplicate requests
 * - Easy integration dengan API
 * - Search dan sorting support
 */
export function useInfiniteTopics(initialParams: FetchTopicsParams = {}) {
  const [topics, setTopics] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [params, setParams] = useState<FetchTopicsParams>(initialParams);

  // Cache untuk prevent duplicate requests
  const [requestCache, setRequestCache] = useState<Set<string>>(new Set());

  // Generate cache key untuk request
  const getCacheKey = useCallback((page: number, currentParams: FetchTopicsParams) => {
    return `${page}-${JSON.stringify(currentParams)}`;
  }, []);

  // Fetch topics dengan pagination
  const fetchTopics = useCallback(async (page: number = 1, append: boolean = false) => {
    const cacheKey = getCacheKey(page, params);

    // Prevent duplicate requests
    if (requestCache.has(cacheKey)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add to cache
      setRequestCache(prev => new Set(prev).add(cacheKey));

      const response = await topicsApi.fetchTopics({
        ...params,
        page,
        limit: 3, // 3 topics per load
      });

      if (append) {
        setTopics(prev => [...prev, ...response.topics]);
      } else {
        setTopics(response.topics);
      }

      setHasMore(response.hasMore);
      setTotalCount(response.totalCount);
      setCurrentPage(response.currentPage);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);

      // Remove from cache after delay untuk prevent rapid clicks
      setTimeout(() => {
        setRequestCache(prev => {
          const newCache = new Set(prev);
          newCache.delete(cacheKey);
          return newCache;
        });
      }, 1000);
    }
  }, [params, requestCache, getCacheKey]);

  // Load more topics
  const loadMore = useCallback(() => {
    if (!loading && !error && hasMore) {
      const nextPage = currentPage + 1;
      fetchTopics(nextPage, true);
    }
  }, [loading, error, hasMore, currentPage, fetchTopics]);

  // Reset dan refetch data (untuk search/filter changes)
  const refetch = useCallback((newParams?: Partial<FetchTopicsParams>) => {
    const updatedParams = newParams ? { ...params, ...newParams } : params;
    setParams(updatedParams);
    setTopics([]);
    setCurrentPage(1);
    setHasMore(true);

    // Fetch dengan parameter baru
    return fetchTopics(1, false);
  }, [params, fetchTopics]);

  // Initial fetch
  useEffect(() => {
    fetchTopics(1, false);
  }, []); // Only run once on mount

  return {
    // Data
    topics,
    totalCount,
    currentPage,

    // States
    loading,
    error,
    hasMore,

    // Actions
    loadMore,
    refetch,

    // Utilities
    isEmpty: topics.length === 0 && !loading,
    isLoadingMore: loading && topics.length > 0,
    isFirstLoad: loading && topics.length === 0,
  };
}