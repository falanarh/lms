/**
 * Types Barrel Exports
 *
 * Centralized exports for all type definitions
 * Makes imports cleaner and more organized
 */

// Generic API Response Types
export type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedResponse,
  DetailResponse,
  DeleteResponse,
  BatchResponse,
  SearchResponse,
  UploadResponse,
  ValidationErrorResponse,
  ApiData,
  PaginatedApiData,
  SuccessResponse,
  ErrorResponse,
} from './api-response';

export {
  ApiError,
  isApiResponse,
  isPaginatedApiResponse,
  isErrorResponse,
  isSuccessResponse,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
} from './api-response';

// Knowledge Center Types
export type {
  // Base Types
  KnowledgeType,
  ContentType,
  MediaType,
  KnowledgeStatus,
  SortOption,

  // Entity Types
  KnowledgeCenter,
  KnowledgeWebinar,
  KnowledgeContent,

  // Request Types
  CreateKnowledgeCenterRequest,
  UpdateKnowledgeCenterRequest,

  // Response Types
  KnowledgeListResponse,
  KnowledgeDetailResponse,
  KnowledgeCentersResponse,
  KnowledgeCenterResponse,

  // Filter and Query Types
  KnowledgeFilters,
  KnowledgeQueryParams,
  PaginationParams,

  // Additional Types
  WebinarSchedule,
  Comment,
  // KnowledgeAnalytics removed - analytics page deleted
  CreateKnowledgeStep,
  CreateKnowledgeFormData,
  FormErrors,
  KnowledgeCardProps,
  MediaViewerProps,
  RichTextEditorProps,
  // KnowledgeCenterSettings removed - settings page deleted

  // Taxonomy Types
  Penyelenggara,
  Tag,
} from './knowledge-center';

export {
  KNOWLEDGE_TYPES,
  CONTENT_TYPES,
  KNOWLEDGE_STATUS,
  SORT_OPTIONS,
  PENYELENGGARA,
} from './knowledge-center';

// Knowledge Subject Types
export type {
  // Core Entity Types
  KnowledgeSubject,
  CreateKnowledgeSubjectRequest,
  UpdateKnowledgeSubjectRequest,

  // Response Types
  KnowledgeSubjectsResponse,
  KnowledgeSubjectResponse,
  KnowledgeSubjectListResponse,
  KnowledgeSubjectDetailResponse,

  // Component and UI Types
  SubjectProps,
  SubjectOption,
  KnowledgeSubjectFormData,
  KnowledgeSubjectFormErrors,

  // Query and Filter Types
  KnowledgeSubjectFilters,
  KnowledgeSubjectQueryParams,

  // Analytics Types removed - analytics page deleted

  // Management Types
  KnowledgeSubjectManager,

  // Icon Types
  IconOption,

  // Validation Types
  KnowledgeSubjectValidation,
} from './knowledge-subject';

// Re-export generic types for backward compatibility
export type {
  ApiResponse as GenericApiResponse,
  PaginatedApiResponse as GenericPaginatedApiResponse,
  PaginatedResponse as GenericPaginatedResponse,
  DetailResponse as GenericDetailResponse,
} from './api-response';

// Everything else for convenience
export * from './api-response';
export * from './knowledge-center';
export * from './knowledge-subject';