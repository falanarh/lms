"use client";
/**
 * Komponen: SectionActivities (OPTIMIZED - NO SEPARATE CONTENT FETCH)
 * - Uses listContent from sections API response directly
 * - Fixes sync issues when adding activities
 * - More efficient data fetching
 */

import {
  Pencil,
  Plus,
  Trash2,
  Check,
  X,
  FolderOpen,
  GripVertical,
  Loader2,
  Eye,
} from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Sortable from "sortablejs";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast/Toast";
import { Button } from "@/components/ui/Button";
import ActivityCard from "./ActivityCard";
import {
  getSectionQueryKey,
  useCreateSection,
  useDeleteSection,
  useSections,
  useUpdateSection,
  useUpdateSectionsSequence,
} from "@/hooks/useSections";
import {
  useDeleteContent,
  useUpdateContentsSequence,
} from "@/hooks/useContent";
import { queryClient } from "@/lib/queryClient";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { Content } from "@/api/contents";
import { useForm } from "@tanstack/react-form";
import {
  CreateSectionInput,
  createSectionSchema,
  UpdateSectionInput,
  updateSectionSchema,
} from "@/schemas/section.schema";
import { ZodError } from "zod";

interface Activity {
  id: string;
  title: string;
  contentUrl?: string;
  type: "PDF" | "VIDEO" | "LINK" | "SCORM" | "QUIZ" | "TASK";
  size?: string;
  description?: string;
  sequence: number;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  activities: Activity[];
  sequence: number;
  idGroup?: string;
  listContent?: Content[];
}

interface SectionActivitiesProps {
  onAddActivity?: (sectionId: string) => void;
  onEditActivity?: (
    sectionId: string,
    activityId: string,
    activityData: Content,
  ) => void;
  onManageQuizQuestions?: (sectionId: string, activityId: string, activityData: Content) => void;
  groupId?: string;
}

export function SectionActivities({
  onAddActivity,
  onEditActivity,
  onManageQuizQuestions,
  groupId,
}: SectionActivitiesProps) {
  // ✅ ONLY fetch sections - contents are included in listContent
  const {
    data: sectionsData,
    isPending: isSectionsPending,
    isFetching: isSectionsFetching,
    error: sectionsError,
    refetch: refetchSections,
  } = useSections();

  const { mutate: createSection, isPending: isCreating } = useCreateSection({
    onSuccess: async () => {
      setShowToast(true);
      setToastMessage("Section berhasil ditambahkan!");
      setToastVariant("success");
      if (editingSectionId?.startsWith("local-")) {
        setLocalSections((prev) =>
          prev.filter((s) => s.id !== editingSectionId),
        );
      }
      setEditingSectionId(null);
      form.reset();
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
    },
    onError: (error: any) => {
      setShowToast(true);
      console.log(error);
      setToastMessage(error?.message || "Gagal menambahkan section!");
      setToastVariant("warning");
    },
  });

  const { mutate: deleteContent, isPending: isDeleting } = useDeleteContent({
    onSuccess: async () => {
      showToastMessage("success", "Activity berhasil dihapus!");
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
    },
    onError: (error: any) => {
      console.error(error);
      showToastMessage(
        "warning",
        error?.message || "Gagal menghapus activity!",
      );
    },
  });

  const { mutate: deleteSection, isPending: isDeletingSection } =
    useDeleteSection({
      onSuccess: async () => {
        showToastMessage("success", "Section berhasil dihapus!");
        await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
      },
      onError: (error: any) => {
        console.error(error);
        showToastMessage(
          "warning",
          error?.message || "Gagal menghapus section!",
        );
      },
    });

  const { mutate: updateSection } = useUpdateSection({
    onSuccess: async () => {
      showToastMessage("success", "Section berhasil diedit!");
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
    },
    onError: (error: any) => {
      console.error(error);
      showToastMessage("warning", error?.message || "Gagal mengedit section!");
    },
  });

  const { mutate: updateSectionsSequence, isPending: isUpdatingSequence } =
    useUpdateSectionsSequence({
      onSuccess: async () => {
        setLocalSections([]);
        await queryClient.invalidateQueries({ queryKey: getSectionQueryKey() });
        await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
        showToastMessage("success", "Urutan section berhasil diubah!");
      },
      onError: (error: any) => {
        console.error(error);
        showToastMessage(
          "warning",
          error?.message || "Gagal mengubah urutan section!",
        );
        queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
      },
    });

  const {
    mutate: updateContentsSequence,
    isPending: isUpdatingContentsSequence,
  } = useUpdateContentsSequence({
    onSuccess: async () => {
      showToastMessage("success", "Urutan activity berhasil diubah!");
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
    },
    onError: (error: any) => {
      console.error("❌ Update Contents Sequence Error:", error);
      showToastMessage("warning", "Gagal mengubah urutan activity!");
      queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      if (!editingSectionId) return;
      try {
        if (editingSectionId.startsWith("local-")) {
          const createData: CreateSectionInput = {
            idCourse: "4a74b0b4-c796-4a2d-8d86-e22c05f29f10",
            name: value.name,
            description: value.description || "",
            sequence: displayedSections.length,
          };
          const validatedData = createSectionSchema.parse(createData);
          createSection(validatedData);
        } else {
          const updateData: UpdateSectionInput = {
            name: value.name,
            description: value.description || "",
          };
          const validatedData = updateSectionSchema.parse(updateData);
          updateSection({
            id: editingSectionId,
            data: validatedData,
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          showToastMessage("warning", error.message);
        }
      }
    },
  });

  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "section" | "activity" | null;
    id: string | null;
    sectionId?: string;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    title: "",
  });

  const [sequenceConfirm, setSequenceConfirm] = useState<{
    isOpen: boolean;
    type: "section" | "activity" | "move-activity";
    pendingUpdates: any[];
    description: string;
  }>({
    isOpen: false,
    type: "activity",
    pendingUpdates: [],
    description: "",
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"info" | "warning" | "success">("success");
  const [loadingActivityId, setLoadingActivityId] = useState<string | null>(null);

  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);
  const activitiesSortableRefs = useRef<Map<string, Sortable>>(new Map());
  const viewCallbacks = useRef<Map<string, () => void>>(new Map());
  const originalSectionsOrderRef = useRef<Section[]>([]);
  const originalActivitiesOrderRef = useRef<Map<string, any[]>>(new Map());

  // ✅ SIMPLIFIED: Transform sections data directly (no separate contents fetch needed)
  const sectionsFromMemo = useMemo<Section[]>(() => {
    if (!sectionsData) {
      console.log("⚠️ No sections data available");
      return [];
    }

    const sectionsArray = sectionsData.data.filter(Boolean);

    console.log("📊 Processing sections:", {
      totalSections: sectionsArray.length,
      groupId,
    });

    const filteredSections = groupId
      ? sectionsArray.filter((s) => (s as any)?.idGroup === groupId)
      : sectionsArray;

    const processedSections = filteredSections
      .filter((section) => section && section.id)
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      .map((section) => {
        // ✅ Use listContent directly from API response
        const sectionActivities = (section.listContents || [])
          .filter((content) => content && content.id)
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
          .map((content) => ({
            id: content.id,
            title: content.name || "Untitled",
            type: mapContentType(content.type || "PDF"),
            contentUrl: content.contentUrl || "",
            size: calculateFileSize(content.contentUrl || ""),
            description: content.description || "",
            sequence: content.sequence || 0,
          }));

        console.log(`📦 Section "${section.name}" has ${sectionActivities.length} activities`);

        return {
          id: section.id,
          title: section.name || "Untitled Section",
          description: section.description || "",
          activities: sectionActivities,
          sequence: section.sequence || 0,
        };
      });

    console.log("✅ Processed sections:", processedSections.length);
    return processedSections;
  }, [sectionsData, groupId]);

  const displayedSections = useMemo(() => {
    const combined = [...sectionsFromMemo, ...localSections];
    return combined.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }, [sectionsFromMemo, localSections]);

  function mapContentType(type: string): "PDF" | "VIDEO" | "LINK" | "SCORM" | "QUIZ" | "TASK" {
    const typeUpper = type.toUpperCase();
    if (
      typeUpper === "PDF" ||
      typeUpper === "VIDEO" ||
      typeUpper === "LINK" ||
      typeUpper === "SCORM" ||
      typeUpper === "QUIZ" ||
      typeUpper === "TASK"
    ) {
      return typeUpper as "PDF" | "VIDEO" | "LINK" | "SCORM" | "QUIZ" | "TASK";
    }
    return "PDF";
  }

  function calculateFileSize(url: string): string {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "~2 MB";
    if (ext === "mp4" || ext === "avi") return "~150 MB";
    if (ext === "zip") return "~5 MB";
    return "Unknown";
  }

  const handleDeleteSectionClick = (section: Section) => {
    setDeleteConfirm({
      isOpen: true,
      type: "section",
      id: section.id,
      title: section.title,
    });
  };

  const handleDeleteActivityClick = (sectionId: string, activity: Activity) => {
    setDeleteConfirm({
      isOpen: true,
      type: "activity",
      id: activity.id,
      sectionId: sectionId,
      title: activity.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm.id) return;
    if (deleteConfirm.type === "section") {
      deleteSection(deleteConfirm.id);
    } else if (deleteConfirm.type === "activity") {
      deleteContent(deleteConfirm.id);
    }
    setDeleteConfirm({
      isOpen: false,
      type: null,
      id: null,
      title: "",
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({
      isOpen: false,
      type: null,
      id: null,
      title: "",
    });
  };

  const handleConfirmSequence = () => {
    if (sequenceConfirm.pendingUpdates.length === 0) return;
    if (sequenceConfirm.type === "section") {
      updateSectionsSequence(sequenceConfirm.pendingUpdates);
    } else if (sequenceConfirm.type === "activity" || sequenceConfirm.type === "move-activity") {
      updateContentsSequence(sequenceConfirm.pendingUpdates);
    }
    setSequenceConfirm({
      isOpen: false,
      type: "activity",
      pendingUpdates: [],
      description: "",
    });
  };

  const handleCancelSequence = () => {
    if (sortableInstanceRef.current) {
      sortableInstanceRef.current.destroy();
      sortableInstanceRef.current = null;
    }

    activitiesSortableRefs.current.forEach((sortable) => {
      sortable.destroy();
    });
    activitiesSortableRefs.current.clear();

    setSequenceConfirm({
      isOpen: false,
      type: "activity",
      pendingUpdates: [],
      description: "",
    });

    setLocalSections([]);

    queryClient.refetchQueries({ queryKey: getSectionQueryKey() }).then(() => {
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 50);
    });
  };

  const showToastMessage = (
    variant: "info" | "warning" | "success",
    message: string,
  ) => {
    setToastVariant(variant);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), variant === "success" ? 2000 : 3000);
  };

  const handleEditClick = (section: Section) => {
    setEditingSectionId(section.id);
    form.setFieldValue("name", section.title);
    form.setFieldValue("description", section.description || "");
  };

  const handleSaveClick = () => {
    form.handleSubmit();
  };

  const handleCancelClick = () => {
    setEditingSectionId(null);
  };

  const handleAddSection = () => {
    const newSequence = displayedSections.length;
    const newSection: Section = {
      id: `local-${Date.now()}`,
      title: `Section Baru ${newSequence + 1}`,
      description: "Klik ikon pensil untuk mengedit",
      activities: [],
      sequence: newSequence,
    };
    setLocalSections((prev) => [...prev, newSection]);
    showToastMessage("success", "Section baru berhasil ditambahkan!");
    setTimeout(() => {
      if (sectionsContainerRef.current) {
        sectionsContainerRef.current.scrollTo({
          top: sectionsContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
      setEditingSectionId(newSection.id);
    }, 100);
  };

  const handleAddActivity = (sectionId: string) => {
    console.log("➕ Adding activity to section:", sectionId);
    if (onAddActivity) {
      onAddActivity(sectionId);
    }
  };

  const handleEditActivity = (sectionId: string, activityId: string) => {
    console.log("✏️ Editing activity:", { sectionId, activityId });

    // ✅ Find activity from section's listContent
    const section = sectionsData?.data.find(s => s.id === sectionId);
    const activityData = section?.listContent?.find(content => content.id === activityId);

    if (activityData && onEditActivity) {
      onEditActivity(sectionId, activityId, activityData as Content);
    } else {
      console.warn("⚠️ Activity not found:", activityId);
    }
  };

  // Initialize Sortable for sections
  useEffect(() => {
    if (sortableInstanceRef.current) {
      sortableInstanceRef.current.destroy();
      sortableInstanceRef.current = null;
    }

    if (sectionsContainerRef.current && displayedSections.length > 0) {
      const timer = setTimeout(() => {
        if (sectionsContainerRef.current && !sortableInstanceRef.current) {
          sortableInstanceRef.current = new Sortable(sectionsContainerRef.current, {
            animation: 150,
            handle: ".section-drag-handle",
            ghostClass: "sortable-ghost",
            dragClass: "sortable-drag",
            chosenClass: "sortable-chosen",
            onStart: () => {
              originalSectionsOrderRef.current = [...displayedSections];
            },
            onEnd: (evt) => {
              const { oldIndex, newIndex } = evt;
              if (
                oldIndex === undefined ||
                newIndex === undefined ||
                oldIndex === newIndex
              )
                return;

              const combined = [...displayedSections];
              const [movedItem] = combined.splice(oldIndex, 1);
              combined.splice(newIndex, 0, movedItem);

              const updated = combined.map((section, idx) => ({
                ...section,
                sequence: idx + 1,
              }));

              const serverSections = updated.filter(
                (s) => !s.id.startsWith("local-"),
              );

              const sequenceUpdates = serverSections.map((s) => ({
                id: s.id,
                sequence: s.sequence,
              }));

              if (sequenceUpdates.length > 0) {
                setSequenceConfirm({
                  isOpen: true,
                  type: "section",
                  pendingUpdates: sequenceUpdates,
                  description: `Apakah Anda yakin ingin mengubah urutan section? Perubahan akan mempengaruhi ${sequenceUpdates.length} section.`,
                });
              }
            },
          });
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (sortableInstanceRef.current) {
          sortableInstanceRef.current.destroy();
          sortableInstanceRef.current = null;
        }
      };
    }

    return () => {
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
      }
    };
  }, [displayedSections.length, refreshKey, displayedSections]);

  // Initialize Sortable for activities
  useEffect(() => {
    activitiesSortableRefs.current.forEach((sortable) => {
      sortable.destroy();
    });
    activitiesSortableRefs.current.clear();

    const timer = setTimeout(() => {
      displayedSections.forEach((section) => {
        const container = document.querySelector(
          `[data-activities-section="${section.id}"]`,
        );
        if (container) {
          const sortable = new Sortable(container as HTMLElement, {
            animation: 150,
            handle: ".activity-drag-handle",
            ghostClass: "sortable-ghost",
            dragClass: "sortable-drag",
            group: "activities",
            onStart: (evt) => {
              const fromSectionId = evt.from.getAttribute("data-activities-section");
              if (fromSectionId) {
                const fromSection = displayedSections.find(s => s.id === fromSectionId);
                if (fromSection) {
                  originalActivitiesOrderRef.current.set(fromSectionId, [...fromSection.activities]);
                }
              }
            },
            onEnd: (evt) => {
              const { oldIndex, newIndex, from, to } = evt;
              if (oldIndex === undefined || newIndex === undefined) return;

              const fromSectionId = from.getAttribute("data-activities-section") || "";
              const toSectionId = to.getAttribute("data-activities-section") || "";

              if (!fromSectionId || !toSectionId) return;

              const fromSection = displayedSections.find(s => s.id === fromSectionId);
              const toSection = displayedSections.find(s => s.id === toSectionId);

              if (!fromSection || !toSection) return;

              try {
                if (fromSectionId === toSectionId) {
                  if (oldIndex === newIndex) return;

                  const activities = [...fromSection.activities];
                  const [movedActivity] = activities.splice(oldIndex, 1);
                  activities.splice(newIndex, 0, movedActivity);

                  const sequenceUpdates = activities.map((activity, idx) => ({
                    id: activity.id,
                    sequence: idx + 1,
                    idSection: fromSectionId,
                  }));

                  setSequenceConfirm({
                    isOpen: true,
                    type: "activity",
                    pendingUpdates: sequenceUpdates,
                    description: `Apakah Anda yakin ingin mengubah urutan activity dalam section ini? Perubahan akan mempengaruhi ${sequenceUpdates.length} activity.`,
                  });
                } else {
                  const fromActivities = [...fromSection.activities];
                  const toActivities = [...toSection.activities];

                  const [movedActivity] = fromActivities.splice(oldIndex, 1);
                  toActivities.splice(newIndex, 0, movedActivity);

                  const fromUpdates = fromActivities.map((activity, idx) => ({
                    id: activity.id,
                    sequence: idx + 1,
                    idSection: fromSectionId,
                  }));

                  const toUpdates = toActivities.map((activity, idx) => ({
                    id: activity.id,
                    sequence: idx + 1,
                    idSection: toSectionId,
                  }));

                  const allUpdates = [...fromUpdates, ...toUpdates];

                  setSequenceConfirm({
                    isOpen: true,
                    type: "move-activity",
                    pendingUpdates: allUpdates,
                    description: `Apakah Anda yakin ingin memindahkan activity ke section lain? Perubahan akan mempengaruhi ${allUpdates.length} activity di kedua section.`,
                  });
                }
              } catch (error) {
                console.error("❌ Error handling drag:", error);
              }
            },
          });
          activitiesSortableRefs.current.set(section.id, sortable);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      activitiesSortableRefs.current.forEach((sortable) => {
        sortable.destroy();
      });
      activitiesSortableRefs.current.clear();
    };
  }, [displayedSections, refreshKey]);

  if (isSectionsPending) {
    return <SectionSkeleton />;
  }

  if (sectionsError) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full">
          <X size={32} className="text-red-600 dark:text-red-400" />
        </div>
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">Gagal memuat data!</p>
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center max-w-md">
          Terjadi kesalahan saat mengambil data sections dan activities. Coba lagi.
        </p>
        <Button onClick={() => refetchSections()} variant="outline">
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (displayedSections.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-zinc-200">
            Struktur Course – Section & Activity
          </h2>
          <Button
            onClick={handleAddSection}
            size="sm"
            className="w-full sm:w-auto"
            leftIcon={<Plus size={18} className="sm:size-5" />}
          >
            Tambah Section Baru
          </Button>
        </div>
        <div className="border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-12 flex flex-col items-center justify-center text-gray-500 dark:text-zinc-500">
          <div className="size-16 mb-4 flex items-center justify-center">
            <FolderOpen size={48} className="text-gray-400 dark:text-zinc-600" />
          </div>
          <p className="text-base mb-2 font-medium text-gray-700 dark:text-zinc-300">Belum ada Section</p>
          <p className="text-sm text-gray-400 dark:text-zinc-500 text-center max-w-md">
            Mulai dengan menambahkan section baru untuk mengorganisir konten course Anda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-zinc-200">
          Struktur Course – Section & Activity
        </h2>
        <Button
          onClick={handleAddSection}
          size="sm"
          className="w-full sm:w-auto"
          leftIcon={<Plus size={18} className="sm:size-5" />}
        >
          Tambah Section Baru
        </Button>
      </div>

      <div ref={sectionsContainerRef} className="space-y-4" key={refreshKey}>
        {displayedSections.map((section, index) => (
          <div
            key={`${section.id}-${index}`}
            data-id={section.id}
            className={`border rounded-xl p-4 bg-white dark:bg-zinc-800 transition-shadow hover:shadow-sm ${section.id.startsWith("local-") ? "border-blue-300 dark:border-blue-600 border-dashed" : "border-gray-300 dark:border-zinc-700"}`}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  className="section-drag-handle p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded cursor-grab active:cursor-grabbing text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors flex-shrink-0"
                  aria-label="Drag to reorder section"
                >
                  <GripVertical size={20} />
                </button>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="size-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 flex-shrink-0">
                    {index + 1}
                  </span>
                  {editingSectionId === section.id ? (
                    <div className="flex-1 min-w-0 space-y-2">
                      <form.Field
                        name="name"
                        validators={{
                          onChange: ({ value }) => {
                            try {
                              if (editingSectionId.startsWith("local-")) {
                                createSectionSchema.shape.name.parse(value);
                              } else {
                                updateSectionSchema.shape.name?.parse(value);
                              }
                              return undefined;
                            } catch (error) {
                              if (error instanceof ZodError) {
                                return error.issues[0].message;
                              }
                              return "Validation error";
                            }
                          },
                        }}
                        children={(field) => (
                          <div>
                            <Input
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className="text-base font-medium"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveClick();
                                } else if (e.key === "Escape") {
                                  handleCancelClick();
                                }
                              }}
                              placeholder="Judul Section"
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-xs text-red-600 mt-1">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </div>
                        )}
                      />
                      <form.Field
                        name="description"
                        validators={{
                          onChange: ({ value }) => {
                            try {
                              if (editingSectionId.startsWith("local-")) {
                                createSectionSchema.shape.description?.parse(
                                  value,
                                );
                              } else {
                                updateSectionSchema.shape.description?.parse(
                                  value,
                                );
                              }
                              return undefined;
                            } catch (error) {
                              if (error instanceof ZodError) {
                                return error.issues[0].message;
                              }
                              return "Validation error";
                            }
                          },
                        }}
                        children={(field) => (
                          <div>
                            <Input
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className="text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveClick();
                                } else if (e.key === "Escape") {
                                  handleCancelClick();
                                }
                              }}
                              placeholder="Deskripsi (Opsional)"
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-xs text-red-600 mt-1">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium truncate">
                        {section.title}
                      </h3>
                      {section.description && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          {section.description}
                        </p>
                      )}
                    </div>
                  )}
                  <span className="text-sm text-gray-500 dark:text-zinc-400 flex-shrink-0">
                    {section.activities.length} Activity
                  </span>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {editingSectionId === section.id ? (
                  <>
                    <button
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 transition-colors"
                      aria-label="Save section"
                      onClick={() => handleSaveClick()}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                      aria-label="Cancel editing"
                      onClick={handleCancelClick}
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-zinc-400 transition-colors"
                    aria-label="Edit section"
                    onClick={() => handleEditClick(section)}
                  >
                    <Pencil size={18} />
                  </button>
                )}
                <button
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                  aria-label="Delete section"
                  onClick={() => handleDeleteSectionClick(section)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Activities List */}
            {section.activities.length > 0 ? (
              <div
                data-activities-section={section.id}
                className="space-y-2 mb-4"
              >
                {section.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-2 group"
                  >
                    <button
                      className="activity-drag-handle p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded cursor-grab active:cursor-grabbing text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
                      aria-label="Drag to reorder activity"
                    >
                      <GripVertical size={14} />
                    </button>

                    <div className="flex-1">
                      <ActivityCard
                        key={activity.id}
                        title={activity.title}
                        type={activity.type}
                        contentUrl={activity.contentUrl}
                        description={activity.description}
                        showAction={false}
                        questionCount={activity.type === "QUIZ" ? 0 : undefined}
                        contentId={activity.id}
                        onViewHandlerReady={(handler) => {
                          viewCallbacks.current.set(activity.id, async () => {
                            setLoadingActivityId(activity.id);
                            try {
                              await handler();
                            } finally {
                              setLoadingActivityId(null);
                            }
                          });
                        }}
                        onManageQuestions={activity.type === "QUIZ" ? () => {
                          if (onManageQuizQuestions) {
                            onManageQuizQuestions(section.id, activity.id, {
                              id: activity.id,
                              name: activity.title,
                              type: "QUIZ",
                              description: activity.description,
                              contentUrl: activity.contentUrl,
                              idSection: section.id,
                              sequence: activity.sequence,
                            } as Content);
                          }
                        } : undefined}
                      />
                    </div>

                    {/* Action buttons container - FIXED WIDTH */}
                    <div className="flex items-center gap-1 flex-shrink-0 w-[120px] justify-end">
                      {/* View button - only show if has contentUrl and not QUIZ type */}
                      {activity.contentUrl && activity.type !== "QUIZ" ? (
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-zinc-400 transition-colors"
                          aria-label="View activity"
                          onClick={() => {
                            const handler = viewCallbacks.current.get(activity.id);
                            if (handler) {
                              handler();
                            }
                          }}
                          disabled={loadingActivityId === activity.id}
                          title="Lihat"
                        >
                          {loadingActivityId === activity.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      ) : (
                        <div className="w-10" />
                      )}

                      {/* Edit button */}
                      <button
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                        aria-label="Edit activity"
                        onClick={() =>
                          handleEditActivity(section.id, activity.id)
                        }
                        title="Edit Activity"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Delete button */}
                      <button
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                        aria-label="Delete activity"
                        onClick={() =>
                          handleDeleteActivityClick(section.id, activity)
                        }
                        title="Hapus Activity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 dark:text-zinc-500 mb-4">
                <div className="size-12 mb-2 flex items-center justify-center">
                  <FolderOpen size={36} className="text-gray-400 dark:text-zinc-600" />
                </div>
                <p className="text-sm mb-1 font-medium text-gray-700 dark:text-zinc-300">Belum ada Activity</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 text-center">
                  Klik tombol "Tambah Activity" untuk menambahkan konten
                </p>
              </div>
            )}
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleAddActivity(section.id)}
              leftIcon={<Plus size={18} className="sm:size-5" />}
            >
              Tambah Activity
            </Button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Hapus ${deleteConfirm.type === "section" ? "Section" : "Activity"}?`}
        description={
          deleteConfirm.type === "section"
            ? `Apakah Anda yakin ingin menghapus section "${deleteConfirm.title}"? Semua activity di dalamnya juga akan terhapus. Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus activity "${deleteConfirm.title}"? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeletingSection || isDeleting}
      />

      {/* Sequence Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={sequenceConfirm.isOpen}
        onClose={handleCancelSequence}
        onConfirm={handleConfirmSequence}
        title="Konfirmasi Perubahan Urutan"
        description={sequenceConfirm.description}
        confirmText="Ya, Simpan Perubahan"
        cancelText="Batal"
        variant="info"
        isLoading={isUpdatingSequence || isUpdatingContentsSequence}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Toast
            variant={toastVariant}
            message={toastMessage}
            onClose={() => setShowToast(false)}
            autoDismiss={true}
            duration={toastVariant === "success" ? 2000 : 3000}
          />
        </div>
      )}

      {/* Loading Overlay */}
      {(isSectionsFetching || isUpdatingContentsSequence) && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-lg flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-blue-600" />
            {isUpdatingContentsSequence
              ? "Mengubah urutan activity..."
              : "Memperbarui data..."}
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        .sortable-ghost {
          opacity: 0.4;
          background: #f3f4f6;
        }
        .sortable-drag {
          opacity: 0.8;
          cursor: grabbing !important;
        }
        .sortable-chosen {
          cursor: grabbing !important;
        }
        .sortable-chosen .section-drag-handle,
        .sortable-chosen .activity-drag-handle {
          cursor: grabbing !important;
        }
        @keyframes slide-in-from-bottom-5 {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation-duration: 200ms;
          animation-fill-mode: both;
        }
        .slide-in-from-bottom-5 {
          animation-name: slide-in-from-bottom-5;
        }
        @keyframes slide-in-from-left-5 {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .slide-in-from-left-5 {
          animation-name: slide-in-from-left-5;
        }
      `}</style>

      {/* Fetching Indicator */}
      {isSectionsFetching && (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left-5">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-zinc-700 flex items-center gap-3">
            <Loader2 className="size-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-700 dark:text-zinc-300">Memperbarui data...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 bg-white dark:bg-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="flex items-center gap-3 flex-1">
            <div className="size-8 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-48 animate-pulse" />
              <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded w-32 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-100 dark:bg-zinc-700 rounded w-20 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gray-100 dark:bg-zinc-700 rounded-lg animate-pulse" />
          <div className="w-9 h-9 bg-gray-100 dark:bg-zinc-700 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg"
          >
            <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="flex-1 flex items-center gap-3">
              <div className="size-10 bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-40 animate-pulse" />
                <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded w-24 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-700 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg w-full animate-pulse" />
    </div>
  );
}
