import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";

import { changePasswordRequest } from "@/features/auth/api/auth.api";
import { ResponsiveModal } from "@/shared/ui/modal/ResponsiveModal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ open, onClose }: Props) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setPasswordConfirm("");
  }

  function handleClose() {
    if (loading) return;
    resetForm();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Новый пароль должен содержать минимум 8 символов");
      return;
    }

    if (newPassword !== passwordConfirm) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      setLoading(true);

      await changePasswordRequest({
        currentPassword,
        newPassword,
        passwordConfirm,
      });

      toast.success("Пароль изменён. Уведомление отправлено на email.");
      resetForm();
      onClose();
    } catch (error) {
      const code = axios.isAxiosError(error)
        ? error.response?.data?.error?.code
        : null;

      if (code === "INVALID_PASSWORD") {
        toast.error("Неверный текущий пароль");
      } else if (code === "PASSWORD_SAME_AS_CURRENT") {
        toast.error("Новый пароль совпадает с текущим");
      } else {
        toast.error("Не удалось изменить пароль");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResponsiveModal
      open={open}
      onClose={handleClose}
      title="Изменить пароль"
      busy={loading}
    >
      <form onSubmit={handleSubmit}>
        <PasswordField
          label="Текущий пароль"
          value={currentPassword}
          onChange={setCurrentPassword}
          visible={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
        />

        <PasswordField
          label="Новый пароль"
          value={newPassword}
          onChange={setNewPassword}
          visible={showNew}
          onToggle={() => setShowNew((v) => !v)}
          className="mt-5"
        />

        <PasswordField
          label="Подтвердите пароль"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          visible={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          className="mt-5"
        />

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.99 }}
          className="mt-6 h-12 w-full rounded-full bg-black text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Сохраняем..." : "Сохранить изменения"}
        </motion.button>
      </form>
    </ResponsiveModal>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[16px] font-[400] leading-5 text-[#060606]">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-2xl border border-neutral-300 px-4 pr-12 text-[14px] font-[400] outline-none transition focus:border-2 focus:border-black"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500"
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}
