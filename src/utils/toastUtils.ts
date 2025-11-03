import { useState } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

export type ToastVariant = 'success' | 'warning' | 'info';

/**
 * Utility functions untuk toast notifications.
 * Bukan hook, murni utility functions yang reusable.
 */
export function createToastState() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, variant: ToastVariant = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message, variant });
  };

  const showSuccess = (message: string) => showToast(message, 'success');
  const showWarning = (message: string) => showToast(message, 'warning');
  const showError = (message: string) => showToast(message, 'warning');
  const showInfo = (message: string) => showToast(message, 'info');

  const dismissToast = () => setToast(null);

  return {
    toast,
    showToast,
    showSuccess,
    showWarning,
    showError,
    showInfo,
    dismissToast,
  };
}

export type ToastState = ReturnType<typeof createToastState>;