import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { getAdminOrders } from "@/entities/order/api/order.api";
import type { Order } from "@/entities/order/model/order.types";
import {
    getAdminProducts,
    type AdminProduct,
} from "@/entities/product/api/adminProduct.api";
import {
    getAdminCollections,
    type AdminCollection,
} from "@/entities/collection/api/adminCollection.api";
import { formatPrice } from "@/entities/cart/lib/formatPrice";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { Icon } from "@/shared/ui/icon/Icon";

type DashboardData = {
    orders: Order[];
    products: AdminProduct[];
    collections: AdminCollection[];
};

const EMPTY_DASHBOARD_DATA: DashboardData = {
    orders: [],
    products: [],
    collections: [],
};

const PROCESSING_ORDER_STATUSES = ["CREATED", "CONFIRMED", "ASSEMBLING"] as const;

export function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const stats = useMemo(() => {
        const paidOrders = data.orders.filter(
            (order) => order.paymentStatus === "PAID",
        );

        const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

        const processingOrders = data.orders.filter((order) =>
            PROCESSING_ORDER_STATUSES.includes(
                order.status as (typeof PROCESSING_ORDER_STATUSES)[number],
            ),
        );

        const activeProducts = data.products.filter(
            (product) => product.status === "ACTIVE",
        );

        const activeCollections = data.collections.filter(
            (collection) => collection.isActive,
        );

        const lowStockProducts = data.products
            .map((product) => {
                const totalStock = product.variants.reduce(
                    (sum, variant) => sum + variant.stock,
                    0,
                );

                const reservedStock = product.variants.reduce(
                    (sum, variant) => sum + variant.reservedStock,
                    0,
                );

                const availableStock = Math.max(0, totalStock - reservedStock);

                return {
                    product,
                    totalStock,
                    reservedStock,
                    availableStock,
                };
            })
            .filter((item) => item.product.status === "ACTIVE")
            .filter((item) => item.availableStock <= 3)
            .sort((a, b) => a.availableStock - b.availableStock)
            .slice(0, 6);

        const latestOrders = [...data.orders]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            )
            .slice(0, 6);

        return {
            revenue,
            ordersCount: data.orders.length,
            processingOrdersCount: processingOrders.length,
            productsCount: data.products.length,
            activeProductsCount: activeProducts.length,
            collectionsCount: data.collections.length,
            activeCollectionsCount: activeCollections.length,
            lowStockProducts,
            latestOrders,
        };
    }, [data]);

    async function loadDashboard() {
        try {
            setIsLoading(true);
            setError(null);

            const [ordersResult, products, collections] = await Promise.all([
                getAdminOrders({
                    page: 1,
                    limit: 100,
                }),
                getAdminProducts(),
                getAdminCollections(),
            ]);

            setData({
                orders: ordersResult.items,
                products,
                collections,
            });
        } catch (error) {
            console.error("LOAD_ADMIN_DASHBOARD_ERROR:", error);
            setError("Не удалось загрузить dashboard");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="rounded-[28px] bg-white p-8 text-[15px] text-neutral-500 shadow-sm">
                Загружаем dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[28px] bg-white p-8 shadow-sm">
                <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-black">
                    Главная
                </h1>

                <p className="mt-2 text-[15px] text-red-600">{error}</p>

                <button
                    type="button"
                    onClick={() => void loadDashboard()}
                    className="mt-6 h-11 rounded-full bg-black px-6 text-[15px] font-medium text-white transition hover:bg-neutral-800"
                >
                    Повторить
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <h1 className="text-[36px] font-semibold tracking-[-0.05em] text-black">
                        Главная
                    </h1>

                    <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-neutral-500">
                        Сводка по заказам, товарам, коллекциям и складским
                        остаткам.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadDashboard()}
                    className="h-11 rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm transition hover:bg-neutral-100"
                >
                    Обновить
                </button>
            </div>

            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <DashboardMetric
                    label="Выручка"
                    value={formatPrice(stats.revenue)}
                    description="По оплаченным заказам"
                />

                <DashboardMetric
                    label="Заказы"
                    value={String(stats.ordersCount)}
                    description={`В обработке: ${stats.processingOrdersCount}`}
                />

                <DashboardMetric
                    label="Товары"
                    value={String(stats.productsCount)}
                    description={`Активных: ${stats.activeProductsCount}`}
                />

                <DashboardMetric
                    label="Коллекции"
                    value={String(stats.collectionsCount)}
                    description={`Активных: ${stats.activeCollectionsCount}`}
                />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
                <div className="space-y-5">
                    <DashboardCard
                        title="Последние заказы"
                        action={
                            <Link
                                to="/admin/orders"
                                className="text-sm font-medium text-neutral-500 transition hover:text-black"
                            >
                                Все заказы
                            </Link>
                        }
                    >
                        {stats.latestOrders.length === 0 ? (
                            <EmptyBlock text="Заказов пока нет" />
                        ) : (
                            <div className="grid gap-3">
                                {stats.latestOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        to={`/admin/orders/${order.id}`}
                                        className="grid gap-4 rounded-[22px] bg-neutral-50 p-4 transition hover:bg-neutral-100 md:grid-cols-[120px_1fr_130px_120px]"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-black">
                                                #{order.orderNumber}
                                            </p>
                                            <p className="mt-1 text-xs text-neutral-500">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-black">
                                                {order.customerName}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-neutral-500">
                                                {order.customerPhone}
                                            </p>
                                        </div>

                                        <div>
                                            <StatusBadge>
                                                {getOrderStatusLabel(order.status)}
                                            </StatusBadge>
                                        </div>

                                        <div className="text-sm font-semibold text-black md:text-right">
                                            {formatPrice(order.total)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </DashboardCard>

                    <DashboardCard
                        title="Быстрые действия"
                    >
                        <div className="grid gap-3 sm:grid-cols-3">
                            <QuickAction
                                to="/admin/products/create"
                                title="Добавить товар"
                                description="Создать новую карточку"
                            />

                            <QuickAction
                                to="/admin/collections/create"
                                title="Добавить коллекцию"
                                description="Создать новый дроп"
                            />

                            <QuickAction
                                to="/admin/orders"
                                title="Обработать заказы"
                                description="Перейти к списку заказов"
                            />
                        </div>
                    </DashboardCard>
                </div>

                <aside className="space-y-5">
                    <DashboardCard
                        title="Низкие остатки"
                        action={
                            <Link
                                to="/admin/products"
                                className="text-sm font-medium text-neutral-500 transition hover:text-black"
                            >
                                Все товары
                            </Link>
                        }
                    >
                        {stats.lowStockProducts.length === 0 ? (
                            <EmptyBlock text="Критичных остатков нет" />
                        ) : (
                            <div className="grid gap-3">
                                {stats.lowStockProducts.map(({ product, availableStock }) => {
                                    const image = product.images[0]?.url;

                                    return (
                                        <Link
                                            key={product.id}
                                            to={`/admin/products/${product.id}/edit`}
                                            className="grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-[22px] bg-neutral-50 p-3 transition hover:bg-neutral-100"
                                        >
                                            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-neutral-100">
                                                {image ? (
                                                    <img
                                                        src={getMediaUrl(image)}
                                                        alt={product.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                                                        Нет фото
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="line-clamp-2 text-sm font-semibold uppercase leading-5 text-black">
                                                    {product.title}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    /products/{product.slug}
                                                </p>
                                            </div>

                                            <div className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                                                {availableStock} шт.
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </DashboardCard>

                    <DashboardCard title="Статусы заказов">
                        <div className="grid gap-3">
                            <OrderStatusLine
                                label="Создан"
                                count={countOrdersByStatus(data.orders, "CREATED")}
                            />
                            <OrderStatusLine
                                label="Подтверждён"
                                count={countOrdersByStatus(
                                    data.orders,
                                    "CONFIRMED",
                                )}
                            />
                            <OrderStatusLine
                                label="Собирается"
                                count={countOrdersByStatus(
                                    data.orders,
                                    "ASSEMBLING",
                                )}
                            />
                            <OrderStatusLine
                                label="Отправлен"
                                count={countOrdersByStatus(data.orders, "SHIPPED")}
                            />
                            <OrderStatusLine
                                label="Доставлен"
                                count={countOrdersByStatus(
                                    data.orders,
                                    "DELIVERED",
                                )}
                            />
                            <OrderStatusLine
                                label="Отменён"
                                count={countOrdersByStatus(
                                    data.orders,
                                    "CANCELLED",
                                )}
                            />
                        </div>
                    </DashboardCard>
                </aside>
            </section>
        </div>
    );
}

function DashboardMetric({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <article className="rounded-[28px] bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-3 text-[32px] font-semibold tracking-[-0.05em] text-black">
                {value}
            </p>
            <p className="mt-2 text-sm text-neutral-500">{description}</p>
        </article>
    );
}

function DashboardCard({
    title,
    children,
    action,
}: {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <section className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-black">
                    {title}
                </h2>

                {action}
            </div>

            <div className="mt-5">{children}</div>
        </section>
    );
}

function QuickAction({
    to,
    title,
    description,
}: {
    to: string;
    title: string;
    description: string;
}) {
    return (
        <Link
            to={to}
            className="group rounded-[24px] bg-neutral-50 p-4 transition hover:bg-black"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                <Icon name="plus" className="h-4 w-4" />
            </div>

            <p className="mt-4 text-[15px] font-semibold text-black transition group-hover:text-white">
                {title}
            </p>

            <p className="mt-1 text-sm leading-5 text-neutral-500 transition group-hover:text-white/70">
                {description}
            </p>
        </Link>
    );
}

function StatusBadge({ children }: { children: string }) {
    return (
        <span className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            {children}
        </span>
    );
}

function EmptyBlock({ text }: { text: string }) {
    return (
        <div className="rounded-[22px] bg-neutral-50 p-5 text-sm text-neutral-500">
            {text}
        </div>
    );
}

function OrderStatusLine({
    label,
    count,
}: {
    label: string;
    count: number;
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600">{label}</span>
            <span className="text-sm font-semibold text-black">{count}</span>
        </div>
    );
}

function countOrdersByStatus(
    orders: Order[],
    status: Order["status"],
) {
    return orders.filter((order) => order.status === status).length;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
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