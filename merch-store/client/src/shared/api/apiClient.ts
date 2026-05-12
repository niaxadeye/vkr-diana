import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { startAppLoading, stopAppLoading } from "@/shared/lib/appLoading";

type FailedRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        startAppLoading();

        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        stopAppLoading();

        return Promise.reject(error);
    },
);

apiClient.interceptors.response.use(
    (response) => {
        stopAppLoading();

        return response;
    },

    async (error: AxiosError) => {
        stopAppLoading();

        console.log("API_ERROR:", error.response?.data);

        const originalRequest = error.config as FailedRequestConfig | undefined;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/login") &&
            !originalRequest.url?.includes("/auth/register")
        ) {
            originalRequest._retry = true;

            try {
                const response = await apiClient.post<{
                    success: true;
                    data: {
                        accessToken: string;
                    };
                }>("/auth/refresh");

                const newAccessToken = response.data.data.accessToken;

                localStorage.setItem("accessToken", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return apiClient(originalRequest);
            } catch {
                localStorage.removeItem("accessToken");
            }
        }

        return Promise.reject(error);
    },
);