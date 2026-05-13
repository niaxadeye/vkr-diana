import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronDown, Pencil } from "lucide-react";

import { useCartStore } from "@/entities/cart/model/cart.store";
import { formatPrice } from "@/entities/cart/lib/formatPrice";
import type { DeliveryType } from "@/entities/delivery-address/model/deliveryAddress.types";
import {
  createDeliveryAddress,
  getDeliveryAddresses,
} from "@/entities/delivery-address/api/deliveryAddress.api";
import type {
  DeliveryAddress,
  DeliveryAddressFormValues,
} from "@/entities/delivery-address/model/deliveryAddress.types";
import type { CdelReciveCalcTariff } from "@/pages/cart/cdek.type"
import { DeliveryAddressForm } from "@/entities/delivery-address/ui/DeliveryAddressForm";
import { formatDeliveryAddress } from "@/entities/delivery-address/lib/formatDeliveryAddress";

import { createOrder } from "@/entities/order/api/order.api";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { Icon } from "@/shared/ui/icon/Icon";
import { apiClient } from "@/shared/api/apiClient";

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const user = useAuthStore((state) => state.user);

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<number | null>(null);

  const [cdekPrice, setCdekPrice] = useState<number | null>(null);

  const [cdekDelivery, setCdekDelivery] = useState<CdelReciveCalcTariff | null>(null);
  const [cdekLoading, setCdekLoading] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  const total = subtotal + (cdekPrice ?? 0);

  // --- Загрузка адресов ---
  async function loadAddresses() {
    if (!user) return;
    try {
      setAddressesLoading(true);
      const result = await getDeliveryAddresses();
      setAddresses(result);
      const defaultAddress = result.find((a) => a.isDefault) ?? result[0] ?? null;
      setSelectedAddressId(defaultAddress?.id ?? null);
    } catch (err) {
      console.error("LOAD_CHECKOUT_ADDRESSES_ERROR:", err);
    } finally {
      setAddressesLoading(false);
    }
  }

  useEffect(() => {
    void loadAddresses();
  }, [user]);

  async function handleCreateAddress(values: DeliveryAddressFormValues) {
    const address = await createDeliveryAddress(values);
    setAddresses((curr) => [address, ...curr]);
    setSelectedAddressId(address.id);
    setAddressFormOpen(false);
    setAddressDropdownOpen(false);
    await loadAddresses();
  }

  // --- Расчет доставки через CDEK API ---
  // --- Расчет доставки через CDEK API ---
  const deliveryRequestPayload = useMemo(() => {
    if (!selectedAddress || items.length === 0) return null;

    const metrics = items.reduce(
      (acc, item) => {
        const weight = (item.weightGram ?? 0) * item.quantity;
        const length = item.lengthCm ?? 0;
        const width = item.widthCm ?? 0;
        const height = item.heightCm ?? 0;
        return {
          totalWeight: acc.totalWeight + weight,
          maxLength: Math.max(acc.maxLength, length),
          maxWidth: Math.max(acc.maxWidth, width),
          maxHeight: Math.max(acc.maxHeight, height),
        };
      },
      { totalWeight: 0, maxLength: 0, maxWidth: 0, maxHeight: 0 }
    );

    return {
      fromCity: "Москва",
      toCity: selectedAddress.cdekCityCode,
      weightGram: metrics.totalWeight,
      lengthCm: metrics.maxLength,
      widthCm: metrics.maxWidth,
      heightCm: metrics.maxHeight,
      deliveryType: selectedAddress.deliveryType, // courier | cdek_pickup
    };
  }, [items, selectedAddress]);

  async function fetchCdekPrice() {
    if (!selectedAddress || items.length === 0) return;

    try {
      setCdekLoading(true);

      const payload = {
        fromCity: "Москва",
        toCity: selectedAddress.cdekCityCode,
        weightGram: items.reduce((sum, item) => sum + (item.weightGram ?? 0) * item.quantity, 0),
        lengthCm: Math.max(...items.map(item => item.lengthCm ?? 0)),
        widthCm: Math.max(...items.map(item => item.widthCm ?? 0)),
        heightCm: Math.max(...items.map(item => item.heightCm ?? 0)),
        tariff: selectedAddress.deliveryType === "courier" ? 136 : 137,
        deliveryType: selectedAddress.deliveryType === "courier" ? "ADDRESS" : "PVZ",
      };

      const response = await apiClient.post<CdelReciveCalcTariff>("/cdek/calc", payload);
      setCdekDelivery(response.data);
      setCdekPrice(cdekDelivery?.data.total_sum ?? 0)
    } catch (err) {
      console.error("CDEK_PRICE_ERROR", err);
      setCdekDelivery({ data: { total_sum: 0, calendar_min: 0, calendar_max: 0 } });
    } finally {
      setCdekLoading(false);
    }
  }

  useEffect(() => {
    void fetchCdekPrice();
  }, [deliveryRequestPayload]);

  useEffect(() => {
    void fetchCdekPrice();
  }, [selectedAddress]);

  // --- Оформление заказа ---
  async function handleSubmitOrder() {
    if (!selectedAddress) {
      setOrderError("Выберите адрес доставки");
      return;
    }

    try {
      setIsSubmittingOrder(true);
      setOrderError(null);

      const deliveryMethod = mapDeliveryTypeToMethod(selectedAddress.deliveryType);

      const order = await createOrder({
        customer: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          email: user?.email ?? null,
        },
        deliveryAddress: {
          city: selectedAddress.city,
          street: selectedAddress.street ?? "",
          house: selectedAddress.house ?? "",
          apartment: selectedAddress.apartment,
          entrance: selectedAddress.entrance,
          floor: selectedAddress.floor,
          courierComment: selectedAddress.courierComment,
        },
        delivery: {
          provider: "CDEK",
          method: deliveryMethod,
          price: cdekPrice ?? 0,
          tariffCode: "", // при необходимости
          cdekCityCode: selectedAddress.cdekCityCode,
          cdekPvzCode: selectedAddress.cdekPvzCode,
        },
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId as string,
          quantity: item.quantity,
        })),
        promoCode: promoCode.trim() || null,
      });

      clearCart();
      setCreatedOrderNumber(order.orderNumber);
    } catch (err) {
      console.error("CREATE_ORDER_ERROR", err);
      setOrderError("Не удалось оформить заказ. Проверьте данные и наличие товаров.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  // --- Утилита маппинга ---
  function mapDeliveryTypeToMethod(
    deliveryType: DeliveryType
  ): "COURIER" | "PICKUP_POINT" {
    switch (deliveryType) {
      case "courier":
        return "COURIER";
      case "cdek_pickup":
        return "PICKUP_POINT";
      default:
        return "COURIER";
    }
  }

  useEffect(() => {
    void fetchCdekPrice();
  }, [deliveryRequestPayload]);


  // --- Рендер ---
  if (!user) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[760px] rounded-[28px] bg-neutral-50 p-8 text-center">
          <h1 className="text-[32px] font-semibold text-black">
            Войдите, чтобы оформить заказ
          </h1>
          <p className="mt-4 text-[16px] text-neutral-500">
            Корзина сохранится на этом устройстве, но оформить заказ можно только
            после входа в аккаунт.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-white"
            >
              Войти
            </Link>
            <Link
              to="/catalog"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-black ring-1 ring-neutral-200"
            >
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (createdOrderNumber) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[760px] rounded-[28px] bg-neutral-50 p-8 text-center">
          <h1 className="text-[32px] font-semibold text-black">Заказ оформлен</h1>
          <p className="mt-4 text-[16px] text-neutral-500">
            Номер заказа:{" "}
            <span className="font-semibold text-black">
              #{createdOrderNumber}
            </span>
          </p>
          <Link
            to="/catalog"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-black text-white"
          >
            Вернуться в каталог
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-4 md:px-8 md:py-12">
      <div className="mx-auto max-w-[1256px]">
        <h1 className="text-[24px] font-[500] md:text-[36px]">Оформление заказа</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[28px] bg-neutral-50 p-8">
            <h2 className="text-[22px] font-semibold tracking-[-0.04em]">
              Корзина пустая
            </h2>
            <p className="mt-2 text-[15px] text-neutral-500">
              Добавьте товары в корзину, чтобы оформить заказ.
            </p>
            <Link
              to="/catalog"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-[15px] font-medium text-white transition hover:bg-neutral-800"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="mt-0 grid gap-10 md:mt-8 lg:grid-cols-[1fr_360px]">
            <section>
              <div className="hidden border-b border-neutral-200 pb-4 text-[16px] font-[400] text-neutral-500 text-[#060606] md:grid md:grid-cols-[1fr_120px]">
                <span>Товар</span>
                <span className="text-right">Цена</span>
              </div>

              <div>
                {items.map((item, index) => {
                  const isLast = index === items.length - 1;
                  const hasOldPrice = Boolean(item.oldPrice && item.oldPrice > item.price);

                  return (
                    <article
                      key={item.id}
                      className={`grid grid-cols-[112px_1fr] gap-4 py-6 md:grid-cols-[120px_1fr] md:gap-5 ${!isLast ? "border-b border-neutral-200" : ""
                        }`}
                    >
                      <Link
                        to={`/products/${item.slug}`}
                        className="h-[150px] w-[112px] overflow-hidden bg-neutral-100 md:h-[160px] md:w-[120px]"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                            Нет фото
                          </div>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-col justify-between">
                        <div className="min-w-0">
                          <Link to={`/products/${item.slug}`}>
                            <h2 className="text-[15px] font-[400] uppercase leading-5 tracking-[-0.02em] text-[#060606]">
                              {item.title}
                            </h2>
                          </Link>
                          {(item.size || item.color) && (
                            <p className="mt-2 text-[15px] font-[400] uppercase text-[#666666]">
                              {[item.size, item.color].filter(Boolean).join(" / ")}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            {hasOldPrice ? (
                              <>
                                <span className="rounded-full bg-[#060606] px-2 py-0.5 text-[14px] font-[600] leading-5 text-white">
                                  {formatPrice(item.price)}
                                </span>
                                <span className="text-[14px] font-[400] text-[#666666] line-through">
                                  {formatPrice(item.oldPrice!)}
                                </span>
                              </>
                            ) : (
                              <span className="text-[15px] font-[400] text-[#060606]">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => decrementItem(item.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white"
                              aria-label="Уменьшить количество"
                            >
                              <Icon name="minus" className="h-4 w-4" />
                            </button>

                            <span className="w-5 text-center text-[15px] font-[400] text-[#060606]">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={item.quantity >= item.maxQuantity}
                              onClick={() => incrementItem(item.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Увеличить количество"
                            >
                              <Icon name="plus" className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white"
                            aria-label="Удалить товар"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <SummaryRow
                label="Сумма"
                value={formatPrice(subtotal)}
              />
              <SummaryRow
                label="Доставка"
                value={cdekLoading ? "Считаем..." : formatPrice(cdekDelivery?.data.total_sum ?? 0)}
              />
              <SummaryRow
                label="Итого"
                value={formatPrice(subtotal + (cdekPrice ?? 0))}
                strong
              />
            </section>

            <aside className="lg:pt-1">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-[400]">Доставить в</h2>

                <button
                  type="button"
                  onClick={() => setAddressFormOpen((v) => !v)}
                  className="inline-flex items-center gap-2 text-[15px] font-[500] text-neutral-500 transition hover:text-black"
                >
                  <Pencil size={15} />
                  Добавить
                </button>
              </div>

              {addressesLoading ? (
                <div className="mt-3 rounded-[16px] border border-neutral-200 px-4 py-4 text-[14px] text-neutral-500">
                  Загружаем адреса...
                </div>
              ) : addresses.length > 0 ? (
                <div className="relative mt-3">
                  <button
                    type="button"
                    onClick={() => setAddressDropdownOpen((v) => !v)}
                    className="flex min-h-[64px] w-full items-center justify-between gap-4 rounded-[16px] border border-neutral-300 bg-white px-4 py-3 text-left transition hover:border-black"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-black">
                        {selectedAddress?.title ?? "Выберите адрес"}
                      </p>
                      {selectedAddress && (
                        <p className="mt-1 line-clamp-1 text-[14px] text-neutral-500">
                          {formatDeliveryAddress(selectedAddress)}
                        </p>
                      )}
                    </div>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition ${addressDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {addressDropdownOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-xl">
                      {addresses.map((address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(address.id);
                          }}
                          className="block w-full border-b border-neutral-100 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-50"
                        >
                          <p className="text-[15px] font-medium text-black">{address.title}</p>
                          <p className="mt-1 text-[14px] leading-5 text-neutral-500">
                            {formatDeliveryAddress(address)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3 rounded-[16px] border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <p className="text-[14px] font-medium text-black">Адрес доставки не выбран</p>
                  <p className="mt-1 text-[14px] text-neutral-500">
                    Добавьте адрес, чтобы продолжить оформление.
                  </p>
                </div>
              )}

              {addressFormOpen && (
                <div className="mt-5 rounded-[20px] bg-neutral-50 p-5">
                  <DeliveryAddressForm
                    submitLabel="Добавить адрес"
                    onSubmit={handleCreateAddress}
                    onCancel={() => setAddressFormOpen(false)}
                  />
                </div>
              )}

              <div className="mt-6">
                <label className="text-[15px] font-[400] text-black">Промокод</label>
                <div className="mt-3 flex h-[48px] rounded-[16px] border border-neutral-300 p-1">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Введите промокод"
                    className="min-w-0 flex-1 bg-transparent px-3 text-[14px] font-[400] outline-none placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    className="rounded-[12px] bg-neutral-100 px-5 text-[15px] font-[500] text-black transition hover:bg-neutral-200"
                  >
                    Применить
                  </button>
                </div>
              </div>

              {orderError && (
                <div className="mt-4 rounded-[16px] bg-red-50 px-4 py-3 text-[14px] text-red-600">{orderError}</div>
              )}

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmittingOrder || !selectedAddress || items.length === 0}
                className="mt-6 h-14 w-full rounded-full bg-black text-[15px] font-[500] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                {isSubmittingOrder
                  ? "Оформляем..."
                  : `Оплатить ${formatPrice(total)}`}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[16px]">
      <span className="text-neutral-500">{label}</span>
      <span className={strong ? "font-semibold text-black" : "text-black"}>{value}</span>
    </div>
  );
}
