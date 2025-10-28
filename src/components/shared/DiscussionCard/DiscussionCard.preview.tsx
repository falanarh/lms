"use client";
import React from "react";
import DiscussionCard, { Reply } from "@/components/shared/DiscussionCard";

// avatar dibiarkan kosong; inisial akan digenerate otomatis dari author
// Data disimulasikan seolah-olah berasal dari database, dipisahkan per diskusi
const mockDiscussionsData: Record<string, Reply[]> = {
  d1: [
    { id: "d1-r1", author: "Aulia", time: "2 jam lalu", content: "Terima kasih atas materinya!", upvotedBy: ["user-2", "user-3"], downvotedBy: [] },
    { id: "d1-r2", author: "Bima Nugraha", time: "1 jam lalu", content: "Sangat membantu.", upvotedBy: ["user-1"], downvotedBy: ["user-3"] },
  ],
  d2: [
    { id: "d2-r1", author: "Citra Tri", time: "35 mnt lalu", content: "Bagaimana jika kasusnya A?", upvotedBy: [], downvotedBy: ["user-1"] },
    { id: "d2-r2", author: "Dani", time: "20 mnt lalu", content: "Untuk kasus A, coba pendekatan B.", upvotedBy: ["user-1", "user-2"], downvotedBy: [], replyingToId: "d2-r1", replyingToAuthor: "Citra Tri" },
  ],
};

const CURRENT_USER_ID = "user-1";

export default function DiscussionCardPreview() {
  const [discussions, setDiscussions] = React.useState(mockDiscussionsData);

  const handleAddReply = (payload: { discussionId: string; text: string; replyingToId?: string }) => {
    const { discussionId, text, replyingToId } = payload;

    setDiscussions((currentDiscussions) => {
      const targetReplies = currentDiscussions[discussionId] || [];
      const newReply: Reply = {
        id: `r${Date.now()}`,
        author: "Current User", // Nama pengguna yang sedang login
        time: "baru saja",
        content: text,
        upvotedBy: [],
        downvotedBy: [],
        replyingToId: replyingToId,
        replyingToAuthor: replyingToId
          ? targetReplies.find((r) => r.id === replyingToId)?.author
          : undefined,
      };

      return {
        ...currentDiscussions,
        [discussionId]: [newReply, ...targetReplies],
      };
    });
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <DiscussionCard
        discussionId="d1"
        currentUserId={CURRENT_USER_ID}
        headerMeta={{
          title: "Best practices for implementing this concept?",
          questionDetail: "I'm looking for advice on how to best implement this concept in a large-scale application.",
          startedBy: "John Doe",
          startedAgo: "2 hours ago",
          repliesCount: 12,
          lastReplyAgo: "30 minutes ago",
          state: "open",
          avatarBadge: 12,
        }}
        replies={discussions.d1}
        onSubmitReply={handleAddReply}
      />

      <DiscussionCard
        discussionId="d2"
        currentUserId={CURRENT_USER_ID}
        headerMeta={{
          title: "Improving team presentation skills",
          questionDetail: "Our team struggles with delivering clear and concise presentations.",
          startedBy: "Jane",
          startedAgo: "5 hours ago",
          repliesCount: 3,
          lastReplyAgo: "1 hour ago",
          state: "closed",
          avatarBadge: 3,
        }}
        replies={discussions.d2}
        onSubmitReply={handleAddReply}
      />
    </div>
  );
}
