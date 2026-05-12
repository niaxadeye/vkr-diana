import { apiClient } from "@/shared/api/apiClient";

export type ProductListItem = {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    oldPrice?: number | null;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    hasVariants: boolean;
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
    }[];
    collection?: {
        id: string;
        title: string;
        slug: string;
    } | null;
};

type ProductsResponse = {
    success: true;
    data: ProductListItem[];
    meta: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};

export async function getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    collectionId?: string;
}) {
    const response = await apiClient.get<ProductsResponse>("/products", {
        params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 50,
            search: params?.search,
            collectionId: params?.collectionId,
        },
    });

    return response.data;
}

export type ProductDetails = ProductListItem & {
    category?: {
        id: string;
        title: string;
        slug: string;
    } | null;
};

type ProductDetailsResponse = {
    success: true;
    data: ProductDetails;
};

export async function getProductBySlug(slug: string) {
    const response = await apiClient.get<ProductDetailsResponse>(
        `/products/${slug}`,
    );

    return response.data.data;
}