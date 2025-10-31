"use client";
import React from "react";
import Link from "next/link";
import PREVIEW_REGISTRY from "@/preview/registry";

export default function ComponentPreviewPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = React.use(params);
  const entry = PREVIEW_REGISTRY.find((e) => e.slug === component);

  if (!entry) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <Link href="/preview" className="text-blue-600 hover:underline">
            ← Kembali ke daftar preview
          </Link>
        </div>
        <h1 className="text-xl font-semibold mb-2">Komponen tidak ditemukan</h1>
        <p className="text-sm text-gray-600">
          Tidak ada entri dengan slug "{component}" di registry.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/preview" className="text-blue-600 hover:underline">
          ← Kembali ke daftar preview
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-2">{entry.title}</h1>
      <div className="text-sm text-gray-600 mb-6">/preview/{entry.slug}</div>
      <section className="rounded-lg border p-4 bg-white">{entry.element}</section>
    </main>
  );
}
