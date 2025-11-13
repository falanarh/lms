import { CourseInfoCards } from "../CourseInfoCards";
import { CourseDescription } from "../CourseDescription";

interface CourseInformationTabProps {
  method: string;
  syllabusFile: string;
  totalJP: number;
  quota: number;
  description: string;
}

export const CourseInformationTab = ({
  method,
  syllabusFile,
  totalJP,
  quota,
  description,
}: CourseInformationTabProps) => {
  return (
    <div className="space-y-6">
      <CourseInfoCards
        method={method}
        syllabusFile={syllabusFile}
        totalJP={totalJP}
        quota={quota}
      />
      <CourseDescription description={description} />
    </div>
  );
};
