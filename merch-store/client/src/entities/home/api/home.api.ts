import { apiClient } from "@/shared/api/apiClient";
import type { HomeHeroBanner } from "@/entities/home/model/home.types";

type HomeHeroResponse = {
  success: true;
  data: HomeHeroBanner;
};

export async function getHomeHero() {
  const response = await apiClient.get<HomeHeroResponse>("/home/hero");

  return response.data.data;
}

export async function getAdminHomeHero() {
  const response = await apiClient.get<HomeHeroResponse>("/admin/home/hero");

  return response.data.data;
}

export async function updateAdminHomeHero(
  payload: Partial<
    Pick<
      HomeHeroBanner,
      | "title"
      | "imageDesktop"
      | "imageMobile"
      | "videoDesktop"
      | "videoMobile"
      | "ctaLabel"
      | "ctaHref"
      | "isActive"
    >
  >,
) {
  const response = await apiClient.patch<HomeHeroResponse>(
    "/admin/home/hero",
    payload,
  );

  return response.data.data;
}

type UploadHomeHeroMediaResponse = {
  success: true;
  data: {
    url: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
};

export async function uploadHomeHeroMedia(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post<UploadHomeHeroMediaResponse>(
    "/admin/uploads/home-hero-media",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
}