import { Info, List, MessageSquare, Star, ChevronDown, FileText, Sparkles } from "lucide-react";
import { CourseTabType, TabConfig } from "../types/tab";

interface CourseTabNavigationProps {
  activeTab: CourseTabType;
  onTabChange: (tab: CourseTabType) => void;
  hiddenTabs?: CourseTabType[]; 
}

const tabs: TabConfig[] = [
  {
    key: "information" as CourseTabType,
    label: "Information",
    icon: <Info className="w-4 h-4" />,
  },
  {
    key: "course_contents" as CourseTabType,
    label: "Course Contents",
    icon: <List className="w-4 h-4" />,
  },
  {
    key: "schedule_attendance" as CourseTabType,
    label: "Jadwal & Presensi",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    key: "summary" as CourseTabType,
    label: "Summary",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    key: "discussion_forum" as CourseTabType,
    label: "Discussion Forum",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    key: "ratings_reviews" as CourseTabType,
    label: "Ratings & Reviews",
    icon: <Star className="w-4 h-4" />,
  },
];

export const CourseTabNavigation = ({
  activeTab,
  onTabChange,
  hiddenTabs = [],
}: CourseTabNavigationProps) => {
  // Filter tabs berdasarkan hiddenTabs
  const visibleTabs = tabs.filter(tab => !hiddenTabs.includes(tab.key));

  return (
    <>
      <div className="md:hidden">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => onTabChange(e.target.value as CourseTabType)}
            className="w-full h-[48px] px-4 pr-10 bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl appearance-none text-sm font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            {visibleTabs.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500 pointer-events-none" />
        </div>
      </div>

      <div className="hidden md:block bg-[#ececf0] dark:bg-zinc-700/50 rounded-[14px] w-full">
        <div className="flex flex-row items-center size-full">
          <div className="box-border flex items-center px-[3px] py-[3px] size-full gap-0">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.key;

              const iconEl = tab.key === "summary"
                ? (
                    <div
                      className={`w-5 h-5 rounded-md bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 ${isActive ? "ring-2 ring-offset-1 ring-pink-300/60" : ""} animate-pulse flex items-center justify-center shadow-sm`}
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )
                : tab.icon;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`
                    basis-0 grow h-[38px] relative rounded-[14px] shrink-0
                    transition-colors duration-200
                    ${isActive ? "bg-white dark:bg-zinc-800" : "bg-transparent hover:bg-white/50 dark:hover:bg-zinc-600/30"}
                  `}
                >
                  <div
                    aria-hidden="true"
                    className="absolute border border-transparent inset-0 pointer-events-none rounded-[14px]"
                  />
                  <div className="h-[38px] relative w-full flex items-center justify-center gap-2">
                    <span
                      className={`flex-shrink-0 ${
                        isActive ? "text-zinc-900 dark:text-zinc-100" : "text-[#717182] dark:text-zinc-400"
                      }`}
                    >
                      {iconEl}
                    </span>
                    <span
                      className={`
                        font-medium leading-5 text-sm text-nowrap whitespace-pre tracking-tight
                        ${isActive ? "text-neutral-950 dark:text-zinc-100" : "text-[#717182] dark:text-zinc-400"}
                      `}
                    >
                      {tab.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};