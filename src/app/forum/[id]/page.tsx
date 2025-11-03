"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, MessagesSquare } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Toast } from "@/components/ui/Toast/Toast";
import { Discussion, Topic } from "@/components/shared/DiscussionCard/Topic";
import { ForumBanner } from "@/components/forum/ForumBanner";
import { ForumSidebar } from "@/components/forum/ForumSidebar";
import { TopicCreationForm } from "@/components/forum/TopicCreationForm";
import { useForums } from "@/hooks/useForums";
import { useTopic } from "@/hooks/useTopic";
import { useDiscussionForum, useDiscussionActions } from "@/hooks/useDiscussion";
import { VoteType, VoteTypeEnum, type LocalVoteState } from "@/types/voting";
import { createToastState } from "@/utils/toastUtils";

// Helper function untuk get current user ID
const getCurrentUserId = () => "b157852b-82ff-40ed-abf8-2f8fe26377aa";

export default function ForumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const forumId = params.id as string;

  // UI state management (local state)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "most-voted">("latest");

  // Data fetching dari API layer - Entity-based hooks only
  const { data: forums = [], isLoading: isLoadingForums } = useForums();
  const { data: discussionsData, isLoading: isLoadingDiscussions, error: discussionsError } = useDiscussionForum(forumId, sortBy);

  // Entity-based hooks untuk Topic dan Discussion actions
  const topicActions = useTopic(forumId, sortBy);
  const discussionActions = useDiscussionActions(forumId, sortBy);

  // Utility functions untuk UI state management
  const toastState = createToastState();

  // Find current forum (simple data transformation)
  const forum = forums.find(f => f.id === forumId);

  // Filter topics (simple UI logic)
  const filteredAndSortedTopics = useMemo(() => {
    let topics = discussionsData.topics || [];

    // Filter berdasarkan search (UI logic)
    if (searchTerm) {
      topics = topics.filter((topic: any) =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (topic.body && topic.body.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (topic.questionDetail && topic.questionDetail.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return topics;
  }, [discussionsData.topics, searchTerm]);

  // Loading state
  const isLoading = isLoadingForums || isLoadingDiscussions;

  // Navigation actions (UI logic)
  const goToForum = (forumId: string) => {
    router.push(`/forum/${forumId}`);
  };

  const goToForumsList = () => {
    router.push("/forum");
  };

  // Breadcrumb items (UI logic)
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Forum", href: "/forum" },
    { label: forum?.title || "Loading...", isActive: true },
  ];

  // Computed values
  const hasTopics = filteredAndSortedTopics.length > 0;
  const isEmpty = !isLoading && filteredAndSortedTopics.length === 0;
  const forumNotFound = !forum && !isLoading;

  // Event handlers (UI logic)
  const handleCreateTopic = async (data: { title: string; content: string }) => {
    try {
      await topicActions.createTopic(data);
      toastState.showSuccess("Topik berhasil dibuat! Topik Anda telah ditambahkan ke forum.");
    } catch (error) {
      toastState.showWarning(error instanceof Error ? error.message : "Gagal membuat topik. Silakan coba lagi.");
    }
  };

  const handleReplySubmit = async (data: { topicId: string; text: string; replyingToDiscussion?: Discussion }) => {
    try {
      await discussionActions.submitReply(data);
      toastState.showSuccess("Balasan berhasil dikirim!");
    } catch (error) {
      toastState.showWarning(error instanceof Error ? error.message : "Gagal mengirim balasan. Silakan coba lagi.");
      throw error; // Re-throw to let component handle UI state
    }
  };

  
  const handleEditDiscussion = async (discussionId: string, newContent: string) => {
    try {
      await discussionActions.editDiscussion(discussionId, newContent);
      toastState.showSuccess("Komentar berhasil diperbarui!");
    } catch (error) {
      toastState.showWarning(error instanceof Error ? error.message : "Gagal memperbarui komentar. Silakan coba lagi.");
    }
  };

  const handleResolveTopic = async (topicId: string) => {
    try {
      await topicActions.resolveTopic(topicId);
      toastState.showSuccess("Topik berhasil ditandai selesai!");
    } catch (error) {
      toastState.showWarning(error instanceof Error ? error.message : "Gagal menandai topik sebagai selesai. Silakan coba lagi.");
    }
  };

  
  // Sort options (UI configuration)
  const sortOptions = [
    { value: "latest", label: "Terbaru" },
    { value: "most-voted", label: "Vote Terbanyak" },
  ];


  // Forum not found state
  if (forumNotFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Forum Tidak Ditemukan</h1>
          <Button onClick={goToForumsList}>
            Kembali ke Daftar Forum
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-16 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Forum Banner */}
        <ForumBanner forum={forum} />

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
                    onChange={(value) => setSortBy(value as "latest" | "most-voted")}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Create New Topic Section */}
            <div className="bg-white rounded-xl mb-8 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300">
              <TopicCreationForm
                onSubmit={handleCreateTopic}
                isSubmitting={topicActions.isCreatingTopic}
              />
            </div>

            {/* Topics List */}
            <div className="space-y-8 md:space-y-12">
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col gap-8">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
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
              {isEmpty && (
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
              {hasTopics && !isLoading && !discussionsError && filteredAndSortedTopics.map((topicMeta: any) => {
                const topicDiscussions = discussionsData.discussions[topicMeta.id] || [];
                const topicVoteState = topicActions.getTopicVoteState(topicMeta);

                return (
                  <div
                    key={topicMeta.id}
                    className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Topic
                      meta={topicMeta}
                      discussions={topicDiscussions}
                      currentUserId={getCurrentUserId()}
                      onSubmitReply={handleReplySubmit}
                      onUpvoteReply={(replyId: string, voteType) => discussionActions.voteDiscussion(replyId, voteType)}
                      onDownvoteReply={(replyId: string, voteType) => discussionActions.voteDiscussion(replyId, voteType)}
                      onLoadMoreDiscussions={() => {
                        // Loading more discussions for topic
                      }}
                      onVoteTopic={(topicId, voteType) => topicActions.voteTopic(topicId, voteType)}
                      topicVotes={topicVoteState}
                      isVotingTopic={topicActions.isVotingTopic}
                      onResolveTopic={handleResolveTopic}
                      isResolvingTopic={topicActions.isResolvingTopic && topicActions.resolvingTopicId === topicMeta.id}
                      isVotingDiscussion={discussionActions.isVoting}
                      canEditTopic={true}
                      onEditTopic={(topicId, newTitle, newDescription) => {
                        // Edit topic functionality
                      }}
                      onDeleteTopic={(topicId) => {
                        // Delete topic functionality
                      }}
                      canEditDiscussion={true}
                      onEditDiscussion={handleEditDiscussion}
                      onDeleteDiscussion={(discussionId) => {
                        // Delete discussion functionality
                      }}
                      editingDiscussionId={discussionActions.editingDiscussionId}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <ForumSidebar
              forums={forums}
              currentForumId={forumId}
              onForumClick={goToForum}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastState.toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
          <Toast
            variant={toastState.toast.variant}
            message={toastState.toast.message}
            onClose={toastState.dismissToast}
            autoDismiss
            duration={4000}
            dismissible
          />
        </div>
      )}
    </div>
  );
}
