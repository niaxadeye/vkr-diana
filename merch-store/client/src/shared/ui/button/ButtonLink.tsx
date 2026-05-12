import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router";

import { cn } from "@/shared/lib/cn";

type ButtonLinkProps = LinkProps & {
  variant?: "black" | "white" | "secondary" | "danger";
  children: ReactNode;
};

export function ButtonLink({
  variant = "black",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full px-5 text-[15px] font-medium transition-colors",

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
    </Link>
  );
}