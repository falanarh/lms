"use client";
/**
 * Komponen: DiscussionCard
 * Tujuan: Menampilkan header diskusi, daftar balasan, tombol view more/less, dan form input balasan.
 *
 * Styling
 * - Tailwind CSS + CSS variables dari tokens.css (dengan fallback aman)
 * - Fokus: focus-visible ring pada semua kontrol interaktif
 *
 * A11y
 * - Tombol dapat dioperasikan keyboard, label jelas
 */
import React from "react";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
// Inline icons are defined at the bottom to avoid external deps
import Badge from "../../ui/Badge";
import {
  CircleQuestionMark,
  Clock4,
  MessagesSquare,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";

export type Reply = {
  id: string;
  avatar?: string;
  author: string;
  time: string;
  content: string;
  upvotedBy: string[];
  downvotedBy: string[];
  replyingToId?: string;
  replyingToAuthor?: string;
};

export type DiscussionHeaderMeta = {
  title: string;
  questionDetail?: string; // Detail isi pertanyaan
  startedBy: string;
  startedAgo: string;
  repliesCount: number;
  lastReplyAgo: string;
  avatarInitials?: string; // opsional; akan diambil dari startedBy bila kosong
  avatarBadge?: number | string; // kecil di sudut avatar
  state?: "open" | "closed";
};

// Helper: ambil inisial dari nama (uppercase)
function getInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface DiscussionCardProps {
  discussionId: string;
  currentUserId?: string; // ID pengguna yang sedang login
  header?: React.ReactNode; // override seluruh header bila diberikan
  headerMeta?: DiscussionHeaderMeta; // jika diisi, dipakai untuk header standar
  replies: Reply[];
  defaultShowAll?: boolean;
  onSubmitReply?: (payload: {
    discussionId: string;
    text: string;
    replyingToId?: string;
  }) => void;
  onUpvoteReply?: (replyId: string) => void;
  onDownvoteReply?: (replyId: string) => void;
  className?: string;
}

const sortRepliesByVote = (replies: Reply[]): Reply[] => {
  return [...replies].sort((a, b) => {
    const voteA = a.upvotedBy.length - a.downvotedBy.length;
    const voteB = b.upvotedBy.length - b.downvotedBy.length;
    return voteB - voteA; // Urutkan dari tertinggi ke terendah
  });
};

function DiscussionCard({
  discussionId,
  currentUserId,
  header,
  headerMeta,
  replies: initialReplies,
  defaultShowAll,
  onSubmitReply,
  onUpvoteReply,
  onDownvoteReply,
  className,
}: DiscussionCardProps) {
  const [replies, setReplies] = React.useState(() => sortRepliesByVote(initialReplies));
  const [showAllReplies, setShowAllReplies] = React.useState(!!defaultShowAll);
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [replyingTo, setReplyingTo] = React.useState<{ id: string; author: string } | null>(null);

  React.useEffect(() => {
    setReplies(sortRepliesByVote(initialReplies));
  }, [initialReplies]);

  const handleUpvote = (replyId: string) => {
    if (!currentUserId) return;

    setReplies((currentReplies) => {
      const updatedReplies = currentReplies.map((reply) => {
        if (reply.id !== replyId) return reply;

        const hasUpvoted = reply.upvotedBy.includes(currentUserId);
        const hasDownvoted = reply.downvotedBy.includes(currentUserId);

        let newUpvotedBy = [...reply.upvotedBy];
        let newDownvotedBy = [...reply.downvotedBy];

        if (hasUpvoted) {
          newUpvotedBy = newUpvotedBy.filter((id) => id !== currentUserId);
        } else {
          newUpvotedBy.push(currentUserId);
          if (hasDownvoted) {
            newDownvotedBy = newDownvotedBy.filter((id) => id !== currentUserId);
          }
        }

        return { ...reply, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy };
      });
      return sortRepliesByVote(updatedReplies);
    });
    onUpvoteReply?.(replyId);
  };

  const handleDownvote = (replyId: string) => {
    if (!currentUserId) return;

    setReplies((currentReplies) => {
      const updatedReplies = currentReplies.map((reply) => {
        if (reply.id !== replyId) return reply;

        const hasUpvoted = reply.upvotedBy.includes(currentUserId);
        const hasDownvoted = reply.downvotedBy.includes(currentUserId);

        let newUpvotedBy = [...reply.upvotedBy];
        let newDownvotedBy = [...reply.downvotedBy];

        if (hasDownvoted) {
          newDownvotedBy = newDownvotedBy.filter((id) => id !== currentUserId);
        } else {
          newDownvotedBy.push(currentUserId);
          if (hasUpvoted) {
            newUpvotedBy = newUpvotedBy.filter((id) => id !== currentUserId);
          }
        }

        return { ...reply, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy };
      });
      return sortRepliesByVote(updatedReplies);
    });
    onDownvoteReply?.(replyId);
  };

  const previewReplies = showAllReplies ? replies : replies.slice(0, 2);
  const hasMoreReplies = replies.length > 2;

  const handleSubmitReply = () => {
    const text = replyText.trim();
    if (!text) return;
    onSubmitReply?.({
      discussionId,
      text,
      replyingToId: replyingTo?.id,
    });
    setReplyText("");
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  const handleStartReply = (reply: Reply) => {
    setReplyingTo({ id: reply.id, author: reply.author });
    setShowReplyForm(true);
  };

  return (
    <section
      className={[
        "w-full bg-[var(--surface,white)]",
        "rounded-[var(--radius-xl,16px)]",
        "border-2 border-[var(--border,rgba(0,0,0,0.12))]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={`discussion-${discussionId}`}
    >
      {/* Header */}
      <header id={`discussion-${discussionId}`} className="px-6 pt-6 pb-4">
        {header ? (
          header
        ) : headerMeta ? (
          <div className="relative">
            {headerMeta.state && (
              <div className="absolute right-0 top-0">
                <Badge
                  size="xs"
                  variant="outline"
                  tone={headerMeta.state === "open" ? "success" : "neutral"}
                >
                  {headerMeta.state === "open" ? "Open" : "Closed"}
                </Badge>
              </div>
            )}
            <div className="flex items-start gap-4">
              {/* Large avatar with badge */}
              <div className="relative shrink-0">
                <div className="size-12 rounded-[var(--radius-lg,12px)] bg-[color-mix(in_oklab,var(--color-primary,#2563eb)_85%,white_15%)] text-white flex items-center justify-center shadow-sm">
                  <span className="text-[var(--font-sm,0.875rem)] font-[var(--font-body-bold,600)] tracking-wide">
                    {(headerMeta.avatarInitials &&
                      headerMeta.avatarInitials.trim().toUpperCase()) ||
                      getInitials(headerMeta.startedBy)}
                  </span>
                </div>
                {headerMeta.avatarBadge != null && (
                  <CircleQuestionMark className="size-5 bg-[var(--success)] text-white rounded-full absolute -bottom-1.5 -right-1.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[var(--color-foreground,#111827)] text-[var(--font-lg,1.125rem)] font-[var(--font-body-bold,600)]">
                  {headerMeta.title}
                </h3>
                {headerMeta.questionDetail && (
                  <p className="mt-3 text-sm text-[var(--color-foreground-muted)]">
                    {headerMeta.questionDetail}
                  </p>
                )}
                <div className="mt-4 text-[12px] text-black">
                  Started by{" "}
                  <span className="text-[var(--color-foreground,#111827)] font-semibold">
                    {headerMeta.startedBy}
                  </span>
                  <span className="mx-1.5">•</span>
                  <span>{headerMeta.startedAgo}</span>
                </div>
                {/* chips */}
                <div className="mt-3 flex items-center gap-3">
                  {/* Replies count chip: background only behind icon */}
                  <span className="inline-flex items-center gap-1.5 text-[var(--success,#16a34a)] text-[12px]">
                    <span className="inline-flex items-center justify-center size-6 rounded-md bg-[color-mix(in_oklab,white_90%,var(--success,#16a34a))]">
                      <MessagesSquare className="size-3.5" />
                    </span>
                    <p className="text-[var(--color-foreground-muted,#6b7280)] font-medium">
                      {headerMeta.repliesCount} replies
                    </p>
                  </span>
                  {/* Last reply chip: background only behind icon */}
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-primary,#2563eb)] text-[12px]">
                    <span className="inline-flex items-center justify-center size-6 rounded-md bg-[var(--color-primary-50,rgba(37,99,235,0.08))]">
                      <Clock4 className="size-3.5" />
                    </span>
                    <p className="text-[var(--color-foreground-muted,#6b7280)] font-medium">
                      Last reply {headerMeta.lastReplyAgo}
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="border-t-2 border-[var(--border,rgba(0,0,0,0.08))]">
          <ul className="flex flex-col" role="list">
            {previewReplies.map((reply) => (
              <li key={reply.id} className="px-4 py-1.5 first:pt-3 last:pb-3" role="listitem">
                <ReplyItem
                  reply={reply}
                  onUpvote={() => handleUpvote(reply.id)}
                  onDownvote={() => handleDownvote(reply.id)}
                  onStartReply={() => handleStartReply(reply)}
                  currentUserId={currentUserId}
                />
              </li>
            ))}
          </ul>

          {hasMoreReplies && (
            <div className="px-4 pb-3">
              <button
                type="button"
                onClick={() => setShowAllReplies((v) => !v)}
                className={[
                  "inline-flex items-center gap-2",
                  "text-[var(--color-primary,#2563eb)]",
                  "text-[var(--font-sm,0.875rem)] font-[var(--font-body-bold,600)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2",
                ].join(" ")}
                aria-expanded={showAllReplies}
                aria-controls={`replies-${discussionId}`}
              >
                <span className="text-xs">
                  {showAllReplies
                    ? `Hide ${replies.length - 2} ${
                        replies.length - 2 === 1 ? "reply" : "replies"
                      }`
                    : `View ${replies.length - 2} more ${
                        replies.length - 2 === 1 ? "reply" : "replies"
                      }`}
                </span>
                <ChevronDown
                  className={[
                    "size-3.5 transition-transform",
                    showAllReplies ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reply form */}
      <div className="border-t-2 border-[var(--border,rgba(0,0,0,0.08))] px-4 py-3">
        {!showReplyForm ? (
          <button
            type="button"
            onClick={() => setShowReplyForm(true)}
            className={[
              "inline-flex items-center gap-1.5",
              "text-sm font-[var(--font-body-bold,600)]",
              "text-[var(--success)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2",
            ].join(" ")}
          >
            <PlusIcon className="size-4.5" />
            Balas Diskusi
          </button>
        ) : (
          <div className="space-y-3" id={`replies-${discussionId}`}>
            {replyingTo && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-foreground-muted)]">
                <span>Membalas kepada <strong>@{replyingTo.author}</strong></span>
                <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full hover:bg-[var(--color-primary-50)]">
                  <X className="size-3" />
                </button>
              </div>
            )}
            <div className="flex gap-3">
              {/* Avatar current user */}
              <div className="shrink-0 size-9 rounded-full bg-[color-mix(in_oklab,white_10%,var(--color-primary,#2563eb))] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm">
                <span className="text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]">
                  Me
                </span>
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Tulis balasan Anda..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pl-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText("");
                }}
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
              >
                <SendIcon className="size-3.5" />
                <span>Kirim Balasan</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ReplyItem({
  reply,
  onUpvote,
  onDownvote,
  onStartReply,
  currentUserId,
}: {
  reply: Reply;
  onUpvote: () => void;
  onDownvote: () => void;
  onStartReply: () => void;
  currentUserId?: string;
}) {
  const handleReplyToClick = () => {
    const targetElement = document.getElementById(`reply-${reply.replyingToId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('highlight-on-scroll');
      setTimeout(() => targetElement.classList.remove('highlight-on-scroll'), 1500);
    }
  };

  return (
    <article
      id={`reply-${reply.id}`}
      className="flex gap-3 rounded-lg px-3"
      aria-label={`Balasan dari ${reply.author}`}
    >
      {/* Avatar */}
      <div className="shrink-0 size-10 rounded-full bg-[color-mix(in_oklab,var(--color-primary,#2563eb)_85%,white_15%)] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm">
        <span className="px-[var(--space-2,0.25rem)] py-[1px] text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]">
          {(reply.avatar && reply.avatar.trim().toUpperCase()) ||
            getInitials(reply.author)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-[var(--font-body-bold,600)] text-sm leading-5 text-[var(--color-foreground,#111827)]">
            {reply.author}
          </span>
          {reply.replyingToAuthor && (
            <button onClick={handleReplyToClick} className="text-sm text-[var(--color-primary)] font-medium">
              @{reply.replyingToAuthor}
            </button>
          )}
          <span className="text-sm leading-4 text-[var(--color-foreground-muted)]">
            {reply.time}
          </span>
        </div>
        <p className="text-sm leading-6 text-[var(--color-foreground,#111827)]">
          {reply.content}
        </p>
        {/* Vote and reply actions */}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={onUpvote}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 text-xs ${currentUserId && reply.upvotedBy.includes(currentUserId)
                ? 'text-[var(--success)]'
                : 'text-[var(--color-foreground-muted)] hover:text-[var(--success)]'}`}
          >
            <ThumbsUp
              className={`size-4 ${currentUserId && reply.upvotedBy.includes(currentUserId) ? 'fill-current' : ''}`}
            />
            <span>{reply.upvotedBy.length}</span>
          </button>
          <button
            onClick={onDownvote}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 text-xs ${currentUserId && reply.downvotedBy.includes(currentUserId)
                ? 'text-[var(--danger)]'
                : 'text-[var(--color-foreground-muted)] hover:text-[var(--danger)]'}`}
          >
            <ThumbsDown
              className={`size-4 ${currentUserId && reply.downvotedBy.includes(currentUserId) ? 'fill-current' : ''}`}
            />
            <span>{reply.downvotedBy.length}</span>
          </button>
          <button onClick={onStartReply} disabled={!currentUserId} className="text-xs text-[var(--color-foreground-muted)] hover:text-[var(--color-primary)] font-medium">
            Balas
          </button>
        </div>
      </div>
    </article>
  );
}

// Inline icons
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3.5 5.25 7 8.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 7.333H8.667V2a.667.667 0 1 0-1.334 0v5.333H2a.667.667 0 0 0 0 1.334h5.333V14a.667.667 0 1 0 1.334 0V8.667H14a.667.667 0 0 0 0-1.334Z"
        fill="currentColor"
      />
    </svg>
  );
}
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M17.94 2.56a.75.75 0 0 1 .5.77l-1.3 10.38a.75.75 0 0 1-1.14.54l-3.18-2.04-2.2 2.2a.75.75 0 0 1-1.28-.53V10L4.1 8.23a.75.75 0 0 1 .06-1.38l12.5-4.17c.1-.03.2-.05.3-.12a.74.74 0 0 1 .98 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2.667 3.333h10.666A1.333 1.333 0 0 1 14.666 4.666v5.334a1.333 1.333 0 0 1-1.333 1.333H6L3.333 14v-2.667H2.667A1.333 1.333 0 0 1 1.333 10V4.666a1.333 1.333 0 0 1 1.334-1.333Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 4.5v3.5l2.2 1.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ThumbsUp and ThumbsDown icons are now imported from lucide-react

export default DiscussionCard;
