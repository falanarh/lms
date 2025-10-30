import { useState, useCallback, useEffect } from 'react';
import type { Discussion } from '@/components/shared/DiscussionCard/Topic';

// Types untuk API response
export interface DiscussionsResponse {
  discussions: Discussion[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  nextPage?: number;
}

// Types untuk API parameters
export interface FetchDiscussionsParams {
  topicId: string;
  page?: number;
  limit?: number;
  sortBy?: 'votes' | 'latest' | 'oldest';
  discussionType?: 'all' | 'direct' | 'nested';
}

// Mock API delay untuk simulasi
const API_DELAY = 600; // ms

/**
 * Mock API untuk mengambil data discussions/replies
 * Dalam production, ini akan diganti dengan actual API calls
 */
export const discussionsApi = {
  async fetchDiscussions(params: FetchDiscussionsParams): Promise<DiscussionsResponse> {
    // Simulasi API delay
    await new Promise(resolve => setTimeout(resolve, API_DELAY));

    const { topicId, page = 1, limit = 2, sortBy = 'votes', discussionType = 'all' } = params;

    // Mock data - dalam production ini akan diganti dengan database query
    const allMockDiscussions = [
      // Direct replies (jawaban langsung ke topic)
      {
        // API properties
        id: "d1",
        idUser: "user-john-doe",
        comment: "Saya juga mengalami hal yang sama. Solusi yang berhasil untuk saya adalah dengan menghapus folder node_modules dan package-lock.json, kemudian jalankan npm install kembali. Ini sering terjadi karena dependency conflicts.",
        upvoteCount: 3,
        downvoteCount: 0,
        discussionType: "direct",
        createdAt: "2025-10-30T14:00:00.000Z",

        // Computed properties for UI
        author: "John Doe",
        time: "2 jam lalu",
        content: "Saya juga mengalami hal yang sama. Solusi yang berhasil untuk saya adalah dengan menghapus folder node_modules dan package-lock.json, kemudian jalankan npm install kembali. Ini sering terjadi karena dependency conflicts.",
      },
      {
        id: "d2",
        author: "Sarah Wilson",
        time: "1 jam lalu",
        content: "Coba cek versi Node.js yang kamu gunakan. Beberapa package membutuhkan versi tertentu. Saya sarankan menggunakan Node.js versi LTS terbaru. Saya pernah mengalami hal serupa dan upgrade Node.js solved the issue.",
        upvoteCount: 2,
        downvoteCount: 0,
        discussionType: "direct",
      },
      {
        id: "d3",
        author: "Mike Johnson",
        time: "45 menit lalu",
        content: "Alternatif lain adalah menggunakan yarn instead of npm. Yarn memiliki dependency resolution yang lebih baik dan sering solve conflicts yang npm tidak bisa handle.",
        upvoteCount: 1,
        downvoteCount: 0,
        discussionType: "direct",
      },
      {
        id: "d4",
        author: "Emily Davis",
        time: "30 menit lalu",
        content: "Saya punya pengalaman serupa. Ternyata masalahnya karena ada package yang tidak compatible dengan OS saya. Pastikan semua package compatible dengan environment kamu.",
        upvoteCount: 2,
        downvoteCount: 1,
        discussionType: "direct",
      },
      {
        id: "d5",
        author: "Robert Chen",
        time: "15 menit lalu",
        content: "Kalau semua cara di atas tidak berhasil, coba clean install dengan cara: rm -rf node_modules package-lock.json, npm cache clean --force, lalu npm install. Ini extreme but usually works.",
        upvoteCount: 1,
        downvoteCount: 0,
        discussionType: "direct",
      },
      // Nested replies (jawaban ke jawaban lain)
      {
        id: "d6",
        author: "Lisa Anderson",
        time: "50 menit lalu",
        content: "Saran yang bagus! Saya juga akan coba cara ini. Apa ada impact lain yang perlu diperhatikan?",
        upvoteCount: 1,
        downvoteCount: 0,
        replyingToId: "d1",
        replyingToAuthor: "John Doe",
        discussionType: "nestedFirst",
      },
      {
        id: "d7",
        author: "David Brown",
        time: "40 menit lalu",
        content: "Setuju, Node.js version sangat penting. Saya upgrade dari v16 ke v18 dan banyak issues yang solved.",
        upvoteCount: 112,
        downvoteCount: 0,
        replyingToId: "d2",
        replyingToAuthor: "Sarah Wilson",
        discussionType: "nestedFirst",
      },
      {
        id: "d8",
        author: "Jennifer White",
        time: "25 menit lalu",
        content: "Thanks for the suggestion @Lisa Anderson! I'll try it and let you know the results.",
        upvoteCount: 113,
        downvoteCount: 0,
        replyingToId: "d6",
        replyingToAuthor: "Lisa Anderson",
        discussionType: "nestedSecond",
      },
      {
        id: "d9",
        author: "Tom Harris",
        time: "20 menit lalu",
        content: "For macOS users, saya sarankan menggunakan Homebrew untuk Node.js installation. Lebih clean dan easy to manage versions.",
        upvoteCount: 114,
        downvoteCount: 0,
        replyingToId: "d2",
        replyingToAuthor: "Sarah Wilson",
        discussionType: "nestedFirst",
      },
      {
        id: "d10",
        author: "Nancy Martinez",
        time: "10 menit lalu",
        content: "Good point about OS compatibility! I'm on Windows and some packages just don't work well.",
        upvoteCount: 115,
        downvoteCount: 0,
        replyingToId: "d4",
        replyingToAuthor: "Emily Davis",
        discussionType: "nestedFirst",
      },
    ];

    // Filter berdasarkan discussion type
    let filteredDiscussions = allMockDiscussions;
    if (discussionType !== 'all') {
      if (discussionType === 'direct') {
        filteredDiscussions = allMockDiscussions.filter(d => !d.replyingToId);
      } else {
        filteredDiscussions = allMockDiscussions.filter(d => d.replyingToId);
      }
    }

    // Sort berdasarkan sortBy
    switch (sortBy) {
      case 'votes':
        filteredDiscussions.sort((a, b) => {
          const scoreA = a.upvoteCount - a.downvoteCount;
          const scoreB = b.upvoteCount - b.downvoteCount;
          return scoreB - scoreA;
        });
        break;
      case 'latest':
        // Mock sorting berdasarkan time - dalam production akan menggunakan timestamp
        const timeOrder = ['10 menit lalu', '15 menit lalu', '20 menit lalu', '25 menit lalu', '30 menit lalu', '45 menit lalu', '50 menit lalu', '1 jam lalu', '2 jam lalu'];
        filteredDiscussions.sort((a, b) =>
          timeOrder.indexOf(a.time) - timeOrder.indexOf(b.time)
        );
        break;
      case 'oldest':
        const timeOrderReverse = ['10 menit lalu', '15 menit lalu', '20 menit lalu', '25 menit lalu', '30 menit lalu', '45 menit lalu', '50 menit lalu', '1 jam lalu', '2 jam lalu'];
        filteredDiscussions.sort((a, b) =>
          timeOrderReverse.indexOf(b.time) - timeOrderReverse.indexOf(a.time)
        );
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDiscussions = filteredDiscussions.slice(startIndex, endIndex);

    const hasMore = endIndex < filteredDiscussions.length;

    return {
      discussions: paginatedDiscussions as Discussion[],
      hasMore,
      totalCount: filteredDiscussions.length,
      currentPage: page,
      nextPage: hasMore ? page + 1 : undefined,
    };
  },

  // Method untuk refetch data (misalnya setelah sort change)
  async refetchDiscussions(params: FetchDiscussionsParams): Promise<DiscussionsResponse> {
    return this.fetchDiscussions({ ...params, page: 1 });
  },
};

/**
 * Custom hook untuk infinite scroll discussions/replies
 *
 * Features:
 * - Automatic data fetching dengan pagination
 * - Loading states dan error handling
 * - Cache management untuk prevent duplicate requests
 * - Sorting dan filtering support
 * - Optimized untuk nested discussions
 */
export function useInfiniteDiscussions(initialParams: FetchDiscussionsParams) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [params, setParams] = useState<FetchDiscussionsParams>(initialParams);

  // Cache untuk prevent duplicate requests
  const [requestCache, setRequestCache] = useState<Set<string>>(new Set());

  // Generate cache key untuk request
  const getCacheKey = useCallback((page: number, currentParams: FetchDiscussionsParams) => {
    return `${currentParams.topicId}-${page}-${JSON.stringify(currentParams)}`;
  }, []);

  // Fetch discussions dengan pagination
  const fetchDiscussions = useCallback(async (page: number = 1, append: boolean = false) => {
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

      const response = await discussionsApi.fetchDiscussions({
        ...params,
        page,
        limit: 2, // 2 discussions per load untuk replies
      });

      if (append) {
        setDiscussions(prev => [...prev, ...response.discussions]);
      } else {
        setDiscussions(response.discussions);
      }

      setHasMore(response.hasMore);
      setTotalCount(response.totalCount);
      setCurrentPage(response.currentPage);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch discussions');
      console.error('Error fetching discussions:', err);
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

  // Load more discussions
  const loadMore = useCallback(() => {
    if (!loading && !error && hasMore) {
      const nextPage = currentPage + 1;
      fetchDiscussions(nextPage, true);
    }
  }, [loading, error, hasMore, currentPage, fetchDiscussions]);

  // Reset dan refetch data (untuk sort/filter changes)
  const refetch = useCallback((newParams?: Partial<FetchDiscussionsParams>) => {
    const updatedParams = newParams ? { ...params, ...newParams } : params;
    setParams(updatedParams);
    setDiscussions([]);
    setCurrentPage(1);
    setHasMore(true);

    // Fetch dengan parameter baru
    return fetchDiscussions(1, false);
  }, [params, fetchDiscussions]);

  // Initial fetch
  useEffect(() => {
    fetchDiscussions(1, false);
  }, []); // Only run once on mount

  return {
    // Data
    discussions,
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
    isEmpty: discussions.length === 0 && !loading,
    isLoadingMore: loading && discussions.length > 0,
    isFirstLoad: loading && discussions.length === 0,
  };
}