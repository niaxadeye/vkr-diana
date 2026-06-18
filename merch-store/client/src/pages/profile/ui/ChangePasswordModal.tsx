import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { changePasswordRequest } from "@/features/auth/api/auth.api";

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

  if (!open) return null;

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
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/45" onClick={handleClose} />

      <div className="absolute left-1/2 top-1/2 w-[calc(100%-24px)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-2xl md:p-9">
        <div className="flex items-start justify-between gap-5">
          <h2 className="text-[36px] font-bold tracking-[-0.05em]">
            Изменить пароль
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200"
          >
            <X size={22} />
          </button>
        </div>

        <form className="mt-7 space-y-7" onSubmit={handleSubmit}>
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
          />

          <PasswordField
            label="Подтвердите пароль"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            visible={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
          />

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-full bg-black text-base font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Сохраняем..." : "Сохранить изменения"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-lg font-medium">{label}</span>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-16 w-full rounded-2xl border border-neutral-300 px-6 pr-14 text-lg outline-none focus:border-black"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500"
        >
          {visible ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </div>
    </label>
  );
}
