"use client";
import React from "react";
import RadioButton, { RadioOption } from "@/components/RadioButton";

const options: RadioOption[] = [
  { value: "video", label: "Video" },
  { value: "document", label: "Dokumen" },
  { value: "scorm", label: "SCORM" },
];

export default function RadioButtonPreview() {
  const [val, setVal] = React.useState("document");

  return (
    <div className="flex flex-col gap-8 p-6">
      <section className="max-w-3xl">
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Default (3 kolom)</h3>
        <RadioButton name="cat1" label="Category" options={options} value={val} onChange={setVal} />
      </section>

      <section className="max-w-3xl">
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">2 Kolom, Ukuran Kecil</h3>
        <RadioButton name="cat2" options={options} columns={2} size="sm" defaultValue="video" />
      </section>

      <section className="max-w-3xl">
        <h3 className="mb-2 font-[var(--font-body-bold,600)] text-[var(--color-foreground,#111827)]">Disabled</h3>
        <RadioButton name="cat3" options={options} defaultValue="scorm" disabled />
      </section>
    </div>
  );
}

