import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { AuthLayout } from "./ui/AuthLayout";
import { apiClient } from "@/shared/api/apiClient";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailError =
    isSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);

    const isEmailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (isEmailInvalid) {
      toast.error("Введите корректный email");
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiClient.post("/auth/forgot-password", {
        email,
      });

      toast.success(
        response.data?.data?.message ??
          "Если такой email зарегистрирован, мы отправили письмо для восстановления пароля",
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ??
          "Не удалось отправить письмо восстановления",
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
        <div>
          <label
            className={`mb-2 block text-[16px] font-[400] leading-5 text-[#060606] ${
              emailError ? "text-red-500" : "text-[#060606]"
            }`}
          >
            Email
          </label>

          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className={`h-11 w-full rounded-2xl  border px-4 text-[14px] font-[400] outline-none transition focus:border-black focus:border-2 ${
              emailError ? "border-red-500" : "border-neutral-300"
            }`}
          />

          {emailError && (
            <p className="mt-2 text-[13px] font-medium text-red-500">
              Email должен быть корректным
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 h-12 w-full rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {isLoading ? "Отправляем..." : "Продолжить"}
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