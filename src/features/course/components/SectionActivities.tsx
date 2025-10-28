"use client";

import { Pencil, Plus, Trash2, Check, X, FolderOpen, GripVertical } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Sortable from "sortablejs";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast/Toast";

interface Section {
  id: number;
  title: string;
  activityCount: number;
}

interface SectionActivitiesProps {
  onAddActivity: () => void;
}

export function SectionActivities({ onAddActivity }: SectionActivitiesProps) {
  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      title: "Section 1",
      activityCount: 0,
    },
  ]);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"info" | "warning" | "success">("success");
  
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);

  // Initialize SortableJS
  useEffect(() => {
    if (sectionsContainerRef.current && !sortableInstanceRef.current) {
      sortableInstanceRef.current = new Sortable(sectionsContainerRef.current, {
        animation: 150,
        handle: ".drag-handle",
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

            setToastVariant("success");
            setToastMessage("Urutan section berhasil diubah!");
            setShowToast(true);
            setTimeout(() => {
              setShowToast(false);
            }, 2000);
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

  const handleEditClick = (section: Section) => {
    setEditingSectionId(section.id);
    setEditedTitle(section.title);
  };

  const handleSaveClick = (sectionId: number) => {
    if (!editedTitle.trim()) {
      setToastVariant("warning");
      setToastMessage("Judul section tidak boleh kosong!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }

    setSections((prevSections) =>
      prevSections.map((sec) =>
        sec.id === sectionId ? { ...sec, title: editedTitle } : sec
      )
    );
    setEditingSectionId(null);
    setEditedTitle("");

    setToastVariant("success");
    setToastMessage("Section berhasil diperbarui!");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleCancelClick = () => {
    setEditingSectionId(null);
    setEditedTitle("");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleDeleteSection = (sectionId: number) => {
    setSections((prevSections) => prevSections.filter((sec) => sec.id !== sectionId));
    
    setToastVariant("info");
    setToastMessage("Section berhasil dihapus!");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleAddSection = () => {
    const newSectionId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    const newSection: Section = {
      id: newSectionId,
      title: `Section ${newSectionId}`,
      activityCount: 0,
    };
    setSections([...sections, newSection]);
    
    setToastVariant("success");
    setToastMessage(`Section ${newSectionId} berhasil ditambahkan!`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Struktur Course - Section & Activity</h2>
        <button
          onClick={handleAddSection}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Section Baru
        </button>
      </div>
      
      {/* Sections Container - Sortable */}
      <div ref={sectionsContainerRef}>
        {sections.map((section, index) => (
          <div 
            key={section.id} 
            data-id={section.id}
            className="mb-4 border rounded-xl p-4 bg-white transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Drag Handle */}
                <button
                  className="drag-handle p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label="Drag to reorder"
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
                      onChange={handleTitleChange}
                      className="text-base font-medium"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveClick(section.id);
                        } else if (e.key === 'Escape') {
                          handleCancelClick();
                        }
                      }}
                    />
                  ) : (
                    <h3 className="text-base font-medium truncate">{section.title}</h3>
                  )}
                  <span className="text-sm text-gray-500 flex-shrink-0">{section.activityCount} Activity</span>
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

            {/* Empty Activity State */}
            <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
              <div className="size-12 mb-2 flex items-center justify-center">
                <FolderOpen size={36} className="text-gray-400" />
              </div>
              <p className="text-sm mb-1 font-medium">Belum ada Activity</p>
              <p className="text-xs text-gray-400">Klik tombol "Tambah Activity" untuk menambahkan konten</p>
            </div>

            {/* Add Activity Button */}
            <button 
              className="mt-4 w-full py-2 px-4 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors" 
              onClick={onAddActivity}
            >
              <Plus size={16} />
              Tambah Activity
            </button>
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
        
        .sortable-chosen .drag-handle {
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