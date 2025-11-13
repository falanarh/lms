import { Breadcrumb } from "@/components/ui/Breadcrumb/Breadcrumb";

interface CourseBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
}

export const CourseBreadcrumb = ({ items }: CourseBreadcrumbProps) => {
  return (
    <div className="pt-6 pb-3">
      <div className="pt-2 hidden md:block">
        <Breadcrumb separator="chevron" items={items} />
      </div>
      <div className="pt-2 block md:hidden [&_ol]:flex-wrap [&_li]:whitespace-nowrap">
        <Breadcrumb separator="slash" items={items} size="sm" />
      </div>
    </div>
  );
};
