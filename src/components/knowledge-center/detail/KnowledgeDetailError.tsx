'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

export default function KnowledgeDetailError() {
  const router = useRouter();

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