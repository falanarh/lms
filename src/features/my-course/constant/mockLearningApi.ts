import type { Content } from "@/api/contents";

export type ActivityStatus = {
  isFinished: boolean;
};

export type ContentWithActivity = Content & {
  activityContents: ActivityStatus[];
};

export type SectionWithActivity = {
  id: string;
  name: string;
  description: string;
  sequence: number;
  listActivitySection: ActivityStatus[];
  listContent: ContentWithActivity[];
};

export type GroupCourseSectionsResponse = {
  id: string;
  idTeacher: string;
  zoomUrl: string | null;
  listSection: SectionWithActivity[];
};

export const mockGroupCourseSectionsResponse: GroupCourseSectionsResponse = {
  id: "a1c40fbb-ee50-4b94-bc69-3c796c95e82d",
  idTeacher: "1ff44301-609d-4747-9735-6d3323564d86",
  zoomUrl: null,
  listSection: [
    {
      id: "458cb774-5abb-4982-b43d-43dfee087ea3",
      name: "Database Introduction",
      description: "Overview of database concepts and types",
      sequence: 1,
      listActivitySection: [{ isFinished: true }],
      listContent: [
        {
          id: "sec1-content-video-1",
          type: "VIDEO",
          name: "Pengenalan Database",
          description: "Dasar-dasar database dan kegunaannya",
          contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          contentStart: "2024-02-01T00:00:00.000Z",
          contentEnd: "2024-07-01T00:00:00.000Z",
          sequence: 1,
          activityContents: [{ isFinished: true }],
        },
        {
          id: "sec1-content-link-yt",
          type: "LINK",
          name: "Video YouTube: Relational vs NoSQL",
          description: "Perbedaan database relasional dan NoSQL",
          contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          contentStart: "2024-02-01T00:00:00.000Z",
          contentEnd: "2024-07-01T00:00:00.000Z",
          sequence: 2,
          activityContents: [{ isFinished: false }],
        },
        {
          id: "sec1-content-link-doc",
          type: "LINK",
          name: "Artikel: Indeks dan Optimasi Query",
          description: "Praktik terbaik untuk optimasi query database",
          contentUrl: "https://example.com/docs/database-indexing",
          contentStart: "2024-02-01T00:00:00.000Z",
          contentEnd: "2024-07-01T00:00:00.000Z",
          sequence: 3,
          activityContents: [{ isFinished: false }],
        },
        {
          id: "sec1-content-pdf-1",
          type: "PDF",
          name: "Materi PDF: Dasar SQL",
          description: "Dokumen pengantar SQL",
          contentUrl: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          contentStart: "2024-02-01T00:00:00.000Z",
          contentEnd: "2024-07-01T00:00:00.000Z",
          sequence: 4,
          activityContents: [{ isFinished: false }],
        },
        {
          id: "sec1-content-scorm-1",
          type: "SCORM",
          name: "SCORM: Modul Interaktif Database",
          description: "Konten interaktif pembelajaran database",
          contentUrl: "https://h5p.org/h5p/embed/617",
          contentStart: "2024-02-01T00:00:00.000Z",
          contentEnd: "2024-07-01T00:00:00.000Z",
          sequence: 5,
          activityContents: [{ isFinished: false }],
        },
      ],
    },
    {
      id: "a9ef7231-5b1c-41c8-81ea-4f1253df30c6",
      name: "State Management",
      description: "Managing application state effectively",
      sequence: 2,
      listActivitySection: [{ isFinished: true }],
      listContent: [
        {
          id: "sec2-content-task-1",
          type: "TASK",
          name: "Tugas: Implementasi State Management",
          description: "Buat contoh aplikasi dengan state management sederhana Buat contoh aplikasi dengan state management sederhana Buat contoh aplikasi dengan state management sederhana Buat contoh aplikasi dengan state management sederhana Buat contoh aplikasi dengan state management sederhana Buat contoh aplikasi dengan state management sederhana",
          contentUrl: "https://example.com/docs/state-management-assignment.pdf",
          contentStart: "2024-02-01T00:00:00.000Z",
          contentEnd: "2024-07-01T00:00:00.000Z",
          sequence: 1,
          activityContents: [{ isFinished: false }],
        },
        {
          id: "sec2-content-quiz-1",
          type: "QUIZ",
          name: "Kuis: Konsep Dasar State",
          description: "Kuis untuk menguji pemahaman state management",
          contentUrl: "/quiz/state-basics",
          contentStart: "2024-02-01T00:00:00.000Z",
          contentEnd: "2024-07-01T00:00:00.000Z",
          sequence: 2,
          activityContents: [{ isFinished: false }],
        },
      ],
    },
    {
      id: "423067d7-ee40-498f-a538-fd201dc298d8",
      name: "Cloud Computing Basics",
      description: "Introduction to cloud concepts and services",
      sequence: 3,
      listActivitySection: [{ isFinished: false }],
      listContent: [
        {
          id: "20d26981-6ed9-4814-9dc9-f2b9383a06a2",
          type: "VIDEO",
          name: "Cloud Fundamentals",
          description: "Basic cloud computing concepts",
          contentUrl: "https://files.example.com/videos/cloud-fundamentals.mp4",
          contentStart: "2024-02-01T00:00:00.000Z",
          contentEnd: "2024-07-01T00:00:00.000Z",
          sequence: 1,
          activityContents: [{ isFinished: false }],
        },
      ],
    },
  ],
};

import type { GroupCourseDetail } from "@/api/grup-course";

export type GroupCourseDetailResponseWrapper = {
  data: GroupCourseDetail;
};

export const mockGroupCourseDetailResponse: GroupCourseDetailResponseWrapper = {
  data: {
    id: "8c34f7c1-3af0-4a94-bd5e-d73b0d52f002",
    idTeacher: "2a3b9d90-1c5f-4b02-b4f0-52e4c3f0a002",
    zoomUrl: null,
    rating: 4.8,
    totalUserRating: 50,
    _count: {
      listActivity: 10,
    },
    course: {
      id: "5a8e9b80-2b6f-4d8a-93b3-73b78a22f001",
      title: "Introduction to Web Development",
      thumbnail: "https://img.freepik.com/free-photo/web-development-concept_23-2150376789.jpg",
      typeCourse: "OPEN",
      description: {
        method: "Online Self-Paced",
        silabus: "HTML, CSS, JavaScript, SCORM, Assignments, Quiz",
        totalJp: 40,
        quota: 100,
        category: "Web Development",
        description:
          "This course provides a beginner-friendly introduction to web development. Students will learn how to build static websites, understand basic front-end technologies, and complete interactive modules and assignments.",
      },
    },
  },
};

export type TaskSubmissionAttempt = {
  id: string;
  idContent: string;
  idUser: string;
  urlFile: string;
  totalScore: number | null;
  feedback: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const mockSubmitTaskResponse: TaskSubmissionAttempt = {
  id: "attempt-uuid-123",
  idContent: "content-uuid-456",
  idUser: "user-uuid-789",
  urlFile: "https://storage.example.com/submissions/assignment.pdf",
  totalScore: null,
  feedback: null,
  status: "SUBMITTED",
  createdAt: "2024-11-15T10:00:00.000Z",
  updatedAt: "2024-11-15T10:00:00.000Z",
};

export type QuizInfo = {
  idContent: string;
  idCurriculum: string;
  curriculum: string;
  durationLimit: number;
  totalQuestions: number;
  maxPoint: number;
  passingScore: number;
  attemptLimit: number;
  shuffleQuestions: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export const mockQuizInfo: QuizInfo = {
  idContent: "content-uuid-123",
  idCurriculum: "curriculum-uuid-456",
  curriculum: "Matematika Kelas 1",
  durationLimit: 60,
  totalQuestions: 20,
  maxPoint: 100,
  passingScore: 70,
  attemptLimit: 3,
  shuffleQuestions: true,
  createdBy: "user-uuid-789",
  createdAt: "2024-11-15T10:00:00.000Z",
  updatedAt: "2024-11-15T10:00:00.000Z",
};

export type QuizStartResponse = {
  questions: { id: string; order: number }[];
};

export const mockQuizStartResponse: QuizStartResponse = {
  questions: [
    { id: "question-uuid-1", order: 1 },
    { id: "question-uuid-2", order: 2 },
    { id: "question-uuid-3", order: 3 },
  ],
};

export type QuestionOption = {
  id: string;
  text: string;
};

export type QuestionWithAnswers = {
  id: string;
  question: string;
  options: QuestionOption[];
};

export const mockQuestionWithAnswers: Record<string, QuestionWithAnswers> = {
  "question-uuid-1": {
    id: "question-uuid-1",
    question: "Apa itu basis data?",
    options: [
      { id: "answer-1", text: "Sistem untuk menyimpan dan mengelola data" },
      { id: "answer-2", text: "Bahasa pemrograman" },
      { id: "answer-3", text: "Perangkat keras komputer" },
      { id: "answer-4", text: "Jaringan internet" },
    ],
  },
  "question-uuid-2": {
    id: "question-uuid-2",
    question: "Manakah yang termasuk jenis basis data?",
    options: [
      { id: "answer-1", text: "Relasional" },
      { id: "answer-2", text: "Dokumentasi" },
      { id: "answer-3", text: "Key-Value" },
      { id: "answer-4", text: "Grafik" },
    ],
  },
};

export type QuizAttemptUpdateResponse = {
  id: string;
  questionOrder: string[];
  answer: Record<string, string>;
  rawScore: Record<string, number>;
  totalScore: number;
  finalScore: number;
  status: string;
};

export const mockQuizAttemptUpdated: QuizAttemptUpdateResponse = {
  id: "attempt-uuid",
  questionOrder: ["q3", "q1", "q2"],
  answer: {
    "0": "Jawaban user...",
    "1": "Another answer",
  },
  rawScore: {
    "0": 10,
    "1": 0,
  },
  totalScore: 10,
  finalScore: 10,
  status: "PENDING",
};

export type QuizSubmitResponse = {
  id: string;
  status: string;
  totalScore: number;
  finalScore: number;
  isPassed: boolean;
  quizEnd: string;
  answer: Record<string, string>;
  rawScore: Record<string, number>;
};

export const mockQuizSubmitResponse: QuizSubmitResponse = {
  id: "attempt-uuid",
  status: "SUBMITTED",
  totalScore: 100,
  finalScore: 85,
  isPassed: true,
  quizEnd: "2024-01-01T11:00:00Z",
  answer: {
    "0": "Final answer 1",
    "1": "Final answer 2",
  },
  rawScore: {
    "0": 15,
    "1": 10,
  },
};

export type QuizAttemptReview = {
  id: string;
  idUser: string;
  idContent: string;
  questionOrder: string[];
  questionName: string[];
  questionDescription: string[];
  questionText: string[];
  questionType: string[];
  questionScore: number[];
  keyAnswer: string[];
  answer: string[];
  flag: boolean[];
  rawScore: number[];
  attemptNo: number;
  status: string;
  totalScore: number;
  finalScore: number;
  isPassed: boolean;
  quizStart: string;
  quizEnd: string;
};

export const mockQuizAttemptReview: QuizAttemptReview = {
  id: "73ffcb06-df89-4e46-a8ac-43b6fd439125",
  idUser: "60e85cd9-3528-4235-9f5c-b17436a00597",
  idContent: "7a71e3e0-949e-4b08-b218-ebbbd2d957c1",
  questionOrder: ["1", "2"],
  questionName: [
    "1. What is the capital of Lampung?",
    "[update] 2. What is the capital of Lampung?",
  ],
  questionDescription: [
    "A simple question about the capital city of Lampung.",
    "A simple question about the capital city of Lampung.",
  ],
  questionText: [
    "What is the capital of Lampung?",
    "What is the capital of Lampung?",
  ],
  questionType: ["MULTIPLE_CHOICE", "MULTIPLE_CHOICE"],
  questionScore: [10, 10],
  keyAnswer: ["A", "A"],
  answer: ["A", "A"],
  flag: [false, false],
  rawScore: [10, 10],
  attemptNo: 1,
  status: "SUBMITTED",
  totalScore: 20,
  finalScore: 20,
  isPassed: false,
  quizStart: "2025-11-05T01:45:10.646Z",
  quizEnd: "2025-11-05T01:46:43.145Z",
};