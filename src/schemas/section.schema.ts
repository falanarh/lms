import { z } from "zod";
import { pagemetaSchema } from "./pagemeta.schema";

// Group Schema
const groupSchema = z.object({
  id: z.uuidv7("Invalid group ID format"),
  idCourse: z.uuidv7("Invalid course ID format"),
  idTeacher: z.uuidv7("Invalid teacher ID format"),
  isOpen: z.boolean(),
  name: z.string().min(3, {
    message: "Group name must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Group description must be at least 10 characters",
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Section Schema
export const sectionSchema = z.object({
  id: z.uuidv7("Invalid section ID format"),
  idGroup: z.uuidv7("Invalid group ID format"),
  name: z.string().min(3, {
    message: "Section name must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Section description must be at least 10 characters",
  }),
  sequence: z.number().int().min(0, {
    message: "Sequence must be a positive number",
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  group: groupSchema,
});


export const sectionGetResponseSchema = z.object({
  data: z.array(sectionSchema),
  pagemeta: pagemetaSchema
})


export const createSectionSchema = z.object({
  idCourse: z.uuidv4("Invalid group ID format"),
  name: z.string().min(3, {
    message: "Nama section minimal 3 karakter",
  }),
  description: z.string().default(""),
  sequence: z.number().int().min(0, {
    message: "Sequence must be a positive number",
  }),
});


export const updateSectionSchema = z.object({
  name: z.string().min(3, {
    message: "Section name must be at least 3 characters",
  }).optional(),
  description: z.string().optional(),
  sequence: z.number().int().min(0, {
    message: "Sequence must be a positive number",
  }).optional(),
});


// Type inference
export type SectionSchema = z.infer<typeof sectionSchema>;
export type GroupSchema = z.infer<typeof groupSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type SectionGetResponse = z.infer<typeof sectionGetResponseSchema>;