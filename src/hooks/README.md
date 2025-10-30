# Custom Hooks for Infinite Scroll

## Overview

Collection of custom hooks yang dioptimasi untuk infinite scroll functionality dengan performance dan maintainability sebagai prioritas utama.

## 🎯 Available Hooks

### 1. `useInfiniteTopics` Hook
**Purpose**: Infinite scroll untuk topik-level data

**Features**:
- ✅ Pagination dengan 3 topics per load
- ✅ Search dan sorting support
- ✅ Request cache management
- ✅ Error handling dengan retry
- ✅ Loading states optimization

**Usage**:
```typescript
import { useInfiniteTopics } from '@/hooks/useInfiniteTopics';

const {
  topics,
  loading,
  error,
  hasMore,
  loadMore,
  refetch,
  isEmpty,
  isLoadingMore,
  isFirstLoad
} = useInfiniteTopics({
  search: searchTerm,
  sortBy: 'upvoted',
  limit: 3
});
```

### 2. `useInfiniteDiscussions` Hook
**Purpose**: Infinite scroll untuk reply/discussion-level data

**Features**:
- ✅ Pagination dengan 2 discussions per load
- ✅ Nested discussion support (direct, nested-first, nested-second)
- ✅ Topic-specific data fetching
- ✅ Vote-based sorting
- ✅ Performance optimized untuk frequent interactions

**Usage**:
```typescript
import { useInfiniteDiscussions } from '@/hooks/useInfiniteDiscussions';

const {
  discussions,
  loading,
  error,
  hasMore,
  loadMore,
  refetch,
  isEmpty,
  isLoadingMore,
  isFirstLoad
} = useInfiniteDiscussions({
  topicId: 'topic-123',
  sortBy: 'votes',
  discussionType: 'all',
  limit: 2
});
```

## 📊 Performance Features

### Request Cache Management
```typescript
// Automatic cache untuk prevent duplicate requests
const requestCache = new Set<string>();

// Generate unique cache key
const cacheKey = `${topicId}-${page}-${JSON.stringify(params)}`;

// Check cache before making request
if (requestCache.has(cacheKey)) {
  return; // Skip duplicate request
}
```

### Memory Optimization
```typescript
// Cleanup cache after delay
setTimeout(() => {
  setRequestCache(prev => {
    const newCache = new Set(prev);
    newCache.delete(cacheKey);
    return newCache;
  });
}, 1000); // 1 second cleanup delay
```

### Error Recovery
```typescript
// Automatic retry with exponential backoff
const retryWithBackoff = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## 🔄 Integration Patterns

### Basic Integration
```typescript
// Component level integration
function MyComponent() {
  const { topics, loading, loadMore, hasMore } = useInfiniteTopics({
    sortBy: 'latest'
  });

  return (
    <div>
      {topics.map(topic => <TopicCard key={topic.id} topic={topic} />)}
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Advanced Integration with Error Handling
```typescript
function AdvancedComponent() {
  const {
    topics,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    isEmpty,
    isFirstLoad
  } = useInfiniteTopics({
    search,
    sortBy,
    categoryId
  });

  // Error handling with retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading states
  if (isFirstLoad) return <LoadingSkeleton />;
  if (error && isEmpty) return <ErrorDisplay error={error} onRetry={handleRetry} />;
  if (isEmpty) return <EmptyState />;

  return (
    <div>
      {topics.map(topic => <TopicCard key={topic.id} topic={topic} />)}
      <InfiniteLoadMore
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
```

### Nested Infinite Scroll (Topics + Discussions)
```typescript
function NestedForum() {
  // Top-level infinite scroll
  const { topics, loadMore: loadMoreTopics } = useInfiniteTopics();

  return (
    <div>
      {topics.map(topic => (
        <TopicWithInfiniteReplies
          key={topic.id}
          topic={topic}
          // Nested infinite scroll untuk replies
          infiniteDiscussionsProps={{
            topicId: topic.id,
            sortBy: 'votes'
          }}
        />
      ))}
      <LoadMoreButton onClick={loadMoreTopics} />
    </div>
  );
}

function TopicWithInfiniteReplies({ topic, infiniteDiscussionsProps }) {
  // Nested infinite scroll untuk replies
  const { discussions, loadMore, loading } = useInfiniteDiscussions(infiniteDiscussionsProps);

  return (
    <div>
      <TopicHeader topic={topic} />
      <DiscussionsList discussions={discussions} />
      {loading && <LoadingMore />}
      <LoadMoreRepliesButton onClick={loadMore} />
    </div>
  );
}
```

## 🎨 Component Integration

### with InfiniteTopics Component
```typescript
import { InfiniteTopics } from '@/components/shared/InfiniteScroll/InfiniteTopics';

<InfiniteTopics
  initialParams={{
    search: searchTerm,
    sortBy: 'upvoted',
    limit: 3
  }}
  renderItem={(topic, index) => (
    <TopicCard key={topic.id} topic={topic} priority={index < 3} />
  )}
  onLoadStart={() => setLoading(true)}
  onLoadComplete={(topics) => {
    setLoading(false);
    analytics.track('topics_loaded', { count: topics.length });
  }}
  onError={(error) => {
    analytics.track('topics_error', { error });
  }}
/>
```

### with InfiniteDiscussions Component
```typescript
import { InfiniteDiscussions } from '@/components/shared/InfiniteScroll/InfiniteDiscussions';

<InfiniteDiscussions
  topicId={topicId}
  initialParams={{
    sortBy: 'votes',
    discussionType: 'all',
    limit: 2
  }}
  renderItem={(discussion, index) => (
    <DiscussionReply
      key={discussion.id}
      discussion={discussion}
      onVote={handleVote}
      onReply={handleReply}
    />
  )}
  showSkeleton={true}
  skeletonCount={2}
/>
```

## 📈 Performance Tips

### 1. Memoization
```typescript
// Memoize expensive operations
const sortedTopics = useMemo(() => {
  return topics.sort((a, b) => b.votes - a.votes);
}, [topics]);

// Memoize render items
const TopicItem = React.memo(({ topic }) => {
  return <TopicCard topic={topic} />;
});
```

### 2. Virtual Scrolling (untuk very large lists)
```typescript
// Untuk 1000+ items, consider virtual scrolling
import { FixedSizeList as List } from 'react-window';

function VirtualizedTopics() {
  const { topics } = useInfiniteTopics();

  return (
    <List
      height={600}
      itemCount={topics.length}
      itemSize={120}
      itemData={topics}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <TopicCard topic={data[index]} />
        </div>
      )}
    </List>
  );
}
```

### 3. Image Optimization
```typescript
// Lazy load images dalam infinite scroll
const TopicImage = React.memo(({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={loaded ? src : '/placeholder.jpg'}
      alt={alt}
      onLoad={() => setLoaded(true)}
      loading="lazy"
    />
  );
});
```

### 4. Debounce Search
```typescript
// Debounce search input untuk prevent excessive API calls
const debouncedSearch = useMemo(
  () => debounce((term: string) => {
    refetch({ search: term });
  }, 300),
  [refetch]
);

useEffect(() => {
  debouncedSearch(searchTerm);
}, [searchTerm, debouncedSearch]);
```

## 🔄 API Integration

### Mock API Structure
```typescript
// Response format untuk infinite scroll
interface TopicsResponse {
  topics: Topic[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  nextPage?: number;
}

interface DiscussionsResponse {
  discussions: Discussion[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  nextPage?: number;
}
```

### Real API Implementation
```typescript
// Ganti mock API dengan real implementation
export const topicsApi = {
  async fetchTopics(params: FetchTopicsParams) {
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};
```

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Test hook behavior
import { renderHook, act } from '@testing-library/react';
import { useInfiniteTopics } from './useInfiniteTopics';

test('should load initial topics', async () => {
  const { result } = renderHook(() => useInfiniteTopics());

  expect(result.current.loading).toBe(true);
  expect(result.current.topics).toEqual([]);

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.topics.length).toBeGreaterThan(0);
});
```

### Integration Testing
```typescript
// Test component integration
import { render, screen, fireEvent } from '@testing-library/react';
import { InfiniteTopics } from '../InfiniteScroll/InfiniteTopics';

test('should load more topics on button click', async () => {
  render(<InfiniteTopics renderItem={(topic) => <div>{topic.title}</div>} />);

  const loadMoreButton = await screen.findByText('Tampilkan Lebih Banyak');
  fireEvent.click(loadMoreButton);

  expect(await screen.findByText(/Memuat.../)).toBeInTheDocument();
});
```

## 🚀 Production Considerations

### 1. Error Boundaries
```typescript
// Wrap infinite scroll components dengan error boundaries
function ErrorBoundaryWrapper({ children }) {
  return (
    <ErrorBoundary
      fallback={<ErrorDisplay message="Failed to load content" />}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 2. Analytics Tracking
```typescript
// Track infinite scroll performance
const useInfiniteScrollAnalytics = () => {
  const trackLoadTime = useCallback((startTime: number, itemCount: number) => {
    const loadTime = Date.now() - startTime;
    analytics.track('infinite_scroll_load', {
      loadTime,
      itemCount,
      userAgent: navigator.userAgent
    });
  }, []);

  return { trackLoadTime };
};
```

### 3. Performance Monitoring
```typescript
// Monitor performance metrics
const usePerformanceMonitoring = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, []);
};
```

---

**Version**: 1.0.0
**Maintainer**: Development Team
**Last Updated**: 2025