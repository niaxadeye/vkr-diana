import { z } from "zod";

export const createOrderSchema = z.object({
    customer: z.object({
        fullName: z.string().trim().min(2),
        phone: z.string().trim().min(7),
        email: z.string().trim().email().optional().nullable(),
    }),

    deliveryAddress: z.object({
        city: z.string().trim().min(2),
        street: z.string().trim().min(1),
        house: z.string().trim().min(1),
        apartment: z.string().trim().optional().nullable(),
        entrance: z.string().trim().optional().nullable(),
        floor: z.string().trim().optional().nullable(),
        courierComment: z.string().trim().optional().nullable(),
    }),

    delivery: z.object({
        provider: z.enum(["CUSTOM", "CDEK"]).default("CUSTOM"),
        method: z.enum(["COURIER", "PICKUP_POINT"]).default("COURIER"),
        tariffCode: z.string().trim().optional().nullable(),
        price: z.number().int().min(0).default(0),

        cdekCityCode: z.string().trim().optional().nullable(),
        cdekPvzCode: z.string().trim().optional().nullable(),
    }),

    items: z
        .array(
            z.object({
                productId: z.string().min(1),
                variantId: z.string().min(1),
                quantity: z.number().int().min(1).max(99),
            }),
        )
        .min(1),

    promoCode: z.string().trim().optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const adminOrderQuerySchema = z.object({
    search: z.string().trim().optional(),

    status: z
        .enum([
            "CREATED",
            "CONFIRMED",
            "ASSEMBLING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ])
        .optional(),

    paymentStatus: z
        .enum(["PENDING", "PAID", "FAILED", "REFUNDED"])
        .optional(),

    deliveryProvider: z.enum(["CUSTOM", "CDEK"]).optional(),

    deliveryMethod: z.enum(["COURIER", "PICKUP_POINT"]).optional(),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "CREATED",
        "CONFIRMED",
        "ASSEMBLING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ]),
});

export const updatePaymentStatusSchema = z.object({
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
});

export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;