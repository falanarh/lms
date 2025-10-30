import React, { useCallback } from 'react';
import { useInfiniteDiscussions, type FetchDiscussionsParams } from '@/hooks/useInfiniteDiscussions';
import type { Discussion } from '@/components/shared/DiscussionCard/Topic';
import { LoadMoreButton } from './LoadMoreButton';
import { LoadingState, ErrorState, EmptyState, SkeletonLoader } from './LoadingStates';

interface InfiniteDiscussionsProps {
  // Required parameters
  topicId: string;

  // Initial parameters
  initialParams?: Omit<FetchDiscussionsParams, 'topicId'>;

  // Custom rendering
  renderItem: (discussion: Discussion, index: number) => React.ReactNode;

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

  // Callbacks
  onLoadStart?: () => void;
  onLoadComplete?: (discussions: Discussion[]) => void;
  onError?: (error: string) => void;
}

/**
 * InfiniteDiscussions - Component untuk infinite scroll discussions/replies
 *
 * Features:
 * - Automatic infinite scroll dengan pagination
 * - Optimized untuk nested discussions
 * - Loading states (skeleton, initial, more loading)
 * - Error handling dengan retry mechanism
 * - Empty states untuk various scenarios
 * - Customizable rendering untuk setiap discussion
 * - Performance optimized untuk frequent interactions
 */
export function InfiniteDiscussions({
  topicId,
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
  skeletonCount = 2,
  onLoadStart,
  onLoadComplete,
  onError,
}: InfiniteDiscussionsProps) {
  const {
    discussions,
    loading,
    error,
    hasMore,
    totalCount,
    isEmpty,
    isLoadingMore,
    isFirstLoad,
    loadMore,
    refetch,
  } = useInfiniteDiscussions({
    topicId,
    ...initialParams,
  });

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
    if (!loading && discussions.length > 0) {
      onLoadComplete?.(discussions);
    }
  }, [loading, discussions, onLoadComplete]);

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
  if (error && discussions.length === 0) {
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
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Discussions List */}
      <ul className={listClassName} role="list" aria-label="Daftar balasan">
        {discussions.map((discussion, index) => (
          <li key={discussion.id} className={itemClassName} role="listitem">
            {renderItem(discussion, index)}
          </li>
        ))}
      </ul>

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
              size="sm"
              variant="minimal"
              align="left"
              children="Lihat balasan lainnya"
            />
          )}
        </>
      )}

      {/* End of Content */}
      {!hasMore && !isLoadingMore && discussions.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Menampilkan {discussions.length} dari {totalCount} balasan
          </p>
        </div>
      )}

      {/* Error for additional loads */}
      {error && discussions.length > 0 && (
        <div className="text-center py-3">
          <p className="text-red-500 text-sm mb-2">
            Gagal memuat lebih banyak balasan
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

export default InfiniteDiscussions;