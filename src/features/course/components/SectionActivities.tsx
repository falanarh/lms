"use client";
/**
 * Komponen: SectionActivities
 * Tujuan: Manajemen section dan activities dalam course dengan drag & drop.
 *
 * Fitur:
 * - Drag & drop untuk reorder section dan activities
 * - CRUD operations untuk section dan activities
 * - Toast notifications untuk feedback
 * - Responsive design
 * - Keyboard shortcuts (Enter/Escape saat edit)
 * - Integration dengan API menggunakan TanStack Query
 */

import { Pencil, Plus, Trash2, Check, X, FolderOpen, GripVertical, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Sortable from "sortablejs";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast/Toast";
import { Button } from "@/components/ui/Button";
import ActivityCard from "./ActivityCard";
import { useSections } from "@/hooks/useSections";
import { useContents } from "@/hooks/useContent";

interface Activity {
  id: string;
  title: string;
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

interface SectionActivitiesProps {
  onAddActivity?: (sectionId: string) => void;
  groupId?: string; // Optional: untuk filter berdasarkan group
}

export function SectionActivities({ onAddActivity, groupId }: SectionActivitiesProps) {
  const { data: sectionsData, isPending: isSectionsPending, isFetching: isSectionsFetching } = useSections();
  const { data: contentsData, isPending: isContentsPending, isFetching: isContentsFetching } = useContents();

  // Transform API data ke format Section yang digunakan komponen
  const sections = useMemo<Section[]>(() => {
    if (!sectionsData?.data || !contentsData?.data) return [];

    // Convert object to array dan filter berdasarkan groupId jika ada
    const sectionsArray = Object.values(sectionsData.data).filter(Boolean);
    const contentsArray = Object.values(contentsData.data).filter(Boolean);

    const filteredSections = groupId 
      ? sectionsArray.filter(s => s?.id_group === groupId)
      : sectionsArray;

    return filteredSections
      .filter(section => section && section.id_section) // Filter out null/undefined
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      .map(section => {
        // Get activities untuk section ini
        const sectionActivities = contentsArray
          .filter(content => content && content.id_section === section.id_section)
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
          .map(content => ({
            id: content.id_content,
            title: content.name || 'Untitled',
            type: mapContentType(content.type || 'DOC'),
            size: calculateFileSize(content.content_url || ''),
            description: content.description || '',
            sequence: content.sequence || 0,
          }));

        return {
          id: section.id_section,
          title: section.name || 'Untitled Section',
          description: section.description || '',
          activities: sectionActivities,
          sequence: section.sequence || 0,
        };
      });
  }, [sectionsData, contentsData, groupId]);

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"info" | "warning" | "success">("success");
  
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);
  const activitiesSortableRefs = useRef<Map<string, Sortable>>(new Map());

  // Helper function untuk mapping tipe content
  function mapContentType(type: string): "PDF" | "VIDEO" | "LINK" | "SCORM" {
    const typeUpper = type.toUpperCase();
    if (typeUpper === "PDF" || typeUpper === "VIDEO" || typeUpper === "LINK" || typeUpper === "SCORM") {
      return typeUpper as "PDF" | "VIDEO" | "LINK" | "SCORM";
    }
    return "PDF"; // default fallback
  }

  // Helper function untuk calculate file size (simplified)
  function calculateFileSize(url: string): string {
    // Ini adalah placeholder - seharusnya didapat dari metadata file
    const ext = url.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return "~2 MB";
    if (ext === 'mp4' || ext === 'avi') return "~150 MB";
    if (ext === 'zip') return "~5 MB";
    return "Unknown";
  }

  // Initialize Sortable for Sections
  useEffect(() => {
    if (sectionsContainerRef.current && !sortableInstanceRef.current && sections.length > 0) {
      sortableInstanceRef.current = new Sortable(sectionsContainerRef.current, {
        animation: 150,
        handle: ".section-drag-handle",
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        chosenClass: "sortable-chosen",
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          
          if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            // TODO: Implement API call untuk update sequence
            showToastMessage("success", "Urutan section berhasil diubah!");
          }
        },
      });
    }

    return () => {
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
      }
    };
  }, [sections.length]);

  // Initialize Sortable for Activities in each section
  useEffect(() => {
    sections.forEach((section) => {
      const container = document.querySelector(`[data-activities-section="${section.id}"]`);
      if (container && !activitiesSortableRefs.current.has(section.id)) {
        const sortable = new Sortable(container as HTMLElement, {
          animation: 150,
          handle: ".activity-drag-handle",
          ghostClass: "sortable-ghost",
          dragClass: "sortable-drag",
          group: "activities",
          onEnd: (evt) => {
            const { oldIndex, newIndex, from, to } = evt;
            const fromSectionId = from.getAttribute("data-activities-section") || "";
            const toSectionId = to.getAttribute("data-activities-section") || "";

            if (oldIndex !== undefined && newIndex !== undefined) {
              // TODO: Implement API call untuk update sequence & section
              if (fromSectionId === toSectionId) {
                showToastMessage("success", "Urutan activity berhasil diubah!");
              } else {
                showToastMessage("success", "Activity berhasil dipindahkan ke section lain!");
              }
            }
          },
        });
        activitiesSortableRefs.current.set(section.id, sortable);
      }
    });

    return () => {
      activitiesSortableRefs.current.forEach((sortable) => sortable.destroy());
      activitiesSortableRefs.current.clear();
    };
  }, [sections.length]);

  const showToastMessage = (variant: "info" | "warning" | "success", message: string) => {
    setToastVariant(variant);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), variant === "success" ? 2000 : 3000);
  };

  const handleEditClick = (section: Section) => {
    setEditingSectionId(section.id);
    setEditedTitle(section.title);
  };

  const handleSaveClick = (sectionId: string) => {
    if (!editedTitle.trim()) {
      showToastMessage("warning", "Judul section tidak boleh kosong!");
      return;
    }

    // TODO: Implement API call untuk update section
    setEditingSectionId(null);
    setEditedTitle("");
    showToastMessage("success", "Section berhasil diperbarui!");
  };

  const handleCancelClick = () => {
    setEditingSectionId(null);
    setEditedTitle("");
  };

  const handleDeleteSection = (sectionId: string) => {
    // TODO: Implement API call untuk delete section
    showToastMessage("info", "Section berhasil dihapus!");
  };

  const handleAddSection = () => {
    // TODO: Implement API call untuk create section
    showToastMessage("success", "Section baru berhasil ditambahkan!");
  };

  const handleAddActivity = (sectionId: string) => {
    if (onAddActivity) {
      onAddActivity(sectionId);
    }
  };

  const handleDeleteActivity = (sectionId: string, activityId: string) => {
    // TODO: Implement API call untuk delete activity
    showToastMessage("info", "Activity berhasil dihapus!");
  };

  // Loading state
  if (isSectionsPending || isContentsPending) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Memuat data sections dan activities...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (sections.length === 0) {
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
            Mulai dengan menambahkan section baru untuk mengorganisir konten course Anda
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

      {/* Sections Container - Sortable */}
      <div ref={sectionsContainerRef} className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={section.id}
            data-id={section.id}
            className="border border-gray-300 rounded-xl p-4 bg-white transition-shadow hover:shadow-sm"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Drag Handle */}
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
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-base font-medium"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveClick(section.id);
                        else if (e.key === "Escape") handleCancelClick();
                      }}
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium truncate">{section.title}</h3>
                      {section.description && (
                        <p className="text-xs text-gray-500 truncate">{section.description}</p>
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
                  onClick={() => handleDeleteSection(section.id)}
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
                      className="activity-drag-handle p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Drag to reorder activity"
                    >
                      <GripVertical size={16} />
                    </button>
                    
                    <div className="flex-1">
                      <ActivityCard
                        title={activity.title}
                        type={"PDF"}
                        size={"2 MB"}
                        description={activity.description}
                      />
                    </div>

                    <button
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete activity"
                      onClick={() => handleDeleteActivity(section.id, activity.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty Activity State */
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

            {/* Add Activity Button */}
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

      {/* Loading Overlay saat fetching */}
      {(isSectionsFetching || isContentsFetching) && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-700">Memperbarui data...</span>
          </div>
        </div>
      )}

      {/* Custom Styles for Sortable */}
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
      `}</style>
    </div>
  );
}