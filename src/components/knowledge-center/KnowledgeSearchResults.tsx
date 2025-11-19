/**
 * Knowledge Search Results Panel Component
 * Displays live search results below the hero section
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Search, BookOpen, Calendar, Users, Eye, ThumbsUp, ExternalLink } from 'lucide-react';
import { useKnowledgeCenterSearch } from '@/hooks/useKnowledgeCenter';
import { useKnowledgeSubjects } from '@/hooks/useKnowledgeSubject';

interface KnowledgeSearchResultsProps {
  searchQuery: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function KnowledgeSearchResults({
  searchQuery,
  isVisible,
  onClose,
}: KnowledgeSearchResultsProps) {
  const { data: searchResults, isLoading, error } = useKnowledgeCenterSearch(searchQuery, isVisible);
  const { data: subjects = [] } = useKnowledgeSubjects();

  // Extract data from API response
  const knowledgeCenters = searchResults?.data?.knowledgeCenters || [];
  const apiSubjects = searchResults?.data?.knowledgeSubjects || [];
  
  // Combine local subjects with API subjects, removing duplicates by ID
  const subjectMap = new Map();
  
  // Add local subjects first
  subjects.forEach(subject => {
    subjectMap.set(subject.id, { ...subject, source: 'local' });
  });
  
  // Add API subjects, but don't overwrite existing ones
  apiSubjects.forEach(subject => {
    if (!subjectMap.has(subject.id)) {
      subjectMap.set(subject.id, { ...subject, source: 'api' });
    }
  });
  
  // Convert back to array and filter based on search query
  const allSubjects = Array.from(subjectMap.values());
  const filteredSubjects = allSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isVisible || searchQuery.length < 2) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl mt-2 max-h-96 overflow-hidden">
      <div className="px-6 py-6 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results for "{searchQuery}"
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-8">
          {/* Knowledge Subjects Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-gray-900">Knowledge Subjects</h4>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                {filteredSubjects.length}
              </span>
            </div>

            {filteredSubjects.length > 0 ? (
              <div className="space-y-3">
                {filteredSubjects.slice(0, 5).map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/knowledge-center/subject/${subject.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">{subject.name}</h5>
                          <p className="text-sm text-gray-600">Subject category for knowledge content</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">Subject</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredSubjects.length > 5 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    +{filteredSubjects.length - 5} more subjects
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No subjects found matching "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Knowledge Centers Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Knowledge Centers</h4>
              {knowledgeCenters.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {knowledgeCenters.length}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Error searching knowledge centers</p>
              </div>
            ) : knowledgeCenters.length > 0 ? (
              <div className="space-y-3">
                {knowledgeCenters.slice(0, 5).map((knowledge: any) => (
                  <Link
                    key={knowledge.id}
                    href={`/knowledge-center/${knowledge.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {knowledge.title}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {knowledge.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{knowledge.viewCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{knowledge.likeCount || 0}</span>
                          </div>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                            {knowledge.type || 'Content'}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors ml-3 mt-1" />
                    </div>
                  </Link>
                ))}
                {knowledgeCenters.length > 5 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    +{knowledgeCenters.length - 5} more results
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No knowledge centers found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* View All Results Link */}
        {(knowledgeCenters.length > 0 || filteredSubjects.length > 0) && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <Link
              href={`/knowledge-center/search?q=${encodeURIComponent(searchQuery)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Search className="w-4 h-4" />
              View All Results
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
