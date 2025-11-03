import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_ENDPOINTS, API_CONFIG } from "@/config/api";
import type { VoteType } from "@/types/voting";

export type Topic = {
  id: string;
  idForum?: string;
  title: string;
  description?: string;
  content?: string;
  type?: "course" | "general";
  createdAt?: string;
  updatedAt?: string;
  lastActivity?: string;
  totalReplies?: number;
  totalViews?: number;
  isPinned?: boolean;
  isLocked?: boolean;
  author?: {
    id?: string;
    name?: string;
    role?: string;
    avatarUrl?: string;
  };
};

export type CreateTopicRequest = {
  idForum: string;
  title: string;
  body: string;
  createdBy: string;
};

export type VoteRequest = {
  type: VoteType;
};

export type TopicVoteRequest = {
  type: VoteType;
};

export type ResolveTopicRequest = {
  resolvedBy: string;
};
export type EditDiscussionRequest = {
  idUser: string;
  comment: string;
};

export type VoteResponse = {
  id: string;
  idTopic: string;
  idUser: string;
  idParent?: string | null;
  idRoot?: string | null;
  comment: string;
  upvoteCount: number;
  downvoteCount: number;
  discussionType: 'direct' | 'nestedFirst' | 'nestedSecond';
  isUpdated: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TopicVoteResponse = {
  id: string;
  idForum: string;
  title: string;
  body: string;
  createdBy: string;
  upvoteCount: number;
  downvoteCount: number;
  commenCount: number;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type TopicResponse = {
  data: Topic;
  status: number;
  message: string;
  success: boolean;
  meta?: any;
  links?: any;
  requestId?: string;
};

export type DiscussionAPIResponse = {
  data: DiscussionResponse;
  status: number;
  message: string;
  success: boolean;
  meta?: any;
  links?: any;
  requestId?: string;
};

export type VoteAPIResponse = {
  data: VoteResponse;
  status: number;
  message: string;
  success: boolean;
  meta?: any;
  links?: any;
  requestId?: string;
};

export type TopicVoteAPIResponse = {
  data: TopicVoteResponse;
  status: number;
  message: string;
  success: boolean;
  meta?: any;
  links?: any;
  requestId?: string;
};

// API Discussion Types
export type DiscussionResponse = {
  id: string;
  idTopic: string;
  idUser: string;
  idParent?: string | null;
  idRoot?: string | null;
  comment: string;
  upvoteCount: number;
  downvoteCount: number;
  discussionType: 'direct' | 'nestedFirst' | 'nestedSecond';
  isUpdated: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TopicWithDiscussions = {
  id: string;
  idForum: string;
  title: string;
  body: string;
  createdBy: string;
  isResolved: boolean;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  upvoteCount: number;
  downvoteCount: number;
  commenCount: number;
  createdAt: string;
  discussions: DiscussionResponse[];
};

export type ForumDiscussionsResponse = {
  status: number;
  message: string;
  data: TopicWithDiscussions[];
  success: boolean;
  meta?: any;
  links?: any;
  requestId?: string;
};

export const createTopic = async (topicData: CreateTopicRequest): Promise<Topic> => {
  try {
    const response = await axios.post<TopicResponse>(
      API_ENDPOINTS.TOPICS,
      topicData,
      API_CONFIG
    );

    if (response.data.status !== 201 && response.data.status !== 200) {
      throw new Error(response.data.message || "Failed to create topic");
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Failed to connect to topic server";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const voteDiscussion = async (discussionId: string, voteData: VoteRequest): Promise<VoteResponse> => {
  try {
    const response = await axios.patch<VoteAPIResponse>(
      API_ENDPOINTS.DISCUSSION_VOTE(discussionId),
      voteData,
      API_CONFIG
    );

    if (response.data.status !== 200 && response.data.status !== 201) {
      throw new Error(response.data.message || "Failed to vote discussion");
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Failed to connect to discussion server";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const voteTopic = async (topicId: string, voteData: TopicVoteRequest): Promise<TopicVoteResponse> => {
  try {
    const response = await axios.patch<TopicVoteAPIResponse>(
      API_ENDPOINTS.TOPIC_VOTE(topicId),
      voteData,
      API_CONFIG
    );

    if (response.data.status !== 200 && response.data.status !== 201) {
      throw new Error(response.data.message || "Failed to vote topic");
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Failed to connect to topic server";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const resolveTopic = async (topicId: string, resolveData: ResolveTopicRequest): Promise<Topic> => {
  try {
    const response = await axios.patch<TopicResponse>(
      API_ENDPOINTS.TOPIC_RESOLVE(topicId),
      resolveData,
      API_CONFIG
    );

    if (response.data.status !== 200 && response.data.status !== 201) {
      throw new Error(response.data.message || "Failed to resolve topic");
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Failed to connect to topic server";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const editDiscussion = async (discussionId: string, editData: EditDiscussionRequest): Promise<DiscussionResponse> => {
  try {
    const response = await axios.patch<DiscussionAPIResponse>(
      API_ENDPOINTS.DISCUSSION_BY_ID(discussionId),
      editData,
      API_CONFIG
    );

    if (response.data.status !== 200 && response.data.status !== 201) {
      throw new Error(response.data.message || "Failed to edit discussion");
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Failed to connect to discussion server";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getTopicsQueryKey = (forumId?: string) => ["topics", forumId].filter(Boolean);

export const getDiscussionsByForum = async (forumId: string, sortBy: 'latest' | 'most-voted' = 'latest'): Promise<TopicWithDiscussions[]> => {
  try {
    const response = await axios.get<ForumDiscussionsResponse>(
      API_ENDPOINTS.DISCUSSION_REPLIES(forumId),
      API_CONFIG
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || "Failed to fetch discussions");
    }

    let data = response.data.data;

    // Sort discussions based on sortBy parameter
    if (sortBy === 'latest') {
      data.sort((a: TopicWithDiscussions, b: TopicWithDiscussions) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'most-voted') {
      data.sort((a: TopicWithDiscussions, b: TopicWithDiscussions) =>
        (b.upvoteCount || 0) - (a.upvoteCount || 0)
      );
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Failed to connect to discussions server";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getDiscussionsQueryKey = (forumId: string, sortBy?: 'latest' | 'most-voted') => ["discussions", forumId, sortBy];

export const getDiscussionsQueryOptions = (forumId: string, sortBy: 'latest' | 'most-voted' = 'latest') => {
  return queryOptions({
    queryKey: getDiscussionsQueryKey(forumId, sortBy),
    queryFn: () => getDiscussionsByForum(forumId, sortBy),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const getTopicsQueryOptions = (forumId?: string) => {
  return queryOptions({
    queryKey: getTopicsQueryKey(forumId),
    queryFn: () => {
      // This is a placeholder - implement if you need to fetch topics for a specific forum
      // return getTopicsByForum(forumId);
      return Promise.resolve([]);
    },
    enabled: !!forumId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTopic = () => {
  return useMutation({
    mutationFn: createTopic,
    onSuccess: (data) => {
      // Topic created successfully
    },
    onError: (error) => {
      console.error("Failed to create topic:", error);
    },
  });
};

export const useVoteDiscussion = () => {
  return useMutation({
    mutationFn: ({ discussionId, voteData }: { discussionId: string; voteData: VoteRequest }) =>
      voteDiscussion(discussionId, voteData),
    onSuccess: (data) => {
      // Vote successful
    },
    onError: (error) => {
      console.error("Failed to vote:", error);
    },
  });
};

export const useVoteTopic = () => {
  return useMutation({
    mutationFn: ({ topicId, voteData }: { topicId: string; voteData: TopicVoteRequest }) =>
      voteTopic(topicId, voteData),
    onSuccess: (data) => {
      // Topic vote successful
    },
    onError: (error) => {
      console.error("Failed to vote topic:", error);
    },
  });
};

export const useEditDiscussion = () => {
  return useMutation({
    mutationFn: ({ discussionId, editData }: { discussionId: string; editData: EditDiscussionRequest }) =>
      editDiscussion(discussionId, editData),
    onSuccess: (data) => {
      // Discussion edited successfully
    },
    onError: (error) => {
      console.error("Failed to edit discussion:", error);
    },
  });
};
