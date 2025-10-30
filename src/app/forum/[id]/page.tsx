"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle, Users, Clock, TrendingUp, Pin, Lock, Plus, Search, Send } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Topic, type TopicMeta, type Discussion } from "@/components/shared/DiscussionCard/Topic";
import { createDiscussion, validateAllDiscussions } from "@/components/shared/DiscussionCard/utils";
import { InfiniteTopics } from "@/components/shared/InfiniteScroll/InfiniteTopics";
import type { Forum } from "@/components/shared/ForumList/ForumList";

// Sample discussion data untuk forum list
const forumSampleDiscussions = [
  {
    id: "1",
    title: "Bagaimana cara implementasi authentication di Next.js?",
    content: "Saya sedang belajar membuat web dengan Next.js dan ingin menambahkan fitur login/logout. Apa saja library yang direkomendasikan dan bagaimana cara implementasinya?",
    author: { name: "Ahmad Rizki", role: "Mahasiswa" },
    category: "question",
    createdAt: "2023-10-28T10:30:00Z",
    lastReply: "2023-10-28T12:15:00Z",
    replies: 12,
    likes: 8,
    isPinned: true,
  },
  {
    id: "2",
    title: "Sharing: Template project React + TypeScript + Tailwind",
    content: "Halo teman-teman, saya ingin sharing template project yang biasa saya gunakan untuk memulai project baru dengan React, TypeScript, dan Tailwind CSS. Semoga bermanfaat!",
    author: { name: "Sarah Putri", role: "Senior Developer" },
    category: "resource",
    createdAt: "2023-10-27T15:45:00Z",
    lastReply: "2023-10-28T09:20:00Z",
    replies: 23,
    likes: 45,
    isPinned: false,
  },
  {
    id: "3",
    title: "Diskusi: Best practices untuk API design",
    content: "Mari kita diskusi tentang best practices dalam mendesain REST API. Apa saja yang harus diperhatikan? Bagaimana struktur response yang baik?",
    author: { name: "Budi Santoso", role: "Backend Developer" },
    category: "discussion",
    createdAt: "2023-10-26T14:20:00Z",
    lastReply: "2023-10-28T11:30:00Z",
    replies: 34,
    likes: 28,
    isPinned: false,
  },
  {
    id: "4",
    title: "Pengumuman: Jadwal mentorship bulan ini",
    content: "Untuk teman-teman yang ikut program mentorship, berikut adalah jadwal mentorship untuk bulan November. Silakan cek dan konfirmasi kehadiran.",
    author: { name: "Admin Forum", role: "Administrator" },
    category: "announcement",
    createdAt: "2023-10-28T08:00:00Z",
    lastReply: "2023-10-28T10:45:00Z",
    replies: 5,
    likes: 15,
    isPinned: true,
    isLocked: true,
  },
  {
    id: "5",
    title: "Help: Error 'Cannot resolve module' di React Native",
    content: "Saya mendapatkan error 'Cannot resolve module' saat menjalankan project React Native. Sudah coba npm install tapi masih error. Ada solusi?",
    author: { name: "Dewi Lestari", role: "Mobile Developer" },
    category: "question",
    createdAt: "2023-10-28T13:15:00Z",
    lastReply: "2023-10-28T16:20:00Z",
    replies: 7,
    likes: 3,
    isPinned: false,
  },
];

// Sample forum data with images
const sampleForums: Forum[] = [
  {
    id: "1",
    title: "Pengembangan Web Fundamental",
    description: "Diskusi tentang konsep dasar pengembangan web, HTML, CSS, dan JavaScript.",
    type: "course",
    lastActivity: "2023-10-28T10:30:00Z",
    totalTopics: 42,
  },
  {
    id: "2",
    title: "React dan Next.js",
    description: "Berbagi pengetahuan tentang React, Next.js, dan ekosistemnya.",
    type: "course",
    lastActivity: "2023-10-27T15:45:00Z",
    totalTopics: 38,
  },
];

// Forum images based on type
const getForumImage = (forum: Forum) => {
  if (forum.type === "course") {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&crop=center";
  } else {
    return "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop&crop=center";
  }
};

// Sample discussions untuk Topic component
// Menggunakan createDiscussion utility untuk memastikan discussionType yang tepat
const sampleDiscussions: Discussion[] = (() => {
  const discussions = [
    createDiscussion({
      id: "r1",
      author: "John Doe",
      time: "2 jam lalu",
      content: "Saya juga mengalami hal yang sama. Solusi yang berhasil untuk saya adalah dengan menghapus folder node_modules dan package-lock.json, kemudian jalankan npm install kembali.",
      upvotedBy: ["user1", "user2"],
      downvotedBy: [],
    }),
    createDiscussion({
      id: "r2",
      author: "Jane Smith",
      time: "1 jam lalu",
      content: "Coba cek versi Node.js yang kamu gunakan. Beberapa package membutuhkan versi tertentu. Saya sarankan menggunakan Node.js versi LTS terbaru.",
      upvotedBy: ["user3"],
      downvotedBy: [],
      replyingToId: "r1",
      replyingToAuthor: "John Doe",
    }, []), // Empty array karena r1 akan dibuat setelah ini
    createDiscussion({
      id: "r3",
      author: "Ahmad Rizki",
      time: "30 menit lalu",
      content: "Terima kasih sarannya! Setelah mengikuti tips dari John dan Jane, masalah saya teratasi.",
      upvotedBy: ["user4"],
      downvotedBy: [],
      replyingToId: "r2",
      replyingToAuthor: "Jane Smith",
    }, []), // Empty array karena r2 akan dibuat setelah ini
    createDiscussion({
      id: "r4",
      author: "Sarah Putri",
      time: "15 menit lalu",
      content: "Saya punya solusi alternatif. Coba gunakan yarn instead of npm, kadang bisa solve dependency conflicts.",
      upvotedBy: ["user5"],
      downvotedBy: [],
    }),
  ];

  // Karena utility butuh existingDiscussions, kita buat ulang dengan urutan yang benar
  return [
    {
      id: "r1",
      author: "John Doe",
      time: "2 jam lalu",
      content: "Saya juga mengalami hal yang sama. Solusi yang berhasil untuk saya adalah dengan menghapus folder node_modules dan package-lock.json, kemudian jalankan npm install kembali.",
      upvotedBy: ["user1", "user2"],
      downvotedBy: [],
      discussionType: "direct",
    },
    {
      id: "r2",
      author: "Jane Smith",
      time: "1 jam lalu",
      content: "Coba cek versi Node.js yang kamu gunakan. Beberapa package membutuhkan versi tertentu. Saya sarankan menggunakan Node.js versi LTS terbaru.",
      upvotedBy: ["user3"],
      downvotedBy: [],
      replyingToId: "r1",
      replyingToAuthor: "John Doe",
      discussionType: "nested-first",
    },
    {
      id: "r3",
      author: "Ahmad Rizki",
      time: "30 menit lalu",
      content: "Terima kasih sarannya! Setelah mengikuti tips dari John dan Jane, masalah saya teratasi.",
      upvotedBy: ["user4"],
      downvotedBy: [],
      replyingToId: "r2",
      replyingToAuthor: "Jane Smith",
      discussionType: "nested-second",
    },
    {
      id: "r4",
      author: "Sarah Putri",
      time: "15 menit lalu",
      content: "Saya punya solusi alternatif. Coba gunakan yarn instead of npm, kadang bisa solve dependency conflicts.",
      upvotedBy: ["user5"],
      downvotedBy: [],
      discussionType: "direct",
    },
  ];
})();

export default function ForumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const forumId = params.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("upvoted");

  // New topic state
  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
  });
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Topic voting state
  const [topicVotes, setTopicVotes] = useState<Record<string, { upvotes: number; downvotes: number; userVote: 'up' | 'down' | null }>>({});

  // Handle new topic creation
  const handleCreateTopic = () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      return;
    }

    setIsCreatingTopic(true);

    // Simulate API call
    setTimeout(() => {
      const topicData = {
        id: `topic-${Date.now()}`,
        title: newTopic.title,
        description: newTopic.content,
        author: { name: "Current User", role: "User" },
        category: "discussion", // Default category
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        totalTopics: 0,
        totalReplies: 0,
        totalViews: 0,
        isPinned: false,
        isLocked: false,
        tags: [],
        upvotes: 0,
        downvotes: 0,
      };

      console.log("Creating new topic:", topicData);

      // Reset form
      setNewTopic({ title: "", content: "" });
      setIsFormExpanded(false);
      setIsCreatingTopic(false);

      // Here you would typically:
      // 1. Call API to create topic
      // 2. Refresh the topics list
      // 3. Show success message
    }, 1000);
  };

  // Handle form focus to expand
  const handleFormFocus = () => {
    setIsFormExpanded(true);
  };

  // Handle form collapse
  const handleFormCollapse = () => {
    if (!newTopic.title.trim() && !newTopic.content.trim()) {
      setIsFormExpanded(false);
    }
  };

  // Handle topic voting
  const handleTopicUpvote = (topicId: string) => {
    setTopicVotes((prev) => {
      const current = prev[topicId] || { upvotes: 0, downvotes: 0, userVote: null };

      if (current.userVote === 'up') {
        // Remove upvote
        return {
          ...prev,
          [topicId]: {
            ...current,
            upvotes: current.upvotes - 1,
            userVote: null,
          },
        };
      } else if (current.userVote === 'down') {
        // Change from downvote to upvote
        return {
          ...prev,
          [topicId]: {
            ...current,
            upvotes: current.upvotes + 1,
            downvotes: current.downvotes - 1,
            userVote: 'up',
          },
        };
      } else {
        // Add new upvote
        return {
          ...prev,
          [topicId]: {
            ...current,
            upvotes: current.upvotes + 1,
            userVote: 'up',
          },
        };
      }
    });
  };

  const handleTopicDownvote = (topicId: string) => {
    setTopicVotes((prev) => {
      const current = prev[topicId] || { upvotes: 0, downvotes: 0, userVote: null };

      if (current.userVote === 'down') {
        // Remove downvote
        return {
          ...prev,
          [topicId]: {
            ...current,
            downvotes: current.downvotes - 1,
            userVote: null,
          },
        };
      } else if (current.userVote === 'up') {
        // Change from upvote to downvote
        return {
          ...prev,
          [topicId]: {
            ...current,
            upvotes: current.upvotes - 1,
            downvotes: current.downvotes + 1,
            userVote: 'down',
          },
        };
      } else {
        // Add new downvote
        return {
          ...prev,
          [topicId]: {
            ...current,
            downvotes: current.downvotes + 1,
            userVote: 'down',
          },
        };
      }
    });
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", newTopic);
    // Here you would save to localStorage or API
  };

  // Validation: Pastikan discussion data konsisten
  useEffect(() => {
    const validation = validateAllDiscussions(sampleDiscussions);
    if (!validation.isValid) {
      console.warn("Discussion data validation failed:", validation.invalidDiscussions);
    }
  }, []);

  // Find forum data
  const forum = sampleForums.find(f => f.id === forumId);

  if (!forum) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Forum Tidak Ditemukan</h1>
          <Button onClick={() => router.push("/forum")}>
            Kembali ke Daftar Forum
          </Button>
        </div>
      </div>
    );
  }

  const sortOptions = [
    { value: "upvoted", label: "Up Vote Terbanyak" },
    { value: "latest", label: "Terbaru" },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Forum", href: "/forum" },
    { label: forum.title, isActive: true },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Forum Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-80 md:h-96">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${getForumImage(forum)})` }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />

        {/* Content */}
        <div className="relative h-full flex items-center p-8 md:p-12">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                {forum.type === "course" ? "Course Forum" : "General Forum"}
              </Badge>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Users className="w-4 h-4" />
                <span>{forum.totalTopics} topik</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Clock className="w-4 h-4" />
                <span>Aktif {new Date(forum.lastActivity).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              {forum.title}
            </h1>
            <p className="text-lg md:text-xl text-white/95 max-w-2xl mb-6 drop-shadow">
              {forum.description}
            </p>

            </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
          <div className="w-full sm:w-md">
            <Input
              placeholder="Cari diskusi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full"
            />
          </div>

          <div className="w-full sm:w-48">
            <Dropdown
              label="Urutkan:"
              items={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Create New Topic Section */}
      <div className="bg-white rounded-xl mb-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300">
        {!isFormExpanded ? (
          /* Minimal collapsed state */
          <div className="pl-8 py-4 pr-4">
            <div className="flex items-center gap-3">
              <div
                className="shrink-0 size-9 rounded-full bg-[color-mix(in_oklab,white_10%,var(--color-primary,#2563eb))] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm"
                aria-label="Avatar Anda"
              >
                <span className="text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]">
                  U
                </span>
              </div>
              <div
                className="flex-1 text-base py-2 px-3 border border-gray-200 rounded-lg cursor-text hover:border-gray-300 transition-colors duration-200"
                onClick={handleFormFocus}
              >
                <span className="text-gray-400">Apa yang ingin Anda diskusikan?</span>
              </div>
            </div>
          </div>
        ) : (
          /* Expanded state */
          <div className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="shrink-0 size-9 rounded-full bg-[color-mix(in_oklab,white_10%,var(--color-primary,#2563eb))] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm"
                    aria-label="Avatar Anda"
                  >
                    <span className="text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]">
                      U
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Buat Topik Baru</h3>
                </div>
                <button
                  type="button"
                  onClick={handleFormCollapse}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Judul topik..."
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  className="w-full text-lg font-medium py-3 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  autoFocus
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <textarea
                  placeholder="Jelaskan lebih detail tentang topik yang ingin Anda diskusikan..."
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  className="w-full p-4 text-base border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Topik akan ditinjau sebelum dipublikasi</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-4 py-2 text-sm"
                    onClick={handleFormCollapse}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    rightIcon={<Send className="w-4 h-4 transition-transform duration-200 group-hover:rotate-45" />}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    onClick={handleCreateTopic}
                    disabled={!newTopic.title.trim() || !newTopic.content.trim() || isCreatingTopic}
                    isLoading={isCreatingTopic}
                  >
                    {isCreatingTopic ? "Membuat..." : "Publikasi Topik"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discussions Timeline with Infinite Scroll */}
      <div className="space-y-8 md:space-y-12">
        <InfiniteTopics
          initialParams={{
            search: searchTerm,
            sortBy: sortBy as 'latest' | 'upvoted' | 'replies',
          }}
          renderItem={(discussion, index) => {
            // Convert discussion ke format TopicMeta
            const topicMeta: TopicMeta = {
              id: discussion.id,
              title: discussion.title,
              questionDetail: "Diskusi tentang " + (discussion.description ?? "").toLowerCase(),
              startedBy: "Various Users", // Mock data
              startedAgo: `${Math.floor(Math.random() * 7) + 1} hari lalu`, // Random mock
              repliesCount: discussion.totalTopics,
              lastReplyAgo: `${Math.floor(Math.random() * 24) + 1} jam lalu`, // Random mock
              state: index % 3 === 0 ? "closed" : "open", // 33% closed, 67% open for better visibility
            };

            return (
              <div
                key={discussion.id}
                className="rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_8px_25px_-5px_rgba(0,0,0,0.08),0_16px_50px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_40px_-8px_rgba(0,0,0,0.12),0_20px_60px_-12px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                <Topic
                  meta={topicMeta}
                  discussions={sampleDiscussions}
                  currentUserId="current-user-id" // Hardcoded untuk contoh
                  infiniteScroll={true} // Enable infinite scroll untuk replies
                  onSubmitReply={(data) => {
                    console.log("Submit reply:", data);
                  }}
                  onUpvoteReply={(replyId: string) => {
                    console.log("Upvote reply:", replyId);
                  }}
                  onDownvoteReply={(replyId: string) => {
                    console.log("Downvote reply:", replyId);
                  }}
                  onLoadMoreDiscussions={() => {
                    console.log("Loading more discussions for topic:", discussion.id);
                  }}
                  onUpvoteTopic={handleTopicUpvote}
                  onDownvoteTopic={handleTopicDownvote}
                  topicVotes={topicVotes[discussion.id] || { upvotes: 0, downvotes: 0, userVote: null }}
                />
              </div>
            );
          }}
          className="space-y-8 md:space-y-12"
          itemClassName="mb-6 md:mb-8 last:mb-0" // Responsive additional spacing per item
          showSkeleton={true}
          skeletonCount={3}
          onLoadStart={() => console.log("Loading more topics...")}
          onLoadComplete={(topics) => console.log("Loaded topics:", topics.length)}
          onError={(error) => console.error("Error loading topics:", error)}
        />
      </div>
    </div>
  );
}