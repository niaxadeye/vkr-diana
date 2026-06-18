import { env } from "../../config/env";
import { orderService } from "../orders/order.service";
import {
  YandexPayError,
  yandexPayService,
  mapYandexPaymentStatus,
} from "./yandex-pay.service";

// Запас сверх TTL ссылки: даём оплате время «долететь» до отмены заказа.
const EXPIRY_GRACE_MS = 5 * 60 * 1000;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

let sweepTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Находит заказы, зависшие в PENDING дольше TTL+grace, перепроверяет их статус
 * в Яндекс Пэй и применяет результат (оплаченные — подтверждаются,
 * неоплаченные — отменяются с возвратом резерва склада).
 */
async function expireStalePendingOrders() {
  const ttlMs = env.yandexPay.paymentTtlSeconds * 1000;
  const olderThan = new Date(Date.now() - ttlMs - EXPIRY_GRACE_MS);

  const staleOrders = await orderService.findStalePendingOrders(olderThan);

  if (staleOrders.length === 0) {
    return { checked: 0, updated: 0 };
  }

  let updated = 0;

  for (const { id } of staleOrders) {
    try {
      const yandexStatus = await yandexPayService.getYandexPayOrderStatus(id);
      const localStatus = mapYandexPaymentStatus(yandexStatus.paymentStatus);

      // PENDING в Яндексе после TTL означает, что оплата не состоялась —
      // трактуем как FAILED, чтобы отменить заказ и вернуть резерв.
      const resolvedStatus = localStatus === "PENDING" ? "FAILED" : localStatus;

      await orderService.applyPaymentResult(id, resolvedStatus);
      updated += 1;
    } catch (error) {
      if (error instanceof YandexPayError) {
        // Заказ не найден в Яндексе или ошибка API — отменяем локально,
        // резерв возвращается.
        try {
          await orderService.applyPaymentResult(id, "FAILED");
          updated += 1;
        } catch (innerError) {
          console.error("EXPIRE_STALE_ORDER_CANCEL_ERROR:", id, innerError);
        }
        continue;
      }

      console.error("EXPIRE_STALE_ORDER_ERROR:", id, error);
    }
  }

  return { checked: staleOrders.length, updated };
}

function startPendingOrdersSweeper() {
  if (sweepTimer || !env.yandexPay.webhookEnabled) {
    return;
  }

  sweepTimer = setInterval(() => {
    void expireStalePendingOrders().catch((error) => {
      console.error("PENDING_ORDERS_SWEEP_ERROR:", error);
    });
  }, SWEEP_INTERVAL_MS);

  // Не держим процесс из-за таймера.
  sweepTimer.unref?.();
}

function stopPendingOrdersSweeper() {
  if (sweepTimer) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
}

export const pendingOrdersSweeper = {
  expireStalePendingOrders,
  startPendingOrdersSweeper,
  stopPendingOrdersSweeper,
};
