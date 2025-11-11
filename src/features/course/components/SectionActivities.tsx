"use client";
/**
 * Komponen: SectionActivities (UPDATED WITH EDIT SUPPORT)
 * Tujuan: Manajemen section dan activities dengan drag & drop + EDIT ACTIVITY
 *
 * Fitur Baru:
 * - ✅ Edit activity menggunakan drawer
 * - ✅ Pre-fill form saat edit
 * - ✅ futegrasi dengan ActivityDrawerContent
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
  getContentQueryKey,
  useContents,
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
import z, { ZodError } from "zod";

interface Activity {
  id: string;
  title: string;
  contentUrl?: string;
  type: "PDF" | "VIDEO" | "LINK" | "SCORM";
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
}

// ✅ UPDATE: Tambahkan props untuk drawer dan edit
interface SectionActivitiesProps {
  onAddActivity?: (sectionId: string) => void;
  onEditActivity?: (
    sectionId: string,
    activityId: string,
    activityData: Content,
  ) => void; // ✅ BARU
  groupId?: string;
}

export function SectionActivities({
  onAddActivity,
  onEditActivity,
  groupId,
}: SectionActivitiesProps) {
  const {
    data: sectionsData,
    isPending: isSectionsPending,
    isFetching: isSectionsFetching,
    error: sectionsError,
    refetch: refetchSections,
  } = useSections();
  const {
    data: contentsData,
    isPending: isContentsPending,
    isFetching: isContentsFetching,
    error: contentsError,
    refetch: refetchContents,
  } = useContents();

  const { mutate: createSection, isPending: isCreating } = useCreateSection({
    onSuccess: async () => {
      setShowToast(true);
      setToastMessage("Activity berhasil ditambahkan!");
      setToastVariant("success");

      if (editingSectionId?.startsWith("local-")) {
        setLocalSections((prev) =>
          prev.filter((s) => s.id !== editingSectionId),
        );
      }

      setEditingSectionId(null);
      form.reset();

      await Promise.all([
        queryClient.refetchQueries({ queryKey: getSectionQueryKey() }),
      ]);
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
      await queryClient.refetchQueries({ queryKey: ["contents"] });
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
        await queryClient.refetchQueries({ queryKey: ["sections"] });
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
      await queryClient.refetchQueries({ queryKey: ["sections"] });
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
        console.log(sectionsData);
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
      // setLocalSections([]);
      showToastMessage("success", "Urutan activity berhasil diubah!");
    },
    onError: (error: any) => {
      console.error("❌ Update Contents Sequence Error:", error);
      showToastMessage("warning", "Gagal mengubah urutan activity!");
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
          // CREATE new section
          const createData: CreateSectionInput = {
            idGroup: "b8d1607e-4edf-4f7a-8a0b-0552191bdd71",
            name: value.name,
            description: value.description || "",
            sequence: displayedSections.length,
          };

          // Validate with Zod
          const validatedData = createSectionSchema.parse(createData);
          createSection(validatedData);
        } else {
          // UPDATE existing section
          const updateData: UpdateSectionInput = {
            name: value.name,
            description: value.description || "",
          };

          // Validate with Zod
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

  const fetchError = sectionsError || contentsError;
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

  // ✅ Handler untuk buka confirm dialog delete section
  const handleDeleteSectionClick = (section: Section) => {
    setDeleteConfirm({
      isOpen: true,
      type: "section",
      id: section.id,
      title: section.title,
    });
  };

  // ✅ Handler untuk buka confirm dialog delete activity
  const handleDeleteActivityClick = (sectionId: string, activity: Activity) => {
    setDeleteConfirm({
      isOpen: true,
      type: "activity",
      id: activity.id,
      sectionId: sectionId,
      title: activity.title,
    });
  };

  // ✅ Handler untuk confirm delete
  const handleConfirmDelete = () => {
    if (!deleteConfirm.id) return;

    if (deleteConfirm.type === "section") {
      deleteSection(deleteConfirm.id);
    } else if (deleteConfirm.type === "activity") {
      deleteContent(deleteConfirm.id);
    }

    // Close dialog
    setDeleteConfirm({
      isOpen: false,
      type: null,
      id: null,
      title: "",
    });
  };

  // ✅ Handler untuk cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm({
      isOpen: false,
      type: null,
      id: null,
      title: "",
    });
  };

  const sectionsFromMemo = useMemo<Section[]>(() => {
    if (!sectionsData?.data || !contentsData?.data) return [];

    const sectionsArray = sectionsData.data.filter(Boolean);
    const contentsArray = contentsData.data.filter(Boolean);

    const filteredSections = groupId
      ? sectionsArray.filter((s) => s?.idGroup === groupId)
      : sectionsArray;

    return filteredSections
      .filter((section) => section && section.id)
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      .map((section) => {
        const sectionActivities = contentsArray
          .filter((content) => content && content.idSection === section.id)
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
          .map((content) => ({
            id: content.id,
            title: content.name || "Untitled",
            type: mapContentType(content.type || "DOC"),
            contentUrl: content.contentUrl || "", 
            size: calculateFileSize(content.contentUrl || ""),
            description: content.description || "",
            sequence: content.sequence || 0,
          }));

        return {
          id: section.id,
          title: section.name || "Untitled Section",
          description: section.description || "",
          activities: sectionActivities,
          sequence: section.sequence || 0,
        };
      });
  }, [sectionsData?.data, contentsData?.data, groupId]);

  const displayedSections = useMemo(() => {
    const combined = [...sectionsFromMemo, ...localSections];
    return combined.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }, [sectionsFromMemo, localSections]);

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<
    "info" | "warning" | "success"
  >("success");

  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);
  const activitiesSortableRefs = useRef<Map<string, Sortable>>(new Map());

  function mapContentType(type: string): "PDF" | "VIDEO" | "LINK" | "SCORM" {
    const typeUpper = type.toUpperCase();
    if (
      typeUpper === "PDF" ||
      typeUpper === "VIDEO" ||
      typeUpper === "LINK" ||
      typeUpper === "SCORM"
    ) {
      return typeUpper as "PDF" | "VIDEO" | "LINK" | "SCORM";
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

  useEffect(() => {
    if (
      sectionsContainerRef.current &&
      !sortableInstanceRef.current &&
      displayedSections.length > 0
    ) {
      sortableInstanceRef.current = new Sortable(sectionsContainerRef.current, {
        animation: 150,
        handle: ".section-drag-handle",
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        chosenClass: "sortable-chosen",
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
          const localOnlySections = updated.filter((s) =>
            s.id.startsWith("local-"),
          );

          setLocalSections(localOnlySections);

          const sequenceUpdates = serverSections.map((s) => ({
            id: s.id,
            sequence: s.sequence + 1,
          }));

          if (sequenceUpdates.length > 0) {
            updateSectionsSequence(sequenceUpdates);
          }
        },
      });
    }

    if (sortableInstanceRef.current && displayedSections.length === 0) {
      sortableInstanceRef.current.destroy();
      sortableInstanceRef.current = null;
    }
  }, [displayedSections.length, updateSectionsSequence]);

  useEffect(() => {
    // Cleanup old sortables
    activitiesSortableRefs.current.forEach((sortable, id) => {
      if (!displayedSections.find((s) => s.id === id)) {
        sortable.destroy();
        activitiesSortableRefs.current.delete(id);
      }
    });

    // Create new sortables for each section
    displayedSections.forEach((section) => {
      const container = document.querySelector(
        `[data-activities-section="${section.id}"]`,
      );

      if (container && !activitiesSortableRefs.current.has(section.id)) {
        const sortable = new Sortable(container as HTMLElement, {
          animation: 150,
          handle: ".activity-drag-handle",
          ghostClass: "sortable-ghost",
          dragClass: "sortable-drag",
          group: "activities", // Allow drag between sections
          onEnd: (evt) => {
            const { oldIndex, newIndex, from, to } = evt;

            if (oldIndex === undefined || newIndex === undefined) return;

            const fromSectionId =
              from.getAttribute("data-activities-section") || "";
            const toSectionId =
              to.getAttribute("data-activities-section") || "";

            if (!fromSectionId || !toSectionId || !contentsData?.data) return;

            try {
              if (fromSectionId === toSectionId) {
                // ✅ REORDER within same section
                if (oldIndex === newIndex) return; // No change

                const sectionActivities = contentsData.data
                  .filter((content) => content.idSection === fromSectionId)
                  .sort((a, b) => a.sequence - b.sequence);

                // Reorder activities
                const [movedActivity] = sectionActivities.splice(oldIndex, 1);
                sectionActivities.splice(newIndex, 0, movedActivity);

                // Update sequences - add defensive check for activity.id
                // Return early if activity has no valid ID to prevent drag errors
                const hasValidActivities = sectionActivities.every(
                  (activity) => activity?.id,
                );
                if (!hasValidActivities) {
                  console.warn("⚠️ Cannot reorder activities: missing IDs");
                  return;
                }

                const sequenceUpdates = sectionActivities.map(
                  (activity, idx) => ({
                    id: activity?.id || `temp-${idx}`, // Add fallback for missing ID
                    sequence: idx + 1,
                    idSection: fromSectionId,
                  }),
                );

                console.log(
                  "🔄 Reorder in same section:",
                  sequenceUpdates.length,
                  "updates",
                );
                updateContentsSequence(sequenceUpdates);
              } else {
                // ✅ MOVE to different section
                const fromActivities = contentsData.data
                  .filter((content) => content.idSection === fromSectionId)
                  .sort((a, b) => a.sequence - b.sequence);

                const toActivities = contentsData.data
                  .filter((content) => content.idSection === toSectionId)
                  .sort((a, b) => a.sequence - b.sequence);

                // Remove from source
                const [movedActivity] = fromActivities.splice(oldIndex, 1);
                if (!movedActivity) return;

                // Add to target
                toActivities.splice(newIndex, 0, {
                  ...movedActivity,
                  idSection: toSectionId,
                });

                // Update sequences for both sections
                const fromUpdates = fromActivities.map((activity, idx) => ({
                  id: activity?.id || `temp-from-${idx}`, // Add fallback for missing ID
                  sequence: idx + 1,
                  idSection: fromSectionId,
                }));

                const toUpdates = toActivities.map((activity, idx) => ({
                  id: activity?.id || `temp-to-${idx}`, // Add fallback for missing ID
                  sequence: idx + 1,
                  idSection: toSectionId,
                }));

                // Check for valid activities before proceeding
                const hasValidFromActivities = fromActivities.every(
                  (activity) => activity?.id,
                );
                const hasValidToActivities = toActivities.every(
                  (activity) => activity?.id,
                );

                if (!hasValidFromActivities || !hasValidToActivities) {
                  console.warn(
                    "⚠️ Cannot move activities: some have missing IDs",
                  );
                  return;
                }

                // Combine all updates - filter out any with missing IDs
                const allUpdates = [...fromUpdates, ...toUpdates].filter(
                  (update) => update.id && !update.id.startsWith("temp-"),
                );

                console.log(
                  "🔀 Move to different section:",
                  allUpdates.length,
                  "updates",
                );
                updateContentsSequence(allUpdates);
              }
            } catch (error) {
              console.error("❌ Error handling drag:", error);
            }
          },
        });

        activitiesSortableRefs.current.set(section.id, sortable);
      }
    });
  }, [displayedSections, contentsData?.data, updateContentsSequence]);

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

  // const handleSaveClick = (sectionId: string) => {
  //   if (!editedTitle.trim()) {
  //     showToastMessage("warning", "Judul section tidak boleh kosong!");
  //     return;
  //   }

  //   if (sectionId.startsWith("local-")) {
  //     const newSection = {
  //       idGroup: "6521be0c-9a85-4e2b-8ebb-60efa942635b",
  //       name: editedTitle,
  //       description: editedDescription,
  //       sequence: displayedSections.length,
  //     };

  //     createSection(newSection);
  //     setLocalSections((prev) => prev.filter((s) => s.id !== sectionId));
  //     // showToastMessage("success", "Section baru berhasil disimpan!");
  //   } else {
  //     updateSection({
  //       id: sectionId,
  //       data: {
  //         name: editedTitle,
  //         description: editedDescription,
  //       },
  //     });
  //     // showToastMessage("success", "Perubahan section berhasil disimpan!");
  //   }

  //   setEditingSectionId(null);
  //   setEditedTitle("");
  //   setEditedDescription("");
  // };
  const handleSaveClick = () => {
    form.handleSubmit();
  };

  const handleCancelClick = () => {
    setEditingSectionId(null);
    setEditedTitle("");
    setEditedDescription("");
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!sectionId) return;
    if (confirm("Yakin ingin menghapus section ini?")) {
      deleteSection(sectionId);
    }
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
      setEditedTitle(newSection.title);
      setEditedDescription(newSection.description || "");
    }, 100);
  };

  const handleAddActivity = (sectionId: string) => {
    if (onAddActivity) {
      onAddActivity(sectionId);
    }
  };

  // ✅ BARU: Handler untuk edit activity
  const handleEditActivity = (sectionId: string, activityId: string) => {
    // console.log("Edit activity:", sectionId, activityId);
    if (!contentsData?.data) return;

    // Cari data content berdasarkan activityId
    const activityData = contentsData.data.find(
      (content) => content.id === activityId,
    );

    if (activityData && onEditActivity) {
      onEditActivity(sectionId, activityId, activityData);
    }
  };

  const handleDeleteActivity = (sectionId: string, activityId: string) => {
    if (!activityId) return;
    if (confirm("Yakin ingin menghapus activity ini?")) {
      deleteContent(activityId);
    }
  };

  // if (isSectionsPending || isContentsPending) {
  //   return (
  //     <div className="w-full flex items-center justify-center py-12">
  //       <div className="flex flex-col items-center gap-3">
  //         <Loader2 className="size-8 animate-spin text-blue-600" />
  //         <p className="text-sm text-gray-600">Memuat data sections dan activities...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (isSectionsPending || isContentsPending) {
    return <SectionSkeleton />;
  }

  if (fetchError) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
          <X size={32} className="text-red-600" />
        </div>
        <p className="text-lg font-semibold text-red-600">Gagal memuat data!</p>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Terjadi kesalahan saat mengambil data sections dan activities. Coba
          lagi.
        </p>
        <Button
          onClick={() => {
            refetchSections();
            refetchContents();
          }}
          variant="outline"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (displayedSections.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
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

        <div className="border border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-gray-500">
          <div className="size-16 mb-4 flex items-center justify-center">
            <FolderOpen size={48} className="text-gray-400" />
          </div>
          <p className="text-base mb-2 font-medium">Belum ada Section</p>
          <p className="text-sm text-gray-400 text-center max-w-md">
            Mulai dengan menambahkan section baru untuk mengorganisir konten
            course Anda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
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

      <div ref={sectionsContainerRef} className="space-y-4">
        {displayedSections.map((section, index) => (
          <div
            key={index}
            data-id={section.id}
            className={`border rounded-xl p-4 bg-white transition-shadow hover:shadow-sm ${section.id.startsWith("local-") ? "border-blue-300 border-dashed" : "border-gray-300"}`}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  className="section-drag-handle p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label="Drag to reorder section"
                >
                  <GripVertical size={20} />
                </button>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 flex-shrink-0">
                    {index + 1}
                  </span>

                  {editingSectionId === section.id ? (
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* ✅ TANSTACK FORM FIELD - NAME */}
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

                      {/* ✅ TANSTACK FORM FIELD - DESCRIPTION */}
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
                        <p className="text-xs text-gray-500 truncate">
                          {section.description}
                        </p>
                      )}
                    </div>
                  )}

                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {section.activities.length} Activity
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {editingSectionId === section.id ? (
                  <>
                    <button
                      className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                      aria-label="Save section"
                      onClick={() => handleSaveClick(section.id)}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                      aria-label="Cancel editing"
                      onClick={handleCancelClick}
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                    aria-label="Edit section"
                    onClick={() => handleEditClick(section)}
                  >
                    <Pencil size={18} />
                  </button>
                )}
                <button
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
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
                      className="activity-drag-handle p-2 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
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
                        showAction={true}
                      />
                    </div>

                    {/* ✅ BARU: Tombol Edit Activity */}
                    <button
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                      aria-label="Edit activity"
                      onClick={() =>
                        handleEditActivity(section.id, activity.id)
                      }
                      title="Edit Activity"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                      aria-label="Delete activity"
                      onClick={() =>
                        handleDeleteActivityClick(section.id, activity)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 mb-4">
                <div className="size-12 mb-2 flex items-center justify-center">
                  <FolderOpen size={36} className="text-gray-400" />
                </div>
                <p className="text-sm mb-1 font-medium">Belum ada Activity</p>
                <p className="text-xs text-gray-400 text-center">
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

      {(isSectionsFetching ||
        isContentsFetching ||
        isUpdatingContentsSequence) && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-blue-600" />
            {isUpdatingContentsSequence
              ? "Mengubah urutan activity..."
              : "Memperbarui data..."}
          </div>
        </div>
      )}

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

      {(isSectionsFetching || isContentsFetching) && (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left-5">
          <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-200 flex items-center gap-3">
            <Loader2 className="size-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-700">Memperbarui data...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-3 flex-1">
            <div className="size-8 bg-blue-100 rounded-full animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
          <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 flex items-center gap-3">
              <div className="size-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="h-10 bg-gray-100 rounded-lg w-full animate-pulse" />
    </div>
  );
}
