import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/model/auth.store";
import { AuthLayout } from "./ui/AuthLayout";

export function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const emailError =
    isSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordError = isSubmitted && password.length === 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);

    const isEmailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordInvalid = password.length === 0;

    if (isEmailInvalid) {
      toast.error("Email должен быть корректным");
      return;
    }

    if (isPasswordInvalid) {
      toast.error("Введите пароль");
      return;
    }

    const result = await login({ email, password });

    if (!result.ok) {
      toast.error(result.error ?? "Не удалось войти");
      return;
    }

    toast.success("Вы вошли в аккаунт");
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
            className={`mb-2 block text-[16px] font-[400] leading-5  ${
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
        </motion.div>

        <motion.div layout className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label
              className={`tmb-2 block text-[16px] font-[400] leading-5 text-[#060606] ${
                passwordError ? "text-red-500" : "text-[#060606]"
              }`}
            >
              Пароль
            </label>

            <Link
              to="/forgot-password"
              className="text-[15px] font-[450] text-[#666666] underline"
            >
              Забыли пароль?
            </Link>
          </div>

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
              Введите пароль
            </p>
          )}
        </motion.div>

        <motion.button
          layout
          type="submit"
          disabled={isLoading}
          className="mt-6 h-12 w-full rounded-full bg-[#060606] text-[15px] font-[500] text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {isLoading ? "Входим..." : "Войти"}
        </motion.button>

        <motion.div layout className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-[13px] text-[#666666] text-neutral-400 font-[500]">Или</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </motion.div>

        <motion.div layout>
          <Link
            to="/register"
            className="block text-center text-[15px] font-[450] text-[#666666] text-neutral-500"
          >
            Зарегистрироваться
          </Link>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
}