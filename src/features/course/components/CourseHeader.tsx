interface CourseHeaderProps {
  title: string;
  subtitle: string;
}

export function CourseHeader({ title, subtitle }: CourseHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="font-bold text-3xl lg:text-4xl text-zinc-900 dark:text-zinc-100 tracking-tight">
        {title}
      </h1>
      <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}