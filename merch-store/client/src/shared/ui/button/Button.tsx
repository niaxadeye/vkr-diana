import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type ButtonVariant = "black" | "white" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({
  variant = "black",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full px-5 text-[15px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",

        variant === "black" &&
          "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900",

        variant === "white" &&
          "bg-white text-black hover:bg-neutral-100 active:bg-neutral-200",

        variant === "secondary" &&
          "bg-neutral-100 text-black hover:bg-neutral-200 active:bg-neutral-300",

        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",

        className,
      )}
    >
      {children}
    </button>
  );
}