"use client";
import React from "react";
import { Button } from "@/components/ui/Button";

export default function ButtonPreview() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button disabled>Disabled</Button>
        <Button isLoading>Loading</Button>
        <Button error>Error</Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button leftIcon={<DotsIcon />}>Left Icon</Button>
        <Button rightIcon={<ArrowRightIcon />}>Right Icon</Button>
      </div>
    </div>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

