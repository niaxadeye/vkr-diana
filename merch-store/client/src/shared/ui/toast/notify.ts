import { toast } from "sonner";

type ToastType = "error" | "success";

/**
 * Единый помощник уведомлений поверх sonner.
 * Сохраняет прежний вызов showToast({ type, message }), но рендерит через sonner.
 * Имеет стабильную идентичность (модульная функция), поэтому безопасен в зависимостях useEffect.
 */
export function showToast({
  type,
  message,
}: {
  type: ToastType;
  message: string;
}) {
  if (type === "error") {
    toast.error(message);
    return;
  }

  toast.success(message);
}
