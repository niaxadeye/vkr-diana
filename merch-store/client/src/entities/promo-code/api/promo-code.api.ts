import { apiClient } from "@/shared/api/apiClient";
import type { ValidatePromoResult } from "../model/promo-code.types";

type ApiResponse<T> = {
  data: T;
};

export async function validatePromoCode(code: string, subtotal: number) {
  const response = await apiClient.post<ApiResponse<ValidatePromoResult>>(
    "/promo-codes/validate",
    { code, subtotal },
  );

  return response.data.data;
}
