# Prinsip dan Aturan Pembuatan Kode

## 1. Filosofi Utama

### Simplicity First
- **Utamakan kesederhanaan** dalam struktur dan alur pemrosesan data
- Buat kode yang mudah dipahami dan dipelihara
- Hindari over-engineering dan abstraksi yang tidak perlu

### Efektif dan Efisien
- Fokus pada solusi yang efektif untuk masalah yang ada
- Optimalkan performa tanpa mengorbankan keterbacaan
- Gunakan resources dengan bijak

## 2. Struktur Kode

### Page Components (Halaman)
- **Hanya bertanggung jawab atas logika UI saja**
- Tidak mengandung logika bisnis data
- Menggunakan custom hooks untuk mengakses data
- Mengelola state UI lokal (loading, error, form states)

### Custom Hooks (Berdasarkan Entitas)
- **Buat custom hooks berdasarkan entitas domain saja**
- Hanya buat hook untuk: `useForum`, `useTopic`, `useDiscussion`, dll.
- **Satu hook untuk satu entitas domain**
- **Jangan membuat hooks yang bukan nama entitas** (seperti `useToast`, `useVoting`, dll)
- **API → Hooks → UI Pattern**: Custom hooks bertindak sebagai layer antara API dan UI
- **Data fetching** menggunakan TanStack Query untuk caching dan error handling
- **State management** lokal untuk setiap entitas domain

### Business Logic & Utilities
- Dipisahkan dari UI components
- Diletakkan di dalam custom hooks (entitas-based) atau utility functions
- Fokus pada pemrosesan data dan interaksi API
- Logic yang general-purpose masuk ke `utils/`

## 3. Aturan Spesifik

### Naming Conventions
- Gunakan nama yang deskriptif dan jelas
- Konsisten dalam penamaan variables, functions, dan components
- Hindari singkatan yang tidak umum

### File Structure
- Kelompokkan file berdasarkan fitur/domain
- Pisahkan antara UI, logic, dan types
- Buat folder structure yang konsisten

### State Management
- Gunakan state lokal untuk UI-related state
- Gunakan global state hanya jika benar-benar diperlukan
- Optimalkan re-renders dengan proper dependency arrays

### Error Handling
- Selalu handle error dengan baik
- Tampilkan pesan error yang user-friendly
- Log error untuk debugging purposes

## 4. Best Practices

### Component Design
- Buat components yang reusable dan composable
- Gunakan props dengan bijak
- Hindari props drilling yang terlalu dalam

### API Integration
- Gunakan TanStack Query untuk data fetching
- Handle loading dan error states dengan proper
- Implement caching strategy yang tepat

### Performance
- Implement lazy loading jika diperlukan
- Gunakan memoization untuk computationally expensive operations
- Optimalkan bundle size

## 5. Code Quality

### Testing
- Tulis test untuk logic yang kritis
- Focus pada behavior testing
- Gunakan realistic test data

### Documentation
- Comment kode yang kompleks
- Document API contracts
- Buat README untuk komponen kompleks

### Code Review
- Review kode fokus pada clarity dan maintainability
- Pastikan kode mengikuti prinsip yang sudah ditetapkan
- Berikan constructive feedback

## 6. Contoh Implementasi

### ❌ Cara yang tidak direkomendasikan:
```tsx
// Page component dengan terlalu banyak logic
export default function ForumPage() {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Complex business logic di dalam page
  const handleComplexLogic = async () => {
    // ... 50 lines of complex logic
  };

  return <ForumComponent forums={forums} />;
}
```

### ✅ Cara yang direkomendasikan:
```tsx
// Page component yang fokus pada UI
export default function ForumPage() {
  const { data: forums, isLoading, error, refetch } = useForums();

  return (
    <div>
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {forums && <ForumList forums={forums} />}
    </div>
  );
}

// Custom hook entitas-based dengan API → Hooks → UI pattern
export function useForums() {
  const {
    data: forums = [],
    isLoading,
    error,
    refetch,
  } = useQuery(getForumsQueryOptions());

  return {
    data: forums,
    isLoading,
    error,
    refetch,
  };
}

// Utility hook untuk UI state management
export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showSuccess = (message: string) => setToast({ message, variant: 'success' });
  const showWarning = (message: string) => setToast({ message, variant: 'warning' });

  return { toast, showSuccess, showWarning };
}
```

## 7. Decision Making Guidelines

### Kapan membuat custom hook?
- **Entity-based hooks**: Hanya untuk entitas domain (`useForum`, `useTopic`, `useDiscussion`)
- Ketika logic perlu di-reuse di multiple components
- Ketika logic kompleks dan perlu dipisahkan dari UI
- Ketika perlu mengelola complex state dan data fetching

### Kapan membuat utility hook?
- **UI state management**: `useToast`, `useVoting`, `useModal`
- Logic sederhana yang tidak terkait entitas domain
- Cross-cutting concerns yang reusable

### Kapan menggunakan utility function?
- Untuk pure functions
- Untuk data transformation
- Untuk calculations
- Helper functions di `utils/`

### Kapan membuat component terpisah?
- Ketika UI perlu di-reuse
- Ketika component terlalu besar
- Ketika logic UI terlalu kompleks

## 8. API → Hooks → UI Pattern

### **Architecture Flow**
```
API Layer (data fetching) → Hooks Layer (state management) → UI Layer (components)
```

### **Implementation Pattern**
1. **API Layer**:
   - Endpoint definitions dan query functions
   - Type definitions dan error handling
   - React Query integration

2. **Hooks Layer**:
   - Entity-based hooks untuk data fetching
   - State management dan caching
   - Business logic separation

3. **UI Layer**:
   - Page components fokus pada UI logic
   - Component composition dan rendering
   - User interactions dan local state

## 9. Tools dan Libraries

### Recommended Stack:
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form (jika diperlukan)
- **Styling**: Tailwind CSS
- **Type Checking**: TypeScript
- **Testing**: Jest + React Testing Library

### Avoid:
- Terlalu banyak abstractions
- Custom solutions untuk masalah yang sudah solved
- Libraries yang tidak terlalu perlu

## 10. Forum Implementation Examples

### **Entity-Based Hook Pattern**
```tsx
// ✅ Benar: Hook berdasarkan entitas
export function useForum(id: string) {
  return useQuery({
    queryKey: ['forum', id],
    queryFn: () => fetchForum(id)
  });
}

export function useTopic(forumId: string) {
  return useQuery({
    queryKey: ['topics', forumId],
    queryFn: () => fetchTopics(forumId)
  });
}

// ❌ Salah: Hook bukan berdasarkan entitas
export function useForumActions() { // Harusnya di dalam useForum atau sebagai utility
  const [isLoading, setIsLoading] = useState(false);
  // ... complex logic
}
```

### **Utility Hook Pattern**
```tsx
// ✅ Benar: Utility hook untuk UI state management
export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showSuccess = (message: string) => setToast({ message, variant: 'success' });
  const dismiss = () => setToast(null);

  return { toast, showSuccess, dismiss };
}

// ✅ Benar: Utility hook untuk voting state
export function useVoting() {
  const [votes, setVotes] = useState<Record<string, VoteType>>({});

  const handleVote = (id: string, type: VoteType) => {
    setVotes(prev => ({ ...prev, [id]: type }));
  };

  return { votes, handleVote };
}
```

### **Complete Data Flow Example**
```tsx
// API Layer
export const getForums = async (): Promise<Forum[]> => {
  const response = await axios.get('/api/forums');
  return response.data.data;
};

// Hooks Layer
export function useForums() {
  return useQuery({
    queryKey: ['forums'],
    queryFn: getForums,
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });
}

// UI Layer
export default function ForumPage() {
  const { data: forums, isLoading, error } = useForums();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return <ForumList forums={forums} />;
}
```

---

**Ingat**: Kode yang baik adalah kode yang sederhana, mudah dipahami, dan efektif menyelesaikan masalah.