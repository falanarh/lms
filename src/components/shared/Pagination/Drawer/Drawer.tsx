"use client"
import { X } from "lucide-react";
import { ReactNode } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showFooter?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showFooter = true,
  onSave,
  saveLabel = "Simpan",
  cancelLabel = "Batal",
}: DrawerProps) {
  const sizeClasses = {
    sm: "md:w-[400px]",
    md: "md:w-[600px]",
    lg: "md:w-[800px]",
    xl: "md:w-[1000px]",
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-invert backdrop-opacity-10  bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full ${sizeClasses[size]} bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-black">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {showFooter && (
            <div className="border-t p-6 flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {saveLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}