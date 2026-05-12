import { create } from "zustand";
import axios from "axios";

import type { AuthUser } from "../api/auth.api";
import {
    loginRequest,
    logoutRequest,
    meRequest,
    refreshRequest,
    registerRequest,
} from "../api/auth.api";

type AuthState = {
    user: AuthUser | null;
    accessToken: string | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    login: (payload: { email: string; password: string }) => Promise<{
        ok: boolean;
        error?: string;
    }>;

    register: (payload: { email: string; password: string }) => Promise<{
        ok: boolean;
        error?: string;
    }>;
    logout: () => Promise<void>;
    initAuth: () => Promise<void>;
    setSession: (payload: { user: AuthUser; accessToken: string }) => void;
    clearSession: () => void;
};

function getAuthErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const code = error.response?.data?.error?.code;

        if (code === "EMAIL_ALREADY_EXISTS") {
            return "Пользователь с такой почтой уже зарегистрирован";
        }

        if (code === "INVALID_CREDENTIALS") {
            return "Неверный email или пароль";
        }

        if (code === "VALIDATION_ERROR") {
            return "Проверьте корректность введённых данных";
        }
    }

    return fallback;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: localStorage.getItem("accessToken"),
    isLoading: false,
    isInitialized: false,
    error: null,

    setSession({ user, accessToken }) {
        localStorage.setItem("accessToken", accessToken);

        set({
            user,
            accessToken,
            error: null,
        });
    },

    clearSession() {
        localStorage.removeItem("accessToken");

        set({
            user: null,
            accessToken: null,
            error: null,
        });
    },

    async initAuth() {
        const savedToken = localStorage.getItem("accessToken");

        if (!savedToken) {
            try {
                const data = await refreshRequest();

                localStorage.setItem("accessToken", data.accessToken);

                set({
                    user: data.user,
                    accessToken: data.accessToken,
                    isInitialized: true,
                });
            } catch {
                set({
                    user: null,
                    accessToken: null,
                    isInitialized: true,
                });
            }

            return;
        }

        try {
            const data = await meRequest();

            set({
                user: data.user,
                accessToken: savedToken,
                isInitialized: true,
            });
        } catch {
            try {
                const refreshed = await refreshRequest();

                localStorage.setItem("accessToken", refreshed.accessToken);

                set({
                    user: refreshed.user,
                    accessToken: refreshed.accessToken,
                    isInitialized: true,
                });
            } catch {
                localStorage.removeItem("accessToken");

                set({
                    user: null,
                    accessToken: null,
                    isInitialized: true,
                });
            }
        }
    },

    async login(payload) {
        set({ isLoading: true, error: null });

        try {
            const data = await loginRequest(payload);

            localStorage.setItem("accessToken", data.accessToken);

            set({
                user: data.user,
                accessToken: data.accessToken,
                isLoading: false,
            });

            return { ok: true };
        } catch (error) {
            const message = getAuthErrorMessage(error, "Не удалось войти");

            set({
                error: message,
                isLoading: false,
            });

            return { ok: false, error: message };
        }
    },

    async register(payload) {
        set({ isLoading: true, error: null });

        try {
            const data = await registerRequest(payload);

            localStorage.setItem("accessToken", data.accessToken);

            set({
                user: data.user,
                accessToken: data.accessToken,
                isLoading: false,
            });

            return { ok: true };
        } catch (error) {
            const message = getAuthErrorMessage(
                error,
                "Не удалось зарегистрироваться",
            );

            set({
                error: message,
                isLoading: false,
            });

            return { ok: false, error: message };
        }
    },

    async logout() {
        try {
            await logoutRequest();
        } catch (error) {
            console.warn("LOGOUT_REQUEST_FAILED:", error);
        } finally {
            localStorage.removeItem("accessToken");

            set({
                user: null,
                accessToken: null,
                error: null,
            });
        }
    },
}));