# Dokumentasi Alur Manajemen Data Server ke Komponen

## Overview

Dokumentasi ini menjelaskan bagaimana data mengalir dari server ke komponen dalam aplikasi E-Warkop menggunakan Next.js 15 dan React Query v5 untuk state management.

## Arsitektur Data Flow

```
Server API → API Layer → Custom Hooks → Components → UI
    ↑           ↑            ↑            ↑
  Axios     React Query  State Mgt  React Components
```

## 1. Server API Layer

### Konfigurasi API
- **Lokasi**: `src/config/api.ts`
- **Base URL**: `https://api-lms-kappa.vercel.app`
- **HTTP Client**: Axios dengan konfigurasi timeout 10 detik

```typescript
export const API_ENDPOINTS = {
  FORUMS: `${API_BASE_URL}/forums`,
  FORUM_BY_ID: (id: string) => `${API_BASE_URL}/forums/${id}`,
  TOPICS: `${API_BASE_URL}/topics`,
  DISCUSSIONS: `${API_BASE_URL}/discussions`,
  // ...
};
```

### API Functions
- **Lokasi**: `src/api/`
- **Pattern**: Async functions dengan error handling
- **Response Format**: Standardized response wrapper

Contoh struktur API response:
```typescript
interface APIResponse<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
  meta?: any;
}
```

## 2. React Query Configuration

### Query Client Setup
- **Lokasi**: `src/lib/queryClient.ts`
- **Global Configuration**:
  - `staleTime`: 5 menit (data masih fresh)
  - `gcTime`: 10 menit (cache cleanup)
  - `retry`: 3 kali (untuk error 5xx)
  - `refetchOnWindowFocus`: false (menghindari request otomatis)

### Query Provider
- **Lokasi**: `src/providers/QueryProvider.tsx`
- **Scope**: Wrap seluruh aplikasi di `src/app/layout.tsx`
- **DevTools**: Aktif di development mode

## 3. Data Fetching Patterns

### A. Query Pattern (GET Data)
Contoh: Forum data fetching

**API Layer** (`src/api/forums.ts`):
```typescript
export const getForums = async (): Promise<Forum[]> => {
  const response = await axios.get<ForumResponse>(API_ENDPOINTS.FORUMS, API_CONFIG);
  if (response.data.status !== 200) {
    throw new Error(response.data.message || "Failed to fetch forums");
  }
  return response.data.data;
};

export const getForumsQueryOptions = () => {
  return queryOptions({
    queryKey: ["forums"],
    queryFn: getForums,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
```

**Custom Hook** (`src/hooks/useForums.ts`):
```typescript
export const useForums = () => {
  const {
    data: forums = [],
    isLoading,
    error,
    refetch,
  } = useQuery(getForumsQueryOptions());

  return {
    data: (forums || []) as Forum[],
    isLoading,
    error,
    refetch,
  };
};
```

### B. Mutation Pattern (POST/PUT/DELETE Data)
Contoh: Create forum

**API Layer** (`src/api/forums.ts`):
```typescript
export const createForum = async (forumData: CreateForumRequest): Promise<Forum> => {
  const response = await axios.post(
    API_ENDPOINTS.FORUMS,
    forumData,
    API_CONFIG
  );
  return response.data.data;
};

export const useCreateForum = () => {
  return useMutation({
    mutationFn: createForum,
  });
};
```

### C. Complex Data Pattern
Contoh: Discussions dengan transformasi data

**API Layer** (`src/api/discussions.ts`):
```typescript
export const discussionsApi = {
  async fetchDiscussions(params: FetchDiscussionsParams): Promise<DiscussionsResponse> {
    // Fetch data dari API
    const response = await axios.get(API_ENDPOINTS.DISCUSSION_REPLIES(forumId), API_CONFIG);

    // Transform API response ke component format
    const transformedDiscussions = response.data.data.map(item => ({
      id: item.id,
      content: item.comment,
      author: item.author || `User ${item.idUser?.slice(-6)}`,
      // ... transformasi lainnya
    }));

    return {
      discussions: transformedDiscussions,
      hasMore: endIndex < filteredDiscussions.length,
      totalCount: filteredDiscussions.length,
    };
  }
};
```

**Custom Hook** (`src/hooks/useDiscussion.ts`):
```typescript
export function useDiscussionForum(forumId: string, sortBy: 'latest' | 'most-voted' = 'latest') {
  const { data, isLoading, error, refetch } = useQuery(getDiscussionsQueryOptions(forumId, sortBy));

  // Transform API data ke component format
  const transformedData = data ? {
    topics: data.map((topic: any) => transformTopic(topic)),
    discussions: data.reduce((acc: Record<string, Discussion[]>, topic: any) => {
      acc[topic.id] = topic.discussions.map((discussion: any) =>
        transformDiscussion(discussion, topic.discussions)
      );
      return acc;
    }, {}),
  } : { topics: [], discussions: {} };

  return {
    data: transformedData,
    isLoading,
    error,
    refetch,
    getTopicById: (topicId: string) => transformedData.topics.find(t => t.id === topicId),
    getDiscussionsByTopicId: (topicId: string) => transformedData.discussions[topicId] || [],
  };
}
```

## 4. State Management Patterns

### A. Server State Management
Dikelola oleh React Query:
- **Caching**: Otomatis dengan staleTime
- **Background Refetch**: Tidak aktif (manual refetch)
- **Error Handling**: Global error handling di queryClient
- **Optimistic Updates**: Tidak digunakan (simple pattern)

### B. Local State Management
Dikelola oleh React hooks:
- **Form State**: `useState` untuk form inputs
- **UI State**: `useState` untuk drawer, modal, toast
- **Loading States**: Dapat dari mutation status

### C. Hybrid State Pattern
Contoh: Voting state dengan local + server sync

```typescript
// Local state untuk immediate feedback
const [localVotes, setLocalVotes] = useState<Record<string, LocalVoteState>>({});

// Server state dari React Query
const { data: serverVotes } = useQuery(getVotesQueryOptions());

// Combined state
const getDiscussionVoteState = (discussion: Discussion) => {
  const localVote = localVotes[discussion.id];
  const serverVote = discussion.userVote;

  return {
    upvotes: discussion.upvoteCount + (localVote?.upvotes || 0),
    downvotes: discussion.downvoteCount + (localVote?.downvotes || 0),
    userVote: localVote?.userVote || serverVote || null,
  };
};
```

## 5. Error Handling Strategy

### Network Error Handling
```typescript
try {
  const response = await axios.get(API_ENDPOINTS.FORUMS, API_CONFIG);
  return response.data.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      // Return fallback data
      return fallbackForums;
    }
    throw new Error(error.response?.data?.message || "Failed to connect");
  }
  throw error;
}
```

### Component-Level Error Handling
```typescript
const { data, isLoading, error } = useForums();

if (error) {
  return (
    <div className="error-state">
      <h3>Gagal memuat data</h3>
      <p>{error.message}</p>
      <button onClick={() => refetch()}>Coba Lagi</button>
    </div>
  );
}
```

## 6. Data Transformation Layers

### API Response → Component Data
**Location**: Transform functions di hooks
**Purpose**: Adapt API response ke UI requirements

```typescript
const transformDiscussion = (discussion: DiscussionResponse, allDiscussions: DiscussionResponse[] = []): Discussion => {
  return {
    // API properties
    id: discussion.id,
    idUser: discussion.idUser,
    comment: discussion.comment,

    // Computed properties for UI
    author: generateAuthorName(discussion.idUser),
    time: formatTimeAgo(discussion.createdAt),
    content: discussion.comment,
    replyingToAuthor: parentDiscussion
      ? generateAuthorName(parentDiscussion.idUser)
      : undefined,
  };
};
```

## 7. Performance Optimizations

### A. Query Caching
- **Stale Time**: 5 menit untuk forums, 2 menit untuk discussions
- **Cache Time**: 10 menit sebelum garbage collection
- **Query Key**: Specific untuk prevent cache invalidation issues

### B. Data Fetching Optimization
```typescript
// Paginated loading
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['discussions', forumId],
  queryFn: ({ pageParam = 1 }) => fetchDiscussions({ forumId, page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});

// Selective data fetching
const { data: topics } = useQuery({
  queryKey: ['topics', forumId],
  queryFn: () => fetchTopics(forumId),
  select: (data) => data.filter(topic => !topic.isResolved), // Filter di client side
});
```

### C. Component Optimization
```typescript
// Memo expensive computations
const transformedTopics = useMemo(() => {
  return topics.map(transformTopic);
}, [topics]);

// Stable references untuk props
const handleSubmitReply = useCallback(async (data) => {
  await submitReply(data);
}, [submitReply]);
```

## 8. Data Consistency Patterns

### A. Cache Invalidation
```typescript
// After mutation, refresh related queries
mutationFn: createDiscussion,
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ['discussions', forumId],
  });
  queryClient.invalidateQueries({
    queryKey: ['topics', forumId],
  });
},
```

### B. Optimistic Updates (Not Used)
Sengaja tidak menggunakan optimistic updates untuk:
- Menghindari complexity
- Memastikan data consistency dengan server
- Feedback delay acceptable untuk user experience

### C. Error Recovery
```typescript
retry: (failureCount: number, error: any) => {
  // Don't retry on 404 or network errors
  if (error.message?.includes('service is currently unavailable')) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
},
```

## 9. Type Safety

### API Types
```typescript
// src/api/forums.ts
export type Forum = {
  id: string;
  title: string;
  description?: string;
  type: "course" | "general";
  lastActivity: string;
  totalTopics: number;
};

export type CreateForumRequest = {
  title: string;
  description: string;
  type: "course" | "general";
};
```

### Component Types
```typescript
// src/components/shared/DiscussionCard/Topic.tsx
export interface TopicMeta {
  id: string;
  title: string;
  body: string;
  startedAgo: string;
  lastReplyAgo: string;
  state: "open" | "closed";
  // ... more properties
}
```

## 10. Best Practices

### A. Data Fetching
1. **Consistent Error Handling**: Handle 404, network errors gracefully
2. **Fallback Data**: Provide meaningful fallbacks when API fails
3. **Loading States**: Show appropriate loading indicators
4. **Type Safety**: Strong typing for API responses and component props

### B. State Management
1. **Single Source of Truth**: React Query untuk server state
2. **Minimal Local State**: Hanya untuk UI state yang temporary
3. **Clear Separation**: Server state vs local state yang jelas
4. **Cache Management**: Appropriate staleTime dan cache invalidation

### C. Performance
1. **Query Deduplication**: Gunakan queryKey yang consistent
2. **Selective Refetching**: Invalidasi hanya queries yang relevant
3. **Component Memoization**: Prevent unnecessary re-renders
4. **Data Transformation**: Lakukan transformasi di layer yang tepat

## 11. Monitoring & Debugging

### React Query DevTools
- **Setup**: Aktif di development mode
- **Usage**: Monitor cache, query states, dan data flow
- **Debugging**: Inspect query keys dan data transformation

### Console Logging
```typescript
console.log('🔄 [QUERY INVALIDATION] Create Discussion Success:', {
  queryKey: getDiscussionsQueryKey(forumId || '', sortBy),
  timestamp: new Date().toISOString()
});
```

### Error Tracking
- Global error handling di queryClient
- Component-level error boundaries
- Network error detection dan fallback strategies

## 12. Knowledge Center Create Implementation

### 🎯 Multi-Step Form Data Flow

**Pattern**: Wizard Form dengan Progressive Validation dan State Management

#### **Architecture Overview**
```
Form State (TanStack) → Validation (Zod) → Transform → API → Server
        ↑                    ↑              ↑        ↑
   User Input         Step Validation   Business    HTTP
                                        Logic      Request
```

### **A. Form State Management Pattern**

#### **TanStack Form Integration**
```typescript
// Hook: useKnowledgeWizardForm.ts
export const useKnowledgeWizardForm = () => {
  const form = useForm({
    defaultValues: getInitialFormValues(),
    validators: {
      onSubmit: ({ value }) => {
        const result = completeFormSchema.safeParse(value);
        return result.success ? undefined : result.error.errors[0]?.message;
      },
    },
  });

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const schema = getStepSchema(currentStep, form.state.values.type);
    const result = schema.safeParse(form.state.values);
    
    if (!result.success) {
      result.error.errors.forEach((error) => {
        const fieldPath = error.path.join('.');
        form.setFieldMeta(fieldPath, (prev) => ({
          ...prev,
          errors: [error.message],
        }));
      });
      return false;
    }
    return true;
  }, [currentStep, form]);

  return { form, validateCurrentStep };
};
```

### **B. Data Transformation Layer**

#### **Form → API Transformation**
```typescript
// lib/knowledge-center/transform.ts
export const transformFormDataToAPI = (
  formValues: CreateKnowledgeFormData,
  status: 'draft' | 'published',
  thumbnailUrl: string
): CreateKnowledgeCenterRequest => {
  const apiData: CreateKnowledgeCenterRequest = {
    createdBy: formValues.createdBy,
    title: formValues.title,
    type: formValues.type!,
    thumbnail: thumbnailUrl,
    isFinal: status === 'published',
  };

  // Conditional transformation berdasarkan content type
  if (formValues.type === KNOWLEDGE_TYPES.WEBINAR && formValues.webinar) {
    apiData.webinar = {
      zoomDate: formValues.webinar.zoomDate || new Date().toISOString(),
      zoomLink: encodeMediaUrl(formValues.webinar.zoomLink) || 'https://zoom.us',
      jpCount: formValues.webinar.jpCount || 0,
    };
  }

  if (formValues.type === KNOWLEDGE_TYPES.CONTENT && formValues.knowledgeContent) {
    apiData.knowledgeContent = {
      contentType: formValues.knowledgeContent.contentType,
      document: formValues.knowledgeContent.document || '',
      mediaUrl: formValues.knowledgeContent.contentType !== CONTENT_TYPES.ARTICLE ?
        encodeMediaUrl(formValues.knowledgeContent.mediaUrl || '') : undefined,
    };
  }

  return apiData;
};
```

### **C. Progressive Validation Strategy**

#### **Step-Based Zod Schema Validation**
```typescript
// lib/validation/knowledge-schemas.ts
export const getStepSchema = (step: number, type?: KnowledgeType) => {
  switch (step) {
    case 1:
      return z.object({
        type: z.enum(['webinar', 'content'], {
          required_error: 'Please select a content type',
        }),
      });
    case 2:
      return basicInfoSchema; // Title, description, subject, etc.
    case 3:
      return type === KNOWLEDGE_TYPES.WEBINAR ? 
        webinarDetailsSchema : contentDetailsWithMediaSchema;
    case 4:
      return completeFormSchema; // Full validation
    default:
      return z.object({});
  }
};
```

### **D. Business Logic Separation**

#### **Page-Level Business Logic Hook**
```typescript
// hooks/useKnowledgeCenter.ts
export const useCreateKnowledgePage = ({ wizard, router, onSuccess, onError }) => {
  const createMutation = useMutation({
    mutationFn: knowledgeCenterApi.createKnowledgeCenter,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-centers'] });
      onSuccess('Knowledge center berhasil dibuat!');
      router.push(`/knowledge-center/${data.id}`);
    },
    onError: (error) => onError(error.message),
  });

  const handleSubmit = async (status: 'draft' | 'published') => {
    const isValid = await wizard.validateCurrentStep();
    if (!isValid) return;

    // Upload files dan transform data
    const thumbnailUrl = await handleThumbnailUpload();
    const apiData = transformFormDataToAPI(wizard.formValues, status, thumbnailUrl);
    
    await createMutation.mutateAsync(apiData);
  };

  return { handleSubmit, isCreating: createMutation.isPending };
};
```

### **E. Component Composition Pattern**

#### **Step-Based Rendering dengan Data Flow**
```typescript
// app/knowledge-center/create/page.tsx
export default function CreateKnowledgePage() {
  const wizard = useKnowledgeWizardForm();
  const businessLogic = useCreateKnowledgePage({ wizard, router, onSuccess, onError });

  const renderCurrentStep = () => {
    switch (wizard.currentStep) {
      case 1: return <KnowledgeTypeSelector wizard={wizard} />;
      case 2: return <BasicInfoForm wizard={wizard} subjects={subjects} />;
      case 3: return <ContentDetailsForm wizard={wizard} />;
      case 4: return <ReviewStep wizard={wizard} />;
    }
  };

  return (
    <div className="wizard-layout">
      <WizardHeader currentStep={wizard.currentStep} />
      {renderCurrentStep()}
      <WizardActions wizard={wizard} onSubmit={businessLogic.handleSubmit} />
    </div>
  );
}
```

### **F. Performance Optimizations**

#### **Efficient Form State Access**
```typescript
// Memoized form values untuk prevent unnecessary re-renders
const formValues = useMemo(() => form.state.values, [form.state.values]);

// Selective re-rendering dengan Subscribe
<form.Subscribe selector={(state) => state.values.knowledgeContent?.contentType}>
  {(selectedContentType) => (
    <ContentTypeSpecificForm contentType={selectedContentType} />
  )}
</form.Subscribe>
```

## Summary

Alur data management dalam aplikasi ini mengikuti pattern yang modern dan scalable:

1. **Server → API**: Structured API dengan consistent response format
2. **API → Hooks**: Data fetching dengan React Query untuk caching dan state management
3. **Hooks → Components**: Custom hooks yang menyediakan data dan actions
4. **Components → UI**: React components dengan type-safe props dan error handling

**Knowledge Center Create** menambahkan layer kompleksitas dengan:
5. **Form State**: TanStack Form dengan progressive validation
6. **Data Transformation**: Business logic separation untuk form → API conversion
7. **File Handling**: Upload management dengan preview dan error handling
8. **Multi-Step Flow**: Wizard pattern dengan step-based validation

Pattern ini memastikan:
- **Data Consistency**: Single source of truth dari server
- **Performance**: Optimal caching dan selective refetching
- **Developer Experience**: Type safety dan debugging tools
- **User Experience**: Graceful error handling dan loading states
- **Scalability**: Modular architecture yang mudah diextend
- **Form Reliability**: Progressive validation dan error recovery