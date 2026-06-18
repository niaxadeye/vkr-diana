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

export async function changeEmailRequest(payload: {
  newEmail: string;
  password: string;
}) {
  const response = await apiClient.post<{
    success: true;
    data: { message: string };
  }>("/auth/change-email", payload);

  return response.data.data;
}

export async function changePasswordRequest(payload: {
  currentPassword: string;
  newPassword: string;
  passwordConfirm: string;
}) {
  const response = await apiClient.post<{
    success: true;
    data: { message: string };
  }>("/auth/change-password", payload);

  return response.data.data;
}

export async function confirmEmailChangeRequest(token: string) {
  const response = await apiClient.get<{
    success: true;
    data: { message: string; email: string };
  }>("/auth/confirm-email-change", { params: { token } });

  return response.data.data;
}