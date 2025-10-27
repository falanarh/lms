"use client";
import React from "react";
import { Dropdown } from "@/components/ui/Dropdown";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "mobile", label: "Mobile" },
  { value: "devops", label: "DevOps" },
  { value: "ml", label: "Machine Learning" },
  { value: "uiux", label: "UI/UX" },
  { value: "data", label: "Data" },
];

export default function DropdownPreview() {
  const [value, setValue] = React.useState("all");

  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Default</h2>
        <Dropdown
          label="Category:"
          items={OPTIONS}
          value={value}
          onChange={(v) => setValue(v)}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Sizes</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Dropdown size="sm" label="Category:" items={OPTIONS} value={value} onChange={setValue} />
          <Dropdown size="md" label="Category:" items={OPTIONS} value={value} onChange={setValue} />
          <Dropdown size="lg" label="Category:" items={OPTIONS} value={value} onChange={setValue} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Variants</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Dropdown variant="solid" label="Variant" items={OPTIONS} defaultValue="frontend" />
          <Dropdown variant="outline" label="Variant" items={OPTIONS} defaultValue="frontend" />
          <Dropdown variant="ghost" label="Variant" items={OPTIONS} defaultValue="frontend" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Disabled & Error</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Dropdown disabled label="Category:" items={OPTIONS} defaultValue="all" />
          <Dropdown error label="Category:" items={OPTIONS} defaultValue="backend" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Search</h2>
        <Dropdown label="Search:" items={OPTIONS} defaultValue="uiux" searchable />
      </section>
    </div>
  );
}

