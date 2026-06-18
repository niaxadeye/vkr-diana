import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { changeEmailRequest } from "@/features/auth/api/auth.api";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangeEmailModal({ open, onClose }: Props) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  function resetForm() {
    setNewEmail("");
    setPassword("");
    setSent(false);
  }

  function handleClose() {
    if (loading) return;
    resetForm();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);

      await changeEmailRequest({ newEmail, password });

      setSent(true);
      toast.success("Письмо отправлено на новый адрес");
    } catch (error) {
      const code = axios.isAxiosError(error)
        ? error.response?.data?.error?.code
        : null;

      if (code === "INVALID_PASSWORD") {
        toast.error("Неверный пароль");
      } else if (code === "EMAIL_ALREADY_EXISTS") {
        toast.error("Этот email уже занят");
      } else if (code === "EMAIL_SAME_AS_CURRENT") {
        toast.error("Новый email совпадает с текущим");
      } else if (code === "VALIDATION_ERROR") {
        toast.error("Проверьте корректность email");
      } else {
        toast.error("Не удалось сменить email");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/45" onClick={handleClose} />

      <div className="absolute left-1/2 top-1/2 w-[calc(100%-24px)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-2xl md:p-9">
        <div className="flex items-start justify-between gap-5">
          <h2 className="text-[36px] font-bold tracking-[-0.05em]">
            Изменить email
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-neutral-200"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        {sent ? (
          <div className="mt-7">
            <p className="text-lg leading-7 text-neutral-700">
              Мы отправили письмо на <strong>{newEmail}</strong>. Откройте его и
              перейдите по ссылке, чтобы подтвердить новый адрес. До подтверждения
              старый email продолжит работать.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="mt-7 h-14 w-full rounded-full bg-black text-base font-bold text-white transition hover:bg-neutral-800"
            >
              Понятно
            </button>
          </div>
        ) : (
          <form className="mt-7 space-y-7" onSubmit={handleSubmit}>
            <Field
              label="Новый email"
              type="email"
              value={newEmail}
              onChange={setNewEmail}
            />

            <Field
              label="Пароль"
              type="password"
              value={password}
              onChange={setPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-full bg-black text-base font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Отправляем..." : "Сохранить изменения"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-lg font-medium text-black">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-16 w-full rounded-2xl border border-neutral-300 bg-white px-6 text-lg outline-none transition focus:border-black"
      />
    </label>
  );
}
