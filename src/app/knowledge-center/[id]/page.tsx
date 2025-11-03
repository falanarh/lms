'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import {
  ArrowLeft,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  ExternalLink,
  Clock,
  Award,
  Users,
  Tag,
  FileText,
  PlayCircle,
  Edit,
  Trash2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  X,
  Headphones,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import KnowledgeCard from '@/components/knowledge-center/KnowledgeCard';
import MediaViewer from '@/components/knowledge-center/MediaViewer';
import { useKnowledgeDetail, useKnowledge, useKnowledgeInteraction } from '@/hooks/useKnowledgeCenter';
import { Knowledge, MediaType } from '@/types/knowledge-center';

export default function KnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: knowledge, isLoading, error } = useKnowledgeDetail(id);
  const { data: relatedKnowledge } = useKnowledge({
    subject: knowledge?.subject ? [knowledge.subject] : undefined,
    limit: 4,
  });

  const { like, dislike, isLiking, isDisliking } = useKnowledgeInteraction();

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'resources'>('overview');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Simple Loading Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mb-8"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="aspect-video bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !knowledge) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Content not found</h1>
          <p className="text-gray-600 mb-8">
            The content you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="text-gray-700 hover:text-black font-medium"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    if (knowledge.id) {
      like(knowledge.id);
    }
  };

  const handleDislike = () => {
    if (knowledge.id) {
      dislike(knowledge.id);
    }
  };

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

  const getMediaIcon = () => {
    if (knowledge.knowledge_type === 'webinar') {
      return <Calendar className="w-6 h-6 text-purple-600" />;
    }

    const mediaType = (knowledge as any).media_type as MediaType;
    switch (mediaType) {
      case 'video':
        return <PlayCircle className="w-6 h-6 text-red-600" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'audio':
        return <Headphones className="w-6 h-6 text-green-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const isWebinar = knowledge.knowledge_type === 'webinar';
  const webinarData = knowledge as any;

  const isUpcomingWebinar = isWebinar && webinarData.tgl_zoom && new Date(webinarData.tgl_zoom) > new Date();

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  isBookmarked ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {knowledge.thumbnail && (
        <div className="relative h-64 md:h-96 lg:h-[500px]">
          <Image
            src={knowledge.thumbnail}
            alt={knowledge.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-12">
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {isWebinar ? 'Webinar' : (knowledge as any).media_type?.toUpperCase()}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(knowledge.published_at || knowledge.created_at || ''), { addSuffix: true, locale: idLocale })}</span>
            {knowledge.subject && (
              <>
                <span>•</span>
                <span>{knowledge.subject}</span>
              </>
            )}
            <span>•</span>
            <span>{knowledge.view_count.toLocaleString()} views</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {knowledge.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{knowledge.author}</div>
                <div className="text-sm text-gray-600">
                  {knowledge.penyelenggara}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-700 leading-relaxed mt-6">
            {knowledge.description}
          </p>
        </header>

      {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-4 py-6 border-b border-gray-200 mb-12">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors disabled:opacity-50"
          >
            <Heart className={`w-5 h-5 ${isLiking ? 'animate-pulse' : ''}`} />
            <span className="font-medium">{knowledge.like_count}</span>
          </button>

          <button
            onClick={handleDislike}
            disabled={isDisliking}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors disabled:opacity-50"
          >
            <ThumbsDown className={`w-5 h-5 ${isDisliking ? 'animate-pulse' : ''}`} />
            <span className="font-medium">{knowledge.dislike_count}</span>
          </button>

          <div className="flex-1"></div>

          {isWebinar && isUpcomingWebinar && webinarData.link_zoom && (
            <a
              href={webinarData.link_zoom}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Join Live Session
            </a>
          )}
        </div>

        {/* Content */}
        {knowledge.content_richtext && (
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: knowledge.content_richtext }} />
          </div>
        )}

        {/* Media Content */}
        {(knowledge as any).media_resource && (
          <div className="mb-12">
            <MediaViewer
              src={(knowledge as any).media_resource}
              type={(knowledge as any).media_type}
              title={knowledge.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Webinar Links */}
        {isWebinar && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {webinarData.link_record && (
                <a
                  href={webinarData.link_record}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PlayCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Recording</span>
                </a>
              )}

              {webinarData.link_youtube && (
                <a
                  href={webinarData.link_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PlayCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">YouTube</span>
                </a>
              )}

              {webinarData.link_vb && (
                <a
                  href={webinarData.link_vb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PlayCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Video Builder</span>
                </a>
              )}

              {webinarData.file_notulensi_pdf && (
                <a
                  href={webinarData.file_notulensi_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Notulensi PDF</span>
                </a>
              )}

              {webinarData.jumlah_jp && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">JP: {webinarData.jumlah_jp}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {knowledge.tags && knowledge.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {knowledge.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Content */}
        {relatedKnowledge && relatedKnowledge.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Related Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedKnowledge
                .filter(item => item.id !== knowledge.id)
                .slice(0, 4)
                .map((item) => (
                  <KnowledgeCard
                    key={item.id}
                    knowledge={item}
                    className="h-full"
                  />
                ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
