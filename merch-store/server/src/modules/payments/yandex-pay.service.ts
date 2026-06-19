import { env } from "../../config/env";
import type {
  CreateYandexPayPaymentResult,
  GetYandexPayPaymentStatusResult,
  OrderWithItems,
  YandexPayCartItem,
  YandexPayCreateOrderRequest,
  YandexPayCreateOrderResponse,
  YandexPayGetOrderResponse,
} from "./yandex-pay.types";

class YandexPayError extends Error {
  constructor(
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

function formatRub(value: number) {
  return value.toFixed(2);
}

function buildRedirectUrl(path: string, orderId: string) {
  const url = new URL(path, env.yandexPay.redirectBaseUrl);

  url.searchParams.set("orderId", orderId);

  return url.toString();
}

function buildCartItems(order: OrderWithItems): YandexPayCartItem[] {
  // Скидку по промокоду распределяем пропорционально по товарам, чтобы сумма
  // позиций корзины точно совпала с order.total — иначе Яндекс Пэй отклоняет
  // создание заказа (YANDEX_PAY_CREATE_ORDER_FAILED).
  const discountTotal = order.discountTotal ?? 0;
  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);

  const discountedTotals = order.items.map((item) => {
    if (discountTotal <= 0 || subtotal <= 0) {
      return item.totalPrice;
    }

    const itemDiscount = Math.floor(
      (item.totalPrice * discountTotal) / subtotal,
    );

    return item.totalPrice - itemDiscount;
  });

  // Остаток от округления вычитаем из первой позиции, чтобы итог сошёлся.
  const distributedSum = discountedTotals.reduce((sum, value) => sum + value, 0);
  const targetSum = subtotal - discountTotal;
  const remainder = distributedSum - targetSum;

  if (remainder !== 0 && discountedTotals.length > 0) {
    discountedTotals[0] -= remainder;
  }

  const productItems = order.items.map((item, index) => ({
    productId: item.variantId ?? item.productId,
    title: item.title,
    quantity: {
      count: String(item.quantity),
    },
    total: formatRub(discountedTotals[index]),
  }));

  if (order.deliveryPrice <= 0) {
    return productItems;
  }

  return [
    ...productItems,
    {
      productId: `delivery-${order.deliveryProvider.toLowerCase()}`,
      title: "Доставка",
      quantity: {
        count: "1",
      },
      total: formatRub(order.deliveryPrice),
    },
  ];
}

function buildCreateOrderRequest(order: OrderWithItems): YandexPayCreateOrderRequest {
  return {
    orderId: order.id,
    currencyCode: "RUB",
    availablePaymentMethods: ["CARD"],
    preferredPaymentMethod: "FULLPAYMENT",
    orderSource: "WEBSITE",
    billingPhone: order.customerPhone,
    fiscalContact: order.customerEmail ?? order.customerPhone,
    ttl: env.yandexPay.paymentTtlSeconds,
    purpose: `Оплата заказа #${order.orderNumber}`,
    redirectUrls: {
      onSuccess: buildRedirectUrl("/payment/success", order.id),
      onError: buildRedirectUrl("/payment/error", order.id),
      onAbort: buildRedirectUrl("/payment/abort", order.id),
    },
    cart: {
      externalId: order.id,
      items: buildCartItems(order),
      total: {
        amount: formatRub(order.total),
      },
    },
  };
}

async function createYandexPayOrder(
  order: OrderWithItems,
): Promise<CreateYandexPayPaymentResult> {
  const requestBody = buildCreateOrderRequest(order);
  const response = await fetch(`${env.yandexPay.apiBaseUrl}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${env.yandexPay.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  let responseBody: YandexPayCreateOrderResponse | null = null;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as YandexPayCreateOrderResponse;
    } catch {
      throw new YandexPayError("YANDEX_PAY_INVALID_RESPONSE", {
        status: response.status,
        responseText,
      });
    }
  }

  if (!response.ok || responseBody?.status === "fail") {
    throw new YandexPayError("YANDEX_PAY_CREATE_ORDER_FAILED", {
      status: response.status,
      body: responseBody,
    });
  }

  const paymentUrl = responseBody?.data?.paymentUrl;

  if (!paymentUrl) {
    throw new YandexPayError("YANDEX_PAY_PAYMENT_URL_NOT_FOUND", {
      status: response.status,
      body: responseBody,
    });
  }

  return {
    paymentUrl,
    expiresAt: new Date(Date.now() + env.yandexPay.paymentTtlSeconds * 1000),
  };
}

async function getYandexPayOrderStatus(
  orderId: string,
): Promise<GetYandexPayPaymentStatusResult> {
  const response = await fetch(
    `${env.yandexPay.apiBaseUrl}/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Api-Key ${env.yandexPay.apiKey}`,
      },
    },
  );

  const responseText = await response.text();
  let responseBody: YandexPayGetOrderResponse | null = null;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as YandexPayGetOrderResponse;
    } catch {
      throw new YandexPayError("YANDEX_PAY_INVALID_STATUS_RESPONSE", {
        status: response.status,
        responseText,
      });
    }
  }

  if (!response.ok || responseBody?.status === "fail") {
    throw new YandexPayError("YANDEX_PAY_GET_ORDER_FAILED", {
      status: response.status,
      body: responseBody,
    });
  }

  const paymentStatus =
    responseBody?.data?.order?.paymentStatus ?? responseBody?.data?.paymentStatus;

  if (!paymentStatus) {
    throw new YandexPayError("YANDEX_PAY_PAYMENT_STATUS_NOT_FOUND", {
      status: response.status,
      body: responseBody,
    });
  }

  return {
    paymentStatus,
    paymentUrl:
      responseBody?.data?.order?.paymentUrl ?? responseBody?.data?.paymentUrl,
    reasonCode: responseBody?.data?.order?.reasonCode ?? null,
  };
}

export const yandexPayService = {
  createYandexPayOrder,
  getYandexPayOrderStatus,
};

export type LocalPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export function mapYandexPaymentStatus(
  status: string,
): LocalPaymentStatus {
  switch (status) {
    case "CAPTURED":
    case "AUTHORIZED":
    case "PAID":
      return "PAID";
    case "FAILED":
    case "VOIDED":
      return "FAILED";
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "REFUNDED";
    default:
      return "PENDING";
  }
}

export { YandexPayError };
