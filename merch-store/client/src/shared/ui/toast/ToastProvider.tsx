import { AlertCircle, CheckCircle, X } from "lucide-react";

import { useToastStore } from "./toast.store";

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed left-1/2 top-5 z-[200] flex w-[calc(100%-24px)] max-w-[420px] -translate-x-1/2 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-4 text-sm font-medium text-black shadow-lg"
        >
          {toast.type === "error" ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-black" />
          ) : (
            <CheckCircle className="h-5 w-5 shrink-0 text-black" />
          )}

          <p className="flex-1">{toast.message}</p>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-black"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}