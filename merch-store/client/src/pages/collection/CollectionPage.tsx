import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import {
    getCollectionBySlug,
    type CollectionListItem,
} from "@/entities/collection/api/collection.api";
import {
    getProducts,
    type ProductListItem,
} from "@/entities/product/api/product.api";
import { ProductCard } from "@/entities/product/ui/ProductCard";

export function CollectionPage() {
    const { slug } = useParams<{ slug: string }>();

    const [collection, setCollection] = useState<CollectionListItem | null>(null);
    const [products, setProducts] = useState<ProductListItem[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadCollectionPage() {
        if (!slug) return;

        setIsLoading(true);
        setError(null);

        try {
            const collectionData = await getCollectionBySlug(slug);

            setCollection(collectionData);

            const productsResponse = await getProducts({
                page: 1,
                limit: 100,
                collectionId: collectionData.id,
            });

            setProducts(productsResponse.data);
        } catch (error) {
            console.error("LOAD_COLLECTION_PAGE_ERROR:", error);
            setError("Не удалось загрузить коллекцию");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadCollectionPage();
    }, [slug]);

    return (
        <main className="min-h-screen bg-white px-4 pb-4 pt-4 xl:px-4 xl:pt-12">
            <div className="mx-auto max-w-[1680px]">
                {isLoading ? (
                    <>
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <div className="h-11 w-[280px] animate-pulse rounded bg-neutral-100" />
                            </div>

                            <div className="h-5 w-[90px] animate-pulse rounded bg-neutral-100" />
                        </div>

                        <ProductSkeletonGrid />
                    </>
                ) : error ? (
                    <div className="rounded-3xl bg-neutral-100 px-6 py-12 text-center">
                        <p className="text-[15px] text-neutral-500">{error}</p>

                        <button
                            type="button"
                            onClick={loadCollectionPage}
                            className="mt-5 h-10 rounded-full bg-black px-5 text-[15px] text-white"
                        >
                            Повторить
                        </button>
                    </div>
                ) : !collection ? (
                    <div className="rounded-3xl bg-neutral-100 px-6 py-12 text-center">
                        <p className="text-[15px] text-neutral-500">
                            Коллекция не найдена.
                        </p>

                        <Link
                            to="/catalog"
                            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[15px] text-white"
                        >
                            Перейти в каталог
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <h1 className="h2">{collection.title}</h1>

                                {collection.description && (
                                    <p className="mt-2 max-w-[640px] text-[15px] leading-6 text-[#666666]">
                                        {collection.description}
                                    </p>
                                )}
                            </div>

                            <p className="shrink-0 text-[15px] text-neutral-500">
                                {products.length} товаров
                            </p>
                        </div>

                        {products.length === 0 ? (
                            <div className="rounded-3xl bg-neutral-100 px-6 py-12 text-center">
                                <p className="text-[15px] text-neutral-500">
                                    В этой коллекции пока нет активных товаров.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

function ProductSkeletonGrid() {
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                    <div className="aspect-[3/4] animate-pulse bg-neutral-100" />
                    <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                    <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
                </div>
            ))}
        </div>
    );
}