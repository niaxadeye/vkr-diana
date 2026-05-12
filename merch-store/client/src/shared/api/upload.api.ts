import { apiClient } from "@/shared/api/apiClient";

type UploadResponse = {
  success: true;
  data: {
    url: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
};

export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadResponse>(
    "/admin/uploads/product-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
}

export async function uploadCollectionImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadResponse>(
    "/admin/uploads/collection-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
}