import type { Request, Response } from "express";

import { env } from "../../config/env";
import { fail, success } from "../../utils/api-response";
import { orderService } from "../orders/order.service";
import { createYandexPaymentSchema } from "./payments.schemas";
import {
  YandexPayError,
  yandexPayService,
  mapYandexPaymentStatus,
} from "./yandex-pay.service";
import {
  YandexWebhookError,
  yandexWebhookService,
} from "./yandex-webhook.service";

function getUserId(req: Request) {
  return req.user?.userId;
}

async function cancelOrderAfterPaymentInitFailure(orderId: string) {
  try {
    await orderService.applyPaymentResult(orderId, "FAILED");
  } catch (error) {
    console.error("CANCEL_ORDER_AFTER_YANDEX_PAY_ERROR:", error);
  }
}

async function syncLocalPaymentStatus(orderId: string) {
  const yandexStatus = await yandexPayService.getYandexPayOrderStatus(orderId);
  const localPaymentStatus = mapYandexPaymentStatus(yandexStatus.paymentStatus);
  const order = await orderService.applyPaymentResult(orderId, localPaymentStatus);

  return {
    order,
    yandexPaymentStatus: yandexStatus.paymentStatus,
    paymentStatus: localPaymentStatus,
    paymentUrl: yandexStatus.paymentUrl,
    reasonCode: yandexStatus.reasonCode,
  };
}

export const paymentsController = {
  async createYandexPayment(req: Request, res: Response) {
    const parsed = createYandexPaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные платежа",
        parsed.error.issues,
      );
    }

    const userId = getUserId(req);

    if (!userId) {
      return fail(res, 401, "UNAUTHORIZED", "Пользователь не авторизован");
    }

    let order: Awaited<ReturnType<typeof orderService.createOrder>> | null = null;

    try {
      order = await orderService.createOrder({
        userId,
        data: parsed.data,
      });

      const payment = await yandexPayService.createYandexPayOrder(order);

      const updatedOrder = await orderService.savePaymentLink(
        order.id,
        payment.paymentUrl,
        payment.expiresAt,
      );

      return success(res, {
        order: updatedOrder,
        paymentUrl: payment.paymentUrl,
        paymentUrlExpiresAt: payment.expiresAt,
      });
    } catch (error) {
      console.error("CREATE_YANDEX_PAYMENT_ERROR:", error);

      if (order) {
        await cancelOrderAfterPaymentInitFailure(order.id);
      }

      if (error instanceof YandexPayError) {
        return fail(
          res,
          502,
          error.message,
          "Не удалось создать ссылку на оплату в Яндекс Пэй",
        );
      }

      if (error instanceof Error) {
        switch (error.message) {
          case "ORDER_VARIANT_NOT_FOUND":
          case "ORDER_PRODUCT_VARIANT_MISMATCH":
          case "ORDER_PRODUCT_NOT_ACTIVE":
          case "ORDER_VARIANT_NOT_ACTIVE":
          case "ORDER_NOT_ENOUGH_STOCK":
          case "ORDER_PROMO_INVALID":
            return fail(
              res,
              400,
              error.message,
              "Не удалось создать заказ для оплаты",
            );
        }
      }

      return fail(res, 500, "SERVER_ERROR", "Не удалось создать платеж");
    }
  },

  async createYandexPaymentForExistingOrder(req: Request, res: Response) {
    const userId = getUserId(req);
    const orderId = String(req.params.orderId);

    if (!userId) {
      return fail(res, 401, "UNAUTHORIZED", "Пользователь не авторизован");
    }

    try {
      const order = await orderService.getOrderById(userId, orderId);

      if (!order) {
        return fail(res, 404, "ORDER_NOT_FOUND", "Заказ не найден");
      }

      if (order.paymentStatus === "PAID") {
        return fail(res, 400, "ORDER_ALREADY_PAID", "Заказ уже оплачен");
      }

      if (order.status === "CANCELLED") {
        return fail(res, 400, "ORDER_CANCELLED", "Отменённый заказ нельзя оплатить");
      }

      // Переиспользуем уже выданную ссылку, пока она не истекла,
      // чтобы не плодить лишние платежи в Яндексе.
      const now = Date.now();
      const hasLiveLink =
        order.paymentUrl &&
        order.paymentUrlExpiresAt &&
        new Date(order.paymentUrlExpiresAt).getTime() > now;

      if (hasLiveLink) {
        return success(res, {
          order,
          paymentUrl: order.paymentUrl,
          paymentUrlExpiresAt: order.paymentUrlExpiresAt,
        });
      }

      const payment = await yandexPayService.createYandexPayOrder(order);

      const updatedOrder = await orderService.savePaymentLink(
        order.id,
        payment.paymentUrl,
        payment.expiresAt,
      );

      return success(res, {
        order: updatedOrder,
        paymentUrl: payment.paymentUrl,
        paymentUrlExpiresAt: payment.expiresAt,
      });
    } catch (error) {
      console.error("CREATE_EXISTING_YANDEX_PAYMENT_ERROR:", error);

      if (error instanceof YandexPayError) {
        return fail(
          res,
          502,
          error.message,
          "Не удалось получить ссылку на оплату в Яндекс Пэй",
        );
      }

      return fail(res, 500, "SERVER_ERROR", "Не удалось создать платеж");
    }
  },

  async syncYandexPaymentStatus(req: Request, res: Response) {
    const userId = getUserId(req);
    const orderId = String(req.params.orderId);

    if (!userId) {
      return fail(res, 401, "UNAUTHORIZED", "Пользователь не авторизован");
    }

    try {
      const order = await orderService.getOrderById(userId, orderId);

      if (!order) {
        return fail(res, 404, "ORDER_NOT_FOUND", "Заказ не найден");
      }

      const synced = await syncLocalPaymentStatus(orderId);

      return success(res, synced);
    } catch (error) {
      console.error("SYNC_YANDEX_PAYMENT_STATUS_ERROR:", error);

      if (error instanceof YandexPayError) {
        return fail(
          res,
          502,
          error.message,
          "Не удалось получить статус оплаты из Яндекс Пэй",
        );
      }

      return fail(res, 500, "SERVER_ERROR", "Не удалось обновить статус оплаты");
    }
  },

  /**
   * Вебхук Яндекс Пэй. Тело приходит как application/octet-stream (raw Buffer),
   * содержит JWT (ES256). Эндпоинт регистрируется как <CallbackURL>/v1/webhook.
   * Всегда отвечаем 200 {status:"success"} при успешной обработке, иначе Яндекс
   * будет ретраить уведомление.
   */
  async handleYandexWebhook(req: Request, res: Response) {
    if (!env.yandexPay.webhookEnabled) {
      return res.status(200).json({ status: "success" });
    }

    let payload: Awaited<
      ReturnType<typeof yandexWebhookService.verifyAndDecode>
    >;

    try {
      const rawBody = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(typeof req.body === "string" ? req.body : "");

      payload = await yandexWebhookService.verifyAndDecode(rawBody);
    } catch (error) {
      if (error instanceof YandexWebhookError) {
        console.error("YANDEX_WEBHOOK_VERIFY_ERROR:", error.reasonCode, error.message);
        return res.status(error.statusCode).json({
          status: "fail",
          reasonCode: error.reasonCode,
        });
      }

      console.error("YANDEX_WEBHOOK_UNKNOWN_VERIFY_ERROR:", error);
      return res.status(400).json({ status: "fail", reasonCode: "UNAUTHORIZED" });
    }

    try {
      const orderId =
        payload.order?.orderId ?? payload.operation?.orderId ?? null;
      const yandexStatus =
        payload.order?.paymentStatus ?? payload.operation?.status ?? null;

      // События, которые не несут статус оплаты по заказу, просто подтверждаем.
      if (!orderId || !yandexStatus) {
        return res.status(200).json({ status: "success" });
      }

      const localStatus = mapYandexPaymentStatus(yandexStatus);

      await orderService.applyPaymentResult(orderId, localStatus);

      return res.status(200).json({ status: "success" });
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        return res.status(400).json({
          status: "fail",
          reasonCode: "ORDER_NOT_FOUND",
        });
      }

      // Внутренняя ошибка — отвечаем не-200, чтобы Яндекс повторил уведомление.
      console.error("YANDEX_WEBHOOK_PROCESS_ERROR:", error);
      return res.status(500).json({ status: "fail", reasonCode: "INTERNAL_ERROR" });
    }
  },
};
