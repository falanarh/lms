"use client";

import React from "react";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Topic } from "@/components/shared/DiscussionCard/Topic";
import type { TopicMeta, Discussion } from "@/components/shared/DiscussionCard/Topic";
import type { VoteType, LocalVoteState } from "@/types/voting";

interface TopicsListProps {
  topics: TopicMeta[];
  forumId: string;
  getDiscussionsByTopicId: (topicId: string) => Discussion[];
  isLoading: boolean;
  error: any;
  searchTerm: string;
  voting: {
    handleVote: (discussionId: string, voteType: VoteType) => Promise<void>;
    getTopicVoteState: (topicId: string, topicMeta: any) => LocalVoteState;
  };
  onVoteTopic?: (topicId: string, voteType: VoteType) => Promise<void>;
  topicVotes?: LocalVoteState;
  discussionsActions: {
    handleSubmitReply: (data: { topicId: string; text: string; replyingToId?: string; }) => Promise<any>;
    handleEditDiscussion: (discussionId: string, newContent: string) => Promise<any>;
    editingDiscussionId: string | null;
  };
  forumForm: {
    resetReplyForm: () => void;
  };
  onShowToast: (toast: { variant: 'success' | 'warning'; message: string }) => void;
}

export const TopicsList: React.FC<TopicsListProps> = ({
  topics,
  getDiscussionsByTopicId,
  isLoading,
  error,
  searchTerm,
  voting,
  discussionsActions,
  forumForm,
  onShowToast
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Diskusi</h3>
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data diskusi.'}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Coba Lagi
        </Button>
      </div>
    );
  }

  // Empty State
  if (topics.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessagesSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Tidak Ada Topik Ditemukan' : 'Belum Ada Topik'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? `Tidak ada topik yang cocok dengan pencarian "${searchTerm}"`
              : 'Forum ini belum memiliki topik diskusi. Jadilah yang pertama membuat topik!'
            }
          </p>
        </div>
      </div>
    );
  }

  // Topics List
  return (
    <div className="space-y-8 md:space-y-12">
      {topics.map((topicMeta) => {
        // Get discussions for this topic from API data
        const topicDiscussions = getDiscussionsByTopicId(topicMeta.id);

        // Handle reply submission
        const handleReplySubmit = async (data: {
          topicId: string;
          text: string;
          replyingToId?: string;
        }) => {
          try {
            await discussionsActions.handleSubmitReply(data);
            forumForm.resetReplyForm();
          } catch (error) {
            onShowToast({
              variant: 'warning',
              message: error instanceof Error ? error.message : "Gagal mengirim balasan. Silakan coba lagi."
            });
          }
        };

        // Handle discussion editing
        const handleEditDiscussion = async (discussionId: string, newContent: string) => {
          try {
            await discussionsActions.handleEditDiscussion(discussionId, newContent);
            onShowToast({
              variant: 'success',
              message: 'Komentar berhasil diperbarui!'
            });
          } catch (error) {
            onShowToast({
              variant: 'warning',
              message: error instanceof Error ? error.message : "Gagal memperbarui komentar. Silakan coba lagi."
            });
          }
        };

        return (
          <div
            key={topicMeta.id}
            className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Topic
              meta={topicMeta}
              discussions={topicDiscussions}
              currentUserId={"b157852b-82ff-40ed-abf8-2f8fe26377aa"} // Hardcoded for now
              onSubmitReply={handleReplySubmit}
              onUpvoteReply={(replyId: string, voteType) => {
                voting.handleVote(replyId, voteType);
              }}
              onDownvoteReply={(replyId: string, voteType) => {
                voting.handleVote(replyId, voteType);
              }}
              onLoadMoreDiscussions={() => {
                console.log("Loading more discussions for topic:", topicMeta.id);
              }}
              onVoteTopic={voting.handleVote}
              topicVotes={voting.getTopicVoteState(topicMeta.id, topicMeta)}
              // Edit/Delete functionality
              canEditTopic={true} // Hardcoded untuk contoh
              onEditTopic={(topicId, newTitle, newDescription) => {
                console.log("Edit topic:", topicId, "New title:", newTitle, "New description:", newDescription);
                // TODO: Call API to update topic
              }}
              onDeleteTopic={(topicId) => {
                console.log("Delete topic:", topicId);
                // TODO: Handle topic deletion
              }}
              onResolveTopic={(topicId) => {
                console.log("Resolve topic:", topicId);
                // TODO: Call API to resolve topic
              }}
              isResolvingTopic={false}
              canEditDiscussion={true} // Hardcoded untuk contoh
              onEditDiscussion={handleEditDiscussion}
              onDeleteDiscussion={(discussionId) => {
                console.log("Delete discussion:", discussionId);
                // TODO: Call API to delete discussion
              }}
              editingDiscussionId={discussionsActions.editingDiscussionId}
            />
          </div>
        );
      })}
    </div>
  );
};
