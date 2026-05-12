import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { CustomSelect } from "@/shared/ui/select/CustomSelect";
import { getAdminOrders } from "@/entities/order/api/order.api";
import type {
    AdminOrderQuery,
    DeliveryMethod,
    DeliveryProvider,
    Order,
    OrderStatus,
    PaginationMeta,
    PaymentStatus,
} from "@/entities/order/model/order.types";
import { formatPrice } from "@/entities/cart/lib/formatPrice";

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

const DELIVERY_PROVIDERS: { label: string; value: DeliveryProvider }[] = [
    { value: "CUSTOM", label: "Своя доставка" },
    { value: "CDEK", label: "CDEK" },
];

const DELIVERY_METHODS: { label: string; value: DeliveryMethod }[] = [
    { value: "COURIER", label: "Курьер" },
    { value: "PICKUP_POINT", label: "ПВЗ" },
];

const DEFAULT_META: PaginationMeta = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
};

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<OrderStatus | "">("");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
    const [deliveryProvider, setDeliveryProvider] = useState<
        DeliveryProvider | ""
    >("");
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | "">("");

    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const query = useMemo<AdminOrderQuery>(
        () => ({
            search: search.trim() || undefined,
            status: status || undefined,
            paymentStatus: paymentStatus || undefined,
            deliveryProvider: deliveryProvider || undefined,
            deliveryMethod: deliveryMethod || undefined,
            page,
            limit: 20,
        }),
        [
            search,
            status,
            paymentStatus,
            deliveryProvider,
            deliveryMethod,
            page,
        ],
    );

    async function loadOrders() {
        try {
            setIsLoading(true);
            setError(null);

            const result = await getAdminOrders(query);

            setOrders(result.items);
            setMeta(result.meta ?? DEFAULT_META);
        } catch (error) {
            console.error("LOAD_ADMIN_ORDERS_ERROR:", error);
            setError("Не удалось загрузить заказы");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadOrders();
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [query]);

    function handleResetFilters() {
        setSearch("");
        setStatus("");
        setPaymentStatus("");
        setDeliveryProvider("");
        setDeliveryMethod("");
        setPage(1);
    }

    function handlePreviousPage() {
        setPage((currentPage) => Math.max(1, currentPage - 1));
    }

    function handleNextPage() {
        setPage((currentPage) =>
            meta.pages > 0 ? Math.min(meta.pages, currentPage + 1) : currentPage,
        );
    }

    return (
        <div>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-black">
                        Заказы
                    </h1>

                    <p className="mt-2 text-sm text-neutral-500">
                        Управление заказами, статусами и оплатой.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadOrders()}
                    className="h-11 rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                    Обновить
                </button>
            </div>

            <section className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
                <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Поиск: номер, имя, телефон, email"
                        className="h-11 rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-black"
                    />

                    <CustomSelect<OrderStatus>
                        value={status}
                        options={ORDER_STATUSES}
                        placeholder="Все статусы"
                        allowEmpty
                        emptyLabel="Все статусы"
                        onChange={(value) => {
                            setStatus(value);
                            setPage(1);
                        }}
                    />

                    <CustomSelect<PaymentStatus>
                        value={paymentStatus}
                        options={PAYMENT_STATUSES}
                        placeholder="Любая оплата"
                        allowEmpty
                        emptyLabel="Любая оплата"
                        onChange={(value) => {
                            setPaymentStatus(value);
                            setPage(1);
                        }}
                    />

                    <CustomSelect<DeliveryProvider>
                        value={deliveryProvider}
                        options={DELIVERY_PROVIDERS}
                        placeholder="Любая служба"
                        allowEmpty
                        emptyLabel="Любая служба"
                        onChange={(value) => {
                            setDeliveryProvider(value);
                            setPage(1);
                        }}
                    />

                    <CustomSelect<DeliveryMethod>
                        value={deliveryMethod}
                        options={DELIVERY_METHODS}
                        placeholder="Любой тип"
                        allowEmpty
                        emptyLabel="Любой тип"
                        onChange={(value) => {
                            setDeliveryMethod(value);
                            setPage(1);
                        }}
                    />

                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="h-11 rounded-full bg-neutral-100 px-5 text-sm font-medium text-black transition hover:bg-neutral-200"
                    >
                        Сбросить
                    </button>
                </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-sm">
                <div className="hidden grid-cols-[110px_150px_1.2fr_150px_120px_150px_150px_100px] gap-4 border-b border-neutral-100 px-5 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400 xl:grid">
                    <span>Заказ</span>
                    <span>Дата</span>
                    <span>Клиент</span>
                    <span>Телефон</span>
                    <span>Сумма</span>
                    <span>Статус</span>
                    <span>Оплата</span>
                    <span></span>
                </div>

                {isLoading ? (
                    <div className="p-8 text-sm text-neutral-500">
                        Загружаем заказы...
                    </div>
                ) : error ? (
                    <div className="p-8 text-sm text-red-600">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="p-8">
                        <p className="text-sm font-medium text-black">
                            Заказы не найдены
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                            Попробуйте изменить фильтры или поисковый запрос.
                        </p>
                    </div>
                ) : (
                    <div>
                        {orders.map((order) => (
                            <OrderRow key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </section>

            <div className="mt-5 flex flex-col justify-between gap-3 rounded-[24px] bg-white p-4 text-sm text-neutral-500 shadow-sm md:flex-row md:items-center">
                <span>
                    Всего:{" "}
                    <span className="font-semibold text-black">
                        {meta.total}
                    </span>
                </span>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handlePreviousPage}
                        disabled={meta.page <= 1 || isLoading}
                        className="h-10 rounded-full bg-neutral-100 px-5 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Назад
                    </button>

                    <span>
                        Страница{" "}
                        <span className="font-semibold text-black">
                            {meta.page}
                        </span>
                        {meta.pages > 0 && (
                            <>
                                {" "}
                                из{" "}
                                <span className="font-semibold text-black">
                                    {meta.pages}
                                </span>
                            </>
                        )}
                    </span>

                    <button
                        type="button"
                        onClick={handleNextPage}
                        disabled={
                            meta.pages === 0 ||
                            meta.page >= meta.pages ||
                            isLoading
                        }
                        className="h-10 rounded-full bg-neutral-100 px-5 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Вперёд
                    </button>
                </div>
            </div>
        </div>
    );
}

function OrderRow({ order }: { order: Order }) {
    return (
        <div className="border-b border-neutral-100 px-5 py-5 last:border-b-0">
            <div className="hidden grid-cols-[110px_150px_1.2fr_150px_120px_150px_150px_100px] items-center gap-4 xl:grid">
                <div>
                    <p className="font-semibold text-black">
                        #{order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                        {getDeliveryProviderLabel(order.deliveryProvider)}
                    </p>
                </div>

                <div className="text-sm text-neutral-600">
                    {formatDate(order.createdAt)}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black">
                        {order.customerName}
                    </p>
                    {order.customerEmail && (
                        <p className="mt-1 truncate text-xs text-neutral-400">
                            {order.customerEmail}
                        </p>
                    )}
                </div>

                <div className="text-sm text-neutral-600">
                    {order.customerPhone}
                </div>

                <div className="text-sm font-semibold text-black">
                    {formatPrice(order.total)}
                </div>

                <div>
                    <StatusBadge>{getOrderStatusLabel(order.status)}</StatusBadge>
                </div>

                <div>
                    <StatusBadge variant="light">
                        {getPaymentStatusLabel(order.paymentStatus)}
                    </StatusBadge>
                </div>

                <Link
                    to={`/admin/orders/${order.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                    Открыть
                </Link>
            </div>

            <div className="xl:hidden">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-base font-semibold text-black">
                            Заказ #{order.orderNumber}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>

                    <p className="text-base font-semibold text-black">
                        {formatPrice(order.total)}
                    </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <Info label="Клиент" value={order.customerName} />
                    <Info label="Телефон" value={order.customerPhone} />
                    <Info
                        label="Доставка"
                        value={getDeliveryProviderLabel(
                            order.deliveryProvider,
                        )}
                    />
                    <Info
                        label="Оплата"
                        value={getPaymentStatusLabel(order.paymentStatus)}
                    />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <StatusBadge>{getOrderStatusLabel(order.status)}</StatusBadge>

                    <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        Открыть
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-neutral-400">{label}</p>
            <p className="mt-1 font-medium text-black">{value}</p>
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
                    ? "inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white"
                    : "inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700"
            }
        >
            {children}
        </span>
    );
}

function formatDate(value: string) {
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