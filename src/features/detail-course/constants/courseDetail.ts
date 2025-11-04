/**
 * Mock data untuk course detail
 * Digunakan untuk development dan testing
 */

export const mockCourseDetail = {
  id: "1",
  title: "UI/UX Design Fundamentals",
  category: "Design",
  type: "Open Access",
  thumbnail: "/images/course-thumbnail.jpg",
  teacher: "Dr. Sarah Johnson",
  description:
    "Learn the fundamentals of user experience design and create intuitive digital products. This comprehensive course covers everything from user research to prototyping and testing. You'll gain hands-on experience with industry-standard tools and methodologies experience design and create intuitive digital products. This comprehensive course covers everything from user research to prototyping and testing. You'll gain hands-on experience with industry-standard tools and methodologies",
  method: "Self-Paced (Mandiri)",
  zoomLink: "Buka Zoom",
  syllabusFile: "Download PDF",
  syllabus: [
    "Introduction to UI/UX Design",
    "User Research & Analysis",
    "Information Architecture",
    "Wireframing & Prototyping",
    "Visual Design Principles",
    "Usability Testing",
    "Design Systems",
    "Final Project",
  ],
  quota: 50,
  enrolled: 35,
  duration: "10 Weeks",
  level: "Beginner to Intermediate",
  rating: 4.8,
  totalRatings: 1247,
  ratingDistribution: {
    5: 850,
    4: 297,
    3: 75,
    2: 15,
    1: 10,
  },
  sections: [
    {
      id: "1",
      name: "Introduction to UX Design",
      contents: [
        {
          id: "1-1",
          type: "video",
          name: "What is UX Design?",
          restrictAccess: false,
        },
        {
          id: "1-2",
          type: "pdf",
          name: "The UX Design Process",
          restrictAccess: true,
        },
        {
          id: "1-3",
          type: "video",
          name: "Tools and Resources",
          restrictAccess: true,
        },
      ],
    },
    {
      id: "2",
      name: "User Research Methods",
      contents: [
        {
          id: "2-1",
          type: "video",
          name: "Understanding Your Users",
          restrictAccess: true,
        },
        {
          id: "2-2",
          type: "scorm",
          name: "User Interviews",
          restrictAccess: true,
        },
        {
          id: "2-3",
          type: "quiz",
          name: "Surveys and Questionnaires",
          restrictAccess: true,
        },
        {
          id: "2-4",
          type: "assignment",
          name: "Creating User Personas",
          restrictAccess: true,
        },
      ],
    },
    {
      id: "3",
      name: "Wireframing and Prototyping",
      contents: [
        {
          id: "3-1",
          type: "video",
          name: "Introduction to Wireframing",
          restrictAccess: true,
        },
        {
          id: "3-2",
          type: "pdf",
          name: "Low-Fidelity vs High-Fidelity",
          restrictAccess: true,
        },
        {
          id: "3-3",
          type: "assignment",
          name: "Prototyping Best Practices Prototyping Best Practices Prototyping Best Practices",
          restrictAccess: true,
        },
      ],
    },
    {
      id: "4",
      name: "Usability Testing",
      contents: [
        {
          id: "4-1",
          type: "video",
          name: "Planning Usability Tests",
          restrictAccess: true,
        },
        {
          id: "4-2",
          type: "scorm",
          name: "Conducting Tests",
          restrictAccess: true,
        },
        {
          id: "4-3",
          type: "quiz",
          name: "Analyzing Results",
          restrictAccess: true,
        },
      ],
    },
  ],
};

export type CourseDetail = typeof mockCourseDetail;
