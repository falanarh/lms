"use client";
import { TriangleAlert, X, CircleCheck } from "lucide-react";
/**
 * Komponen: Toast
 * Tujuan: Notifikasi toast/snackbar dengan varian info, warning, success, dan opsi dengan/tanpa title.
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables untuk warna, border, radius, spacing.
 * - Aksesibilitas: role="status", aria-live, aria-atomic untuk screen readers.
 * - Varian: info (biru), warning (kuning/merah), success (hijau).
 * - Auto-dismiss: Opsional tutup otomatis setelah durasi tertentu.
 * - Dismissible: Tombol close dengan aria-label.
 *
 * Import
 * ```tsx
 * import { Toast } from "@/components/Toast";
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
 * CSS Variables yang digunakan (fallback tersedia):
 * - --surface-elevated, --color-foreground, --color-foreground-muted
 * - --border, --radius-lg, --font-sm, --font-md, --space-3, --space-4
 * - Warna varian: --info, --on-info, --warning, --on-warning, --success, --on-success
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
    container: "bg-[#EEF2FF] border-[#C7D2FE]",
    icon: "text-[#4F46E5]",
    iconBg: "bg-[#4F46E5]/10",
  },
  warning: {
    container: "bg-[#FEF2F2] border-[#FECACA]",
    icon: "text-[#DC2626]",
    iconBg: "bg-[#DC2626]/10",
  },
  success: {
    container: "bg-[#F0FDF4] border-[#BBF7D0]",
    icon: "text-[#16A34A]",
    iconBg: "bg-[#16A34A]/10",
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
        "flex items-start gap-[var(--space-3,0.75rem)]",
        "px-[var(--space-4,1rem)] py-[var(--space-3,0.75rem)]",
        "rounded-[var(--radius-lg,12px)]",
        "border",
        "shadow-sm",
        "min-w-[320px] max-w-[480px]",
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
              "text-[var(--font-md,1rem)]",
              "font-semibold",
              "text-[var(--color-foreground,#111827)]",
              "mb-0.5",
            ].join(" ")}
          >
            {title}
          </h3>
        )}
        <p
          className={[
            "text-[var(--font-sm,0.875rem)]",
            title
              ? "text-[var(--color-foreground-muted,#6b7280)]"
              : "text-[var(--color-foreground,#111827)]",
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
            "text-[var(--color-foreground-muted,#9ca3af)]",
            "hover:text-[var(--color-foreground,#111827)]",
            "hover:bg-black/5",
            "transition-colors",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[var(--color-focus-ring,#2563eb)]",
            "focus-visible:ring-offset-2",
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