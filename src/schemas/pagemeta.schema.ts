import z from "zod";

export const pagemetaSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100),
  hasPrev: z.boolean(),
  hasNext: z.boolean(),
  totalPageCount: z.number().int(),
  showingFrom: z.number().int().nullable(),
  showingTo: z.number().int().nullable(),
  resultCount: z.number().int(),
  totalResultCount: z.number().int(),
});
