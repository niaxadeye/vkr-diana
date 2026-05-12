import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { getOrderById } from "@/entities/order/api/order.api";
import type { Order } from "@/entities/order/model/order.types";
import { formatPrice } from "@/entities/cart/lib/formatPrice";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { Icon } from "@/shared/ui/icon/Icon";

export function ProfileOrderPage() {
    const { id } = useParams();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadOrder() {
        if (!id) {
            setError("ID заказа не передан");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await getOrderById(id);

            setOrder(result);
        } catch (error) {
            console.error("LOAD_ORDER_ERROR:", error);
            setError("Не удалось загрузить заказ");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadOrder();
    }, [id]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-white px-5 py-10 md:px-12">
                <div className="mx-auto max-w-[1250px] rounded-2xl bg-neutral-50 p-7 text-sm text-neutral-500">
                    Загружаем заказ...
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="min-h-screen bg-white px-5 py-10 md:px-12">
                <div className="mx-auto max-w-[760px] rounded-[28px] bg-neutral-50 p-8 text-center">
                    <h1 className="text-[32px] font-semibold tracking-[-0.05em] text-black">
                        Заказ не найден
                    </h1>

                    <p className="mt-3 text-[15px] text-neutral-500">
                        {error ?? "Возможно, заказ был удалён или недоступен."}
                    </p>

                    <Link
                        to="/profile"
                        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-[15px] font-medium text-white transition hover:bg-neutral-800"
                    >
                        Вернуться в профиль
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white px-5 py-10 md:px-12">
            <div className="mx-auto max-w-[1250px]">
                <div className="flex items-center gap-4">
                    <Link
                        to="/profile"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-black transition hover:bg-black hover:text-white"
                        aria-label="Назад к профилю"
                    >
                        <Icon name="arrow-left" className="h-5 w-5" />
                    </Link>

                    <h1 className="text-[36px] font-bold tracking-[-0.04em]">
                        Заказ #{order.orderNumber}
                    </h1>
                </div>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_410px]">
                    <section>
                        <div className="hidden border-b border-neutral-200 pb-4 text-sm text-neutral-500 md:grid md:grid-cols-[1fr_120px_120px_120px]">
                            <span>Товар</span>
                            <span className="text-right">Цена</span>
                            <span className="text-right">Кол-во</span>
                            <span className="text-right">Сумма</span>
                        </div>

                        <div>
                            {order.items.map((item) => (
                                <article
                                    key={item.id}
                                    className="grid grid-cols-[80px_1fr] gap-5 border-b border-neutral-200 py-6 md:grid-cols-[80px_1fr_120px_120px_120px]"
                                >
                                    <div className="h-20 w-20 overflow-hidden bg-neutral-100">
                                        {item.imageUrl ? (
                                            <img
                                                src={getMediaUrl(item.imageUrl)}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                                                Нет фото
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold uppercase leading-5">
                                            {item.title}
                                        </p>

                                        {(item.size || item.color) && (
                                            <p className="mt-2 text-sm text-neutral-500">
                                                {[item.size, item.color]
                                                    .filter(Boolean)
                                                    .join(" / ")}
                                            </p>
                                        )}

                                        <div className="mt-3 grid grid-cols-3 gap-3 text-sm md:hidden">
                                            <MobileInfo
                                                label="Цена"
                                                value={formatPrice(
                                                    item.unitPrice,
                                                )}
                                            />
                                            <MobileInfo
                                                label="Кол-во"
                                                value={String(item.quantity)}
                                            />
                                            <MobileInfo
                                                label="Сумма"
                                                value={formatPrice(
                                                    item.totalPrice,
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="hidden text-right text-sm font-bold md:block">
                                        {formatPrice(item.unitPrice)}
                                    </div>

                                    <div className="hidden text-right text-sm font-bold md:block">
                                        {item.quantity}
                                    </div>

                                    <div className="hidden text-right text-sm font-bold md:block">
                                        {formatPrice(item.totalPrice)}
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4">
                            <OrderSummaryRow
                                label="Сумма"
                                value={formatPrice(order.subtotal)}
                            />

                            <OrderSummaryRow
                                label="Доставка"
                                value={formatPrice(order.deliveryPrice)}
                            />

                            {order.discountTotal > 0 && (
                                <OrderSummaryRow
                                    label="Скидка"
                                    value={`-${formatPrice(
                                        order.discountTotal,
                                    )}`}
                                />
                            )}

                            <OrderSummaryRow
                                label="Итого"
                                value={formatPrice(order.total)}
                                strong
                            />
                        </div>
                    </section>

                    <aside className="rounded-[28px] bg-neutral-50 p-7">
                        <h2 className="text-xl font-bold tracking-[-0.03em]">
                            Детали
                        </h2>

                        <div className="mt-6 space-y-6">
                            <DetailItem
                                label="Полное имя"
                                value={order.customerName}
                            />

                            <DetailItem
                                label="Телефон"
                                value={order.customerPhone}
                            />

                            <DetailItem
                                label="Адрес доставки"
                                value={formatOrderAddress(order)}
                            />

                            <DetailItem
                                label="Перевозчик"
                                value={getDeliveryProviderLabel(
                                    order.deliveryProvider,
                                )}
                            />

                            <DetailItem
                                label="Тип доставки"
                                value={getDeliveryMethodLabel(
                                    order.deliveryMethod,
                                )}
                            />

                            <DetailItem
                                label="Создан"
                                value={formatDateTime(order.createdAt)}
                            />

                            <DetailItem
                                label="Статус"
                                value={getOrderStatusLabel(order.status)}
                            />

                            <DetailItem
                                label="Оплата"
                                value={getPaymentStatusLabel(
                                    order.paymentStatus,
                                )}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function MobileInfo({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-neutral-500">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    );
}

function OrderSummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between text-base">
            <span className="text-neutral-500">{label}</span>
            <span
                className={
                    strong
                        ? "text-lg font-bold text-black"
                        : "font-semibold text-black"
                }
            >
                {value}
            </span>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-1 text-base font-medium leading-6 text-black">
                {value}
            </p>
        </div>
    );
}

function formatOrderAddress(order: Order) {
    const parts = [
        order.deliveryCity,
        order.deliveryStreet,
        `д. ${order.deliveryHouse}`,
        order.deliveryApartment ? `кв./офис ${order.deliveryApartment}` : null,
        order.deliveryEntrance ? `подъезд ${order.deliveryEntrance}` : null,
        order.deliveryFloor ? `этаж ${order.deliveryFloor}` : null,
    ].filter(Boolean);

    return parts.join(", ");
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getOrderStatusLabel(status: Order["status"]) {
    const labels: Record<Order["status"], string> = {
        CREATED: "Создан",
        CONFIRMED: "Подтверждён",
        ASSEMBLING: "Собирается",
        SHIPPED: "Отправлен",
        DELIVERED: "Доставлен",
        CANCELLED: "Отменён",
    };

    return labels[status] ?? status;
}

function getPaymentStatusLabel(status: Order["paymentStatus"]) {
    const labels: Record<Order["paymentStatus"], string> = {
        PENDING: "Ожидает оплаты",
        PAID: "Оплачен",
        FAILED: "Ошибка оплаты",
        REFUNDED: "Возврат",
    };

    return labels[status] ?? status;
}

function getDeliveryProviderLabel(provider: Order["deliveryProvider"]) {
    const labels: Record<Order["deliveryProvider"], string> = {
        CUSTOM: "Собственная доставка",
        CDEK: "CDEK",
    };

    return labels[provider] ?? provider;
}

function getDeliveryMethodLabel(method: Order["deliveryMethod"]) {
    const labels: Record<Order["deliveryMethod"], string> = {
        COURIER: "Курьер",
        PICKUP_POINT: "ПВЗ",
    };

    return labels[method] ?? method;
}