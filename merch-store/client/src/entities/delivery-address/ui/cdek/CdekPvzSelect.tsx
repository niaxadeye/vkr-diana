import { useEffect, useRef, useState } from "react";

import {
    getCdekOffices,
    type CdekOfficeOption,
} from "@/entities/cdek/api/cdek.api";

type CdekPvzSelectProps = {
    cityCode: string;
    value: string;
    selectedPvzAddress: string;
    onSelect: (office: CdekOfficeOption) => void;
    onOpenMap?: () => void;
};

export function CdekPvzSelect({
    cityCode,
    value,
    selectedPvzAddress,
    onSelect,
    onOpenMap,
}: CdekPvzSelectProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const [query, setQuery] = useState("");
    const [offices, setOffices] = useState<CdekOfficeOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const filteredOffices = offices.filter((office) => {
        const search = query.trim().toLowerCase();

        if (!search) {
            return true;
        }

        return (
            office.code.toLowerCase().includes(search) ||
            office.name.toLowerCase().includes(search) ||
            office.address.toLowerCase().includes(search) ||
            office.fullAddress.toLowerCase().includes(search)
        );
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!cityCode) {
            setOffices([]);
            setQuery("");
            return;
        }

        async function loadOffices() {
            try {
                setIsLoading(true);

                const result = await getCdekOffices(cityCode);

                setOffices(result);
            } catch (error) {
                console.error("LOAD_CDEK_OFFICES_ERROR:", error);
                setOffices([]);
            } finally {
                setIsLoading(false);
            }
        }

        void loadOffices();
    }, [cityCode]);

    function handleSelect(office: CdekOfficeOption) {
        setQuery(office.address || office.fullAddress);
        setIsOpen(false);
        onSelect(office);
    }

    const inputValue = isOpen ? query : selectedPvzAddress || query;

    return (
        <div className="space-y-3">
            <div ref={wrapperRef} className="relative">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Пункт выдачи СДЭК
                </label>

                <input
                    value={inputValue}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={
                        cityCode
                            ? "Выберите пункт выдачи"
                            : "Сначала выберите город"
                    }
                    disabled={!cityCode}
                    required
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
                />

                {isOpen && cityCode && (
                    <div className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-xl">
                        <div className="custom-scrollbar max-h-[360px] overflow-y-auto overflow-x-hidden p-2">
                            {isLoading && (
                                <div className="px-3 py-3 text-sm text-neutral-500">
                                    Загружаем пункты выдачи...
                                </div>
                            )}

                            {!isLoading && filteredOffices.length === 0 && (
                                <div className="px-3 py-3 text-sm text-neutral-500">
                                    Пункты выдачи не найдены
                                </div>
                            )}

                            {!isLoading &&
                                filteredOffices.map((office) => (
                                    <button
                                        key={office.code}
                                        type="button"
                                        onClick={() => handleSelect(office)}
                                        className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-neutral-100"
                                    >
                                        <span className="block text-sm font-semibold text-neutral-950">
                                            {office.name}
                                        </span>

                                        <span className="mt-1 block text-sm text-neutral-600">
                                            {office.address || office.fullAddress}
                                        </span>

                                        {office.workTime && (
                                            <span className="mt-1 block text-xs text-neutral-400">
                                                {office.workTime}
                                            </span>
                                        )}
                                    </button>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onOpenMap}
                disabled={!cityCode}
                className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Выбрать ПВЗ на карте
            </button>

            {value && selectedPvzAddress && (
                <div className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <span className="block font-medium text-neutral-950">
                        Выбранный пункт выдачи
                    </span>
                    <span className="mt-1 block">{selectedPvzAddress}</span>
                </div>
            )}
        </div>
    );
}