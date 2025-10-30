"use client";

import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { Discussion as DiscussionType } from "./Topic";

export interface DiscussionProps {
  discussion: DiscussionType;
  onUpvote: () => void;
  onDownvote: () => void;
  onStartReply: () => void;
  currentUserId?: string;
  discussionType?: 'direct' | 'nested-first' | 'nested-second';
}

// Helper untuk ambil inisial dari nama
function getInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Discussion - Individual discussion/reply component
 *
 * Features:
 * - Avatar dan author info
 * - Voting buttons (upvote/downvote)
 * - Reply button
 * - @mention support untuk nested replies
 * - Timestamp dan metadata
 * - Accessibility support
 */
export function Discussion({
  discussion,
  onUpvote,
  onDownvote,
  onStartReply,
  currentUserId,
  discussionType = 'direct',
}: DiscussionProps) {
  const handleReplyToClick = () => {
    if (!discussion.replyingToId) return;

    const targetElement = document.getElementById(`discussion-${discussion.replyingToId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('highlight-on-scroll');
      setTimeout(() => targetElement.classList.remove('highlight-on-scroll'), 1500);
    }
  };

  const isUpvoted = currentUserId && discussion.upvotedBy.includes(currentUserId);
  const isDownvoted = currentUserId && discussion.downvotedBy.includes(currentUserId);

  // Tentukan class berdasarkan jenis discussion
  const getDiscussionClass = () => {
    const baseClass = "flex gap-3 rounded-lg px-3";

    switch (discussionType) {
      case 'direct':
        return baseClass;
      case 'nested-first':
      case 'nested-second':
        return `${baseClass} ml-6 md:ml-12`; // Nested indentation
      default:
        return baseClass;
    }
  };

  // Tentukan apakah perlu menampilkan @user reference
  const shouldShowReplyReference = discussionType === 'nested-second' && discussion.replyingToAuthor;

  return (
    <article
      id={`discussion-${discussion.id}`}
      className={getDiscussionClass()}
      aria-label={`Balasan dari ${discussion.author}`}
    >
      {/* Avatar */}
      <div
        className="shrink-0 size-10 rounded-full bg-[color-mix(in_oklab,var(--color-primary,#2563eb)_85%,white_15%)] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm"
        aria-label={`${discussion.author} avatar`}
      >
        <span className="px-[var(--space-2,0.25rem)] py-[1px] text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]" role="img">
          {(discussion.avatar && discussion.avatar.trim().toUpperCase()) || getInitials(discussion.author)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-[var(--font-body-bold,600)] text-sm leading-5 text-[var(--color-foreground,#111827)]">
            {discussion.author}
          </span>

          {/* Reply To Link - Hanya untuk nested-second */}
          {shouldShowReplyReference && (
            <button
              onClick={handleReplyToClick}
              className="text-sm text-[var(--color-primary)] font-medium hover:underline"
              aria-label={`Lihat balasan ke ${discussion.replyingToAuthor}`}
            >
              @{discussion.replyingToAuthor}
            </button>
          )}

          <span className="text-sm leading-4 text-[var(--color-foreground-muted)]">
            {discussion.time}
          </span>
        </div>

        {/* Discussion Content */}
        <p className="text-sm leading-6 text-[var(--color-foreground,#111827)] break-words">
          {discussion.content}
        </p>

        {/* Action Buttons */}
        <div className="mt-2 flex items-center gap-4">
          {/* Upvote Button */}
          <button
            onClick={onUpvote}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isUpvoted
                ? 'text-[var(--success)]'
                : 'text-[var(--color-foreground-muted)] hover:text-[var(--success)]'
            } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
            aria-label={`${isUpvoted ? 'Batalkan' : 'Tambah'} upvote`}
            aria-pressed={isUpvoted || undefined}
          >
            <ThumbsUp
              className={`size-4 ${isUpvoted ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
            <span>{discussion.upvotedBy.length}</span>
          </button>

          {/* Downvote Button */}
          <button
            onClick={onDownvote}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isDownvoted
                ? 'text-[var(--danger)]'
                : 'text-[var(--color-foreground-muted)] hover:text-[var(--danger)]'
            } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
            aria-label={`${isDownvoted ? 'Batalkan' : 'Tambah'} downvote`}
            aria-pressed={isDownvoted || undefined}
          >
            <ThumbsDown
              className={`size-4 ${isDownvoted ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
            <span>{discussion.downvotedBy.length}</span>
          </button>

          {/* Reply Button */}
          <button
            onClick={onStartReply}
            disabled={!currentUserId}
            className="text-xs text-[var(--color-foreground-muted)] hover:text-[var(--color-primary)] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Balas komentar ini"
          >
            Balas
          </button>
        </div>
      </div>
    </article>
  );
}

export default Discussion;