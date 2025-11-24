interface CourseTitleProps {
  title: string;
}

export const CourseTitle = ({ title }: CourseTitleProps) => {
  return (
    <div className="pt-2">
      <h1 className="font-bold text-xl lg:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">
        {title}
      </h1>
    </div>
  );
};
