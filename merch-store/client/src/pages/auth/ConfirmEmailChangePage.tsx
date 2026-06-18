import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { AuthLayout } from "@/pages/auth/ui/AuthLayout";
import { confirmEmailChangeRequest } from "@/features/auth/api/auth.api";

type Status = "loading" | "success" | "error";

export function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token
      ? "Подтверждаем смену email..."
      : "Ссылка подтверждения недействительна.",
  );

  const requestedRef = useRef(false);

  useEffect(() => {
    if (!token || requestedRef.current) {
      return;
    }

    requestedRef.current = true;

    async function confirm() {
      try {
        const result = await confirmEmailChangeRequest(token);

        setStatus("success");
        setMessage(`Email изменён на ${result.email}. Войдите с новым адресом.`);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error?.response?.data?.error?.message ??
            "Не удалось подтвердить смену email.",
        );
      }
    }

    void confirm();
  }, [token]);

  return (
    <AuthLayout>
      <div className="w-full text-center">
        <h1 className="text-[24px] font-semibold text-[#060606]">
          {status === "success" ? "Email подтверждён" : "Смена email"}
        </h1>

        <p className="mt-4 text-[15px] leading-6 text-[#666666]">{message}</p>

        <Link
          to="/login"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800"
        >
          Войти
        </Link>

        <Link
          to="/"
          className="mt-4 block text-center text-[15px] font-[450] text-neutral-500"
        >
          На главную
        </Link>
      </div>
    </AuthLayout>
  );
}
