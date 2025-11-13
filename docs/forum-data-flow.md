# Alur Data Daftar Forum: API → Hooks → UI

## 📋 Overview

Dokumentasi ini menjelaskan alur lengkap penampilan data daftar forum mulai dari API layer hingga UI layer, dengan detail implementasi dan best practices yang digunakan.

## 🏗️ Architecture Layers

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Layer      │    │   Hooks Layer    │    │   API Layer     │
│  (Components)   │    │  (Custom Hooks)  │    │  (Data Fetch)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔗 API Layer

### File: `src/api/forums.ts`

#### **Type Definitions**
```typescript
export type Forum = {
  id: string;
  title: string;
  description: string;
  type: "course" | "general";
  lastActivity: string;
  totalTopics: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ForumResponse = {
  data: Forum[];
  status: number;
  message: string;
  success: boolean;
};
```

#### **API Functions**
```typescript
// Fetch all forums
export const getForums = async (): Promise<Forum[]> => {
  try {
    const response = await axios.get<ForumResponse>(API_ENDPOINTS.FORUMS, API_CONFIG);

    // Error handling
    if (response.data.status !== 200) {
      throw new Error(response.data.message || "Failed to fetch forums");
    }

    // Data transformation
    return response.data.data.map(forum => ({
      ...forum,
      lastActivity: forum.updatedAt || forum.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to connect to forum server");
    }
    throw error;
  }
};
```

#### **Mutations**
```typescript
// Create forum
export const createForum = async (forumData: CreateForumRequest): Promise<Forum> => {
  const response = await axios.post(API_ENDPOINTS.FORUMS, forumData, API_CONFIG);

  if (response.data.status < 200 || response.data.status >= 300) {
    throw new Error(response.data.message || "Failed to create forum");
  }

  return response.data.data;
};

// Update forum
export const updateForum = async (id: string, forumData: UpdateForumRequest): Promise<Forum> => {
  const response = await axios.patch(API_ENDPOINTS.FORUM_BY_ID(id), forumData, API_CONFIG);

  if (response.data.status < 200 || response.data.status >= 300) {
    throw new Error(response.data.message || "Failed to update forum");
  }

  return response.data.data;
};
```

#### **React Query Integration**
```typescript
export const getForumsQueryOptions = () => {
  return queryOptions({
    queryKey: ["forums"],
    queryFn: getForums,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCreateForum = () => {
  return useMutation({
    mutationFn: createForum,
    onSuccess: () => {
      // Invalidate cache to refresh forum list
      queryClient.invalidateQueries({ queryKey: ["forums"] });
    },
  });
};
```

## 🪝 Hooks Layer

### File: `src/hooks/useForums.ts`

#### **Custom Hook Implementation**
```typescript
import { useQuery } from "@tanstack/react-query";
import { getForumsQueryOptions } from "@/api/forums";
import type { Forum } from "@/api/forums";

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

export type UseForumsReturn = ReturnType<typeof useForums>;
```

#### **Hook Features**
- **Automatic caching**: 5 minutes cache duration
- **Background refetch**: Auto refresh data saat stale
- **Error handling**: Built-in error states
- **Loading states**: Loading indicators
- **Type safety**: Strong TypeScript typing

## 🎨 UI Layer

### File: `src/app/forum/page.tsx`

#### **Component Structure**
```typescript
export default function ForumPage() {
  // Custom hooks untuk data fetching
  const { data: forums = fallbackForums, isLoading, error, refetch } = useForums();

  // UI state management
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingForum, setEditingForum] = useState<Forum | null>(null);

  // Toast notifications
  const { toast, showSuccess, dismissToast } = useToast();

  // Event handlers
  const handleCreateForum = () => setIsCreateDrawerOpen(true);
  const handleEditForum = (forum: Forum) => setEditingForum(forum);
  const handleCloseDrawer = () => {
    setIsCreateDrawerOpen(false);
    setEditingForum(null);
  };
}
```

#### **Fallback Data**
```typescript
// Fallback data jika API gagal
const fallbackForums: Forum[] = [
  {
    id: "1",
    title: "Pengembangan Web Fundamental",
    description: "Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.",
    type: "course",
    lastActivity: "2023-10-28T10:30:00Z",
    totalTopics: 42,
  },
  // ... more fallback data
];
```

#### **Error Handling UI**
```typescript
{error && (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-red-800">Gagal memuat forum</h3>
        <p className="text-sm text-red-600 mt-1">{error.message}</p>
      </div>
      <button
        onClick={() => refetch()}
        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  </div>
)}
```

### File: `src/components/shared/ForumList/ForumList.tsx`

#### **Props Interface**
```typescript
interface ForumListContainerProps {
  forums: Forum[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  enableFilter?: boolean;
  isLoading?: boolean;
  onEditForum?: (forum: Forum) => void;
}
```

#### **Component Usage**
```typescript
<ForumListContainer
  forums={forums}           // ← Data dari useForums hook
  showSearch={true}
  searchPlaceholder="Cari forum berdasarkan judul atau deskripsi..."
  enableFilter={true}
  isLoading={isLoading}     // ← Loading state dari hook
  onEditForum={handleEditForum}
/>
```

## 🔄 Complete Data Flow

### **Initialization Flow**
```
1. Component Mounts
   ↓
2. useForums() Hook Called
   ↓
3. useQuery() Checks Cache
   ↓
4. Cache Miss → API Call
   ↓
5. axios.get('/api/forums')
   ↓
6. Backend Processing
   ↓
7. Database Query
   ↓
8. Response: { data: [], status: 200 }
   ↓
9. Data Transformation
   ↓
10. Cache Storage (5 min)
   ↓
11. UI Update with Forums Data
```

### **User Interaction Flow**
```
User Action → Event Handler → State Update → UI Re-render

Examples:
- Click "Buat Forum" → handleCreateForum() → setIsCreateDrawerOpen(true) → Drawer Opens
- Click Edit Forum → handleEditForum(forum) → setEditingForum(forum) → Edit Drawer Opens
- Click Refresh → refetch() → useQuery() → API Call → Cache Update → UI Refresh
```

### **Error Handling Flow**
```
API Error → Catch Block → Error Object → useQuery Error State → UI Error Display

Error Types:
- Network Error: "Failed to connect to forum server"
- Server Error: API response message
- Validation Error: Custom error messages
```

### **Cache Management Flow**
```
Data Request → Check Cache
├─ Cache Hit → Return Cached Data (5 min stale time)
└─ Cache Miss → API Call → Store in Cache → Return Data

Cache Invalidation:
- Manual: refetch()
- Automatic: After mutations (create/update)
- Background: When data becomes stale
```

## 📊 Data Transformation

### **API Response → Forum Type**
```typescript
// API Response
{
  "data": [
    {
      "id": "1",
      "title": "Pengembangan Web",
      "description": "Diskusi...",
      "type": "course",
      "createdAt": "2023-10-28T10:30:00Z",
      "updatedAt": "2023-10-28T12:00:00Z"
    }
  ],
  "status": 200,
  "message": "Success",
  "success": true
}

// Transformed Forum Type
{
  id: "1",
  title: "Pengembangan Web",
  description: "Diskusi...",
  type: "course",
  lastActivity: "2023-10-28T12:00:00Z", // ← updatedAt
  totalTopics: 0, // ← Default value
  createdAt: "2023-10-28T10:30:00Z",
  updatedAt: "2023-10-28T12:00:00Z"
}
```

## 🎯 Best Practices Implemented

### **1. Separation of Concerns**
- **API Layer**: Data fetching and transformation
- **Hooks Layer**: State management and caching
- **UI Layer**: Component rendering and user interactions

### **2. Error Handling**
- Graceful fallback with skeleton states
- User-friendly error messages
- Retry mechanisms for failed requests

### **3. Performance Optimization**
- 5-minute cache duration
- Background refetching
- Optimistic updates for mutations

### **4. Type Safety**
- Strong TypeScript types throughout
- Type-safe API responses
- Type-safe component props

### **5. User Experience**
- Loading skeletons for perceived performance
- Toast notifications for user feedback
- Fallback data for resilience

## 🔧 Configuration

### **API Configuration**
```typescript
// src/config/api.ts
export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  FORUMS: '/api/forums',
  FORUM_BY_ID: (id: string) => `/api/forums/${id}`,
};
```

### **Query Configuration**
```typescript
// src/api/forums.ts
export const getForumsQueryOptions = () => {
  return queryOptions({
    queryKey: ["forums"],
    queryFn: getForums,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

---

## 📚 Summary

Alur data daftar forum mengikuti pola yang sederhana namun efektif:

1. **API Layer**: Menangani HTTP requests dan data transformation
2. **Hooks Layer**: Mengelola state, caching, dan error handling
3. **UI Layer**: Menampilkan data dan menangani interaksi user

Dengan implementasi ini, aplikasi memiliki performansi yang baik, error handling yang robust, dan user experience yang smooth untuk menampilkan daftar forum.