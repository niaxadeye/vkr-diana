import { apiClient } from "@/shared/api/apiClient";

export type AdminCollection = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  products?: unknown[];
  createdAt: string;
  updatedAt: string;
};

export type CollectionPayload = {
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
};

type ListResponse = {
  success: true;
  data: AdminCollection[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type SingleResponse = {
  success: true;
  data: AdminCollection;
};

export async function getAdminCollections() {
  const response = await apiClient.get<ListResponse>("/admin/collections", {
    params: {
      limit: 100,
    },
  });

  return response.data.data;
}

export async function getAdminCollectionById(id: string) {
  const response = await apiClient.get<SingleResponse>(
    `/admin/collections/${id}`,
  );

  return response.data.data;
}

export async function createAdminCollection(payload: CollectionPayload) {
  const response = await apiClient.post<SingleResponse>(
    "/admin/collections",
    payload,
  );

  return response.data.data;
}

export async function updateAdminCollection(
  id: string,
  payload: Partial<CollectionPayload>,
) {
  const response = await apiClient.patch<SingleResponse>(
    `/admin/collections/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteAdminCollection(id: string) {
  const response = await apiClient.delete<SingleResponse>(
    `/admin/collections/${id}`,
  );

  return response.data.data;
}