"use client";
import React from "react";
import { Textarea } from "@/components/Textarea";

export default function TextareaPreview() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Default</h2>
        <Textarea label="Description" placeholder="Write your course description..." helperText="Max 500 characters" />
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Sizes</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Textarea size="sm" label="Small" placeholder="Type here" />
          <Textarea size="md" label="Medium" placeholder="Type here" />
          <Textarea size="lg" label="Large" placeholder="Type here" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">States</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Textarea label="Focused" placeholder="Auto focus" autoFocus />
          <Textarea label="Disabled" placeholder="Disabled" disabled />
          <Textarea label="Invalid" placeholder="your value" isInvalid errorText="This field is required" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Loading</h2>
        <Textarea label="Loading" placeholder="Fetching..." isLoading />
      </section>
    </div>
  );
}

