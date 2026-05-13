import { z } from "zod";

export const informationSlugSchema = z.enum([
  "payment",
  "delivery",
  "return",
  "security",
  "privacy",
  "terms",
]);

export type InformationSlug = z.infer<typeof informationSlugSchema>;

export const updateInformationPageSchema = z.object({
  title: z.string().min(2, "Название должно быть не короче 2 символов").max(120).optional(),
  content: z.string().max(100_000, "Слишком большой текст страницы").optional(),
  sortOrder: z.coerce.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
});