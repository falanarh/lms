/**
 * Centralized error handling for Knowledge Center
 *
 * Mengikuti pola pada dokumentasi refactor Knowledge Center:
 * - Kelas error khusus domain (KnowledgeError, ValidationError, ApiError, NetworkError)
 * - Satu util handleKnowledgeError untuk mengubah error jadi pesan user-friendly
 */

export class KnowledgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string,
    public statusCode?: number,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'KnowledgeError';
    Object.setPrototypeOf(this, KnowledgeError.prototype);
  }
}

export class ValidationError extends KnowledgeError {
  constructor(message: string, field: string, details?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', field, 400, details);
    this.name = 'ValidationError';
  }
}

export class ApiError extends KnowledgeError {
  constructor(message: string, statusCode: number, code?: string) {
    super(message, code || 'API_ERROR', undefined, statusCode);
    this.name = 'ApiError';
  }
}

export class NetworkError extends KnowledgeError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', undefined, 0);
    this.name = 'NetworkError';
  }
}

/**
 * Unified error handler
 */
export function handleKnowledgeError(
  error: unknown,
  callbacks: {
    onValidationError?: (field: string, message: string) => void;
    onApiError?: (message: string, statusCode: number) => void;
    onNetworkError?: () => void;
    onGenericError?: (message: string) => void;
  }
): void {
  if (error instanceof ValidationError) {
    callbacks.onValidationError?.(error.field!, error.message);

    // If there are multiple field errors
    if (error.details) {
      Object.entries(error.details).forEach(([field, messages]) => {
        messages.forEach((msg) => {
          callbacks.onValidationError?.(field, msg);
        });
      });
    }
  } else if (error instanceof ApiError) {
    callbacks.onApiError?.(error.message, error.statusCode!);
  } else if (error instanceof NetworkError) {
    callbacks.onNetworkError?.();
  } else if (error instanceof Error) {
    callbacks.onGenericError?.(error.message);
  } else {
    callbacks.onGenericError?.('An unexpected error occurred');
  }
}
