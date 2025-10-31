"use client";
import React from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function BreadcrumbPreview() {
  const baseItems = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "My Course", href: "/courses/mine" },
    { label: "Detail", isActive: true },
  ];

  const [disabled, setDisabled] = React.useState(false);

  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Default</h2>
        <Breadcrumb items={baseItems} />
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Sizes</h2>
        <div className="space-y-2">
          <Breadcrumb size="sm" items={baseItems} />
          <Breadcrumb size="md" items={baseItems} />
          <Breadcrumb size="lg" items={baseItems} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Separators</h2>
        <div className="space-y-2">
          <Breadcrumb separator="chevron" items={baseItems} />
          <Breadcrumb separator="slash" items={baseItems} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-[var(--font-sm,0.875rem)] text-[color-mix(in_oklab,var(--color-foreground-muted,#6b7280)_80%,transparent)]">
            <input type="checkbox" className="mr-2" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
            Disable links
          </label>
        </div>
        <Breadcrumb
          items={baseItems.map((it, i) => (i < baseItems.length - 1 ? { ...it, disabled } : it))}
        />
      </section>
    </div>
  );
}
