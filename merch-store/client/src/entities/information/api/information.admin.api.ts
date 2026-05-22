import { apiClient } from "@/shared/api/apiClient";
import type { InformationPage } from "@/entities/information/model/information.types";


export const getAdminInformationPages = async (): Promise<InformationPage[]> => {
  const res = await apiClient.get("/admin/information");
  // res.data = { success: true, data: [...], ... }
  return res.data.data; // <- берём именно массив
};

export const updateInformationPage = async (slug: string, payload: Partial<InformationPage>) =>
  apiClient.patch(`/admin/information/${slug}`, payload).then(res => res.data.data);