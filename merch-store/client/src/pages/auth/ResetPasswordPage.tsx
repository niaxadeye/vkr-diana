import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { AuthLayout } from "./ui/AuthLayout";
import { apiClient } from "@/shared/api/apiClient";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordError = isSubmitted && password.length < 8;
  const confirmError = isSubmitted && password !== passwordConfirm;
  const tokenError = !token;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);

    if (tokenError) {
      toast.error("Ссылка восстановления недействительна");
      return;
    }

    if (password.length < 8) {
      toast.error("Пароль должен содержать минимум 8 символов");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      setIsLoading(true);

      await apiClient.post("/auth/reset-password", {
        token,
        password,
        passwordConfirm,
      });

      toast.success("Пароль успешно изменён");

      navigate("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ??
          "Не удалось изменить пароль",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <motion.form
        layout
        onSubmit={handleSubmit}
        className="w-full"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
      >
        {tokenError && (
          <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
            Ссылка восстановления недействительна. Запросите новую ссылку.
          </div>
        )}

        <div>
          <label
            className={`mb-2 block text-[16px] font-[400] leading-5 text-[#060606] ${
              passwordError ? "text-red-500" : "text-[#060606]"
            }`}
          >
            Новый пароль
          </label>

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className={`h-11 w-full rounded-2xl  border px-4 text-[14px] font-[400] outline-none transition focus:border-black focus:border-2 ${
              passwordError ? "border-red-500" : "border-neutral-300"
            }`}
          />

          {passwordError && (
            <p className="mt-2 text-[13px] font-medium text-red-500">
              Минимум 8 символов
            </p>
          )}
        </div>

        <div className="mt-5">
          <label
            className={`mb-2 block text-[16px] font-[400] leading-5 text-[#060606] ${
              confirmError ? "text-red-500" : "text-[#060606]"
            }`}
          >
            Повторите пароль
          </label>

          <input
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            type="password"
            className={`h-11 w-full rounded-2xl  border px-4 text-[14px] font-[400] outline-none transition focus:border-black focus:border-2 ${
              confirmError ? "border-red-500" : "border-neutral-300"
            }`}
          />

          {confirmError && (
            <p className="mt-2 text-[13px] font-medium text-red-500">
              Пароли не совпадают
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || tokenError}
          className="mt-6 h-12 w-full rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {isLoading ? "Сохраняем..." : "Сохранить пароль"}
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-[13px] text-neutral-400">Или</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <Link
          to="/login"
          className="block text-center text-[15px] font-[450] text-[#666666] text-neutral-500"
        >
          Войти
        </Link>
      </motion.form>
    </AuthLayout>
  );
}