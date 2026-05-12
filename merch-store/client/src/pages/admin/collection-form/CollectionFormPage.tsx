import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
    createAdminCollection,
    getAdminCollectionById,
    updateAdminCollection,
    type CollectionPayload,
} from "@/entities/collection/api/adminCollection.api";
import { uploadCollectionImage } from "@/shared/api/upload.api";
import { Button } from "@/shared/ui/button/Button";
import { UploadImageButton } from "@/shared/ui/upload-image-button/UploadImageButton";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { useToastStore } from "@/shared/ui/toast/toast.store";

const emptyCollection: CollectionPayload = {
    title: "",
    slug: "",
    description: "",
    imageUrl: "",
    isActive: true,
};

function validateCollectionForm(payload: CollectionPayload) {
    if (!payload.title.trim()) return "Введите название коллекции";
    if (!payload.slug.trim()) return "Введите slug коллекции";

    return null;
}

export function CollectionFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);

    const navigate = useNavigate();
    const showToast = useToastStore((state) => state.showToast);

    const [form, setForm] = useState<CollectionPayload>(emptyCollection);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(Boolean(id));

    useEffect(() => {
        if (!id) return;

        async function loadCollection() {
            try {
                setIsPageLoading(true);

                const collection = await getAdminCollectionById(id!);

                setForm({
                    title: collection.title,
                    slug: collection.slug,
                    description: collection.description ?? "",
                    imageUrl: collection.imageUrl ?? "",
                    isActive: collection.isActive,
                });
            } catch (error) {
                console.error("LOAD_ADMIN_COLLECTION_ERROR:", error);

                showToast({
                    type: "error",
                    message: "Коллекция не найдена",
                });

                navigate("/admin/collections");
            } finally {
                setIsPageLoading(false);
            }
        }

        void loadCollection();
    }, [id, navigate, showToast]);

    function updateField<K extends keyof CollectionPayload>(
        key: K,
        value: CollectionPayload[K],
    ) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function generateSlug() {
        const slug = form.title
            .toLowerCase()
            .trim()
            .replace(/[^\wа-яё\s-]/gi, "")
            .replace(/\s+/g, "-");

        updateField("slug", slug);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload: CollectionPayload = {
            title: form.title.trim(),
            slug: form.slug.trim(),
            description: form.description?.trim() || null,
            imageUrl: form.imageUrl?.trim() || null,
            isActive: form.isActive,
        };

        const validationError = validateCollectionForm(payload);

        if (validationError) {
            showToast({
                type: "error",
                message: validationError,
            });

            return;
        }

        setIsLoading(true);

        try {
            if (isEdit && id) {
                await updateAdminCollection(id, payload);

                showToast({
                    type: "success",
                    message: "Коллекция обновлена",
                });
            } else {
                await createAdminCollection(payload);

                showToast({
                    type: "success",
                    message: "Коллекция создана",
                });
            }

            navigate("/admin/collections");
        } catch (error) {
            console.error("CREATE_OR_UPDATE_COLLECTION_ERROR:", error);

            showToast({
                type: "error",
                message: isEdit
                    ? "Не удалось обновить коллекцию"
                    : "Не удалось создать коллекцию",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isPageLoading) {
        return (
            <div className="rounded-[28px] bg-white p-8 text-[15px] text-neutral-500 shadow-sm">
                Загружаем коллекцию...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-[1280px]">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <Link
                        to="/admin/collections"
                        className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm transition hover:bg-neutral-100"
                    >
                        Назад к коллекциям
                    </Link>

                    <h1 className="mt-6 text-[36px] font-semibold tracking-[-0.05em] text-black">
                        {isEdit ? "Редактировать коллекцию" : "Добавить коллекцию"}
                    </h1>

                    <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-neutral-500">
                        Настройка названия, изображения, статуса и описания
                        коллекции.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/admin/collections")}
                    >
                        Отмена
                    </Button>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Сохраняем..." : "Сохранить"}
                    </Button>
                </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                    <FormCard title="Основное">
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Название">
                                <input
                                    value={form.title}
                                    onChange={(event) =>
                                        updateField("title", event.target.value)
                                    }
                                    className="input"
                                    placeholder="PRO KIT 25-26"
                                />
                            </Field>

                            <Field label="Slug">
                                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                    <input
                                        value={form.slug}
                                        onChange={(event) =>
                                            updateField("slug", event.target.value)
                                        }
                                        className="input"
                                        placeholder="pro-kit-25-26"
                                    />

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={generateSlug}
                                    >
                                        Сгенерировать
                                    </Button>
                                </div>
                            </Field>
                        </div>

                        <Field label="Описание" className="mt-5">
                            <textarea
                                value={form.description ?? ""}
                                onChange={(event) =>
                                    updateField(
                                        "description",
                                        event.target.value,
                                    )
                                }
                                className="input min-h-[160px] py-3"
                                placeholder="Описание коллекции"
                            />
                        </Field>
                    </FormCard>

                    <FormCard title="Изображение коллекции">
                        <ImageUploader
                            title={form.title}
                            imageUrl={form.imageUrl ?? ""}
                            onChange={(value) => updateField("imageUrl", value)}
                            onUpload={async (file) => {
                                const uploaded = await uploadCollectionImage(file);

                                updateField("imageUrl", uploaded.url);

                                showToast({
                                    type: "success",
                                    message: "Изображение загружено",
                                });
                            }}
                        />
                    </FormCard>

                    <FormCard title="Публикация">
                        <button
                            type="button"
                            onClick={() => updateField("isActive", !form.isActive)}
                            className={`flex w-full items-center justify-between gap-4 rounded-[22px] border p-5 text-left transition ${
                                form.isActive
                                    ? "border-black bg-black text-white"
                                    : "border-neutral-200 bg-neutral-50 text-black hover:border-neutral-400"
                            }`}
                        >
                            <div>
                                <p className="text-[17px] font-semibold">
                                    {form.isActive
                                        ? "Коллекция активна"
                                        : "Коллекция в архиве"}
                                </p>

                                <p
                                    className={`mt-1 text-[14px] leading-5 ${
                                        form.isActive
                                            ? "text-white/70"
                                            : "text-neutral-500"
                                    }`}
                                >
                                    {form.isActive
                                        ? "Покупатели смогут видеть коллекцию на сайте."
                                        : "Коллекция будет скрыта от покупателей."}
                                </p>
                            </div>

                            <span
                                className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                                    form.isActive ? "bg-white" : "bg-neutral-300"
                                }`}
                            >
                                <span
                                    className={`h-5 w-5 rounded-full transition ${
                                        form.isActive
                                            ? "translate-x-5 bg-black"
                                            : "translate-x-0 bg-white"
                                    }`}
                                />
                            </span>
                        </button>
                    </FormCard>
                </div>

                <aside className="space-y-6">
                    <PreviewCard collection={form} />

                    <FormCard title="Сводка">
                        <SummaryItem
                            label="Название"
                            value={form.title || "Не указано"}
                        />

                        <SummaryItem
                            label="Slug"
                            value={form.slug || "Не указан"}
                        />

                        <SummaryItem
                            label="Статус"
                            value={form.isActive ? "Активна" : "Архив"}
                        />

                        <SummaryItem
                            label="Изображение"
                            value={form.imageUrl ? "Загружено" : "Не указано"}
                        />
                    </FormCard>
                </aside>
            </div>
        </form>
    );
}

function ImageUploader({
    title,
    imageUrl,
    onChange,
    onUpload,
}: {
    title: string;
    imageUrl: string;
    onChange: (value: string) => void;
    onUpload: (file: File) => Promise<void>;
}) {
    const imageSrc = imageUrl ? getMediaUrl(imageUrl) : "";

    return (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div className="aspect-[4/5] overflow-hidden rounded-[24px] bg-neutral-100">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={title || "Коллекция"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-5 text-center text-[14px] text-neutral-400">
                        Нет изображения
                    </div>
                )}
            </div>

            <div className="flex flex-col justify-between gap-4">
                <Field label="URL изображения">
                    <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                        <input
                            value={imageUrl}
                            onChange={(event) => onChange(event.target.value)}
                            className="input"
                            placeholder="/uploads/collections/image.webp"
                        />

                        <UploadImageButton
                            label="Загрузить"
                            onUpload={onUpload}
                        />
                    </div>
                </Field>

                <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-[14px] font-medium text-black">
                        Рекомендация
                    </p>

                    <p className="mt-1 text-[14px] leading-5 text-neutral-500">
                        Используй вертикальное изображение в пропорции 4:5, чтобы
                        коллекция красиво выглядела в карточках админки и на
                        витрине.
                    </p>
                </div>
            </div>
        </div>
    );
}

function PreviewCard({ collection }: { collection: CollectionPayload }) {
    const imageSrc = collection.imageUrl ? getMediaUrl(collection.imageUrl) : "";

    return (
        <article className="overflow-hidden rounded-[28px] bg-white shadow-sm">
            <div className="relative aspect-[4/5] bg-neutral-100">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={collection.title || "Коллекция"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-5 text-center text-[14px] text-neutral-400">
                        Превью появится после добавления изображения
                    </div>
                )}

                <div className="absolute left-4 top-4">
                    <span
                        className={
                            collection.isActive
                                ? "rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow-sm"
                                : "rounded-full bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm"
                        }
                    >
                        {collection.isActive ? "Активна" : "Архив"}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <h2 className="line-clamp-2 text-[19px] font-semibold uppercase leading-6 tracking-[-0.03em] text-black">
                    {collection.title || "Название коллекции"}
                </h2>

                <p className="mt-2 line-clamp-1 text-[13px] text-neutral-500">
                    /collections/{collection.slug || "collection-slug"}
                </p>

                <p className="mt-4 line-clamp-3 text-[14px] leading-6 text-neutral-500">
                    {collection.description || "Описание коллекции пока не указано"}
                </p>
            </div>
        </article>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-neutral-100 py-3 last:border-b-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-neutral-400">
                {label}
            </p>

            <p className="mt-1 break-words text-[15px] font-medium text-black">
                {value}
            </p>
        </div>
    );
}

function FormCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[28px] bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-black">
                {title}
            </h2>

            <div className="mt-6">{children}</div>
        </section>
    );
}

function Field({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <label className={className}>
            <span className="mb-2 block text-[15px] text-neutral-500">
                {label}
            </span>

            {children}
        </label>
    );
}