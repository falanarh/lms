/**
 * Knowledge Subject Types
 *
 * Type definitions specifically for Knowledge Subject domain entity
 * Separated from knowledge-center.ts for better maintainability
 */

// Import generic API response types
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedResponse,
  DetailResponse,
} from './api-response';

// Knowledge Subject Entity Type
export interface KnowledgeSubject {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

// Request Types for CRUD operations
export type CreateKnowledgeSubjectRequest = Omit<KnowledgeSubject, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateKnowledgeSubjectRequest = Partial<CreateKnowledgeSubjectRequest>;

// API Response Types specific to Knowledge Subject
export type KnowledgeSubjectsResponse = PaginatedApiResponse<KnowledgeSubject>;
export type KnowledgeSubjectResponse = ApiResponse<KnowledgeSubject>;

// Simplified response types are now imported from api-response.ts

export type KnowledgeSubjectListResponse = PaginatedResponse<KnowledgeSubject>;
export type KnowledgeSubjectDetailResponse = DetailResponse<KnowledgeSubject>;

// Component props types
export interface SubjectProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

export interface SubjectOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  originalSubject?: KnowledgeSubject;
}

// Form types for knowledge subject management
export interface KnowledgeSubjectFormData {
  name: string;
  icon: string;
}

export interface KnowledgeSubjectFormErrors {
  name?: string;
  icon?: string;
}

// Filter and query types
export interface KnowledgeSubjectFilters {
  search?: string;
}

export interface KnowledgeSubjectQueryParams extends KnowledgeSubjectFilters {
  page?: number;
  limit?: number;
  sort?: 'name' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}

// Analytics types for knowledge subject have been removed - analytics page deleted

// Management types
export interface KnowledgeSubjectManager {
  subjects: KnowledgeSubject[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  create: (data: CreateKnowledgeSubjectRequest) => Promise<KnowledgeSubject>;
  update: (id: string, data: UpdateKnowledgeSubjectRequest) => Promise<KnowledgeSubject>;
  delete: (id: string) => Promise<boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  getSubjectById: (id: string) => KnowledgeSubject | undefined;
  getSubjectByName: (name: string) => KnowledgeSubject | undefined;
}

// Icon picker types
export interface IconOption {
  name: string;
  component: React.ComponentType<any>;
  label: string;
}

// Validation types
export interface KnowledgeSubjectValidation {
  isValid: boolean;
  errors: KnowledgeSubjectFormErrors;
}

// Barrel exports - all types available from this file
// export {
//   // Core entity types
//   KnowledgeSubject,
//   CreateKnowledgeSubjectRequest,
//   UpdateKnowledgeSubjectRequest,

//   // Response types
//   KnowledgeSubjectsResponse,
//   KnowledgeSubjectResponse,
//   KnowledgeSubjectListResponse,
//   KnowledgeSubjectDetailResponse,

//   // Component and UI types
//   SubjectProps,
//   SubjectOption,
//   KnowledgeSubjectFormData,
//   KnowledgeSubjectFormErrors,

//   // Query and filter types
//   KnowledgeSubjectFilters,
//   KnowledgeSubjectQueryParams,

//   // Management types
//   KnowledgeSubjectManager,

//   // Icon types
//   IconOption,

//   // Validation types
//   KnowledgeSubjectValidation,
// };

// Re-export generic API response types for backward compatibility
// export type {
//   ApiResponse,
//   PaginatedApiResponse,
//   PaginatedResponse,
//   DetailResponse,
// } from './api-response';