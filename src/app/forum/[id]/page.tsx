"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle, Users, Clock, TrendingUp, Pin, Lock, Plus, Search, Send, ChevronsRight, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Topic, type TopicMeta, type Discussion } from "@/components/shared/DiscussionCard/Topic";
import { createDiscussion, validateAllDiscussions } from "@/components/shared/DiscussionCard/utils";
import { InfiniteTopics } from "@/components/shared/InfiniteScroll/InfiniteTopics";
import { useForums } from "@/hooks/useForums";
import { useDiscussions } from "@/hooks/useDiscussions";
import { useCreateTopic, useCreateDiscussion } from "@/api/topics";
import { useQueryClient } from "@tanstack/react-query";
import type { Forum } from "@/api/forums";

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
const getForumImage = (forum?: Forum) => {
  if (!forum) {
    return "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop&crop=center";
  }
  if (forum.type === "course") {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&crop=center";
  } else {
    return "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop&crop=center";
  }
};

// Sample discussions untuk Topic component
// Menggunakan createDiscussion utility untuk memastikan discussionType yang tepat
// const sampleDiscussions: Discussion[] = (() => {
//   const discussions = [
//     createDiscussion({
//       id: "r1",
//       author: "John Doe",
//       time: "2 jam lalu",
//       content: "Saya juga mengalami hal yang sama. Solusi yang berhasil untuk saya adalah dengan menghapus folder node_modules dan package-lock.json, kemudian jalankan npm install kembali.",
//       upvoteCount: 2,
//       downvoteCount: 0,
//     }),
//     createDiscussion({
//       id: "r2",
//       author: "Jane Smith",
//       time: "1 jam lalu",
//       content: "Coba cek versi Node.js yang kamu gunakan. Beberapa package membutuhkan versi tertentu. Saya sarankan menggunakan Node.js versi LTS terbaru.",
//       upvoteCount: 1,
//       downvoteCount: 0,
//       replyingToId: "r1",
//       replyingToAuthor: "John Doe",
//     }, []), // Empty array karena r1 akan dibuat setelah ini
//     createDiscussion({
//       id: "r3",
//       author: "Ahmad Rizki",
//       time: "30 menit lalu",
//       content: "Terima kasih sarannya! Setelah mengikuti tips dari John dan Jane, masalah saya teratasi.",
//       upvoteCount: 1,
//       downvoteCount: 0,
//       replyingToId: "r2",
//       replyingToAuthor: "Jane Smith",
//     }, []), // Empty array karena r2 akan dibuat setelah ini
//     createDiscussion({
//       id: "r4",
//       author: "Sarah Putri",
//       time: "15 menit lalu",
//       content: "Saya punya solusi alternatif. Coba gunakan yarn instead of npm, kadang bisa solve dependency conflicts.",
//       upvoteCount: 1,
//       downvoteCount: 0,
//     }),
//   ];

//   // Karena utility butuh existingDiscussions, kita buat ulang dengan urutan yang benar
//   return [
//     {
//       id: "r1",
//       author: "John Doe",
//       time: "2 jam lalu",
//       content: "Saya juga mengalami hal yang sama. Solusi yang berhasil untuk saya adalah dengan menghapus folder node_modules dan package-lock.json, kemudian jalankan npm install kembali.",
//       upvoteCount: ["user1", "user2"],
//       downvotedBy: [],
//       discussionType: "direct",
//     },
//     {
//       id: "r2",
//       author: "Jane Smith",
//       time: "1 jam lalu",
//       content: "Coba cek versi Node.js yang kamu gunakan. Beberapa package membutuhkan versi tertentu. Saya sarankan menggunakan Node.js versi LTS terbaru.",
//       upvoteCount: ["user3"],
//       downvotedBy: [],
//       replyingToId: "r1",
//       replyingToAuthor: "John Doe",
//       discussionType: "nestedFirst",
//     },
//     {
//       id: "r3",
//       author: "Ahmad Rizki",
//       time: "30 menit lalu",
//       content: "Terima kasih sarannya! Setelah mengikuti tips dari John dan Jane, masalah saya teratasi.",
//       upvoteCount: ["user4"],
//       downvotedBy: [],
//       replyingToId: "r2",
//       replyingToAuthor: "Jane Smith",
//       discussionType: "nestedSecond",
//     },
//     {
//       id: "r4",
//       author: "Sarah Putri",
//       time: "15 menit lalu",
//       content: "Saya punya solusi alternatif. Coba gunakan yarn instead of npm, kadang bisa solve dependency conflicts.",
//       upvoteCount: ["user5"],
//       downvotedBy: [],
//       discussionType: "direct",
//     },
//   ];
// })();

// Helper function to get current user ID
// TODO: Replace with actual authentication context
const getCurrentUserId = () => {
  return "b157852b-82ff-40ed-abf8-2f8fe26377aa";
};

export default function ForumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const forumId = params.id as string;
  const queryClient = useQueryClient();

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
  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      return;
    }

    // Validate minimum content length
    if (newTopic.title.trim().length < 3) {
      alert("⚠️ Judul topik terlalu pendek\n\nMinimal 3 karakter diperlukan untuk judul topik.");
      return;
    }

    if (newTopic.content.trim().length < 10) {
      alert("⚠️ Konten topik terlalu pendek\n\nMinimal 10 karakter diperlukan untuk konten topik agar dapat dipahami oleh pengguna lain.");
      return;
    }

    try {
      setIsCreatingTopic(true);

      if (!forum) {
        throw new Error("Forum not found");
      }

      const topicData = {
        idForum: forumId,
        title: newTopic.title.trim(),
        body: newTopic.content.trim(),
        createdBy: getCurrentUserId(),
      };

      const createdTopic = await createTopicMutation.mutateAsync(topicData);

      console.log("Topic created successfully:", createdTopic);

      // Reset form
      setNewTopic({ title: "", content: "" });
      setIsFormExpanded(false);
      setIsCreatingTopic(false);

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["forums"] });
      // You can also invalidate topics-specific queries if they exist
      // queryClient.invalidateQueries({ queryKey: ["topics", forumId] });

      // Show success message (you can replace with a toast notification library)
      alert("✅ Topik berhasil dibuat!\n\nTopik Anda telah dikirim dan akan ditinjau oleh moderator sebelum ditampilkan di forum.");

      // Optional: Navigate to the newly created topic
      // router.push(`/forum/${forumId}/topic/${createdTopic.id}`);

    } catch (error) {
      console.error("Failed to create topic:", error);
      setIsCreatingTopic(false);

      // Show error message
      const errorMessage = error instanceof Error ? error.message : "Gagal membuat topik. Silakan coba lagi.";
      alert(errorMessage);
    }
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
  // useEffect(() => {
  //   const validation = validateAllDiscussions(sampleDiscussions);
  //   if (!validation.isValid) {
  //     console.warn("Discussion data validation failed:", validation.invalidDiscussions);
  //   }
  // }, []);

  // Get forums data from API
  const { data: forums = [], isLoading: isLoadingForums } = useForums();

  // Get discussions data from API
  const { data: discussionsData, isLoading: isLoadingDiscussions, error: discussionsError, getDiscussionsByTopicId } = useDiscussions(forumId);

  // Create topic mutation
  const createTopicMutation = useCreateTopic();

  // Create discussion mutation
  const createDiscussionMutation = useCreateDiscussion();

  // Handle discussion submission
  const handleSubmitReply = async (data: {
    topicId: string;
    text: string;
    replyingToId?: string;
  }) => {
    try {
      const discussionData: any = {
        idTopic: data.topicId,
        idUser: getCurrentUserId(),
        comment: data.text.trim(),
      };

      // Only include idParent and idRoot if replying to another discussion
      if (data.replyingToId) {
        discussionData.idParent = data.replyingToId;

        // Find the root discussion ID
        const rootId = findRootDiscussionId(data.replyingToId, data.topicId);
        discussionData.idRoot = rootId;
      }

      const createdDiscussion = await createDiscussionMutation.mutateAsync(discussionData);

      console.log("Discussion created successfully:", createdDiscussion);

      // Invalidate and refetch discussions to update UI
      queryClient.invalidateQueries({
        queryKey: ["discussions", forumId],
      });

      return createdDiscussion;
    } catch (error) {
      console.error("Failed to create discussion:", error);
      throw error;
    }
  };

  // Helper function to find root discussion ID
  const findRootDiscussionId = (discussionId: string, topicId: string): string => {
    const topicDiscussions = getDiscussionsByTopicId(topicId);

    // First, try to find the discussion by ID
    const discussion = topicDiscussions.find(d => d.id === discussionId);
    if (!discussion) {
      // If not found, return the discussionId itself (might be the first direct reply)
      return discussionId;
    }

    // If it's already a direct discussion, it's the root
    if (discussion.discussionType === 'direct') {
      return discussion.id;
    }

    // If it has idRoot, use that
    if (discussion.idRoot) {
      return discussion.idRoot;
    }

    // If it has idParent, recursively find the root
    if (discussion.idParent) {
      return findRootDiscussionId(discussion.idParent, topicId);
    }

    // Fallback: return the discussion ID itself
    return discussionId;
  };

  // Find forum data
  const forum = forums.find(f => f.id === forumId);

  // Loading state
  const isLoading = isLoadingForums || isLoadingDiscussions;

  // Filter topics based on search term
  const filteredTopics = discussionsData.topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (topic.body && topic.body.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (topic.questionDetail && topic.questionDetail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!forum && !isLoading) {
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
    { label: forum?.title || "Loading...", isActive: true },
  ];

  // Helper function for time formatting
  function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} detik lalu`;
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-16">
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
                  {forum?.type === "course" ? "Course Forum" : "General Forum"}
                </Badge>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{forum?.totalTopics || 0} topik</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Aktif {forum?.lastActivity ? new Date(forum.lastActivity).toLocaleDateString('id-ID') : 'Baru saja'}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
                {forum?.title || 'Loading...'}
              </h1>
              <p className="text-lg md:text-xl text-white/95 max-w-2xl mb-6 drop-shadow">
                {forum?.description || 'Deskripsi forum tidak tersedia'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-8">
          {/* Main Content - Left Side */}
          <div className="flex-1 min-w-0">
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
                        placeholder="Judul topik (minimal 3 karakter)..."
                        value={newTopic.title}
                        onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                        className="w-full text-lg font-medium py-3 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                        autoFocus
                      />
                    </div>

                    {/* Content Textarea */}
                    <div className="space-y-2">
                      <textarea
                        placeholder="Jelaskan lebih detail tentang topik yang ingin Anda diskusikan... (minimal 10 karakter)"
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
                          disabled={!newTopic.title.trim() || !newTopic.content.trim() || newTopic.title.trim().length < 3 || newTopic.content.trim().length < 10 || isCreatingTopic || createTopicMutation.isPending}
                          isLoading={isCreatingTopic || createTopicMutation.isPending}
                        >
                          {isCreatingTopic || createTopicMutation.isPending ? "Membuat..." : "Publikasi Topik"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Discussions Timeline */}
            <div className="space-y-8 md:space-y-12">
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col gap-8">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md">
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {discussionsError && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Diskusi</h3>
                  <p className="text-red-600 mb-4">
                    {discussionsError instanceof Error ? discussionsError.message : 'Terjadi kesalahan saat memuat data diskusi.'}
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Coba Lagi
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !discussionsError && filteredTopics.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessagesSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'Tidak Ada Topik Ditemukan' : 'Belum Ada Topik'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm
                        ? `Tidak ada topik yang cocok dengan pencarian "${searchTerm}"`
                        : 'Forum ini belum memiliki topik diskusi. Jadilah yang pertama membuat topik!'
                      }
                    </p>
                    {searchTerm && (
                      <Button onClick={() => setSearchTerm("")} variant="outline">
                        Hapus Pencarian
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Topics List */}
              {!isLoading && !discussionsError && filteredTopics.length > 0 && (
                <>
                  {filteredTopics.map((topicMeta, index) => {
                    // Get discussions for this topic from API data
                    const topicDiscussions = getDiscussionsByTopicId(topicMeta.id);

                    // console.log("Topic Discussions:", topicDiscussions); // Debug: uncomment if needed

                    return (
                      <div
                        key={topicMeta.id}
                        className="rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_8px_25px_-5px_rgba(0,0,0,0.08),0_16px_50px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_40px_-8px_rgba(0,0,0,0.12),0_20px_60px_-12px_rgba(0,0,0,0.08)] transition-all duration-300"
                      >
                        <Topic
                          meta={topicMeta}
                          discussions={topicDiscussions}
                          currentUserId={getCurrentUserId()} // Use actual user ID
                          infiniteScroll={false} // Enable infinite scroll untuk replies
                          onSubmitReply={handleSubmitReply}
                          onUpvoteReply={(replyId: string) => {
                            console.log("Upvote reply:", replyId);
                          }}
                          onDownvoteReply={(replyId: string) => {
                            console.log("Downvote reply:", replyId);
                          }}
                          onLoadMoreDiscussions={() => {
                            console.log("Loading more discussions for topic:", topicMeta.id);
                          }}
                          onUpvoteTopic={handleTopicUpvote}
                          onDownvoteTopic={handleTopicDownvote}
                          topicVotes={topicVotes[topicMeta.id] || { upvotes: 0, downvotes: 0, userVote: null }}
                          // Edit/Delete functionality
                          canEditTopic={true} // Hardcoded untuk contoh
                          onEditTopic={(topicId, newTitle, newDescription) => {
                            console.log("Edit topic:", topicId, "New title:", newTitle, "New description:", newDescription);
                            // TODO: Call API to update topic
                          }}
                          onDeleteTopic={(topicId) => {
                            console.log("Delete topic:", topicId);
                            // TODO: Handle topic deletion
                          }}
                          canEditDiscussion={true} // Hardcoded untuk contoh
                          onEditDiscussion={(discussionId, newContent) => {
                            console.log("Edit discussion:", discussionId, "New content:", newContent);
                            // TODO: Call API to update discussion
                          }}
                          onDeleteDiscussion={(discussionId) => {
                            console.log("Delete discussion:", discussionId);
                            // TODO: Call API to delete discussion
                          }}
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar - Forums List */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Forums Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Forum Lainnya
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Jelajahi diskusi di forum lain</p>
                </div>

                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                  {isLoadingForums ? (
                    // Loading skeleton
                    [...Array(5)].map((_, index) => (
                      <div key={index} className="p-3 rounded-lg bg-gray-50 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))
                  ) : forums.length > 0 ? (
                    // Filter out current forum
                    forums
                      .filter(f => f.id !== forumId)
                      .slice(0, 8) // Show max 8 forums
                      .map((otherForum) => (
                        <button
                          key={otherForum.id}
                          onClick={() => router.push(`/forum/${otherForum.id}`)}
                          className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  otherForum.type === 'course'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {otherForum.type === 'course' ? 'Course' : 'General'}
                                </span>
                              </div>
                              <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-5">
                                {otherForum.title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-4">
                                {otherForum.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{otherForum.totalTopics} topik</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{timeAgo(otherForum.lastActivity)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronsRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </div>
                        </button>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Tidak ada forum lain tersedia</p>
                    </div>
                  )}
                </div>

                {forums.length > 8 && (
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => router.push('/forum')}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Lihat Semua Forum →
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Stats Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Forum Aktif</h4>
                    <p className="text-xs text-gray-600">Statistik minggu ini</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{forums.length}</div>
                    <div className="text-xs text-gray-600">Total Forum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {forums.reduce((sum, f) => sum + f.totalTopics, 0)}
                    </div>
                    <div className="text-xs text-gray-600">Total Topik</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}