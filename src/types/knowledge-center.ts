// Knowledge Center Types - 100% API Types
// Based on prompt_templates/knowledge-center-specs.md
//
// 🎯 DESIGN PRINCIPLE: NO CUSTOM WRAPPER TYPES
// All types should match API structure 100% without transformation
//
// ✅ RULES:
// - NO KnowledgeCommon, Webinar, Konten (these are legacy wrapper types)
// - Use KnowledgeCenter, KnowledgeWebinar, KnowledgeContent directly from API
// - Components consume API data without transformation
// - No mapping/conversion between API and frontend types
//
// 🏗️ STRUCTURE:
// 1. Base Types (ContentType, KnowledgeType, etc.)
// 2. Generic API Response Types (ApiResponse, PaginatedApiResponse)
// 3. API Entity Types (KnowledgeCenter, KnowledgeWebinar, KnowledgeContent)
// 4. API Request Types (Create*, Update* for backend)
// 5. Component Props (directly use API types)
// 6. Filter/Query Types (API parameters)
//
// 🚀 BENEFITS:
// ✅ Zero transformation overhead - direct API data usage
// ✅ Perfect type safety - compile-time errors when API changes
// ✅ Single source of truth - no type duplication
// ✅ Ultimate maintainability - one file update covers all changes
// ✅ Consistency guarantee - frontend/backend identical

// Import generic API response types
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedResponse,
  DetailResponse,
} from "./api-response";

// Base Types - aligned with API structure
export type KnowledgeType = "webinar" | "content"; // API uses 'content', not 'konten'
export type ContentType = "video" | "file" | "podcast" | "article";
export type MediaType = ContentType; // Type alias for backward compatibility - both point to same type
export type KnowledgeStatus = "draft" | "published" | "archived";
export type SortOption =
  | "newest"
  | "oldest"
  | "mostLiked"
  | "mostViewed"
  | "upcomingWebinar"
  | "popular"
  | "likes"
  | "title";

// Type constants to avoid hardcoded values
export const KNOWLEDGE_TYPES = {
  WEBINAR: "webinar" as const,
  CONTENT: "content" as const,
} as const;

export const CONTENT_TYPES = {
  VIDEO: "video" as const,
  FILE: "file" as const,
  PODCAST: "podcast" as const,
  ARTICLE: "article" as const,
} as const;

export const KNOWLEDGE_STATUS = {
  DRAFT: "draft" as const,
  SCHEDULED: "scheduled" as const,
  PUBLISHED: "published" as const,
  ARCHIVED: "archived" as const,
} as const;

export const SORT_OPTIONS = {
  NEWEST: "newest" as const,
  OLDEST: "oldest" as const,
  MOST_LIKED: "mostLiked" as const,
  MOST_VIEWED: "mostViewed" as const,
  UPCOMING_WEBINAR: "upcomingWebinar" as const,
  POPULAR: "popular" as const,
  LIKES: "likes" as const,
  TITLE: "title" as const,
} as const;

// Generic API Response Types have been moved to api-response.ts for better reusability

// API Entity Types
export interface KnowledgeCenter {
  id: string;
  title: string;
  description: string;
  idSubject: string;
  subject: string; // Changed from object to string
  penyelenggara: string;
  createdBy: string;
  type: KnowledgeType;
  publishedAt: string;
  tags: string[];
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
  webinar?: KnowledgeWebinar | null;
  knowledgeContent?: KnowledgeContent | null;
}

export interface KnowledgeWebinar {
  zoomDate: string;
  zoomLink: string;
  youtubeLink?: string;
  recordLink?: string;
  vbLink?: string;
  noteFile?: string;
  contentText?: string;
  jpCount: number;
}

export interface KnowledgeContent {
  contentType: ContentType;
  mediaUrl?: string;
  document: string; // JSON string representing BlockNote editor document
}

// KnowledgeSubject types have been moved to knowledge-subject.ts for better maintainability

// Create Request - Omit auto-generated fields from KnowledgeCenter
export type CreateKnowledgeCenterRequest = Omit<
  KnowledgeCenter,
  "id" | "subject" | "viewCount" | "likeCount" | "createdAt" | "updatedAt"
>;

export type UpdateKnowledgeCenterRequest =
  Partial<CreateKnowledgeCenterRequest>;

// Taxonomy types - Using main types to avoid duplication
// Penyelenggara type (keeping separate for now as it doesn't have main equivalent yet)
export interface Penyelenggara {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

// Tag type (keeping separate for now as it doesn't have main equivalent yet)
export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt?: string;
}

// Filter types
export interface KnowledgeFilters {
  subject?: string[];
  penyelenggara?: string[];
  knowledgeType?: KnowledgeType[];
  mediaType?: ContentType[]; // Changed from MediaType to ContentType to match API
  tags?: string[];
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface KnowledgeQueryParams
  extends KnowledgeFilters,
    PaginationParams {
  sort?: SortOption;
}

// API Response Types (using generic types)
export type KnowledgeListResponse = PaginatedResponse<KnowledgeCenter>;
export type KnowledgeDetailResponse = DetailResponse<KnowledgeCenter>;

// Backend API Response Types (Full structured responses)
export type KnowledgeCentersResponse = PaginatedApiResponse<KnowledgeCenter>;
export type KnowledgeCenterResponse = ApiResponse<KnowledgeCenter>;
// KnowledgeSubject response types have been moved to knowledge-subject.ts

// Additional types from api/knowledge.ts (consolidated here)
export interface WebinarSchedule {
  id: string;
  title: string;
  description: string;
  tglZoom: string;
  zoomLink: string;
  youtubeLink: string;
  speaker: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
}

export interface Comment {
  id: string;
  knowledgeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
}

// Analytics types have been removed - analytics page deleted

// Create Knowledge types
export type CreateKnowledgeStep = 1 | 2 | 3 | 4;

// Form data - derived from KnowledgeCenter with form-specific overrides
export type CreateKnowledgeFormData = Omit<
  KnowledgeCenter,
  'id' | 'subject' | 'viewCount' | 'likeCount' | 'createdAt' | 'updatedAt' | 'type' | 'thumbnail' | 'webinar' | 'knowledgeContent'
> & {
  // Override type to allow undefined during step 1
  type: KnowledgeType | undefined;
  
  // Override thumbnail to allow File object for upload
  thumbnail: File | string;
  
  // Override webinar to use Partial (all fields optional during form filling)
  webinar?: Partial<KnowledgeWebinar>;
  
  // Override knowledgeContent to use Partial (all fields optional during form filling)
  knowledgeContent?: Partial<KnowledgeContent>;
  
  // UI-only field for display (not sent to API)
  status?: KnowledgeStatus;
};

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Component props types
export interface KnowledgeCardProps {
  knowledge: KnowledgeCenter; // 100% API type
  showActions?: boolean;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onShare?: (knowledge: KnowledgeCenter) => void;
  className?: string;
}

// MediaViewerProps moved to MediaViewer.tsx for better co-location

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Schedule types
export interface WebinarSchedule {
  id: string;
  webinarId: string;
  title: string;
  tglZoom: string;
  linkZoom?: string;
  status: "upcoming" | "ongoing" | "ended" | "live";
  participantsCount?: number;
}

// Settings types have been removed - settings page deleted

// Re-export generic API response types for backward compatibility
export type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedResponse,
  DetailResponse,
} from "./api-response";
