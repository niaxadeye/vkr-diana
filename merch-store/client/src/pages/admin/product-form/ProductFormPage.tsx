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
    { value: "DRAFT", label: "Черновик", description: "Товар скрыт от покупателей" },
    { value: "ACTIVE", label: "Активен", description: "Товар отображается в каталоге" },
    { value: "ARCHIVED", label: "Архив", description: "Товар скрыт и считается архивным" },
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
        { size: "S", sku: "", stock: 0, reservedStock: 0, isActive: true },
    ],
};

export function ProductFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const showToast = useToastStore((state) => state.showToast);

    const [collections, setCollections] = useState<AdminCollection[]>([]);
    const [form, setForm] = useState<ProductPayload & {
        weightGram?: number;
        lengthCm?: number;
        widthCm?: number;
        heightCm?: number;
        variants: VariantWithDimensions[];
    }>({ ...emptyProduct, weightGram: 0, lengthCm: 0, widthCm: 0, heightCm: 0, variants: [{ size: "S", sku: "", stock: 0, reservedStock: 0, isActive: true, weightGram: 0, lengthCm: 0, widthCm: 0, heightCm: 0 }] });
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(Boolean(id));

    const collectionOptions = useMemo(() =>
        collections.map(c => ({
            value: c.id,
            label: c.title,
            description: c.slug ? `/collections/${c.slug}` : undefined,
        })),
        [collections]
    );

    useEffect(() => {
        async function loadCollections() {
            try {
                const data = await getAdminCollections();
                setCollections(data.filter(c => c.isActive));
            } catch {
                showToast({ type: "error", message: "Не удалось загрузить коллекции" });
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
                    ...product,
                    shortDescription: product.shortDescription ?? "",
                    categoryId: product.categoryId ?? null,
                    collectionId: product.collectionId ?? null,
                    images: product.images.length
                        ? product.images.map(img => ({ ...img }))
                        : [{ url: "", alt: "", sortOrder: 0 }],
                    variants: product.variants.length
                        ? product.variants.map(v => ({
                            ...v,
                            weightGram: v.weightGram ?? product.weightGram ?? 0,
                            lengthCm: v.lengthCm ?? product.lengthCm ?? 0,
                            widthCm: v.widthCm ?? product.widthCm ?? 0,
                            heightCm: v.heightCm ?? product.heightCm ?? 0,
                        }))
                        : [{
                            size: "S",
                            sku: "",
                            stock: 0,
                            reservedStock: 0,
                            isActive: true,
                            weightGram: product.weightGram ?? 0,
                            lengthCm: product.lengthCm ?? 0,
                            widthCm: product.widthCm ?? 0,
                            heightCm: product.heightCm ?? 0,
                        }],
                    weightGram: product.weightGram ?? 0,
                    lengthCm: product.lengthCm ?? 0,
                    widthCm: product.widthCm ?? 0,
                    heightCm: product.heightCm ?? 0,
                });
            } catch (err) {
                console.error("LOAD_ADMIN_PRODUCT_ERROR:", err);
                showToast({ type: "error", message: "Не удалось загрузить товар" });
                navigate("/admin/products");
            } finally {
                setIsPageLoading(false);
            }
        }

        void loadProduct();
    }, [id, navigate, showToast]);

    function updateField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function generateSlug() {
        const slug = form.title.toLowerCase().trim()
            .replace(/[^\wа-яё\s-]/gi, "")
            .replace(/\s+/g, "-");
        updateField("slug", slug);
    }

    function updateImage(index: number, key: "url" | "alt" | "sortOrder", value: string | number) {
        setForm(prev => ({
            ...prev,
            images: prev.images.map((img, i) => i === index ? { ...img, [key]: value } : img)
        }));
    }

    function addImage() {
        setForm(prev => ({
            ...prev,
            images: [...prev.images, { url: "", alt: "", sortOrder: prev.images.length }]
        }));
    }

    function removeImage(index: number) {
        setForm(prev => ({
            ...prev,
            images: prev.images.length > 1
                ? prev.images.filter((_, i) => i !== index)
                : prev.images
        }));
    }

    function updateVariant(
        index: number,
        key: keyof ProductPayload["variants"][number],
        value: string | number | boolean | null
    ) {
        setForm(prev => ({
            ...prev,
            variants: prev.variants.map((v, i) => i === index ? { ...v, [key]: value } : v)
        }));
    }

    function addVariant() {
        setForm(prev => ({
            ...prev,
            variants: [...prev.variants, { size: "", sku: "", stock: 0, reservedStock: 0, isActive: true }]
        }));
    }

    function removeVariant(index: number) {
        setForm(prev => ({
            ...prev,
            variants: prev.variants.length > 1
                ? prev.variants.filter((_, i) => i !== index)
                : prev.variants
        }));
    }

    function validateForm() {
        if (!form.title.trim()) return "Введите название товара";
        if (!form.slug.trim()) return "Введите slug товара";
        if (!form.description.trim()) return "Введите описание товара";
        if (form.price <= 0) return "Цена должна быть больше 0";
        if (form.images.some(img => !img.url.trim())) return "У всех изображений должен быть URL";
        if (form.variants.some(v => !v.size.trim() || !v.sku.trim())) return "У каждого варианта должны быть размер и SKU";
        if (form.variants.some(v => Number(v.reservedStock ?? 0) > Number(v.stock))) return "Резерв не может быть больше остатка";
        return null;
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const error = validateForm();
        if (error) return showToast({ type: "error", message: error });

        setIsLoading(true);
        try {
            // Формируем payload с правильными габаритами
            const payload = {
                ...form,
                variants: form.hasVariants
                    ? form.variants.map(v => ({
                        ...v,
                        weightGram: v.weightGram ?? form.weightGram,
                        lengthCm: v.dimensions?.lengthCm ?? form.lengthCm,
                        widthCm: v.dimensions?.widthCm ?? form.widthCm,
                        heightCm: v.dimensions?.heightCm ?? form.heightCm,
                    }))
                    : [
                        {
                            ...form.variants[0],
                            size: "ONE_SIZE",
                            color: null,
                            sku: form.variants[0]?.sku || `${form.slug}-default`,
                            stock: form.variants[0]?.stock ?? 0,
                            reservedStock: form.variants[0]?.reservedStock ?? 0,
                            priceOverride: null,
                            isActive: true,

                            weightGram: form.weightGram,
                            lengthCm: form.lengthCm,
                            widthCm: form.widthCm,
                            heightCm: form.heightCm,
                        },
                    ],
            };

            if (isEdit && id) {
                await updateAdminProduct(id, payload);
                showToast({ type: "success", message: "Товар обновлён" });
            } else {
                await createAdminProduct(payload);
                showToast({ type: "success", message: "Товар создан" });
            }

            navigate("/admin/products");
        } catch (err) {
            console.error("SAVE_PRODUCT_ERROR:", err);
            showToast({ type: "error", message: isEdit ? "Не удалось обновить товар" : "Не удалось создать товар" });
        } finally {
            setIsLoading(false);
        }
    }

    if (isPageLoading) return <div className="rounded-2xl bg-white p-8 text-neutral-500 shadow-sm">Загружаем товар...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-[1280px]">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <Link to="/admin/products" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm hover:bg-neutral-100 transition">
                        Назад к товарам
                    </Link>
                    <h1 className="mt-6 text-[36px] font-semibold tracking-[-0.05em] text-black">{isEdit ? "Редактировать товар" : "Добавить товар"}</h1>
                    <p className="mt-2 max-w-[720px] text-[15px] text-neutral-500">
                        Управление карточкой товара, изображениями, коллекцией, размерами, SKU и складскими остатками.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button type="button" variant="secondary" onClick={() => navigate("/admin/products")}>Отмена</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Сохраняем..." : "Сохранить"}</Button>
                </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                    {/* Основное */}
                    <FormCard title="Основное">
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Название">
                                <input value={form.title} onChange={e => updateField("title", e.target.value)} className="input" />
                            </Field>
                            <Field label="Slug">
                                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                    <input value={form.slug} onChange={e => updateField("slug", e.target.value)} className="input" />
                                    <Button type="button" variant="secondary" onClick={generateSlug}>Сгенерировать</Button>
                                </div>
                            </Field>
                            <Field label="Цена">
                                <input type="number" min={0} value={form.price} onChange={e => updateField("price", Number(e.target.value))} className="input" />
                            </Field>
                            <Field label="Старая цена">
                                <input type="number" min={0} value={form.oldPrice ?? ""} onChange={e => updateField("oldPrice", e.target.value ? Number(e.target.value) : null)} className="input" />
                            </Field>
                            <Field label="Статус">
                                <CustomSelect<ProductStatus> value={form.status} options={PRODUCT_STATUS_OPTIONS} onChange={v => v && updateField("status", v)} placeholder="Выберите статус" />
                            </Field>
                            <Field label="Коллекция">
                                <CustomSelect<string> value={form.collectionId ?? ""} options={collectionOptions} allowEmpty emptyLabel="Без коллекции" placeholder="Выберите коллекцию" onChange={v => updateField("collectionId", v || null)} />
                            </Field>

                            {/* Новые поля веса и габаритов */}
                            <Field label="Вес (г)">
                                <input type="number" min={0} value={form.weightGram ?? 0} onChange={e => updateField("weightGram", Number(e.target.value))} className="input" />
                            </Field>
                            <Field label="Длина (см)">
                                <input type="number" min={0} value={form.lengthCm ?? 0} onChange={e => updateField("lengthCm", Number(e.target.value))} className="input" />
                            </Field>
                            <Field label="Ширина (см)">
                                <input type="number" min={0} value={form.widthCm ?? 0} onChange={e => updateField("widthCm", Number(e.target.value))} className="input" />
                            </Field>
                            <Field label="Высота (см)">
                                <input type="number" min={0} value={form.heightCm ?? 0} onChange={e => updateField("heightCm", Number(e.target.value))} className="input" />
                            </Field>

                            <Field label="Краткое описание" className="mt-5">
                                <textarea value={form.shortDescription ?? ""} onChange={e => updateField("shortDescription", e.target.value)} className="input min-h-[96px] py-3" />
                            </Field>
                            <Field label="Описание" className="mt-5">
                                <textarea value={form.description} onChange={e => updateField("description", e.target.value)} className="input min-h-[180px] py-3" />
                            </Field>
                        </div>
                    </FormCard>

                    {/* Изображения */}
                    <FormCard title="Изображения" action={<Button type="button" variant="secondary" onClick={addImage}>Добавить</Button>}>
                        <div className="grid gap-4">
                            {form.images.map((image, index) => (
                                <ImageCard key={index} image={image} index={index} title={form.title} canRemove={form.images.length > 1} onChange={updateImage} onRemove={removeImage} onUpload={async file => {
                                    const uploaded = await uploadProductImage(file);
                                    updateImage(index, "url", uploaded.url);
                                    updateImage(index, "alt", form.title);
                                    showToast({ type: "success", message: "Изображение загружено" });
                                }} />
                            ))}
                        </div>
                    </FormCard>

                    {/* Переключатель варианта */}
                    <div className="mt-5 rounded-[22px] bg-neutral-50 p-4">
                        <button
                            type="button"
                            onClick={() => updateField("hasVariants", !form.hasVariants)}
                            className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition ${form.hasVariants ? "bg-black text-white" : "bg-white text-black"}`}
                        >
                            <div>
                                <p className="text-[16px] font-semibold">{form.hasVariants ? "Товар с вариантами" : "Товар без вариантов"}</p>
                                <p className={`mt-1 text-[14px] ${form.hasVariants ? "text-white/70" : "text-neutral-500"}`}>
                                    {form.hasVariants
                                        ? "Покупатель выбирает размер, цвет или другой вариант."
                                        : "Покупатель добавляет товар в корзину без выбора размера."}
                                </p>
                            </div>
                            <span className={`h-6 w-11 rounded-full p-1 ${form.hasVariants ? "bg-white" : "bg-neutral-200"}`}>
                                <span className={`block h-4 w-4 rounded-full transition-transform ${form.hasVariants ? "translate-x-5 bg-black" : "translate-x-0 bg-black"}`} />
                            </span>
                        </button>
                    </div>

                    {/* Варианты */}
                    {form.hasVariants ? (
                        <section className="mt-6 rounded-3xl bg-white p-6">
                            <FormCard title="Варианты товара" action={<Button type="button" variant="secondary" onClick={addVariant}>Добавить</Button>}>
                                <div className="grid gap-4">
                                    {form.variants.map((variant, index) => (
                                        <VariantCard key={index} variant={variant} index={index} canRemove={form.variants.length > 1} onChange={updateVariant} onRemove={removeVariant} />
                                    ))}
                                </div>
                            </FormCard>
                        </section>
                    ) : (
                        <section className="mt-6 rounded-3xl bg-white p-6">
                            <h2 className="text-[22px] font-semibold">Остаток товара</h2>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <Field label="SKU">
                                    <input value={form.variants[0]?.sku ?? ""} onChange={e => updateVariant(0, "sku", e.target.value)} className="input" />
                                </Field>
                                <Field label="Остаток">
                                    <input type="number" value={form.variants[0]?.stock ?? 0} onChange={e => updateVariant(0, "stock", Number(e.target.value))} className="input" />
                                </Field>
                            </div>
                        </section>
                    )}
                </div>

                {/* Сводка */}
                <aside className="space-y-6">
                    <FormCard title="Сводка">
                        <SummaryItem label="Название" value={form.title || "Не указано"} />
                        <SummaryItem label="Slug" value={form.slug || "Не указан"} />
                        <SummaryItem label="Статус" value={PRODUCT_STATUS_OPTIONS.find(o => o.value === form.status)?.label ?? form.status} />
                        <SummaryItem label="Цена" value={`${new Intl.NumberFormat("ru-RU").format(form.price)}₽`} />
                        <SummaryItem label="Изображений" value={String(form.images.length)} />
                        <SummaryItem label="Вариантов" value={String(form.variants.length)} />
                    </FormCard>

                    <StockSummary variants={form.variants} />
                </aside>
            </div>
        </form>
    );
}

/* ---------- Вспомогательные компоненты ---------- */

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <label className={className}>
            <span className="mb-2 block text-[15px] text-neutral-500">{label}</span>
            {children}
        </label>
    );
}

function FormCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
    return (
        <section className="rounded-[28px] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-black">{title}</h2>
                {action}
            </div>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function ImageCard({ image, index, title, canRemove, onChange, onRemove, onUpload }: {
    image: ProductPayload["images"][number];
    index: number;
    title: string;
    canRemove: boolean;
    onChange: (index: number, key: "url" | "alt" | "sortOrder", value: string | number) => void;
    onRemove: (index: number) => void;
    onUpload: (file: File) => Promise<void>;
}) {
    const imageSrc = image.url ? getMediaUrl(image.url) : "";

    return (
        <article className="grid gap-4 rounded-[24px] bg-neutral-50 p-4 lg:grid-cols-[150px_1fr]">
            <div className="h-[190px] w-full overflow-hidden rounded-[20px] bg-neutral-100 lg:w-[150px]">
                {imageSrc ? <img src={imageSrc} alt={image.alt ?? title} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center px-4 text-center text-[13px] text-neutral-400">Нет изображения</div>}
            </div>

            <div className="grid gap-3">
                <Field label="URL изображения">
                    <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                        <input value={image.url} onChange={e => onChange(index, "url", e.target.value)} className="input" />
                        <UploadImageButton label="Загрузить" onUpload={onUpload} />
                    </div>
                </Field>

                <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                    <Field label="Alt">
                        <input value={image.alt ?? ""} onChange={e => onChange(index, "alt", e.target.value)} className="input" />
                    </Field>

                    <Field label="Порядок">
                        <input type="number" value={image.sortOrder ?? index} onChange={e => onChange(index, "sortOrder", Number(e.target.value))} className="input" />
                    </Field>
                </div>

                <div className="flex justify-end">
                    <Button type="button" variant="danger" onClick={() => onRemove(index)} disabled={!canRemove}>Удалить</Button>
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
    const availableStock = Math.max(0, Number(variant.stock) - Number(variant.reservedStock ?? 0));

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
                        value={variant.size}
                        onChange={(event) => onChange(index, "size", event.target.value)}
                        className="input"
                    />
                </Field>

                <Field label="Цвет">
                    <input
                        value={variant.color ?? ""}
                        onChange={(event) => onChange(index, "color", event.target.value || null)}
                        className="input"
                    />
                </Field>

                <Field label="SKU">
                    <input
                        value={variant.sku}
                        onChange={(event) => onChange(index, "sku", event.target.value)}
                        className="input"
                    />
                </Field>

                <Field label="Остаток">
                    <input
                        type="number"
                        value={variant.stock}
                        onChange={(event) => onChange(index, "stock", Number(event.target.value))}
                        className="input"
                    />
                </Field>

                <Field label="В резерве">
                    <input
                        type="number"
                        value={variant.reservedStock ?? 0}
                        onChange={(event) => onChange(index, "reservedStock", Number(event.target.value))}
                        className="input"
                    />
                </Field>

                <Field label="Цена варианта">
                    <input
                        type="number"
                        value={variant.priceOverride ?? ""}
                        onChange={(event) =>
                            onChange(index, "priceOverride", event.target.value ? Number(event.target.value) : null)
                        }
                        className="input"
                    />
                </Field>

                {/* Габариты варианта */}
                <Field label="Вес (г)">
                    <input type="number" min={0} value={variant.weightGram ?? 0} onChange={e => onChange(index, "weightGram", Number(e.target.value))} className="input" />
                </Field>
                <Field label="Длина (см)">
                    <input type="number" min={0} value={variant.dimensions?.lengthCm ?? 0} onChange={e => onChange(index, "dimensions", Number(e.target.value))} className="input" />
                </Field>
                <Field label="Ширина (см)">
                    <input type="number" min={0} value={variant.dimensions?.widthCm ?? 0} onChange={e => onChange(index, "dimensions", Number(e.target.value))} className="input" />
                </Field>
                <Field label="Высота (см)">
                    <input type="number" min={0} value={variant.dimensions?.heightCm ?? 0} onChange={e => onChange(index, "dimensions", Number(e.target.value))} className="input" />
                </Field>
            </div>
        </article>
    );
}

function StockSummary({ variants }: { variants: ProductPayload["variants"] }) {
    const totalStock = variants.reduce((sum, v) => sum + Number(v.stock), 0);
    const reservedStock = variants.reduce((sum, v) => sum + Number(v.reservedStock ?? 0), 0);
    const availableStock = Math.max(0, totalStock - reservedStock);

    return (
        <FormCard title="Остатки">
            <div className="grid gap-3">
                <SummaryMetric label="Доступно" value={`${availableStock} шт.`} />
                <SummaryMetric label="Всего" value={`${totalStock} шт.`} />
                <SummaryMetric label="В резерве" value={`${reservedStock} шт.`} />
            </div>
            <div className="mt-5 text-xs font-medium uppercase tracking-[0.08em] text-neutral-400">По вариантам</div>
            <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((v, i) => {
                    const available = Math.max(0, Number(v.stock) - Number(v.reservedStock ?? 0));
                    return <span key={`${v.sku}-${i}`} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">{v.size || "—"}: {available}</span>;
                })}
            </div>
        </FormCard>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-neutral-100 py-3 last:border-b-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-neutral-400">{label}</p>
            <p className="mt-1 break-words text-[15px] font-medium text-black">{value}</p>
        </div>
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

interface VariantWithDimensions {
    size: string;
    color?: string | null;
    sku: string;
    stock: number;
    reservedStock?: number;
    priceOverride?: number | null;
    isActive?: boolean;

    weightGram?: number | null;
    lengthCm?: number | null;
    widthCm?: number | null;
    heightCm?: number | null;
}