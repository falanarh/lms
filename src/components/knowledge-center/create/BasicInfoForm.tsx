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
  imageFileValidator,
} from "@/lib/validation/knowledge-schemas";

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
  const fieldRef = useRef<any>(null);

  const { form, thumbnailPreview, currentTagInput, currentTags } = wizard;
  const { handleThumbnailSelect, handleThumbnailRemove, setCurrentTagInput } =
    wizard;

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
          onChange: imageFileValidator,
          onBlur: imageFileValidator,
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
        {(field: any) => {
          // Store field ref for external access
          if (!fieldRef.current) {
            fieldRef.current = field;
          }

          // Use field.state.value as source of truth
          const currentFieldTags = field.state.value || [];

          const handleAddTagLocal = () => {
            const trimmedTag = localTagInput.trim();
            if (trimmedTag && !currentFieldTags.includes(trimmedTag)) {
              const newTags = [...currentFieldTags, trimmedTag];
              field.handleChange(newTags);
              setLocalTagInput('');
            }
          };

          const handleRemoveTagLocal = (tagToRemove: string) => {
            const updatedTags = currentFieldTags.filter((tag: string) => tag !== tagToRemove);
            field.handleChange(updatedTags);
          };

          return (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tags <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 ${field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-[var(--border,rgba(0,0,0,0.12))]'} rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all max-h-[120px] overflow-y-auto`}>
                {currentFieldTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentFieldTags.map((tag: any, index: any) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => handleRemoveTagLocal(tag)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          type="button"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={localTagInput}
                  onChange={(e) => setLocalTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTagLocal();
                    }
                  }}
                  placeholder={
                    currentFieldTags.length === 0
                      ? "Type a tag and press Enter or comma"
                      : "Add another tag..."
                  }
                  className="w-full h-12 px-4 outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                />
              </div>
              {field.state.meta.errors.length > 0 ? (
                <p className="text-red-500 text-xs mt-1.5">
                  {field.state.meta.errors[0]}
                </p>
              ) : (
                <p className="text-gray-500 text-xs mt-1.5">
                  Press Enter or comma to add a tag
                </p>
              )}
            </div>
          );
        }}
      </form.Field>
    </div>
  );
}
