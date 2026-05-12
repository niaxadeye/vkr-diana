import { Link } from "react-router";

import { useCartStore } from "@/entities/cart/model/cart.store";
import { formatPrice } from "@/entities/cart/lib/formatPrice";
import { Icon } from "@/shared/ui/icon/Icon";
import { useAuthStore } from "@/features/auth/model/auth.store";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function hasDiscount(item: { oldPrice?: number | null; price: number }) {
  return Boolean(item.oldPrice && item.oldPrice > item.price);
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalQuantity = useCartStore((state) => state.getTotalQuantity());
  const total = useCartStore((state) => state.getTotalPrice());
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = Boolean(user);
  return (
    <div
      className={`fixed inset-0 z-[120] transition ${open ? "pointer-events-auto" : "pointer-events-none"
        }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black transition-opacity duration-250 ${open ? "opacity-45" : "opacity-0"
          }`}
      />

      <aside
        role="dialog"
        aria-label="Ваша корзина"
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-white py-5 shadow-lg transition-transform duration-250 ease-out md:w-[540px] md:py-8 ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-start px-7 md:px-8">
          <h2 className="text-[36px] font-medium leading-[44px] tracking-[-0.04em] text-[#060606]">
            Ваша корзина
          </h2>

          <sup className="ml-2 top-0.5 text-[18px] font-medium leading-6 text-[#666666]">
            {totalQuantity}
          </sup>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition-colors hover:bg-[#060606] hover:text-white"
            aria-label="Закрыть корзину"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex grow flex-col overflow-y-auto px-7 md:px-8">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f0f0]">
                <Icon name="cart-empty" className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-[18px] font-medium leading-6 text-[#060606]">
                Корзина пустая
              </h3>

              <p className="mt-2 max-w-[280px] text-[15px] leading-6 text-[#666666]">
                Добавь товары в корзину, чтобы перейти к оформлению заказа.
              </p>

              <Link
                to="/catalog"
                onClick={onClose}
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#060606] px-6 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const discounted = hasDiscount(item);

                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[114px_1fr_40px] gap-5 py-6 ${!isLast ? "border-b border-neutral-200" : ""
                      }`}
                  >
                    <Link
                      to={`/products/${item.slug}`}
                      onClick={onClose}
                      className="h-[152px] w-[114px] overflow-hidden bg-[#fafafa]"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          width={114}
                          height={152}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#666666]">
                          Нет фото
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-col">
                      <div>
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={onClose}
                        >
                          <h3 className="text-[15px] font-[400] uppercase leading-5 tracking-[-0.02em] text-[#060606]">
                            {item.title}
                          </h3>
                        </Link>

                        {(item.size || item.color) && (
                          <div className="mt-2 text-[15px] font-[400] leading-5 uppercase text-[#666666]">
                            {[item.size, item.color]
                              .filter(Boolean)
                              .join(" / ")}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-1.5 text-[15px] font-[400] leading-5">
                          {discounted ? (
                            <>
                              <span className="rounded-full bg-[#060606] px-2.5 py-1 font-[400] text-white">
                                {formatPrice(item.price)}
                              </span>

                              <span className="text-[#060606] line-through decoration-[#060606] font-[400] decoration-[1px]">
                                {formatPrice(item.oldPrice!)}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#060606] font-[400]">
                              {formatPrice(item.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrementItem(item.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition-colors hover:bg-[#060606] hover:text-white"
                          aria-label="Уменьшить количество"
                        >
                          <Icon name="minus" className="h-4 w-4" />
                        </button>

                        <span className="flex h-10 min-w-8 items-center justify-center text-[15px] font-medium text-[#060606]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={item.quantity >= item.maxQuantity}
                          onClick={() => incrementItem(item.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition-colors hover:bg-[#060606] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#f0f0f0] disabled:hover:text-[#060606]"
                          aria-label="Увеличить количество"
                        >
                          <Icon name="plus" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition-colors hover:bg-[#060606] hover:text-white"
                        aria-label="Удалить товар"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-7 pb-0 pt-6 md:px-8">
            <div className="flex w-full justify-between px-2.5 pb-5 text-[18px] font-medium leading-6 text-[#060606]">
              <span>Итого</span>
              <span>{formatPrice(total)}</span>
            </div>

            {!isAuthenticated && (
              <div className="mb-5 rounded-[16px] bg-[#fafafa] px-6 py-5">
                <p className="text-[15px] font-medium leading-5 text-[#060606]">
                  Обратите внимание!
                </p>

                <p className="mt-1 text-[15px] font-normal leading-5 text-[#666666]">
                  Чтобы продолжить оформление заказа, авторизуйтесь или зарегистрируйтесь
                </p>
              </div>
            )}

            <Link
              to={isAuthenticated ? "/cart" : "/login"}
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-full bg-[#060606] py-4 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800"
            >
              {isAuthenticated ? "Оформить" : "Войти"}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}