import { z } from "zod";

export const deliveryAddressSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Название адреса обязательно")
    .max(100, "Название адреса слишком длинное"),

  fullName: z
    .string()
    .trim()
    .min(2, "ФИО обязательно")
    .max(150, "ФИО слишком длинное"),

  phone: z
    .string()
    .trim()
    .min(7, "Телефон обязателен")
    .max(30, "Телефон слишком длинный"),

  city: z
    .string()
    .trim()
    .min(2, "Город обязателен")
    .max(100, "Город слишком длинный"),

  deliveryType: z
    .literal("courier")
    .default("courier"),

  street: z
    .string()
    .trim()
    .min(1, "Улица обязательна")
    .max(150, "Улица слишком длинная"),

  house: z
    .string()
    .trim()
    .min(1, "Дом обязателен")
    .max(30, "Дом слишком длинный"),

  apartment: z
    .string()
    .trim()
    .max(30, "Квартира/офис слишком длинные")
    .optional()
    .nullable(),

  entrance: z
    .string()
    .trim()
    .max(30, "Подъезд слишком длинный")
    .optional()
    .nullable(),

  floor: z
    .string()
    .trim()
    .max(30, "Этаж слишком длинный")
    .optional()
    .nullable(),

  courierComment: z
    .string()
    .trim()
    .max(500, "Комментарий слишком длинный")
    .optional()
    .nullable(),

  isDefault: z.boolean().optional(),
});

export const updateDeliveryAddressSchema = deliveryAddressSchema.partial();

export type DeliveryAddressInput = z.infer<typeof deliveryAddressSchema>;
export type UpdateDeliveryAddressInput = z.infer<typeof updateDeliveryAddressSchema>;