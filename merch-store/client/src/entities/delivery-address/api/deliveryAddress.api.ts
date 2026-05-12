import { apiClient } from "../../../shared/api/apiClient";
import type {
    CreateDeliveryAddressPayload,
    DeliveryAddress,
    UpdateDeliveryAddressPayload,
} from "../model/deliveryAddress.types";

type ApiResponse<T> = {
    data: T;
    meta?: unknown;
};

export async function getDeliveryAddresses() {
    const response = await apiClient.get<ApiResponse<DeliveryAddress[]>>(
        "/delivery-addresses",
    );

    return response.data.data;
}

export async function createDeliveryAddress(payload: CreateDeliveryAddressPayload) {
    const response = await apiClient.post<ApiResponse<DeliveryAddress>>(
        "/delivery-addresses",
        payload,
    );

    return response.data.data;
}

export async function updateDeliveryAddress(
    id: string,
    payload: UpdateDeliveryAddressPayload,
) {
    const response = await apiClient.patch<ApiResponse<DeliveryAddress>>(
        `/delivery-addresses/${id}`,
        payload,
    );

    return response.data.data;
}

export async function setDefaultDeliveryAddress(id: string) {
    const response = await apiClient.patch<ApiResponse<DeliveryAddress>>(
        `/delivery-addresses/${id}/default`,
    );

    return response.data.data;
}

export async function deleteDeliveryAddress(id: string) {
    const response = await apiClient.delete<ApiResponse<DeliveryAddress>>(
        `/delivery-addresses/${id}`,
    );

    return response.data.data;
}