import { Grid3X3, LayoutGrid, List } from "lucide-react";

export interface EnrolledCourse {
  id: string;
  idTeacher: string;
  rating: number;
  totalUserRating: number;
  enrolledAt: string;
  lastAccessedAt: string;
  progress: {
    completedLessons: number;
    totalLessons: number;
    completedActivities: number;
    totalActivities: number;
    percentage: number;
  };
  certificate: {
    isIssued: boolean;
    issuedAt?: string;
    downloadUrl?: string;
  };
  _count: {
    listActivity: number;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    typeCourse: string;
    description?: {
      category: string;
      description: string;
      method: string;
      silabus: string;
      totalJp: number;
      quota: number;
    };
  };
}

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

export const CATEGORIES = [
  "All Categories",
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
  "Photography",
  "Music",
  "Language",
  "Health & Fitness",
];

export const SORT_OPTIONS = [
  { value: "last-accessed-desc", label: "Last Accessed" },
  { value: "progress-desc", label: "Progress (High to Low)" },
  { value: "progress-asc", label: "Progress (Low to High)" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "enrolled-desc", label: "Recently Enrolled" },
  { value: "rating-desc", label: "Highest Rated" },
];

export const PROGRESS_FILTERS = [
  { value: "all", label: "All Progress" },
  { value: "not-started", label: "Not Started (0%)" },
  { value: "in-progress", label: "In Progress (1-99%)" },
  { value: "completed", label: "Completed (100%)" },
];