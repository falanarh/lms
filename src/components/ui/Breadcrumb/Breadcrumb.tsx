"use client";
/**
 * Komponen: Breadcrumb
 * Tujuan: Menampilkan hierarki navigasi halaman (breadcrumb) dengan pemisah ikon.
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables (fallback disediakan) untuk warna, spacing, radius, font.
 * - Aksesibilitas: <nav aria-label="Breadcrumb"> dengan <ol> dan aria-current="page" pada item aktif.
 * - App Router kompatibel, client component.
 *
 * Import
 * ```tsx
 * import { Breadcrumb } from "@/components/Breadcrumb";
 * ```
 *
 * Props
 * - items: Array<{ label: string; href?: string; onClick?: () => void; isActive?: boolean; disabled?: boolean }>
 * - size?: "sm" | "md" | "lg" (default: "md")
 * - separator?: "chevron" | "slash" | React.ReactNode (default: "chevron")
 * - ariaLabel?: string (default: "Breadcrumb")
 * - className?: string — kelas tambahan untuk container nav
 *
 * Size
 * - sm: teks kecil, gap sempit
 * - md: teks sedang
 * - lg: teks besar
 *
 * States & A11y
 * - hover: teks berubah ke warna utama subtle
 * - focus-visible: ring fokus jelas menggunakan var(--color-focus-ring)
 * - active (halaman saat ini): aria-current="page", teks foreground utama
 * - disabled: pointer-events-none dan warna muted
 *
 * CSS Variables yang digunakan (opsional, fallback tersedia):
 * - --color-foreground: (default #111827)
 * - --color-foreground-muted: (default #6b7280)
 * - --color-primary: (default #2563eb)
 * - --color-primary-subtle: (default rgba(37,99,235,0.08))
 * - --color-focus-ring: (default #2563eb)
 * - --radius-md: (default 8px)
 * - --font-sm: (default 0.875rem)
 * - --font-md: (default 1rem)
 * - --font-lg: (default 1.125rem)
 * - --space-1: (default 0.25rem)
 * - --space-2: (default 0.5rem)
 * - --space-3: (default 0.75rem)
 */
import React from "react";
import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
};

export type BreadcrumbSize = "sm" | "md" | "lg";

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  size?: BreadcrumbSize;
  separator?: "chevron" | "slash" | React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

const sizeClass: Record<BreadcrumbSize, string> = {
  sm: "text-[var(--font-sm,0.875rem)]",
  md: "text-[var(--font-md,1rem)]",
  lg: "text-[var(--font-lg,1.125rem)]",
};

const itemBase = [
  "inline-flex items-center rounded-[var(--radius-md,8px)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "focus-visible:ring-[var(--color-focus-ring,#2563eb)]",
  "focus-visible:ring-offset-[var(--color-ring-offset,#ffffff)]",
  "transition-colors",
].join(" ");

const itemColors = {
  default: "text-[var(--color-foreground-muted,#6b7280)] hover:text-[var(--color-primary,#2563eb)]",
  active: "text-[var(--color-foreground,#111827)] font-[var(--font-body-bold)]",
  disabled: "text-[color-mix(in_oklab,var(--color-foreground-muted,#6b7280)_70%,transparent)] pointer-events-none",
};

function Separator({ type = "chevron" as const }: { type?: "chevron" | "slash" }) {
  if (type === "slash") return <span className="text-[var(--color-foreground-muted,#6b7280)]">/</span>;
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="text-[var(--color-foreground-muted,#6b7280)]"
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Breadcrumb({
  items,
  size = "md",
  separator = "chevron",
  ariaLabel = "Breadcrumb",
  className,
}: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={["w-full", className].filter(Boolean).join(" ")}>
      <ol className={["flex items-center", "gap-[var(--space-2,0.5rem)]", sizeClass[size]].join(" ")}>
        {items.map((item, idx) => {
          const isFirst = idx === 0;
          const isActive = !!item.isActive;
          const isDisabled = !!item.disabled;
          const colorClass = isDisabled ? itemColors.disabled : isActive ? itemColors.active : itemColors.default;

          return (
            <li key={`${item.label}-${idx}`} className="flex items-center">
              {!isFirst && (
                <span aria-hidden className="mx-[var(--space-1,0.25rem)]">
                  {typeof separator === "string" ? <Separator type={separator as "chevron" | "slash"} /> : separator}
                </span>
              )}

              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[itemBase, colorClass, "px-[var(--space-2,0.5rem)] py-[var(--space-1,0.25rem)]", "font-[var(--font-body)]"].join(" ")}
                >
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  aria-current={isActive ? "page" : undefined}
                  disabled={isDisabled}
                  className={[itemBase, colorClass, "px-[var(--space-2,0.5rem)] py-[var(--space-1,0.25rem)]", "font-[var(--font-body)]"].join(" ")}
                >
                  {item.label}
                </button>
              ) : (
                <span aria-current={isActive ? "page" : undefined} className={["px-[var(--space-2,0.5rem)] py-[var(--space-1,0.25rem)]", "font-[var(--font-body)]", colorClass].join(" ")}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
