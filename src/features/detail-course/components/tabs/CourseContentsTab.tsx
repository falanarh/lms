import { CourseContentsTab as UnifiedCourseContentsTab } from "@/features/my-course/components/CourseContentsTab";
import { Section } from "@/api/sections";

interface CourseContentsTabProps {
  sections: Section[];
  expandedSections: string[];
  onToggleSection: (sectionId: string) => void;
}

export const CourseContentsTab = ({
  sections,
  expandedSections,
  onToggleSection,
}: CourseContentsTabProps) => {
  return (
    <UnifiedCourseContentsTab
      sections={sections}
      expandedSections={expandedSections}
      onToggleSection={onToggleSection}
      mode="preview"
    />
  );
};
