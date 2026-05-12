import { apiClient } from "@/shared/api/apiClient";

export type AuthUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "MANAGER";
};

type AuthResponse = {
  success: true;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

type MeResponse = {
  success: true;
  data: {
    user: AuthUser;
  };
};

export async function loginRequest(payload: {
  email: string;
  password: string;
}) {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data.data;
}

export async function registerRequest(payload: {
  email: string;
  password: string;
}) {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  return response.data.data;
}

export async function refreshRequest() {
  const response = await apiClient.post<AuthResponse>("/auth/refresh");
  return response.data.data;
}

export async function meRequest() {
  const response = await apiClient.get<MeResponse>("/auth/me");
  return response.data.data;
}

export async function logoutRequest() {
  await apiClient.post("/auth/logout");
}