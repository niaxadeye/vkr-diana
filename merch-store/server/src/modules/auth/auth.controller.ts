import type { Request, Response } from "express";

import { authService } from "./auth.service";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changeEmailSchema,
  confirmEmailChangeSchema,
  changePasswordSchema,
} from "./auth.schemas";
import { fail, success } from "../../utils/api-response";
import { env } from "../../config/env";
import { prisma } from "../../prisma/prisma";

import {
  requestPasswordReset,
  resetPassword as resetPasswordByToken,
  sendEmailVerification,
  verifyEmail as verifyEmailByToken,
  requestEmailChange,
  confirmEmailChange as confirmEmailChangeByToken,
  changePassword as changePasswordForUser,
} from "./auth-email.service";

const refreshCookieName = "refreshToken";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: env.refreshExpiresInDays * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(refreshCookieName);
}

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные",
        parsed.error.issues,
      );
    }

    try {
      const result = await authService.register(
        parsed.data.email,
        parsed.data.password,
      );

      try {
        await sendEmailVerification(result.user);
      } catch (error) {
        console.error("[SEND_VERIFICATION_EMAIL_ERROR]", error);
      }

      setRefreshCookie(res, result.refreshToken);

      return success(res, {
        user: result.user,
        accessToken: result.accessToken,
        message: "Регистрация выполнена. Письмо подтверждения отправлено на email.",
      });
    } catch (error) {
      console.error("REGISTER_ERROR:", error);

      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        return fail(
          res,
          409,
          "EMAIL_ALREADY_EXISTS",
          "Пользователь с таким email уже существует",
        );
      }

      return fail(res, 500, "SERVER_ERROR", "Ошибка сервера");
    }
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные",
        parsed.error.issues,
      );
    }

    try {
      const result = await authService.login(
        parsed.data.email,
        parsed.data.password,
      );

      setRefreshCookie(res, result.refreshToken);

      return success(res, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
        return fail(
          res,
          401,
          "INVALID_CREDENTIALS",
          "Неверный email или пароль",
        );
      }

      return fail(res, 500, "SERVER_ERROR", "Ошибка сервера");
    }
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[refreshCookieName];

    if (!refreshToken) {
      return fail(res, 401, "NO_REFRESH_TOKEN", "Refresh token отсутствует");
    }

    try {
      const result = await authService.refresh(refreshToken);

      return success(res, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch {
      clearRefreshCookie(res);

      return fail(res, 401, "INVALID_REFRESH_TOKEN", "Сессия истекла");
    }
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[refreshCookieName];

    await authService.logout(refreshToken);

    clearRefreshCookie(res);

    return success(res, {
      message: "Вы вышли из аккаунта",
    });
  },

  async me(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return fail(res, 401, "UNAUTHORIZED", "Не авторизован");
    }

    const user = await authService.getMe(userId);

    return success(res, {
      user,
    });
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const parsed = verifyEmailSchema.safeParse(req.query);

      if (!parsed.success) {
        return fail(
          res,
          400,
          "VALIDATION_ERROR",
          "Некорректный токен",
          parsed.error.issues,
        );
      }

      await verifyEmailByToken(parsed.data.token);

      return success(res, {
        message: "Email успешно подтверждён",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "EMAIL_VERIFICATION_TOKEN_INVALID") {
          return fail(
            res,
            400,
            "EMAIL_VERIFICATION_TOKEN_INVALID",
            "Ссылка подтверждения недействительна",
          );
        }

        if (error.message === "EMAIL_VERIFICATION_TOKEN_ALREADY_USED") {
          return fail(
            res,
            400,
            "EMAIL_VERIFICATION_TOKEN_ALREADY_USED",
            "Email уже был подтверждён",
          );
        }

        if (error.message === "EMAIL_VERIFICATION_TOKEN_EXPIRED") {
          return fail(
            res,
            400,
            "EMAIL_VERIFICATION_TOKEN_EXPIRED",
            "Срок действия ссылки истёк",
          );
        }
      }

      console.error("[VERIFY_EMAIL_ERROR]", error);

      return fail(
        res,
        500,
        "VERIFY_EMAIL_ERROR",
        "Не удалось подтвердить email",
      );
    }
  },

  async resendVerification(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return fail(res, 401, "UNAUTHORIZED", "Необходима авторизация");
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return fail(res, 404, "USER_NOT_FOUND", "Пользователь не найден");
      }

      if (user.emailVerifiedAt) {
        return success(res, {
          message: "Email уже подтверждён",
        });
      }

      await sendEmailVerification(user);

      return success(res, {
        message: "Письмо подтверждения отправлено повторно",
      });
    } catch (error) {
      console.error("[RESEND_VERIFICATION_ERROR]", error);

      return fail(
        res,
        500,
        "RESEND_VERIFICATION_ERROR",
        "Не удалось отправить письмо подтверждения",
      );
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);

      if (!parsed.success) {
        return fail(
          res,
          400,
          "VALIDATION_ERROR",
          "Некорректные данные",
          parsed.error.issues,
        );
      }

      await requestPasswordReset(parsed.data.email);

      return success(res, {
        message:
          "Если такой email зарегистрирован, мы отправили письмо для восстановления пароля",
      });
    } catch (error) {
      console.error("[FORGOT_PASSWORD_ERROR]", error);

      return fail(
        res,
        500,
        "FORGOT_PASSWORD_ERROR",
        "Не удалось обработать запрос восстановления пароля",
      );
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);

      if (!parsed.success) {
        return fail(
          res,
          400,
          "VALIDATION_ERROR",
          "Некорректные данные",
          parsed.error.issues,
        );
      }

      await resetPasswordByToken(parsed.data.token, parsed.data.password);

      return success(res, {
        message: "Пароль успешно изменён",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PASSWORD_RESET_TOKEN_INVALID") {
          return fail(
            res,
            400,
            "PASSWORD_RESET_TOKEN_INVALID",
            "Ссылка восстановления недействительна",
          );
        }

        if (error.message === "PASSWORD_RESET_TOKEN_ALREADY_USED") {
          return fail(
            res,
            400,
            "PASSWORD_RESET_TOKEN_ALREADY_USED",
            "Ссылка восстановления уже была использована",
          );
        }

        if (error.message === "PASSWORD_RESET_TOKEN_EXPIRED") {
          return fail(
            res,
            400,
            "PASSWORD_RESET_TOKEN_EXPIRED",
            "Срок действия ссылки восстановления истёк",
          );
        }
      }

      console.error("[RESET_PASSWORD_ERROR]", error);

      return fail(
        res,
        500,
        "RESET_PASSWORD_ERROR",
        "Не удалось изменить пароль",
      );
    }
  },

  async changeEmail(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return fail(res, 401, "UNAUTHORIZED", "Необходима авторизация");
    }

    const parsed = changeEmailSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные",
        parsed.error.issues,
      );
    }

    try {
      await requestEmailChange(
        userId,
        parsed.data.newEmail,
        parsed.data.password,
      );

      return success(res, {
        message:
          "Мы отправили письмо на новый адрес. Подтвердите смену email по ссылке из письма.",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "INVALID_PASSWORD") {
          return fail(res, 400, "INVALID_PASSWORD", "Неверный пароль");
        }

        if (error.message === "EMAIL_SAME_AS_CURRENT") {
          return fail(
            res,
            400,
            "EMAIL_SAME_AS_CURRENT",
            "Новый email совпадает с текущим",
          );
        }

        if (error.message === "EMAIL_ALREADY_EXISTS") {
          return fail(
            res,
            409,
            "EMAIL_ALREADY_EXISTS",
            "Этот email уже занят",
          );
        }

        if (error.message === "USER_NOT_FOUND") {
          return fail(res, 404, "USER_NOT_FOUND", "Пользователь не найден");
        }
      }

      console.error("[CHANGE_EMAIL_ERROR]", error);

      return fail(res, 500, "CHANGE_EMAIL_ERROR", "Не удалось сменить email");
    }
  },

  async confirmEmailChange(req: Request, res: Response) {
    const parsed = confirmEmailChangeSchema.safeParse(req.query);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректный токен",
        parsed.error.issues,
      );
    }

    try {
      const result = await confirmEmailChangeByToken(parsed.data.token);

      return success(res, {
        message: "Email успешно изменён",
        email: result.email,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "EMAIL_CHANGE_TOKEN_INVALID") {
          return fail(
            res,
            400,
            "EMAIL_CHANGE_TOKEN_INVALID",
            "Ссылка подтверждения недействительна",
          );
        }

        if (error.message === "EMAIL_CHANGE_TOKEN_ALREADY_USED") {
          return fail(
            res,
            400,
            "EMAIL_CHANGE_TOKEN_ALREADY_USED",
            "Ссылка подтверждения уже была использована",
          );
        }

        if (error.message === "EMAIL_CHANGE_TOKEN_EXPIRED") {
          return fail(
            res,
            400,
            "EMAIL_CHANGE_TOKEN_EXPIRED",
            "Срок действия ссылки истёк",
          );
        }

        if (error.message === "EMAIL_ALREADY_EXISTS") {
          return fail(
            res,
            409,
            "EMAIL_ALREADY_EXISTS",
            "Этот email уже занят",
          );
        }
      }

      console.error("[CONFIRM_EMAIL_CHANGE_ERROR]", error);

      return fail(
        res,
        500,
        "CONFIRM_EMAIL_CHANGE_ERROR",
        "Не удалось подтвердить смену email",
      );
    }
  },

  async changePassword(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return fail(res, 401, "UNAUTHORIZED", "Необходима авторизация");
    }

    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные",
        parsed.error.issues,
      );
    }

    try {
      await changePasswordForUser(
        userId,
        parsed.data.currentPassword,
        parsed.data.newPassword,
      );

      return success(res, {
        message: "Пароль успешно изменён",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "INVALID_PASSWORD") {
          return fail(res, 400, "INVALID_PASSWORD", "Неверный текущий пароль");
        }

        if (error.message === "PASSWORD_SAME_AS_CURRENT") {
          return fail(
            res,
            400,
            "PASSWORD_SAME_AS_CURRENT",
            "Новый пароль совпадает с текущим",
          );
        }

        if (error.message === "USER_NOT_FOUND") {
          return fail(res, 404, "USER_NOT_FOUND", "Пользователь не найден");
        }
      }

      console.error("[CHANGE_PASSWORD_ERROR]", error);

      return fail(res, 500, "CHANGE_PASSWORD_ERROR", "Не удалось изменить пароль");
    }
  },
};