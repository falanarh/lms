import { Breadcrumb } from "@/components/ui/Breadcrumb/Breadcrumb";

interface CourseHeaderProps {
  title: string;
  breadcrumbItems: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
}

export const CourseHeader = ({ title, breadcrumbItems }: CourseHeaderProps) => {
  return (
    <div className="py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="pt-2 hidden md:block">
        <Breadcrumb separator="chevron" items={breadcrumbItems} />
      </div>

      <div className="pt-2 block md:hidden">
        <Breadcrumb separator="slash" items={breadcrumbItems} size="sm" />
      </div>

      <div className="space-y-2">
        <h1 className="font-bold text-3xl lg:text-4xl text-zinc-900 tracking-tight">
          {title}
        </h1>
      </div>
    </div>
  );
};
