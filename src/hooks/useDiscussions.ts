import { useQuery } from "@tanstack/react-query";
import { getDiscussionsQueryOptions } from "@/api/topics";
import type { TopicWithDiscussions, DiscussionResponse } from "@/api/topics";
import type { TopicMeta, Discussion } from "@/components/shared/DiscussionCard/Topic";

// Transform discussion API response to component format
const transformDiscussion = (discussion: DiscussionResponse, allDiscussions: DiscussionResponse[] = []): Discussion => {
  // Find parent discussion for nested replies
  const parentDiscussion = discussion.idParent
    ? allDiscussions.find(d => d.id === discussion.idParent)
    : null;

  return {
    // API properties
    id: discussion.id,
    idTopic: discussion.idTopic,
    idUser: discussion.idUser,
    idParent: discussion.idParent,
    idRoot: discussion.idRoot,
    comment: discussion.comment,
    upvoteCount: discussion.upvoteCount,
    downvoteCount: discussion.downvoteCount,
    discussionType: discussion.discussionType,
    isUpdated: discussion.isUpdated,
    createdAt: discussion.createdAt,
    updatedAt: discussion.updatedAt,

    // Computed properties for UI
    avatar: undefined, // Could be added later if user data is available
    author: `User ${discussion.idUser.slice(-6)}`, // Generate author name from user ID
    time: formatTimeAgo(discussion.createdAt),
    content: discussion.comment,
    replyingToId: discussion.idParent || undefined,
    replyingToAuthor: parentDiscussion
      ? `User ${parentDiscussion.idUser.slice(-6)}`
      : undefined,
  };
};

// Transform topic API response to component format
const transformTopic = (topic: TopicWithDiscussions): TopicMeta => {
  const transformedDiscussions = topic.discussions.map(discussion =>
    transformDiscussion(discussion, topic.discussions)
  );

  return {
    // API properties
    id: topic.id,
    idForum: topic.idForum,
    title: topic.title,
    body: topic.body,
    createdBy: `User ${topic.createdBy.slice(-6)}`, // Generate author name from user ID
    createdAt: topic.createdAt,
    commentCount: topic.commenCount, // Note: API has typo "commenCount"
    isResolved: topic.isResolved,
    resolvedAt: topic.resolvedAt,
    resolvedBy: topic.resolvedBy,
    upvoteCount: topic.upvoteCount,
    downvoteCount: topic.downvoteCount,

    // Computed properties for UI
    startedAgo: formatTimeAgo(topic.createdAt),
    lastReplyAgo: topic.discussions.length > 0
      ? formatTimeAgo(topic.discussions.reduce((latest, d) =>
          new Date(d.createdAt) > new Date(latest.createdAt) ? d : latest
        ).createdAt)
      : formatTimeAgo(topic.createdAt),
    state: topic.isResolved ? "closed" : "open",
    repliesCount: transformedDiscussions.length,
    avatarInitials: getInitials(`User ${topic.createdBy.slice(-6)}`),

    // Legacy properties for backward compatibility
    questionDetail: topic.body,
    startedBy: `User ${topic.createdBy.slice(-6)}`,
  };
};

// Helper to format time ago
const formatTimeAgo = (dateString: string): string => {
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
};

// Helper to get initials
const getInitials = (name: string): string => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Custom hook for discussions
export const useDiscussions = (forumId: string) => {
  const { data, isLoading, error, refetch } = useQuery(
    getDiscussionsQueryOptions(forumId)
  );

  // Transform API data to component format
  const transformedData = data ? {
    topics: data.map(transformTopic),
    discussions: data.reduce((acc, topic) => {
      // Get all discussions from this topic for parent lookup
      const allTopicDiscussions = topic.discussions;

      const topicDiscussions = topic.discussions.map(discussion =>
        transformDiscussion(discussion, allTopicDiscussions)
      );
      acc[topic.id] = topicDiscussions;

      return acc;
    }, {} as Record<string, Discussion[]>),
  } : { topics: [], discussions: {} };

  return {
    data: transformedData,
    isLoading,
    error,
    refetch,
    // Helper functions
    getTopicById: (topicId: string) => transformedData.topics.find(t => t.id === topicId),
    getDiscussionsByTopicId: (topicId: string) => transformedData.discussions[topicId] || [],
  };
};

export type UseDiscussionsReturn = ReturnType<typeof useDiscussions>;