import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
};

const countries = ["Россия", "Болгария", "Сербия", "Германия"];
const currencies = ["RUB", "EUR", "USD"];
const languages = ["Русский", "English"];

export function SettingsModal({ open, onClose }: Props) {
    const [country, setCountry] = useState("Болгария");
    const [currency, setCurrency] = useState("RUB");
    const [language, setLanguage] = useState("Русский");

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* overlay */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* modal */}
            <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 shadow-2xl md:left-1/2 md:top-1/2 md:bottom-auto md:right-auto md:w-full md:max-w-[540px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl">
                {/* header */}
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Ваши настройки
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-neutral-500">
                            Мы автоматически определили ваши настройки, вы можете
                            изменить их, если они не корректны.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <SelectField
                        label="Страна"
                        value={country}
                        options={countries}
                        onChange={setCountry}
                    />

                    <div className="rounded-2xl bg-neutral-100 px-5 py-4 text-sm leading-6 text-neutral-500">
                        От выбранной страны зависят доступные способы оплаты,
                        доставки и ассортимент товаров. Пожалуйста, выберите
                        страну, в которой вы находитесь.
                    </div>

                    <SelectField
                        label="Валюта"
                        value={currency}
                        options={currencies}
                        onChange={setCurrency}
                    />

                    <SelectField
                        label="Язык"
                        value={language}
                        options={languages}
                        onChange={setLanguage}
                    />

                    <button
                        onClick={() => {
                            localStorage.setItem("settings-confirmed", "true");

                            localStorage.setItem(
                                "user-settings",
                                JSON.stringify({
                                    country,
                                    currency,
                                    language,
                                }),
                            );

                            onClose();
                        }}
                        className="mt-2 h-12 w-full rounded-full bg-black text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                        Подтвердить
                    </button>
                </div>
            </div>
        </div>
    );
}

type SelectProps = {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
};

function SelectField({
    label,
    value,
    options,
    onChange,
}: SelectProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium">{label}</label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-black"
                >
                    {options.map((option) => (
                        <option key={option}>{option}</option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                />
            </div>
        </div>
    );
}