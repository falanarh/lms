"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CourseBreadcrumb,
  CourseThumbnail,
  CourseTitle,
  CourseInfoCard,
  CourseTabNavigation,
  CourseInformationTab,
  CourseContentsTab,
  DiscussionForumTab,
  RatingsReviewsTab,
  PageContainer,
  DetailCourseSkeleton,
  ScheduleAttendanceTab,
} from "@/features/detail-course/components";
import { useCourse } from "@/hooks/useCourse";
import { useCourseTab } from "@/features/detail-course/hooks/useCourseTab";
import { useSectionContent } from "@/hooks/useSectionContent";
import { useStartActivity, useCheckEnroll } from "@/hooks/useActivity";
import { Toast } from "@/components/ui/Toast/Toast";
import { createToastState } from "@/utils/toastUtils";
import { AttendanceNotificationBanner } from "@/features/detail-course/components/AttendanceNotifBanner";

interface DetailCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DetailCoursePage({ params }: DetailCoursePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: courseDetail, isLoading, error } = useCourse(id);
  const { activeTab, setActiveTab } = useCourseTab(id);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const toastState = createToastState();
  const scheduleTabRef = useRef<HTMLDivElement | null>(null);

  const { data: sectionContent, isLoading: isSectionsLoading } =
    useSectionContent({
      courseId: id,
      enabled: activeTab === "course_contents",
    });

  const { mutate: enroll, isPending: isEnrolling } = useStartActivity(id);
  const { data: enrollStatus } = useCheckEnroll({ courseId: id });
  const [justEnrolled, setJustEnrolled] = useState(false);

  if (isLoading || !courseDetail) {
    return (
      <PageContainer>
        <DetailCourseSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Course
            </h2>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const course = courseDetail;

  const handleEnrollToggle = () => {
    if (isEnrolling) return;
    const enrolledData = enrollStatus?.data as any;
    const enrolledFlag =
      typeof enrolledData === "object"
        ? Boolean(enrolledData?.isEnroll)
        : Boolean(enrolledData);
    const enrolled = justEnrolled || enrolledFlag;
    if (!enrolled) {
      enroll(undefined, {
        onSuccess: () => {
          setIsEnrolled(true);
          setJustEnrolled(true);
          toastState.showSuccess(
            "Berhasil enroll. Klik Start Learning untuk mulai."
          );
        },
      });
      return;
    }
    router.push(`/my-course/${id}`);
  };

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleScheduleClick = () => {
    // Switch to schedule tab
    setActiveTab("schedule_attendance");

    // Scroll to the tab section with longer delay to ensure content is fully rendered
    setTimeout(() => {
      if (scheduleTabRef.current) {
        console.log("Scrolling to schedule tab...");
        // Get the element's position
        const elementPosition =
          scheduleTabRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 80; // 80px offset for better visibility

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
      console.log("failed to scroll to schedule tab");
    }, 300); // Increased delay to 300ms
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "All Courses", href: "/course" },
    {
      label: course?.groupCourse?.title || course?.title || "Course",
      isActive: true,
    },
  ];

  return (
    <>
      <AttendanceNotificationBanner
        onClickSchedule={handleScheduleClick}
        hasSchedule={true}
      />

      <PageContainer>
        <CourseBreadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <CourseThumbnail
              thumbnail={course?.groupCourse?.thumbnail || undefined}
              title={course?.groupCourse?.title || ""}
            />
            <CourseTitle
              title={course?.groupCourse?.title || course?.title || ""}
            />
          </div>

          <div className="space-y-4">
            <CourseInfoCard
              category={
                course?.groupCourse?.description?.category ||
                course?.description?.category ||
                ""
              }
              rating={course?.averageRating || course?.rating || 0}
              totalRatings={course?.totalUsers || course?.totalUserRating || 0}
              type={course?.groupCourse?.typeCourse || course?.typeCourse || ""}
              isEnrolled={isEnrolled}
              onToggle={handleEnrollToggle}
              courseId={course?.id || id}
              buttonLabel={(() => {
                if (justEnrolled) return "Start Learning";
                const d: any = enrollStatus?.data;
                const isEnrolledFlag =
                  typeof d === "object" ? d?.isEnroll === true : Boolean(d);
                return isEnrolledFlag ? "Continue Learning" : "Enroll Now";
              })()}
              isProcessing={isEnrolling}
              teacherName={course?.teacherName || ""}
            />
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="space-y-6 pb-8">
          <CourseTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hiddenTabs={["summary"]}
          />

          {activeTab === "information" && (
            <CourseInformationTab
              method={course?.groupCourse?.description?.method || ""}
              syllabusFile={course?.groupCourse?.description?.silabus || ""}
              totalJP={course?.groupCourse?.description?.totalJp || 0}
              quota={course?.groupCourse?.description?.quota || 0}
              description={course?.groupCourse?.description?.description || ""}
              zoomUrl={course?.zoomUrl || undefined}
              isEnrolled={false}
            />
          )}

          {activeTab === "course_contents" &&
            (isSectionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading sections...</div>
              </div>
            ) : (
              <CourseContentsTab
                sections={(sectionContent?.data?.listSection as any) || []}
                expandedSections={expandedSections}
                onToggleSection={handleToggleSection}
              />
            ))}

          {activeTab === "discussion_forum" && <DiscussionForumTab />}
          {activeTab === "discussion_forum" && <DiscussionForumTab />}

          {activeTab === "ratings_reviews" && (
            <RatingsReviewsTab courseId={id} />
          )}
        </div>
        {/* Toast */}
        {toastState.toast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
            <Toast
              variant={toastState.toast.variant}
              message={toastState.toast.message}
              onClose={toastState.dismissToast}
              autoDismiss
              duration={4000}
              dismissible
            />
          </div>
        )}
      </PageContainer>
    </>
  );
}
