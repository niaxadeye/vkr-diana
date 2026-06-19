import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
    createAdminPromoCode,
    getAdminPromoCodeById,
    updateAdminPromoCode,
} from "@/entities/promo-code/api/adminPromoCode.api";
import type { PromoCodePayload } from "@/entities/promo-code/model/promo-code.types";
import { Button } from "@/shared/ui/button/Button";
import { showToast } from "@/shared/ui/toast/notify";

type FormState = {
    code: string;
    discountPercent: string;
    minOrderAmount: string;
    usageLimit: string;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
};

const emptyForm: FormState = {
    code: "",
    discountPercent: "10",
    minOrderAmount: "0",
    usageLimit: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
};

// ISO -> значение для <input type="date"> (YYYY-MM-DD).
function toDateInput(value: string | null): string {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
}

// Значение из <input type="date"> -> ISO или null.
function fromDateInput(value: string): string | null {
    if (!value) return null;
    return new Date(`${value}T00:00:00`).toISOString();
}

function validate(form: FormState): string | null {
    if (form.code.trim().length < 2) return "Введите код (минимум 2 символа)";

    const percent = Number(form.discountPercent);
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
        return "Скидка должна быть от 1 до 100%";
    }

    const minOrder = Number(form.minOrderAmount);
    if (!Number.isInteger(minOrder) || minOrder < 0) {
        return "Минимальная сумма должна быть неотрицательным числом";
    }

    if (form.usageLimit.trim()) {
        const limit = Number(form.usageLimit);
        if (!Number.isInteger(limit) || limit < 1) {
            return "Лимит использований должен быть положительным числом";
        }
    }

    if (form.startsAt && form.endsAt && form.startsAt > form.endsAt) {
        return "Дата начала позже даты окончания";
    }

    return null;
}

export function PromoCodeFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);

    const navigate = useNavigate();

    const [form, setForm] = useState<FormState>(emptyForm);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(Boolean(id));

    useEffect(() => {
        if (!id) return;

        async function loadPromo() {
            try {
                setIsPageLoading(true);

                const promo = await getAdminPromoCodeById(id!);

                setForm({
                    code: promo.code,
                    discountPercent: String(promo.discountPercent),
                    minOrderAmount: String(promo.minOrderAmount),
                    usageLimit:
                        promo.usageLimit === null ? "" : String(promo.usageLimit),
                    startsAt: toDateInput(promo.startsAt),
                    endsAt: toDateInput(promo.endsAt),
                    isActive: promo.isActive,
                });
            } catch (error) {
                console.error("LOAD_ADMIN_PROMO_ERROR:", error);

                showToast({ type: "error", message: "Промокод не найден" });
                navigate("/admin/promo-codes");
            } finally {
                setIsPageLoading(false);
            }
        }

        void loadPromo();
    }, [id, navigate, showToast]);

    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationError = validate(form);

        if (validationError) {
            showToast({ type: "error", message: validationError });
            return;
        }

        const payload: PromoCodePayload = {
            code: form.code.trim().toUpperCase(),
            discountPercent: Number(form.discountPercent),
            minOrderAmount: Number(form.minOrderAmount),
            usageLimit: form.usageLimit.trim() ? Number(form.usageLimit) : null,
            startsAt: fromDateInput(form.startsAt),
            endsAt: fromDateInput(form.endsAt),
            isActive: form.isActive,
        };

        setIsLoading(true);

        try {
            if (isEdit && id) {
                await updateAdminPromoCode(id, payload);
                showToast({ type: "success", message: "Промокод обновлён" });
            } else {
                await createAdminPromoCode(payload);
                showToast({ type: "success", message: "Промокод создан" });
            }

            navigate("/admin/promo-codes");
        } catch (error: any) {
            const code = error?.response?.data?.error?.code;

            showToast({
                type: "error",
                message:
                    code === "PROMO_CODE_EXISTS"
                        ? "Такой промокод уже существует"
                        : isEdit
                            ? "Не удалось обновить промокод"
                            : "Не удалось создать промокод",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isPageLoading) {
        return (
            <div className="rounded-[28px] bg-white p-8 text-[15px] text-neutral-500 shadow-sm">
                Загружаем промокод...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-[860px]">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <Link
                        to="/admin/promo-codes"
                        className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm transition hover:bg-neutral-100"
                    >
                        Назад к промокодам
                    </Link>

                    <h1 className="mt-6 text-[36px] font-semibold tracking-[-0.05em] text-black">
                        {isEdit ? "Редактировать промокод" : "Добавить промокод"}
                    </h1>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/admin/promo-codes")}
                    >
                        Отмена
                    </Button>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Сохраняем..." : "Сохранить"}
                    </Button>
                </div>
            </div>

            <div className="mt-8 space-y-6">
                <FormCard title="Основное">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Код">
                            <input
                                value={form.code}
                                onChange={(event) =>
                                    updateField(
                                        "code",
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                className="input"
                                placeholder="SUMMER10"
                            />
                        </Field>

                        <Field label="Скидка, %">
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={form.discountPercent}
                                onChange={(event) =>
                                    updateField(
                                        "discountPercent",
                                        event.target.value,
                                    )
                                }
                                className="input"
                                placeholder="10"
                            />
                        </Field>
                    </div>
                </FormCard>

                <FormCard title="Ограничения">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Минимальная сумма заказа, ₽">
                            <input
                                type="number"
                                min={0}
                                value={form.minOrderAmount}
                                onChange={(event) =>
                                    updateField(
                                        "minOrderAmount",
                                        event.target.value,
                                    )
                                }
                                className="input"
                                placeholder="0"
                            />
                        </Field>

                        <Field label="Лимит использований (пусто = без лимита)">
                            <input
                                type="number"
                                min={1}
                                value={form.usageLimit}
                                onChange={(event) =>
                                    updateField("usageLimit", event.target.value)
                                }
                                className="input"
                                placeholder="Без лимита"
                            />
                        </Field>

                        <Field label="Действует с">
                            <input
                                type="date"
                                value={form.startsAt}
                                onChange={(event) =>
                                    updateField("startsAt", event.target.value)
                                }
                                className="input"
                            />
                        </Field>

                        <Field label="Действует по">
                            <input
                                type="date"
                                value={form.endsAt}
                                onChange={(event) =>
                                    updateField("endsAt", event.target.value)
                                }
                                className="input"
                            />
                        </Field>
                    </div>
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
                                    ? "Промокод активен"
                                    : "Промокод выключен"}
                            </p>

                            <p
                                className={`mt-1 text-[14px] leading-5 ${
                                    form.isActive
                                        ? "text-white/70"
                                        : "text-neutral-500"
                                }`}
                            >
                                {form.isActive
                                    ? "Покупатели смогут применить промокод."
                                    : "Промокод не будет применяться."}
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
        </form>
    );
}

function FormCard({ title, children }: { title: string; children: ReactNode }) {
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
