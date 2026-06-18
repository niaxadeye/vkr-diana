import type { Order, OrderItem } from "@prisma/client";

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export type YandexPayCartItem = {
  productId: string;
  title: string;
  quantity: {
    count: string;
  };
  total: string;
};

export type YandexPayCreateOrderRequest = {
  orderId: string;
  currencyCode: "RUB";
  availablePaymentMethods: ["CARD"];
  preferredPaymentMethod: "FULLPAYMENT";
  orderSource: "WEBSITE";
  billingPhone: string;
  fiscalContact: string;
  ttl: number;
  purpose: string;
  redirectUrls: {
    onSuccess: string;
    onError: string;
    onAbort: string;
  };
  cart: {
    externalId: string;
    items: YandexPayCartItem[];
    total: {
      amount: string;
    };
  };
};

export type YandexPayCreateOrderResponse = {
  status: "success" | "fail";
  data?: {
    paymentUrl?: string;
  };
  reason?: string;
  reasonCode?: string;
};

export type YandexPayOrderStatus =
  | "PENDING"
  | "CAPTURED"
  | "AUTHORIZED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "VOIDED"
  | string;

export type YandexPayGetOrderResponse = {
  status: "success" | "fail";
  data?: {
    order?: {
      orderId?: string;
      paymentStatus?: YandexPayOrderStatus;
      paymentUrl?: string;
      reasonCode?: string | null;
    };
    paymentStatus?: YandexPayOrderStatus;
    paymentUrl?: string;
  };
  reason?: string;
  reasonCode?: string;
};

export type CreateYandexPayPaymentResult = {
  paymentUrl: string;
};

export type GetYandexPayPaymentStatusResult = {
  paymentStatus: YandexPayOrderStatus;
  paymentUrl?: string;
  reasonCode?: string | null;
};
