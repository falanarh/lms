import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateDiscussionRequest, discussionsApi } from "@/api/discussions";
import { getDiscussionsQueryOptions, getDiscussionsQueryKey } from "@/api/topics";
import type { TopicWithDiscussions, DiscussionResponse } from "@/api/topics";
import type { Discussion, TopicMeta } from "@/components/shared/DiscussionCard/Topic";
import { VoteType, VoteTypeEnum, type LocalVoteState } from "@/types/voting";
import { formatTimeAgo } from "@/utils/timeUtils";
import { getInitials, generateAuthorName } from "@/utils/userUtils";

// Helper function untuk get current user ID
// TODO: Replace dengan actual authentication context
const getCurrentUserId = () => "b157852b-82ff-40ed-abf8-2f8fe26377aa";

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
    idParent: discussion.idParent ?? undefined,
    idRoot: discussion.idRoot ?? undefined,
    comment: discussion.comment,
    upvoteCount: discussion.upvoteCount,
    downvoteCount: discussion.downvoteCount,
    discussionType: discussion.discussionType,
    isUpdated: discussion.isUpdated,
    createdAt: discussion.createdAt,
    updatedAt: discussion.updatedAt,

    // Computed properties for UI
    avatar: undefined,
    author: generateAuthorName(discussion.idUser),
    time: formatTimeAgo(discussion.createdAt),
    content: discussion.comment,
    replyingToId: discussion.idParent || undefined,
    replyingToAuthor: parentDiscussion
      ? generateAuthorName(parentDiscussion.idUser)
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
    createdBy: generateAuthorName(topic.createdBy),
    createdAt: topic.createdAt,
    commentCount: topic.commenCount,
    isResolved: topic.isResolved,
    resolvedAt: topic.resolvedAt,
    resolvedBy: topic.resolvedBy,
    upvoteCount: topic.upvoteCount,
    downvoteCount: topic.downvoteCount,

    // Computed properties for UI
    startedAgo: formatTimeAgo(topic.createdAt),
    lastReplyAgo: topic.discussions.length > 0
      ? formatTimeAgo(topic.discussions.reduce((latest, d) =>
          new Date(d.updatedAt || d.createdAt) > new Date(latest.updatedAt || latest.createdAt) ? d : latest
        ).updatedAt || topic.discussions.reduce((latest, d) =>
          new Date(d.updatedAt || d.createdAt) > new Date(latest.updatedAt || latest.createdAt) ? d : latest
        ).createdAt)
      : formatTimeAgo(topic.createdAt),
    state: topic.isResolved ? "closed" : "open",
    repliesCount: transformedDiscussions.length,
    avatarInitials: getInitials(`User ${topic.createdBy.slice(-6)}`),

    // Legacy properties for backward compatibility
    questionDetail: topic.body,
    startedBy: generateAuthorName(topic.createdBy),
  };
};

// Hook for fetching discussions by topic (individual topic)
export function useDiscussion(topicId: string, forumId?: string) {
  const queryClient = useQueryClient();

  // Query untuk discussions by topic
  const {
    data: discussionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['discussions', topicId, forumId],
    queryFn: () => {
      // If forumId is provided, use real API with both forumId and topicId
      if (forumId) {
        return discussionsApi.fetchDiscussions({ forumId, topicId });
      }
      // Fallback: if no forumId, return empty data
      return { discussions: [], hasMore: false, totalCount: 0, currentPage: 1 };
    },
    enabled: !!topicId && !!forumId,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    retry: (failureCount: number, error: any) => {
      // Don't retry on 404 or network errors - just show empty state
      if (error.message?.includes('service is currently unavailable') ||
          error.message?.includes('not available')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });

  return {
    // Data
    data: discussionsData?.discussions || [],
    discussionsData,
    isLoading,
    error,
    hasMore: discussionsData?.hasMore || false,
    totalCount: discussionsData?.totalCount || 0,

    // Actions
    refetch,
  };
}

// Hook for fetching all discussions by forum (forum page)
export function useDiscussionForum(forumId: string, sortBy: 'latest' | 'most-voted' = 'latest') {
  const { data, isLoading, error, refetch } = useQuery(getDiscussionsQueryOptions(forumId, sortBy));

  // Transform API data to component format
  const transformedData = data ? {
    topics: data.map((topic: any) => transformTopic(topic)),
    discussions: data.reduce((acc: Record<string, Discussion[]>, topic: any) => {
      const allTopicDiscussions = topic.discussions;
      const topicDiscussions = topic.discussions.map((discussion: any) =>
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
    getTopicById: (topicId: string) => transformedData.topics.find(t => t.id === topicId),
    getDiscussionsByTopicId: (topicId: string) => transformedData.discussions[topicId] || [],
  };
}

export function useDiscussionActions(forumId?: string, sortBy: 'latest' | 'most-voted' = 'latest') {
  const queryClient = useQueryClient();
  const [editingDiscussionId, setEditingDiscussionId] = useState<string | null>(null);

  // Create discussion mutation - menggunakan real API
  const createDiscussionMutation = useMutation({
    mutationFn: async (data: {
      topicId: string;
      text: string;
      replyingToDiscussion?: Discussion;
    }) => {
      const discussionData : CreateDiscussionRequest = {
        idTopic: data.topicId,
        idUser: getCurrentUserId(),
        comment: data.text.trim(),
      };

      // Only add idParent and idRoot if it's a reply to an existing discussion
      if (data.replyingToDiscussion) {
        if (data.replyingToDiscussion.discussionType === 'direct') {
          discussionData.idParent = data.replyingToDiscussion.id;
          discussionData.idRoot = data.replyingToDiscussion.id;
        } else {
          discussionData.idParent = data.replyingToDiscussion.id;
          discussionData.idRoot = data.replyingToDiscussion.idRoot || data.replyingToDiscussion.id;
        }
      }

      return await discussionsApi.createDiscussion(discussionData);
    },
    onSuccess: () => {
      console.log('🔄 [QUERY INVALIDATION] Create Discussion Success:', {
        queryKey: getDiscussionsQueryKey(forumId || '', sortBy),
        timestamp: new Date().toISOString()
      });
      // Refresh discussions data setelah berhasil membuat discussion
      if (forumId) {
        queryClient.invalidateQueries({
          queryKey: getDiscussionsQueryKey(forumId, sortBy),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create discussion:', error);
    },
    retry: false, // Don't retry automatically - let user handle service unavailability
  });

  // Vote discussion mutation - Simple tanpa optimistic updates
  const voteDiscussionMutation = useMutation({
    mutationFn: ({ discussionId, voteType }: { discussionId: string; voteType: VoteType }) =>
      discussionsApi.voteDiscussion(discussionId, { type: voteType }),
    onSuccess: () => {
      console.log('🔄 [QUERY INVALIDATION] Discussion Vote Success:', {
        queryKey: getDiscussionsQueryKey(forumId || '', sortBy),
        timestamp: new Date().toISOString()
      });
      // Refresh data setelah berhasil vote
      if (forumId) {
        queryClient.invalidateQueries({
          queryKey: getDiscussionsQueryKey(forumId, sortBy),
        });
      }
    },
    onError: (error) => {
      console.error('🗳️ [VOTE DISCUSSION] Error:', error);
    },
    onSettled: () => {
      console.log('🔄 [QUERY INVALIDATION] Discussion Vote Settled:', {
        queryKey: getDiscussionsQueryKey(forumId || '', sortBy),
        timestamp: new Date().toISOString()
      });
      // Always refetch to ensure server state is current
      if (forumId) {
        queryClient.invalidateQueries({
          queryKey: getDiscussionsQueryKey(forumId, sortBy),
        });
      }
    },
    retry: false, // Don't retry automatically
  });

  // Simple vote state calculation - langsung dari server data
  const getDiscussionVoteState = (discussion: Discussion) => ({
    upvotes: discussion.upvoteCount || 0,
    downvotes: discussion.downvoteCount || 0,
    userVote: discussion.userVote || null,
  });

  // Edit discussion mutation - Simple tanpa optimistic updates
  const editDiscussionMutation = useMutation({
    mutationFn: async ({
      discussionId,
      newContent
    }: {
      discussionId: string;
      newContent: string;
    }) => {
      setEditingDiscussionId(discussionId);
      return await discussionsApi.editDiscussion(discussionId, {
        idUser: getCurrentUserId(),
        comment: newContent.trim(),
      });
    },
    onSuccess: () => {
      // Refresh discussions data setelah berhasil edit
      if (forumId) {
        queryClient.invalidateQueries({
          queryKey: getDiscussionsQueryKey(forumId, sortBy),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to edit discussion:', error);
    },
    onSettled: () => {
      setEditingDiscussionId(null);
    },
    retry: false, // Don't retry automatically
  });

  // Delete discussion mutation - menggunakan real API
  const deleteDiscussionMutation = useMutation({
    mutationFn: async (discussionId: string) => {
      return await discussionsApi.deleteDiscussion(discussionId);
    },
    onSuccess: () => {
      // Refresh discussions data setelah berhasil delete
      if (forumId) {
        queryClient.invalidateQueries({
          queryKey: getDiscussionsQueryKey(forumId, sortBy),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to delete discussion:', error);
    },
    retry: false, // Don't retry automatically
  });

  // Action handlers
  const submitReply = async (data: {
    topicId: string;
    text: string;
    replyingToDiscussion?: Discussion;
  }) => {
    try {
      return await createDiscussionMutation.mutateAsync(data);
    } catch (error) {
      // Re-throw error to let component handle it
      throw error;
    }
  };

  const voteDiscussion = async (discussionId: string, voteType: VoteType) => {
    try {
      return await voteDiscussionMutation.mutateAsync({ discussionId, voteType });
    } catch (error) {
      // Re-throw error to let component handle it
      throw error;
    }
  };

  const editDiscussion = async (discussionId: string, newContent: string) => {
    try {
      return await editDiscussionMutation.mutateAsync({ discussionId, newContent });
    } catch (error) {
      // Re-throw error to let component handle it
      throw error;
    }
  };

  const deleteDiscussion = async (discussionId: string) => {
    try {
      return await deleteDiscussionMutation.mutateAsync(discussionId);
    } catch (error) {
      // Re-throw error to let component handle it
      throw error;
    }
  };

  return {
    // State
    editingDiscussionId,

    // Actions
    submitReply,
    voteDiscussion,
    editDiscussion,
    deleteDiscussion,
    getDiscussionVoteState,

    // Loading states
    isSubmittingReply: createDiscussionMutation.isPending,
    isVoting: voteDiscussionMutation.isPending,
    isEditingDiscussion: editDiscussionMutation.isPending,
    isDeletingDiscussion: deleteDiscussionMutation.isPending,
  };
}

export type UseDiscussionReturn = ReturnType<typeof useDiscussion>;
export type UseDiscussionForumReturn = ReturnType<typeof useDiscussionForum>;
