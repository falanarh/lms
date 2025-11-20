/**
 * Mock data untuk course detail
 * Digunakan untuk development dan testing
 */

// Re-export CourseDetail type from API
import type { CourseDetail } from "@/api/course";
export type { CourseDetail };

export const mockCourseDetail: CourseDetail = {
  id: "course-123",
  idTeacher: "teacher-456",
  zoomUrl: "https://zoom.us/j/123456789",
  rating: 4.8,
  totalUserRating: 1250,
  _count: {
    listActivity: 42,
  },
  groupCourse: {
    id: "group-789",
    title: "UI/UX Design Fundamentals",
    thumbnail: "/api/placeholder/400/300",
    typeCourse: "Online",
    description: {
      method: "Online",
      silabus: "Comprehensive UI/UX design curriculum covering design principles, tools, and best practices",
      totalJp: 120,
      quota: 50,
      category: "Design",
      description: "Master the fundamentals of UI/UX design in this comprehensive course. Learn design principles, user research, prototyping, and industry-standard tools.",
    },
  },
};