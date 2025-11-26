/**
 * Mock data untuk course detail
 * Digunakan untuk development dan testing
 */

// Re-export CourseResponse type from API
import type { CourseResponse } from "@/api/course";
export type { CourseResponse as CourseDetail };

export const mockCourseDetail: CourseResponse = {
  id: "course-123",
  title: "UI/UX Design Fundamentals",
  idManager: "teacher-456",
  thumbnail: "/api/placeholder/400/300",
  typeCourse: "Online",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  description: {
    id: "desc-123",
    idCourse: "course-123",
    curriculum: "UI/UX Design Curriculum",
    method: "Online",
    silabus: "Comprehensive UI/UX design curriculum covering design principles, tools, and best practices",
    totalJp: 120,
    quota: 50,
    grade: "Advanced",
    category: "Design",
    description: "Master the fundamentals of UI/UX design in this comprehensive course. Learn design principles, user research, prototyping, and industry-standard tools.",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  groups: [{
    id: "group-789",
    idCourse: "course-123",
    idTeacher: "teacher-456",
    isOpen: true,
    name: "UI/UX Design Fundamentals",
    description: "Master the fundamentals of UI/UX design in this comprehensive course. Learn design principles, user research, prototyping, and industry-standard tools.",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  }],
  averageRating: 4.8,
  totalUsers: 1250,
  zoomUrl: "https://zoom.us/j/123456789",
};