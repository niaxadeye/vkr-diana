import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";

import { changeEmailRequest } from "@/features/auth/api/auth.api";
import { ResponsiveModal } from "@/shared/ui/modal/ResponsiveModal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangeEmailModal({ open, onClose }: Props) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
    <ResponsiveModal
      open={open}
      onClose={handleClose}
      title="Изменить email"
      busy={loading}
    >
      {sent ? (
        <div>
          <p className="text-[15px] leading-6 text-[#666666]">
            Мы отправили письмо на{" "}
            <span className="font-medium text-[#060606]">{newEmail}</span>.
            Откройте его и перейдите по ссылке, чтобы подтвердить новый адрес. До
            подтверждения старый email продолжит работать.
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="mt-7 h-12 w-full rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800"
          >
            Понятно
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-[16px] font-[400] leading-5 text-[#060606]">
              Новый email
            </label>

            <input
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              type="email"
              className="h-11 w-full rounded-2xl border border-neutral-300 px-4 text-[14px] font-[400] outline-none transition focus:border-2 focus:border-black"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-[16px] font-[400] leading-5 text-[#060606]">
              Пароль
            </label>

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="h-11 w-full rounded-2xl border border-neutral-300 px-4 text-[14px] font-[400] outline-none transition focus:border-2 focus:border-black"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.99 }}
            className="mt-6 h-12 w-full rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Отправляем..." : "Сохранить изменения"}
          </motion.button>
        </form>
      )}
    </ResponsiveModal>
  );
}
