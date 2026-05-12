import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon/Icon";

type SliderArrowProps = {
  direction: "prev" | "next";
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

export function SliderArrow({
  direction,
  onClick,
  className,
  ariaLabel,
}: SliderArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        ariaLabel ??
        (direction === "prev" ? "Предыдущий слайд" : "Следующий слайд")
      }
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F0F0] text-[#060606] transition-colors hover:bg-[#060606] hover:text-white active:bg-[#060606] active:text-white disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      <Icon
        name={direction === "prev" ? "arrow-left" : "arrow-right"}
        className="h-4 w-4"
      />
    </button>
  );
}