import { BookOpen } from "lucide-react";
import { CourseSectionItem } from "./CourseSectionItem";

interface Activity {
  id: string;
  type: string;
  name: string;
  restrictAccess: boolean;
}

interface Section {
  id: string;
  name: string;
  contents: Activity[];
}

interface CourseContentsTabProps {
  sections: Section[];
  isEnrolled: boolean;
  expandedSections: string[];
  onToggleSection: (sectionId: string) => void;
}

export const CourseContentsTab = ({
  sections,
  isEnrolled,
  expandedSections,
  onToggleSection,
}: CourseContentsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Curriculum Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Course Curriculum
          </h2>
        </div>
        <p className="text-sm text-gray-600">{sections.length} sections</p>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <CourseSectionItem
            key={section.id}
            section={section}
            index={index}
            isExpanded={expandedSections.includes(section.id)}
            isEnrolled={isEnrolled}
            onToggle={onToggleSection}
          />
        ))}
      </div>
    </div>
  );
};
