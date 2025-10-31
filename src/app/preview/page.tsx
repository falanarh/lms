"use client";
import Link from "next/link";
import PREVIEW_REGISTRY from "@/preview/registry";

export default function PreviewIndexPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Preview Registry</h1>
      <p className="text-sm text-gray-600 mb-6">
        Daftar semua komponen yang tersedia untuk preview.
      </p>
      <ul className="grid gap-3">
        {PREVIEW_REGISTRY.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/preview/${entry.slug}`}
              className="block rounded-md border p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">{entry.title}</div>
              <div className="text-xs text-gray-500">/preview/{entry.slug}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

