import { useEffect, useMemo, useState } from "react";

import {
    deleteAdminProduct,
    getAdminProducts,
    type AdminProduct,
} from "@/entities/product/api/adminProduct.api";
import { Button } from "@/shared/ui/button/Button";
import { ButtonLink } from "@/shared/ui/button/ButtonLink";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { useToastStore } from "@/shared/ui/toast/toast.store";

function formatPrice(value: number) {
    return `${new Intl.NumberFormat("ru-RU").format(value)}₽`;
}

function getProductStockInfo(product: AdminProduct) {
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
        totalStock,
        reservedStock,
        availableStock,
    };
}

function getStatusLabel(status: AdminProduct["status"]) {
    const labels: Record<AdminProduct["status"], string> = {
        DRAFT: "Черновик",
        ACTIVE: "Активен",
        ARCHIVED: "Архив",
    };

    return labels[status] ?? status;
}

export function AdminProductsPage() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const showToast = useToastStore((state) => state.showToast);

    const filteredProducts = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return products;
        }

        return products.filter((product) => {
            return (
                product.title.toLowerCase().includes(normalizedSearch) ||
                product.slug.toLowerCase().includes(normalizedSearch)
            );
        });
    }, [products, search]);

    async function loadProducts() {
        setIsLoading(true);

        try {
            const data = await getAdminProducts();
            setProducts(data);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: string) {
        const confirmed = window.confirm("Архивировать товар?");

        if (!confirmed) return;

        await deleteAdminProduct(id);

        showToast({
            type: "success",
            message: "Товар архивирован",
        });

        await loadProducts();
    }

    useEffect(() => {
        void loadProducts();
    }, []);

    return (
        <div>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <h1 className="text-[36px] font-semibold tracking-[-0.05em] text-black">
                        Товары
                    </h1>

                    <p className="mt-2 max-w-[680px] text-[15px] leading-6 text-neutral-500">
                        Управление товарами, остатками, изображениями и статусами.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={() => void loadProducts()}
                        className="h-11 rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm transition hover:bg-neutral-100"
                    >
                        Обновить
                    </button>

                    <ButtonLink to="/admin/products/create" variant="black">
                        Добавить товар
                    </ButtonLink>
                </div>
            </div>

            <section className="mt-8 rounded-[28px] bg-white p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Поиск по названию или slug"
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-[15px] outline-none transition focus:border-black md:max-w-[420px]"
                    />

                    <div className="text-sm text-neutral-500">
                        Всего товаров:{" "}
                        <span className="font-semibold text-black">
                            {filteredProducts.length}
                        </span>
                    </div>
                </div>
            </section>

            <section className="mt-5">
                {isLoading ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center text-neutral-500 shadow-sm">
                        Загрузка...
                    </div>
                ) : products.length === 0 ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center text-neutral-500 shadow-sm">
                        Товаров пока нет
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center shadow-sm">
                        <p className="text-[15px] font-medium text-black">
                            Ничего не найдено
                        </p>
                        <p className="mt-1 text-[14px] text-neutral-500">
                            Попробуйте изменить поисковый запрос.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function ProductCard({
    product,
    onDelete,
}: {
    product: AdminProduct;
    onDelete: (id: string) => void | Promise<void>;
}) {
    const image = product.images[0]?.url;
    const { totalStock, reservedStock, availableStock } =
        getProductStockInfo(product);

    const isLowStock = availableStock > 0 && availableStock <= 3;
    const isOutOfStock = availableStock <= 0;

    return (
        <article className="flex min-h-[520px] flex-col overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-neutral-100 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative aspect-[4/5] bg-neutral-100">
                {image ? (
                    <img
                        src={getMediaUrl(image)}
                        alt={product.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                        Нет фото
                    </div>
                )}

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm">
                        {getStatusLabel(product.status)}
                    </span>

                    {isOutOfStock && (
                        <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            Нет в наличии
                        </span>
                    )}

                    {isLowStock && (
                        <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            Мало
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div>
                    <h2 className="line-clamp-2 text-[17px] font-semibold uppercase leading-6 tracking-[-0.02em] text-black">
                        {product.title}
                    </h2>

                    <p className="mt-2 line-clamp-1 text-[13px] text-neutral-500">
                        /products/{product.slug}
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <ProductMetric label="Цена" value={formatPrice(product.price)} />

                    <ProductMetric
                        label="Доступно"
                        value={`${availableStock} шт.`}
                        accent={isOutOfStock}
                    />

                    <ProductMetric label="Всего" value={`${totalStock} шт.`} />

                    <ProductMetric
                        label="Резерв"
                        value={`${reservedStock} шт.`}
                    />
                </div>

                {product.variants.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-neutral-400">
                            Варианты
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {product.variants.slice(0, 8).map((variant) => {
                                const available = Math.max(
                                    0,
                                    variant.stock - variant.reservedStock,
                                );

                                return (
                                    <span
                                        key={variant.id}
                                        className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                                    >
                                        {variant.size}: {available}
                                    </span>
                                );
                            })}

                            {product.variants.length > 8 && (
                                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                                    +{product.variants.length - 8}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-auto flex gap-2 pt-6">
                    <ButtonLink
                        to={`/admin/products/${product.id}/edit`}
                        variant="secondary"
                    >
                        Изменить
                    </ButtonLink>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => onDelete(product.id)}
                    >
                        Удалить
                    </Button>
                </div>
            </div>
        </article>
    );
}

function ProductMetric({
    label,
    value,
    accent = false,
}: {
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div className="rounded-2xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">{label}</p>
            <p
                className={
                    accent
                        ? "mt-1 text-[15px] font-semibold text-red-600"
                        : "mt-1 text-[15px] font-semibold text-black"
                }
            >
                {value}
            </p>
        </div>
    );
}