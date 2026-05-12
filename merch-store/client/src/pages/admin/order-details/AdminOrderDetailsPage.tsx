import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { CustomSelect } from "@/shared/ui/select/CustomSelect";

import {
    getAdminOrderById,
    updateAdminOrderPaymentStatus,
    updateAdminOrderStatus,
} from "@/entities/order/api/order.api";
import type {
    Order,
    OrderStatus,
    PaymentStatus,
} from "@/entities/order/model/order.types";
import { formatPrice } from "@/entities/cart/lib/formatPrice";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { Icon } from "@/shared/ui/icon/Icon";

const ORDER_STATUSES: { label: string; value: OrderStatus }[] = [
    { value: "CREATED", label: "Создан" },
    { value: "CONFIRMED", label: "Подтверждён" },
    { value: "ASSEMBLING", label: "Собирается" },
    { value: "SHIPPED", label: "Отправлен" },
    { value: "DELIVERED", label: "Доставлен" },
    { value: "CANCELLED", label: "Отменён" },
];

const PAYMENT_STATUSES: { label: string; value: PaymentStatus }[] = [
    { value: "PENDING", label: "Ожидает оплаты" },
    { value: "PAID", label: "Оплачен" },
    { value: "FAILED", label: "Ошибка оплаты" },
    { value: "REFUNDED", label: "Возврат" },
];

export function AdminOrderDetailsPage() {
    const { id } = useParams();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    async function loadOrder() {
        if (!id) {
            setError("ID заказа не передан");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await getAdminOrderById(id);

            setOrder(result);
        } catch (error) {
            console.error("LOAD_ADMIN_ORDER_ERROR:", error);
            setError("Не удалось загрузить заказ");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadOrder();
    }, [id]);

    async function handleUpdateOrderStatus(status: OrderStatus) {
        if (!order) return;

        try {
            setIsUpdatingStatus(true);
            setStatusMessage(null);

            const updatedOrder = await updateAdminOrderStatus(order.id, {
                status,
            });

            setOrder(updatedOrder);
            setStatusMessage("Статус заказа обновлён");
        } catch (error) {
            console.error("UPDATE_ADMIN_ORDER_STATUS_ERROR:", error);
            setStatusMessage("Не удалось обновить статус заказа");
        } finally {
            setIsUpdatingStatus(false);
        }
    }

    async function handleUpdatePaymentStatus(paymentStatus: PaymentStatus) {
        if (!order) return;

        try {
            setIsUpdatingPayment(true);
            setStatusMessage(null);

            const updatedOrder = await updateAdminOrderPaymentStatus(order.id, {
                paymentStatus,
            });

            setOrder(updatedOrder);
            setStatusMessage("Статус оплаты обновлён");
        } catch (error) {
            console.error("UPDATE_ADMIN_PAYMENT_STATUS_ERROR:", error);
            setStatusMessage("Не удалось обновить статус оплаты");
        } finally {
            setIsUpdatingPayment(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-[28px] bg-white p-8 text-sm text-neutral-500 shadow-sm">
                Загружаем заказ...
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="rounded-[28px] bg-white p-8 shadow-sm">
                <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-black">
                    Заказ не найден
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    {error ?? "Возможно, заказ был удалён или недоступен."}
                </p>

                <Link
                    to="/admin/orders"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                    Назад к заказам
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                    <Link
                        to="/admin/orders"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black shadow-sm transition hover:bg-neutral-100"
                    >
                        <Icon name="arrow-left" className="h-4 w-4" />
                        Назад к заказам
                    </Link>

                    <h1 className="mt-6 text-[32px] font-semibold tracking-[-0.04em] text-black">
                        Заказ #{order.orderNumber}
                    </h1>

                    <p className="mt-2 text-sm text-neutral-500">
                        Создан: {formatDateTime(order.createdAt)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <StatusBadge>
                        {getOrderStatusLabel(order.status)}
                    </StatusBadge>

                    <StatusBadge variant="light">
                        {getPaymentStatusLabel(order.paymentStatus)}
                    </StatusBadge>
                </div>
            </div>

            {statusMessage && (
                <div className="mt-5 rounded-2xl bg-white px-5 py-4 text-sm text-neutral-600 shadow-sm">
                    {statusMessage}
                </div>
            )}

            <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
                <section className="space-y-6">
                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-black">
                            Товары
                        </h2>

                        <div className="mt-5 hidden grid-cols-[1fr_120px_100px_120px] border-b border-neutral-100 pb-4 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400 md:grid">
                            <span>Товар</span>
                            <span className="text-right">Цена</span>
                            <span className="text-right">Кол-во</span>
                            <span className="text-right">Сумма</span>
                        </div>

                        <div>
                            {order.items.map((item) => (
                                <article
                                    key={item.id}
                                    className="grid grid-cols-[80px_1fr] gap-5 border-b border-neutral-100 py-5 last:border-b-0 md:grid-cols-[80px_1fr_120px_100px_120px]"
                                >
                                    <div className="h-20 w-20 overflow-hidden rounded-2xl bg-neutral-100">
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

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold uppercase leading-5 text-black">
                                            {item.title}
                                        </p>

                                        {(item.size || item.color) && (
                                            <p className="mt-2 text-sm text-neutral-500">
                                                {[item.size, item.color]
                                                    .filter(Boolean)
                                                    .join(" / ")}
                                            </p>
                                        )}

                                        <Link
                                            to={`/products/${item.slug}`}
                                            className="mt-3 inline-flex text-sm font-medium text-neutral-500 transition hover:text-black"
                                        >
                                            Открыть товар
                                        </Link>

                                        <div className="mt-4 grid grid-cols-3 gap-3 text-sm md:hidden">
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

                                    <div className="hidden text-right text-sm font-semibold text-black md:block">
                                        {formatPrice(item.unitPrice)}
                                    </div>

                                    <div className="hidden text-right text-sm font-semibold text-black md:block">
                                        {item.quantity}
                                    </div>

                                    <div className="hidden text-right text-sm font-semibold text-black md:block">
                                        {formatPrice(item.totalPrice)}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-black">
                            Итоги
                        </h2>

                        <div className="mt-5 space-y-4">
                            <SummaryRow
                                label="Сумма товаров"
                                value={formatPrice(order.subtotal)}
                            />

                            <SummaryRow
                                label="Доставка"
                                value={formatPrice(order.deliveryPrice)}
                            />

                            {order.discountTotal > 0 && (
                                <SummaryRow
                                    label="Скидка"
                                    value={`-${formatPrice(
                                        order.discountTotal,
                                    )}`}
                                />
                            )}

                            <div className="border-t border-neutral-100 pt-4">
                                <SummaryRow
                                    label="Итого"
                                    value={formatPrice(order.total)}
                                    strong
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-black">
                            Управление
                        </h2>

                        <div className="mt-5 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-black">
                                    Статус заказа
                                </label>

                                <CustomSelect<OrderStatus>
                                    value={order.status}
                                    options={ORDER_STATUSES}
                                    placeholder="Выберите статус заказа"
                                    disabled={isUpdatingStatus}
                                    onChange={(value) => {
                                        if (!value) return;
                                        void handleUpdateOrderStatus(value);
                                    }}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-black">
                                    Статус оплаты
                                </label>

                                <CustomSelect<PaymentStatus>
                                    value={order.paymentStatus}
                                    options={PAYMENT_STATUSES}
                                    placeholder="Выберите статус оплаты"
                                    disabled={isUpdatingPayment}
                                    onChange={(value) => {
                                        if (!value) return;
                                        void handleUpdatePaymentStatus(value);
                                    }}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-black">
                            Клиент
                        </h2>

                        <div className="mt-5 space-y-5">
                            <DetailItem
                                label="ФИО"
                                value={order.customerName}
                            />

                            <DetailItem
                                label="Телефон"
                                value={order.customerPhone}
                            />

                            <DetailItem
                                label="Email"
                                value={order.customerEmail ?? "Не указан"}
                            />
                        </div>
                    </div>

                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-black">
                            Доставка
                        </h2>

                        <div className="mt-5 space-y-5">
                            <DetailItem
                                label="Служба"
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

                            {order.deliveryTariffCode && (
                                <DetailItem
                                    label="Тариф"
                                    value={order.deliveryTariffCode}
                                />
                            )}

                            <DetailItem
                                label="Адрес"
                                value={formatOrderAddress(order)}
                            />

                            {order.deliveryComment && (
                                <DetailItem
                                    label="Комментарий курьеру"
                                    value={order.deliveryComment}
                                />
                            )}

                            {order.cdekCityCode && (
                                <DetailItem
                                    label="CDEK city code"
                                    value={order.cdekCityCode}
                                />
                            )}

                            {order.cdekPvzCode && (
                                <DetailItem
                                    label="CDEK ПВЗ"
                                    value={order.cdekPvzCode}
                                />
                            )}

                            {order.cdekTrackNumber && (
                                <DetailItem
                                    label="Трек-номер"
                                    value={order.cdekTrackNumber}
                                />
                            )}
                        </div>
                    </div>

                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-black">
                            Системная информация
                        </h2>

                        <div className="mt-5 space-y-5">
                            <DetailItem label="ID заказа" value={order.id} />

                            <DetailItem
                                label="ID пользователя"
                                value={order.userId ?? "Не указан"}
                            />

                            <DetailItem
                                label="Создан"
                                value={formatDateTime(order.createdAt)}
                            />

                            <DetailItem
                                label="Обновлён"
                                value={formatDateTime(order.updatedAt)}
                            />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function MobileInfo({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-neutral-400">{label}</p>
            <p className="mt-1 font-semibold text-black">{value}</p>
        </div>
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
        <div className="flex items-center justify-between gap-5 text-sm">
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
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-neutral-400">
                {label}
            </p>
            <p className="mt-1 break-words text-sm font-medium leading-6 text-black">
                {value}
            </p>
        </div>
    );
}

function StatusBadge({
    children,
    variant = "dark",
}: {
    children: string;
    variant?: "dark" | "light";
}) {
    return (
        <span
            className={
                variant === "dark"
                    ? "inline-flex rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
                    : "inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm"
            }
        >
            {children}
        </span>
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
        day: "2-digit",
        month: "2-digit",
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
        CUSTOM: "Своя доставка",
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