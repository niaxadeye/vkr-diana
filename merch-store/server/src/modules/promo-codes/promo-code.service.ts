import type { Prisma, PromoCode } from "@prisma/client";

import { prisma } from "../../prisma/prisma";

type PromoCodeQuery = {
  search?: string;
  isActive?: boolean;
  page: number;
  limit: number;
};

type CreatePromoCodeData = {
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  usageLimit?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  isActive: boolean;
};

type UpdatePromoCodeData = Partial<CreatePromoCodeData>;

export type PromoValidationResult =
  | {
      ok: true;
      promoCode: PromoCode;
      discountAmount: number;
    }
  | {
      ok: false;
      reason:
        | "PROMO_NOT_FOUND"
        | "PROMO_INACTIVE"
        | "PROMO_NOT_STARTED"
        | "PROMO_EXPIRED"
        | "PROMO_USAGE_LIMIT_REACHED"
        | "PROMO_MIN_ORDER_NOT_MET";
      minOrderAmount?: number;
    };

function computeDiscount(subtotal: number, discountPercent: number) {
  // Скидка считается от суммы товаров, округляем вниз до целых рублей.
  return Math.floor((subtotal * discountPercent) / 100);
}

/**
 * Чистая проверка промокода против суммы товаров.
 * Принимает готовую запись промокода (например, найденную внутри транзакции),
 * чтобы переиспользоваться и в публичном эндпоинте, и при создании заказа.
 */
export function evaluatePromoCode(
  promo: PromoCode | null,
  subtotal: number,
  now: Date = new Date(),
): PromoValidationResult {
  if (!promo) {
    return { ok: false, reason: "PROMO_NOT_FOUND" };
  }

  if (!promo.isActive) {
    return { ok: false, reason: "PROMO_INACTIVE" };
  }

  if (promo.startsAt && promo.startsAt > now) {
    return { ok: false, reason: "PROMO_NOT_STARTED" };
  }

  if (promo.endsAt && promo.endsAt < now) {
    return { ok: false, reason: "PROMO_EXPIRED" };
  }

  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return { ok: false, reason: "PROMO_USAGE_LIMIT_REACHED" };
  }

  if (subtotal < promo.minOrderAmount) {
    return {
      ok: false,
      reason: "PROMO_MIN_ORDER_NOT_MET",
      minOrderAmount: promo.minOrderAmount,
    };
  }

  return {
    ok: true,
    promoCode: promo,
    discountAmount: computeDiscount(subtotal, promo.discountPercent),
  };
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export const promoCodeService = {
  async validate(code: string, subtotal: number): Promise<PromoValidationResult> {
    const promo = await prisma.promoCode.findUnique({
      where: { code: normalizeCode(code) },
    });

    return evaluatePromoCode(promo, subtotal);
  },

  async getPromoCodes(query: PromoCodeQuery) {
    const where: Prisma.PromoCodeWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            code: {
              contains: normalizeCode(query.search),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.promoCode.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  },

  async getById(id: string) {
    return prisma.promoCode.findUnique({ where: { id } });
  },

  async create(data: CreatePromoCodeData) {
    return prisma.promoCode.create({
      data: {
        ...data,
        code: normalizeCode(data.code),
      },
    });
  },

  async update(id: string, data: UpdatePromoCodeData) {
    return prisma.promoCode.update({
      where: { id },
      data: {
        ...data,
        ...(data.code ? { code: normalizeCode(data.code) } : {}),
      },
    });
  },

  async remove(id: string) {
    return prisma.promoCode.delete({ where: { id } });
  },
};
