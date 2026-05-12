import { apiClient } from "@/shared/api/apiClient";
import type {
    AdminOrderQuery,
    AdminOrdersResponse,
    CreateOrderPayload,
    Order,
    UpdateOrderStatusPayload,
    UpdatePaymentStatusPayload,
} from "../model/order.types";

type ApiResponse<T, M = unknown> = {
    data: T;
    meta?: M;
};

function buildAdminOrderParams(query: AdminOrderQuery = {}) {
    const params = new URLSearchParams();

    if (query.search) {
        params.set("search", query.search);
    }

    if (query.status) {
        params.set("status", query.status);
    }

    if (query.paymentStatus) {
        params.set("paymentStatus", query.paymentStatus);
    }

    if (query.deliveryProvider) {
        params.set("deliveryProvider", query.deliveryProvider);
    }

    if (query.deliveryMethod) {
        params.set("deliveryMethod", query.deliveryMethod);
    }

    if (query.page) {
        params.set("page", String(query.page));
    }

    if (query.limit) {
        params.set("limit", String(query.limit));
    }

    return params;
}

export async function createOrder(payload: CreateOrderPayload) {
    const response = await apiClient.post<ApiResponse<Order>>(
        "/orders",
        payload,
    );

    return response.data.data;
}

export async function getMyOrders() {
    const response = await apiClient.get<ApiResponse<Order[]>>("/orders/my");

    return response.data.data;
}

export async function getOrderById(id: string) {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);

    return response.data.data;
}

export async function getAdminOrders(query: AdminOrderQuery = {}) {
    const params = buildAdminOrderParams(query);

    const url = params.toString()
        ? `/admin/orders?${params.toString()}`
        : "/admin/orders";

    const response = await apiClient.get<
        ApiResponse<Order[], AdminOrdersResponse["meta"]>
    >(url);

    return {
        items: response.data.data,
        meta: response.data.meta,
    };
}

export async function getAdminOrderById(id: string) {
    const response = await apiClient.get<ApiResponse<Order>>(
        `/admin/orders/${id}`,
    );

    return response.data.data;
}

export async function updateAdminOrderStatus(
    id: string,
    payload: UpdateOrderStatusPayload,
) {
    const response = await apiClient.patch<ApiResponse<Order>>(
        `/admin/orders/${id}/status`,
        payload,
    );

    return response.data.data;
}

export async function updateAdminOrderPaymentStatus(
    id: string,
    payload: UpdatePaymentStatusPayload,
) {
    const response = await apiClient.patch<ApiResponse<Order>>(
        `/admin/orders/${id}/payment-status`,
        payload,
    );

    return response.data.data;
}