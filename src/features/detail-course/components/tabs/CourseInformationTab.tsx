import { CourseInfoCards } from "../CourseInfoCards";
import { CourseDescription } from "../CourseDescription";

interface CourseInformationTabProps {
  method: string;
  syllabusFile: string;
  zoomLink: string;
  quota: number;
  description: string;
}

export const CourseInformationTab = ({
  method,
  syllabusFile,
  zoomLink,
  quota,
  description,
}: CourseInformationTabProps) => {
  return (
    <div className="space-y-6">
      <CourseInfoCards
        method={method}
        syllabusFile={syllabusFile}
        zoomLink={zoomLink}
        quota={quota}
      />
      <CourseDescription description={description} />
    </div>
  );
};
