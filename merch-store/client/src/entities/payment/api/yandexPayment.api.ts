import { apiClient } from "@/shared/api/apiClient";
import type { CreateOrderPayload, Order, PaymentStatus } from "@/entities/order/model/order.types";

export type CreateYandexPaymentResponse = {
  order: Order;
  paymentUrl: string;
  paymentUrlExpiresAt?: string | null;
};

export type SyncYandexPaymentResponse = {
  order: Order;
  yandexPaymentStatus: string;
  paymentStatus: PaymentStatus;
  paymentUrl?: string;
  reasonCode?: string | null;
};

type ApiResponse<T> = {
  data: T;
};

export async function createYandexPayment(payload: CreateOrderPayload) {
  const response = await apiClient.post<ApiResponse<CreateYandexPaymentResponse>>(
    "/payments/yandex/create",
    payload,
  );

  return response.data.data;
}

export async function createYandexPaymentForExistingOrder(orderId: string) {
  const response = await apiClient.post<ApiResponse<CreateYandexPaymentResponse>>(
    `/payments/yandex/orders/${orderId}/pay`,
  );

  return response.data.data;
}

export async function syncYandexPaymentStatus(orderId: string) {
  const response = await apiClient.post<ApiResponse<SyncYandexPaymentResponse>>(
    `/payments/yandex/orders/${orderId}/sync`,
  );

  return response.data.data;
}
