"use client";
import React from "react";
import Badge from "@/components/Badge";

export default function BadgePreview() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="flex items-center gap-2 flex-wrap">
        <Badge>Neutral</Badge>
        <Badge tone="primary">Primary</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
      </section>

      <section className="flex items-center gap-2 flex-wrap">
        <Badge variant="solid" tone="primary">Solid</Badge>
        <Badge variant="soft" tone="primary">Soft</Badge>
        <Badge variant="outline" tone="primary">Outline</Badge>
        <Badge variant="ghost" tone="primary">Ghost</Badge>
      </section>

      <section className="flex items-center gap-2 flex-wrap">
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge rounded="md">Rounded MD</Badge>
      </section>

      <section className="flex items-center gap-2 flex-wrap">
        <Badge onClose={() => {}}>Dismissable</Badge>
        <Badge variant="outline" tone="danger" onClose={() => {}}>Error</Badge>
        <Badge variant="soft" tone="success" onClose={() => {}}>Saved</Badge>
      </section>

      <section className="flex items-center gap-2 flex-wrap">
        <Badge disabled>Disabled</Badge>
      </section>
    </div>
  );
}

