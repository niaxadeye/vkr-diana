import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { AuthLayout } from "@/pages/auth/ui/AuthLayout";
import {
  resendVerificationRequest,
  verifyEmailRequest,
} from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/model/auth.store";

type Status = "loading" | "success" | "expired" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const user = useAuthStore((state) => state.user);
  const initAuth = useAuthStore((state) => state.initAuth);

  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token
      ? "Подтверждаем email..."
      : "Ссылка подтверждения недействительна.",
  );
  const [resending, setResending] = useState(false);

  const requestedRef = useRef(false);

  useEffect(() => {
    if (!token || requestedRef.current) {
      return;
    }

    requestedRef.current = true;

    async function verify() {
      try {
        const result = await verifyEmailRequest(token);

        setStatus("success");
        setMessage(result.message ?? "Email успешно подтверждён.");

        // Обновляем статус верификации в сторе, если пользователь авторизован.
        void initAuth();
      } catch (error: any) {
        const code = error?.response?.data?.error?.code;

        if (
          code === "EMAIL_VERIFICATION_TOKEN_EXPIRED" ||
          code === "EMAIL_VERIFICATION_TOKEN_INVALID" ||
          code === "EMAIL_VERIFICATION_TOKEN_ALREADY_USED"
        ) {
          // ALREADY_USED по сути означает, что email уже подтверждён.
          if (code === "EMAIL_VERIFICATION_TOKEN_ALREADY_USED") {
            setStatus("success");
            setMessage("Email уже был подтверждён.");
            return;
          }

          setStatus("expired");
          setMessage(
            "Ссылка подтверждения недействительна или истекла. Запросите новое письмо.",
          );
          return;
        }

        setStatus("error");
        setMessage(
          error?.response?.data?.error?.message ??
            "Не удалось подтвердить email.",
        );
      }
    }

    void verify();
  }, [token, initAuth]);

  async function handleResend() {
    try {
      setResending(true);
      const result = await resendVerificationRequest();
      toast.success(result.message ?? "Письмо отправлено повторно");
    } catch (error: any) {
      const code = error?.response?.data?.error?.code;

      if (code === "UNAUTHORIZED") {
        toast.error("Войдите в аккаунт, чтобы отправить письмо повторно");
      } else {
        toast.error(
          error?.response?.data?.error?.message ??
            "Не удалось отправить письмо",
        );
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full text-center">
        <h1 className="text-[24px] font-semibold text-[#060606]">
          {status === "success" ? "Email подтверждён" : "Подтверждение email"}
        </h1>

        <p className="mt-4 text-[15px] leading-6 text-[#666666]">{message}</p>

        {status === "expired" && (
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={resending}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending ? "Отправляем..." : "Отправить письмо повторно"}
          </button>
        )}

        {status === "expired" && !user && (
          <p className="mt-3 text-[13px] leading-5 text-[#999999]">
            Чтобы отправить письмо повторно, войдите в аккаунт.
          </p>
        )}

        {status === "success" ? (
          <Link
            to="/"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800"
          >
            На главную
          </Link>
        ) : (
          <Link
            to="/login"
            className="mt-4 block text-center text-[15px] font-[450] text-neutral-500"
          >
            Войти
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
