import { EnrolledCourse } from "../types";

export const dummyEnrolledCourses: EnrolledCourse[] = [
  {
    id: "1",
    idTeacher: "teacher-1",
    rating: 4.8,
    totalUserRating: 156,
    enrolledAt: "2024-01-15T10:00:00Z",
    lastAccessedAt: "2024-11-10T14:30:00Z",
    progress: {
      completedLessons: 24,
      totalLessons: 30,
      completedActivities: 18,
      totalActivities: 25,
      percentage: 80,
    },
    certificate: {
      isIssued: false,
    },
    _count: {
      listActivity: 245,
    },
    course: {
      id: "course-1",
      title: "Complete Web Development Bootcamp 2024",
      thumbnail: "https://dummyimage.com/600x400/3B82F6/fff&text=Web+Dev",
      typeCourse: "Online",
      description: {
        category: "Programming",
        description: "Learn web development from scratch with HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects.",
        method: "Online",
        silabus: "Comprehensive web development curriculum",
        totalJp: 45,
        quota: 100,
      },
    },
  },
  {
    id: "2",
    idTeacher: "teacher-2",
    rating: 4.9,
    totalUserRating: 89,
    enrolledAt: "2024-02-20T09:15:00Z",
    lastAccessedAt: "2024-11-12T16:45:00Z",
    progress: {
      completedLessons: 42,
      totalLessons: 42,
      completedActivities: 35,
      totalActivities: 35,
      percentage: 100,
    },
    certificate: {
      isIssued: true,
      issuedAt: "2024-10-15T12:00:00Z",
      downloadUrl: "/certificates/course-2.pdf",
    },
    _count: {
      listActivity: 178,
    },
    course: {
      id: "course-2",
      title: "UI/UX Design Masterclass",
      thumbnail: "https://dummyimage.com/600x400/8B5CF6/fff&text=UI%2FUX",
      typeCourse: "Online",
      description: {
        category: "Design",
        description: "Master UI/UX design principles, tools, and techniques. Create beautiful user interfaces and experiences.",
        method: "Online",
        silabus: "Complete UI/UX design methodology",
        totalJp: 30,
        quota: 50,
      },
    },
  },
  {
    id: "3",
    idTeacher: "teacher-3",
    rating: 4.6,
    totalUserRating: 234,
    enrolledAt: "2024-03-10T13:30:00Z",
    lastAccessedAt: "2024-11-08T11:20:00Z",
    progress: {
      completedLessons: 8,
      totalLessons: 40,
      completedActivities: 6,
      totalActivities: 30,
      percentage: 20,
    },
    certificate: {
      isIssued: false,
    },
    _count: {
      listActivity: 412,
    },
    course: {
      id: "course-3",
      title: "Python for Data Science and Machine Learning",
      thumbnail: "https://dummyimage.com/600x400/10B981/fff&text=Python+DS",
      typeCourse: "Online",
      description: {
        category: "Data Science",
        description: "Learn Python programming, data analysis, visualization, and machine learning with hands-on projects.",
        method: "Online",
        silabus: "Data science and ML fundamentals",
        totalJp: 60,
        quota: 75,
      },
    },
  },
  {
    id: "4",
    idTeacher: "teacher-4",
    rating: 4.7,
    totalUserRating: 167,
    enrolledAt: "2024-01-25T15:45:00Z",
    lastAccessedAt: "2024-11-11T09:30:00Z",
    progress: {
      completedLessons: 15,
      totalLessons: 25,
      completedActivities: 12,
      totalActivities: 20,
      percentage: 60,
    },
    certificate: {
      isIssued: false,
    },
    _count: {
      listActivity: 289,
    },
    course: {
      id: "course-4",
      title: "Digital Marketing Strategy 2024",
      thumbnail: "https://dummyimage.com/600x400/F59E0B/fff&text=Marketing",
      typeCourse: "Online",
      description: {
        category: "Marketing",
        description: "Master digital marketing strategies including SEO, social media, content marketing, and paid advertising.",
        method: "Online",
        silabus: "Complete digital marketing strategy",
        totalJp: 25,
        quota: 60,
      },
    },
  },
  {
    id: "5",
    idTeacher: "teacher-5",
    rating: 4.5,
    totalUserRating: 198,
    enrolledAt: "2024-04-05T11:00:00Z",
    lastAccessedAt: "2024-10-28T14:15:00Z",
    progress: {
      completedLessons: 0,
      totalLessons: 35,
      completedActivities: 0,
      totalActivities: 28,
      percentage: 0,
    },
    certificate: {
      isIssued: false,
    },
    _count: {
      listActivity: 324,
    },
    course: {
      id: "course-5",
      title: "Photography Complete Guide: Beginner to Professional",
      thumbnail: "https://dummyimage.com/600x400/EC4899/fff&text=Photography",
      typeCourse: "Online",
      description: {
        category: "Photography",
        description: "Learn photography from basics to professional techniques. Master composition, lighting, and post-processing.",
        method: "Online",
        silabus: "Complete photography course",
        totalJp: 35,
        quota: 40,
      },
    },
  },
  {
    id: "6",
    idTeacher: "teacher-6",
    rating: 4.9,
    totalUserRating: 142,
    enrolledAt: "2024-02-15T08:30:00Z",
    lastAccessedAt: "2024-11-13T17:20:00Z",
    progress: {
      completedLessons: 18,
      totalLessons: 20,
      completedActivities: 15,
      totalActivities: 18,
      percentage: 90,
    },
    certificate: {
      isIssued: false,
    },
    _count: {
      listActivity: 156,
    },
    course: {
      id: "course-6",
      title: "Business Strategy and Entrepreneurship",
      thumbnail: "https://dummyimage.com/600x400/6366F1/fff&text=Business",
      typeCourse: "Online",
      description: {
        category: "Business",
        description: "Learn business strategy, entrepreneurship, and how to build successful companies from scratch.",
        method: "Online",
        silabus: "Business strategy and entrepreneurship",
        totalJp: 28,
        quota: 80,
      },
    },
  },
  {
    id: "7",
    idTeacher: "teacher-7",
    rating: 4.4,
    totalUserRating: 267,
    enrolledAt: "2024-03-20T16:00:00Z",
    lastAccessedAt: "2024-11-09T13:45:00Z",
    progress: {
      completedLessons: 5,
      totalLessons: 30,
      completedActivities: 3,
      totalActivities: 22,
      percentage: 17,
    },
    certificate: {
      isIssued: false,
    },
    _count: {
      listActivity: 445,
    },
    course: {
      id: "course-7",
      title: "Music Production - Electronic Music Complete",
      thumbnail: "https://dummyimage.com/600x400/A855F7/fff&text=Music",
      typeCourse: "Online",
      description: {
        category: "Music",
        description: "Learn electronic music production with Ableton Live, FL Studio, and music theory fundamentals.",
        method: "Online",
        silabus: "Electronic music production",
        totalJp: 32,
        quota: 35,
      },
    },
  },
  {
    id: "8",
    idTeacher: "teacher-8",
    rating: 4.8,
    totalUserRating: 189,
    enrolledAt: "2024-01-30T12:15:00Z",
    lastAccessedAt: "2024-11-13T10:30:00Z",
    progress: {
      completedLessons: 22,
      totalLessons: 22,
      completedActivities: 18,
      totalActivities: 18,
      percentage: 100,
    },
    certificate: {
      isIssued: true,
      issuedAt: "2024-09-20T14:00:00Z",
      downloadUrl: "/certificates/course-8.pdf",
    },
    _count: {
      listActivity: 203,
    },
    course: {
      id: "course-8",
      title: "Health & Fitness - Complete Personal Training Course",
      thumbnail: "https://dummyimage.com/600x400/EF4444/fff&text=Fitness",
      typeCourse: "Online",
      description: {
        category: "Health & Fitness",
        description: "Complete personal training course covering exercise science, nutrition, and client training programs.",
        method: "Online",
        silabus: "Personal training and fitness",
        totalJp: 26,
        quota: 45,
      },
    },
  },
  {
    id: "9",
    idTeacher: "teacher-9",
    rating: 4.6,
    totalUserRating: 124,
    enrolledAt: "2024-04-12T14:00:00Z",
    lastAccessedAt: "2024-11-05T15:30:00Z",
    progress: {
      completedLessons: 12,
      totalLessons: 35,
      completedActivities: 8,
      totalActivities: 25,
      percentage: 34,
    },
    certificate: {
      isIssued: false,
    },
    _count: {
      listActivity: 178,
    },
    course: {
      id: "course-9",
      title: "Spanish Language Complete Course",
      thumbnail: "https://dummyimage.com/600x400/14B8A6/fff&text=Spanish",
      typeCourse: "Online",
      description: {
        category: "Language",
        description: "Learn Spanish from beginner to advanced level with grammar, vocabulary, and conversation practice.",
        method: "Online",
        silabus: "Complete Spanish language course",
        totalJp: 40,
        quota: 55,
      },
    },
  },
  {
    id: "10",
    idTeacher: "teacher-10",
    rating: 4.7,
    totalUserRating: 203,
    enrolledAt: "2024-05-08T10:30:00Z",
    lastAccessedAt: "2024-11-12T12:45:00Z",
    progress: {
      completedLessons: 8,
      totalLessons: 28,
      completedActivities: 6,
      totalActivities: 20,
      percentage: 29,
    },
    certificate: {
      isIssued: false,
    },
    _count: {
      listActivity: 367,
    },
    course: {
      id: "course-10",
      title: "Financial Markets and Investment Strategies",
      thumbnail: "https://dummyimage.com/600x400/F97316/fff&text=Finance",
      typeCourse: "Online",
      description: {
        category: "Business",
        description: "Master financial markets, investment strategies, stock trading, and portfolio management fundamentals.",
        method: "Online",
        silabus: "Financial markets and investments",
        totalJp: 38,
        quota: 70,
      },
    },
  },
];

export const getDummyStats = () => {
  const totalCourses = dummyEnrolledCourses.length;
  const completedCourses = dummyEnrolledCourses.filter(course => course.progress.percentage === 100).length;
  const inProgressCourses = dummyEnrolledCourses.filter(course => course.progress.percentage > 0 && course.progress.percentage < 100).length;
  const averageProgress = Math.round(
    dummyEnrolledCourses.reduce((sum, course) => sum + course.progress.percentage, 0) / totalCourses
  );
  const totalCertificates = dummyEnrolledCourses.filter(course => course.certificate.isIssued).length;

  return {
    totalCourses,
    completedCourses,
    inProgressCourses,
    averageProgress,
    totalCertificates,
  };
};