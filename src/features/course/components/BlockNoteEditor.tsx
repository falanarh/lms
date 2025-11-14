"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";

interface BlockNoteEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  height?: string;
}

export function BlockNoteEditor({
  content = "",
  onChange,
  placeholder = "Mulai mengetik...",
  editable = true,
  className = "",
  height = "200px"
}: BlockNoteEditorProps) {
  const [internalContent, setInternalContent] = useState(content);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Update internal content when prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '';
    }
    setInternalContent(content);
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setInternalContent(newContent);
      if (onChange) {
        onChange(newContent);
      }
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const insertFormatting = useCallback((format: string) => {
    if (!editable) return;

    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'underline':
        execCommand('underline');
        break;
      case 'code':
        execCommand('formatBlock', '<pre>');
        break;
      case 'h2':
        execCommand('formatBlock', '<h2>');
        break;
      case 'h3':
        execCommand('formatBlock', '<h3>');
        break;
      case 'ul':
        execCommand('insertUnorderedList');
        break;
      case 'ol':
        execCommand('insertOrderedList');
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          execCommand('createLink', url);
        }
        break;
    }
  }, [editable, execCommand]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editable) return;

    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  }, [editable, execCommand]);

  return (
    <div className={`border rounded-lg overflow-hidden bg-white dark:bg-zinc-900 ${className}`}>
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('bold')}
            className="px-2 py-1 text-xs font-bold bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('italic')}
            className="px-2 py-1 text-xs italic bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('underline')}
            className="px-2 py-1 text-xs underline bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Underline (Ctrl+U)"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('code')}
            className="px-2 py-1 text-xs font-mono bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Code"
          >
            &lt;/&gt;
          </button>
          
          <div className="w-px bg-gray-300 dark:bg-zinc-600 mx-1"></div>
          
          <button
            type="button"
            onClick={() => insertFormatting('h2')}
            className="px-2 py-1 text-xs font-semibold bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('h3')}
            className="px-2 py-1 text-xs font-semibold bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Heading 3"
          >
            H3
          </button>
          
          <div className="w-px bg-gray-300 dark:bg-zinc-600 mx-1"></div>
          
          <button
            type="button"
            onClick={() => insertFormatting('ul')}
            className="px-2 py-1 text-xs bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('ol')}
            className="px-2 py-1 text-xs bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('link')}
            className="px-2 py-1 text-xs bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            title="Link"
          >
            🔗 Link
          </button>
        </div>
      )}

      {/* ContentEditable Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={editable}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`editor-content px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none overflow-auto ${
            !editable ? 'bg-gray-50 dark:bg-zinc-800 cursor-not-allowed' : ''
          }`}
          style={{
            minHeight: height,
            maxHeight: height,
          }}
          suppressContentEditableWarning
        />
        
        {/* Placeholder */}
        {editable && !internalContent && !isFocused && (
          <div className="absolute top-3 left-4 text-sm text-gray-400 dark:text-zinc-500 pointer-events-none">
            {placeholder}
          </div>
        )}

        {/* Character count */}
        {editable && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700">
            {internalContent.replace(/<[^>]*>/g, '').length} karakter
          </div>
        )}
      </div>

      {/* CSS for editor content styling */}
      <style jsx global>{`
        .editor-content {
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        
        .editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          color: inherit;
        }
        
        .editor-content h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
          color: inherit;
        }
        
        .editor-content ul,
        .editor-content ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        
        .editor-content li {
          margin: 0.25em 0;
        }
        
        .editor-content pre {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 0.5em;
          border-radius: 0.25em;
          font-family: monospace;
          margin: 0.5em 0;
        }
        
        .dark .editor-content pre {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .editor-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .dark .editor-content a {
          color: #60a5fa;
        }
        
        .editor-content strong {
          font-weight: bold;
        }
        
        .editor-content em {
          font-style: italic;
        }
        
        .editor-content u {
          text-decoration: underline;
        }

        .editor-content p {
          margin: 0.5em 0;
        }

        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}