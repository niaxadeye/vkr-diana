import { apiClient } from "@/shared/api/apiClient";
import type { ProductListItem } from "@/entities/product/api/product.api";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function getRecommendedProducts() {
  const response = await apiClient.get<ApiResponse<ProductListItem[]>>(
    "/recommended-products",
  );

  return response.data.data;
}