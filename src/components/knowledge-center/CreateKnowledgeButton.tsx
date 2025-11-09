/**
 * Create Knowledge Floating Button Component
 * Focused on UI logic and presentation only
 */

'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CreateKnowledgeButton() {
  return (
    <Link
      href="/knowledge-center/create"
      className="group fixed bottom-24 right-8 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center justify-center z-50 overflow-hidden w-12 hover:w-auto hover:px-5 border-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
      aria-label="Create Knowledge"
    >
      <Plus className="w-6 h-6 flex-shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-medium">
        Create Knowledge
      </span>
    </Link>
  );
}
