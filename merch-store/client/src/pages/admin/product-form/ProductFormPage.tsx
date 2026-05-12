import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
    getAdminCollections,
    type AdminCollection,
} from "@/entities/collection/api/adminCollection.api";
import {
    createAdminProduct,
    getAdminProductById,
    updateAdminProduct,
    type ProductPayload,
    type ProductStatus,
} from "@/entities/product/api/adminProduct.api";
import { uploadProductImage } from "@/shared/api/upload.api";
import { Button } from "@/shared/ui/button/Button";
import { CustomSelect } from "@/shared/ui/select/CustomSelect";
import { UploadImageButton } from "@/shared/ui/upload-image-button/UploadImageButton";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { useToastStore } from "@/shared/ui/toast/toast.store";

const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string; description: string }[] = [
    {
        value: "DRAFT",
        label: "Черновик",
        description: "Товар скрыт от покупателей",
    },
    {
        value: "ACTIVE",
        label: "Активен",
        description: "Товар отображается в каталоге",
    },
    {
        value: "ARCHIVED",
        label: "Архив",
        description: "Товар скрыт и считается архивным",
    },
];

const emptyProduct: ProductPayload = {
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: 0,
    oldPrice: null,
    hasVariants: false,
    status: "DRAFT",
    categoryId: null,
    collectionId: null,
    images: [{ url: "", alt: "", sortOrder: 0 }],
    variants: [
        {
            size: "S",
            sku: "",
            stock: 0,
            reservedStock: 0,
            isActive: true,
        },
    ],
};

export function ProductFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);

    const navigate = useNavigate();
    const showToast = useToastStore((state) => state.showToast);

    const [collections, setCollections] = useState<AdminCollection[]>([]);
    const [form, setForm] = useState<ProductPayload>(emptyProduct);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(Boolean(id));

    const collectionOptions = useMemo(
        () =>
            collections.map((collection) => ({
                value: collection.id,
                label: collection.title,
                description: collection.slug
                    ? `/collections/${collection.slug}`
                    : undefined,
            })),
        [collections],
    );

    useEffect(() => {
        async function loadCollections() {
            try {
                const data = await getAdminCollections();
                setCollections(data.filter((collection) => collection.isActive));
            } catch {
                showToast({
                    type: "error",
                    message: "Не удалось загрузить коллекции",
                });
            }
        }

        void loadCollections();
    }, [showToast]);

    useEffect(() => {
        if (!id) return;

        async function loadProduct() {
            try {
                setIsPageLoading(true);

                const product = await getAdminProductById(id!);

                setForm({
                    title: product.title,
                    slug: product.slug,
                    description: product.description,
                    shortDescription: product.shortDescription ?? "",
                    price: product.price,
                    oldPrice: product.oldPrice,
                    hasVariants: product.hasVariants,
                    status: product.status,
                    categoryId: product.categoryId ?? null,
                    collectionId: product.collectionId ?? null,
                    images:
                        product.images.length > 0
                            ? product.images.map((image) => ({
                                url: image.url,
                                alt: image.alt ?? "",
                                sortOrder: image.sortOrder,
                            }))
                            : [{ url: "", alt: "", sortOrder: 0 }],
                    variants:
                        product.variants.length > 0
                            ? product.variants.map((variant) => ({
                                size: variant.size,
                                color: variant.color,
                                sku: variant.sku,
                                stock: variant.stock,
                                reservedStock: variant.reservedStock,
                                priceOverride: variant.priceOverride,
                                isActive: variant.isActive,
                            }))
                            : [
                                {
                                    size: "S",
                                    sku: "",
                                    stock: 0,
                                    reservedStock: 0,
                                    isActive: true,
                                },
                            ],
                });
            } catch (error) {
                console.error("LOAD_ADMIN_PRODUCT_ERROR:", error);

                showToast({
                    type: "error",
                    message: "Не удалось загрузить товар",
                });

                navigate("/admin/products");
            } finally {
                setIsPageLoading(false);
            }
        }

        void loadProduct();
    }, [id, navigate, showToast]);

    function updateField<K extends keyof ProductPayload>(
        key: K,
        value: ProductPayload[K],
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function generateSlug() {
        const slug = form.title
            .toLowerCase()
            .trim()
            .replace(/[^\wа-яё\s-]/gi, "")
            .replace(/\s+/g, "-");

        updateField("slug", slug);
    }

    function updateImage(
        index: number,
        key: "url" | "alt" | "sortOrder",
        value: string | number,
    ) {
        setForm((prev) => ({
            ...prev,
            images: prev.images.map((image, imageIndex) =>
                imageIndex === index ? { ...image, [key]: value } : image,
            ),
        }));
    }

    function addImage() {
        setForm((prev) => ({
            ...prev,
            images: [
                ...prev.images,
                {
                    url: "",
                    alt: "",
                    sortOrder: prev.images.length,
                },
            ],
        }));
    }

    function removeImage(index: number) {
        setForm((prev) => ({
            ...prev,
            images:
                prev.images.length > 1
                    ? prev.images.filter((_, imageIndex) => imageIndex !== index)
                    : prev.images,
        }));
    }

    function updateVariant(
        index: number,
        key: keyof ProductPayload["variants"][number],
        value: string | number | boolean | null,
    ) {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.map((variant, variantIndex) =>
                variantIndex === index ? { ...variant, [key]: value } : variant,
            ),
        }));
    }

    function addVariant() {
        setForm((prev) => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    size: "",
                    sku: "",
                    stock: 0,
                    reservedStock: 0,
                    isActive: true,
                },
            ],
        }));
    }

    function removeVariant(index: number) {
        setForm((prev) => ({
            ...prev,
            variants:
                prev.variants.length > 1
                    ? prev.variants.filter((_, variantIndex) => variantIndex !== index)
                    : prev.variants,
        }));
    }

    function validateProductForm(payload: ProductPayload) {
        if (!payload.title.trim()) return "Введите название товара";
        if (!payload.slug.trim()) return "Введите slug товара";
        if (!payload.description.trim()) return "Введите описание товара";
        if (payload.price <= 0) return "Введите цену больше 0";

        if (payload.images.length === 0) {
            return "Добавьте хотя бы одно изображение товара";
        }

        const invalidImage = payload.images.find((image) => !image.url.trim());

        if (invalidImage) {
            return "У всех изображений должен быть URL";
        }

        if (payload.variants.length === 0) {
            return "Добавьте хотя бы один вариант товара";
        }

        const invalidVariant = payload.variants.find(
            (variant) => !variant.size.trim() || !variant.sku.trim(),
        );

        if (invalidVariant) {
            return "У каждого варианта должны быть размер и SKU";
        }

        const invalidStock = payload.variants.find(
            (variant) =>
                Number(variant.stock) < 0 ||
                Number(variant.reservedStock ?? 0) < 0 ||
                Number(variant.reservedStock ?? 0) > Number(variant.stock),
        );

        if (invalidStock) {
            return "Резерв не может быть больше общего остатка";
        }

        return null;
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload: ProductPayload = {
            ...form,
            title: form.title.trim(),
            slug: form.slug.trim(),
            description: form.description.trim(),
            shortDescription: form.shortDescription?.trim() || null,
            categoryId: form.categoryId ?? null,
            collectionId: form.collectionId ?? null,
            images: form.images.map((image, index) => ({
                ...image,
                url: image.url.trim(),
                alt: image.alt?.trim() || null,
                sortOrder: image.sortOrder ?? index,
            })),
            variants: form.variants.map((variant) => ({
                ...variant,
                size: variant.size.trim(),
                color: variant.color?.trim() || null,
                sku: variant.sku.trim(),
                stock: Number(variant.stock),
                reservedStock: Number(variant.reservedStock ?? 0),
                priceOverride:
                    variant.priceOverride === undefined || variant.priceOverride === null
                        ? null
                        : Number(variant.priceOverride),
                isActive: variant.isActive ?? true,
            })),
        };

        const validationError = validateProductForm(payload);

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
                await updateAdminProduct(id, payload);

                showToast({
                    type: "success",
                    message: "Товар обновлён",
                });
            } else {
                await createAdminProduct(payload);

                showToast({
                    type: "success",
                    message: "Товар создан",
                });
            }

            navigate("/admin/products");
        } catch (error) {
            console.error("CREATE_OR_UPDATE_PRODUCT_ERROR:", error);

            showToast({
                type: "error",
                message: isEdit
                    ? "Не удалось обновить товар"
                    : "Не удалось создать товар",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isPageLoading) {
        return (
            <div className="rounded-[28px] bg-white p-8 text-[15px] text-neutral-500 shadow-sm">
                Загружаем товар...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-[1280px]">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <Link
                        to="/admin/products"
                        className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm transition hover:bg-neutral-100"
                    >
                        Назад к товарам
                    </Link>

                    <h1 className="mt-6 text-[36px] font-semibold tracking-[-0.05em] text-black">
                        {isEdit ? "Редактировать товар" : "Добавить товар"}
                    </h1>

                    <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-neutral-500">
                        Управление карточкой товара, изображениями, коллекцией,
                        размерами, SKU и складскими остатками.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/admin/products")}
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
                                    placeholder="BLACK TEE"
                                    className="input"
                                />
                            </Field>

                            <Field label="Slug">
                                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                    <input
                                        value={form.slug}
                                        onChange={(event) =>
                                            updateField("slug", event.target.value)
                                        }
                                        placeholder="black-tee"
                                        className="input"
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

                            <Field label="Цена">
                                <input
                                    type="number"
                                    min={0}
                                    value={form.price}
                                    onChange={(event) =>
                                        updateField("price", Number(event.target.value))
                                    }
                                    className="input"
                                />
                            </Field>

                            <Field label="Старая цена">
                                <input
                                    type="number"
                                    min={0}
                                    value={form.oldPrice ?? ""}
                                    onChange={(event) =>
                                        updateField(
                                            "oldPrice",
                                            event.target.value
                                                ? Number(event.target.value)
                                                : null,
                                        )
                                    }
                                    placeholder="Не указана"
                                    className="input"
                                />
                            </Field>

                            <Field label="Статус">
                                <CustomSelect<ProductStatus>
                                    value={form.status}
                                    options={PRODUCT_STATUS_OPTIONS}
                                    placeholder="Выберите статус"
                                    onChange={(value) => {
                                        if (!value) return;
                                        updateField("status", value);
                                    }}
                                />
                            </Field>

                            <Field label="Коллекция">
                                <CustomSelect<string>
                                    value={form.collectionId ?? ""}
                                    options={collectionOptions}
                                    placeholder="Без коллекции"
                                    allowEmpty
                                    emptyLabel="Без коллекции"
                                    onChange={(value) =>
                                        updateField("collectionId", value || null)
                                    }
                                />
                            </Field>
                        </div>

                        <Field label="Краткое описание" className="mt-5">
                            <textarea
                                value={form.shortDescription ?? ""}
                                onChange={(event) =>
                                    updateField(
                                        "shortDescription",
                                        event.target.value,
                                    )
                                }
                                placeholder="Короткое описание для карточки товара"
                                className="input min-h-[96px] py-3"
                            />
                        </Field>

                        <Field label="Описание" className="mt-5">
                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    updateField("description", event.target.value)
                                }
                                placeholder="Полное описание товара"
                                className="input min-h-[180px] py-3"
                            />
                        </Field>
                    </FormCard>

                    <FormCard
                        title="Изображения"
                        action={
                            <Button type="button" variant="secondary" onClick={addImage}>
                                Добавить
                            </Button>
                        }
                    >
                        <div className="grid gap-4">
                            {form.images.map((image, index) => (
                                <ImageCard
                                    key={index}
                                    image={image}
                                    index={index}
                                    title={form.title}
                                    canRemove={form.images.length > 1}
                                    onChange={updateImage}
                                    onRemove={removeImage}
                                    onUpload={async (file) => {
                                        const uploaded = await uploadProductImage(file);

                                        setForm((prev) => ({
                                            ...prev,
                                            images: prev.images.map((img, imgIndex) =>
                                                imgIndex === index
                                                    ? {
                                                        ...img,
                                                        url: uploaded.url,
                                                        alt: img.alt || form.title,
                                                        sortOrder: img.sortOrder ?? index,
                                                    }
                                                    : img,
                                            ),
                                        }));

                                        showToast({
                                            type: "success",
                                            message: "Изображение загружено",
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    </FormCard>
                    <div className="mt-5 rounded-[22px] bg-neutral-50 p-4">
                        <button
                            type="button"
                            onClick={() =>
                                updateField("hasVariants", !form.hasVariants)
                            }
                            className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition ${form.hasVariants
                                ? "bg-black text-white"
                                : "bg-white text-black"
                                }`}
                        >
                            <div>
                                <p className="text-[16px] font-semibold">
                                    {form.hasVariants
                                        ? "Товар с вариантами"
                                        : "Товар без вариантов"}
                                </p>

                                <p
                                    className={`mt-1 text-[14px] ${form.hasVariants ? "text-white/70" : "text-neutral-500"
                                        }`}
                                >
                                    {form.hasVariants
                                        ? "Покупатель выбирает размер, цвет или другой вариант."
                                        : "Покупатель добавляет товар в корзину без выбора размера."}
                                </p>
                            </div>

                            <span
                                className={`h-6 w-11 rounded-full p-1 ${form.hasVariants ? "bg-white" : "bg-neutral-200"
                                    }`}
                            >
                                <span
                                    className={`block h-4 w-4 rounded-full transition ${form.hasVariants
                                        ? "translate-x-5 bg-black"
                                        : "translate-x-0 bg-black"
                                        }`}
                                />
                            </span>
                        </button>
                    </div>

                    {!form.hasVariants ? (
                        <section className="mt-6 rounded-3xl bg-white p-6">
                            <h2 className="text-[22px] font-semibold">Остаток товара</h2>

                            <p className="mt-2 text-[15px] text-neutral-500">
                                Для товара без вариантов будет создан один скрытый вариант.
                            </p>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <Field label="SKU">
                                    <input
                                        value={form.variants[0]?.sku ?? ""}
                                        onChange={(event) =>
                                            updateVariant(0, "sku", event.target.value)
                                        }
                                        className="input"
                                        placeholder={`${form.slug || "product"}-default`}
                                    />
                                </Field>

                                <Field label="Остаток">
                                    <input
                                        type="number"
                                        value={form.variants[0]?.stock ?? 0}
                                        onChange={(event) =>
                                            updateVariant(0, "stock", Number(event.target.value))
                                        }
                                        className="input"
                                    />
                                </Field>
                            </div>
                        </section>
                    ) : (
                        <section className="mt-6 rounded-3xl bg-white p-6">
                            <FormCard
                                title="Варианты товара"
                                action={
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={addVariant}
                                    >
                                        Добавить
                                    </Button>
                                }
                            >
                                <div className="grid gap-4">
                                    {form.variants.map((variant, index) => (
                                        <VariantCard
                                            key={index}
                                            variant={variant}
                                            index={index}
                                            canRemove={form.variants.length > 1}
                                            onChange={updateVariant}
                                            onRemove={removeVariant}
                                        />
                                    ))}
                                </div>
                            </FormCard>
                        </section>
                    )}

                </div>

                <aside className="space-y-6">
                    <FormCard title="Сводка">
                        <SummaryItem label="Название" value={form.title || "Не указано"} />
                        <SummaryItem label="Slug" value={form.slug || "Не указан"} />
                        <SummaryItem
                            label="Статус"
                            value={
                                PRODUCT_STATUS_OPTIONS.find(
                                    (item) => item.value === form.status,
                                )?.label ?? form.status
                            }
                        />
                        <SummaryItem
                            label="Цена"
                            value={`${new Intl.NumberFormat("ru-RU").format(
                                form.price,
                            )}₽`}
                        />
                        <SummaryItem
                            label="Изображений"
                            value={String(form.images.length)}
                        />
                        <SummaryItem
                            label="Вариантов"
                            value={String(form.variants.length)}
                        />
                    </FormCard>

                    <StockSummary variants={form.variants} />
                </aside>
            </div>
        </form>
    );
}

function ImageCard({
    image,
    index,
    title,
    canRemove,
    onChange,
    onRemove,
    onUpload,
}: {
    image: ProductPayload["images"][number];
    index: number;
    title: string;
    canRemove: boolean;
    onChange: (
        index: number,
        key: "url" | "alt" | "sortOrder",
        value: string | number,
    ) => void;
    onRemove: (index: number) => void;
    onUpload: (file: File) => Promise<void>;
}) {
    const imageSrc = image.url ? getMediaUrl(image.url) : "";

    return (
        <article className="grid gap-4 rounded-[24px] bg-neutral-50 p-4 lg:grid-cols-[150px_1fr]">
            <div className="h-[190px] w-full overflow-hidden rounded-[20px] bg-neutral-100 lg:w-[150px]">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={image.alt ?? title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center text-[13px] text-neutral-400">
                        Нет изображения
                    </div>
                )}
            </div>

            <div className="grid gap-3">
                <Field label="URL изображения">
                    <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                        <input
                            placeholder="/uploads/products/product.webp"
                            value={image.url}
                            onChange={(event) =>
                                onChange(index, "url", event.target.value)
                            }
                            className="input"
                        />

                        <UploadImageButton label="Загрузить" onUpload={onUpload} />
                    </div>
                </Field>

                <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                    <Field label="Alt">
                        <input
                            placeholder="Описание изображения"
                            value={image.alt ?? ""}
                            onChange={(event) =>
                                onChange(index, "alt", event.target.value)
                            }
                            className="input"
                        />
                    </Field>

                    <Field label="Порядок">
                        <input
                            type="number"
                            value={image.sortOrder ?? index}
                            onChange={(event) =>
                                onChange(
                                    index,
                                    "sortOrder",
                                    Number(event.target.value),
                                )
                            }
                            className="input"
                        />
                    </Field>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => onRemove(index)}
                        disabled={!canRemove}
                    >
                        Удалить
                    </Button>
                </div>
            </div>
        </article>
    );
}

function VariantCard({
    variant,
    index,
    canRemove,
    onChange,
    onRemove,
}: {
    variant: ProductPayload["variants"][number];
    index: number;
    canRemove: boolean;
    onChange: (
        index: number,
        key: keyof ProductPayload["variants"][number],
        value: string | number | boolean | null,
    ) => void;
    onRemove: (index: number) => void;
}) {
    const availableStock = Math.max(
        0,
        Number(variant.stock) - Number(variant.reservedStock ?? 0),
    );

    return (
        <article className="rounded-[24px] bg-neutral-50 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                    <h3 className="text-[17px] font-semibold text-black">
                        Вариант #{index + 1}
                    </h3>

                    <p className="mt-1 text-[13px] text-neutral-500">
                        Доступно к продаже: {availableStock} шт.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-medium text-black">
                        <input
                            type="checkbox"
                            checked={variant.isActive ?? true}
                            onChange={(event) =>
                                onChange(index, "isActive", event.target.checked)
                            }
                        />
                        Активен
                    </label>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => onRemove(index)}
                        disabled={!canRemove}
                    >
                        Удалить
                    </Button>
                </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Размер">
                    <input
                        placeholder="S / M / L / XL"
                        value={variant.size}
                        onChange={(event) =>
                            onChange(index, "size", event.target.value)
                        }
                        className="input"
                    />
                </Field>

                <Field label="Цвет">
                    <input
                        placeholder="black"
                        value={variant.color ?? ""}
                        onChange={(event) =>
                            onChange(index, "color", event.target.value || null)
                        }
                        className="input"
                    />
                </Field>

                <Field label="SKU">
                    <input
                        placeholder="BLACK-TEE-S"
                        value={variant.sku}
                        onChange={(event) =>
                            onChange(index, "sku", event.target.value)
                        }
                        className="input"
                    />
                </Field>

                <Field label="Остаток всего">
                    <input
                        type="number"
                        min={0}
                        value={variant.stock}
                        onChange={(event) =>
                            onChange(index, "stock", Number(event.target.value))
                        }
                        className="input"
                    />
                </Field>

                <Field label="В резерве">
                    <input
                        type="number"
                        min={0}
                        value={variant.reservedStock ?? 0}
                        onChange={(event) =>
                            onChange(
                                index,
                                "reservedStock",
                                Number(event.target.value),
                            )
                        }
                        className="input"
                    />
                </Field>

                <Field label="Цена варианта">
                    <input
                        type="number"
                        min={0}
                        placeholder="Не указана"
                        value={variant.priceOverride ?? ""}
                        onChange={(event) =>
                            onChange(
                                index,
                                "priceOverride",
                                event.target.value
                                    ? Number(event.target.value)
                                    : null,
                            )
                        }
                        className="input"
                    />
                </Field>
            </div>
        </article>
    );
}

function StockSummary({
    variants,
}: {
    variants: ProductPayload["variants"];
}) {
    const totalStock = variants.reduce(
        (sum, variant) => sum + Number(variant.stock),
        0,
    );

    const reservedStock = variants.reduce(
        (sum, variant) => sum + Number(variant.reservedStock ?? 0),
        0,
    );

    const availableStock = Math.max(0, totalStock - reservedStock);

    return (
        <FormCard title="Остатки">
            <div className="grid gap-3">
                <SummaryMetric label="Доступно" value={`${availableStock} шт.`} />
                <SummaryMetric label="Всего" value={`${totalStock} шт.`} />
                <SummaryMetric label="В резерве" value={`${reservedStock} шт.`} />
            </div>

            <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-neutral-400">
                    По вариантам
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {variants.map((variant, index) => {
                        const available = Math.max(
                            0,
                            Number(variant.stock) -
                            Number(variant.reservedStock ?? 0),
                        );

                        return (
                            <span
                                key={`${variant.sku}-${index}`}
                                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                            >
                                {variant.size || "—"}: {available}
                            </span>
                        );
                    })}
                </div>
            </div>
        </FormCard>
    );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 text-[18px] font-semibold text-black">{value}</p>
        </div>
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
    action,
}: {
    title: string;
    children: ReactNode;
    action?: ReactNode;
}) {
    return (
        <section className="rounded-[28px] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-black">
                    {title}
                </h2>

                {action}
            </div>

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

