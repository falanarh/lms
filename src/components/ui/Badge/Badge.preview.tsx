"use client";
import React from "react";
import Badge from "@/components/ui/Badge";

export default function BadgePreview() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="flex items-center gap-2 flex-wrap">
        <Badge>Neutral</Badge>
        <Badge variant="default">Primary</Badge>
        <Badge variant="secondary">Success</Badge>
        <Badge variant="outline">Warning</Badge>
        <Badge variant="destructive">Danger</Badge>
      </section>

      <section className="flex items-center gap-2 flex-wrap">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </section>

      <section className="flex items-center gap-2 flex-wrap">
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge variant="outline">Rounded MD</Badge>
      </section>

      <section className="flex items-center gap-2 flex-wrap">
        <Badge onClose={() => {}}>Dismissable</Badge>
        <Badge variant="destructive" onClose={() => {}}>Error</Badge>
        <Badge variant="secondary" onClose={() => {}}>Saved</Badge>
        <Badge variant="outline">Disabled</Badge></section>

      <section className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">Disabled</Badge>
      </section>
    </div>
  );
}

