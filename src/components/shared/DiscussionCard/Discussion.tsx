"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Edit2, MoreVertical, Trash2 } from "lucide-react";
import type { Discussion as DiscussionType } from "./Topic";
import { Button } from "../../ui/Button";
import { Textarea } from "../../ui/Textarea";
import { getInitials, getCurrentUserId } from "@/utils/userUtils";
import type { VoteType } from "@/types/voting";

export interface DiscussionProps {
  discussion: DiscussionType;
  onUpvote: () => void;
  onDownvote: () => void;
  onStartReply: () => void;
  currentUserId?: string;
  discussionType?: 'direct' | 'nestedFirst' | 'nestedSecond';
  // New: Discussion edit/delete functionality
  canEditDiscussion?: boolean;
  onEditDiscussion?: (discussionId: string, newContent: string) => void;
  onDeleteDiscussion?: (discussionId: string) => void;
  isEditingDiscussion?: boolean;
  // New: Voting state
  userVote?: VoteType | null;
  isVoting?: boolean;
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
  canEditDiscussion = false,
  onEditDiscussion,
  onDeleteDiscussion,
  isEditingDiscussion = false,
  userVote,
  isVoting = false,
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

  // Discussion edit/delete state and handlers
  const [showDiscussionMenu, setShowDiscussionMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(discussion.content || discussion.comment || '');
  
  const handleEditDiscussion = () => {
    setShowDiscussionMenu(false);
    setIsEditing(true);
    setEditContent(discussion.content || discussion.comment || '');
  };

  const handleDeleteDiscussion = () => {
    setShowDiscussionMenu(false);
    if (confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
      onDeleteDiscussion?.(discussion.id);
    }
  };

  const handleSaveEdit = async () => {
    const trimmedContent = editContent.trim();
    if (!trimmedContent || trimmedContent === (discussion.content || discussion.comment || '')) {
      setIsEditing(false);
      setEditContent(discussion.content || discussion.comment || '');
      return;
    }

    try {
      // Call parent handler with updated content (parent will handle API call)
      onEditDiscussion?.(discussion.id, trimmedContent);

      // Reset editing state immediately after calling parent
      // Parent will handle the async operation and show appropriate feedback
      setIsEditing(false);
      setShowDiscussionMenu(false);
    } catch (error) {
      console.error('Failed to update discussion:', error);
      // Could show error toast here
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(discussion.content || discussion.comment || '');
  };

  const isUpvoted = userVote === 'upvote';
  const isDownvoted = userVote === 'downvote';

  // Tentukan class berdasarkan jenis discussion
  const getDiscussionClass = () => {
    const baseClass = "flex gap-3 rounded-lg px-3";

    switch (discussionType) {
      case 'direct':
        return baseClass;
      case 'nestedFirst':
      case 'nestedSecond':
        return `${baseClass} ml-6 md:ml-12`; // Nested indentation
      default:
        return baseClass;
    }
  };

  // Tentukan apakah perlu menampilkan @user reference
  const shouldShowReplyReference = discussionType === 'nestedSecond' && discussion.replyingToAuthor;

  return (
    <article
      id={`discussion-${discussion.id}`}
      className={getDiscussionClass()}
      aria-label={`Balasan dari ${discussion.author || `User ${discussion.idUser.slice(-6)}`}`}
    >
      {/* Avatar */}
      <div
        className="shrink-0 size-10 rounded-full bg-[color-mix(in_oklab,var(--color-primary,#2563eb)_85%,white_15%)] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm"
        aria-label={`${discussion.author || getCurrentUserId()} avatar`}
      >
        <span className="px-[var(--space-2,0.25rem)] py-[1px] text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]" role="img">
          {(discussion.avatar && discussion.avatar.trim().toUpperCase()) || getInitials(discussion.author || getCurrentUserId())}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-1 flex-wrap justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-[var(--font-body-bold,600)] text-sm leading-5 text-[var(--color-foreground,#111827)]">
              {discussion.author || getCurrentUserId()}
            </span>

            {/* Reply To Link - Hanya untuk nestedSecond */}
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
              {discussion.time || 'Baru saja'}
              {discussion.isUpdated && (
                <span className="ml-2 inline-flex items-center px-2">
                  <span className="mr-1.5">•</span>Diedit
                </span>
              )}
            </span>
          </div>

          {/* Discussion Menu */}
          {canEditDiscussion && (
            <div className="relative">
              <Button
                variant="ghost"
                className="w-8 h-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                onClick={() => setShowDiscussionMenu(!showDiscussionMenu)}
                aria-label="Menu komentar"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {/* Dropdown Menu */}
              {showDiscussionMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDiscussionMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={handleEditDiscussion}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-gray-600" />
                      Edit Komentar
                    </button>
                    <button
                      onClick={handleDeleteDiscussion}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      Hapus Komentar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Discussion Content */}
        {isEditing ? (
          // Edit Form - replaces both content and action buttons
          <div className="mt-2 space-y-3">
            {/* Edit Input Area - Only textarea */}
            <div className="flex items-start gap-3">
              {/* Input Area */}
              <div className="flex-1">
                <Textarea
                  placeholder="Edit komentar Anda..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                  autoFocus
                  disabled={isEditingDiscussion}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isEditingDiscussion}
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || editContent.trim() === (discussion.content || discussion.comment || '') || isEditingDiscussion}
                isLoading={isEditingDiscussion}
              >
                {isEditingDiscussion ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        ) : (
          // Normal Display Mode
          <>
            <p className="text-sm leading-6 text-[var(--color-foreground,#111827)] break-words">
              {discussion.content || discussion.comment || ''}
            </p>

            {/* Action Buttons */}
            <div className="mt-2 flex items-center gap-4">
              {/* Upvote Button */}
              <button
                onClick={onUpvote}
                disabled={!currentUserId || isVoting}
                className={`vote-button vote-container flex items-center gap-1.5 text-xs transition-colors ${isVoting ? 'vote-loading' : ''} ${
                  isUpvoted
                    ? 'text-[var(--success)] vote-active'
                    : 'text-[var(--color-foreground-muted)] hover:text-[var(--success)] vote-active'
                } ${!currentUserId || isVoting ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-label={`${isUpvoted ? 'Batalkan upvote' : 'Tambah upvote'}`}
                title={isUpvoted ? 'Batalkan upvote' : 'Tambah upvote'}
              >
                <ThumbsUp
                  className={`size-4 ${isUpvoted ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
                <span className="vote-count">{discussion.upvoteCount}</span>
              </button>

              {/* Downvote Button */}
              <button
                onClick={onDownvote}
                disabled={!currentUserId || isVoting}
                className={`vote-button vote-container flex items-center gap-1.5 text-xs transition-colors ${isVoting ? 'vote-loading' : ''} ${
                  isDownvoted
                    ? 'text-[var(--danger)] vote-active'
                    : 'text-[var(--color-foreground-muted)] hover:text-[var(--danger)] vote-active'
                } ${!currentUserId || isVoting ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-label={`${isDownvoted ? 'Batalkan downvote' : 'Tambah downvote'}`}
                title={isDownvoted ? 'Batalkan downvote' : 'Tambah downvote'}
              >
                <ThumbsDown
                  className={`size-4 ${isDownvoted ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
                <span className="vote-count">{discussion.downvoteCount}</span>
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
          </>
        )}
      </div>
    </article>
  );
}

export default Discussion;
