/**
 * Basic Info Form - Clean Implementation with TanStack Form Best Practices
 *
 * Key improvements:
 * - Native Zod validation integration
 * - No duplicate state management
 * - Clean, readable component structure
 * - Proper TypeScript typing
 * - Optimized rendering performance
 */

"use client";

import React, { useState, useRef } from "react";
import { User, X, Settings } from "lucide-react";
import type { UseKnowledgeWizardFormReturn } from "@/hooks/useKnowledgeWizardForm";
import type { Penyelenggara } from "@/types/knowledge-center";
import type { KnowledgeSubject } from "@/types/knowledge-subject";
import {
  FormTextarea,
  FormFileUpload,
  FormInput,
  FormDropdown,
} from "@/lib/validation/form-utils";
import SubjectManager from "./SubjectManagerTanStack";
import {
  basicInfoSchema,
  thumbnailValidator,
} from "@/lib/validation/knowledge-schemas";
import TagsField from "./TagsField";

// ============================================================================
// Types
// ============================================================================

export interface SubjectHandlers {
  onAdd?: (subject: KnowledgeSubject) => void;
  onUpdate?: (id: string, subject: Partial<KnowledgeSubject>) => void;
  onDelete?: (id: string) => void;
  isPending?: {
    adding: boolean;
    updating: boolean;
    deleting: boolean;
  };
}

export interface BasicInfoFormProps {
  wizard: UseKnowledgeWizardFormReturn;
  subjects: KnowledgeSubject[];
  penyelenggara: Penyelenggara[];
  subjectHandlers?: SubjectHandlers;
}

// ============================================================================
// Component
// ============================================================================

export default function BasicInfoForm({
  wizard,
  subjects,
  penyelenggara,
  subjectHandlers,
}: BasicInfoFormProps) {
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [localTagInput, setLocalTagInput] = useState("");

  const { form, thumbnailPreview, formValues } = wizard;
  const { handleThumbnailSelect, handleThumbnailRemove } = wizard;

  // Access tags directly from form values
  const currentTags = formValues.tags || [];

  return (
    <div className="space-y-5">
      {/* Title Field with Zod Validation */}
      <form.Field
        name="title"
        validators={{
          onChange: basicInfoSchema.shape.title,
          onBlur: basicInfoSchema.shape.title,
        }}
      >
        {(field: any) => (
          <FormInput
            field={field}
            label="Title"
            placeholder="Enter a clear, descriptive title"
            required
          />
        )}
      </form.Field>

      {/* Description Field with Zod Validation */}
      <form.Field
        name="description"
        validators={{
          onChange: basicInfoSchema.shape.description,
          onBlur: basicInfoSchema.shape.description,
        }}
      >
        {(field: any) => (
          <FormTextarea
            field={field}
            label="Description"
            placeholder="Describe what learners will gain from this content"
            required
          />
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        {/* Organizer Field with Zod Validation */}
        <form.Field
          name="penyelenggara"
          validators={{
            onChange: basicInfoSchema.shape.penyelenggara,
            onBlur: basicInfoSchema.shape.penyelenggara,
          }}
        >
          {(field: any) => (
            <FormDropdown
              field={field}
              label="Organizer"
              placeholder="Select organizer"
              options={penyelenggara.map((p) => ({
                value: p.name,
                label: p.name,
              }))}
              required
            />
          )}
        </form.Field>

        {/* Author Field with Zod Validation */}
        <form.Field
          name="createdBy"
          validators={{
            onChange: basicInfoSchema.shape.createdBy,
            onBlur: basicInfoSchema.shape.createdBy,
          }}
        >
          {(field: any) => (
            <FormInput
              field={field}
              label="Author"
              placeholder="Enter author name"
              required
              icon={<User className="w-4 h-4 text-gray-400" />}
            />
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Subject Field with Zod Validation */}
        <form.Field
          name="idSubject"
          validators={{
            onChange: basicInfoSchema.shape.idSubject,
            onBlur: basicInfoSchema.shape.idSubject,
          }}
        >
          {(field: any) => (
            <FormDropdown
              field={field}
              label="Subject"
              placeholder="Select subject"
              options={subjects.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
              required
              actionButton={
                <button
                  type="button"
                  onClick={() => setShowSubjectManager(!showSubjectManager)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  Manage Subjects
                </button>
              }
            >
              {/* Subject Manager */}
              {showSubjectManager &&
                subjectHandlers?.onAdd &&
                subjectHandlers?.onUpdate &&
                subjectHandlers?.onDelete && (
                  <div className="mt-3">
                    <SubjectManager
                      subjects={subjects}
                      onSubjectAdd={(subject) =>
                        subjectHandlers.onAdd!({
                          ...subject,
                          id: "",
                          icon: subject.icon || "",
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      onSubjectUpdate={subjectHandlers.onUpdate}
                      onSubjectDelete={subjectHandlers.onDelete}
                      isAdding={subjectHandlers.isPending?.adding || false}
                      isUpdating={subjectHandlers.isPending?.updating || false}
                      isDeleting={subjectHandlers.isPending?.deleting || false}
                    />
                  </div>
                )}
            </FormDropdown>
          )}
        </form.Field>

        {/* Published Date Field with Zod Validation */}
        <form.Field
          name="publishedAt"
          validators={{
            onChange: basicInfoSchema.shape.publishedAt,
            onBlur: basicInfoSchema.shape.publishedAt,
          }}
        >
          {(field: any) => (
            <FormInput
              field={field}
              label="Published Date"
              type="datetime-local"
            />
          )}
        </form.Field>
      </div>

      {/* Thumbnail Field with Zod Validation */}
      <form.Field
        name="thumbnail"
        validators={{
          onChange: thumbnailValidator,
          onBlur: thumbnailValidator,
        }}
      >
        {(field: any) => (
          <FormFileUpload
            field={field}
            label="Thumbnail"
            accept="image/*"
            maxSize={20 * 1024 * 1024}
            required
            previewUrl={thumbnailPreview || ""}
            recommendations={{
              minWidth: 800,
              minHeight: 450,
              aspectRatio: "16:9",
              formats: ["JPEG", "PNG", "WebP"],
              optimalSize: "1200x675px (16:9 ratio)",
            }}
            onRemove={() => {
              handleThumbnailRemove();
              field.handleChange(undefined as any);
            }}
            onThumbnailSelect={handleThumbnailSelect}
          />
        )}
      </form.Field>

      {/* Tags Field - Custom Implementation with Validation */}
      <form.Field
        name="tags"
        validators={{
          onChange: ({ value }: { value: string[] }) => {
            const result = basicInfoSchema.shape.tags.safeParse(value);
            return result.success ? undefined : result.error.errors[0]?.message;
          },
          onBlur: ({ value }: { value: string[] }) => {
            const result = basicInfoSchema.shape.tags.safeParse(value);
            return result.success ? undefined : result.error.errors[0]?.message;
          },
        }}
      >
        {(field: any) => <TagsField field={field} label="Tags" required />}
      </form.Field>
    </div>
  );
}
