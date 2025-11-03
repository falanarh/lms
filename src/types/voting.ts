/**
 * Unified vote type definitions for the forum system
 * Centralizes all vote-related type definitions to ensure consistency
 */

export const VoteTypeEnum = {
  UPVOTE: 'upvote',
  DOWNVOTE: 'downvote',
} as const;

export type VoteType = typeof VoteTypeEnum[keyof typeof VoteTypeEnum];

export const VoteTypeLabels = {
  upvote: 'Upvote',
  downvote: 'Downvote',
} as const;

export type VoteTypeKey = keyof typeof VoteTypeLabels;

export interface VoteState {
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
}

/**
 * Simple local vote state for UI feedback
 * Combines API vote data with local user votes for immediate UI response
 */
export interface LocalVoteState {
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
}