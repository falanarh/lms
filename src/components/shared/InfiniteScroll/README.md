# Infinite Scroll Pattern

## Overview

Infinite Scroll Pattern yang diimplementasikan menggunakan **API-First Architecture** yang memudahkan integrasi dengan backend services. Pattern ini dirancang untuk performance, user experience, dan maintainability.

## 🏗️ Architecture

```
src/
├── hooks/
│   └── useInfiniteTopics.ts     # Custom hook dengan logic & cache management
├── components/shared/InfiniteScroll/
│   ├── InfiniteTopics.tsx       # Main infinite scroll component
│   ├── LoadMoreButton.tsx       # Reusable load more button
│   ├── LoadingStates.tsx        # Loading, error, empty states
│   └── README.md               # This documentation
```

## 🎯 Core Components

### 1. `useInfiniteTopics` Hook
**Purpose**: State management dan data fetching logic

**Features**:
- ✅ Automatic pagination dengan 3 topics per load
- ✅ Request cache untuk prevent duplicate calls
- ✅ Error handling dan retry mechanism
- ✅ Search dan sorting support
- ✅ Loading states management
- ✅ Performance optimized

### 2. `InfiniteTopics` Component
**Purpose**: UI component yang menggunakan hook logic

**Features**:
- ✅ Customizable rendering
- ✅ Built-in loading states (skeleton, initial, more)
- ✅ Error states dengan retry buttons
- ✅ Empty states untuk search/general
- ✅ Easy API integration

### 3. Support Components
- **`LoadMoreButton`**: Reusable button dengan loading states
- **`LoadingStates`**: Complete set of loading components
- **`SkeletonLoader`**: Skeleton loading untuk better UX

## 🚀 Usage Examples

### Basic Usage

```typescript
import { InfiniteTopics } from '@/components/shared/InfiniteScroll/InfiniteTopics';

<InfiniteTopics
  initialParams={{
    sortBy: 'upvoted',
    limit: 3,
  }}
  renderItem={(topic, index) => (
    <TopicCard key={topic.id} topic={topic} />
  )}
/>
```

### Advanced Usage dengan Customization

```typescript
import { InfiniteTopics } from '@/components/shared/InfiniteScroll/InfiniteTopics';
import { CustomLoadingComponent } from './CustomLoading';
import { CustomErrorComponent } from './CustomError';

<InfiniteTopics
  initialParams={{
    search: searchTerm,
    sortBy: sortBy,
    categoryId: selectedCategory,
  }}
  renderItem={(topic, index) => (
    <TopicCard
      key={topic.id}
      topic={topic}
      index={index}
      priority={index < 3} // Priority loading untuk first items
    />
  )}
  loadingComponent={<CustomLoadingComponent />}
  errorComponent={<CustomErrorComponent onRetry={handleRetry} />}
  showSkeleton={true}
  skeletonCount={3}
  onLoadStart={() => setLoading(true)}
  onLoadComplete={(topics) => {
    setLoading(false);
    trackTopicsLoaded(topics.length);
  }}
  onError={(error) => {
    trackError('topics_load_failed', error);
  }}
/>
```

### Integration dengan Real API

```typescript
// api/topics.ts
export const topicsApi = {
  async fetchTopics(params: FetchTopicsParams): Promise<TopicsResponse> {
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }

    return response.json();
  }
};

// Component usage
<InfiniteTopics
  initialParams={{
    limit: 3,
    sortBy: 'latest',
  }}
  renderItem={(topic) => <TopicCard topic={topic} />}
/>
```

## 📊 Data Flow

```
1. Component Mount
   ↓
2. useInfiniteTopics hook initializes
   ↓
3. Initial API call (page=1, limit=3)
   ↓
4. Display first 3 topics
   ↓
5. User clicks "Load More"
   ↓
6. API call (page=2, limit=3)
   ↓
7. Append 3 new topics to existing list
   ↓
8. Repeat until hasMore=false
```

## 🎨 Customization Options

### Rendering Customization

```typescript
<InfiniteTopics
  renderItem={(topic, index) => {
    // Custom rendering logic
    return (
      <div className={`topic-item ${index === 0 ? 'featured' : ''}`}>
        <h3>{topic.title}</h3>
        <p>{topic.description}</p>
        {/* Custom content */}
      </div>
    );
  }}
/>
```

### Loading State Customization

```typescript
<InfiniteTopics
  loadingComponent={
    <div className="custom-loading">
      <Spinner />
      <p>Memuat topik menarik untuk Anda...</p>
    </div>
  }
  showSkeleton={false} // Disable skeleton if custom loading provided
/>
```

### Error Handling Customization

```typescript
<InfiniteTopics
  errorComponent={
    <CustomErrorDisplay
      onRetry={() => window.location.reload()}
      message="Sepertinya ada masalah dengan koneksi Anda"
    />
  }
  onError={(error) => {
    // Custom error tracking
    analytics.track('infinite_scroll_error', { error });
  }}
/>
```

## 🔧 Advanced Features

### Search Integration

```typescript
const [searchTerm, setSearchTerm] = useState('');

<InfiniteTopics
  initialParams={{ search: searchTerm }}
  renderItem={(topic) => <TopicCard topic={topic} />}
  // Auto-refetch when search changes
  key={searchTerm} // Force re-render when search changes
/>
```

### Filter Integration

```typescript
<InfiniteTopics
  initialParams={{
    categoryId: selectedCategory,
    sortBy: sortOption,
    dateRange: dateFilter,
  }}
  renderItem={(topic) => <TopicCard topic={topic} />}
/>
```

### Performance Optimization

```typescript
<InfiniteTopics
  renderItem={React.useMemo(
    () => (topic, index) => (
      <MemoizedTopicCard
        key={topic.id}
        topic={topic}
        index={index}
      />
    ),
    []
  )}
  showSkeleton={true}
  skeletonCount={3}
/>
```

## 📱 Mobile & Accessibility

### Mobile Optimizations

```typescript
<InfiniteTopics
  // Different skeleton count for mobile
  skeletonCount={isMobile ? 2 : 3}

  // Mobile-specific rendering
  renderItem={(topic, index) => (
    <div className="topic-item-mobile">
      {/* Mobile-optimized layout */}
    </div>
  )}
/>
```

### Accessibility Features

- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Proper ARIA labels
- ✅ Focus management
- ✅ Loading announcements

## 🔄 API Integration Guide

### Backend API Response Format

```typescript
interface TopicsResponse {
  topics: Topic[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  nextPage?: number;
}
```

### Implementation Steps

1. **Update API Endpoint**
   ```typescript
   // POST /api/topics
   {
     "page": 1,
     "limit": 3,
     "search": "react",
     "sortBy": "latest"
   }
   ```

2. **Replace Mock API**
   ```typescript
   // In useInfiniteTopics.ts
   export const topicsApi = {
     async fetchTopics(params) {
       const response = await fetch('/api/topics', {
         method: 'POST',
         body: JSON.stringify(params)
       });
       return response.json();
     }
   };
   ```

3. **Add Error Handling**
   ```typescript
   try {
     const response = await api.fetchTopics(params);
     return response;
   } catch (error) {
     if (error.status === 401) {
       // Handle auth error
       redirectToLogin();
     }
     throw error;
   }
   ```

## 📈 Performance Considerations

### Optimization Tips

1. **Memoization**: Use `React.memo` untuk topic items
2. **Virtual Scrolling**: Untuk very large lists (1000+ items)
3. **Image Optimization**: Lazy load images dalam topics
4. **Request Caching**: Hook sudah include cache management
5. **Debounce Search**: Debounce search input changes

### Memory Management

```typescript
// Cleanup effect for large lists
useEffect(() => {
  return () => {
    // Cleanup jika component unmount
    cancelPendingRequests();
  };
}, []);
```

## 🎯 Best Practices

### ✅ DO:
- Gunakan skeleton loading untuk better UX
- Implement proper error boundaries
- Add loading states untuk user feedback
- Use request cache untuk prevent duplicates
- Implement retry mechanism
- Track performance metrics

### ❌ DON'T:
- Fetch semua data sekaligus
- Ignore error states
- Forget accessibility features
- Use setTimeout untuk fake delays di production
- Skip loading states

## 🔍 Debugging

### Common Issues

1. **Duplicate Requests**: Check request cache implementation
2. **Not Loading**: Verify API response format
3. **Performance Issues**: Check memoization dan virtualization
4. **Mobile Issues**: Test responsive behavior

### Debug Tools

```typescript
// Enable debug mode
const debugMode = process.env.NODE_ENV === 'development';

<InfiniteTopics
  onLoadStart={() => debugMode && console.log('Loading started...')}
  onLoadComplete={(topics) => debugMode && console.log('Loaded:', topics.length)}
  onError={(error) => debugMode && console.error('Error:', error)}
/>
```

---

**Version**: 1.0.0 (API-First Architecture)
**Maintainer**: Development Team
**Last Updated**: 2025