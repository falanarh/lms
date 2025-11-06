'use client';

import React from 'react';
import { PlayCircle, FileText, Award } from 'lucide-react';
import { Knowledge } from '@/types/knowledge-center';

interface KnowledgeDetailResourcesProps {
  knowledge: Knowledge;
}

export default function KnowledgeDetailResources({ knowledge }: KnowledgeDetailResourcesProps) {
  const isWebinar = knowledge.knowledge_type === 'webinar';
  const webinarData = knowledge as any;

  if (!isWebinar) {
    return null;
  }

  const hasResources = webinarData.link_record ||
                      webinarData.link_youtube ||
                      webinarData.link_vb ||
                      webinarData.file_notulensi_pdf ||
                      webinarData.jumlah_jp;

  if (!hasResources) {
    return null;
  }

  return (
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
  );
}