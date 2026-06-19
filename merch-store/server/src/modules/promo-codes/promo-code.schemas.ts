import { z } from "zod";

export const createPromoCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Код слишком короткий")
    .max(40, "Код слишком длинный")
    .transform((value) => value.toUpperCase()),
  discountPercent: z.coerce.number().int().min(1).max(100),
  minOrderAmount: z.coerce.number().int().min(0).default(0),
  usageLimit: z.coerce.number().int().min(1).optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updatePromoCodeSchema = createPromoCodeSchema.partial();

export const promoCodeQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const validatePromoSchema = z.object({
  code: z.string().trim().min(1, "Введите промокод"),
  subtotal: z.coerce.number().int().min(0),
});
