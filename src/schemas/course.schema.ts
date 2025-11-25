import z from "zod";

import { IMAGE_SCHEMA } from "./file.schema";
import { pagemetaSchema } from "./pagemeta.schema";

const courseSchema = z.object({
  id: z.uuidv7("Invalid group ID format"),
  title: z.string().min(5, {
    message: "Title cannot be less than 5 characters",
  }),
  categories: z.string().min(3, "Categories must be at least 3 characters"),
  rating: z.number().min(0).max(5).nullable(),
  teacher: z.string().min(3, "Teacher name must be at least 3 characters"),
  teacherAvatar: z.url().optional(),
  totalStudents: z.number().min(0),
  image: IMAGE_SCHEMA,
  description: z.string().optional(),
});

export type CourseScehma = z.infer<typeof courseSchema>;

export const courseGetResponseSchema = z.object({
  data: z.array(courseSchema),
  pagemeta: pagemetaSchema
})
