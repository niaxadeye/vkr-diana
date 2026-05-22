import { useEffect, useMemo, useState } from "react";

import {
    addAdminRecommendedProduct,
    deleteAdminRecommendedProduct,
    getAdminRecommendedProducts,
    updateAdminRecommendedProduct,
    type AdminRecommendedProduct,
} from "@/entities/recommended-product/api/recommended-product.admin.api";
import {
    getProducts,
    type ProductListItem,
} from "@/entities/product/api/product.api";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { cn } from "@/shared/lib/cn";

export function AdminRecommendedProductsPage() {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [recommendedItems, setRecommendedItems] = useState<AdminRecommendedProduct[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const recommendedProductIds = useMemo(() => {
        return new Set(recommendedItems.map((item) => item.productId));
    }, [recommendedItems]);

    const sortedRecommendedItems = useMemo(() => {
        return [...recommendedItems].sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) {
                return a.sortOrder - b.sortOrder;
            }

            return a.product.title.localeCompare(b.product.title);
        });
    }, [recommendedItems]);

    async function loadData() {
        try {
            setIsLoading(true);
            setError("");

            const [productsResponse, recommendedResponse] = await Promise.all([
                getProducts({
                    page: 1,
                    limit: 100,
                }),
                getAdminRecommendedProducts(),
            ]);

            setProducts(productsResponse.data);
            setRecommendedItems(recommendedResponse);
        } catch (loadError) {
            console.error("LOAD_RECOMMENDED_ADMIN_ERROR:", loadError);
            setError("Не удалось загрузить товары");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadData();
    }, []);

    async function handleAddProduct(product: ProductListItem) {
        if (recommendedProductIds.has(product.id)) {
            return;
        }

        try {
            setIsSaving(true);

            const maxSortOrder =
                recommendedItems.length > 0
                    ? Math.max(...recommendedItems.map((item) => item.sortOrder))
                    : 0;

            const createdItem = await addAdminRecommendedProduct({
                productId: product.id,
                sortOrder: maxSortOrder + 10,
                isActive: true,
            });

            setRecommendedItems((prev) => [...prev, createdItem]);
        } catch (addError) {
            console.error("ADD_RECOMMENDED_PRODUCT_ERROR:", addError);
            alert("Не удалось добавить товар в рекомендации");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteItem(itemId: string) {
        const confirmed = window.confirm("Убрать товар из рекомендованной секции?");

        if (!confirmed) {
            return;
        }

        try {
            setIsSaving(true);

            await deleteAdminRecommendedProduct(itemId);

            setRecommendedItems((prev) => prev.filter((item) => item.id !== itemId));
        } catch (deleteError) {
            console.error("DELETE_RECOMMENDED_PRODUCT_ERROR:", deleteError);
            alert("Не удалось удалить товар из рекомендаций");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggleActive(item: AdminRecommendedProduct) {
        try {
            setIsSaving(true);

            const updatedItem = await updateAdminRecommendedProduct(item.id, {
                isActive: !item.isActive,
            });

            setRecommendedItems((prev) =>
                prev.map((currentItem) =>
                    currentItem.id === item.id ? updatedItem : currentItem,
                ),
            );
        } catch (updateError) {
            console.error("TOGGLE_RECOMMENDED_PRODUCT_ERROR:", updateError);
            alert("Не удалось изменить статус товара");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSortOrderChange(item: AdminRecommendedProduct, value: string) {
        const nextSortOrder = Number(value);

        if (!Number.isFinite(nextSortOrder)) {
            return;
        }

        setRecommendedItems((prev) =>
            prev.map((currentItem) =>
                currentItem.id === item.id
                    ? {
                          ...currentItem,
                          sortOrder: nextSortOrder,
                      }
                    : currentItem,
            ),
        );
    }

    async function handleSaveSortOrder(item: AdminRecommendedProduct) {
        try {
            setIsSaving(true);

            const updatedItem = await updateAdminRecommendedProduct(item.id, {
                sortOrder: item.sortOrder,
            });

            setRecommendedItems((prev) =>
                prev.map((currentItem) =>
                    currentItem.id === item.id ? updatedItem : currentItem,
                ),
            );
        } catch (updateError) {
            console.error("UPDATE_RECOMMENDED_SORT_ORDER_ERROR:", updateError);
            alert("Не удалось сохранить порядок товара");
        } finally {
            setIsSaving(false);
        }
    }

    function getProductImage(product: ProductListItem) {
        const image = product.images?.[0];

        if (!image?.url) {
            return "";
        }

        return getMediaUrl(image.url);
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#f6f6f6] p-6">
                <div className="rounded-2xl bg-white p-8 text-[15px] text-[#666666]">
                    Загружаем товары...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f6f6f6] p-4 md:p-6">
            <div className="mx-auto max-w-[1480px]">
                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[13px] font-medium uppercase text-[#777777]">
                            Админ-панель
                        </p>

                        <h1 className="mt-2 text-[28px] font-medium leading-[36px] text-black md:text-[36px] md:leading-[44px]">
                            Рекомендованные товары
                        </h1>

                        <p className="mt-2 max-w-[620px] text-[15px] leading-[22px] text-[#666666]">
                            Здесь настраиваются товары, которые отображаются в секции рекомендаций
                            на главной странице.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadData()}
                        disabled={isSaving}
                        className="h-11 rounded-xl bg-black px-5 text-[14px] font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Обновить
                    </button>
                </div>

                {error ? (
                    <div className="mb-6 rounded-2xl bg-red-50 p-4 text-[15px] text-red-700">
                        {error}
                    </div>
                ) : null}

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_520px]">
                    <div className="rounded-2xl bg-white p-4 md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[20px] font-medium text-black">
                                Все товары
                            </h2>

                            <span className="text-[14px] text-[#777777]">
                                {products.length} шт.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {products.map((product) => {
                                const isAdded = recommendedProductIds.has(product.id);
                                const imageUrl = getProductImage(product);

                                return (
                                    <article
                                        key={product.id}
                                        className="flex gap-3 rounded-2xl border border-[#eeeeee] p-3"
                                    >
                                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f4f4f4]">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <h3 className="line-clamp-2 text-[14px] font-medium leading-[19px] text-black">
                                                {product.title}
                                            </h3>

                                            <p className="mt-1 text-[13px] text-[#777777]">
                                                {product.status}
                                            </p>

                                            <button
                                                type="button"
                                                disabled={isAdded || isSaving}
                                                onClick={() => void handleAddProduct(product)}
                                                className={cn(
                                                    "mt-auto h-9 rounded-xl px-3 text-[13px] font-medium transition disabled:cursor-not-allowed",
                                                    isAdded
                                                        ? "bg-[#f1f1f1] text-[#999999]"
                                                        : "bg-black text-white hover:bg-[#222222]",
                                                )}
                                            >
                                                {isAdded ? "Добавлен" : "Добавить"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>

                    <aside className="rounded-2xl bg-white p-4 md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[20px] font-medium text-black">
                                В секции
                            </h2>

                            <span className="text-[14px] text-[#777777]">
                                {recommendedItems.length} шт.
                            </span>
                        </div>

                        {sortedRecommendedItems.length === 0 ? (
                            <div className="rounded-2xl bg-[#f7f7f7] p-5 text-[15px] leading-[22px] text-[#666666]">
                                Пока товары не выбраны. Добавь товары из списка слева.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {sortedRecommendedItems.map((item) => {
                                    const imageUrl = getProductImage(item.product);

                                    return (
                                        <article
                                            key={item.id}
                                            className="rounded-2xl border border-[#eeeeee] p-3"
                                        >
                                            <div className="flex gap-3">
                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f4f4f4]">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={item.product.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="line-clamp-2 text-[14px] font-medium leading-[19px] text-black">
                                                        {item.product.title}
                                                    </h3>

                                                    <p className="mt-1 text-[13px] text-[#777777]">
                                                        ID товара: {item.productId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                                                <label className="block">
                                                    <span className="mb-1 block text-[12px] text-[#777777]">
                                                        Порядок
                                                    </span>

                                                    <input
                                                        type="number"
                                                        value={item.sortOrder}
                                                        onChange={(event) =>
                                                            void handleSortOrderChange(
                                                                item,
                                                                event.target.value,
                                                            )
                                                        }
                                                        onBlur={() => void handleSaveSortOrder(item)}
                                                        className="h-10 w-full rounded-xl border border-[#dddddd] px-3 text-[14px] outline-none transition focus:border-black"
                                                    />
                                                </label>

                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => void handleToggleActive(item)}
                                                    className={cn(
                                                        "mt-5 h-10 rounded-xl px-3 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                                                        item.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-[#eeeeee] text-[#777777]",
                                                    )}
                                                >
                                                    {item.isActive ? "Активен" : "Скрыт"}
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isSaving}
                                                onClick={() => void handleDeleteItem(item.id)}
                                                className="mt-3 h-10 w-full rounded-xl border border-[#dddddd] text-[13px] font-medium text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Убрать из секции
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </aside>
                </section>
            </div>
        </main>
    );
}