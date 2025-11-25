'use client';

import React from 'react';
import { PlayCircle, FileText, Award, Download, ExternalLink } from 'lucide-react';
import { KnowledgeCenter } from '@/types/knowledge-center';

interface KnowledgeDetailResourcesProps {
  knowledge: KnowledgeCenter;
}

export default function KnowledgeDetailResources({ knowledge }: KnowledgeDetailResourcesProps) {
  const isWebinar = knowledge.type === 'webinar';

  if (!isWebinar) {
    return null;
  }

  const pdfUrl = knowledge.webinar?.noteFile || knowledge.webinar?.contentText;
  const hasResources = knowledge.webinar?.recordLink ||
                      knowledge.webinar?.youtubeLink ||
                      knowledge.webinar?.vbLink ||
                      pdfUrl ||
                      knowledge.webinar?.jpCount;

  if (!hasResources) {
    return null;
  }

  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Resources</h3>
      
      {/* Resource Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        {(knowledge.webinar?.jpCount !== undefined && knowledge.webinar?.jpCount !== null) && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <Award className="w-5 h-5 text-gray-800" />
            <span className="font-medium text-gray-900">JP: {knowledge.webinar.jpCount}</span>
          </div>
        )}
      </div>

      {/* PDF Notulensi Viewer */}
      {pdfUrl && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              <h4 className="text-base font-semibold text-gray-900">Notulensi Webinar (PDF)</h4>
            </div>
            <div className="flex gap-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </a>
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          </div>
          
          {/* PDF Iframe Viewer */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-[600px] md:h-[700px] lg:h-[800px]"
              title="Notulensi Webinar PDF"
              style={{ border: 'none' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Jika PDF tidak tampil dengan benar, silakan klik &quot;Open in New Tab&quot; atau &quot;Download PDF&quot;
          </p>
        </div>
      )}
    </div>
  );
}