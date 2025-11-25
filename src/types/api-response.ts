/**
 * Generic API Response Types
 *
 * Reusable across all API modules in the application
 * Separated from domain-specific types for better maintainability
 * Follows consistent API response structure
 */

// ===== CORE API RESPONSE TYPES =====

/**
 * Standard API Response structure for single entity operations
 * Used for GET, POST, PUT, PATCH operations that return single data
 */
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

/**
 * Paginated API Response structure for list operations
 * Used for GET operations that return paginated data
 */
export interface PaginatedApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T[];
  pageMeta: {
    page: number;
    perPage: number;
    hasPrev: boolean;
    hasNext: boolean;
    totalPageCount: number;
    showingFrom: number;
    showingTo: number;
    resultCount: number;
    totalResultCount: number;
  };
}

// ===== LEGACY/BACKWARD COMPATIBILITY TYPES =====

/**
 * Simplified paginated response for backward compatibility
 * Used in existing components that expect this structure
 */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Simple detail response for backward compatibility
 * Used in existing components that expect this structure
 */
export type DetailResponse<T> = {
  data: T;
};

// ===== SPECIALIZED RESPONSE TYPES =====

/**
 * Response type for delete operations
 * Typically returns boolean or affected count
 */
export interface DeleteResponse {
  success: boolean;
  status: number;
  message: string;
  data: boolean | number;
}

/**
 * Response type for batch operations
 * Used for create/update/delete multiple entities
 */
export interface BatchResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T[];
  processedCount: number;
  failedCount: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Response type for search operations
 * Includes search metadata
 */
export interface SearchResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T[];
  searchMeta: {
    query: string;
    totalResults: number;
    searchTime: number;
    suggestions?: string[];
  };
}

/**
 * Response type for file upload operations
 * Includes file metadata
 */
export interface UploadResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
}

/**
 * Response type for validation errors
 * Used when form validation fails
 */
export interface ValidationErrorResponse {
  success: boolean;
  status: number;
  message: string;
  data: null;
  errors: Record<string, string[]>;
}

// ===== UTILITY TYPES =====

/**
 * Extract data type from ApiResponse
 */
export type ApiData<T extends ApiResponse<any>> = T extends ApiResponse<infer U> ? U : never;

/**
 * Extract data type from PaginatedApiResponse
 */
export type PaginatedApiData<T extends PaginatedApiResponse<any>> = T extends PaginatedApiResponse<infer U> ? U[] : never;

/**
 * Create success response type
 */
export type SuccessResponse<T> = ApiResponse<T> & {
  success: true;
  status: 200 | 201 | 204;
};

/**
 * Create error response type
 */
export type ErrorResponse = ApiResponse<null> & {
  success: false;
  status: 400 | 401 | 403 | 404 | 500;
};

/**
 * Generic API error class
 */
export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 400 && this.data?.errors;
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is an authorization error
   */
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Get validation errors if available
   */
  getValidationErrors(): Record<string, string[]> | null {
    return this.isValidationError() ? this.data?.errors : null;
  }
}

// ===== TYPE GUARDS =====

/**
 * Type guard for ApiResponse
 */
export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.success === 'boolean' &&
    typeof obj.status === 'number' &&
    typeof obj.message === 'string' &&
    'data' in obj
  );
}

/**
 * Type guard for PaginatedApiResponse
 */
export function isPaginatedApiResponse<T>(obj: any): obj is PaginatedApiResponse<T> {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.success === 'boolean' &&
    typeof obj.status === 'number' &&
    typeof obj.message === 'string' &&
    Array.isArray(obj.data) &&
    obj.pageMeta &&
    typeof obj.pageMeta === 'object' &&
    typeof obj.pageMeta.page === 'number' &&
    typeof obj.pageMeta.perPage === 'number' &&
    typeof obj.pageMeta.totalResultCount === 'number'
  );
}

/**
 * Type guard for error response
 */
export function isErrorResponse(obj: any): obj is ErrorResponse {
  return isApiResponse(obj) && !obj.success && obj.status >= 400;
}

/**
 * Type guard for success response
 */
export function isSuccessResponse<T>(obj: any): obj is SuccessResponse<T> {
  return isApiResponse(obj) && obj.success && obj.status < 400;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, message: string = 'Success', status: 200 | 201 | 204 = 200): SuccessResponse<T> {
  return {
    success: true,
    status,
    message,
    data,
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(message: string, status: 500 | 404 | 400 | 401 | 403 = 400, data?: any): ErrorResponse {
  return {
    success: false,
    status,
    message,
    data: data || null,
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pageMeta: PaginatedApiResponse<T>['pageMeta'],
  message: string = 'Success',
  status: number = 200
): PaginatedApiResponse<T> {
  return {
    success: true,
    status,
    message,
    data,
    pageMeta,
  };
}

// ===== EXPORTS =====
// All types, classes, and functions are already exported as declarations above
// No need for duplicate export statements