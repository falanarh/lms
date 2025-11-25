"use client";
import { TriangleAlert, X, CircleCheck } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
/**
 * Komponen: Toast
 * Tujuan: Notifikasi toast/snackbar dengan varian info, warning, success, dan opsi dengan/tanpa title.
 *
 * Ringkasan
 * - Styling: Tailwind CSS dengan dukungan light dan dark mode.
 * - Aksesibilitas: role="status", aria-live, aria-atomic untuk screen readers.
 * - Varian: info (biru), warning (merah), success (hijau) - masing-masing dengan tema light/dark.
 * - Auto-dismiss: Opsional tutup otomatis setelah durasi tertentu.
 * - Dismissible: Tombol close dengan aria-label.
 * - Theme-aware: Otomatis menyesuaikan tampilan berdasarkan tema aktif (light/dark/system).
 *
 * Import
 * ```tsx
 * import { Toast } from "@/components/ui/Toast";
 * ```
 *
 * Props
 * - variant?: "info" | "warning" | "success" (default: "info")
 * - title?: string — judul toast (opsional)
 * - message: string — pesan utama toast (wajib)
 * - onClose?: () => void — callback saat toast ditutup
 * - dismissible?: boolean — tampilkan tombol close (default: true)
 * - autoDismiss?: boolean — tutup otomatis (default: false)
 * - duration?: number — durasi auto-dismiss dalam ms (default: 5000)
 * - className?: string — kelas tambahan untuk container
 *
 * Contoh Penggunaan
 * ```tsx
 * // Info tanpa title
 * <Toast
 *   variant="info"
 *   message="Notification message. Here will be information."
 * />
 *
 * // Warning dengan title
 * <Toast
 *   variant="warning"
 *   title="Peringatan"
 *   message="Data Anda belum tersimpan!"
 * />
 *
 * // Success dengan auto-dismiss
 * <Toast
 *   variant="success"
 *   message="Data berhasil disimpan!"
 *   autoDismiss
 *   duration={3000}
 * />
 * ```
 */
import React from "react";

export type ToastVariant = "info" | "warning" | "success";

export interface ToastProps {
  variant?: ToastVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
  autoDismiss?: boolean;
  duration?: number;
  className?: string;
}

const variantStyles: Record<
  ToastVariant,
  {
    container: string;
    icon: string;
    iconBg: string;
  }
> = {
  info: {
    container: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-800/30",
  },
  warning: {
    container: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-800/30",
  },
  success: {
    container: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-800/30",
  },
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    variant = "info",
    title,
    message,
    onClose,
    dismissible = true,
    autoDismiss = false,
    duration = 5000,
    className,
  },
  ref
) {
  const { resolvedTheme } = useTheme();
  const styles = variantStyles[variant];

  // Auto-dismiss timer
  React.useEffect(() => {
    if (autoDismiss && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, onClose]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        "flex items-start gap-3",
        "px-4 py-3",
        "rounded-lg",
        "border",
        "shadow-sm",
        "min-w-[320px] max-w-[480px]",
        "bg-white dark:bg-gray-900",
        "text-gray-900 dark:text-gray-100",
        styles.container,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Icon */}
      <div
        className={[
          "flex-shrink-0",
          "rounded-full",
          "p-1.5",
          styles.iconBg,
        ].join(" ")}
      >
        {variant === "info" && <InfoIcon className={["size-5", styles.icon].join(" ")} />}
        {variant === "warning" && <TriangleAlert className={["size-5", styles.icon].join(" ")} />}
        {variant === "success" && <CircleCheck className={["size-5", styles.icon].join(" ")} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3
            className={[
              "text-base",
              "font-semibold",
              "text-gray-900 dark:text-gray-100",
              "mb-0.5",
            ].join(" ")}
          >
            {title}
          </h3>
        )}
        <p
          className={[
            "text-sm",
            title
              ? "text-gray-600 dark:text-gray-300"
              : "text-gray-900 dark:text-gray-100",
          ].join(" ")}
        >
          {message}
        </p>
      </div>

      {/* Close Button */}
      {dismissible && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className={[
            "flex-shrink-0",
            "p-1",
            "rounded-md",
            "text-gray-400 dark:text-gray-500",
            "hover:text-gray-600 dark:hover:text-gray-300",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-blue-500",
            "focus-visible:ring-offset-2",
            "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
          ].join(" ")}
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
});

// Icons
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default Toast;