"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Check, Sparkles } from "lucide-react";
import { useForm } from '@tanstack/react-form';
import { KnowledgeSubject } from "@/types/knowledge-subject";
import { IconPicker, IconName, Icon } from "@/components/ui/icon-picker";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { iconsData } from "@/utils/icons-data";
import {
  createKnowledgeSubjectSchema,
  updateKnowledgeSubjectSchema,
  type CreateKnowledgeSubjectFormData,
  type UpdateKnowledgeSubjectFormData,
} from "@/lib/validation/schemas";
import { FormInput } from "@/lib/validation/form-utils";

interface SubjectManagerTanStackProps {
  subjects: KnowledgeSubject[];
  onSubjectAdd: (subject: { name: string; icon?: string }) => void;
  onSubjectUpdate: (
    id: string,
    subject: { name?: string; icon?: string }
  ) => void;
  onSubjectDelete: (id: string) => void;
  isAdding?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function SubjectManagerTanStack({
  subjects,
  onSubjectAdd,
  onSubjectUpdate,
  onSubjectDelete,
  isAdding = false,
  isUpdating = false,
  isDeleting = false,
}: SubjectManagerTanStackProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<KnowledgeSubject | null>(null);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);
  const [editingIcon, setEditingIcon] = useState<IconName | undefined>(undefined);
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<KnowledgeSubject | null>(null);

  // Initialize add form
  const addForm = useForm({
    defaultValues: {
      name: '',
      icon: '',
    } as CreateKnowledgeSubjectFormData,
    onSubmit: async ({ value }) => {
      // Manual validation
      const result = createKnowledgeSubjectSchema.safeParse(value);
      if (!result.success) {
        // Set errors on form
        result.error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as 'name' | 'icon';
          addForm.setFieldMeta(fieldName, (prev) => ({
            ...prev,
            errors: [issue.message],
          }));
        });
        return;
      }

      onSubjectAdd(value);
      addForm.reset();
      setIcon(undefined);
      setIsAddingNew(false);
    },
  });

  // Initialize update form
  const updateForm = useForm({
    defaultValues: {
      name: '',
      icon: '',
    } as UpdateKnowledgeSubjectFormData,
    onSubmit: async ({ value }) => {
      if (editingId) {
        // Manual validation
        const result = updateKnowledgeSubjectSchema.safeParse(value);
        if (!result.success) {
          // Set errors on form
          result.error.issues.forEach((issue) => {
            const fieldName = issue.path[0] as 'name' | 'icon';
            updateForm.setFieldMeta(fieldName, (prev) => ({
              ...prev,
              errors: [issue.message],
            }));
          });
          return;
        }

        onSubjectUpdate(editingId, value);
        updateForm.reset();
        setEditingIcon(undefined);
        setEditingId(null);
        setEditingSubject(null);
      }
    },
  });

  // Icon changes will be handled with Subscribe pattern in JSX

  const handleEditSubject = (subject: KnowledgeSubject) => {
    setEditingId(subject.id);
    setEditingSubject(subject);
    setEditingIcon((subject.icon as IconName) || undefined);
    updateForm.setFieldValue('name', subject.name);
    updateForm.setFieldValue('icon', subject.icon || '');
  };

  const handleDeleteSubject = (subject: KnowledgeSubject) => {
    setSubjectToDelete(subject);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (subjectToDelete) {
      onSubjectDelete(subjectToDelete.id);
    }
    setShowDeleteConfirm(false);
    setSubjectToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSubjectToDelete(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingSubject(null);
    setEditingIcon(undefined);
    updateForm.reset();
  };

  const cancelAdd = () => {
    setIsAddingNew(false);
    addForm.reset();
    setIcon(undefined);
  };

  const getFallbackIcon = (subjectName: string): IconName => {
    const name = subjectName.toLowerCase();

    // Technology-related keywords
    if (name.includes('data') || name.includes('analytics') || name.includes('business')) return 'chart-bar';
    if (name.includes('machine') || name.includes('ai') || name.includes('learning')) return 'brain-circuit';
    if (name.includes('web') || name.includes('code') || name.includes('programming')) return 'code';
    if (name.includes('mobile') || name.includes('app') || name.includes('phone')) return 'smartphone';
    if (name.includes('cloud') || name.includes('server') || name.includes('aws')) return 'cloud';
    if (name.includes('security') || name.includes('protect') || name.includes('shield')) return 'shield';
    if (name.includes('design') || name.includes('ui') || name.includes('ux')) return 'palette';
    if (name.includes('project') || name.includes('manage') || name.includes('business')) return 'briefcase';
    if (name.includes('database') || name.includes('storage')) return 'database';

    // Default fallback
    return 'folder';
  };

  const handleAutoPickIcon = async (subjectName: string, isEditing: boolean = false) => {
    if (!subjectName.trim()) return;

    setIsGeneratingIcon(true);

    try {
      // Get list of available icon names
      const availableIcons = iconsData.map(icon => icon.name);

      // Create prompt for Gemini with detailed icon information
      const iconDetails = iconsData.map(icon =>
        `${icon.name} (categories: ${icon.categories.join(', ')}; tags: ${icon.tags.join(', ')})`
      ).join('\n');

      const prompt = `Given the subject name "${subjectName}", analyze the following icon database and suggest the most appropriate icon name.

Available Icons:
${iconDetails}

Instructions:
1. Analyze the subject name and its semantic meaning
2. Consider the categories and tags of each icon
3. Choose the icon that best represents the subject concept
4. Prioritize icons with relevant categories and tags
5. Return ONLY the exact icon name (no additional text)

Subject Analysis Examples:
- "Data Science" → Look for icons with "data", "chart", "analytics" tags
- "Web Development" → Look for icons with "code", "development", "web" tags
- "UI/UX Design" → Look for icons with "design", "palette", "interface" tags
- "Mobile Development" → Look for icons with "mobile", "smartphone", "app" tags
- "Cybersecurity" → Look for icons with "security", "shield", "protection" tags

Choose the best matching icon name for "${subjectName}":`;

      // Call Gemini API (using environment variable)
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.warn('Gemini API key not configured, using fallback logic');
        const fallbackIcon = getFallbackIcon(subjectName);
        if (isEditing) {
          setEditingIcon(fallbackIcon);
          updateForm.setFieldValue('icon', fallbackIcon);
        } else {
          setIcon(fallbackIcon);
          addForm.setFieldValue('icon', fallbackIcon);
        }
        setIsGeneratingIcon(false);
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const suggestedIcon = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // Validate that the suggested icon exists in our list
      if (suggestedIcon && availableIcons.includes(suggestedIcon)) {
        if (isEditing) {
          setEditingIcon(suggestedIcon as IconName);
          updateForm.setFieldValue('icon', suggestedIcon);
        } else {
          setIcon(suggestedIcon as IconName);
          addForm.setFieldValue('icon', suggestedIcon);
        }
      } else {
        // Fallback to local logic if Gemini fails
        const fallbackIcon = getFallbackIcon(subjectName);
        if (isEditing) {
          setEditingIcon(fallbackIcon);
          updateForm.setFieldValue('icon', fallbackIcon);
        } else {
          setIcon(fallbackIcon);
          addForm.setFieldValue('icon', fallbackIcon);
        }
      }
    } catch (error) {
      console.error('Error generating icon:', error);
      // Fallback to local logic
      const fallbackIcon = getFallbackIcon(subjectName);
      if (isEditing) {
        setEditingIcon(fallbackIcon);
        updateForm.setFieldValue('icon', fallbackIcon);
      } else {
        setIcon(fallbackIcon);
        addForm.setFieldValue('icon', fallbackIcon);
      }
    } finally {
      setIsGeneratingIcon(false);
    }
  };

  return (
    <>
      {/* Sync icon changes with add form */}
      <addForm.Subscribe
        selector={(state) => state.values.icon}
        children={(iconValue) => {
          React.useEffect(() => {
            if (iconValue !== icon) {
              addForm.setFieldValue('icon', icon || '');
            }
          }, [icon, addForm]);
          return null;
        }}
      />

      {/* Sync icon changes with update form */}
      <updateForm.Subscribe
        selector={(state) => state.values.icon}
        children={(iconValue) => {
          React.useEffect(() => {
            if (iconValue !== editingIcon) {
              updateForm.setFieldValue('icon', editingIcon || '');
            }
          }, [editingIcon, updateForm]);
          return null;
        }}
      />

      {/* <div className="space-y-3"> */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Manage Subjects</h3>
        <button
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
          type="button"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>


      {/* Add new subject form */}
      {isAddingNew && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addForm.handleSubmit();
          }}
          className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3"
        >
          <addForm.Field name="name">
            {(field) => (
              <FormInput
                field={field}
                label="Subject Name"
                placeholder="Enter subject name"
                required
                autoFocus
                className="text-sm py-2"
              />
            )}
          </addForm.Field>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Icon <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <IconPicker
                value={icon}
                onValueChange={(e) => {
                  setIcon(e as IconName);
                  addForm.setFieldValue('icon', e);
                }}
                className="w-fit"
              />
              <button
                type="button"
                onClick={() => handleAutoPickIcon(addForm.state.values.name || '')}
                disabled={!addForm.state.values.name?.trim() || isGeneratingIcon}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm disabled:opacity-50"
                title="Auto-pick icon based on subject name"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingIcon ? "..." : "Auto"}
              </button>
            </div>
            <addForm.Field name="icon">
              {(field) => (
                <>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-600 text-xs mt-1.5">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </>
              )}
            </addForm.Field>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!addForm.state.values.name?.trim() || isAdding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isAdding ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={cancelAdd}
              disabled={isAdding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Subjects list */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className={`p-3 border rounded-lg transition-all ${
              editingId === subject.id
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {editingId === subject.id ? (
              // Edit mode
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateForm.handleSubmit();
                }}
                className="space-y-3"
              >
                <updateForm.Field name="name">
                  {(field) => (
                    <FormInput
                      field={field}
                      label="Subject Name"
                      placeholder="Enter subject name"
                      required
                      autoFocus
                      className="text-sm py-2"
                    />
                  )}
                </updateForm.Field>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Icon <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <IconPicker
                      value={editingIcon}
                      onValueChange={(e) => {
                        setEditingIcon(e as IconName);
                        updateForm.setFieldValue('icon', e);
                      }}
                      className="w-fit"
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoPickIcon(updateForm.state.values.name || '', true)}
                      disabled={!updateForm.state.values.name?.trim() || isGeneratingIcon}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm disabled:opacity-50"
                      title="Auto-pick icon based on subject name"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGeneratingIcon ? "..." : "Auto"}
                    </button>
                  </div>
                  <updateForm.Field name="icon">
                    {(field) => (
                      <>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-red-600 text-xs mt-1.5">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </>
                    )}
                  </updateForm.Field>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!updateForm.state.values.name?.trim() || isUpdating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {isUpdating ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // View mode
              <div className="flex items-center justify-between">
                <div className="flex gap-2 min-w-0">
                  <Icon name={subject.icon as IconName} />
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {subject.name}
                  </h4>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => handleEditSubject(subject)}
                    disabled={isUpdating}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Edit subject"
                    type="button"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject)}
                    disabled={isDeleting}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete subject"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {subjects.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No subjects available</p>
          <p className="text-xs mt-1">Add your first subject to get started</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Hapus Subject"
        message={`Apakah Anda yakin ingin menghapus subject "${subjectToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}