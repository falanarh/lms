import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTopic, getDiscussionsByForum, voteTopic, getDiscussionsQueryKey, resolveTopic as resolveTopicApi } from "@/api/topics";
import type { TopicMeta } from "@/components/shared/DiscussionCard/Topic";
import { VoteType } from "@/types/voting";

// Helper function untuk get current user ID
// TODO: Replace dengan actual authentication context
const getCurrentUserId = () => "b157852b-82ff-40ed-abf8-2f8fe26377aa";

export function useTopic(forumId: string, sortBy: 'latest' | 'most-voted' = 'latest') {
  const queryClient = useQueryClient();
  const [resolvingTopicId, setResolvingTopicId] = useState<string | null>(null);

  // Query untuk topics - Menggunakan queryKey yang sama dengan useDiscussionForum
  const {
    data: topics = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: getDiscussionsQueryKey(forumId, sortBy),
    queryFn: () => getDiscussionsByForum(forumId, sortBy),
    enabled: !!forumId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: (topicData: { title: string; content: string }) =>
      createTopic({
        idForum: forumId,
        title: topicData.title.trim(),
        body: topicData.content.trim(),
        createdBy: getCurrentUserId(),
      }),
    onSuccess: () => {
      console.log('🔄 [QUERY INVALIDATION] Create Topic Success:', {
        queryKey: getDiscussionsQueryKey(forumId, sortBy),
        timestamp: new Date().toISOString()
      });
      queryClient.invalidateQueries({
        queryKey: getDiscussionsQueryKey(forumId, sortBy),
      });
    },
    onError: (error) => {
      console.error('📝 [CREATE TOPIC] Error:', error);
    },
    retry: false,
  });

  // Vote topic mutation - Simple tanpa optimistic updates
  const voteTopicMutation = useMutation({
    mutationFn: ({ topicId, voteType }: { topicId: string; voteType: VoteType }) =>
      voteTopic(topicId, { type: voteType }),
    onSuccess: () => {
      console.log('🔄 [QUERY INVALIDATION] Topic Vote Success:', {
        queryKey: getDiscussionsQueryKey(forumId, sortBy),
        timestamp: new Date().toISOString()
      });
      // Refresh data setelah berhasil vote
      queryClient.invalidateQueries({
        queryKey: getDiscussionsQueryKey(forumId, sortBy),
      });
    },
    onError: (error) => {
      console.error('🗳️ [VOTE TOPIC] Error:', error);
    },
    onSettled: () => {
      console.log('🔄 [QUERY INVALIDATION] Topic Vote Settled:', {
        queryKey: getDiscussionsQueryKey(forumId, sortBy),
        timestamp: new Date().toISOString()
      });
      // Always refetch to ensure server state is current
      queryClient.invalidateQueries({
        queryKey: getDiscussionsQueryKey(forumId, sortBy),
      });
    },
    retry: false,
  });

  const resolveTopicMutation = useMutation({
    mutationFn: ({ topicId }: { topicId: string }) =>
      resolveTopicApi(topicId, {
        resolvedBy: getCurrentUserId(),
      }),
    onSuccess: () => {
      console.log('dY", [QUERY INVALIDATION] Topic Resolve Success:', {
        queryKey: getDiscussionsQueryKey(forumId, sortBy),
        timestamp: new Date().toISOString()
      });
      queryClient.invalidateQueries({
        queryKey: getDiscussionsQueryKey(forumId, sortBy),
      });
    },
    onError: (error) => {
      console.error('dY-3�,? [RESOLVE TOPIC] Error:', error);
    },
    retry: false,
  });

  // Simple vote state calculation - langsung dari server data
  const getTopicVoteState = (topic: TopicMeta) => ({
    upvotes: topic.upvoteCount || 0,
    downvotes: topic.downvoteCount || 0,
    userVote: topic.userVote || null,
  });

  return {
    // Data
    data: topics,
    isLoading,
    error,
    refetch,

    // Actions
    createTopic: createTopicMutation.mutateAsync,
    voteTopic: async (topicId: string, voteType: VoteType) => {
      await voteTopicMutation.mutateAsync({ topicId, voteType });
    },
    resolveTopic: async (topicId: string) => {
      setResolvingTopicId(topicId);
      try {
        await resolveTopicMutation.mutateAsync({ topicId });
      } finally {
        setResolvingTopicId(null);
      }
    },
    getTopicVoteState,

    // Loading states
    isCreatingTopic: createTopicMutation.isPending,
    isVotingTopic: voteTopicMutation.isPending,
    isResolvingTopic: resolveTopicMutation.isPending,
    resolvingTopicId,
  };
}

export type UseTopicReturn = ReturnType<typeof useTopic>;
