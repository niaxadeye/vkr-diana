import { apiClient } from "@/shared/api/apiClient";

export type CollectionListItem = {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    isActive: boolean;
};

type CollectionsResponse = {
    success: true;
    data: CollectionListItem[];
};

type CollectionResponse = {
    success: true;
    data: CollectionListItem;
};

export async function getCollections() {
    const response = await apiClient.get<CollectionsResponse>("/collections");

    return response.data.data;
}

export async function getCollectionBySlug(slug: string) {
    const response = await apiClient.get<CollectionResponse>(
        `/collections/${slug}`,
    );

    return response.data.data;
}