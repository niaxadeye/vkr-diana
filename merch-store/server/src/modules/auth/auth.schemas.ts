import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
});

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Некорректный email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Токен обязателен"),
    password: z
      .string()
      .min(8, "Пароль должен содержать минимум 8 символов"),
    passwordConfirm: z
      .string()
      .min(8, "Повтор пароля должен содержать минимум 8 символов"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Пароли не совпадают",
    path: ["passwordConfirm"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Токен обязателен"),
});