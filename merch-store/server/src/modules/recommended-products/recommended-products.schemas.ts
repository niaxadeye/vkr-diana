import { z } from "zod";

export const addRecommendedProductSchema = z.object({
  productId: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
  isActive: z.boolean().default(true),
});

export const updateRecommendedProductSchema = z.object({
  sortOrder: z.coerce.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
});

export type AddRecommendedProductInput = z.infer<typeof addRecommendedProductSchema>;
export type UpdateRecommendedProductInput = z.infer<typeof updateRecommendedProductSchema>;