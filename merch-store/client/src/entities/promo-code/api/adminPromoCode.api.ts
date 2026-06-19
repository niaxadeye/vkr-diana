import { apiClient } from "@/shared/api/apiClient";
import type {
  PromoCode,
  PromoCodePayload,
} from "../model/promo-code.types";

type ApiResponse<T> = {
  data: T;
};

export async function getAdminPromoCodes() {
  const response = await apiClient.get<ApiResponse<PromoCode[]>>(
    "/admin/promo-codes",
    { params: { limit: 100 } },
  );

  return response.data.data;
}

export async function getAdminPromoCodeById(id: string) {
  const response = await apiClient.get<ApiResponse<PromoCode>>(
    `/admin/promo-codes/${id}`,
  );

  return response.data.data;
}

export async function createAdminPromoCode(payload: PromoCodePayload) {
  const response = await apiClient.post<ApiResponse<PromoCode>>(
    "/admin/promo-codes",
    payload,
  );

  return response.data.data;
}

export async function updateAdminPromoCode(
  id: string,
  payload: Partial<PromoCodePayload>,
) {
  const response = await apiClient.patch<ApiResponse<PromoCode>>(
    `/admin/promo-codes/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteAdminPromoCode(id: string) {
  const response = await apiClient.delete<ApiResponse<PromoCode>>(
    `/admin/promo-codes/${id}`,
  );

  return response.data.data;
}
