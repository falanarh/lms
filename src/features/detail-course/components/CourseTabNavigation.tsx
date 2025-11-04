import { Info, List, MessageSquare, Star, ChevronDown } from "lucide-react";

interface CourseTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  {
    key: "information",
    label: "Information",
    icon: <Info className="w-4 h-4" />,
  },
  {
    key: "course_contents",
    label: "Course Contents",
    icon: <List className="w-4 h-4" />,
  },
  {
    key: "discussion_forum",
    label: "Discussion Forum",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    key: "ratings_reviews",
    label: "Ratings & Reviews",
    icon: <Star className="w-4 h-4" />,
  },
];

export const CourseTabNavigation = ({
  activeTab,
  onTabChange,
}: CourseTabNavigationProps) => {
  return (
    <>
      {/* Mobile: Dropdown Select */}
      <div className="md:hidden">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => onTabChange(e.target.value)}
            className="w-full h-[48px] px-4 pr-10 bg-white border-2 border-gray-200 rounded-xl appearance-none text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="information">Information</option>
            <option value="course_contents">Course Contents</option>
            <option value="discussion_forum">Discussion Forum</option>
            <option value="ratings_reviews">Ratings & Reviews</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Desktop: Tabs */}
      <div className="hidden md:block bg-[#ececf0] rounded-[14px] w-full">
        <div className="flex flex-row items-center size-full">
          <div className="box-border flex items-center px-[3px] py-[3px] size-full gap-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`
                    basis-0 grow h-[38px] relative rounded-[14px] shrink-0 
                    transition-colors duration-200
                    ${isActive ? "bg-white" : "bg-transparent hover:bg-white/50"}
                  `}
                >
                  <div
                    aria-hidden="true"
                    className="absolute border border-transparent inset-0 pointer-events-none rounded-[14px]"
                  />
                  <div className="h-[38px] relative w-full flex items-center justify-center gap-2">
                    <span
                      className="flex-shrink-0 [&>svg]:size-4 [&>svg]:stroke-2"
                      style={{
                        color: isActive ? "#0A0A0A" : "#717182",
                      }}
                    >
                      {tab.icon}
                    </span>
                    <span
                      className={`
                        font-medium leading-5 text-sm text-nowrap whitespace-pre tracking-tight
                        ${isActive ? "text-neutral-950" : "text-[#717182]"}
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
