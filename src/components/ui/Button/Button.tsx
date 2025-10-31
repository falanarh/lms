"use client";
/**
 * Komponen: Button
 * Tujuan: Tombol serbaguna untuk aksi utama/sekunder dalam aplikasi.
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables (fallback warna disediakan).
 * - Aksesibilitas: Fokus ring terlihat, dapat dioperasikan dengan keyboard, atribut ARIA untuk loading/disabled.
 * - App Router kompatibel, client component.
 *
 * Import
 * ```tsx
 * import { Button } from "@/components/Button";
 * ```
 *
 * Props
 * - variant?: "solid" | "outline" | "ghost" (default: "solid")
 * - size?: "sm" | "md" | "lg" (default: "md")
 * - disabled?: boolean — menonaktifkan tombol (juga aktif saat isLoading)
 * - isLoading?: boolean — menampilkan spinner dan set aria-busy
 * - error?: boolean — menampilkan gaya error (danger)
 * - leftIcon?: ReactNode — ikon di kiri label
 * - rightIcon?: ReactNode — ikon di kanan label
 * - ...ButtonHTMLAttributes — onClick, type, title, dll.
 *
 * Variants
 * - solid: tombol utama, latar warna utama, teks kontras
 * - outline: border warna utama, latar transparan, hover dengan subtle fill
 * - ghost: tanpa border, teks warna utama, hover subtle fill
 *
 * Size
 * - sm: h-9, padding kecil, teks sm
 * - md: h-10, padding standar, teks sm
 * - lg: h-12, padding lebih besar, teks base
 *
 * States & A11y
 * - focus: ring tampak (var(--color-focus-ring) dengan fallback biru)
 * - hover: setiap variant punya warna hover
 * - disabled: opacity-50 + cursor-not-allowed, set aria-disabled
 * - loading: spinner di dalam tombol, set aria-busy, otomatis disabled
 * - error: palet danger (var(--color-danger), --color-on-danger, --color-danger-hover)
 *
 * CSS Variables yang digunakan (opsional, ada fallback):
 * - --color-primary: warna utama (fallback #2563eb)
 * - --color-primary-hover: warna hover utama (fallback #1d4ed8)
 * - --color-primary-50: tint 50 untuk hover subtle (fallback rgba(37,99,235,0.08))
 * - --color-on-primary: warna teks pada primary (fallback #ffffff)
 * - --color-focus-ring: warna ring fokus (fallback #2563eb)
 * - --color-ring-offset: warna offset ring (fallback #ffffff)
 * - --color-danger: warna error (fallback #dc2626)
 * - --color-danger-hover: warna hover error (fallback #b91c1c)
 * - --color-on-danger: warna teks pada error (fallback #ffffff)
 *
 * Contoh Penggunaan
 * ```tsx
 * // Dasar
 * <Button>Submit</Button>
 * <Button variant="outline">Cancel</Button>
 * <Button variant="ghost">Learn more</Button>
 *
 * // Ukuran
 * <Button size="sm">Small</Button>
 * <Button size="md">Medium</Button>
 * <Button size="lg">Large</Button>
 *
 * // Disabled & Loading
 * <Button disabled>Disabled</Button>
 * <Button isLoading>Saving...</Button>
 *
 * // Error
 * <Button error>Delete</Button>
 *
 * // Dengan ikon
 * <Button leftIcon={<IconPlus />}>New Course</Button>
 * <Button rightIcon={<IconArrowRight />}>Continue</Button>
 *
 * // Handler dan type
 * <Button type="submit" onClick={() => console.log("clicked")}>
 *   Save
 * </Button>
 * ```
 *
 * Preview
 * - Buka route `/preview/button` untuk melihat seluruh varian & state.
 */
import React from "react";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const baseClasses =
  "inline-flex items-center justify-center select-none whitespace-nowrap rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

function variantClasses(variant: ButtonVariant, error?: boolean) {
  if (error) {
    return [
      "bg-[var(--color-danger,#dc2626)]",
      "text-[var(--color-on-danger,#ffffff)]",
      "hover:bg-[var(--color-danger-hover,#b91c1c)]",
      "border border-transparent",
    ].join(" ");
  }

  switch (variant) {
    case "outline":
      return [
        "bg-transparent",
        "text-[var(--color-primary,#2563eb)]",
        "border",
        "border-[var(--color-primary,#2563eb)]",
        "hover:bg-[var(--color-primary-50,rgba(37,99,235,0.08))]",
      ].join(" ");
    case "ghost":
      return [
        "bg-transparent",
        "text-[var(--color-primary,#2563eb)]",
        "hover:bg-[var(--color-primary-50,rgba(37,99,235,0.08))]",
      ].join(" ");
    case "solid":
    default:
      return [
        "bg-[var(--color-primary,#2563eb)]",
        "text-[var(--color-on-primary,#ffffff)]",
        "hover:bg-[var(--color-primary-hover,#1d4ed8)]",
        "border border-transparent",
      ].join(" ");
  }
}

export function Button({
  children,
  variant = "solid",
  size = "md",
  disabled,
  isLoading,
  error,
  leftIcon,
  rightIcon,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const ringClasses = [
    "focus-visible:ring-[var(--color-focus-ring,#2563eb)]",
    "focus-visible:ring-offset-[var(--color-ring-offset,#ffffff)]",
  ].join(" ");

  return (
    <button
      type={type}
      className={[
        baseClasses,
        sizeClasses[size],
        variantClasses(variant, error),
        ringClasses,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <Spinner
          className={[
            "animate-spin",
            variant === "solid" || error
              ? "text-[var(--color-on-primary,#ffffff)]"
              : "text-[var(--color-primary,#2563eb)]",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}
      {leftIcon && <span aria-hidden className="shrink-0">{leftIcon}</span>}
      <span className="inline-flex items-center">{children}</span>
      {rightIcon && <span aria-hidden className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={["size-4", className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

export default Button;
