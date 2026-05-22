import { apiClient } from "@/shared/api/apiClient";
import type {
  InformationPage
} from "@/entities/information/model/information.types";

type InformationListResponse = {
  success: true;
  data: InformationPage[];
};

type InformationSingleResponse = {
  success: true;
  data: InformationPage;
};

export async function getInformationPages() {
  const response = await apiClient.get<InformationListResponse>("/information");

  return response.data.data;
}

export async function getInformationPageBySlug(slug: string) {
  const response = await apiClient.get<InformationSingleResponse>(
    `/information/${slug}`,
  );

  return response.data.data;
}