"use client";

import { BookOpen, X } from "lucide-react";
import { CourseSectionItem } from "./CourseSectionItem";
import { Section } from "@/api/sections";
import { Content } from "@/api/contents";

interface CourseContentsSidebarProps {
  sections: Section[];
  activities: Record<string, Content[]>;
  expandedSections: string[];
  onToggleSection: (sectionId: string) => void;
  selectedContentId?: string;
  onSelectContent: (content: Content) => void;
  onClose: () => void;
}

export const CourseContentsSidebar = ({
  sections,
  activities,
  expandedSections,
  onToggleSection,
  selectedContentId,
  onSelectContent,
  onClose,
}: CourseContentsSidebarProps) => {
  // Calculate total activities
  const totalActivities = Object.values(activities).reduce(
    (sum, contents) => sum + contents.length,
    0
  );

  return (
    <>
      {/* Backdrop for Mobile */}
      <div 
        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        onClick={onClose}
      />

      {/* Fixed Sidebar */}
      <div className="fixed right-0 top-16 w-full lg:w-[350px] h-[calc(100vh-4rem)] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
        {/* Top Header - Course Content + Close Button */}
        <div className="flex-shrink-0 h-14 border-b border-gray-200 px-4 flex items-center justify-between bg-white">
          <h3 className="font-semibold text-base text-gray-900">Course Content</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Scrollable Content List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-3 space-y-2">
            {/* Curriculum Info Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 px-3 py-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Course Curriculum</h4>
                  <p className="text-xs text-gray-600">
                    {sections.length} sections
                  </p>
                </div>
              </div>
            </div>

            {/* Sections List */}
            {sections.map((section, index) => (
              <CourseSectionItem
                key={section.id}
                section={section}
                index={index}
                isExpanded={expandedSections.includes(section.id)}
                onToggle={onToggleSection}
                contents={activities[section.id] || []}
                selectedContentId={selectedContentId}
                onSelectContent={onSelectContent}
                variant="sidebar"
              />
            ))}
          </div>
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="flex-shrink-0 h-16 border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="font-medium">Your Progress</span>
            <span className="font-semibold">0/{totalActivities}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
