"use client";
/**
 * Komponen: Textarea
 * Tujuan: Field teks multiline dengan label, helper/error text, state a11y, dan ukuran.
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables untuk warna, border, radius, spacing, font.
 * - Aksesibilitas: <label htmlFor> terhubung ke textarea, aria-invalid, aria-describedby, aria-busy saat loading.
 * - Keyboard: Focus-visible ring jelas via var(--color-focus-ring).
 *
 * Import
 * ```tsx
 * import { Textarea } from "@/components/Textarea";
 * ```
 *
 * Props
 * - size?: "sm" | "md" | "lg" (default: "md")
 * - label?: string — label di atas field
 * - helperText?: string — teks bantu di bawah field
 * - errorText?: string — pesan error (aktif saat isInvalid=true)
 * - isInvalid?: boolean — menandai error (set aria-invalid)
 * - isLoading?: boolean — tampilkan spinner di sisi kanan atas dan set aria-busy
 * - containerClassName?: string — kelas tambahan untuk container luar
 * - ...TextareaHTMLAttributes (name, value, onChange, placeholder, disabled, required, rows, dll.)
 *
 * CSS Variables (fallback tersedia):
 * - --surface, --surface-elevated, --border
 * - --color-foreground, --color-foreground-muted
 * - --color-focus-ring, --color-ring-offset
 * - --danger
 * - --radius-md, --font-sm, --font-md, --font-lg, --space-1, --space-2, --space-3
 *
 * Preview
 * - Buka route `/preview/textarea` untuk melihat varian, ukuran, focus, disabled, invalid, loading.
 */
import React from "react";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextareaSize;
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  isLoading?: boolean;
  containerClassName?: string;
}

const sizeMap: Record<TextareaSize, { field: string; text: string }> = {
  sm: {
    field: "min-h-24 px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)]",
    text: "text-[var(--font-sm,0.875rem)]",
  },
  md: {
    field: "min-h-28 px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)]",
    text: "text-[var(--font-md,1rem)]",
  },
  lg: {
    field: "min-h-36 px-[var(--space-3,0.75rem)] py-[var(--space-3,0.75rem)]",
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
    isLoading,
    disabled,
    containerClassName,
    id,
    className,
    rows,
    ...props
  },
  ref
) {
  const autoId = React.useId();
  const resolvedId = id ?? autoId;
  const helperId = `${resolvedId}-help`;
  const sz = sizeMap[size];
  const showError = !!isInvalid && !!errorText;

  return (
    <div className={["w-full", containerClassName].filter(Boolean).join(" ")}
    >
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

      <div className="relative">
        <textarea
          ref={ref}
          id={resolvedId}
          rows={rows ?? (size === "lg" ? 6 : size === "md" ? 5 : 4)}
          className={[
            "w-full min-w-0 resize-y",
            sz.field,
            sz.text,
            "rounded-[var(--radius-md,8px)]",
            "bg-[var(--surface,white)]",
            "text-[var(--color-foreground,#111827)]",
            "placeholder:text-[var(--color-foreground-muted,#6b7280)]",
            "border border-[var(--border,rgba(0,0,0,0.12))]",
            "transition-[color,box-shadow,background-color,border-color] outline-none",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)]",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset,#ffffff)]",
            isInvalid ? "border-[var(--danger,#dc2626)]" : "",
            disabled ? "opacity-50 cursor-not-allowed" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={isInvalid || undefined}
          aria-describedby={[(helperText || showError) ? helperId : undefined].filter(Boolean).join(" ") || undefined}
          aria-busy={isLoading || undefined}
          disabled={disabled}
          {...props}
        />

        {isLoading && (
          <span className="absolute right-3 top-3 text-[var(--color-foreground-muted,#6b7280)]" aria-hidden>
            <Spinner className="size-4" />
          </span>
        )}
      </div>

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
    </div>
  );
});

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={["animate-spin", className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

export default Textarea;

