"use client";

import React, { useState } from "react";
import { CircleQuestionMark, Clock4, MessagesSquare, X, Plus, ChevronDown, ArrowBigUp, ArrowBigDown, Edit2, MoreVertical, Trash2 } from "lucide-react";
import Badge from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import Discussion from "./Discussion";
import { InfiniteDiscussions } from "../InfiniteScroll/InfiniteDiscussions";

export interface TopicMeta {
  id: string;
  idForum?: string;
  title: string;
  body?: string;              // Changed from questionDetail to match API
  createdBy: string;          // Changed from startedBy to match API
  createdAt: string;          // Changed from startedAgo to match API
  commentCount?: number;      // Changed from repliesCount to match API
  isResolved?: boolean;       // Changed from state to match API
  resolvedAt?: string | null; // Added from API
  resolvedBy?: string | null; // Added from API
  upvoteCount?: number;       // Added from API
  downvoteCount?: number;     // Added from API
  avatarInitials?: string;
  avatarBadge?: number | string;
  // Computed properties for UI
  startedAgo?: string;        // Computed from createdAt
  lastReplyAgo?: string;      // Computed from discussions
  state?: "open" | "closed";  // Computed from isResolved
  repliesCount?: number;      // Computed from discussions length
  // Legacy properties for backward compatibility
  questionDetail?: string;    // Alias for body
  startedBy?: string;         // Alias for createdBy
}

export interface Discussion {
  id: string;
  idTopic?: string;           // Added from API
  idUser: string;             // Changed from author to match API
  idParent?: string | null;   // Changed from replyingToId to match API
  idRoot?: string | null;     // Added from API
  comment: string;            // Changed from content to match API
  upvoteCount: number;        // ✅ match API
  downvoteCount: number;      // ✅ match API
  discussionType: 'direct' | 'nestedFirst' | 'nestedSecond'; // ✅ match API
  isUpdated?: boolean;        // Added from API
  createdAt: string;          // Changed from time to match API
  updatedAt?: string;         // Added from API
  // Computed properties for UI
  avatar?: string;
  author?: string;            // Computed from idUser
  time?: string;              // Computed from createdAt
  content?: string;           // Computed from comment
  replyingToId?: string;      // Computed from idParent
  replyingToAuthor?: string;  // Computed from idParent
}

export interface TopicProps {
  meta: TopicMeta;
  discussions?: Discussion[]; // Optional untuk infinite scroll
  currentUserId?: string;
  defaultShowAll?: boolean;
  infiniteScroll?: boolean; // New: enable infinite scroll
  onSubmitReply?: (payload: {
    topicId: string;
    text: string;
    replyingToId?: string;
  }) => void;
  onUpvoteReply?: (replyId: string) => void;
  onDownvoteReply?: (replyId: string) => void;
  onLoadMoreDiscussions?: () => void; // New: callback untuk load more
  onUpvoteTopic?: (topicId: string) => void;
  onDownvoteTopic?: (topicId: string) => void;
  topicVotes?: { upvotes: number; downvotes: number; userVote: 'up' | 'down' | null };
  // New: Topic edit/delete functionality
  canEditTopic?: boolean;
  onEditTopic?: (topicId: string, newTitle: string, newDescription?: string) => void;
  onDeleteTopic?: (topicId: string) => void;
  // New: Discussion edit/delete functionality
  canEditDiscussion?: boolean;
  onEditDiscussion?: (discussionId: string, newContent: string) => void;
  onDeleteDiscussion?: (discussionId: string) => void;
  className?: string;
}

// Helper untuk sort discussions berdasarkan vote
function sortDiscussionsByVote(discussions: Discussion[]): Discussion[] {
  return [...discussions].sort((a, b) => {
    const voteA = a.upvoteCount - a.downvoteCount;
    const voteB = b.upvoteCount - b.downvoteCount;
    return voteB - voteA;
  });
}


/**
 * Topic - Main component untuk menampilkan topik pertanyaan beserta semua diskusi/jawaban
 *
 * Features:
 * - Header dengan pertanyaan utama
 * - Daftar diskusi/jawaban
 * - Voting system
 * - Reply functionality
 * - View more/less discussions
 */
export function Topic({
  meta,
  discussions: initialDiscussions = [],
  currentUserId,
  defaultShowAll,
  infiniteScroll = false,
  onSubmitReply,
  onUpvoteReply,
  onDownvoteReply,
  onLoadMoreDiscussions,
  onUpvoteTopic,
  onDownvoteTopic,
  topicVotes,
  canEditTopic = false,
  onEditTopic,
  onDeleteTopic,
  canEditDiscussion = false,
  onEditDiscussion,
  onDeleteDiscussion,
  className,
}: TopicProps) {
  // Debug: Log badge state
  React.useEffect(() => {
    console.log('Topic Badge Debug:', {
      topicId: meta.id,
      state: meta.state,
      hasState: !!meta.state
    });
  }, [meta.id, meta.state]);
  const [discussions, setDiscussions] = useState(() => sortDiscussionsByVote(initialDiscussions || []));
  const [showAllDiscussions, setShowAllDiscussions] = useState(!!defaultShowAll);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);
  const [isInfiniteMode, setIsInfiniteMode] = useState(infiniteScroll);
  const [showTopicMenu, setShowTopicMenu] = useState(false);

  // Topic edit states
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTitle, setEditTitle] = useState(meta.title);
  const [editDescription, setEditDescription] = useState(meta.questionDetail || "");
  const [isSavingTopic, setIsSavingTopic] = useState(false);

  // Sync discussions dengan external changes
  React.useEffect(() => {
    setDiscussions(sortDiscussionsByVote(initialDiscussions));
  }, [initialDiscussions]);

  // Sync topic edit states dengan meta changes
  React.useEffect(() => {
    setEditTitle(meta.title);
    setEditDescription(meta.questionDetail || "");
  }, [meta.title, meta.questionDetail]);

  // Vote handlers
  const handleUpvote = (discussionId: string) => {
    if (!currentUserId) return;

    // setDiscussions((currentDiscussions) => {
    //   const updatedDiscussions = currentDiscussions.map((discussion) => {
    //     if (discussion.id !== discussionId) return discussion;

    //     const hasUpvoted = discussion.upvotedBy.includes(currentUserId);
    //     const hasDownvoted = discussion.downvotedBy.includes(currentUserId);

    //     let newUpvotedBy = [...discussion.upvotedBy];
    //     let newDownvotedBy = [...discussion.downvotedBy];

    //     if (hasUpvoted) {
    //       newUpvotedBy = newUpvotedBy.filter((id) => id !== currentUserId);
    //     } else {
    //       newUpvotedBy.push(currentUserId);
    //       if (hasDownvoted) {
    //         newDownvotedBy = newDownvotedBy.filter((id) => id !== currentUserId);
    //       }
    //     }

    //     return { ...discussion, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy };
    //   });
    //   return sortDiscussionsByVote(updatedDiscussions);
    // });
    // onUpvoteReply?.(discussionId);
  };

  const handleDownvote = (discussionId: string) => {
    if (!currentUserId) return;

    // setDiscussions((currentDiscussions) => {
    //   const updatedDiscussions = currentDiscussions.map((discussion) => {
    //     if (discussion.id !== discussionId) return discussion;

    //     const hasUpvoted = discussion.upvotedBy.includes(currentUserId);
    //     const hasDownvoted = discussion.downvotedBy.includes(currentUserId);

    //     let newUpvotedBy = [...discussion.upvotedBy];
    //     let newDownvotedBy = [...discussion.downvotedBy];

    //     if (hasDownvoted) {
    //       newDownvotedBy = newDownvotedBy.filter((id) => id !== currentUserId);
    //     } else {
    //       newDownvotedBy.push(currentUserId);
    //       if (hasUpvoted) {
    //         newUpvotedBy = newUpvotedBy.filter((id) => id !== currentUserId);
    //       }
    //     }

    //     return { ...discussion, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy };
    //   });
    //   return sortDiscussionsByVote(updatedDiscussions);
    // });
    // onDownvoteReply?.(discussionId);
  };

  // Reply form handlers
  const handleSubmitReply = () => {
    const text = replyText.trim();
    if (!text) return;

    onSubmitReply?.({
      topicId: meta.id,
      text,
      replyingToId: replyingTo?.id,
    });

    // Reset form
    setReplyText("");
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  const handleStartReply = (discussion: Discussion) => {
    setReplyingTo({ id: discussion.id, author: discussion.author || `User ${discussion.idUser.slice(-6)}` });
    setShowReplyForm(true);
  };

  const handleCancelReply = () => {
    setReplyText("");
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  // Topic edit/delete handlers
  const handleEditTopic = () => {
    setShowTopicMenu(false);
    setIsEditingTopic(true);
    setEditTitle(meta.title);
    setEditDescription(meta.questionDetail || "");
  };

  const handleSaveTopicEdit = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedTitle || trimmedTitle === meta.title) {
      setIsEditingTopic(false);
      setEditTitle(meta.title);
      setEditDescription(meta.questionDetail || "");
      return;
    }

    setIsSavingTopic(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Call parent handler with updated data
      onEditTopic?.(meta.id, trimmedTitle, trimmedDescription || undefined);

      // Reset editing state
      setIsEditingTopic(false);
      setShowTopicMenu(false);
    } catch (error) {
      console.error('Failed to update topic:', error);
      // Could show error toast here
    } finally {
      setIsSavingTopic(false);
    }
  };

  const handleCancelTopicEdit = () => {
    setIsEditingTopic(false);
    setEditTitle(meta.title);
    setEditDescription(meta.questionDetail || "");
  };

  const handleDeleteTopic = () => {
    setShowTopicMenu(false);
    if (confirm('Apakah Anda yakin ingin menghapus topic ini?')) {
      onDeleteTopic?.(meta.id);
    }
  };

  // Discussion edit handler - update local state
  const handleEditDiscussion = (discussionId: string, newContent: string) => {
    setDiscussions((currentDiscussions) => {
      const updatedDiscussions = currentDiscussions.map((discussion) => {
        if (discussion.id !== discussionId) return discussion;
        return { ...discussion, content: newContent };
      });
      return sortDiscussionsByVote(updatedDiscussions);
    });

    // Call parent handler if provided
    onEditDiscussion?.(discussionId, newContent);
  };

  // Discussion delete handler - remove from local state
  const handleDeleteDiscussion = (discussionId: string) => {
    setDiscussions((currentDiscussions) => {
      const updatedDiscussions = currentDiscussions.filter(
        (discussion) => discussion.id !== discussionId
      );
      return sortDiscussionsByVote(updatedDiscussions);
    });

    // Call parent handler if provided
    onDeleteDiscussion?.(discussionId);
  };

  // Discussion visibility
  const previewDiscussions = showAllDiscussions ? discussions : discussions.slice(0, 2);
  const hasMoreDiscussions = discussions.length > 2;

  return (
    <section
      className={[
        "w-full bg-[var(--surface,white)]",
        "rounded-[var(--radius-xl,16px)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={`topic-${meta.id}`}
    >
      {/* Topic Header */}
      <header id={`topic-${meta.id}`} className="relative px-6 pt-6 pb-4 h-full">
        {/* Top Actions */}
        <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
          {/* Status Badge */}
          <Badge
            size="sm"
            variant={meta.state === "open" ? "default" : "outline"}
            className={`${
              meta.state === "open"
                ? "bg-green-500 text-white border-green-500 shadow-sm"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {meta.state === "open" ? "Open" : "Closed"}
          </Badge>

          {/* Topic Menu */}
          {canEditTopic && (
            <div className="relative">
              <Button
                leftIcon={<MoreVertical className="w-4 h-4 text-gray-600" />}
                variant="outline"
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 w-10 h-10 p-0"
                onClick={() => setShowTopicMenu(!showTopicMenu)}
                aria-label="Menu topik"
              />

              {/* Dropdown Menu */}
              {showTopicMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowTopicMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={handleEditTopic}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                      Edit Topic
                    </button>
                    <button
                      onClick={handleDeleteTopic}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      Hapus Topic
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex items-start gap-4">
          {/* Avatar Section */}
          <div className="relative shrink-0">
            <div
              className="size-12 rounded-[var(--radius-lg,12px)] bg-[color-mix(in_oklab,var(--color-primary,#2563eb)_85%,white_15%)] text-white flex items-center justify-center shadow-sm"
              aria-label={`${meta.startedBy} avatar`}
            >
              <span
                className="text-[var(--font-sm,0.875rem)] font-[var(--font-body-bold,600)] tracking-wide"
                role="img"
              >
                {(meta.avatarInitials && meta.avatarInitials.trim().toUpperCase()) || getTopicInitials(meta.startedBy || meta.createdBy || '')}
              </span>
            </div>

            {/* Avatar Badge */}
            {meta.avatarBadge != null && (
              <CircleQuestionMark
                className="size-5 bg-[var(--success)] text-white rounded-full absolute -bottom-1.5 -right-1.5"
                aria-label="Question badge"
              />
            )}

            {/* Voting Section */}
            {topicVotes && (
              <div className="flex flex-col items-center gap-1 mt-3">
                {/* Upvote Button */}
                <button
                  type="button"
                  onClick={() => onUpvoteTopic?.(meta.id)}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    topicVotes.userVote === 'up'
                      ? 'bg-[var(--success,#16a34a)] text-white shadow-sm'
                      : 'bg-[var(--color-gray-100,#f3f4f6)] text-[var(--color-foreground-muted,#6b7280)] hover:text-[var(--success,#16a34a)] hover:bg-[var(--success,#16a34a)/10]'
                  }`}
                  aria-label={`Upvote topic, ${topicVotes.upvotes} upvotes`}
                >
                  <ArrowBigUp className="size-4" />
                </button>

                {/* Vote Count */}
                <div className="text-center">
                  <span className={`text-xs font-medium ${
                    topicVotes.userVote === 'up'
                      ? 'text-[var(--success,#16a34a)]'
                      : topicVotes.userVote === 'down'
                      ? 'text-[var(--color-error,#dc2626)]'
                      : 'text-[var(--color-foreground,#6b7280)]'
                  }`}>
                    {Math.max(0, topicVotes.upvotes - topicVotes.downvotes)}
                  </span>
                </div>

                {/* Downvote Button */}
                <button
                  type="button"
                  onClick={() => onDownvoteTopic?.(meta.id)}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    topicVotes.userVote === 'down'
                      ? 'bg-[var(--color-error,#dc2626)] text-white shadow-sm'
                      : 'bg-[var(--color-gray-100,#f3f4f6)] text-[var(--color-foreground-muted,#6b7280)] hover:text-[var(--color-error,#dc2626)] hover:bg-[var(--color-error,#dc2626)/10]'
                  }`}
                  aria-label={`Downvote topic, ${topicVotes.downvotes} downvotes`}
                >
                  <ArrowBigDown className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            {/* Title and Description */}
            <div className="flex-1">
              {isEditingTopic ? (
                // Edit Mode - Input fields for title and description
                <div className="space-y-3">
                  {/* Title Input */}
                  <Input
                    placeholder="Edit judul topic..."
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-md font-bold"
                    autoFocus
                    disabled={isSavingTopic}
                  />

                  {/* Description Textarea */}
                  <Textarea
                    placeholder="Edit deskripsi topic..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                    disabled={isSavingTopic}
                  />

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelTopicEdit}
                      disabled={isSavingTopic}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveTopicEdit}
                      disabled={!editTitle.trim() || editTitle.trim() === meta.title || isSavingTopic}
                      isLoading={isSavingTopic}
                    >
                      {isSavingTopic ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </div>
              ) : (
                // Display Mode - Static title and description
                <>
                  {/* Title - Fixed */}
                  <h3 className="text-[var(--color-foreground,#111827)] text-md font-bold mb-3 line-clamp-2">
                    {meta.title}
                  </h3>

                  {/* Question Detail - Dynamic Height */}
                  {meta.questionDetail && (
                    <p className="text-md text-[var(--color-foreground-muted)] leading-relaxed min-h-[52px]">
                      {meta.questionDetail}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Metadata and Stats Container - Always at Bottom */}
            <div className="mt-auto pt-3 space-y-3">
              {/* Metadata Section */}
              <div className="text-sm text-gray-600">
                <span>Dibuat oleh </span>
                <span className="text-[var(--color-foreground,#111827)] font-semibold">
                  {meta.startedBy}
                </span>
                <span className="mx-1.5">•</span>
                <span>{meta.startedAgo}</span>
              </div>

              {/* Stats Chips */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Replies Count */}
                <span className="inline-flex items-center gap-1.5 text-[var(--success,#16a34a)] text-[12px]">
                  <span
                    className="inline-flex items-center justify-center size-6 rounded-md bg-[color-mix(in_oklab,white_90%,var(--success,#16a34a))]"
                    aria-label="Replies count"
                  >
                    <MessagesSquare className="size-3.5" />
                  </span>
                  <p className="text-[var(--color-foreground-muted,#6b7280)] font-medium">
                    {meta.repliesCount} {meta.repliesCount === 1 ? "balasan" : "balasan"}
                  </p>
                </span>

                {/* Last Reply */}
                <span className="inline-flex items-center gap-1.5 text-[var(--color-primary,#2563eb)] text-[12px]">
                  <span
                    className="inline-flex items-center justify-center size-6 rounded-md bg-[var(--color-primary-50,rgba(37,99,235,0.08))]"
                    aria-label="Last reply time"
                  >
                    <Clock4 className="size-3.5" />
                  </span>
                  <p className="text-[var(--color-foreground-muted,#6b7280)] font-medium">
                    Terakhir {meta.lastReplyAgo}
                  </p>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Discussions Section */}
      {isInfiniteMode ? (
        // Infinite Scroll Mode
        <div className="border-t-2 border-[var(--border,rgba(0,0,0,0.08))]">
          <InfiniteDiscussions
            topicId={meta.id}
            initialParams={{
              sortBy: 'votes',
              limit: 2,
            }}
            renderItem={(discussion, index) => (
              <div key={discussion.id} className="px-4 py-4 first:pt-6 last:pb-6">
                <Discussion
                  discussion={discussion}
                  discussionType={discussion.discussionType}
                  onUpvote={() => handleUpvote(discussion.id)}
                  onDownvote={() => handleDownvote(discussion.id)}
                  onStartReply={() => handleStartReply(discussion)}
                  currentUserId={currentUserId}
                  canEditDiscussion={canEditDiscussion}
                  onEditDiscussion={handleEditDiscussion}
                  onDeleteDiscussion={handleDeleteDiscussion}
                />
              </div>
            )}
            listClassName="flex flex-col"
            showSkeleton={true}
            skeletonCount={2}
            onLoadStart={() => console.log("Loading more discussions for topic:", meta.id)}
            onLoadComplete={(discussions) => console.log("Loaded discussions:", discussions.length)}
            onError={(error) => console.error("Error loading discussions:", error)}
          />
        </div>
      ) : (
        // Traditional Mode
        discussions.length > 0 && (
          <div className="border-t-2 border-[var(--border,rgba(0,0,0,0.08))]">
            <ul className="flex flex-col" role="list" aria-label="Daftar balasan">
              {previewDiscussions.map((discussion) => (
                <li key={discussion.id} className="px-4 py-4 first:pt-6 last:pb-6" role="listitem">
                  <Discussion
                    discussion={discussion}
                    discussionType={discussion.discussionType}
                    onUpvote={() => handleUpvote(discussion.id)}
                    onDownvote={() => handleDownvote(discussion.id)}
                    onStartReply={() => handleStartReply(discussion)}
                    currentUserId={currentUserId}
                    canEditDiscussion={canEditDiscussion}
                    onEditDiscussion={handleEditDiscussion}
                    onDeleteDiscussion={handleDeleteDiscussion}
                  />
                </li>
              ))}
            </ul>

            {/* View More/Less Button */}
            {hasMoreDiscussions && (
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={() => setShowAllDiscussions((v) => !v)}
                  className="inline-flex items-center gap-2 text-[var(--color-primary,#2563eb)] text-[var(--font-sm,0.875rem)] font-[var(--font-body-bold,600)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2"
                  aria-expanded={showAllDiscussions}
                  aria-controls={`discussions-${meta.id}`}
                >
                  <span className="text-xs">
                    {showAllDiscussions
                      ? `Sembunyikan ${discussions.length - 2} ${discussions.length - 2 === 1 ? "balasan" : "balasan"}`
                      : `Lihat ${discussions.length - 2} ${discussions.length - 2 === 1 ? "balasan lagi" : "balasan lagi"}`
                    }
                  </span>
                  <ChevronDown
                    className={`size-3.5 transition-transform ${showAllDiscussions ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            )}
          </div>
        )
      )}

      {/* Reply Form Section */}
      <div className="border-t-2 border-[var(--border,rgba(0,0,0,0.08))] px-4 py-3">
        {!showReplyForm ? (
          <button
            type="button"
            onClick={() => setShowReplyForm(true)}
            className="inline-flex items-center gap-1.5 text-sm font-[var(--font-body-bold,600)] text-[var(--success)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2"
            aria-label="Buat balasan baru"
          >
            <Plus className="size-4.5" />
            Balas Diskusi
          </button>
        ) : (
          <div className="space-y-3" id={`discussions-${meta.id}`}>
            {/* Replying To Indicator */}
            {replyingTo && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-foreground-muted)]">
                <span>Membalas kepada <strong>@{replyingTo.author}</strong></span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded-full hover:bg-[var(--color-primary-50)]"
                  aria-label="Batalkan balasan ke pengguna ini"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}

            {/* Reply Form */}
            <div className="flex gap-3">
              {/* Current User Avatar */}
              <div
                className="shrink-0 size-9 rounded-full bg-[color-mix(in_oklab,white_10%,var(--color-primary,#2563eb))] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm"
                aria-label="Avatar Anda"
              >
                <span className="text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]">
                  Me
                </span>
              </div>

              {/* Input Area */}
              <div className="flex-1">
                <Textarea
                  placeholder="Tulis balasan Anda..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="text-sm"
                  aria-label="Isi balasan"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pl-12">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelReply}
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
              >
                Kirim Balasan
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Helper untuk ambil inisial dari nama (untuk Topic component)
function getTopicInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Default export untuk memudahkan import
export default Topic;