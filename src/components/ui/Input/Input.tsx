"use client";
/**
 * Komponen: Input
 * Tujuan: Field input teks serbaguna dengan label, helper/error text, ikon kiri/kanan, dan state a11y.
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables untuk warna, border, radius, spacing, font.
 * - Aksesibilitas: <label htmlFor> terhubung ke input, aria-invalid, aria-describedby, aria-busy saat loading.
 * - Keyboard: Focus-visible ring jelas via var(--color-focus-ring).
 *
 * Import
 * ```tsx
 * import { Input } from "@/components/Input";
 * ```
 *
 * Props
 * - size?: "sm" | "md" | "lg" (default: "md")
 * - label?: string — label di atas input
 * - helperText?: string — teks bantu di bawah input
 * - errorText?: string — pesan error (aktif saat isInvalid=true)
 * - isInvalid?: boolean — menandai error (set aria-invalid)
 * - leftIcon?: ReactNode — ikon sisi kiri dalam field
 * - rightIcon?: ReactNode — ikon sisi kanan dalam field
 * - isLoading?: boolean — tampilkan spinner di sisi kanan dan set aria-busy
 * - containerClassName?: string — kelas tambahan untuk container luar
 * - ...InputHTMLAttributes (name, value, onChange, placeholder, disabled, required, type, dll.)
 *
 * CSS Variables yang digunakan (fallback tersedia):
 * - --surface, --surface-elevated
 * - --color-foreground, --color-foreground-muted
 * - --border
 * - --color-focus-ring, --color-ring-offset
 * - --danger, --on-danger
 * - --radius-md, --font-sm, --font-md, --font-lg, --space-1, --space-2, --space-3
 *
 * Preview
 * - Buka route `/preview/input` untuk melihat varian, ukuran, focus, disabled, invalid, loading.
 */
import React from "react";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize;
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  containerClassName?: string;
}

const sizeMap: Record<InputSize, { input: string; text: string; icon: string }> = {
  sm: {
    // Default padding sedikit lebih lega saat tanpa ikon
    input: "h-9 px-[var(--space-3,0.75rem)]",
    text: "text-[var(--font-sm,0.875rem)]",
    icon: "size-4",
  },
  md: {
    input: "h-10 px-[var(--space-3,0.75rem)]",
    text: "text-[var(--font-md,1rem)]",
    icon: "size-5",
  },
  lg: {
    input: "h-12 px-[var(--space-3,0.75rem)]",
    text: "text-[var(--font-lg,1.125rem)]",
    icon: "size-5",
  },
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "md",
    label,
    helperText,
    errorText,
    isInvalid,
    leftIcon,
    rightIcon,
    isLoading,
    disabled,
    containerClassName,
    id,
    className,
    ...props
  },
  ref
) {
  const inputId = React.useId();
  const resolvedId = id ?? inputId;
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
        {leftIcon && (
          <span className={["absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground-muted,#6b7280)]", sz.icon].join(" ")} aria-hidden>
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={resolvedId}
          className={[
            "w-full min-w-0",
            sz.input,
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
            leftIcon ? "pl-9" : "",
            (rightIcon || isLoading) ? "pr-9" : "",
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

        {(rightIcon || isLoading) && (
          <span className={["absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground-muted,#6b7280)]", sz.icon].join(" ")} aria-hidden>
            {isLoading ? <Spinner className={sz.icon} /> : rightIcon}
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

export default Input;
