'use client';

import { useParams } from 'next/navigation';
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
import { useKnowledgeDetailPage } from '@/hooks/useKnowledgeCenter';

export const dynamic = 'force-dynamic';

/**
 * Knowledge Detail Page Component
 * Focused on UI logic only - following API → Hooks → UI pattern
 * Business logic handled by useKnowledgeDetailPage hook
 */
export default function KnowledgeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Custom hook for all data fetching and business logic
  const {
    knowledge,
    relatedKnowledge,
    isLoading,
    error,
    isBookmarked,
    handleShare,
    handleBookmark,
    handleLike,
    isLiking,
  } = useKnowledgeDetailPage({ id });

  // Loading state
  if (isLoading) {
    return <KnowledgeDetailLoading />;
  }

  // Error state
  if (error || !knowledge) {
    return <KnowledgeDetailError />;
  }

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
          isLiking={isLiking}
          onLike={handleLike}
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
