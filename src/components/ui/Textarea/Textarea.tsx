"use client";
/**
 * Komponen: Textarea
 * Tujuan: Field textarea serbaguna dengan label, helper/error text, dan state a11y yang konsisten dengan Input.
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables untuk warna, border, radius, spacing, font (sama dengan Input).
 * - Aksesibilitas: <label htmlFor> terhubung ke textarea, aria-invalid, aria-describedby.
 * - Keyboard: Focus-visible ring jelas via var(--color-focus-ring).
 * - Auto-resize: Opsional menyesuaikan tinggi otomatis berdasarkan konten.
 *
 * Import
 * ```tsx
 * import { Textarea } from "@/components/Textarea";
 * ```
 *
 * Props
 * - size?: "sm" | "md" | "lg" (default: "md")
 * - label?: string — label di atas textarea
 * - helperText?: string — teks bantu di bawah textarea
 * - errorText?: string — pesan error (aktif saat isInvalid=true)
 * - isInvalid?: boolean — menandai error (set aria-invalid)
 * - autoResize?: boolean — otomatis sesuaikan tinggi berdasarkan konten
 * - minRows?: number — jumlah baris minimum (default: 3)
 * - maxRows?: number — jumlah baris maksimum untuk auto-resize
 * - containerClassName?: string — kelas tambahan untuk container luar
 * - ...TextareaHTMLAttributes (name, value, onChange, placeholder, disabled, required, rows, dll.)
 *
 * CSS Variables yang digunakan (fallback tersedia):
 * - --surface, --surface-elevated
 * - --color-foreground, --color-foreground-muted
 * - --border
 * - --color-focus-ring, --color-ring-offset
 * - --danger, --on-danger
 * - --radius-md, --font-sm, --font-md, --font-lg, --space-1, --space-3
 *
 * Preview
 * - Buka route `/preview/textarea` untuk melihat varian, ukuran, focus, disabled, invalid, auto-resize.
 */
import React from "react";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextareaSize;
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  isLoading?: boolean;
  containerClassName?: string;
}

const sizeMap: Record<TextareaSize, { textarea: string; text: string }> = {
  sm: {
    textarea: "px-[var(--space-3,0.75rem)] py-2 min-h-[80px]",
    text: "text-[var(--font-sm,0.875rem)]",
  },
  md: {
    textarea: "px-[var(--space-3,0.75rem)] py-2.5 min-h-[96px]",
    text: "text-[var(--font-md,1rem)]",
  },
  lg: {
    textarea: "px-[var(--space-3,0.75rem)] py-3 min-h-[112px]",
    text: "text-[var(--font-lg,1.125rem)]",
  },
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = "md",
    label,
    helperText,
    errorText,
    isInvalid,
    autoResize = false,
    minRows = 3,
    maxRows,
    isLoading,
    disabled,
    containerClassName,
    id,
    className,
    onChange,
    rows,
    ...props
  },
  ref
) {
  const textareaId = React.useId();
  const resolvedId = id ?? textareaId;
  const helperId = `${resolvedId}-help`;
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const sz = sizeMap[size];
  const showError = !!isInvalid && !!errorText;
  const isDisabled = disabled || isLoading;

  // Auto-resize handler
  const handleResize = React.useCallback(() => {
    const textarea = innerRef.current;
    if (!textarea || !autoResize) return;

    // Reset height untuk menghitung ulang
    textarea.style.height = "auto";

    // Hitung tinggi baru
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight);
    const paddingTop = parseInt(computedStyle.paddingTop);
    const paddingBottom = parseInt(computedStyle.paddingBottom);
    
    let newHeight = textarea.scrollHeight;

    // Terapkan min/max rows jika ada
    if (minRows && lineHeight) {
      const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
      newHeight = Math.max(newHeight, minHeight);
    }
    
    if (maxRows && lineHeight) {
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;
      newHeight = Math.min(newHeight, maxHeight);
    }

    textarea.style.height = `${newHeight}px`;
  }, [autoResize, minRows, maxRows]);

  // Handle ref gabungan (forwarded ref + internal ref)
  const handleRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  // Auto-resize saat mount dan content berubah
  React.useEffect(() => {
    if (autoResize) {
      handleResize();
    }
  }, [autoResize, handleResize, props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      handleResize();
    }
    onChange?.(e);
  };

  return (
    <div className={["w-full", isLoading ? "relative" : "", containerClassName].filter(Boolean).join(" ")}>
      {label && (
        <label
          htmlFor={resolvedId}
          className={[
            "mb-[var(--space-1,0.25rem)] block",
            "text-[var(--font-sm,0.875rem)]",
            "text-[var(--color-foreground,#111827)]",
            "font-[var(--font-body)]",
          ].join(" ")}
        >
          {label}
        </label>
      )}

      <textarea
        ref={handleRef}
        id={resolvedId}
        rows={autoResize ? undefined : rows ?? minRows}
        className={[
          "w-full min-w-0",
          sz.textarea,
          sz.text,
          "rounded-[var(--radius-md,8px)]",
          "bg-[var(--surface,white)]",
          "text-[var(--color-foreground,#111827)]",
          "placeholder:text-[var(--color-foreground-muted,#6b7280)]",
          "border border-[var(--border,rgba(0,0,0,0.12))]",
          "transition-[color,box-shadow,background-color,border-color] outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)]",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset,#ffffff)]",
          "resize-y", // Allow vertical resize kecuali jika autoResize aktif
          autoResize ? "resize-none overflow-hidden" : "",
          isInvalid ? "border-[var(--danger,#dc2626)]" : "",
          isDisabled ? "opacity-50 cursor-not-allowed" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={isInvalid || undefined}
        aria-describedby={[(helperText || showError) ? helperId : undefined].filter(Boolean).join(" ") || undefined}
        disabled={isDisabled}
        onChange={handleChange}
        {...props}
      />

      {(helperText || showError) && (
        <p
          id={helperId}
          className={[
            "mt-[var(--space-1,0.25rem)]",
            "text-[var(--font-sm,0.875rem)]",
            showError
              ? "text-[var(--danger,#dc2626)]"
              : "text-[var(--color-foreground-muted,#6b7280)]",
          ].join(" ")}
        >
          {showError ? errorText : helperText}
        </p>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface,white)] bg-opacity-50 rounded-[var(--radius-md,8px)]">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-focus-ring,#2563eb)]"></div>
        </div>
      )}
    </div>
  );
});

export default Textarea;