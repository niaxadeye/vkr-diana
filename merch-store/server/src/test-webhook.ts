import assert from "node:assert";
import jwt from "jsonwebtoken";

import { mapYandexPaymentStatus } from "./modules/payments/yandex-pay.service";
import { yandexWebhookService } from "./modules/payments/yandex-webhook.service";

async function run() {
  // 1. Маппинг статусов Яндекса в локальные.
  assert.equal(mapYandexPaymentStatus("CAPTURED"), "PAID");
  assert.equal(mapYandexPaymentStatus("AUTHORIZED"), "PAID");
  assert.equal(mapYandexPaymentStatus("PAID"), "PAID");
  assert.equal(mapYandexPaymentStatus("FAILED"), "FAILED");
  assert.equal(mapYandexPaymentStatus("VOIDED"), "FAILED");
  assert.equal(mapYandexPaymentStatus("REFUNDED"), "REFUNDED");
  assert.equal(mapYandexPaymentStatus("PARTIALLY_REFUNDED"), "REFUNDED");
  assert.equal(mapYandexPaymentStatus("PENDING"), "PENDING");
  assert.equal(mapYandexPaymentStatus("WHATEVER"), "PENDING");
  console.log("[ok] mapYandexPaymentStatus");

  // 2. Декодирование вебхука в sandbox-режиме (подпись не проверяется строго).
  const token = jwt.sign(
    {
      event: "ORDER_STATUS_UPDATED",
      eventTime: "2026-06-18T10:00:00Z",
      order: {
        orderId: "order_test_123",
        paymentStatus: "CAPTURED",
      },
    },
    "any-secret-sandbox-ignores-it",
  );

  const rawBody = Buffer.from(token, "utf8");
  const payload = await yandexWebhookService.verifyAndDecode(rawBody);

  assert.equal(payload.event, "ORDER_STATUS_UPDATED");
  assert.equal(payload.order?.orderId, "order_test_123");
  assert.equal(payload.order?.paymentStatus, "CAPTURED");
  assert.equal(mapYandexPaymentStatus(payload.order!.paymentStatus!), "PAID");
  console.log("[ok] verifyAndDecode (ORDER_STATUS_UPDATED)");

  // 3. Операция возврата.
  const refundToken = jwt.sign(
    {
      event: "OPERATION_STATUS_UPDATED",
      operation: {
        operationId: "op_1",
        operationType: "REFUND",
        status: "REFUNDED",
        orderId: "order_test_123",
      },
    },
    "secret",
  );

  const refundPayload = await yandexWebhookService.verifyAndDecode(
    Buffer.from(refundToken, "utf8"),
  );
  assert.equal(refundPayload.operation?.orderId, "order_test_123");
  console.log("[ok] verifyAndDecode (OPERATION_STATUS_UPDATED)");

  // 4. Пустое тело отклоняется.
  await assert.rejects(
    () => yandexWebhookService.verifyAndDecode(Buffer.from("", "utf8")),
    /EMPTY_BODY/,
  );
  console.log("[ok] empty body rejected");

  console.log("\nAll webhook tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
