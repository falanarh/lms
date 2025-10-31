"use client";

import React from "react";
import ForumCard from "./ForumCard";

const mockForums = [
  {
    id: "forum-1",
    title: "Diskusi Umum Mata Kuliah A",
    description:
      "Tempat untuk berdiskusi mengenai topik-topik umum yang berkaitan dengan Mata Kuliah A, di luar materi spesifik per pertemuan.",
    type: "course" as const,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    totalTopics: 12,
  },
  {
    id: "forum-2",
    title: "Tanya Jawab Seputar Final Project",
    description:
      "Punya pertanyaan atau kendala terkait final project? Diskusikan di sini agar bisa saling membantu.",
    type: "course" as const,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    totalTopics: 5,
  },
  {
    id: "forum-3",
    title: "Forum Santai & Perkenalan",
    description:
      "Gunakan forum ini untuk mengobrol santai, berkenalan dengan teman sekelas, atau membahas hal-hal di luar akademik.",
    type: "general" as const,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    totalTopics: 23,
  },
  {
    id: "forum-4",
    title: "Diskusi Tugas Mingguan",
    description:
      "Forum untuk mendiskusikan tugas-tugas mingguan dan berbagi solusi.",
    type: "course" as const,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    totalTopics: 8,
  },
  {
    id: "forum-5",
    title: "Tanya Jawab Materi Kuliah",
    description:
      "Tempat untuk bertanya dan menjawab pertanyaan seputar materi kuliah.",
    type: "course" as const,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    totalTopics: 15,
  },
];

export default function ForumCardPreview() {
  return (
    <div className="min-h-screen bg-[var(--surface-elevated,#f3f4f6)] py-12">
      <div className="mx-auto w-full max-w-3xl px-6">
        <header className="flex flex-col gap-1 mb-6">
          <h1 className="text-[var(--font-lg,1.125rem)] font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">
            Forum Card Preview
          </h1>
          <p className="text-[var(--font-sm,0.875rem)] text-[var(--color-foreground-muted,#6b7280)]">
            Preview of the redesigned ForumCard component with different forum types and data.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {mockForums.map((forum) => (
            <ForumCard key={forum.id} forum={forum} />
          ))}
        </div>
      </div>
    </div>
  );
}