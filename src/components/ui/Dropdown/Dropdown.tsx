"use client";
/**
 * Dropdown Component - Light Mode Only
 * Optimized with clean, visible colors for light backgrounds
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
    button: "h-9 px-3 rounded-lg",
    text: "text-sm",
    menu: "py-1",
    input: "h-9 px-3 text-sm",
  },
  md: {
    button: "h-10 px-3.5 rounded-lg",
    text: "text-base",
    menu: "py-2",
    input: "h-10 px-3.5 text-base",
  },
  lg: {
    button: "h-12 px-4 rounded-xl",
    text: "text-lg",
    menu: "py-2",
    input: "h-12 px-4 text-lg",
  },
};

function variantClasses(variant: DropdownVariant, error?: boolean) {
  if (error) {
    return "bg-red-600 text-white border border-red-600 hover:bg-red-700";
  }
  switch (variant) {
    case "outline":
      return "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50";
    case "ghost":
      return "bg-transparent text-gray-900 hover:bg-blue-50 border border-transparent";
    case "solid":
      return [
        "border-2 border-[var(--border,rgba(0,0,0,0.12))]",
      ]
    default:
      return "bg-white text-gray-900 border border-gray-300";
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
    <div className={["flex items-center gap-2", className].filter(Boolean).join(" ")}> 
      {label && (
        <span className="text-sm text-gray-700 font-medium">
          {label}
        </span>
      )}
      {name && <input type="hidden" name={name} value={selectedValue ?? ""} />}

      <div className="relative w-full">
        <button
          ref={buttonRef}
          type="button"
          className={[
            "w-full inline-flex items-center justify-between",
            sz.button,
            sz.text,
            variantClasses(variant, error),
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            isDisabled ? "opacity-50 cursor-not-allowed" : "",
            "transition-colors duration-150",
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
          disabled={isDisabled}
        >
          <span className="truncate pr-2 text-gray-900">
            {selectedItem ? (
              <span className="text-gray-900">{selectedItem.label}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </span>
          <ChevronDownIcon />
        </button>

        {open && (
          <div className="absolute left-0 mt-1 w-full z-50 rounded-lg shadow-lg bg-white border border-gray-200">
            {searchable && (
              <div className="p-2 border-b border-gray-100">
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
                    "w-full rounded-lg",
                    sz.input,
                    "bg-white text-gray-900",
                    "border border-gray-300",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
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
                <li className="px-3 py-2 text-gray-500 text-sm">No results</li>
              )}
              {filtered.map((it, idx) => {
                const selected = it.value === selectedValue;
                const focused = idx === activeIndex;
                return (
                  <li key={it.value+idx} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={[
                        "w-full text-left px-3 py-2",
                        "flex items-center justify-between",
                        "transition-colors duration-150",
                        "focus:outline-none",
                        "text-gray-900", // Force dark text
                        selected
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "hover:bg-gray-100",
                        it.disabled ? "opacity-50 cursor-not-allowed text-gray-400" : "",
                        focused ? "ring-2 ring-inset ring-blue-500" : "",
                      ].join(" ")}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        if (it.disabled) return;
                        commitChange(it.value);
                        closeAndFocusButton();
                      }}
                      disabled={it.disabled}
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
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-hidden
      className="text-gray-600"
    >
      <path 
        d="M6 8l4 4 4-4" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-hidden
      className="text-blue-600"
    >
      <path 
        d="M20 6L9 17l-5-5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

export default Dropdown;