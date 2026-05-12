import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangeEmailModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-[calc(100%-24px)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-2xl md:p-9">
        <div className="flex items-start justify-between gap-5">
          <h2 className="text-[36px] font-bold tracking-[-0.05em]">
            Изменить email
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-neutral-200"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        <form className="mt-7 space-y-7">
          <Field label="Новый email" type="email" />

          <Field label="Пароль" type="password" />

          <button
            type="submit"
            className="h-14 w-full rounded-full bg-black text-base font-bold text-white transition hover:bg-neutral-800"
          >
            Сохранить изменения
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type }: { label: string; type: string }) {
  return (
    <label className="block">
      <span className="mb-3 block text-lg font-medium text-black">
        {label}
      </span>

      <input
        type={type}
        className="h-16 w-full rounded-2xl border border-neutral-300 bg-white px-6 text-lg outline-none transition focus:border-black"
      />
    </label>
  );
}