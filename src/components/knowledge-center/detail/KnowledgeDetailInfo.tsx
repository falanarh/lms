'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { Users, Calendar, BookOpen, PlayCircle, FileText, Headphones } from 'lucide-react';
import { Knowledge, MediaType } from '@/types/knowledge-center';

interface KnowledgeDetailInfoProps {
  knowledge: Knowledge;
}

export default function KnowledgeDetailInfo({ knowledge }: KnowledgeDetailInfoProps) {
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

  return (
    <header className="mb-4">
      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
        <span className="font-medium text-gray-900">
          {isWebinar ? 'Webinar' : (knowledge as any).media_type?.toUpperCase()}
        </span>
        <span>•</span>
        <span>
          {formatDistanceToNow(
            new Date(knowledge.published_at || knowledge.created_at || ''),
            { addSuffix: true, locale: idLocale }
          )}
        </span>
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
            <div className="text-sm text-gray-600">{knowledge.penyelenggara}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xl text-gray-700 leading-relaxed mt-6">
        {knowledge.description}
      </p>

      {/* Metadata Grid - All Required Fields */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Knowledge Type */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mt-0.5">{getMediaIcon()}</div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Knowledge Type</div>
            <div className="font-medium text-gray-900">
              {isWebinar ? 'Webinar' : `Content - ${(knowledge as any).media_type || 'Article'}`}
            </div>
          </div>
        </div>

        {/* Subject */}
        {knowledge.subject && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mt-0.5">
              <BookOpen className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Subject</div>
              <div className="font-medium text-gray-900 capitalize">{knowledge.subject}</div>
            </div>
          </div>
        )}

        {/* Penyelenggara */}
        {knowledge.penyelenggara && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mt-0.5">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Organizer</div>
              <div className="font-medium text-gray-900">{knowledge.penyelenggara}</div>
            </div>
          </div>
        )}

        {/* Published Date */}
        {knowledge.published_at && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mt-0.5">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Published</div>
              <div className="font-medium text-gray-900">
                {new Date(knowledge.published_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}