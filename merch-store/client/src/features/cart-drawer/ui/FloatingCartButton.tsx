
import { Icon } from "@/shared/ui/icon/Icon";
import { useCartStore } from "@/entities/cart/model/cart.store";
type FloatingCartButtonProps = {
  count: number;
  onClick: () => void;
};

export function FloatingCartButton({
  count,
  onClick,

}: FloatingCartButtonProps) {
  const totalQuantity = useCartStore((state) => state.getTotalQuantity());
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-black shadow-lg transition hover:bg-neutral-200 md:hidden"
      aria-label="Открыть корзину"
    >
      <Icon
        name={totalQuantity > 0 ? "cart-filled" : "cart-empty"}
        className="h-6 w-6"
      />

      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[13px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}