interface CourseHeaderProps {
  title: string;
  subtitle: string;
}

export function CourseHeader({ title, subtitle }: CourseHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="font-bold text-3xl lg:text-4xl text-zinc-900 tracking-tight">
        {title}
      </h1>
      <p className="text-base text-zinc-600 leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}