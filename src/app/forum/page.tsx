import React from "react";
import { ForumListContainer } from "@/components/shared/ForumList/ForumList";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Forum } from "@/components/shared/ForumList/ForumList";

// Sample forum data
const sampleForums = [
  {
    id: "1",
    title: "Pengembangan Web Fundamental",
    description:
      "Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.",
    type: "course" as const,
    lastActivity: "2023-10-28T10:30:00Z",
    totalTopics: 42,
  },
  {
    id: "2",
    title: "React dan Next.js",
    description:
      "Berbagi pengetahuan tentang React, Next.js, dan ekosistemnya.",
    type: "course" as const,
    lastActivity: "2023-10-27T15:45:00Z",
    totalTopics: 38,
  },
  {
    id: "3",
    title: "Umum",
    description:
      "Diskusi umum tentang topik teknologi dan pengembangan perangkat lunak.",
    type: "general" as const,
    lastActivity: "2023-10-28T08:15:00Z",
    totalTopics: 67,
  },
  {
    id: "4",
    title: "Database dan Backend",
    description: "Pembahasan tentang database, API, dan pengembangan backend.",
    type: "course" as const,
    lastActivity: "2023-10-26T12:20:00Z",
    totalTopics: 29,
  },
  {
    id: "5",
    title: "UI/UX Design",
    description:
      "Berbagi inspirasi dan teknik desain antarmuka pengguna dan pengalaman pengguna.",
    type: "course" as const,
    lastActivity: "2023-10-28T14:20:00Z",
    totalTopics: 56,
  },
  {
    id: "6",
    title: "Mobile Development",
    description:
      "Pembahasan tentang pengembangan aplikasi mobile untuk iOS dan Android.",
    type: "course" as const,
    lastActivity: "2023-10-27T09:30:00Z",
    totalTopics: 34,
  },
  {
    id: "7",
    title: "DevOps dan Deployment",
    description:
      "Teknik dan praktik terbaik untuk deployment dan operasi aplikasi.",
    type: "course" as const,
    lastActivity: "2023-10-26T16:45:00Z",
    totalTopics: 23,
  },
  {
    id: "8",
    title: "Machine Learning",
    description:
      "Diskusi tentang konsep dan implementasi machine learning dan AI.",
    type: "course" as const,
    lastActivity: "2023-10-28T11:10:00Z",
    totalTopics: 48,
  },
  {
    id: "9",
    title: "Karir IT",
    description:
      "Berbagi pengalaman dan tips tentang karir di industri teknologi.",
    type: "general" as const,
    lastActivity: "2023-10-27T13:25:00Z",
    totalTopics: 71,
  },
  {
    id: "10",
    title: "Cybersecurity",
    description:
      "Pembahasan tentang keamanan siber dan praktik terbaik dalam melindungi data.",
    type: "course" as const,
    lastActivity: "2023-10-28T07:50:00Z",
    totalTopics: 31,
  },
  {
    id: "11",
    title: "Cloud Computing",
    description: "Eksplorasi platform cloud dan layanan komputasi awan.",
    type: "course" as const,
    lastActivity: "2023-10-26T14:15:00Z",
    totalTopics: 27,
  },
  {
    id: "12",
    title: "Open Source",
    description:
      "Kontribusi dan diskusi tentang proyek open source dan komunitasnya.",
    type: "general" as const,
    lastActivity: "2023-10-28T12:40:00Z",
    totalTopics: 52,
  },
];

export default function ForumPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Forum", isActive: true },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Forum Heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Daftar Forum</h1>
      <p className="text-gray-600 mb-6">
        Temukan berbagai diskusi menarik seputar teknologi dan pengembangan perangkat lunak.
      </p>

      <ForumListContainer
        forums={sampleForums}
        className=""
        title=""
        showSearch={true}
        searchPlaceholder="Search forums by title or description..."
        enableFilter={true}
      />
    </div>
  );
}
