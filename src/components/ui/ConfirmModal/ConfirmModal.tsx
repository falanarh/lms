"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  illustration?: React.ReactNode;
}

const variantStyles = {
  danger: {
    icon: "text-rose-500",
    iconBg: "bg-rose-50",
    headerBg: "bg-gradient-to-b from-rose-400 to-rose-500",
    confirmButton: "bg-rose-500 hover:bg-rose-600 text-white",
    cancelButton: "text-rose-500 border-rose-200 hover:bg-rose-50",
    closeButton: "bg-white/90 text-rose-600 hover:bg-white",
    title: "text-gray-900",
  },
  warning: {
    icon: "text-amber-500",
    iconBg: "bg-amber-50",
    headerBg: "bg-gradient-to-b from-amber-300 to-amber-500",
    confirmButton: "bg-amber-500 hover:bg-amber-600 text-white",
    cancelButton: "text-amber-600 border-amber-200 hover:bg-amber-50",
    closeButton: "bg-white/90 text-amber-600 hover:bg-white",
    title: "text-gray-900",
  },
  info: {
    icon: "text-sky-500",
    iconBg: "bg-sky-50",
    headerBg: "bg-gradient-to-b from-sky-400 to-sky-500",
    confirmButton: "bg-sky-500 hover:bg-sky-600 text-white",
    cancelButton: "text-sky-600 border-sky-200 hover:bg-sky-50",
    closeButton: "bg-white/90 text-sky-600 hover:bg-white",
    title: "text-gray-900",
  },
} as const;

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
  illustration,
}: ConfirmModalProps) {
  const styles = variantStyles[variant];

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top illustration / header */}
          <div className={`relative flex items-center justify-center px-6 pt-8 pb-6 ${styles.headerBg}`}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium shadow-md transition-colors disabled:opacity-50 ${styles.closeButton}`}
            >
              <X className="w-4 h-4" />
            </button>
            {illustration ? (
              <div className="flex items-center justify-center">
                {illustration}
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                <AlertTriangle className={`w-10 h-10 ${styles.icon}`} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-8 pt-6 pb-8 text-center">
            <h3 className={`text-2xl font-semibold tracking-tight ${styles.title}`}>
              {title}
            </h3>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className={`w-full sm:w-auto px-6 rounded-full ${styles.cancelButton}`}
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                aria-busy={isLoading}
                className={`w-full sm:w-auto px-6 rounded-full ${styles.confirmButton}`}
              >
                {isLoading ? "Memproses..." : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;