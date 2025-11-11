"use client";

import React, { useEffect } from "react";
// @ts-expect-error: CSS module has no type declarations
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
// @ts-expect-error: CSS module has no type declarations
import "@blocknote/mantine/style.css";
import { Block } from "@blocknote/core";
import { ContentType } from "@/types";

interface BlockTemplate {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  content?: Array<{ type: string; text: string; styles?: Record<string, unknown> }>;
}

interface TemplateConfig {
  title: string;
  description: string;
  blocks: BlockTemplate[];
}

interface BlockNoteEditorProps {
  type?: ContentType;
  onContentChange?: (contentJson: string) => void;
  initialContent?: Block[];
}

const CONTENT_TEMPLATES: Record<ContentType, TemplateConfig> = {
  article: {
    title: "Template Artikel",
    description: "Struktur artikel lengkap dengan heading, pembahasan, dan referensi",
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "Judul Artikel" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Ringkas tujuan utama artikel (2-3 kalimat) sebelum pembaca melanjutkan.",
            styles: { italic: true },
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Pendahuluan" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Berikan konteks mengapa topik ini penting bagi pembaca.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Pembahasan" }],
      },
      {
        id: crypto.randomUUID(),
        type: "bulletListItem",
        content: [
          {
            type: "text",
            text: "Poin utama pertama yang perlu dijelaskan.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "bulletListItem",
        content: [
          {
            type: "text",
            text: "Poin utama kedua dengan rincian pendukung.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "bulletListItem",
        content: [
          {
            type: "text",
            text: "Poin utama ketiga atau studi kasus singkat.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Kesimpulan" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Rangkum kembali inti materi dan berikan ajakan bertindak.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text", text: "Referensi" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tambahkan tautan atau sumber pendukung di sini.",
          },
        ],
      },
    ],
  },
  file: {
    title: "Template Dokumen File",
    description: "Template untuk konten file dengan struktur sederhana",
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "Judul Dokumen" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Konten file akan ditampilkan di sini.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Informasi tambahan mengenai dokumen file.",
          },
        ],
      },
    ],
  },
  video: {
    title: "Template Video",
    description: "Template untuk konten video dengan thumbnail dan transkrip",
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "Judul Video" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Deskripsi singkat mengenai konten video.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "image",
        props: {
          url: "https://dummyimage.com/600x400/000/fff",
          caption: "Video Thumbnail",
        },
      },
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Transkrip Video" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "0:00 - Pembukaan dan pengenalan topik.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "1:15 - Diskusi tentang poin utama pertama.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "3:30 - Penjelasan mendalam mengenai poin kedua.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "5:45 - Kesimpulan dan ajakan bertindak.",
          },
        ],
      },
    ],
  },
  podcast: {
    title: "Template Podcast/Audio",
    description: "Template untuk konten podcast dengan transkrip dan timeline",
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "Judul Audio" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Deskripsi singkat mengenai konten audio/podcast.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Transkrip Audio" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "0:00 - Pembukaan dan pengenalan topik.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "1:15 - Diskusi tentang poin utama pertama.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "3:30 - Penjelasan mendalam mengenai poin kedua.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "5:45 - Kesimpulan dan ajakan bertindak.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Catatan Tambahan" }],
      },
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tambahkan catatan atau informasi tambahan di sini.",
          },
        ],
      },
    ],
  },
};

export default function BlockNoteEditor({
  type,
  onContentChange,
  initialContent,
}: BlockNoteEditorProps) {
  async function uploadImage(file: File) {
    const body = new FormData();
    body.append("image", file);
    const ret = await fetch("http://localhost:9999/api/upload", {
      method: "POST",
      body: body,
    });
    return (await ret.json()).data.imageUrl;
  }

  const currentType: ContentType = type || "article";
  const currentTemplate = CONTENT_TEMPLATES[currentType];
  const content = initialContent || currentTemplate.blocks;

  // Create editor - useCreateBlockNote must be called at top level (Rules of Hooks)
  const editor = useCreateBlockNote({
    initialContent: content,
    uploadFile: uploadImage,
  });

  // Use ref to store latest onContentChange without causing re-renders
  const onContentChangeRef = React.useRef(onContentChange);

  // Update ref when onContentChange changes
  React.useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  // Set initial content when editor is ready
  const initialContentSetRef = React.useRef(false);

  React.useEffect(() => {
    if (!editor || initialContentSetRef.current) return;

    // Send initial content to parent
    const blocks = editor.document;
    const contentJson = JSON.stringify(blocks);
    console.log('📋 BlockNote: Setting initial content');
    console.log('📋 BlockNote: Initial blocks count:', blocks.length);
    console.log('📋 BlockNote: Initial JSON length:', contentJson.length);

    if (onContentChangeRef.current) {
      onContentChangeRef.current(contentJson);
    }

    initialContentSetRef.current = true;
  }, [editor]);

  // Set up onChange listener only once
  const listenerRegisteredRef = React.useRef(false);

  React.useEffect(() => {
    if (!editor || listenerRegisteredRef.current) return;

    // Register onChange listener
    editor.onChange(() => {
      const blocks = editor.document;
      const contentJson = JSON.stringify(blocks);
      console.log('✍️ BlockNote: Content changed');
      console.log('✍️ BlockNote: Blocks count:', blocks.length);
      console.log('✍️ BlockNote: JSON length:', contentJson.length);

      // Use ref to get latest callback
      if (onContentChangeRef.current) {
        onContentChangeRef.current(contentJson);
      }
    });

    listenerRegisteredRef.current = true;
  }, [editor]); // Only re-run if editor changes

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden min-h-screen py-8">
      <div className="px-12 pb-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentTemplate.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {currentTemplate.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {currentType.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      <div className="px-16 py-4">
        <BlockNoteView
          editor={editor}
        />
      </div>
    </div>
  );
}
