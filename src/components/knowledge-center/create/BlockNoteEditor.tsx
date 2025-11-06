"use client";

import React from "react";
// @ts-expect-error: CSS module has no type declarations
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
// @ts-expect-error: CSS module has no type declarations
import "@blocknote/mantine/style.css";

export default function BlockNoteEditor({
  type,
}: {
  type?: "article" | "pdf" | "video" | "audio";
}) {
  // Stores the document JSON.
  // const [blocks, setBlocks] = useState<Block[]>([]);

  async function uploadImage(file: File) {
    const body = new FormData();
    body.append("image", file);
    const ret = await fetch("http://localhost:9999/api/upload", {
      method: "POST",
      body: body,
    });
    return (await ret.json()).data.imageUrl;
  }

  const editorForArticle = useCreateBlockNote({
    initialContent: [
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: { level: 1 },
        content: "Judul Artikel",
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
        content: "Pendahuluan",
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
        content: "Pembahasan",
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
        content: "Kesimpulan",
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
        content: "Referensi",
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
    uploadFile: uploadImage,
  });

  const editorForPDF = useCreateBlockNote({
    initialContent: [
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Konten PDF akan ditampilkan di sini.",
          },
        ],
      },
    ],
  });

  const editorForVideo = useCreateBlockNote({
    initialContent: [
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: {
          level: 2,
        },
        content: "Transkrip Video",
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
  });

  // Tambahkan initial konten untuk konten audio di bawah ini dengan lengkap
  const editorForAudio = useCreateBlockNote({
    initialContent: [
      {
        id: crypto.randomUUID(),
        type: "heading",
        props: {
          level: 2,
        },
        content: "Transkrip Audio",
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
  });

  const editor =
    type === "pdf"
      ? editorForPDF
      : type === "video"
        ? editorForVideo
        : type === "audio"
          ? editorForAudio
          : editorForArticle;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden min-h-screen py-8">
      <BlockNoteView editor={editor} />
    </div>
  );
}
