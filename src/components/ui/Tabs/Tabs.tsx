"use client";
/**
 * Komponen: Tabs
 * Tujuan: Navigasi tab dengan a11y lengkap dan tokenized styling.
 *
 * - Styling: Tailwind + CSS variables (fallback aman) dari tokens.css
 * - A11y: role=tablist/tab/tabpanel, roving tabindex, ArrowLeft/Right, Home/End
 * - Variants: pill | underline | soft
 * - Sizes: sm | md | lg
 */
import React from "react";

export type TabsVariant = "pill" | "underline" | "soft";
export type TabsSize = "sm" | "md" | "lg";

export type TabItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  counter?: number;
};

export type TabsProps = {
  items: TabItem[];
  panels?: Record<string, React.ReactNode>;
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  className?: string;
  "aria-label"?: string;
  align?: "start" | "center" | "end" | "justify";
  hidePanel?: boolean;
};

const sizeMap: Record<TabsSize, { pad: string; text: string; radius: string; gap: string }> = {
  sm: { pad: "px-2.5 py-1.5", text: "text-[var(--font-sm,0.875rem)]", radius: "rounded-[var(--radius-md,8px)]", gap: "gap-1.5" },
  md: { pad: "px-3.5 py-2", text: "text-[var(--font-sm,0.875rem)]", radius: "rounded-[var(--radius-lg,12px)]", gap: "gap-2" },
  lg: { pad: "px-4 py-2.5", text: "text-[var(--font-md,1rem)]", radius: "rounded-[var(--radius-lg,12px)]", gap: "gap-2.5" },
};

function tabClasses(active: boolean, variant: TabsVariant) {
  if (variant === "underline") {
    return [
      "relative",
      active
        ? "text-[var(--color-foreground,#111827)]"
        : "text-[var(--color-foreground-muted,#6b7280)] hover:text-[var(--color-foreground,#111827)]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2",
    ].join(" ");
  }
  // Variant selain underline
  const isSoft = variant === "soft";
  const isPill = variant === "pill";

  // Non-aktif: selalu transparan (tidak ada background putih)
  // Aktif: pill -> putih lebih rounded, soft -> subtle primary tint
  const activeSurface = isPill
    ? "bg-[var(--surface,white)] text-[var(--color-foreground,#111827)]"
    : isSoft
    ? "bg-[var(--color-primary-50,rgba(37,99,235,0.08))] text-[var(--color-primary,#2563eb)]"
    : "text-[var(--color-foreground,#111827)]";

  return [
    "inline-flex items-center transition-colors",
    isPill ? "rounded-full" : "",
    active
      ? activeSurface
      : "bg-transparent text-[var(--color-foreground-muted,#6b7280)] hover:text-[var(--color-foreground,#111827)] hover:bg-[color-mix(in_oklab,white_92%,var(--color-primary,#2563eb))]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2",
  ].join(" ");
}

export function Tabs({
  items,
  panels = {},
  activeKey,
  defaultActiveKey,
  onChange,
  variant = "pill",
  size = "md",
  className,
  "aria-label": ariaLabel = "Tabs",
  align = "start",
  hidePanel = false,
}: TabsProps) {
  const isControlled = typeof activeKey !== "undefined";
  const [internal, setInternal] = React.useState<string>(
    defaultActiveKey ?? items.find((i) => !i.disabled)?.key ?? items[0]?.key ?? ""
  );
  const current = isControlled ? activeKey! : internal;

  const sz = sizeMap[size];
  const listRef = React.useRef<HTMLDivElement>(null);

  const setActive = (key: string) => {
    if (!isControlled) setInternal(key);
    onChange?.(key);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const enabled = items.filter((i) => !i.disabled);
    const index = enabled.findIndex((i) => i.key === current);
    if (index === -1) return;
    let nextIndex = index;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % enabled.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + enabled.length) % enabled.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = enabled.length - 1;
    else return;
    e.preventDefault();
    setActive(enabled[nextIndex].key);
    // move focus
    const btn = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab-key="${enabled[nextIndex].key}"]`
    );
    btn?.focus();
  };

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}> 
      {/** Tablist */}
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={[
          "flex items-center flex-wrap gap-1",
          align === "center" ? "justify-center" : align === "end" ? "justify-end" : align === "justify" ? "justify-between w-full" : "justify-start",
          variant === "underline"
            ? "border-b border-[var(--border,rgba(0,0,0,0.12))]"
            : variant === "pill"
            ? "bg-[var(--surface-elevated,#f3f4f6)] p-1 rounded-full"
            : "bg-[var(--surface-elevated,#f3f4f6)] p-1 rounded-[var(--radius-lg,12px)]",
        ].join(" ")}
      >
        {items.map((item) => {
          const active = item.key === current;
          const isDisabled = !!item.disabled;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${item.key}`}
              id={`tab-${item.key}`}
              data-tab-key={item.key}
              tabIndex={active ? 0 : -1}
              disabled={isDisabled}
              onClick={() => !isDisabled && setActive(item.key)}
              className={[
                tabClasses(active, variant),
                sz.pad,
                sz.text,
                variant === "pill" ? "" : sz.radius,
                "data-[disabled=true]:opacity-50",
              ].join(" ")}
              data-disabled={isDisabled || undefined}
            >
              <span className={["inline-flex items-center", sz.gap].join(" ")}> 
                {item.icon ? <span aria-hidden>{item.icon}</span> : null}
                <span>{item.label}</span>
                {typeof item.counter === "number" && (
                  <span className="px-1.5 py-[1px] rounded-full text-[var(--font-3xs,0.625rem)] leading-none border border-[var(--border,rgba(0,0,0,0.12))] text-[var(--color-foreground-muted,#6b7280)]">
                    {item.counter}
                  </span>
                )}
              </span>
              {variant === "underline" && (
                <span
                  aria-hidden
                  className={[
                    "absolute left-0 right-0 -bottom-[1px] h-0.5",
                    active ? "bg-[var(--color-primary,#2563eb)]" : "bg-transparent",
                  ].join(" ")}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      {!hidePanel && current && (
        <div
          id={`panel-${current}`}
          role="tabpanel"
          aria-labelledby={`tab-${current}`}
          className="mt-4"
        >
          {panels[current]}
        </div>
      )}
    </div>
  );
}

// Ikon contoh untuk preview
export function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5h.01M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default Tabs;
