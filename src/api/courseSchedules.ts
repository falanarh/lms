import axios from "axios";

type Course = {
  id: string;
  idGroupCourse: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

type Content = {
  type: string;
  name: string;
  sequence: number;
  contentUrl: string;
};



export type CourseSchedule = {
  id: string;
  idCourse: string;
  idContent: string;
  name: string;
  description: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  jp: number;
  isMooc: boolean;
  createdAt: Date;
  updatedAt: Date;
  course: Course;
  content: Content;
};

type PageMeta = {
  page: number;
  perPage: number;
  hasPrev: boolean;
  hasNext: boolean;
  totalPageCount: number;
  showingFrom: number;
  showingTo: number;
  resultCount: number;
  totalResultCount: number;
};

type CourseSchedulesResponse = {
  data: CourseSchedule[];
  pageMeta: PageMeta;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const getCourseSchedules = async (
  idGroup: string,
): Promise<CourseSchedule[]> => {
  const response = await axios.get<CourseSchedulesResponse>(
    `${BASE_URL}/course-schedules?idGroup=${idGroup}`,
    {
      withCredentials: false,
    },
  );
  return response.data.data;
};

export const createCourseSchedule = async (
  newCourseSchedule: Omit<
    CourseSchedule,
    "id" | "groupCourse" | "masterContent" | "createdAt" | "updatedAt"
  >,
): Promise<CourseSchedule> => {
  const response = await axios.post<CourseSchedule>(
    `${BASE_URL}/course-schedules`,
    newCourseSchedule,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const updateCourseSchedule = async (
  id: string,
  updatedData: Partial<
    Omit<
      CourseSchedule,
      "id" | "groupCourse" | "masterContent" | "createdAt" | "updatedAt"
    >
  >,
): Promise<CourseSchedule> => {
  const response = await axios.patch<CourseSchedule>(
    `${BASE_URL}/course-schedules/${id}`,
    updatedData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const deleteCourseSchedule = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/course-schedules/${id}`);
};
