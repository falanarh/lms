# Knowledge Hub Refactoring Documentation

## Overview

Refactoring Knowledge Hub untuk mengikuti prinsip-prinsip coding yang telah ditetapkan dalam `coding-principles.md` dan `data-management-flow.md`.

## Sebelum Refactoring

### Masalah:
1. **File terlalu besar**: Halaman utama knowledge center memiliki 664 baris kode
2. **Logic bisnis campur aduk**: UI logic dan business logic tidak terpisah
3. **Tidak mengikuti pattern**: Tidak mengikuti pattern API → Hooks → UI
4. **Sulit dimaintain**: Komponen besar sulit untuk di-testing dan dimodifikasi
5. **Tidak reusable**: Logic yang terpisah tidak bisa digunakan kembali

### Struktur Lama:
```
src/app/knowledge-center/page.tsx (664 baris)
├── UI State Management
├── Business Logic
├── API Calls (inline)
├── Data Transformation
├── Hero Section
├── Stats Section
├── Knowledge Grid
├── Popular Carousel
└── Create Button
```

## Setelah Refactoring

### Peningkatan:
1. **Pemisahan yang jelas**: UI logic dan business logic terpisah
2. **Pattern yang konsisten**: Mengikuti API → Hooks → UI pattern
3. **Komponen kecil**: Setiap komponen memiliki tanggung jawab tunggal
4. **Reusability**: Logic dapat digunakan kembali di berbagai komponen
5. **Maintainability**: Mudah untuk testing dan modifikasi

### Struktur Baru:

#### 1. API Layer (`src/api/knowledge.ts`)
- **Dummy data generator**: 50 knowledge items, 10 webinar schedules, analytics data
- **API functions**: fetchKnowledge, createKnowledge, updateKnowledge, deleteKnowledge
- **Query options**: React Query configuration dengan caching yang tepat
- **Type definitions**: Strong typing untuk semua API responses

```typescript
// Contoh API function
export const knowledgeApi = {
  async fetchKnowledge(params: KnowledgeQueryParams = {}): Promise<KnowledgeResponse> {
    // Simulasi API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // Logic filtering, sorting, dan pagination
    return transformedData;
  }
};
```

#### 2. Custom Hooks (`src/hooks/useKnowledge.ts`)
- **Entity-based hooks**: `useKnowledge`, `useWebinarSchedule`, `useKnowledgeAnalytics`
- **Utility hooks**: `usePopularKnowledge`, `useUpcomingWebinars`, `useKnowledgeCategories`
- **Mutation hooks**: `useCreateKnowledge`, `useUpdateKnowledge`, `useDeleteKnowledge`
- **State management hooks**: `useKnowledgeFilters`, `useKnowledgePagination`

```typescript
// Contoh custom hook
export function useKnowledge(params: KnowledgeQueryParams = {}) {
  const { data, isLoading, error, refetch } = useQuery(getKnowledgeQueryOptions(params));

  return {
    data: data?.data || [],
    total: data?.total || 0,
    // ... transformed data
  };
}
```

#### 3. Komponen UI (Breaking down large components):

##### a. KnowledgeHero (`src/components/knowledge-center/KnowledgeHero.tsx`)
- **Tanggung jawab**: Hero section dengan search dan filter pills
- **Props**: searchQuery, onSearchChange, selectedType, onTypeChange
- **Dependencies**: `useUpcomingWebinars`, `useKnowledgeCategories`
- **Size**: 200 baris (dari 300+ baris sebelumnya)

##### b. KnowledgeStats (`src/components/knowledge-center/KnowledgeStats.tsx`)
- **Tanggung jawab**: Statistics cards dengan animasi
- **Dependencies**: `useKnowledgeStats`
- **Size**: 150 baris

##### c. KnowledgeGrid (`src/components/knowledge-center/KnowledgeGrid.tsx`)
- **Tanggung jawab**: Main content grid dengan search, filter, dan pagination
- **Props**: searchQuery, selectedType, selectedCategory, sortBy, categories
- **Dependencies**: `useKnowledge`
- **Size**: 250 baris

##### d. PopularCarousel (`src/components/knowledge-center/PopularCarousel.tsx`)
- **Tanggung jawab**: Auto-scroll carousel untuk popular knowledge
- **Dependencies**: `usePopularKnowledge`
- **Size**: 180 baris

##### e. UpcomingWebinars (`src/components/knowledge-center/UpcomingWebinars.tsx`)
- **Tanggung jawab**: Upcoming webinars listing
- **Dependencies**: `useUpcomingWebinars`
- **Size**: 80 baris

##### f. CreateKnowledgeButton (`src/components/knowledge-center/CreateKnowledgeButton.tsx`)
- **Tanggung jawab**: Floating create button dengan animasi
- **Size**: 20 baris

#### 4. Halaman Utama (`src/app/knowledge-center/page.tsx`)
- **Tanggung jawab**: Hanya UI state management dan orchestration
- **Size**: 77 baris (dari 664 baris sebelumnya!)
- **Logic**: Murni UI handlers dan state management

```typescript
export default function KnowledgeCenterPage() {
  // UI State Management saja
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<KnowledgeType | 'all'>('all');

  // UI Handlers
  const handleSearchChange = (query: string) => setSearchQuery(query);

  return (
    <div>
      <KnowledgeHero {...heroProps} />
      <KnowledgeStats />
      <KnowledgeGrid {...gridProps} />
      <PopularCarousel />
      <CreateKnowledgeButton />
    </div>
  );
}
```

## Pattern Implementation

### 1. API → Hooks → UI Pattern
```
Server (Dummy Data) → API Layer → Custom Hooks → UI Components → Page
```

- **API Layer**: Data fetching, transformation, error handling
- **Hooks Layer**: State management, caching, business logic
- **UI Layer**: Pure presentation, user interactions

### 2. Entity-Based Hooks
- ✅ `useKnowledge` - Main knowledge entity
- ✅ `useWebinarSchedule` - Webinar schedule entity
- ✅ `useKnowledgeAnalytics` - Analytics entity
- ✅ `useUpcomingWebinars` - Utility hook (specific use case)
- ❌ Tidak ada hooks seperti `useToast` atau `useVoting` (bukan entitas)

### 3. Separation of Concerns
- **Page Components**: Hanya UI logic dan orchestration
- **Custom Hooks**: Business logic dan data fetching
- **API Functions**: Data transformation dan server communication
- **UI Components**: Pure presentation

## Benefits

### 1. Maintainability
- **Single Responsibility**: Setiap komponen memiliki satu tanggung jawab
- **Easy Testing**: Logic terisolasi memudahkan unit testing
- **Clear Dependencies**: Dependencies jelas dan terdokumentasi

### 2. Reusability
- **Cross-component usage**: Hooks dapat digunakan di berbagai komponen
- **Consistent data source**: Single source of truth untuk setiap entitas
- **Modular architecture**: Komponen dapat digunakan kembali

### 3. Performance
- **Optimized caching**: React Query dengan staleTime yang tepat
- **Lazy loading**: Komponen dapat di-load sesuai kebutuhan
- **Memoization**: Data transformation di-layer yang tepat

### 4. Developer Experience
- **Type safety**: Strong typing di seluruh stack
- **Clear structure**: Mudah untuk navigate dan understand codebase
- **Consistent patterns**: Predicable behavior across features

## File Structure Summary

```
src/
├── api/
│   └── knowledge.ts                    # API layer dengan dummy data
├── hooks/
│   └── useKnowledge.ts                 # Entity-based custom hooks
├── components/knowledge-center/
│   ├── index.ts                        # Centralized exports
│   ├── KnowledgeHero.tsx               # Hero section (200 baris)
│   ├── KnowledgeStats.tsx              # Statistics section (150 baris)
│   ├── KnowledgeGrid.tsx               # Main grid (250 baris)
│   ├── PopularCarousel.tsx             # Auto-scroll carousel (180 baris)
│   ├── UpcomingWebinars.tsx            # Upcoming webinars (80 baris)
│   └── CreateKnowledgeButton.tsx       # Floating button (20 baris)
└── app/knowledge-center/
    └── page.tsx                        # Main page (77 baris)
```

## Total Lines Reduction

- **Sebelum**: 664 baris (1 file besar)
- **Setelah**: 957 baris (6 file terdistribusi)
- **Efektifitas**: File utama berkurang **88%** (664 → 77 baris)
- **Maintainability**: Meningkat drastis dengan modular structure

## Usage Examples

### Using the refactored components:
```typescript
// Di halaman lain, tinggal import komponen yang dibutuhkan
import { KnowledgeGrid, KnowledgeStats } from '@/components/knowledge-center';
import { useKnowledge, useKnowledgeStats } from '@/hooks/useKnowledge';

function CustomKnowledgePage() {
  const { data, isLoading } = useKnowledge({ sort: 'most_liked' });
  const { stats } = useKnowledgeStats();

  return (
    <div>
      <KnowledgeStats />
      <KnowledgeGrid data={data} loading={isLoading} />
    </div>
  );
}
```

### Adding new features:
```typescript
// Custom hook untuk fitur baru
export function useTrendingKnowledge(days: number = 7) {
  return useKnowledge({
    sort: 'popular',
    limit: 5,
  });
}

// Komponen baru dapat menggunakan hooks yang sudah ada
function TrendingSection() {
  const { data } = useTrendingKnowledge();
  // ... render logic
}
```

## Conclusion

Refactoring ini berhasil:
1. ✅ **Memecah komponen besar** menjadi komponen yang lebih kecil dan fokus
2. ✅ **Memisahkan UI logic dan business logic** dengan pattern yang jelas
3. ✅ **Mengikuti coding principles** yang sudah ditetapkan
4. ✅ **Meningkatkan maintainability** dan reusability
5. ✅ **Menyediakan API layer dengan dummy data** untuk development

Knowledge Hub sekarang mengikuti arsitektur yang modern, scalable, dan maintainable sesuai dengan best practices yang telah ditetapkan.