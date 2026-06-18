import { Router, raw } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { paymentsController } from "./payments.controller";

export const paymentsRouter = Router();

// Вебхук Яндекс Пэй: тело приходит как application/octet-stream (JWT).
// raw-парсер нужен ДО общего express.json, поэтому ставим его прямо на роуте.
// Эндпоинт публичный (без authMiddleware) — аутентификация через подпись JWT.
paymentsRouter.post(
  "/yandex/v1/webhook",
  raw({ type: () => true, limit: "1mb" }),
  paymentsController.handleYandexWebhook,
);

paymentsRouter.post(
  "/yandex/create",
  authMiddleware,
  paymentsController.createYandexPayment,
);

paymentsRouter.post(
  "/yandex/orders/:orderId/pay",
  authMiddleware,
  paymentsController.createYandexPaymentForExistingOrder,
);

paymentsRouter.post(
  "/yandex/orders/:orderId/sync",
  authMiddleware,
  paymentsController.syncYandexPaymentStatus,
);
