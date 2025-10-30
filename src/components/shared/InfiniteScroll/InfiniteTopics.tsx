import React, { useCallback } from 'react';
import { useInfiniteTopics, type FetchTopicsParams } from '@/hooks/useInfiniteTopics';
import { LoadMoreButton } from './LoadMoreButton';
import { LoadingState, ErrorState, EmptyState, SkeletonLoader } from './LoadingStates';
import type { Forum } from '@/components/shared/ForumList/ForumList';

interface InfiniteTopicsProps {
  // Initial parameters
  initialParams?: FetchTopicsParams;

  // Custom rendering
  renderItem: (topic: Forum, index: number) => React.ReactNode;

  // Custom content
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  loadMoreComponent?: React.ReactNode;

  // Styling
  className?: string;
  itemClassName?: string;
  listClassName?: string;

  // Options
  showSkeleton?: boolean;
  skeletonCount?: number;
  autoLoad?: boolean;

  // Callbacks
  onLoadStart?: () => void;
  onLoadComplete?: (topics: Forum[]) => void;
  onError?: (error: string) => void;
}

/**
 * InfiniteTopics - Component untuk infinite scroll topics
 *
 * Features:
 * - Automatic infinite scroll dengan pagination
 * - Loading states (skeleton, initial, more loading)
 * - Error handling dengan retry mechanism
 * - Empty states untuk search dan general cases
 * - Customizable rendering untuk setiap item
 * - Easy integration dengan API
 * - Performance optimized dengan cache management
 */
export function InfiniteTopics({
  initialParams = {},
  renderItem,
  loadingComponent,
  errorComponent,
  emptyComponent,
  loadMoreComponent,
  className = '',
  itemClassName = '',
  listClassName = '',
  showSkeleton = true,
  skeletonCount = 3,
  autoLoad = false,
  onLoadStart,
  onLoadComplete,
  onError,
}: InfiniteTopicsProps) {
  const {
    topics,
    loading,
    error,
    hasMore,
    isEmpty,
    isLoadingMore,
    isFirstLoad,
    loadMore,
    refetch,
  } = useInfiniteTopics(initialParams);

  // Handle load more dengan callbacks
  const handleLoadMore = useCallback(() => {
    if (loading || !hasMore) return;

    onLoadStart?.();
    loadMore();
  }, [loading, hasMore, loadMore, onLoadStart]);

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Effects untuk callbacks
  React.useEffect(() => {
    if (loading && isFirstLoad) {
      onLoadStart?.();
    }
  }, [loading, isFirstLoad, onLoadStart]);

  React.useEffect(() => {
    if (!loading && topics.length > 0) {
      onLoadComplete?.(topics);
    }
  }, [loading, topics, onLoadComplete]);

  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Initial loading state
  if (isFirstLoad) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    if (showSkeleton) {
      return (
        <div className={className}>
          <SkeletonLoader count={skeletonCount} />
        </div>
      );
    }

    return (
      <div className={className}>
        <LoadingState type="initial" />
      </div>
    );
  }

  // Error state
  if (error && topics.length === 0) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div className={className}>
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }

    return (
      <div className={className}>
        <EmptyState search={initialParams.search} onReset={() => refetch()} />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Topics List */}
      <div className={listClassName}>
        {topics.map((topic, index) => (
          <div key={topic.id} className={itemClassName}>
            {renderItem(topic, index)}
          </div>
        ))}
      </div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <LoadingState type="more" />
      )}

      {/* Load More Button */}
      {!isLoadingMore && hasMore && (
        <>
          {loadMoreComponent ? (
            <div onClick={handleLoadMore}>
              {loadMoreComponent}
            </div>
          ) : (
            <LoadMoreButton
              onLoadMore={handleLoadMore}
              loading={isLoadingMore}
              hasMore={hasMore}
              size="md"
              variant="primary"
              children="Muat lebih banyak topik"
            />
          )}
        </>
      )}

      {/* End of Content */}
      {!hasMore && !isLoadingMore && topics.length > 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            Menampilkan {topics.length} dari {initialParams.search ? 'hasil pencarian' : 'semua topik'}
          </p>
        </div>
      )}

      {/* Error for additional loads */}
      {error && topics.length > 0 && (
        <div className="text-center py-4">
          <p className="text-red-500 text-sm mb-2">
            Gagal memuat lebih banyak topik
          </p>
          <button
            onClick={handleRetry}
            className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}

export default InfiniteTopics;