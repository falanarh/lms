/**
 * Custom hook for Toast Management
 * Following the utility hook pattern from coding principles
 * For UI state management
 */

import { useState, useCallback } from 'react';
import { ToastState, ToastVariant } from '@/utils/toastUtils';

/**
 * Toast Hook untuk UI state management
 * Sesuai dengan coding principles untuk utility hooks
 */
export function useToast(): ToastState & {
  showToast: (message: string, variant?: ToastVariant) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  dismissToast: () => void;
} {
  const [toast, setToast] = useState<{ id: string; message: string; variant: ToastVariant } | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message, variant });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
  };
}