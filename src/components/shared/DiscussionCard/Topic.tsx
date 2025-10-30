"use client";

import React, { useState } from "react";
import { CircleQuestionMark, Clock4, MessagesSquare, X, Plus, ChevronDown, ArrowBigUp, ArrowBigDown } from "lucide-react";
import Badge from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Textarea } from "../../ui/Textarea";
import Discussion from "./Discussion";
import { InfiniteDiscussions } from "../InfiniteScroll/InfiniteDiscussions";

export interface TopicMeta {
  id: string;
  title: string;
  questionDetail?: string;
  startedBy: string;
  startedAgo: string;
  repliesCount: number;
  lastReplyAgo: string;
  avatarInitials?: string;
  avatarBadge?: number | string;
  state?: "open" | "closed";
}

export interface Discussion {
  id: string;
  avatar?: string;
  author: string;
  time: string;
  content: string;
  upvotedBy: string[];
  downvotedBy: string[];
  replyingToId?: string;
  replyingToAuthor?: string;
  discussionType: 'direct' | 'nested-first' | 'nested-second';
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
  className?: string;
}

// Helper untuk sort discussions berdasarkan vote
function sortDiscussionsByVote(discussions: Discussion[]): Discussion[] {
  return [...discussions].sort((a, b) => {
    const voteA = a.upvotedBy.length - a.downvotedBy.length;
    const voteB = b.upvotedBy.length - b.downvotedBy.length;
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

  // Sync discussions dengan external changes
  React.useEffect(() => {
    setDiscussions(sortDiscussionsByVote(initialDiscussions));
  }, [initialDiscussions]);

  // Vote handlers
  const handleUpvote = (discussionId: string) => {
    if (!currentUserId) return;

    setDiscussions((currentDiscussions) => {
      const updatedDiscussions = currentDiscussions.map((discussion) => {
        if (discussion.id !== discussionId) return discussion;

        const hasUpvoted = discussion.upvotedBy.includes(currentUserId);
        const hasDownvoted = discussion.downvotedBy.includes(currentUserId);

        let newUpvotedBy = [...discussion.upvotedBy];
        let newDownvotedBy = [...discussion.downvotedBy];

        if (hasUpvoted) {
          newUpvotedBy = newUpvotedBy.filter((id) => id !== currentUserId);
        } else {
          newUpvotedBy.push(currentUserId);
          if (hasDownvoted) {
            newDownvotedBy = newDownvotedBy.filter((id) => id !== currentUserId);
          }
        }

        return { ...discussion, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy };
      });
      return sortDiscussionsByVote(updatedDiscussions);
    });
    onUpvoteReply?.(discussionId);
  };

  const handleDownvote = (discussionId: string) => {
    if (!currentUserId) return;

    setDiscussions((currentDiscussions) => {
      const updatedDiscussions = currentDiscussions.map((discussion) => {
        if (discussion.id !== discussionId) return discussion;

        const hasUpvoted = discussion.upvotedBy.includes(currentUserId);
        const hasDownvoted = discussion.downvotedBy.includes(currentUserId);

        let newUpvotedBy = [...discussion.upvotedBy];
        let newDownvotedBy = [...discussion.downvotedBy];

        if (hasDownvoted) {
          newDownvotedBy = newDownvotedBy.filter((id) => id !== currentUserId);
        } else {
          newDownvotedBy.push(currentUserId);
          if (hasUpvoted) {
            newUpvotedBy = newUpvotedBy.filter((id) => id !== currentUserId);
          }
        }

        return { ...discussion, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy };
      });
      return sortDiscussionsByVote(updatedDiscussions);
    });
    onDownvoteReply?.(discussionId);
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
    setReplyingTo({ id: discussion.id, author: discussion.author });
    setShowReplyForm(true);
  };

  const handleCancelReply = () => {
    setReplyText("");
    setShowReplyForm(false);
    setReplyingTo(null);
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
        {/* Status Badge */}
        <Badge
          size="sm"
          variant={meta.state === "open" ? "default" : "outline"}
          className={`absolute right-6 top-6 z-10 ${
            meta.state === "open"
              ? "bg-green-500 text-white border-green-500 shadow-sm"
              : "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {meta.state === "open" ? "Open" : "Closed"}
        </Badge>

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
                {(meta.avatarInitials && meta.avatarInitials.trim().toUpperCase()) || getTopicInitials(meta.startedBy)}
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