import { useEffect, useMemo, useState } from "react";

import {
    deleteAdminPromoCode,
    getAdminPromoCodes,
} from "@/entities/promo-code/api/adminPromoCode.api";
import type { PromoCode } from "@/entities/promo-code/model/promo-code.types";
import { Button } from "@/shared/ui/button/Button";
import { ButtonLink } from "@/shared/ui/button/ButtonLink";
import { formatPrice } from "@/entities/cart/lib/formatPrice";
import { showToast } from "@/shared/ui/toast/notify";

export function AdminPromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");


    const filtered = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return promoCodes;
        }

        return promoCodes.filter((promo) =>
            promo.code.toLowerCase().includes(normalized),
        );
    }, [promoCodes, search]);

    async function loadPromoCodes() {
        setIsLoading(true);

        try {
            const data = await getAdminPromoCodes();
            setPromoCodes(data);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: string, code: string) {
        const confirmed = window.confirm(`Удалить промокод ${code}?`);

        if (!confirmed) return;

        await deleteAdminPromoCode(id);

        showToast({
            type: "success",
            message: "Промокод удалён",
        });

        await loadPromoCodes();
    }

    useEffect(() => {
        void loadPromoCodes();
    }, []);

    return (
        <div>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <h1 className="text-[36px] font-semibold tracking-[-0.05em] text-black">
                        Промокоды
                    </h1>

                    <p className="mt-2 max-w-[680px] text-[15px] leading-6 text-neutral-500">
                        Скидки в процентах с ограничениями по сроку, лимиту и минимальной сумме заказа.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={() => void loadPromoCodes()}
                        className="h-11 rounded-full bg-white px-5 text-[15px] font-medium text-black shadow-sm transition hover:bg-neutral-100"
                    >
                        Обновить
                    </button>

                    <ButtonLink to="/admin/promo-codes/create" variant="black">
                        Добавить промокод
                    </ButtonLink>
                </div>
            </div>

            <section className="mt-8 rounded-[28px] bg-white p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Поиск по коду"
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-[15px] outline-none transition focus:border-black md:max-w-[460px]"
                    />

                    <div className="text-sm text-neutral-500">
                        Всего промокодов:{" "}
                        <span className="font-semibold text-black">
                            {filtered.length}
                        </span>
                    </div>
                </div>
            </section>

            <section className="mt-5">
                {isLoading ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center text-neutral-500 shadow-sm">
                        Загрузка...
                    </div>
                ) : promoCodes.length === 0 ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center text-neutral-500 shadow-sm">
                        Промокодов пока нет
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-[28px] bg-white px-5 py-14 text-center shadow-sm">
                        <p className="text-[15px] font-medium text-black">
                            Ничего не найдено
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((promo) => (
                            <PromoCodeCard
                                key={promo.id}
                                promo={promo}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function PromoCodeCard({
    promo,
    onDelete,
}: {
    promo: PromoCode;
    onDelete: (id: string, code: string) => void | Promise<void>;
}) {
    const usageLabel =
        promo.usageLimit === null
            ? `${promo.usageCount} (без лимита)`
            : `${promo.usageCount} / ${promo.usageLimit}`;

    return (
        <article className="flex flex-col rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-neutral-100">
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-[22px] font-bold tracking-[-0.03em] text-black">
                    {promo.code}
                </h2>

                <span
                    className={
                        promo.isActive
                            ? "rounded-full bg-black px-3 py-1 text-xs font-semibold text-white"
                            : "rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500"
                    }
                >
                    {promo.isActive ? "Активен" : "Выключен"}
                </span>
            </div>

            <p className="mt-2 text-[28px] font-semibold text-black">
                −{promo.discountPercent}%
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric
                    label="Мин. сумма"
                    value={
                        promo.minOrderAmount > 0
                            ? formatPrice(promo.minOrderAmount)
                            : "—"
                    }
                />
                <Metric label="Использований" value={usageLabel} />
                <Metric label="Начало" value={formatDate(promo.startsAt)} />
                <Metric label="Окончание" value={formatDate(promo.endsAt)} />
            </div>

            <div className="mt-auto flex gap-2 pt-6">
                <ButtonLink
                    to={`/admin/promo-codes/${promo.id}/edit`}
                    variant="secondary"
                >
                    Изменить
                </ButtonLink>

                <Button
                    type="button"
                    variant="danger"
                    onClick={() => onDelete(promo.id, promo.code)}
                >
                    Удалить
                </Button>
            </div>
        </article>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 text-[15px] font-semibold text-black">{value}</p>
        </div>
    );
}

function formatDate(value: string | null) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}
