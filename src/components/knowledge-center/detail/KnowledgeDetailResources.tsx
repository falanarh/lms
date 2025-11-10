'use client';

import React from 'react';
import { PlayCircle, FileText, Award } from 'lucide-react';
import { KnowledgeCenter } from '@/types/knowledge-center';

interface KnowledgeDetailResourcesProps {
  knowledge: KnowledgeCenter;
}

export default function KnowledgeDetailResources({ knowledge }: KnowledgeDetailResourcesProps) {
  const isWebinar = knowledge.type === 'webinar';

  if (!isWebinar) {
    return null;
  }

  const hasResources = knowledge.webinar?.recordLink ||
                      knowledge.webinar?.youtubeLink ||
                      knowledge.webinar?.vbLink ||
                      knowledge.webinar?.contentText ||
                      knowledge.webinar?.jpCount;

  if (!hasResources) {
    return null;
  }

  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Resources</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {knowledge.webinar?.recordLink && (
          <a
            href={knowledge.webinar.recordLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlayCircle className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Recording</span>
          </a>
        )}

        {knowledge.webinar?.youtubeLink && (
          <a
            href={knowledge.webinar.youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlayCircle className="w-5 h-5 text-gray-600" />
            <span className="font-medium">YouTube</span>
          </a>
        )}

        {knowledge.webinar?.vbLink && (
          <a
            href={knowledge.webinar.vbLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlayCircle className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Video Builder</span>
          </a>
        )}

        {knowledge.webinar?.contentText && (
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium">PDF Notes</span>
          </div>
        )}

        {knowledge.webinar?.jpCount && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Award className="w-5 h-5 text-gray-600" />
            <span className="font-medium">JP: {knowledge.webinar.jpCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}