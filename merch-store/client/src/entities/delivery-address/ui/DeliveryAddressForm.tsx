import { type FormEvent, useState } from "react";

import type {
    DeliveryAddress,
    DeliveryAddressFormValues,
} from "../model/deliveryAddress.types";

const initialValues: DeliveryAddressFormValues = {
    title: "",
    fullName: "",
    phone: "",
    city: "",
    deliveryType: "courier",
    street: "",
    house: "",
    apartment: "",
    entrance: "",
    floor: "",
    courierComment: "",
    isDefault: false,
};

type DeliveryAddressFormProps = {
    initialAddress?: DeliveryAddress | null;
    submitLabel?: string;
    showTitleField?: boolean;
    showDefaultCheckbox?: boolean;
    onSubmit: (values: DeliveryAddressFormValues) => Promise<void> | void;
    onCancel?: () => void;
};

function mapAddressToFormValues(
    address?: DeliveryAddress | null,
): DeliveryAddressFormValues {
    if (!address) {
        return initialValues;
    }

    return {
        title: address.title,
        fullName: address.fullName,
        phone: address.phone,
        city: address.city,
        deliveryType: address.deliveryType,
        street: address.street,
        house: address.house,
        apartment: address.apartment ?? "",
        entrance: address.entrance ?? "",
        floor: address.floor ?? "",
        courierComment: address.courierComment ?? "",
        isDefault: address.isDefault,
    };
}

export function DeliveryAddressForm({
    initialAddress = null,
    submitLabel = "Сохранить адрес",
    showTitleField = true,
    showDefaultCheckbox = false,
    onSubmit,
    onCancel,
}: DeliveryAddressFormProps) {
    const [values, setValues] = useState<DeliveryAddressFormValues>(() =>
        mapAddressToFormValues(initialAddress),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = <K extends keyof DeliveryAddressFormValues>(
        field: K,
        value: DeliveryAddressFormValues[K],
    ) => {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);

            await onSubmit({
                ...values,
                title: values.title.trim(),
                fullName: values.fullName.trim(),
                phone: values.phone.trim(),
                city: values.city.trim(),
                street: values.street.trim(),
                house: values.house.trim(),
                apartment: values.apartment.trim(),
                entrance: values.entrance.trim(),
                floor: values.floor.trim(),
                courierComment: values.courierComment.trim(),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {showTitleField && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Название адреса
                    </label>
                    <input
                        value={values.title}
                        onChange={(event) =>
                            updateField("title", event.target.value)
                        }
                        placeholder="Например: Дом, офис, пункт для подарков"
                        required
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Полное имя / ФИО
                    </label>
                    <input
                        value={values.fullName}
                        onChange={(event) =>
                            updateField("fullName", event.target.value)
                        }
                        placeholder="Иванов Иван Иванович"
                        required
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Телефон
                    </label>
                    <input
                        value={values.phone}
                        onChange={(event) =>
                            updateField("phone", event.target.value)
                        }
                        placeholder="+7 999 123-45-67"
                        required
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Город в России
                    </label>
                    <input
                        value={values.city}
                        onChange={(event) =>
                            updateField("city", event.target.value)
                        }
                        placeholder="Москва"
                        required
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Тип доставки
                    </label>
                    <select
                        value={values.deliveryType}
                        onChange={() => updateField("deliveryType", "courier")}
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    >
                        <option value="courier">Курьер</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Улица
                    </label>
                    <input
                        value={values.street}
                        onChange={(event) =>
                            updateField("street", event.target.value)
                        }
                        placeholder="Тверская"
                        required
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Дом
                    </label>
                    <input
                        value={values.house}
                        onChange={(event) =>
                            updateField("house", event.target.value)
                        }
                        placeholder="10"
                        required
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Квартира / офис
                    </label>
                    <input
                        value={values.apartment}
                        onChange={(event) =>
                            updateField("apartment", event.target.value)
                        }
                        placeholder="15"
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Подъезд
                    </label>
                    <input
                        value={values.entrance}
                        onChange={(event) =>
                            updateField("entrance", event.target.value)
                        }
                        placeholder="2"
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Этаж
                    </label>
                    <input
                        value={values.floor}
                        onChange={(event) =>
                            updateField("floor", event.target.value)
                        }
                        placeholder="5"
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                    />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Комментарий для курьера
                </label>
                <textarea
                    value={values.courierComment}
                    onChange={(event) =>
                        updateField("courierComment", event.target.value)
                    }
                    placeholder="Например: позвонить за 10 минут, домофон не работает"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                />
            </div>

            {showDefaultCheckbox && (
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <input
                        type="checkbox"
                        checked={values.isDefault}
                        onChange={(event) =>
                            updateField("isDefault", event.target.checked)
                        }
                        className="h-4 w-4"
                    />
                    Использовать как адрес по умолчанию
                </label>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950"
                    >
                        Отмена
                    </button>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Сохраняем..." : submitLabel}
                </button>
            </div>
        </form>
    );
}