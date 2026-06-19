import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useMediaQuery } from "@/shared/lib/useMediaQuery";

type ResponsiveModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  busy?: boolean;
};

export function ResponsiveModal({
  open,
  onClose,
  title,
  children,
  busy = false,
}: ResponsiveModalProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  function handleClose() {
    if (busy) return;
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120]">
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={
              isMobile
                ? { y: "100%" }
                : { opacity: 0, scale: 0.96, y: "-46%", x: "-50%" }
            }
            animate={
              isMobile
                ? { y: 0 }
                : { opacity: 1, scale: 1, y: "-50%", x: "-50%" }
            }
            exit={
              isMobile
                ? { y: "100%" }
                : { opacity: 0, scale: 0.96, y: "-46%", x: "-50%" }
            }
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            className={
              isMobile
                ? "absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-6 pb-8 shadow-2xl"
                : "absolute left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-24px)] max-w-[560px] overflow-y-auto rounded-[28px] bg-white p-9 shadow-2xl"
            }
          >
            {isMobile && (
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-neutral-200" />
            )}

            <div className="flex items-start justify-between gap-5">
              <h2 className="text-[28px] font-[500] leading-[34px] tracking-[-0.04em] text-[#060606] md:text-[36px] md:leading-[44px]">
                {title}
              </h2>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
