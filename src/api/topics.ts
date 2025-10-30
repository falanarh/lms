import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

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

export type CreateDiscussionRequest = {
  idTopic: string;
  idUser: string;
  idParent?: string | null;
  idRoot?: string | null;
  comment: string;
};

export type VoteRequest = {
  type: 'upvote' | 'downvote';
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
      "https://api-lms-kappa.vercel.app/topics",
      topicData,
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      }
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

export const createDiscussion = async (discussionData: CreateDiscussionRequest): Promise<DiscussionResponse> => {
  try {
    const response = await axios.post<DiscussionAPIResponse>(
      "https://api-lms-kappa.vercel.app/discussions",
      discussionData,
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status !== 201 && response.data.status !== 200) {
      throw new Error(response.data.message || "Failed to create discussion");
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

export const voteDiscussion = async (discussionId: string, voteData: VoteRequest): Promise<VoteResponse> => {
  try {
    const response = await axios.patch<VoteAPIResponse>(
      `https://api-lms-kappa.vercel.app/discussions/${discussionId}/vote`,
      voteData,
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      }
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

export const getTopicsQueryKey = (forumId?: string) => ["topics", forumId].filter(Boolean);

export const getDiscussionsByForum = async (forumId: string): Promise<TopicWithDiscussions[]> => {
  try {
    const response = await axios.get<ForumDiscussionsResponse>(
      `https://api-lms-kappa.vercel.app/discussions/${forumId}/replies`,
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status !== 200) {
      throw new Error(response.data.message || "Failed to fetch discussions");
    }

    return response.data.data;
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

export const getDiscussionsQueryKey = (forumId: string) => ["discussions", forumId];

export const getDiscussionsQueryOptions = (forumId: string) => {
  return queryOptions({
    queryKey: getDiscussionsQueryKey(forumId),
    queryFn: () => getDiscussionsByForum(forumId),
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
      console.log("Topic created successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to create topic:", error);
    },
  });
};

export const useCreateDiscussion = () => {
  return useMutation({
    mutationFn: createDiscussion,
    onSuccess: (data) => {
      console.log("Discussion created successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to create discussion:", error);
    },
  });
};

export const useVoteDiscussion = () => {
  return useMutation({
    mutationFn: ({ discussionId, voteData }: { discussionId: string; voteData: VoteRequest }) =>
      voteDiscussion(discussionId, voteData),
    onSuccess: (data) => {
      console.log("Vote successful:", data);
    },
    onError: (error) => {
      console.error("Failed to vote:", error);
    },
  });
};