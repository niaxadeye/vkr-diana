import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { getAdminOrders } from "@/entities/order/api/order.api";
import type { Order } from "@/entities/order/model/order.types";
import {
    getAdminProducts,
    type AdminProduct,
} from "@/entities/product/api/adminProduct.api";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";

type InventoryRow = {
    key: string;
    productId: string;
    productTitle: string;
    productSlug: string;
    imageUrl?: string | null;
    variantId?: string | null;
    size: string;
    color?: string | null;
    sku: string;
    stock: number;
    reservedStock: number;
    availableStock: number;

    activeOrderReservedQuantity: number;
    reserveMismatch: number;

    createdQuantity: number;
    confirmedQuantity: number;
    assemblingQuantity: number;
    shippedQuantity: number;
    deliveredQuantity: number;
    cancelledQuantity: number;
};



export function AdminInventoryPage() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [onlyProblem, setOnlyProblem] = useState(false);
    const [onlyMismatch, setOnlyMismatch] = useState(false);

    const rows = useMemo(() => {
        return buildInventoryRows(products, orders);
    }, [products, orders]);

    const filteredRows = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return rows.filter((row) => {
            const matchesSearch =
                !normalizedSearch ||
                row.productTitle.toLowerCase().includes(normalizedSearch) ||
                row.productSlug.toLowerCase().includes(normalizedSearch) ||
                row.sku.toLowerCase().includes(normalizedSearch) ||
                row.size.toLowerCase().includes(normalizedSearch) ||
                row.color?.toLowerCase().includes(normalizedSearch);

            const hasProblem =
                row.availableStock <= 0 ||
                row.reservedStock > row.stock ||
                row.availableStock <= 3;

            const hasMismatch = row.reserveMismatch !== 0;

            return (
                matchesSearch &&
                (!onlyProblem || hasProblem) &&
                (!onlyMismatch || hasMismatch)
            );
        });
    }, [rows, search, onlyProblem, onlyMismatch]);

    const summary = useMemo(() => {
        return rows.reduce(
            (acc, row) => {
                acc.stock += row.stock;
                acc.reserved += row.reservedStock;
                acc.available += row.availableStock;

                acc.activeReserved += row.activeOrderReservedQuantity;
                acc.mismatch += Math.abs(row.reserveMismatch);

                acc.created += row.createdQuantity;
                acc.confirmed += row.confirmedQuantity;
                acc.assembling += row.assemblingQuantity;
                acc.shipped += row.shippedQuantity;
                acc.delivered += row.deliveredQuantity;
                acc.cancelled += row.cancelledQuantity;

                if (row.availableStock <= 3) {
                    acc.lowStock += 1;
                }

                if (row.availableStock <= 0) {
                    acc.outOfStock += 1;
                }

                if (row.reserveMismatch !== 0) {
                    acc.mismatchRows += 1;
                }

                return acc;
            },
            {
                stock: 0,
                reserved: 0,
                available: 0,

                activeReserved: 0,
                mismatch: 0,

                created: 0,
                confirmed: 0,
                assembling: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0,

                lowStock: 0,
                outOfStock: 0,
                mismatchRows: 0,
            },
        );
    }, [rows]);

    async function loadInventory() {
        try {
            setIsLoading(true);
            setError(null);

            const [productsData, ordersResult] = await Promise.all([
                getAdminProducts(),
                getAdminOrders({
                    page: 1,
                    limit: 100,
                }),
            ]);

            setProducts(productsData);
            setOrders(ordersResult.items);
        } catch (error) {
            console.error("LOAD_ADMIN_INVENTORY_ERROR:", error);
            setError("Не удалось загрузить остатки");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadInventory();
    }, []);

    if (isLoading) {
        return (
            <div className="rounded-[28px] bg-white p-8 text-[15px] text-neutral-500 shadow-sm">
                Загружаем остатки...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[28px] bg-white p-8 shadow-sm">
                <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-black">
                    Остатки
                </h1>

                <p className="mt-2 text-[15px] text-red-600">{error}</p>

                <button
                    type="button"
                    onClick={() => void loadInventory()}
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
                        Остатки
                    </h1>

                    <p className="mt-2 max-w-[820px] text-[15px] leading-6 text-neutral-500">
                        Складская сводка по вариантам товаров. Резерв берётся из
                        ProductVariant.reservedStock, а активные заказы считаются
                        отдельно по статусам CREATED, CONFIRMED и ASSEMBLING.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadInventory()}
                    className="h-11 rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm transition hover:bg-neutral-100"
                >
                    Обновить
                </button>
            </div>

            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <InventoryMetric
                    label="На складе"
                    value={`${summary.stock} шт.`}
                    description={`Доступно: ${summary.available} шт.`}
                />

                <InventoryMetric
                    label="В резерве"
                    value={`${summary.reserved} шт.`}
                    description={`Активные заказы: ${summary.activeReserved} шт.`}
                    danger={summary.mismatchRows > 0}
                />

                <InventoryMetric
                    label="В пути / доставлено"
                    value={`${summary.shipped} / ${summary.delivered}`}
                    description={`Отменено: ${summary.cancelled} шт.`}
                />

                <InventoryMetric
                    label="Проблемы"
                    value={`${summary.lowStock} поз.`}
                    description={`Расхождений: ${summary.mismatchRows}`}
                    danger={summary.lowStock > 0 || summary.mismatchRows > 0}
                />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-3">
                <InventoryStatusCard
                    title="Активный резерв"
                    items={[
                        ["Создано", summary.created],
                        ["Подтверждено", summary.confirmed],
                        ["Собирается", summary.assembling],
                    ]}
                />

                <InventoryStatusCard
                    title="Логистика"
                    items={[
                        ["В пути", summary.shipped],
                        ["Доставлено", summary.delivered],
                        ["Отменено", summary.cancelled],
                    ]}
                />

                <InventoryStatusCard
                    title="Контроль"
                    items={[
                        ["Низкий остаток", summary.lowStock],
                        ["Нет в наличии", summary.outOfStock],
                        ["Расхождения", summary.mismatchRows],
                    ]}
                />
            </section>

            <section className="mt-5 rounded-[28px] bg-white p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Поиск по товару, slug, SKU, размеру или цвету"
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-[15px] outline-none transition focus:border-black xl:max-w-[520px]"
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={() => setOnlyProblem((value) => !value)}
                            className={
                                onlyProblem
                                    ? "h-12 rounded-full bg-black px-5 text-[15px] font-medium text-white transition hover:bg-neutral-800"
                                    : "h-12 rounded-full bg-neutral-100 px-5 text-[15px] font-medium text-black transition hover:bg-neutral-200"
                            }
                        >
                            Только проблемные
                        </button>

                        <button
                            type="button"
                            onClick={() => setOnlyMismatch((value) => !value)}
                            className={
                                onlyMismatch
                                    ? "h-12 rounded-full bg-black px-5 text-[15px] font-medium text-white transition hover:bg-neutral-800"
                                    : "h-12 rounded-full bg-neutral-100 px-5 text-[15px] font-medium text-black transition hover:bg-neutral-200"
                            }
                        >
                            Только расхождения
                        </button>

                        <div className="text-sm text-neutral-500">
                            Позиций:{" "}
                            <span className="font-semibold text-black">
                                {filteredRows.length}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-5">
                {filteredRows.length === 0 ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center shadow-sm">
                        <p className="text-[15px] font-medium text-black">
                            Ничего не найдено
                        </p>

                        <p className="mt-1 text-[14px] text-neutral-500">
                            Попробуйте изменить поиск или фильтры.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 xl:grid-cols-2">
                        {filteredRows.map((row) => (
                            <InventoryCard key={row.key} row={row} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function InventoryCard({ row }: { row: InventoryRow }) {
    const isOutOfStock = row.availableStock <= 0;
    const isLowStock = row.availableStock > 0 && row.availableStock <= 3;
    const hasReserveProblem = row.reservedStock > row.stock;
    const hasMismatch = row.reserveMismatch !== 0;

    return (
        <article className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-neutral-100">
            <div className="grid gap-5 sm:grid-cols-[96px_1fr]">
                <div className="h-32 w-24 overflow-hidden rounded-[22px] bg-neutral-100">
                    {row.imageUrl ? (
                        <img
                            src={getMediaUrl(row.imageUrl)}
                            alt={row.productTitle}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-neutral-400">
                            Нет фото
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div className="min-w-0">
                            <h2 className="line-clamp-2 text-[18px] font-semibold uppercase leading-6 tracking-[-0.03em] text-black">
                                {row.productTitle}
                            </h2>

                            <p className="mt-1 line-clamp-1 text-[13px] text-neutral-500">
                                /products/{row.productSlug}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {isOutOfStock && (
                                <Badge variant="dark">Нет в наличии</Badge>
                            )}

                            {isLowStock && <Badge variant="dark">Мало</Badge>}

                            {hasReserveProblem && (
                                <Badge variant="danger">Резерв больше склада</Badge>
                            )}

                            {hasMismatch && (
                                <Badge variant="danger">Резерв не сходится</Badge>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge>Размер: {row.size || "—"}</Badge>
                        <Badge>Цвет: {row.color || "—"}</Badge>
                        <Badge>SKU: {row.sku || "—"}</Badge>
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InventoryValue label="На складе" value={row.stock} />
                <InventoryValue label="В резерве БД" value={row.reservedStock} />
                <InventoryValue
                    label="Активные заказы"
                    value={row.activeOrderReservedQuantity}
                    accent={hasMismatch}
                />
                <InventoryValue
                    label="Доступно"
                    value={row.availableStock}
                    accent={isOutOfStock || isLowStock}
                />

                <InventoryValue label="Создано" value={row.createdQuantity} />
                <InventoryValue label="Подтверждено" value={row.confirmedQuantity} />
                <InventoryValue label="Собирается" value={row.assemblingQuantity} />
                <InventoryValue label="В пути" value={row.shippedQuantity} />
                <InventoryValue label="Доставлено" value={row.deliveredQuantity} />
                <InventoryValue label="Отменено" value={row.cancelledQuantity} />
            </div>

            {hasMismatch && (
                <div className="mt-5 rounded-[22px] bg-red-50 p-4 text-[14px] leading-5 text-red-700">
                    Резерв в базе отличается от количества товаров в активных
                    заказах на{" "}
                    <span className="font-semibold">
                        {Math.abs(row.reserveMismatch)} шт.
                    </span>
                    . Это может быть следствием старых заказов или ручного изменения
                    остатков.
                </div>
            )}

            <div className="mt-5 flex justify-end">
                <Link
                    to={`/admin/products/${row.productId}/edit`}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[15px] font-medium text-white transition hover:bg-neutral-800"
                >
                    Изменить товар
                </Link>
            </div>
        </article>
    );
}

function buildInventoryRows(
    products: AdminProduct[],
    orders: Order[],
): InventoryRow[] {
    const orderStatsByVariantId = new Map<
        string,
        {
            createdQuantity: number;
            confirmedQuantity: number;
            assemblingQuantity: number;
            shippedQuantity: number;
            deliveredQuantity: number;
            cancelledQuantity: number;
        }
    >();

    for (const order of orders) {
        for (const item of order.items) {
            const variantId = getOrderItemVariantId(item);

            if (!variantId) continue;

            const current = orderStatsByVariantId.get(variantId) ?? {
                createdQuantity: 0,
                confirmedQuantity: 0,
                assemblingQuantity: 0,
                shippedQuantity: 0,
                deliveredQuantity: 0,
                cancelledQuantity: 0,
            };

            if (order.status === "CREATED") {
                current.createdQuantity += item.quantity;
            }

            if (order.status === "CONFIRMED") {
                current.confirmedQuantity += item.quantity;
            }

            if (order.status === "ASSEMBLING") {
                current.assemblingQuantity += item.quantity;
            }

            if (order.status === "SHIPPED") {
                current.shippedQuantity += item.quantity;
            }

            if (order.status === "DELIVERED") {
                current.deliveredQuantity += item.quantity;
            }

            if (order.status === "CANCELLED") {
                current.cancelledQuantity += item.quantity;
            }

            orderStatsByVariantId.set(variantId, current);
        }
    }

    return products.flatMap((product) => {
        const imageUrl = product.images[0]?.url;

        return product.variants.map((variant) => {
            const stats = orderStatsByVariantId.get(variant.id) ?? {
                createdQuantity: 0,
                confirmedQuantity: 0,
                assemblingQuantity: 0,
                shippedQuantity: 0,
                deliveredQuantity: 0,
                cancelledQuantity: 0,
            };

            const activeOrderReservedQuantity =
                stats.createdQuantity +
                stats.confirmedQuantity +
                stats.assemblingQuantity;

            const reserveMismatch =
                variant.reservedStock - activeOrderReservedQuantity;

            return {
                key: `${product.id}-${variant.id}`,
                productId: product.id,
                productTitle: product.title,
                productSlug: product.slug,
                imageUrl,
                variantId: variant.id,
                size: variant.size,
                color: variant.color,
                sku: variant.sku,
                stock: variant.stock,
                reservedStock: variant.reservedStock,
                availableStock: Math.max(
                    0,
                    variant.stock - variant.reservedStock,
                ),

                activeOrderReservedQuantity,
                reserveMismatch,

                createdQuantity: stats.createdQuantity,
                confirmedQuantity: stats.confirmedQuantity,
                assemblingQuantity: stats.assemblingQuantity,
                shippedQuantity: stats.shippedQuantity,
                deliveredQuantity: stats.deliveredQuantity,
                cancelledQuantity: stats.cancelledQuantity,
            };
        });
    });
}

function getOrderItemVariantId(item: Order["items"][number]) {
    const possibleItem = item as Order["items"][number] & {
        productVariantId?: string | null;
        variantId?: string | null;
    };

    return possibleItem.productVariantId ?? possibleItem.variantId ?? null;
}

function InventoryMetric({
    label,
    value,
    description,
    danger = false,
}: {
    label: string;
    value: string;
    description: string;
    danger?: boolean;
}) {
    return (
        <article
            className={
                danger
                    ? "rounded-[28px] bg-red-50 p-5 shadow-sm ring-1 ring-red-100"
                    : "rounded-[28px] bg-white p-5 shadow-sm"
            }
        >
            <p className={danger ? "text-sm text-red-700" : "text-sm text-neutral-500"}>
                {label}
            </p>
            <p
                className={
                    danger
                        ? "mt-3 text-[32px] font-semibold tracking-[-0.05em] text-red-700"
                        : "mt-3 text-[32px] font-semibold tracking-[-0.05em] text-black"
                }
            >
                {value}
            </p>
            <p className={danger ? "mt-2 text-sm text-red-700" : "mt-2 text-sm text-neutral-500"}>
                {description}
            </p>
        </article>
    );
}

function InventoryStatusCard({
    title,
    items,
}: {
    title: string;
    items: [string, number][];
}) {
    return (
        <article className="rounded-[28px] bg-white p-5 shadow-sm">
            <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-black">
                {title}
            </h2>

            <div className="mt-4 grid gap-2">
                {items.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3"
                    >
                        <span className="text-sm text-neutral-600">{label}</span>
                        <span className="text-sm font-semibold text-black">
                            {value} шт.
                        </span>
                    </div>
                ))}
            </div>
        </article>
    );
}

function InventoryValue({
    label,
    value,
    accent = false,
}: {
    label: string;
    value: number;
    accent?: boolean;
}) {
    return (
        <div className="rounded-2xl bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">{label}</p>
            <p
                className={
                    accent
                        ? "mt-1 text-[20px] font-semibold text-red-600"
                        : "mt-1 text-[20px] font-semibold text-black"
                }
            >
                {value} шт.
            </p>
        </div>
    );
}

function Badge({
    children,
    variant = "light",
}: {
    children: React.ReactNode;
    variant?: "light" | "dark" | "danger";
}) {
    const className =
        variant === "dark"
            ? "rounded-full bg-black px-3 py-1 text-xs font-semibold text-white"
            : variant === "danger"
              ? "rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
              : "rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700";

    return <span className={className}>{children}</span>;
}