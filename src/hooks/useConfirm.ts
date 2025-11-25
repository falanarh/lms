/**
 * Custom hook for Confirmation Modal
 * Following the utility hook pattern from coding principles
 * For UI state management
 */

import { useState, useCallback } from 'react';
import { ConfirmModalProps } from '@/components/ui/ConfirmModal';

interface ConfirmState extends Omit<ConfirmModalProps, 'isOpen' | 'onClose' | 'onConfirm'> {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

/**
 * Confirm Hook untuk UI state management
 * Sesuai dengan coding principles untuk utility hooks
 */
export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    confirmText: 'Konfirmasi',
    cancelText: 'Batal',
    isLoading: false,
  });

  const confirm = useCallback((options: Omit<ConfirmModalProps, 'isOpen' | 'onClose' | 'onConfirm'>) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    confirmState.resolve?.(true);
  }, [confirmState.resolve]);

  const handleCancel = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    confirmState.resolve?.(false);
  }, [confirmState.resolve]);

  const setLoading = useCallback((isLoading: boolean) => {
    setConfirmState(prev => ({ ...prev, isLoading }));
  }, []);

  // Convenience methods
  const confirmDanger = useCallback((message: string, title = 'Konfirmasi') => {
    return confirm({
      title,
      message,
      variant: 'danger',
      confirmText: 'Hapus',
      cancelText: 'Batal',
    });
  }, [confirm]);

  const confirmWarning = useCallback((message: string, title = 'Konfirmasi') => {
    return confirm({
      title,
      message,
      variant: 'warning',
      confirmText: 'Lanjutkan',
      cancelText: 'Batal',
    });
  }, [confirm]);

  const confirmInfo = useCallback((message: string, title = 'Konfirmasi') => {
    return confirm({
      title,
      message,
      variant: 'info',
      confirmText: 'OK',
      cancelText: 'Batal',
    });
  }, [confirm]);

  return {
    // State
    confirmState,

    // Actions
    confirm,
    confirmDanger,
    confirmWarning,
    confirmInfo,
    setLoading,

    // Handlers
    handleConfirm,
    handleCancel,
  };
}