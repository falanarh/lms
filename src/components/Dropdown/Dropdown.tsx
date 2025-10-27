"use client";
/**
 * Komponen: Dropdown
 * Tujuan: Pemilih opsi dengan dukungan pencarian item (filter) dan navigasi keyboard.
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables (fallback disediakan) untuk warna, spacing, radius, font, dsb.
 * - Aksesibilitas: Tombol pemicu dengan aria-expanded, popover berisi input pencarian, daftar berperan listbox, item berperan option.
 * - Keyboard: Tab untuk fokus, Enter/Space untuk buka/tutup & pilih, Panah Atas/Bawah untuk navigasi, Esc untuk menutup.
 *
 * Import
 * ```tsx
 * import { Dropdown } from "@/components/Dropdown";
 * ```
 *
 * Props
 * - items: Array<{ value: string; label: string; disabled?: boolean }>
 * - value?: string — mode terkontrol
 * - defaultValue?: string — mode tak terkontrol
 * - onChange?: (value: string, item: DropdownItem) => void
 * - placeholder?: string (default: "Select")
 * - label?: string — label teks sebelum dropdown (mis. "Category:")
 * - searchable?: boolean (default: true)
 * - disabled?: boolean
 * - error?: boolean — state error untuk gaya danger
 * - size?: "sm" | "md" | "lg" (default: "md")
 * - variant?: "solid" | "outline" | "ghost" (default: "solid")
 * - className?: string
 * - name?: string — nama field untuk form submit (value tersimpan di input hidden)
 *
 * CSS Variables yang digunakan (fallback tersedia):
 * - --color-foreground, --color-foreground-muted
 * - --color-primary, --color-primary-hover, --color-primary-subtle
 * - --color-focus-ring, --color-ring-offset
 * - --surface, --surface-elevated, --border
 * - --radius-md, --radius-lg
 * - --font-sm, --font-md, --font-lg
 * - --space-1, --space-2, --space-3
 * - --danger, --on-danger
 *
 * Preview
 * - Buka route `/preview/dropdown` untuk melihat varian, size, disabled, error, dan pencarian.
 */
import React from "react";

export type DropdownItem = { value: string; label: string; disabled?: boolean };
export type DropdownSize = "sm" | "md" | "lg";
export type DropdownVariant = "solid" | "outline" | "ghost";

export interface DropdownProps {
  items: DropdownItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, item: DropdownItem) => void;
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: boolean;
  size?: DropdownSize;
  variant?: DropdownVariant;
  className?: string;
  name?: string;
}

const sizeMap: Record<DropdownSize, { button: string; text: string; menu: string; input: string }> = {
  sm: {
    button: "h-9 px-3 rounded-[var(--radius-md,8px)]",
    text: "text-[var(--font-sm,0.875rem)]",
    menu: "py-[var(--space-1,0.25rem)]",
    input: "h-9 px-3 text-[var(--font-sm,0.875rem)]",
  },
  md: {
    button: "h-10 px-3.5 rounded-[var(--radius-md,8px)]",
    text: "text-[var(--font-md,1rem)]",
    menu: "py-[var(--space-2,0.5rem)]",
    input: "h-10 px-3.5 text-[var(--font-md,1rem)]",
  },
  lg: {
    button: "h-12 px-4 rounded-[var(--radius-lg,12px)]",
    text: "text-[var(--font-lg,1.125rem)]",
    menu: "py-[var(--space-2,0.5rem)]",
    input: "h-12 px-4 text-[var(--font-lg,1.125rem)]",
  },
};

function variantClasses(variant: DropdownVariant, error?: boolean) {
  if (error) {
    return [
      "bg-[var(--danger,#dc2626)] text-[var(--on-danger,#ffffff)] border border-transparent",
      "hover:bg-[color-mix(in_oklab,var(--danger,#dc2626)_92%,black)]",
    ].join(" ");
  }
  switch (variant) {
    case "outline":
      return [
        "bg-[var(--surface,white)] text-[var(--color-foreground,#111827)]",
        "border border-[var(--border,rgba(0,0,0,0.12))]",
        "hover:bg-[color-mix(in_oklab,var(--surface,white)_94%,black)]",
      ].join(" ");
    case "ghost":
      return [
        "bg-transparent text-[var(--color-foreground,#111827)]",
        "hover:bg-[var(--color-primary-subtle,rgba(37,99,235,0.08))]",
        "border border-transparent",
      ].join(" ");
    case "solid":
    default:
      return [
        "bg-[var(--surface,white)] text-[var(--color-foreground,#111827)]",
        "border border-[var(--border,rgba(0,0,0,0.12))]",
      ].join(" ");
  }
}

export function Dropdown({
  items,
  value,
  defaultValue,
  onChange,
  placeholder = "Select",
  label,
  searchable = true,
  disabled,
  error,
  size = "md",
  variant = "solid",
  className,
  name,
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
  const selectedValue = isControlled ? value : internal;
  const selectedItem = items.find((it) => it.value === selectedValue);

  const filtered = query
    ? items.filter((it) => it.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  const sz = sizeMap[size];
  const isDisabled = !!disabled;

  function commitChange(v: string) {
    const item = items.find((it) => it.value === v);
    if (!item) return;
    if (!isControlled) setInternal(v);
    onChange?.(v, item);
  }

  function closeAndFocusButton() {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  React.useEffect(() => {
    function onDocKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        closeAndFocusButton();
      }
    }
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        listRef.current && !listRef.current.contains(target) &&
        inputRef.current && !inputRef.current.contains(target)
      ) {
        setOpen(false);
        setQuery("");
        setActiveIndex(-1);
      }
    }
    document.addEventListener("keydown", onDocKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onDocKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [open]);

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (isDisabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => inputRef.current?.focus());
      setActiveIndex(0);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min((i < 0 ? 0 : i) + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const pick = filtered[activeIndex];
      if (pick && !pick.disabled) {
        commitChange(pick.value);
        closeAndFocusButton();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAndFocusButton();
    }
  }

  const listboxId = React.useId();

  return (
    <div className={["inline-flex items-center gap-[var(--space-2,0.5rem)]", className].filter(Boolean).join(" ")}> 
      {label && (
        <span className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)] font-[var(--font-body)]">
          {label}
        </span>
      )}

      {name && <input type="hidden" name={name} value={selectedValue ?? ""} />}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          className={[
            "inline-flex items-center justify-between min-w-36",
            sz.button,
            sz.text,
            variantClasses(variant, error),
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset,#ffffff)]",
            isDisabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => {
            if (isDisabled) return;
            setOpen((o) => !o);
            if (!open) requestAnimationFrame(() => inputRef.current?.focus());
          }}
          onKeyDown={onButtonKeyDown}
        >
          <span className="truncate pr-2">
            {selectedItem ? selectedItem.label : (
              <span className="text-[var(--color-foreground-muted,#6b7280)]">{placeholder}</span>
            )}
          </span>
          <ChevronDownIcon />
        </button>

        {open && (
          <div
            className={[
              "absolute left-0 mt-1 w-full z-50",
              "rounded-[var(--radius-md,8px)] shadow-lg",
              "bg-[var(--surface-elevated,white)] border border-[var(--border,rgba(0,0,0,0.12))]",
            ].join(" ")}
          >
            {searchable && (
              <div className={["p-[var(--space-2,0.5rem)]"].join(" ")}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  className={[
                    "w-full rounded-[var(--radius-md,8px)]",
                    sz.input,
                    "bg-[var(--surface,white)] text-[var(--color-foreground,#111827)]",
                    "border border-[var(--border,rgba(0,0,0,0.12))]",
                    "placeholder:text-[var(--color-foreground-muted,#6b7280)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset,#ffffff)]",
                  ].join(" ")}
                  aria-label="Search options"
                />
              </div>
            )}

            <ul
              id={listboxId}
              ref={listRef}
              role="listbox"
              tabIndex={-1}
              className={["max-h-60 overflow-auto", sz.menu].join(" ")}
              onKeyDown={onListKeyDown}
            >
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-[var(--color-foreground-muted,#6b7280)]">No results</li>
              )}
              {filtered.map((it, idx) => {
                const selected = it.value === selectedValue;
                const focused = idx === activeIndex;
                return (
                  <li key={it.value} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={[
                        "w-full text-left px-3 py-2",
                        "flex items-center justify-between",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)]",
                        selected
                          ? "bg-[var(--color-primary-subtle,rgba(37,99,235,0.08))] text-[var(--color-primary,#2563eb)]"
                          : "text-[var(--color-foreground,#111827)] hover:bg-[color-mix(in_oklab,white_94%,var(--color-primary,#2563eb))]",
                        it.disabled ? "opacity-50 cursor-not-allowed" : "",
                        focused ? "outline-none ring-1 ring-[var(--color-focus-ring,#2563eb)]" : "",
                      ].join(" ")}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        if (it.disabled) return;
                        commitChange(it.value);
                        closeAndFocusButton();
                      }}
                    >
                      <span className="truncate pr-2">{it.label}</span>
                      {selected && <CheckIcon />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default Dropdown;

