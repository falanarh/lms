import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export type Course = {
  id: string;
  title: string;
  categories: string;
  rating: number;
  teacher: string;
  teacherAvatar?: string;
  totalStudents: number;
  image: string;
  description?: string;
};

// export const getCourses = async (): Promise<Course[]> => {
//   const response = await axios.get<Course[]>(
//     "http://10.101.20.150:3000/courses"
//   );
//   console.log("Fetched courses:", response);
//   return response.data;
// };

export const getCourses = async (): Promise<Course[]> => {
  const response = await axios.get("http://10.101.20.150:3000/courses");

  const list: any[] = response.data?.data ?? [];

  const mappedCourses: Course[] = list.map((item: any) => {
    const seedNum = item.id ? String(item.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 1000);  
    const unsplashImage = `https://picsum.photos/seed/${seedNum}/600/400`;

    return {
      id: item.id,
      title: item.title,
      categories: item.description?.category || "Uncategorized",
      rating: 4.5,
      teacher: "Teacher",
      teacherAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      totalStudents: item.description?.quota || 0,
      image: unsplashImage,
      description: item.description?.description || "",
    };
  });

  //console.log("Mapped courses:", mappedCourses);
  return mappedCourses;
};

export const createCourse = async (): Promise<Course> => {
  const response = await axios.post<Course>(
    "https://jsonplaceholder.typicode.com/posts"
  );
  return response.data;
};

export const useCreateCourse = () => {
  return useMutation({
    mutationFn: createCourse,
  });
};
