import { z } from "zod";

export const productVariantSchema = z.object({
  size: z.string().min(1),
  color: z.string().optional().nullable(),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
  reservedStock: z.number().int().min(0).optional(),
  priceOverride: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),

  weightGram: z.number().int().min(1).optional().nullable(),
  lengthCm: z.number().int().min(1).optional().nullable(),
  widthCm: z.number().int().min(1).optional().nullable(),
  heightCm: z.number().int().min(1).optional().nullable(),
});

export const productImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const createProductSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(1),
  shortDescription: z.string().optional().nullable(),
  price: z.number().int().min(0),
  oldPrice: z.number().int().min(0).optional().nullable(),
  hasVariants: z.boolean().default(true),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  categoryId: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),

  weightGram: z.number().int().min(1).default(100),
  lengthCm: z.number().int().min(1).default(10),
  widthCm: z.number().int().min(1).default(10),
  heightCm: z.number().int().min(1).default(3),

  images: z.array(productImageSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});