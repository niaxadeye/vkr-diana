import { apiClient } from "@/shared/api/apiClient";
import type { ProductListItem } from "@/entities/product/api/product.api";

type ApiResponse<T> = {
    success: boolean;
    data: T;
};

export type AdminRecommendedProduct = {
    id: string;
    productId: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    product: ProductListItem;
};

export type AddRecommendedProductPayload = {
    productId: string;
    sortOrder?: number;
    isActive?: boolean;
};

export type UpdateRecommendedProductPayload = {
    sortOrder?: number;
    isActive?: boolean;
};

export async function getAdminRecommendedProducts() {
    const response = await apiClient.get<ApiResponse<AdminRecommendedProduct[]>>(
        "/admin/recommended-products",
    );

    return response.data.data;
}

export async function addAdminRecommendedProduct(payload: AddRecommendedProductPayload) {
    const response = await apiClient.post<ApiResponse<AdminRecommendedProduct>>(
        "/admin/recommended-products",
        payload,
    );

    return response.data.data;
}

export async function updateAdminRecommendedProduct(
    id: string,
    payload: UpdateRecommendedProductPayload,
) {
    const response = await apiClient.patch<ApiResponse<AdminRecommendedProduct>>(
        `/admin/recommended-products/${id}`,
        payload,
    );

    return response.data.data;
}

export async function deleteAdminRecommendedProduct(id: string) {
    const response = await apiClient.delete<ApiResponse<AdminRecommendedProduct>>(
        `/admin/recommended-products/${id}`,
    );

    return response.data.data;
}