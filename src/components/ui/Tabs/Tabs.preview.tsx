"use client";
import React from "react";
import Tabs, { InfoIcon, TabItem } from "@/components/ui/Tabs";

export default function TabsPreview() {
  const baseItems: TabItem[] = [
    { key: "information", label: "Information", icon: <InfoIcon className="size-4" /> },
    { key: "content", label: "Course Contents", counter: 12 },
    { key: "discussion", label: "Discussion Forum" },
    { key: "reviews", label: "Ratings & Reviews", disabled: false },
  ];

  const panels = {
    information: <Panel title="Information" />,
    content: <Panel title="Course Contents" />,
    discussion: <Panel title="Discussion Forum" />,
    reviews: <Panel title="Ratings & Reviews" />,
  } as const;

  return (
    <div className="flex flex-col gap-8 p-6">
      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Pill / md (default)</h3>
        <Tabs items={baseItems} panels={panels} defaultActiveKey="information" />
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Soft / sm</h3>
        <Tabs items={baseItems} panels={panels} defaultActiveKey="content" variant="soft" size="sm" />
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Underline / lg</h3>
        <Tabs items={baseItems} panels={panels} defaultActiveKey="reviews" variant="underline" size="lg" />
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Alignment: center / underline</h3>
        <Tabs items={baseItems} panels={panels} defaultActiveKey="content" variant="underline" align="center" />
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Alignment: justify (no panel)</h3>
        <Tabs items={baseItems} defaultActiveKey="information" variant="pill" align="justify" hidePanel />
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Disabled Tab</h3>
        <Tabs
          items={[...baseItems.slice(0, 2), { key: "locked", label: "Locked", disabled: true }, ...baseItems.slice(2)]}
          panels={{ ...panels, locked: <Panel title="Locked" /> }}
          defaultActiveKey="information"
        />
      </section>
    </div>
  );
}

function Panel({ title }: { title: string }) {
  return (
    <div className="p-4 rounded-[var(--radius-lg,12px)] bg-[var(--surface,white)] text-[var(--color-foreground,#111827)]">
      <p className="text-[var(--font-md,1rem)]">{title} content</p>
    </div>
  );
}
