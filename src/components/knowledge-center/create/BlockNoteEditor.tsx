'use client';

import React from 'react';

interface BlockNoteEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function BlockNoteEditor({
  value = '',
  onChange,
  placeholder = "Start typing your content here..."
}: BlockNoteEditorProps) {
  // For now, use a simple textarea to avoid SSR issues
  // TODO: Replace with proper BlockNoteEditor implementation after fixing SSR issues
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 min-h-[200px] border-0 resize-none focus:outline-none focus:ring-0"
      />
    </div>
  );
}