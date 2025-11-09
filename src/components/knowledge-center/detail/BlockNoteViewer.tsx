"use client";

import React, { useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
// @ts-expect-error: CSS module has no type declarations
import "@blocknote/mantine/style.css";
import { Block, BlockNoteEditor } from "@blocknote/core";

interface BlockNoteViewerProps {
  contentJson: string; // JSON string representing BlockNote document
  className?: string;
}

export default function BlockNoteViewer({
  contentJson,
  className = "",
}: BlockNoteViewerProps) {
  const editor = useMemo(() => {
    let parsedContent: Block[] = [];

    try {
      // Parse JSON string to BlockNote blocks
      parsedContent = JSON.parse(contentJson);
      console.log(
        "BlockNoteViewer: Successfully parsed content, blocks:",
        parsedContent.length
      );
    } catch (error) {
      console.error("BlockNoteViewer: Failed to parse content JSON:", error);
      return null;
    }

    // If no content, return null
    if (!parsedContent || parsedContent.length === 0) {
      console.log("BlockNoteViewer: No content available");
      return null;
    }

    try {
      // Create a read-only editor instance with the parsed content
      const editorInstance = BlockNoteEditor.create({
        initialContent: parsedContent,
      });

      return editorInstance;
    } catch (error) {
      console.error("BlockNoteViewer: Failed to create editor:", error);
      return null;
    }
  }, [contentJson]);

  // Error state
  if (!editor) {
    return (
      <div
        className={`p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}
      >
        <p className="text-gray-500">
          Error rendering content. Invalid format.
        </p>
      </div>
    );
  }

  return (
    <BlockNoteView
      editor={editor}
      editable={false}
      theme={"light"}
      className="min-h-[200px] pb-8"
    />
  );
}
