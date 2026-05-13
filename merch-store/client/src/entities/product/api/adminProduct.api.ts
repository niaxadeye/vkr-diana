import { apiClient } from "@/shared/api/apiClient";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type Dimensions = {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
};

export type AdminProductAccordionItem = {
    id: string;
    productId: string;
    title: string;
    content: string;
    sortOrder: number;
    isActive: boolean;
    isOpenByDefault: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ProductAccordionItemPayload = {
    title: string;
    content: string;
    sortOrder?: number;
    isActive?: boolean;
    isOpenByDefault?: boolean;
};

export type AdminProduct = {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    oldPrice?: number | null;
    status: ProductStatus;
    hasVariants: boolean;
    categoryId?: string | null;
    collectionId?: string | null;
    weightGram?: number | null; // Вес товара в граммах
    lengthCm?: number | null;
    widthCm?: number | null;
    heightCm?: number | null;
    images: {
        id: string;
        url: string;
        alt?: string | null;
        sortOrder: number;
    }[];
    variants: {
        id: string;
        size: string;
        color?: string | null;
        sku: string;
        stock: number;
        reservedStock: number;
        priceOverride?: number | null;
        isActive: boolean;
        weightGram?: number | null;
        lengthCm?: number | null;
        widthCm?: number | null;
        heightCm?: number | null;
    }[];
    accordionItems: AdminProductAccordionItem[];
    createdAt: string;
    updatedAt: string;
};

export type ProductPayload = {
    title: string;
    slug: string;
    description: string;
    hasVariants: boolean;
    shortDescription?: string | null;
    price: number;
    oldPrice?: number | null;
    collectionId?: string | null;
    categoryId?: string | null;
    status: ProductStatus;
    weightGram?: number | null;
    lengthCm?: number | null;
        widthCm?: number | null;
        heightCm?: number | null;
    images: {
        url: string;
        alt?: string | null;
        sortOrder?: number;
    }[];
    variants: {
        size: string;
        color?: string | null;
        sku: string;
        stock: number;
        reservedStock?: number;
        priceOverride?: number | null;
        isActive?: boolean;
        weightGram?: number | null;
        lengthCm?: number | null;
        widthCm?: number | null;
        heightCm?: number | null;
    }[];
    accordionItems: ProductAccordionItemPayload[];
};

type ListResponse = {
    success: true;
    data: AdminProduct[];
    meta: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};

type SingleResponse = {
    success: true;
    data: AdminProduct;
};

export async function getAdminProducts() {
    const response = await apiClient.get<ListResponse>("/admin/products", {
        params: {
            limit: 100,
        },
    });

    return response.data.data;
}

export async function createAdminProduct(payload: ProductPayload) {
    const response = await apiClient.post<SingleResponse>(
        "/admin/products",
        payload,
    );

    return response.data.data;
}

export async function updateAdminProduct(id: string, payload: Partial<ProductPayload>) {
    const response = await apiClient.patch<SingleResponse>(
        `/admin/products/${id}`,
        payload,
    );

    return response.data.data;
}

export async function getAdminProductById(id: string) {
    const response = await apiClient.get<SingleResponse>(
        `/admin/products/${id}`,
    );

    return response.data.data;
}

export async function deleteAdminProduct(id: string) {
    const response = await apiClient.delete<SingleResponse>(
        `/admin/products/${id}`,
    );

    return response.data.data;
}