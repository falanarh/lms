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
 */

import { Pencil, Plus, Trash2, Check, X, FolderOpen, GripVertical } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Sortable from "sortablejs";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast/Toast";
import { Button } from "@/components/ui/Button";
import ActivityCard from "./ActivityCard";

interface Activity {
  id: number;
  title: string;
  type: "pdf" | "video" | "doc" | "ppt";
  size: string;
  description?: string;
}

interface Section {
  id: number;
  title: string;
  activities: Activity[];
}

interface SectionActivitiesProps {
  onAddActivity?: (sectionId: number) => void;
}

export function SectionActivities({ onAddActivity }: SectionActivitiesProps) {
  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      title: "Section 1: Pengantar",
      activities: [
        { id: 1, title: "Slide Pengenalan", type: "pdf", size: "2.4 MB" },
        { id: 2, title: "Video Tutorial", type: "video", size: "145 MB", description: "Durasi: 45 menit" },
      ],
    },
    {
      id: 2,
      title: "Section 2: Praktik",
      activities: [
        { id: 3, title: "Handout Materi", type: "doc", size: "1.2 MB" },
      ],
    },
    {
      id: 3,
      title: "Section 3: Quiz",
      activities: [],
    },
  ]);
  
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"info" | "warning" | "success">("success");
  
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);
  const activitiesSortableRefs = useRef<Map<number, Sortable>>(new Map());

  // Initialize Sortable for Sections
  useEffect(() => {
    if (sectionsContainerRef.current && !sortableInstanceRef.current) {
      sortableInstanceRef.current = new Sortable(sectionsContainerRef.current, {
        animation: 150,
        handle: ".section-drag-handle",
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        chosenClass: "sortable-chosen",
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          
          if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            setSections((prevSections) => {
              const newSections = [...prevSections];
              const [movedSection] = newSections.splice(oldIndex, 1);
              newSections.splice(newIndex, 0, movedSection);
              return newSections;
            });

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
  }, []);

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
            const fromSectionId = parseInt(from.getAttribute("data-activities-section") || "0");
            const toSectionId = parseInt(to.getAttribute("data-activities-section") || "0");

            if (oldIndex !== undefined && newIndex !== undefined) {
              setSections((prevSections) => {
                const newSections = [...prevSections];
                const fromSection = newSections.find((s) => s.id === fromSectionId);
                const toSection = newSections.find((s) => s.id === toSectionId);

                if (fromSection && toSection) {
                  const [movedActivity] = fromSection.activities.splice(oldIndex, 1);
                  toSection.activities.splice(newIndex, 0, movedActivity);
                }

                return newSections;
              });

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

  const handleSaveClick = (sectionId: number) => {
    if (!editedTitle.trim()) {
      showToastMessage("warning", "Judul section tidak boleh kosong!");
      return;
    }

    setSections((prevSections) =>
      prevSections.map((sec) =>
        sec.id === sectionId ? { ...sec, title: editedTitle } : sec
      )
    );
    setEditingSectionId(null);
    setEditedTitle("");
    showToastMessage("success", "Section berhasil diperbarui!");
  };

  const handleCancelClick = () => {
    setEditingSectionId(null);
    setEditedTitle("");
  };

  const handleDeleteSection = (sectionId: number) => {
    setSections((prevSections) => prevSections.filter((sec) => sec.id !== sectionId));
    showToastMessage("info", "Section berhasil dihapus!");
  };

  // const handleAddSection = () => {
  //   const newSectionId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
  //   const newSection: Section = {
  //     id: newSectionId,
  //     title: `Section ${newSectionId}`,
  //     activities: [],
  //   };
  //   setSections([...sections, newSection]);
  //   showToastMessage("success", `Section ${newSectionId} berhasil ditambahkan!`);
  //   const element = document.querySelector(`[data-id="${newSectionId}"]`);
  //   if (element) {
  //     element.scrollIntoView({ behavior: "smooth" });
  //   }
  // };

  const handleAddSection = () => {
  const newSectionId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
  const newSection: Section = {
    id: newSectionId,
    title: `Section ${newSectionId}`,
    activities: [],
  };

  setSections(prev => [...prev, newSection]);
  showToastMessage("success", `Section ${newSectionId} berhasil ditambahkan!`);

  // Wait a bit for React to render new section
  setTimeout(() => {
    const element = document.querySelector(`[data-id="${newSectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 200);
};


  const handleAddActivity = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const activityTypes: Array<"pdf" | "video" | "doc" | "ppt"> = ["pdf", "video", "doc", "ppt"];
    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    const newActivityId = Math.max(0, ...sections.flatMap(s => s.activities.map(a => a.id))) + 1;
    const newActivity: Activity = {
      id: newActivityId,
      title: `Activity ${section.activities.length + 1}`,
      type: randomType,
      size: randomType === "video" ? "120 MB" : "2.5 MB",
      description: randomType === "video" ? "Durasi: 30 menit" : undefined,
    };

    setSections((prevSections) =>
      prevSections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, activities: [...sec.activities, newActivity] }
          : sec
      )
    );
    showToastMessage("success", "Activity berhasil ditambahkan!");
    
    if (onAddActivity) {
      onAddActivity(sectionId);
    }
  };

  const handleDeleteActivity = (sectionId: number, activityId: number) => {
    setSections((prevSections) =>
      prevSections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, activities: sec.activities.filter((act) => act.id !== activityId) }
          : sec
      )
    );
    showToastMessage("info", "Activity berhasil dihapus!");
  };

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
                    <h3 className="text-base font-medium truncate">{section.title}</h3>
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
                        type={activity.type}
                        size={activity.size}
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

            <Button className="w-full py-2 px-4 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
               variant="outline" onClick={() => handleAddActivity(section.id)} leftIcon={<Plus size={18} className="sm:size-5" />}
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