import { useEffect, useRef, useState } from "react";

import {
    searchCdekCities,
    type CdekCityOption,
} from "@/entities/cdek/api/cdek.api";

type CdekCitySelectProps = {
    value: string;
    selectedCityCode: string;
    onSelect: (city: CdekCityOption) => void;
    onClear?: () => void;
};

export function CdekCitySelect({
    value,
    selectedCityCode,
    onSelect,
    onClear,
}: CdekCitySelectProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const skipNextSearchRef = useRef(false);

    const [query, setQuery] = useState(value);
    const [cities, setCities] = useState<CdekCityOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!wrapperRef.current) return;

            if (!wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, []);

    async function loadCities(searchValue: string, shouldOpen = false) {
        try {
            setIsLoading(true);

            const result = await searchCdekCities(searchValue);

            setCities(result);

            if (shouldOpen) {
                setIsOpen(true);
            }
        } catch (error) {
            console.error("SEARCH_CDEK_CITIES_ERROR:", error);
            setCities([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (skipNextSearchRef.current) {
            skipNextSearchRef.current = false;
            return;
        }

        const normalizedQuery = query.trim();

        if (selectedCityCode && normalizedQuery === value.trim()) {
            return;
        }

        if (!normalizedQuery) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            void loadCities(normalizedQuery, true);
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [query]);

    function handleInputChange(nextValue: string) {
        setQuery(nextValue);
        setIsOpen(true);

        if (selectedCityCode) {
            onClear?.();
        }
    }

    async function handleFocus() {
        setIsOpen(true);

        if (cities.length === 0) {
            await loadCities(query.trim(), true);
        }
    }

    function handleSelect(city: CdekCityOption) {
        skipNextSearchRef.current = true;

        setQuery(city.fullName);
        setCities([]);
        setIsOpen(false);

        onSelect(city);
    }

    return (
        <div ref={wrapperRef} className="relative">
            <label className="mb-2 block text-[16px] font-[400] leading-5 text-[#060606]">
                Город
            </label>

            <input
                value={query}
                onChange={(event) => handleInputChange(event.target.value)}
                onFocus={handleFocus}
                required
                className="h-11 w-full rounded-2xl border border-neutral-300 px-4 text-[14px] font-[400] text-[#060606] outline-none transition focus:border-2 focus:border-black"
            />

            {isOpen && (
                <div className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-xl">
                    <div className="custom-scrollbar max-h-72 overflow-y-auto overflow-x-hidden p-2">
                        {isLoading && (
                            <div className="px-3 py-3 text-sm text-neutral-500">
                                Ищем города...
                            </div>
                        )}

                        {!isLoading && cities.length === 0 && (
                            <div className="px-3 py-3 text-sm text-neutral-500">
                                Города не найдены
                            </div>
                        )}

                        {!isLoading &&
                            cities.map((city) => (
                                <button
                                    key={city.code}
                                    type="button"
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                    }}
                                    onClick={() => handleSelect(city)}
                                    className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-neutral-100"
                                >
                                    <span className="block text-sm font-medium text-neutral-950">
                                        {city.city}
                                    </span>

                                    <span className="mt-1 block text-xs text-neutral-500">
                                        {[city.region, city.country].filter(Boolean).join(", ")}
                                    </span>
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}