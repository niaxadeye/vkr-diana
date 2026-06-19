import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import {
  createPromoCodeSchema,
  promoCodeQuerySchema,
  updatePromoCodeSchema,
  validatePromoSchema,
} from "./promo-code.schemas";
import { promoCodeService, type PromoValidationResult } from "./promo-code.service";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const PROMO_REASON_MESSAGES: Record<
  Extract<PromoValidationResult, { ok: false }>["reason"],
  string
> = {
  PROMO_NOT_FOUND: "Промокод не найден",
  PROMO_INACTIVE: "Промокод недоступен",
  PROMO_NOT_STARTED: "Промокод ещё не действует",
  PROMO_EXPIRED: "Срок действия промокода истёк",
  PROMO_USAGE_LIMIT_REACHED: "Лимит использований промокода исчерпан",
  PROMO_MIN_ORDER_NOT_MET: "Сумма заказа меньше минимальной для этого промокода",
};

export const promoCodeController = {
  async validate(req: Request, res: Response) {
    const parsed = validatePromoSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные",
        parsed.error.issues,
      );
    }

    try {
      const result = await promoCodeService.validate(
        parsed.data.code,
        parsed.data.subtotal,
      );

      if (!result.ok) {
        return fail(
          res,
          400,
          result.reason,
          PROMO_REASON_MESSAGES[result.reason],
          result.reason === "PROMO_MIN_ORDER_NOT_MET" && result.minOrderAmount
            ? [{ minOrderAmount: result.minOrderAmount }]
            : [],
        );
      }

      return success(res, {
        code: result.promoCode.code,
        discountPercent: result.promoCode.discountPercent,
        discountAmount: result.discountAmount,
      });
    } catch (error) {
      console.error("VALIDATE_PROMO_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось проверить промокод");
    }
  },

  async getAdminPromoCodes(req: Request, res: Response) {
    const parsed = promoCodeQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return fail(res, 400, "VALIDATION_ERROR", "Некорректные параметры");
    }

    const result = await promoCodeService.getPromoCodes(parsed.data);

    return success(res, result.items, result.meta);
  },

  async getAdminPromoCodeById(req: Request, res: Response) {
    const id = getParam(req.params.id);

    if (!id) {
      return fail(res, 400, "BAD_REQUEST", "ID промокода не передан");
    }

    const promo = await promoCodeService.getById(id);

    if (!promo) {
      return fail(res, 404, "PROMO_NOT_FOUND", "Промокод не найден");
    }

    return success(res, promo);
  },

  async createPromoCode(req: Request, res: Response) {
    const parsed = createPromoCodeSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные промокода",
        parsed.error.issues,
      );
    }

    try {
      const promo = await promoCodeService.create(parsed.data);
      return success(res, promo);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return fail(res, 409, "PROMO_CODE_EXISTS", "Такой промокод уже существует");
      }

      console.error("CREATE_PROMO_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось создать промокод");
    }
  },

  async updatePromoCode(req: Request, res: Response) {
    const id = getParam(req.params.id);

    if (!id) {
      return fail(res, 400, "BAD_REQUEST", "ID промокода не передан");
    }

    const parsed = updatePromoCodeSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные промокода",
        parsed.error.issues,
      );
    }

    try {
      const promo = await promoCodeService.update(id, parsed.data);
      return success(res, promo);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return fail(res, 409, "PROMO_CODE_EXISTS", "Такой промокод уже существует");
      }

      console.error("UPDATE_PROMO_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось обновить промокод");
    }
  },

  async deletePromoCode(req: Request, res: Response) {
    const id = getParam(req.params.id);

    if (!id) {
      return fail(res, 400, "BAD_REQUEST", "ID промокода не передан");
    }

    try {
      const promo = await promoCodeService.remove(id);
      return success(res, promo);
    } catch (error) {
      console.error("DELETE_PROMO_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось удалить промокод");
    }
  },
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
