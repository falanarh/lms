import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';
import type { Discussion } from '@/components/shared/DiscussionCard/Topic';
import type { VoteType } from '@/types/voting';

export interface DiscussionsResponse {
  discussions: Discussion[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  nextPage?: number;
}

export interface FetchDiscussionsParams {
  forumId: string;
  topicId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'most-voted';
  discussionType?: 'all' | 'direct' | 'nested';
}

export interface CreateDiscussionRequest {
  idTopic: string;
  idUser: string;
  comment: string;
  idParent?: string;
  idRoot?: string;
}

export interface EditDiscussionRequest {
  idUser: string;
  comment: string;
}

export interface VoteRequest {
  type: VoteType;
}

export interface DiscussionAPIResponse {
  data: Discussion;
  status: number;
  message: string;
  success: boolean;
  meta?: any;
  links?: any;
  requestId?: string;
}

/**
 * Real API untuk discussions data
 * Menggunakan endpoint yang sudah defined di API_ENDPOINTS
 */
export const discussionsApi = {
  async fetchDiscussions(params: FetchDiscussionsParams): Promise<DiscussionsResponse> {
    try {
      const { forumId, topicId, page = 1, limit = 10, sortBy = 'latest', discussionType = 'all' } = params;

      // Try to fetch from real API
      const response = await axios.get(
        API_ENDPOINTS.DISCUSSION_REPLIES(forumId),
        API_CONFIG
      );

      if (response.data.status === 200 && response.data.data) {
        // Process real API response
        const topicsWithDiscussions = response.data.data;
        let allDiscussions: Discussion[] = [];

        if (topicId) {
          const targetTopic = topicsWithDiscussions.find((topic: any) => topic.id === topicId);
          if (!targetTopic) {
            return {
              discussions: [],
              hasMore: false,
              totalCount: 0,
              currentPage: page,
            };
          }

          allDiscussions = targetTopic.discussions.map((item: any) => ({
            id: item.id,
            idUser: item.idUser,
            idTopic: item.idTopic,
            idParent: item.idParent,
            idRoot: item.idRoot,
            comment: item.comment,
            content: item.comment,
            upvoteCount: item.upvoteCount || 0,
            downvoteCount: item.downvoteCount || 0,
            discussionType: item.discussionType || 'direct',
            isUpdated: item.isUpdated || false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            author: item.author || `User ${item.idUser?.slice(-6) || 'Unknown'}`,
            time: item.time || new Date(item.createdAt).toLocaleDateString('id-ID'),
            replyingToId: item.idParent,
            replyingToAuthor: item.replyingToAuthor,
          }));
        } else {
          allDiscussions = topicsWithDiscussions.flatMap((topic: any) =>
            topic.discussions.map((item: any) => ({
              id: item.id,
              idUser: item.idUser,
              idTopic: item.idTopic,
              idParent: item.idParent,
              idRoot: item.idRoot,
              comment: item.comment,
              content: item.comment,
              upvoteCount: item.upvoteCount || 0,
              downvoteCount: item.downvoteCount || 0,
              discussionType: item.discussionType || 'direct',
              isUpdated: item.isUpdated || false,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              author: item.author || `User ${item.idUser?.slice(-6) || 'Unknown'}`,
              time: item.time || new Date(item.createdAt).toLocaleDateString('id-ID'),
              replyingToId: item.idParent,
              replyingToAuthor: item.replyingToAuthor,
            }))
          );
        }

        // Filter and sort
        let filteredDiscussions = allDiscussions;
        if (discussionType !== 'all') {
          if (discussionType === 'direct') {
            filteredDiscussions = allDiscussions.filter((d: Discussion) => !d.replyingToId);
          } else {
            filteredDiscussions = allDiscussions.filter((d: Discussion) => d.replyingToId);
          }
        }

        // Sort topics based on sortBy parameter
        if (sortBy === 'latest') {
          filteredDiscussions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'most-voted') {
          filteredDiscussions.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedDiscussions = filteredDiscussions.slice(startIndex, endIndex);
        const hasMore = endIndex < filteredDiscussions.length;

        return {
          discussions: paginatedDiscussions,
          hasMore,
          totalCount: filteredDiscussions.length,
          currentPage: page,
          nextPage: hasMore ? page + 1 : undefined,
        };
      }

      // No data available
      return {
        discussions: [],
        hasMore: false,
        totalCount: 0,
        currentPage: page,
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If API endpoint doesn't exist or returns error, return empty state
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
          console.warn('Discussions API endpoint not available:', error.message);
          return {
            discussions: [],
            hasMore: false,
            totalCount: 0,
            currentPage: 1,
          };
        }

        const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Failed to connect to discussions server';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  async createDiscussion(data: CreateDiscussionRequest): Promise<Discussion> {
    try {
      const response = await axios.post<DiscussionAPIResponse>(
        API_ENDPOINTS.DISCUSSIONS,
        data,
        API_CONFIG
      );

      if (response.data.status === 201 || response.data.status === 200) {
        const apiData = response.data.data;
        return {
          id: apiData.id,
          idUser: apiData.idUser,
          idTopic: apiData.idTopic,
          idParent: apiData.idParent,
          idRoot: apiData.idRoot,
          comment: apiData.comment,
          content: apiData.comment,
          upvoteCount: apiData.upvoteCount || 0,
          downvoteCount: apiData.downvoteCount || 0,
          discussionType: apiData.discussionType || 'direct',
          isUpdated: apiData.isUpdated || false,
          createdAt: apiData.createdAt,
          updatedAt: apiData.updatedAt,
          author: apiData.author || `User ${apiData.idUser?.slice(-6) || 'Unknown'}`,
          time: apiData.time || new Date(apiData.createdAt).toLocaleDateString('id-ID'),
          replyingToId: apiData.idParent || undefined,
          replyingToAuthor: apiData.replyingToAuthor,
        };
      }

      throw new Error('Failed to create discussion');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If API endpoint doesn't exist, throw a clear error
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
          throw new Error('Discussion creation service is currently unavailable');
        }

        const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Failed to connect to discussion server';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  async voteDiscussion(discussionId: string, voteData: VoteRequest): Promise<Discussion> {
    try {
      const response = await axios.patch<DiscussionAPIResponse>(
        API_ENDPOINTS.DISCUSSION_VOTE(discussionId),
        voteData,
        API_CONFIG
      );

      if (response.data.status === 200 || response.data.status === 201) {
        const apiData = response.data.data;
        return {
          id: apiData.id,
          idUser: apiData.idUser,
          idTopic: apiData.idTopic,
          idParent: apiData.idParent,
          idRoot: apiData.idRoot,
          comment: apiData.comment,
          content: apiData.comment,
          upvoteCount: apiData.upvoteCount || 0,
          downvoteCount: apiData.downvoteCount || 0,
          discussionType: apiData.discussionType || 'direct',
          isUpdated: apiData.isUpdated || false,
          createdAt: apiData.createdAt,
          updatedAt: apiData.updatedAt,
          author: apiData.author || `User ${apiData.idUser?.slice(-6) || 'Unknown'}`,
          time: apiData.time || new Date(apiData.createdAt).toLocaleDateString('id-ID'),
          replyingToId: apiData.idParent || undefined,
          replyingToAuthor: apiData.replyingToAuthor,
        };
      }

      throw new Error('Failed to vote discussion');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
          throw new Error('Voting service is currently unavailable');
        }

        const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Failed to connect to discussion server';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  async editDiscussion(discussionId: string, editData: EditDiscussionRequest): Promise<Discussion> {
    try {
      const response = await axios.patch<DiscussionAPIResponse>(
        API_ENDPOINTS.DISCUSSION_BY_ID(discussionId),
        editData,
        API_CONFIG
      );

      if (response.data.status === 200 || response.data.status === 201) {
        const apiData = response.data.data;
        return {
          id: apiData.id,
          idUser: apiData.idUser,
          idTopic: apiData.idTopic,
          idParent: apiData.idParent,
          idRoot: apiData.idRoot,
          comment: apiData.comment,
          content: apiData.comment,
          upvoteCount: apiData.upvoteCount || 0,
          downvoteCount: apiData.downvoteCount || 0,
          discussionType: apiData.discussionType || 'direct',
          isUpdated: apiData.isUpdated || true,
          createdAt: apiData.createdAt,
          updatedAt: apiData.updatedAt,
          author: apiData.author || `User ${apiData.idUser?.slice(-6) || 'Unknown'}`,
          time: apiData.time || new Date(apiData.createdAt).toLocaleDateString('id-ID'),
          replyingToId: apiData.idParent || undefined,
          replyingToAuthor: apiData.replyingToAuthor,
        };
      }

      throw new Error('Failed to edit discussion');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
          throw new Error('Discussion editing service is currently unavailable');
        }

        const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Failed to connect to discussion server';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  async deleteDiscussion(discussionId: string): Promise<string> {
    try {
      const response = await axios.delete(
        API_ENDPOINTS.DISCUSSION_BY_ID(discussionId),
        API_CONFIG
      );

      if (response.data.status === 200 || response.data.status === 204) {
        return discussionId;
      }

      throw new Error('Failed to delete discussion');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
          throw new Error('Discussion deletion service is currently unavailable');
        }

        const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Failed to connect to discussion server';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
};