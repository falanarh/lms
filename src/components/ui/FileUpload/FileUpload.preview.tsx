"use client";
import React from "react";
import { FileUpload } from "@/components/ui/FileUpload";

export default function FileUploadPreview() {
  const demoFile = React.useMemo(() => new File(["hello"], "contoh.pdf", { type: "application/pdf" }), []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Dropzone - Default</h3>
        <div className="max-w-xl">
          <FileUpload />
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Dropzone - Multiple</h3>
        <div className="max-w-xl">
          <FileUpload acceptedFileTypes={["video"]} maxFileSizeMB={500} multiple />
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Dropzone - Disabled</h3>
        <div className="max-w-xl">
          <FileUpload disabled />
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Compact - Default</h3>
        <div className="max-w-xl">
          <FileUpload variant="compact" />
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Compact - Dengan File</h3>
        <div className="max-w-xl">
          <FileUpload variant="compact" defaultValue={demoFile} />
        </div>
      </section>
    </div>
  );
}
