"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { Textarea } from "@/components/ui/Textarea";

interface BlockNoteEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  height?: string;
}

// Basic rich text formatting functions
const formatText = (text: string): string => {
  if (!text) return '';

  // Convert newlines to <br> for HTML rendering
  return text.replace(/\n/g, '<br>');
};

const stripHtml = (html: string): string => {
  if (!html) return '';

  // Basic HTML stripping
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
};

export function BlockNoteEditor({
  content = "",
  onChange,
  placeholder = "Mulai mengetik...",
  editable = true,
  className = "",
  height = "200px"
}: BlockNoteEditorProps) {
  const [internalContent, setInternalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update internal content when prop changes
  useEffect(() => {
    setInternalContent(content);
  }, [content]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [internalContent]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setInternalContent(newContent);

    if (onChange) {
      onChange(newContent);
    }
  }, [onChange]);

  // Simple toolbar for basic formatting
  const insertFormatting = useCallback((format: string) => {
    const textarea = textareaRef.current;
    if (!textarea || !editable) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = internalContent.substring(start, end);

    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'h3':
        formattedText = `### ${selectedText}`;
        break;
      case 'ul':
        formattedText = `- ${selectedText}`;
        break;
      case 'ol':
        formattedText = `1. ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent =
      internalContent.substring(0, start) +
      formattedText +
      internalContent.substring(end);

    setInternalContent(newContent);
    onChange?.(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  }, [internalContent, editable, onChange]);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Simple toolbar */}
      {editable && (
        <div className="border-b bg-gray-50 px-3 py-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('bold')}
            className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('italic')}
            className="px-2 py-1 text-xs italic bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('code')}
            className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Code (Ctrl+`)"
          >
            <code>Code</code>
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('h2')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('h3')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('ul')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('ol')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('link')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Link"
          >
            🔗 Link
          </button>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={internalContent}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={!editable}
          className={`border-0 resize-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
            !editable ? 'bg-gray-50 cursor-not-allowed' : ''
          }`}
          style={{
            minHeight: height,
            maxHeight: height,
            overflow: 'auto'
          }}
        />

        {/* Character count */}
        {editable && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
            {internalContent.length} karakter
          </div>
        )}
      </div>
    </div>
  );
}