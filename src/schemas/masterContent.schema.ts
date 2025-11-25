import { z } from "zod";
import { pagemetaSchema } from "./pagemeta.schema";

// Master Content Types
export const masterContentTypeEnum = z.enum([
  "VIDEO",
  "PDF",
  "QUIZ",
  "TASK",
  "LINK",
  "SCORM",
]);

// Base Master Content Schema
export const masterContentSchema = z.object({
  id: z.string().uuid("Invalid master content ID format"),
  type: masterContentTypeEnum,
  contentUrl: z.string(),
  name: z.string().min(3, {
    message: "Nama content minimal 3 karakter",
  }),
  description: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type MasterContentSchema = z.infer<typeof masterContentSchema>;

// Master Content Get Response Schema
export const masterContentGetResponseSchema = z.object({
  data: z.array(masterContentSchema),
  pageMeta: pagemetaSchema,
});

// Base schema for all master content creation
const baseMasterContentSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Nama content minimal 3 karakter",
    })
    .max(200, {
      message: "Nama content maksimal 200 karakter",
    }),
  description: z
    .string()
    .max(1000, {
      message: "Deskripsi maksimal 1000 karakter",
    })
    .optional()
    .or(z.literal("")),
});

// Video Master Content Schema
export const createVideoMasterContentSchema = baseMasterContentSchema.extend({
  type: z.literal("VIDEO"),
  contentUrl: z
    .string()
    .min(1, { message: "URL video harus diisi" })
    .refine(
      (val) => {
        // Allow any non-empty string for uploaded files (R2 URLs)
        // or valid URLs for video links (YouTube, Vimeo, etc.)
        if (!val || val.trim() === "") return false;
        // If it looks like a URL, validate it
        if (val.startsWith("http://") || val.startsWith("https://")) {
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        }
        // Otherwise accept it (for R2 uploaded files)
        return true;
      },
      { message: "Format URL video tidak valid" }
    ),
});

export const updateVideoMasterContentSchema = baseMasterContentSchema
  .extend({
    type: z.literal("VIDEO"),
    contentUrl: z
      .string()
      .min(1, { message: "URL video harus diisi" })
      .refine(
        (val) => {
          if (!val || val.trim() === "") return false;
          if (val.startsWith("http://") || val.startsWith("https://")) {
            try {
              new URL(val);
              return true;
            } catch {
              return false;
            }
          }
          return true;
        },
        { message: "Format URL video tidak valid" }
      )
      .optional(),
  })
  .partial()
  .required({ type: true });

// Link Master Content Schema
export const createLinkMasterContentSchema = baseMasterContentSchema.extend({
  type: z.literal("LINK"),
  contentUrl: z
    .string()
    .min(1, { message: "URL harus diisi" })
    .refine(
      (val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Format URL tidak valid. Pastikan URL dimulai dengan http:// atau https://" }
    ),
});

export const updateLinkMasterContentSchema = baseMasterContentSchema
  .extend({
    type: z.literal("LINK"),
    contentUrl: z
      .string()
      .min(1, { message: "URL harus diisi" })
      .refine(
        (val) => {
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Format URL tidak valid. Pastikan URL dimulai dengan http:// atau https://" }
      )
      .optional(),
  })
  .partial()
  .required({ type: true });

// PDF Master Content Schema
export const createPdfMasterContentSchema = baseMasterContentSchema.extend({
  type: z.literal("PDF"),
  contentUrl: z.string().min(1, { message: "URL dokumen harus diisi" }),
});

export const updatePdfMasterContentSchema = baseMasterContentSchema
  .extend({
    type: z.literal("PDF"),
    contentUrl: z.string().min(1, { message: "URL dokumen harus diisi" }).optional(),
  })
  .partial()
  .required({ type: true });

// SCORM Master Content Schema
export const createScormMasterContentSchema = baseMasterContentSchema.extend({
  type: z.literal("SCORM"),
  contentUrl: z.string().min(1, { message: "URL SCORM package harus diisi" }),
});

export const updateScormMasterContentSchema = baseMasterContentSchema
  .extend({
    type: z.literal("SCORM"),
    contentUrl: z.string().min(1, { message: "URL SCORM package harus diisi" }).optional(),
  })
  .partial()
  .required({ type: true });

// Quiz Master Content Schema
export const createQuizMasterContentSchema = baseMasterContentSchema.extend({
  type: z.literal("QUIZ"),
  contentUrl: z.string().optional().default(""),
});

export const updateQuizMasterContentSchema = baseMasterContentSchema
  .extend({
    type: z.literal("QUIZ"),
    contentUrl: z.string().optional(),
  })
  .partial()
  .required({ type: true });

// Task Master Content Schema
export const createTaskMasterContentSchema = baseMasterContentSchema.extend({
  type: z.literal("TASK"),
  contentUrl: z.string().optional().default(""),
});

export const updateTaskMasterContentSchema = baseMasterContentSchema
  .extend({
    type: z.literal("TASK"),
    contentUrl: z.string().optional(),
  })
  .partial()
  .required({ type: true });

// Union schemas for all master content types
export const createMasterContentSchema = z.discriminatedUnion("type", [
  createVideoMasterContentSchema,
  createLinkMasterContentSchema,
  createPdfMasterContentSchema,
  createScormMasterContentSchema,
  createQuizMasterContentSchema,
  createTaskMasterContentSchema,
]);

export const updateMasterContentSchema = z.discriminatedUnion("type", [
  updateVideoMasterContentSchema,
  updateLinkMasterContentSchema,
  updatePdfMasterContentSchema,
  updateScormMasterContentSchema,
  updateQuizMasterContentSchema,
  updateTaskMasterContentSchema,
]);

// Type exports
export type CreateVideoMasterContent = z.infer<typeof createVideoMasterContentSchema>;
export type UpdateVideoMasterContent = z.infer<typeof updateVideoMasterContentSchema>;
export type CreateLinkMasterContent = z.infer<typeof createLinkMasterContentSchema>;
export type UpdateLinkMasterContent = z.infer<typeof updateLinkMasterContentSchema>;
export type CreatePdfMasterContent = z.infer<typeof createPdfMasterContentSchema>;
export type UpdatePdfMasterContent = z.infer<typeof updatePdfMasterContentSchema>;
export type CreateScormMasterContent = z.infer<typeof createScormMasterContentSchema>;
export type UpdateScormMasterContent = z.infer<typeof updateScormMasterContentSchema>;
export type CreateQuizMasterContent = z.infer<typeof createQuizMasterContentSchema>;
export type UpdateQuizMasterContent = z.infer<typeof updateQuizMasterContentSchema>;
export type CreateTaskMasterContent = z.infer<typeof createTaskMasterContentSchema>;
export type UpdateTaskMasterContent = z.infer<typeof updateTaskMasterContentSchema>;

export type CreateMasterContentInput = z.infer<typeof createMasterContentSchema>;
export type UpdateMasterContentInput = z.infer<typeof updateMasterContentSchema>;

// Validation helper functions
export const validateCreateMasterContent = (data: unknown) => {
  try {
    const result = createMasterContentSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    return { success: false, error: new Error("Unknown validation error") };
  }
};

export const validateUpdateMasterContent = (data: unknown) => {
  try {
    const result = updateMasterContentSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    return { success: false, error: new Error("Unknown validation error") };
  }
};

// Error formatter for form validation
export const formatZodError = (error: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    formattedErrors[path] = issue.message;
  });

  return formattedErrors;
};
