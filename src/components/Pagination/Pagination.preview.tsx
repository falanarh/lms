"use client";
import React from "react";
import { Pagination } from "@/components/Pagination";

export default function PaginationPreview() {
  const [page, setPage] = React.useState(7);

  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Default</h2>
        <Pagination totalPages={5} currentPage={page} onPageChange={setPage} />
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Sizes</h2>
        <div className="flex flex-col gap-3">
          <Pagination size="sm" totalPages={12} currentPage={3} onPageChange={() => {}} />
          <Pagination size="md" totalPages={12} currentPage={6} onPageChange={() => {}} />
          <Pagination size="lg" totalPages={12} currentPage={9} onPageChange={() => {}} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Prev/Next + First/Last</h2>
        <Pagination totalPages={20} currentPage={10} onPageChange={() => {}} showFirstLast showPrevNext />
      </section>

      <section className="space-y-2">
        <h2 className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">Disabled</h2>
        <Pagination totalPages={8} currentPage={4} onPageChange={() => {}} disabled />
      </section>
    </div>
  );
}

