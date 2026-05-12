import { useEffect, useMemo, useState } from "react";

import {
    deleteAdminCollection,
    getAdminCollections,
    type AdminCollection,
} from "@/entities/collection/api/adminCollection.api";
import { Button } from "@/shared/ui/button/Button";
import { ButtonLink } from "@/shared/ui/button/ButtonLink";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { useToastStore } from "@/shared/ui/toast/toast.store";

export function AdminCollectionsPage() {
    const [collections, setCollections] = useState<AdminCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const showToast = useToastStore((state) => state.showToast);

    const filteredCollections = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return collections;
        }

        return collections.filter((collection) => {
            return (
                collection.title.toLowerCase().includes(normalizedSearch) ||
                collection.slug.toLowerCase().includes(normalizedSearch) ||
                collection.description
                    ?.toLowerCase()
                    .includes(normalizedSearch)
            );
        });
    }, [collections, search]);

    async function loadCollections() {
        setIsLoading(true);

        try {
            const data = await getAdminCollections();
            setCollections(data);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: string) {
        const confirmed = window.confirm("Архивировать коллекцию?");

        if (!confirmed) return;

        await deleteAdminCollection(id);

        showToast({
            type: "success",
            message: "Коллекция архивирована",
        });

        await loadCollections();
    }

    useEffect(() => {
        void loadCollections();
    }, []);

    return (
        <div>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <h1 className="text-[36px] font-semibold tracking-[-0.05em] text-black">
                        Коллекции
                    </h1>

                    <p className="mt-2 max-w-[680px] text-[15px] leading-6 text-neutral-500">
                        Управление коллекциями, дропами и подборками товаров.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={() => void loadCollections()}
                        className="h-11 rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm transition hover:bg-neutral-100"
                    >
                        Обновить
                    </button>

                    <ButtonLink to="/admin/collections/create" variant="black">
                        Добавить коллекцию
                    </ButtonLink>
                </div>
            </div>

            <section className="mt-8 rounded-[28px] bg-white p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Поиск по названию, slug или описанию"
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-[15px] outline-none transition focus:border-black md:max-w-[460px]"
                    />

                    <div className="text-sm text-neutral-500">
                        Всего коллекций:{" "}
                        <span className="font-semibold text-black">
                            {filteredCollections.length}
                        </span>
                    </div>
                </div>
            </section>

            <section className="mt-5">
                {isLoading ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center text-neutral-500 shadow-sm">
                        Загрузка...
                    </div>
                ) : collections.length === 0 ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center text-neutral-500 shadow-sm">
                        Коллекций пока нет
                    </div>
                ) : filteredCollections.length === 0 ? (
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
                        {filteredCollections.map((collection) => (
                            <CollectionCard
                                key={collection.id}
                                collection={collection}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function CollectionCard({
    collection,
    onDelete,
}: {
    collection: AdminCollection;
    onDelete: (id: string) => void | Promise<void>;
}) {
    const productsCount = collection.products?.length ?? 0;

    return (
        <article className="flex min-h-[500px] flex-col overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-neutral-100 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative aspect-[4/5] bg-neutral-100">
                {collection.imageUrl ? (
                    <img
                        src={getMediaUrl(collection.imageUrl)}
                        alt={collection.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                        Нет фото
                    </div>
                )}

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span
                        className={
                            collection.isActive
                                ? "rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow-sm"
                                : "rounded-full bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm"
                        }
                    >
                        {collection.isActive ? "Активна" : "Архив"}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm">
                        {productsCount} товаров
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div>
                    <h2 className="line-clamp-2 text-[19px] font-semibold uppercase leading-6 tracking-[-0.03em] text-black">
                        {collection.title}
                    </h2>

                    <p className="mt-2 line-clamp-1 text-[13px] text-neutral-500">
                        /collections/{collection.slug}
                    </p>

                    <p className="mt-4 line-clamp-3 text-[14px] leading-6 text-neutral-500">
                        {collection.description || "Описание не указано"}
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <CollectionMetric
                        label="Товаров"
                        value={`${productsCount} шт.`}
                    />

                    <CollectionMetric
                        label="Статус"
                        value={collection.isActive ? "Активна" : "Архив"}
                    />
                </div>

                <div className="mt-auto flex gap-2 pt-6">
                    <ButtonLink
                        to={`/admin/collections/${collection.id}/edit`}
                        variant="secondary"
                    >
                        Изменить
                    </ButtonLink>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => onDelete(collection.id)}
                    >
                        Удалить
                    </Button>
                </div>
            </div>
        </article>
    );
}

function CollectionMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 text-[15px] font-semibold text-black">
                {value}
            </p>
        </div>
    );
}