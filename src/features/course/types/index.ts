import { Grid3X3, LayoutGrid, List } from "lucide-react";
import { CourseApiItem } from "@/api/course";

export interface Course extends CourseApiItem {}

export type ViewModeValue = "grid-4" | "grid-2" | "list";

export interface ViewMode {
  value: ViewModeValue;
  icon: React.ComponentType<{ className?: string }>;
  gridClass: string;
}

export const VIEW_MODES: ViewMode[] = [
  {
    value: "grid-4",
    icon: Grid3X3,
    gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  },
  {
    value: "grid-2",
    icon: LayoutGrid,
    gridClass: "grid-cols-1 md:grid-cols-2",
  },
  {
    value: "list",
    icon: List,
    gridClass: "grid-cols-1",
  },
];
