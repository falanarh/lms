"use client";
/**
 * Komponen: Badge
 * Tujuan: Label kecil untuk status/kategori dengan varian, tone, ukuran, dan opsi dismiss.
 *
 * Styling: Tailwind + CSS variables (fallback aman) dari tokens.css.
 * A11y: tombol close memiliki focus-visible ring.
 */
import React from "react";

export type BadgeVariant = "solid" | "soft" | "outline" | "ghost";
export type BadgeTone = "primary" | "neutral" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
  rounded?: "md" | "full";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
}

const sizeMap: Record<BadgeSize, { pad: string; text: string; gap: string; close: string }> = {
  // Padding dibuat sedikit lebih besar, teks diperkecil agar proporsional
  sm: {
    pad: "px-[var(--space-2,0.5rem)] py-[var(--space-1,0.25rem)]",
    text: "text-[var(--font-5xs,0.5rem)] leading-none",
    gap: "gap-1.5",
    close: "size-3",
  },
  md: {
    pad: "px-[var(--space-4,1rem)] py-[var(--space-3,0.75rem)]",
    text: "text-[var(--font-3xs,0.625rem)]",
    gap: "gap-2",
    close: "size-4",
  },
};

function toneColor(tone: BadgeTone) {
  switch (tone) {
    case "success":
      return {
        main: "var(--success,#16a34a)",
        on: "#ffffff",
        soft: "color-mix(in_oklab,white_92%,var(--success,#16a34a))",
      } as const;
    case "warning":
      return {
        main: "var(--warning,#d97706)",
        on: "#111827",
        soft: "color-mix(in_oklab,white_90%,var(--warning,#d97706))",
      } as const;
    case "danger":
      return {
        main: "var(--danger,#dc2626)",
        on: "#ffffff",
        soft: "color-mix(in_oklab,white_90%,var(--danger,#dc2626))",
      } as const;
    case "neutral":
      return {
        main: "var(--color-foreground-muted,#6b7280)",
        on: "#111827",
        soft: "var(--surface-elevated,#f3f4f6)",
      } as const;
    case "primary":
    default:
      return {
        main: "var(--color-primary,#2563eb)",
        on: "var(--color-on-primary,#ffffff)",
        soft: "var(--color-primary-50,rgba(37,99,235,0.08))",
      } as const;
  }
}

function variantClass(variant: BadgeVariant, tone: BadgeTone) {
  const c = toneColor(tone);
  switch (variant) {
    case "solid":
      return [
        `bg-[${c.main}]`,
        `text-[${c.on}]`,
        "border border-transparent",
      ].join(" ");
    case "soft":
      return [
        `bg-[${c.soft}]`,
        `text-[${c.main}]`,
        "border border-transparent",
      ].join(" ");
    case "outline":
      return [
        "bg-transparent",
        `text-[${c.main}]`,
        `border border-[${c.main}]`,
      ].join(" ");
    case "ghost":
    default:
      return [
        "bg-transparent",
        `text-[${c.main}]`,
        "border border-[var(--border,rgba(0,0,0,0.12))]",
      ].join(" ");
  }
}

export function Badge({
  children,
  variant = "soft",
  tone = "neutral",
  size = "sm",
  rounded = "full",
  leftIcon,
  rightIcon,
  onClose,
  disabled,
  className,
  ...rest
}: BadgeProps) {
  const sz = sizeMap[size];
  const base = [
    "inline-flex items-center",
    sz.gap,
    sz.pad,
    variantClass(variant, tone),
    rounded === "full" ? "rounded-full" : "rounded-[var(--radius-md,8px)]",
    disabled ? "opacity-60 select-none" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <span className={base} {...rest}>
      {leftIcon && <span aria-hidden className="inline-flex items-center">{leftIcon}</span>}
      <span className={[sz.text, "text-current"].join(" ")}>{children}</span>
      {rightIcon && <span aria-hidden className="inline-flex items-center">{rightIcon}</span>}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={[
            "inline-flex items-center justify-center",
            sz.close,
            "ml-1 rounded-full text-current",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2",
          ].join(" ")}
          aria-label="Remove badge"
        >
          <XIcon className="size-3" />
        </button>
      )}
    </span>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default Badge;
