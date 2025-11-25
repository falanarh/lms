'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Table,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { RichTextEditorProps } from '@/types/knowledge-center';

// Basic rich text editor implementation using contentEditable
// In production, consider using a library like TipTap, Quill, or Mantine RTE
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Mulai menulis konten...',
  disabled = false,
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Update editor content when value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  const createLink = () => {
    const url = prompt('Masukkan URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertTable = () => {
    const tableHTML = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd;">Kolom 1</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Kolom 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Baris 1</td>
            <td style="padding: 8px; border: 1px solid #ddd;">Baris 1</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Baris 2</td>
            <td style="padding: 8px; border: 1px solid #ddd;">Baris 2</td>
          </tr>
        </tbody>
      </table>
    `;

    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = tableHTML;
        if (div.firstChild) {
          range.insertNode(div.firstChild);
        }
        handleContentChange();
      }
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      // Basic sanitization - in production, use DOMPurify or similar
      const sanitizedContent = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '');

      onChange(sanitizedContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      execCommand('indent');
    }
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    title,
    isActive = false,
    disabled = false,
  }: {
    onClick: () => void;
    icon: any;
    title: string;
    isActive?: boolean;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-600'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const ToolbarSeparator = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

  if (isPreviewMode) {
    return (
      <div className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Preview Mode</span>
          <button
            onClick={togglePreview}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        </div>
        <div
          className="p-4 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap">
        <ToolbarButton
          onClick={() => execCommand('undo')}
          icon={Undo}
          title="Undo"
          disabled={disabled}
        />
        <ToolbarButton
          onClick={() => execCommand('redo')}
          icon={Redo}
          title="Redo"
          disabled={disabled}
        />

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => execCommand('formatBlock', '<h1>')}
          icon={Heading1}
          title="Heading 1"
          disabled={disabled}
        />
        <ToolbarButton
          onClick={() => execCommand('formatBlock', '<h2>')}
          icon={Heading2}
          title="Heading 2"
          disabled={disabled}
        />
        <ToolbarButton
          onClick={() => execCommand('formatBlock', '<h3>')}
          icon={Heading3}
          title="Heading 3"
          disabled={disabled}
        />

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => execCommand('bold')}
          icon={Bold}
          title="Bold"
          disabled={disabled}
        />
        <ToolbarButton
          onClick={() => execCommand('italic')}
          icon={Italic}
          title="Italic"
          disabled={disabled}
        />

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => execCommand('insertUnorderedList')}
          icon={List}
          title="Bullet List"
          disabled={disabled}
        />
        <ToolbarButton
          onClick={() => execCommand('insertOrderedList')}
          icon={ListOrdered}
          title="Numbered List"
          disabled={disabled}
        />

        <ToolbarSeparator />

        <ToolbarButton
          onClick={createLink}
          icon={Link}
          title="Insert Link"
          disabled={disabled}
        />
        <ToolbarButton
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          icon={Quote}
          title="Quote"
          disabled={disabled}
        />
        <ToolbarButton
          onClick={() => execCommand('formatBlock', '<pre>')}
          icon={Code}
          title="Code Block"
          disabled={disabled}
        />
        <ToolbarButton
          onClick={insertTable}
          icon={Table}
          title="Insert Table"
          disabled={disabled}
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={togglePreview}
            className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1"
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: disabled ? '#9ca3af' : '#374151',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Character count */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>
          Characters: {value.replace(/<[^>]*>/g, '').length}
        </span>
        <span>
          Words: {value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
        </span>
      </div>

      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        [contenteditable] {
          outline: none;
        }

        [contenteditable] h1,
        [contenteditable] h2,
        [contenteditable] h3 {
          font-weight: bold;
          margin: 1em 0 0.5em;
        }

        [contenteditable] h1 { font-size: 2em; }
        [contenteditable] h2 { font-size: 1.5em; }
        [contenteditable] h3 { font-size: 1.2em; }

        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5em 0;
          padding-left: 2em;
        }

        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }

        [contenteditable] pre {
          background: #f3f4f6;
          padding: 1em;
          border-radius: 0.375rem;
          font-family: monospace;
          white-space: pre-wrap;
        }

        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }

        [contenteditable] th,
        [contenteditable] td {
          border: 1px solid #e5e7eb;
          padding: 0.5em;
        }

        [contenteditable] th {
          background: #f9fafb;
          font-weight: bold;
        }

        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }

        [contenteditable] a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}