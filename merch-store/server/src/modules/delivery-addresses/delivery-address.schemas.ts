import { z } from "zod";

export const deliveryTypeSchema = z.enum(["courier", "cdek_pickup"]);

const optionalString = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) return undefined;
    return value;
  });

export const deliveryAddressSchema = z
  .object({
    title: z.string().trim().min(1, "Название адреса обязательно"),
    fullName: z.string().trim().min(1, "ФИО обязательно"),
    phone: z.string().trim().min(1, "Телефон обязателен"),

    city: z.string().trim().min(1, "Город обязателен"),
    deliveryType: deliveryTypeSchema.default("courier"),

    cdekCityCode: optionalString,
    cdekCityName: optionalString,
    cdekRegion: optionalString,
    cdekCountry: optionalString,

    cdekPvzCode: optionalString,
    cdekPvzName: optionalString,
    cdekPvzAddress: optionalString,
    cdekPvzWorkTime: optionalString,

    street: optionalString,
    house: optionalString,
    apartment: optionalString,
    entrance: optionalString,
    floor: optionalString,
    courierComment: optionalString,

    isDefault: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === "courier") {
      if (!data.street) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["street"],
          message: "Для курьерской доставки укажите улицу",
        });
      }

      if (!data.house) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["house"],
          message: "Для курьерской доставки укажите дом",
        });
      }
    }

    if (data.deliveryType === "cdek_pickup") {
      if (!data.cdekCityCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cdekCityCode"],
          message: "Для доставки в ПВЗ выберите город CDEK",
        });
      }

      if (!data.cdekPvzCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cdekPvzCode"],
          message: "Выберите пункт выдачи CDEK",
        });
      }

      if (!data.cdekPvzAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cdekPvzAddress"],
          message: "Адрес пункта выдачи CDEK обязателен",
        });
      }
    }
  });

export const createDeliveryAddressSchema = deliveryAddressSchema;

export const updateDeliveryAddressSchema = deliveryAddressSchema;

export type DeliveryAddressInput = z.infer<typeof deliveryAddressSchema>;

export type UpdateDeliveryAddressInput = z.infer<
  typeof updateDeliveryAddressSchema
>;