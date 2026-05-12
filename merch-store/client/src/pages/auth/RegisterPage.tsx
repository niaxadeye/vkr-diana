import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/model/auth.store";
import { AuthLayout } from "./ui/AuthLayout";

export function RegisterPage() {
  const navigate = useNavigate();

  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const emailError =
    isSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordError = isSubmitted && password.length < 8;
  const confirmError = isSubmitted && password !== confirm;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);

    const isEmailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordInvalid = password.length < 8;
    const isConfirmInvalid = password !== confirm;

    if (isEmailInvalid) {
      toast.error("Email должен быть корректным");
      return;
    }

    if (isPasswordInvalid) {
      toast.error("Пароль должен содержать минимум 8 символов");
      return;
    }

    if (isConfirmInvalid) {
      toast.error("Пароли не совпадают");
      return;
    }

    const result = await register({ email, password });

    if (!result.ok) {
      toast.error(result.error ?? "Не удалось зарегистрироваться");
      return;
    }

    toast.success(
      "Регистрация выполнена. Мы отправили письмо подтверждения на email",
    );

    navigate("/profile");
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
        <motion.div layout>
          <label
            className={`mb-2 block text-[14px] font-medium ${
              emailError ? "text-red-500" : "text-neutral-900"
            }`}
          >
            Email
          </label>

          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className={`h-12 w-full rounded-2xl border px-4 text-[15px] outline-none transition focus:border-black ${
              emailError ? "border-red-500" : "border-neutral-300"
            }`}
          />

          {emailError && (
            <p className="mt-2 text-[13px] font-medium text-red-500">
              Email должен быть корректным
            </p>
          )}
        </motion.div>

        <motion.div layout className="mt-5">
          <label
            className={`mb-2 block text-[14px] font-medium ${
              passwordError ? "text-red-500" : "text-neutral-900"
            }`}
          >
            Пароль
          </label>

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className={`h-12 w-full rounded-2xl border px-4 text-[15px] outline-none transition focus:border-black ${
              passwordError ? "border-red-500" : "border-neutral-300"
            }`}
          />

          {passwordError && (
            <p className="mt-2 text-[13px] font-medium text-red-500">
              Минимум 8 символов
            </p>
          )}
        </motion.div>

        <motion.div layout className="mt-5">
          <label
            className={`mb-2 block text-[14px] font-medium ${
              confirmError ? "text-red-500" : "text-neutral-900"
            }`}
          >
            Подтвердите пароль
          </label>

          <input
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            type="password"
            className={`h-12 w-full rounded-2xl border px-4 text-[15px] outline-none transition focus:border-black ${
              confirmError ? "border-red-500" : "border-neutral-300"
            }`}
          />

          {confirmError && (
            <p className="mt-2 text-[13px] font-medium text-red-500">
              Пароли не совпадают
            </p>
          )}
        </motion.div>

        <motion.button
          layout
          type="submit"
          disabled={isLoading}
          className="mt-6 h-12 w-full rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {isLoading ? "Создаём..." : "Зарегистрироваться"}
        </motion.button>

        <motion.div layout className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-[13px] text-neutral-400">Или</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </motion.div>

        <motion.div layout>
          <Link
            to="/login"
            className="block text-center text-[14px] font-semibold text-neutral-500"
          >
            Войти
          </Link>
        </motion.div>

        <motion.p
          layout
          className="mt-8 text-center text-[13px] leading-5 text-neutral-500"
        >
          Нажимая войти, вы соглашаетесь с нашими{" "}
          <Link to="/terms" className="underline">
            Положениями
          </Link>{" "}
          и{" "}
          <Link to="/privacy" className="underline">
            Политикой приватности
          </Link>
          .
        </motion.p>
      </motion.form>
    </AuthLayout>
  );
}