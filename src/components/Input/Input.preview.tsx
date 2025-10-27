"use client";
import React from "react";
import { Input } from "@/components/Input";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function InputPreview() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Default</h2>
        <Input label="Email" placeholder="you@example.com" helperText="We’ll never share your email." />
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Sizes</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input size="sm" label="Small" placeholder="Type here" />
          <Input size="md" label="Medium" placeholder="Type here" />
          <Input size="lg" label="Large" placeholder="Type here" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Icons</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Search" placeholder="Search..." leftIcon={<SearchIcon />} />
          <Input label="Email" placeholder="you@example.com" rightIcon={<MailIcon />} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">States</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Focused" placeholder="Auto focus" autoFocus />
          <Input label="Disabled" placeholder="Disabled" disabled />
          <Input label="Invalid" placeholder="your value" isInvalid errorText="This field is required" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Loading</h2>
        <Input label="Loading" placeholder="Fetching..." isLoading />
      </section>
    </div>
  );
}

