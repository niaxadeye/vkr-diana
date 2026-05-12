import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { App } from "@/app/App";
import { AuthProvider } from "@/app/providers/AuthProvider";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />

      <Toaster
        position="top-center"
        theme="light"
        richColors={false}
        closeButton={false}
        duration={2200}
        toastOptions={{
          classNames: {
            toast:
              "rounded-full border border-neutral-200 bg-white px-5 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)]",
            title: "text-[14px] font-medium text-[#060606]",
            description: "text-[13px] text-[#666666]",
            actionButton:
              "rounded-full bg-[#060606] px-4 py-2 text-[13px] font-medium text-white",
            cancelButton:
              "rounded-full bg-[#f0f0f0] px-4 py-2 text-[13px] font-medium text-[#060606]",
          },
        }}
      />
    </AuthProvider>
  </StrictMode>,
);