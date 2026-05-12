import { useEffect, useRef, useState } from "react";

import { Icon } from "@/shared/ui/icon/Icon";

export type CustomSelectOption<T extends string> = {
    value: T;
    label: string;
    description?: string;
};

type Props<T extends string> = {
    value: T | "";
    options: CustomSelectOption<T>[];
    placeholder: string;
    disabled?: boolean;
    onChange: (value: T | "") => void;
    allowEmpty?: boolean;
    emptyLabel?: string;
    className?: string;
};

export function CustomSelect<T extends string>({
    value,
    options,
    placeholder,
    disabled = false,
    onChange,
    allowEmpty = false,
    emptyLabel = "Не выбрано",
    className = "",
}: Props<T>) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                rootRef.current &&
                !rootRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleSelect(nextValue: T | "") {
        onChange(nextValue);
        setOpen(false);
    }

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((current) => !current)}
                className={`flex min-h-[52px] w-full items-center justify-between gap-4 rounded-[16px] border bg-white px-4 py-3 text-left transition ${
                    open
                        ? "border-black"
                        : "border-neutral-200 hover:border-neutral-400"
                } ${
                    disabled
                        ? "cursor-not-allowed bg-neutral-50 opacity-60"
                        : ""
                }`}
            >
                <div className="min-w-0">
                    <p
                        className={`truncate text-[15px] font-medium ${
                            selectedOption ? "text-black" : "text-neutral-400"
                        }`}
                    >
                        {selectedOption?.label ?? placeholder}
                    </p>

                    {selectedOption?.description && (
                        <p className="mt-1 line-clamp-1 text-[13px] text-neutral-500">
                            {selectedOption.description}
                        </p>
                    )}
                </div>

                <Icon
                    name="arrow-right"
                    className={`h-4 w-4 shrink-0 transition ${
                        open ? "-rotate-90" : "rotate-90"
                    }`}
                />
            </button>

            {open && !disabled && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-xl">
                    {allowEmpty && (
                        <button
                            type="button"
                            onClick={() => handleSelect("")}
                            className={`block w-full border-b border-neutral-100 px-4 py-3 text-left transition hover:bg-neutral-50 ${
                                value === "" ? "bg-neutral-50" : ""
                            }`}
                        >
                            <p className="text-[15px] font-medium text-black">
                                {emptyLabel}
                            </p>
                        </button>
                    )}

                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`block w-full border-b border-neutral-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-neutral-50 ${
                                value === option.value ? "bg-neutral-50" : ""
                            }`}
                        >
                            <p className="text-[15px] font-medium text-black">
                                {option.label}
                            </p>

                            {option.description && (
                                <p className="mt-1 line-clamp-1 text-[13px] text-neutral-500">
                                    {option.description}
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}