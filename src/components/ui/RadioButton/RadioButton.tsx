"use client";
/**
 * Komponen: RadioButton (Radio card group)
 * Tujuan: Pilihan tunggal (radio) dalam bentuk kartu yang dapat diatur jumlah kolom, ukuran, dan state a11y.
 *
 * Styling
 * - Hanya Tailwind + CSS variables (fallback aman) dari tokens.css
 * - Fokus memakai ring via var(--color-focus-ring)
 *
 * API
 * - name: string (required) — nama grup radio
 * - options: { value: string; label: string; disabled?: boolean }[]
 * - value?: string (controlled)
 * - defaultValue?: string (uncontrolled)
 * - onChange?: (value: string) => void
 * - label?: string — judul/legend
 * - columns?: 1|2|3|4 (default: 3)
 * - size?: "sm" | "md" (default: "md")
 * - disabled?: boolean — nonaktifkan semua opsi
 * - required?: boolean
 * - className?: string — kelas tambahan untuk container
 */
import React from "react";

export type RadioSize = "sm" | "md";

export type RadioOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface RadioButtonProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  columns?: 1 | 2 | 3 | 4;
  size?: RadioSize;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const sizeMap: Record<RadioSize, { card: string; text: string; box: string }> = {
  sm: { card: "h-12 px-3", text: "text-[var(--font-sm,0.875rem)]", box: "size-4 rounded-[var(--radius-sm,6px)]" },
  md: { card: "h-14 px-4", text: "text-[var(--font-sm,0.875rem)]", box: "size-5 rounded-[var(--radius-md,8px)]" },
};

export function RadioButton({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  columns = 3,
  size = "md",
  disabled,
  required,
  className,
}: RadioButtonProps) {
  const isControlled = typeof value !== "undefined";
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
  const current = isControlled ? value : internal;
  const sz = sizeMap[size];

  const gridCols = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-4" : "grid-cols-3";

  const select = (val: string) => {
    if (disabled) return;
    if (!isControlled) setInternal(val);
    onChange?.(val);
  };

  return (
    <fieldset
      className={[
        "w-full",
        disabled ? "opacity-60 pointer-events-none select-none" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {label && (
        <legend className="mb-[var(--space-2,0.5rem)] text-[var(--font-md,1rem)] font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">
          {label}
        </legend>
      )}

      <div className={["grid gap-[var(--space-3,0.75rem)]", gridCols].join(" ")}>
        {options.map((opt) => {
          const checked = current === opt.value;
          const isItemDisabled = !!disabled || !!opt.disabled;
          return (
            <label
              key={opt.value}
              className={[
                "relative w-full cursor-pointer select-none transition",
                "rounded-[var(--radius-lg,12px)] border",
                checked
                  ? "bg-[var(--color-primary-50,rgba(37,99,235,0.08))] border-[var(--color-primary,#2563eb)]"
                  : "bg-[var(--surface,white)] border-[var(--border,rgba(0,0,0,0.12))] hover:border-[color-mix(in_oklab,white_80%,var(--color-primary,#2563eb))]",
                "focus-within:ring-2 focus-within:ring-[var(--color-focus-ring,#2563eb)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-ring-offset,#ffffff)]",
                sz.card,
                isItemDisabled ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 h-full">
                <span
                  aria-hidden
                  className={[
                    "inline-flex items-center justify-center border",
                    sz.box,
                    checked
                      ? "bg-[var(--color-primary,#2563eb)] border-[var(--color-primary,#2563eb)] text-[var(--color-on-primary,#ffffff)]"
                      : "bg-[var(--surface,white)] border-[var(--border,rgba(0,0,0,0.12))] text-[var(--color-foreground-muted,#6b7280)]",
                  ].join(" ")}
                >
                  {checked && <CheckIcon className="size-3" />}
                </span>

                <span className={["min-w-0", sz.text, "text-[var(--color-foreground,#111827)]"].join(" ")}>
                  {opt.label}
                </span>

                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={checked}
                  onChange={() => select(opt.value)}
                  disabled={isItemDisabled}
                  required={required}
                  className="sr-only"
                />
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default RadioButton;

