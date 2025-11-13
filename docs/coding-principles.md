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

## 10. Implementation Examples

### **Entity-Based Hook Pattern**
```tsx
// ✅ Benar: Hook berdasarkan entitas
export function useForum(id: string) {
  return useQuery({
    queryKey: ['forum', id],
    queryFn: () => fetchForum(id)
  });
}

export function useKnowledge(params: KnowledgeQueryParams) {
  return useQuery({
    queryKey: ['knowledge-centers', params],
    queryFn: () => fetchKnowledgeCenters(params)
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

## 11. Type System Principles

### 🎯 Filosofi Tipe: API-First TypeScript

**Desain Principle**: **100% API Types - Tanpa Custom Wrapper Types**

Semua types harus mencerminkan struktur API persis tanpa transformasi. Frontend dan backend harus menggunakan struktur identik.

### ✅ Aturan Type System

#### 1. **No Custom Wrapper Types**
- ❌ **DILARANG**: Membuat tipe wrapper seperti `KnowledgeCommon`, `Webinar`, `Konten`
- ✅ **WAJIB**: Gunakan tipe API langsung: `KnowledgeCenter`, `KnowledgeWebinar`, `KnowledgeContent`
- **Alasan**: Menghindari transformasi data dan overhead mapping

#### 2. **Structure Alignment**
```typescript
// ✅ Benar: Langsung dari API structure
export interface KnowledgeCenter {
  id: string;
  createdBy: string;
  idSubject: string;
  title: string;
  // ... sesuai API response
}

// ❌ Salah: Custom wrapper
interface KnowledgeCommon {
  data: KnowledgeCenter; // Tidak perlu wrapper
  metadata: KnowledgeMeta; // Tidak perlu extra layer
}
```

#### 3. **Generic API Response Types**
Gunakan tipe response generik yang reusable:
```typescript
// ✅ Benar: Generic response types
export type KnowledgeListResponse = PaginatedApiResponse<KnowledgeCenter>;
export type KnowledgeDetailResponse = ApiResponse<KnowledgeCenter>;

// ❌ Salah: Specific response types
interface KnowledgeListResponse {
  success: boolean;
  data: KnowledgeCenter[];
  // ... duplikasi structure
}
```

### 🏗️ Type Structure Hierarchy

#### **Layer 1: Base Types**
```typescript
export type KnowledgeType = 'webinar' | 'content';
export type ContentType = 'video' | 'file' | 'podcast' | 'article';
export type KnowledgeStatus = 'draft' | 'scheduled' | 'published' | 'archived';
```

#### **Layer 2: Entity Types**
```typescript
// 100% API structure
export interface KnowledgeCenter {
  id: string;
  createdBy: string;
  idSubject: string;
  subject?: string; // API response field
  title: string;
  webinar?: KnowledgeWebinar | null;
  knowledgeContent?: KnowledgeContent | null;
}
```

#### **Layer 3: Request/Response Types**
```typescript
// API request types
export type CreateKnowledgeCenterRequest = Omit<KnowledgeCenter, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateKnowledgeCenterRequest = Partial<CreateKnowledgeCenterRequest>;

// Generic response types
export type KnowledgeListResponse = PaginatedApiResponse<KnowledgeCenter>;
```

#### **Layer 4: Component Props**
```typescript
// Langsung gunakan API types
export interface KnowledgeCardProps {
  knowledge: KnowledgeCenter; // 100% API type
  showActions?: boolean;
}
```

### 🚀 Benefits Approach

#### **Zero Transformation Overhead**
```typescript
// ✅ Benar: Direct API data usage
const { data: knowledge } = useKnowledgeDetail(id);
return <KnowledgeCard knowledge={knowledge} />; // Langsung passing

// ❌ Salah: Transformasi tidak perlu
const transformedData = transformApiData(knowledge); // Tidak perlu!
return <KnowledgeCard knowledge={transformedData} />;
```

#### **Perfect Type Safety**
```typescript
// ✅ Compile-time error saat API berubah
const { data: knowledge } = useQuery(['knowledge'], fetchKnowledge);
knowledge.newField; // Error jika field tidak ada di API
```

### 📁 File Organization

#### **Domain-Based Type Files**
```
src/types/
├── api-response.ts          # Generic API response types (reusable)
├── knowledge-center.ts      # Knowledge Center domain types
├── knowledge-subject.ts     # Knowledge Subject domain types
├── index.ts                 # Barrel exports
└── forum.ts                 # Forum domain types
```

#### **Principle Separation**
- **api-response.ts**: Generic types reusable across domains
- **Domain files**: Specific types untuk setiap entitas domain
- **index.ts**: Centralized exports untuk clean imports

### 🔧 Type Patterns

#### **1. Constants for Type Safety**
```typescript
export const KNOWLEDGE_TYPES = {
  WEBINAR: 'webinar' as const,
  CONTENT: 'content' as const,
} as const;

// Usage dengan type safety
function handleKnowledgeType(type: KnowledgeType) {
  if (type === KNOWLEDGE_TYPES.WEBINAR) {
    // Type narrowing otomatis
  }
}
```

#### **2. Generic Response Composition**
```typescript
// ✅ Benar: Generic composition
export type KnowledgeSubjectsResponse = PaginatedApiResponse<KnowledgeSubject>;

// ✅ Benar: Specialized response types
export type SearchResponse<T> = ApiResponse<T> & {
  searchMeta: SearchMetadata;
};
```

#### **3. Form Data Types**
```typescript
// ✅ Benar: Separate form data from API types
export interface CreateKnowledgeFormData {
  // API fields
  title: string;
  description: string;

  // UI-only fields
  thumbnail?: File | string; // Bisa File object atau URL string
  tags?: string[]; // Display only, API belum support

  // Optional API fields dengan validasi form
  webinar?: Partial<KnowledgeWebinar>;
}
```

### ⚡ Implementation Examples

#### **Complete Type Flow**
```typescript
// 1. API Layer
export interface KnowledgeCenter {
  id: string;
  title: string;
  // ... 100% API structure
}

// 2. Hook Layer
export function useKnowledgeList(params: KnowledgeQueryParams) {
  return useQuery({
    queryKey: ['knowledge', params],
    queryFn: () => knowledgeApi.getList(params),
  });
}

// 3. Component Layer
export default function KnowledgePage() {
  const { data: knowledgeList } = useKnowledgeList({ subject: ['tech'] });

  return (
    <KnowledgeGrid>
      {knowledgeList?.data.map(knowledge => (
        <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
      ))}
    </KnowledgeGrid>
  );
}
```

#### **Error Handling Types**
```typescript
// ✅ Benar: Generic error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
  }
}

// Usage dalam hooks
export function useKnowledgeDetail(id: string) {
  return useQuery({
    queryKey: ['knowledge', id],
    queryFn: () => knowledgeApi.getById(id),
    onError: (error) => {
      if (error instanceof ApiError) {
        // Type-safe error handling
      }
    },
  });
}
```

### 🎯 Type Quality Checklist

#### **Sebelum Commit Type Definitions:**
- [ ] Tipe mencerminkan 100% struktur API
- [ ] Tidak ada custom wrapper types
- [ ] Gunakan generic response types untuk konsistensi
- [ ] Export types dengan proper naming
- [ ] Include proper JSDoc comments untuk complex types
- [ ] Separate domain types ke dedicated files

#### **Runtime Type Safety:**
- [ ] Gunakan type guards untuk API response validation
- [ ] Handle optional fields dengan proper null checks
- [ ] Implement proper error types untuk API failures
- [ ] Validate form data sebelum API calls

---

**Ingat**: Kode yang baik adalah kode yang sederhana, mudah dipahami, dan efektif menyelesaikan masalah.

## 12. Knowledge Center Create Implementation

### 🎯 Wizard Form Pattern dengan TanStack Form

**Filosofi**: Multi-step form dengan progressive validation dan clean state management

#### **Architecture Overview**
```
Page Component → Business Logic Hook → Wizard Form Hook → TanStack Form
     ↓                    ↓                   ↓              ↓
  UI Logic         API Calls         Step Management    Form State
```

#### **1. Page Component - Pure UI Logic**
```tsx
// ✅ Benar: Page hanya handle UI orchestration
export default function CreateKnowledgePage() {
  const wizard = useKnowledgeWizardForm(); // Form state management
  const businessLogic = useCreateKnowledgePage({ // Business logic extraction
    wizard,
    router,
    onSuccess: toastState.showSuccess,
    onError: toastState.showError,
  });

  // Pure UI rendering dengan step-based components
  return (
    <div className="wizard-layout">
      <WizardHeader currentStep={wizard.currentStep} />
      <WizardSidebar steps={steps} currentStep={wizard.currentStep} />
      
      {/* Step-based rendering */}
      {wizard.currentStep === 1 && <KnowledgeTypeSelector wizard={wizard} />}
      {wizard.currentStep === 2 && <BasicInfoForm wizard={wizard} />}
      {wizard.currentStep === 3 && <ContentDetailsForm wizard={wizard} />}
      {wizard.currentStep === 4 && <ReviewStep wizard={wizard} />}
      
      <WizardActions 
        wizard={wizard}
        onNext={businessLogic.handleNextStep}
        onSubmit={businessLogic.handleSubmit}
      />
    </div>
  );
}
```

#### **2. Business Logic Hook - API & Navigation**
```tsx
// ✅ Benar: Business logic terpisah dari UI
export const useCreateKnowledgePage = ({ wizard, router, onSuccess, onError }) => {
  const createMutation = useMutation({
    mutationFn: knowledgeCenterApi.createKnowledgeCenter,
    onSuccess: (data) => {
      onSuccess('Knowledge center created successfully!');
      router.push(`/knowledge-center/${data.id}`);
    },
    onError: (error) => onError(error.message),
  });

  const handleSubmit = async (status: 'draft' | 'published') => {
    const isValid = await wizard.validateCurrentStep();
    if (!isValid) return;

    // Transform form data to API payload
    const apiData = transformFormDataToAPI(wizard.formValues, status, thumbnailUrl);
    await createMutation.mutateAsync(apiData);
  };

  return {
    handleNextStep: wizard.nextStep,
    handleSubmit,
    isCreating: createMutation.isPending,
  };
};
```

#### **3. Wizard Form Hook - State Management**
```tsx
// ✅ Benar: TanStack Form dengan progressive validation
export const useKnowledgeWizardForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
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
      // Set field errors declaratively
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

  return {
    form,
    currentStep,
    formValues: form.state.values,
    nextStep: async () => {
      const isValid = await validateCurrentStep();
      if (isValid) setCurrentStep(prev => Math.min(prev + 1, 4));
    },
    validateCurrentStep,
  };
};
```

#### **4. Component Composition Pattern**
```tsx
// ✅ Benar: Sub-component dengan clear responsibilities
export default function ContentDetailsForm({ wizard }) {
  const { currentType } = wizard;

  // Conditional rendering berdasarkan content type
  if (currentType === KNOWLEDGE_TYPES.WEBINAR) {
    return <WebinarDetailsForm wizard={wizard} />;
  }

  if (currentType === KNOWLEDGE_TYPES.CONTENT) {
    return <GeneralContentForm wizard={wizard} />;
  }

  return null;
}

// Sub-component dengan focused responsibility
export default function GeneralContentForm({ wizard }) {
  return (
    <wizard.form.Subscribe selector={(state) => state.values.knowledgeContent?.contentType}>
      {(selectedContentType) => {
        if (!selectedContentType) {
          return <ContentTypeSelector onSelect={handleContentTypeSelect} />;
        }

        return (
          <div className="space-y-6">
            <ContentTypeHeader contentType={selectedContentType} />
            <MediaUploadField wizard={wizard} />
            <BlockNoteEditor wizard={wizard} />
          </div>
        );
      }}
    </wizard.form.Subscribe>
  );
}
```

#### **5. Data Transformation Layer**
```tsx
// ✅ Benar: Business logic terpisah di utility functions
export const transformFormDataToAPI = (
  formValues: CreateKnowledgeFormData,
  status: 'draft' | 'published',
  thumbnailUrl: string
): CreateKnowledgeCenterRequest => {
  const apiData: CreateKnowledgeCenterRequest = {
    // Base fields
    createdBy: formValues.createdBy,
    title: formValues.title,
    type: formValues.type!,
    isFinal: status === 'published',
  };

  // Conditional data berdasarkan type
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
      mediaUrl: formValues.knowledgeContent.mediaUrl ? 
        encodeMediaUrl(formValues.knowledgeContent.mediaUrl) : undefined,
    };
  }

  return apiData;
};
```

### 🎯 Key Benefits Pattern Ini

#### **1. Separation of Concerns**
- **Page**: UI orchestration dan layout
- **Business Hook**: API calls dan navigation logic
- **Wizard Hook**: Form state dan validation
- **Transform**: Data transformation logic

#### **2. Progressive Validation**
- Step-by-step validation dengan Zod schemas
- Real-time field validation
- Declarative error handling

#### **3. Type Safety**
- 100% TypeScript dengan proper inference
- Form data types yang match API structure
- Compile-time validation

#### **4. Reusable Components**
- Sub-components dengan clear interfaces
- Composable wizard steps
- Shared form utilities

#### **5. Performance Optimization**
- Memoized form values
- Efficient re-rendering dengan Subscribe
- Proper dependency arrays

---