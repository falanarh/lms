import { z } from "zod";
import { pagemetaSchema } from "./pagemeta.schema";

export const taskDataSchema = z.object({
  maxPoint: z.number().int().min(1).max(1000),
  isRequired: z.boolean().optional().default(true),
  dueDate: z.string().optional(),
  createdBy: z.uuidv4(),
});

// Content Schema
export const contentSchema = z
  .object({
    id: z.string().min(1, "Content ID is required"),
    idSection: z.string().min(1, "Section ID is required"),
    type: z.enum(["video", "document", "quiz", "assignment", "text", "image"], {
      message: "Invalid content type",
    }),
    contentUrl: z.url("Invalid content URL format"),
    name: z.string().min(3, {
      message: "Content name must be at least 3 characters",
    }),
    description: z.string().min(10, {
      message: "Content description must be at least 10 characters",
    }),
    contentStart: z.coerce.date("Invalid date format for contentStart"),
    contentEnd: z.coerce.date("Invalid date format for contentEnd"),
    sequence: z.number().int().min(0, {
      message: "Sequence must be a positive number",
    }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    // ✅ NEW: Task data
    taskData: taskDataSchema.optional(),
    // Quiz data (already exists)
    quizData: z.object({
      idCurriculum: z.string().uuid().optional(),
      curriculum: z.string().optional(),
      durationLimit: z.number().int().min(1),
      totalQuestions: z.number().int().positive().optional(),
      maxPoint: z.number().int().positive(),
      passingScore: z.number().min(0).max(100),
      attemptLimit: z.number().int().positive().optional(),
      shuffleQuestions: z.boolean(),
    }).optional(),
  })
  .refine((data) => new Date(data.contentEnd) > new Date(data.contentStart), {
    message: "Content end date must be after content start date",
    path: ["contentEnd"],
  });

export type ContentSchema = z.infer<typeof contentSchema>;

export const contentGetResponseSchema = z.object({
  data: z.array(contentSchema),
  pagemeta: pagemetaSchema,
});

const baseContentSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Judul aktivitas harus minimal 3 karakter",
    })
    .max(200, {
      message: "Judul aktivitas maksimal 200 karakter",
    }),
  description: z
    .string()
    .min(10, {
      message: "Deskripsi harus minimal 10 karakter",
    })
    .max(1000, {
      message: "Deskripsi maksimal 1000 karakter",
    })
    .optional()
    .or(z.literal("")),
  contentStart: z.coerce.date().nullable().optional(),
  contentEnd: z.coerce.date().nullable().optional(),
  deadline: z.coerce.date().nullable().optional(), // ✅ NEW: Task deadline field
});

// Video Content Schema
export const createVideoContentSchema = baseContentSchema.extend({
  idSection: z.string().uuid("Invalid section ID"),
  type: z.literal("VIDEO"),
  contentUrl: z.string().optional(),
  sequence: z.number().int().min(0),
});

// export const updateVideoContentSchema = baseContentSchema
//   .extend({
//     type: z.literal("VIDEO"),
//     videoFile: VIDEO_SCHEMA_OPTIONAL,
//     contentUrl: z.string().optional(),
//   })
//   .partial()
//   .type()
//   .refine(
//     (data) =>
//       data.name !== undefined ||
//       data.description !== undefined ||
//       data.videoFile !== undefined ||
//       data.contentUrl !== undefined,
//     { message: "At least one field must be updated" },
//   );
export const updateVideoContentSchema = baseContentSchema
  .extend({
    type: z.literal("VIDEO"),
    contentUrl: z.string().optional(),
  })
  .partial()
  .required({ type: true });

// Link Content Schema
export const createLinkContentSchema = baseContentSchema.extend({
  idSection: z.string().uuid("Invalid section ID"),
  type: z.literal("LINK"),
  contentUrl: z.string().url("URL tidak valid"),
  sequence: z.number().int().min(0),
});

export const updateLinkContentSchema = baseContentSchema
  .extend({
    type: z.literal("LINK"),
    contentUrl: z.string().url("URL tidak valid").optional(),
  })
  .partial()
  .required({ type: true });
  // .refine(
  //   (data) =>
  //     data.name !== undefined ||
  //     data.description !== undefined ||
  //     data.contentUrl !== undefined,
  //   { message: "At least one field must be updated" },
  // );

// PDF/Document Content Schema
export const createPdfContentSchema = baseContentSchema.extend({
  idSection: z.string().uuid("Invalid section ID"),
  type: z.literal("PDF"),
  contentUrl: z.string().optional(),
  sequence: z.number().int().min(0),
});

// export const updatePdfContentSchema = baseContentSchema
//   .extend({
//     type: z.literal("PDF"),
//     documentFile: DOCUMENT_SCHEMA_OPTIONAL,
//     contentUrl: z.string().optional(),
//   })
//   .partial()
//   .refine(
//     (data) =>
//       data.name !== undefined ||
//       data.description !== undefined ||
//       data.documentFile !== undefined ||
//       data.contentUrl !== undefined,
//     { message: "At least one field must be updated" },
//   );
export const quizDataSchema = z.object({
  idCurriculum: z.uuidv4().optional(),
  curriculum: z.string().optional(),
  durationLimit: z.number().int().min(1),
  totalQuestions: z.number().int().positive().optional(),
  maxPoint: z.number().int().positive(),
  passingScore: z.number().min(0).max(100),
  attemptLimit: z.number().int().positive().optional(),
  shuffleQuestions: z.boolean(),
});

export const updatePdfContentSchema = baseContentSchema
  .extend({
    type: z.literal("PDF"),
    contentUrl: z.string().optional(),
  })
  .partial()
  .required({ type: true });

// SCORM Content Schema
export const createScormContentSchema = baseContentSchema.extend({
  idSection: z.string().uuid("Invalid section ID"),
  type: z.literal("SCORM"),
  contentUrl: z.string().optional(),
  sequence: z.number().int().min(0),
});

export const updateScormContentSchema = baseContentSchema
  .extend({
    type: z.literal("SCORM"),
    contentUrl: z.string().optional(),
  })
  // .partial()
  // .refine(
  //   (data) =>
  //     data.name !== undefined ||
  //     data.description !== undefined ||
  //     data.scormFile !== undefined ||
  //     data.contentUrl !== undefined,
  //   { message: "At least one field must be updated" },
  // );
  .partial()
  .required({ type: true });

// Quiz Content Schema
export const createQuizContentSchema = baseContentSchema.extend({
  idSection: z.string().uuid("Invalid section ID"),
  type: z.literal("QUIZ"),
  contentUrl: z.string().optional(),
  sequence: z.number().int().min(0),
  quizData: quizDataSchema.optional(),
});

export const updateQuizContentSchema = baseContentSchema
  .extend({
    type: z.literal("QUIZ"),
    contentUrl: z.string().optional(),
    quizData: quizDataSchema.optional(),
  })
  .partial()
  .required({ type: true });
  // .partial();

// Task Content Schema
export const createTaskContentSchema = baseContentSchema.extend({
  idSection: z.string().uuid("Invalid section ID"),
  type: z.literal("TASK"),
  contentUrl: z.string().optional(),
  sequence: z.number().int().min(0),
  taskData: taskDataSchema.optional(),
});

export const updateTaskContentSchema = baseContentSchema
  .extend({
    type: z.literal("TASK"),
    contentUrl: z.string().optional(),
    taskData: taskDataSchema.optional(),
  })
  .partial()
  .required({ type: true });

// Jadwal Kurikulum Content Schema
export const createJadwalKurikulumContentSchema = baseContentSchema.extend({
  idSection: z.string().uuid("Invalid section ID"),
  type: z.literal("jadwal_kurikulum"),
  contentUrl: z.string().url("URL tidak valid").optional(),
  sequence: z.number().int().min(0),
  // Curriculum schedule fields
  idSchedule: z.string().uuid("Invalid schedule ID").optional(),
  scheduleName: z.string().optional(),
  jp: z.number().int().min(0).optional(),
  scheduleDate: z.string().optional(),
});

export const updateJadwalKurikulumContentSchema = baseContentSchema
  .extend({
    type: z.literal("jadwal_kurikulum"),
    contentUrl: z.string().url("URL tidak valid").optional(),
    // Curriculum schedule fields
    idSchedule: z.string().uuid("Invalid schedule ID").optional(),
    scheduleName: z.string().optional(),
    jp: z.number().int().min(0).optional(),
    scheduleDate: z.string().optional(),
  })
  .partial()
  .required({ type: true });
  // .refine(
  //   (data) =>
  //     data.name !== undefined ||
  //     data.description !== undefined ||
  //     data.contentUrl !== undefined ||
  //     data.idSchedule !== undefined ||
  //     data.scheduleName !== undefined ||
  //     data.jp !== undefined ||
  //     data.scheduleDate !== undefined,
  //   { message: "At least one field must be updated" },
  // );

// Union schemas for all content types
export const createContentSchema = z.discriminatedUnion("type", [
  createVideoContentSchema,
  createLinkContentSchema,
  createPdfContentSchema,
  createScormContentSchema,
  createTaskContentSchema,
  createQuizContentSchema,
  createJadwalKurikulumContentSchema,
]);

export const updateContentSchema = z.discriminatedUnion("type", [
  updateVideoContentSchema,
  updateLinkContentSchema,
  updatePdfContentSchema,
  updateScormContentSchema,
  updateTaskContentSchema,
  updateQuizContentSchema,
  updateJadwalKurikulumContentSchema,
]);

// Type exports
export type CreateVideoContent = z.infer<typeof createVideoContentSchema>;
export type UpdateVideoContent = z.infer<typeof updateVideoContentSchema>;
export type CreateLinkContent = z.infer<typeof createLinkContentSchema>;
export type UpdateLinkContent = z.infer<typeof updateLinkContentSchema>;
export type CreatePdfContent = z.infer<typeof createPdfContentSchema>;
export type UpdatePdfContent = z.infer<typeof updatePdfContentSchema>;
export type CreateScormContent = z.infer<typeof createScormContentSchema>;
export type UpdateScormContent = z.infer<typeof updateScormContentSchema>;
export type CreateTaskContent = z.infer<typeof createTaskContentSchema>;
export type UpdateTaskContent = z.infer<typeof updateTaskContentSchema>;
export type CreateQuizContent = z.infer<typeof createQuizContentSchema>;
export type UpdateQuizContent = z.infer<typeof updateQuizContentSchema>;
export type CreateJadwalKurikulumContent = z.infer<
  typeof createJadwalKurikulumContentSchema
>;
export type UpdateJadwalKurikulumContent = z.infer<
  typeof updateJadwalKurikulumContentSchema
>;

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
