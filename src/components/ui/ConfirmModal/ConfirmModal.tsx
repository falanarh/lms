"use client";

import React from "react";
import { AlertTriangle, X, Check } from "lucide-react";
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
}

const variantStyles = {
  danger: {
    icon: "text-red-500",
    iconBg: "bg-red-50",
    confirmButton: "bg-red-500 hover:bg-red-600 text-white",
    title: "text-red-900",
  },
  warning: {
    icon: "text-orange-500",
    iconBg: "bg-orange-50",
    confirmButton: "bg-orange-500 hover:bg-orange-600 text-white",
    title: "text-orange-900",
  },
  info: {
    icon: "text-blue-500",
    iconBg: "bg-blue-50",
    confirmButton: "bg-blue-500 hover:bg-blue-600 text-white",
    title: "text-blue-900",
  },
};

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
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                  <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
                </div>
                <h3 className={`text-lg font-semibold ${styles.title}`}>
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                isLoading={isLoading}
                className={`px-6 ${styles.confirmButton}`}
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