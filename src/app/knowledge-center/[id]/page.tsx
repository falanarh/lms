'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  KnowledgeDetailHeader,
  KnowledgeDetailHero,
  KnowledgeDetailInfo,
  KnowledgeDetailActionBar,
  KnowledgeDetailContent,
  KnowledgeDetailResources,
  KnowledgeDetailTags,
  KnowledgeDetailRelated,
  KnowledgeDetailLoading,
  KnowledgeDetailError,
} from '@/components/knowledge-center/detail';
import {
  useKnowledgeDetail,
  useKnowledge,
  useKnowledgeDetailInteractions,
  useRelatedKnowledge,
  useToggleLikeKnowledge,
} from '@/hooks/useKnowledge';
import { Knowledge } from '@/types/knowledge-center';

export const dynamic = 'force-dynamic';

export default function KnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Custom hooks for data fetching and interactions
  const { knowledge, relatedKnowledge, isLoading, error } = useKnowledgeDetail(id);
  const { handleIncrementViews } = useKnowledgeDetailInteractions(id);
  const toggleLikeMutation = useToggleLikeKnowledge();

  // Local state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Increment views when knowledge is loaded
  useEffect(() => {
    if (knowledge) {
      handleIncrementViews();
    }
  }, [knowledge, handleIncrementViews]);

  // Loading state
  if (isLoading) {
    return <KnowledgeDetailLoading />;
  }

  // Error state
  if (error || !knowledge) {
    return <KnowledgeDetailError />;
  }

  // Event handlers
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: knowledge.title,
        text: knowledge.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // Show toast message (could add toast notification here)
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Add bookmark functionality
  };

  const handleLike = () => {
    if (knowledge.id) {
      toggleLikeMutation.mutate(knowledge.id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <KnowledgeDetailHeader
        knowledge={knowledge}
        isBookmarked={isBookmarked}
        onBookmark={handleBookmark}
        onShare={handleShare}
      />

      {/* Hero Section */}
      <KnowledgeDetailHero knowledge={knowledge} />

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <KnowledgeDetailInfo knowledge={knowledge} />

        {/* Action Bar */}
        <KnowledgeDetailActionBar
          knowledge={knowledge}
          isLiking={toggleLikeMutation.isPending}
          isDisliking={toggleLikeMutation.isPending}
          onLike={handleLike}
          onDislike={handleLike} // Using same handler for simplicity - toggle like
        />

        {/* Content */}
        <KnowledgeDetailContent knowledge={knowledge} />

        {/* Resources */}
        <KnowledgeDetailResources knowledge={knowledge} />

        {/* Tags */}
        <KnowledgeDetailTags knowledge={knowledge} />

        {/* Related Content */}
        <KnowledgeDetailRelated
          knowledge={knowledge}
          relatedKnowledge={relatedKnowledge}
        />
      </article>
    </div>
  );
}
