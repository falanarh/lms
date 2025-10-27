"use client";
/**
 * Komponen: Pagination
 * Tujuan: Navigasi halaman bernomor dengan tombol Previous/Next, dukungan ellipsis, dan a11y lengkap.
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables (fallback disediakan) untuk warna, spacing, radius, font.
 * - Aksesibilitas: <nav aria-label="Pagination">, daftar <ul>/<li>, tombol dengan aria-current pada halaman aktif.
 * - Keyboard: Tab fokus tombol, Enter/Space untuk aktivasi. Focus ring terlihat via var(--color-focus-ring).
 *
 * Import
 * ```tsx
 * import { Pagination } from "@/components/Pagination";
 * ```
 *
 * Props
 * - totalPages: number (>= 1)
 * - currentPage: number (1-based)
 * - onPageChange: (page: number) => void
 * - siblingCount?: number (default: 1) — jumlah tetangga di sekitar halaman aktif
 * - boundaryCount?: number (default: 1) — jumlah awal/akhir yang selalu tampil
 * - showPrevNext?: boolean (default: true)
 * - showFirstLast?: boolean (default: false)
 * - disabled?: boolean
 * - size?: "sm" | "md" | "lg" (default: "md") — mempengaruhi tinggi/teks tombol
 * - className?: string
 * - ariaLabel?: string (default: "Pagination")
 *
 * CSS Variables yang digunakan (fallback tersedia):
 * - --color-foreground, --color-foreground-muted
 * - --color-primary, --color-primary-subtle, --color-on-primary
 * - --color-focus-ring, --color-ring-offset
 * - --border
 * - --radius-md
 * - --font-sm, --font-md
 * - --space-1, --space-2
 */
import React from "react";

export type PaginationSize = "sm" | "md" | "lg";

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  disabled?: boolean;
  size?: PaginationSize;
  className?: string;
  ariaLabel?: string;
}

type Item = number | "ellipsis";

function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function usePagination(
  totalPages: number,
  currentPage: number,
  siblingCount: number,
  boundaryCount: number
): Item[] {
  const totalNumbers = siblingCount * 2 + 3; // current + siblings + 2 boundaries implied later
  const totalBlocks = totalNumbers + 2; // including 2 ellipsis

  if (totalPages <= totalBlocks) {
    return range(1, totalPages);
  }

  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);

  const leftSibling = Math.max(currentPage - siblingCount, boundaryCount + 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount - 1);

  const showLeftEllipsis = leftSibling > boundaryCount + 2;
  const showRightEllipsis = rightSibling < totalPages - boundaryCount - 1;

  const middle = range(leftSibling, rightSibling);

  const items: Item[] = [...startPages];
  if (showLeftEllipsis) items.push("ellipsis");
  items.push(...middle);
  if (showRightEllipsis) items.push("ellipsis");
  items.push(...endPages);
  return items;
}

const sizeMap: Record<PaginationSize, { button: string; text: string; gap: string }> = {
  sm: { button: "h-8 min-w-8 px-2 text-[var(--font-sm,0.875rem)]", text: "text-[var(--font-sm,0.875rem)]", gap: "gap-[var(--space-1,0.25rem)]" },
  md: { button: "h-9 min-w-9 px-2.5 text-[var(--font-sm,0.875rem)]", text: "text-[var(--font-sm,0.875rem)]", gap: "gap-[var(--space-2,0.5rem)]" },
  lg: { button: "h-11 min-w-11 px-3 text-[var(--font-md,1rem)]", text: "text-[var(--font-md,1rem)]", gap: "gap-[calc(var(--space-2,0.5rem)+2px)]" },
};

const baseBtn = [
  "inline-flex items-center justify-center",
  "rounded-[var(--radius-md,8px)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset,#ffffff)]",
  "transition-colors",
].join(" ");

const btnGhost = [
  "text-[var(--color-foreground,#111827)]",
  "hover:bg-[var(--color-primary-subtle,rgba(37,99,235,0.08))]",
  "border border-[var(--border,rgba(0,0,0,0.12))]",
  "bg-[var(--surface,white)]",
].join(" ");

const btnActive = [
  "bg-[var(--color-primary,#2563eb)]",
  "text-[var(--color-on-primary,#ffffff)]",
  "border border-transparent",
].join(" ");

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EllipsisIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="6" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="18" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showPrevNext = true,
  showFirstLast = false,
  disabled,
  size = "md",
  className,
  ariaLabel = "Pagination",
}: PaginationProps) {
  const items = usePagination(totalPages, currentPage, siblingCount, boundaryCount);
  const sz = sizeMap[size];
  const isDisabled = !!disabled;

  function goTo(page: number) {
    if (page < 1 || page > totalPages) return;
    if (!isDisabled && page !== currentPage) onPageChange(page);
  }

  const commonBtn = `${baseBtn} ${sz.button} ${btnGhost}`;

  return (
    <nav aria-label={ariaLabel} className={["mx-auto flex w-full justify-center", className].filter(Boolean).join(" ")}>
      <ul className={["flex flex-row items-center", sz.gap].join(" ")}>
        {showFirstLast && (
          <li>
            <button
              type="button"
              className={[commonBtn, isDisabled || currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
              onClick={() => goTo(1)}
              aria-label="Go to first page"
              disabled={isDisabled || currentPage === 1}
            >
              <span className={sz.text}>First</span>
            </button>
          </li>
        )}

        {showPrevNext && (
          <li>
            <button
              type="button"
              className={[commonBtn, isDisabled || currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
              onClick={() => goTo(currentPage - 1)}
              aria-label="Go to previous page"
              disabled={isDisabled || currentPage === 1}
            >
              <ChevronLeftIcon />
            </button>
          </li>
        )}

        {items.map((it, idx) => (
          <li key={`${it}-${idx}`}>
            {it === "ellipsis" ? (
              <div className={["inline-flex items-center justify-center", sz.button, sz.text, "text-[var(--color-foreground-muted,#6b7280)]"].join(" ")} aria-hidden>
                <EllipsisIcon />
              </div>
            ) : (
              <button
                type="button"
                aria-current={it === currentPage ? "page" : undefined}
                className={[
                  commonBtn,
                  it === currentPage ? btnActive : "",
                ].join(" ")}
                onClick={() => goTo(it)}
                disabled={isDisabled}
              >
                <span className={sz.text}>{it}</span>
              </button>
            )}
          </li>
        ))}

        {showPrevNext && (
          <li>
            <button
              type="button"
              className={[commonBtn, isDisabled || currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
              onClick={() => goTo(currentPage + 1)}
              aria-label="Go to next page"
              disabled={isDisabled || currentPage === totalPages}
            >
              <ChevronRightIcon />
            </button>
          </li>
        )}

        {showFirstLast && (
          <li>
            <button
              type="button"
              className={[commonBtn, isDisabled || currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
              onClick={() => goTo(totalPages)}
              aria-label="Go to last page"
              disabled={isDisabled || currentPage === totalPages}
            >
              <span className={sz.text}>Last</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Pagination;

