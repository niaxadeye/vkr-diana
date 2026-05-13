import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import type {
    DeliveryAddress,
    DeliveryAddressFormValues,
    DeliveryType,
} from "../model/deliveryAddress.types";
import { IMaskInput } from "react-imask";

import { CdekCitySelect } from "./cdek/CdekCitySelect";
import { CdekPvzSelect } from "./cdek/CdekPvzSelect";
import { DeliveryTypeSelect } from "./cdek/DeliveryTypeSelect";

const initialValues: DeliveryAddressFormValues = {
    title: "",
    fullName: "",
    phone: "",

    city: "",
    deliveryType: "courier",

    cdekCityCode: "",
    cdekCityName: "",
    cdekRegion: "",
    cdekCountry: "",

    cdekPvzCode: "",
    cdekPvzName: "",
    cdekPvzAddress: "",
    cdekPvzWorkTime: "",

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

        cdekCityCode: address.cdekCityCode ?? "",
        cdekCityName: address.cdekCityName ?? "",
        cdekRegion: address.cdekRegion ?? "",
        cdekCountry: address.cdekCountry ?? "",

        cdekPvzCode: address.cdekPvzCode ?? "",
        cdekPvzName: address.cdekPvzName ?? "",
        cdekPvzAddress: address.cdekPvzAddress ?? "",
        cdekPvzWorkTime: address.cdekPvzWorkTime ?? "",

        street: address.street ?? "",
        house: address.house ?? "",
        apartment: address.apartment ?? "",
        entrance: address.entrance ?? "",
        floor: address.floor ?? "",
        courierComment: address.courierComment ?? "",

        isDefault: address.isDefault,
    };
}
const labelClassName =
    "mb-2 block text-[16px] font-[400] leading-5 text-[#060606]";

const inputClassName =
    "h-11 w-full rounded-2xl border border-neutral-300 px-4 text-[14px] font-[400] outline-none transition focus:border-2 focus:border-black";



const animatedBlockVariants: Variants = {
    initial: {
        opacity: 0,
        y: -8,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.22,
            ease: [0, 0.33, 0.66, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        scale: 0.98,
        transition: {
            duration: 0.16,
            ease: [1, 0.66, 0.33, 0],
        },
    },
};
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

    const handleDeliveryTypeChange = (deliveryType: DeliveryType) => {
        setValues((currentValues) => {
            if (deliveryType === "courier") {
                return {
                    ...currentValues,
                    deliveryType,
                    cdekPvzCode: "",
                    cdekPvzName: "",
                    cdekPvzAddress: "",
                    cdekPvzWorkTime: "",
                };
            }

            return {
                ...currentValues,
                deliveryType,
                street: "",
                house: "",
                apartment: "",
                entrance: "",
                floor: "",
                courierComment: "",
            };
        });
    };

    const handleClearCity = () => {
        setValues((currentValues) => ({
            ...currentValues,
            city: "",
            cdekCityCode: "",
            cdekCityName: "",
            cdekRegion: "",
            cdekCountry: "",
            cdekPvzCode: "",
            cdekPvzName: "",
            cdekPvzAddress: "",
            cdekPvzWorkTime: "",
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (values.deliveryType === "courier") {
            if (!values.street.trim() || !values.house.trim()) {
                toast.error("Для курьерской доставки укажите улицу и дом");
                return;
            }
        }

        if (values.deliveryType === "cdek_pickup") {
            if (!values.cdekCityCode || !values.cdekPvzCode) {
                toast.error("Выберите город и пункт выдачи СДЭК");
                return;
            }
        }

        try {
            setIsSubmitting(true);

            await onSubmit({
                ...values,

                title: values.title.trim(),
                fullName: values.fullName.trim(),
                phone: values.phone.trim(),

                city: values.city.trim(),

                cdekCityCode: values.cdekCityCode.trim(),
                cdekCityName: values.cdekCityName.trim(),
                cdekRegion: values.cdekRegion.trim(),
                cdekCountry: values.cdekCountry.trim(),

                cdekPvzCode: values.cdekPvzCode.trim(),
                cdekPvzName: values.cdekPvzName.trim(),
                cdekPvzAddress: values.cdekPvzAddress.trim(),
                cdekPvzWorkTime: values.cdekPvzWorkTime.trim(),

                street: values.street.trim(),
                house: values.house.trim(),
                apartment: values.apartment.trim(),
                entrance: values.entrance.trim(),
                floor: values.floor.trim(),
                courierComment: values.courierComment.trim(),
            });
            window.history.back();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {showTitleField && (
                <div>
                    <label className={labelClassName}>Название</label>

                    <input
                        value={values.title}
                        onChange={(event) => updateField("title", event.target.value)}
                        required
                        className={inputClassName}
                    />
                </div>
            )}

            <div>
                <label className={labelClassName}>ФИО</label>

                <input
                    value={values.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    required
                    className={inputClassName}
                />
            </div>

            <div>
                <label className={labelClassName}>Телефон</label>

                <IMaskInput
                    mask="+{7} (000) 000-00-00"
                    value={values.phone}
                    unmask={false}
                    lazy={false}
                    placeholderChar="_"
                    onAccept={(value) => {
                        updateField("phone", String(value));
                    }}
                    required
                    inputMode="tel"
                    className={inputClassName}
                />
            </div>

            <CdekCitySelect
                value={values.city}
                selectedCityCode={values.cdekCityCode}
                onClear={handleClearCity}
                onSelect={(city) => {
                    setValues((currentValues) => ({
                        ...currentValues,

                        city: city.city,

                        cdekCityCode: city.code,
                        cdekCityName: city.city,
                        cdekRegion: city.region ?? "",
                        cdekCountry: city.country ?? "",

                        cdekPvzCode: "",
                        cdekPvzName: "",
                        cdekPvzAddress: "",
                        cdekPvzWorkTime: "",
                    }));
                }}
            />

            <DeliveryTypeSelect
                value={values.deliveryType}
                onChange={handleDeliveryTypeChange}
            />

            <AnimatePresence mode="wait" initial={false}>
                {values.deliveryType === "courier" && (
                    <motion.div
                        key="courier-fields"
                        variants={animatedBlockVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="overflow-visible"
                    >
                        {/* Desktop */}
                        <div className="hidden space-y-5 md:block">
                            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                                <div>
                                    <label className={labelClassName}>Улица</label>

                                    <input
                                        value={values.street}
                                        onChange={(event) => updateField("street", event.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Дом</label>

                                    <input
                                        value={values.house}
                                        onChange={(event) => updateField("house", event.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className={labelClassName}>Квартира</label>

                                    <input
                                        value={values.apartment}
                                        onChange={(event) => updateField("apartment", event.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Подъезд</label>

                                    <input
                                        value={values.entrance}
                                        onChange={(event) => updateField("entrance", event.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Этаж</label>

                                    <input
                                        value={values.floor}
                                        onChange={(event) => updateField("floor", event.target.value)}
                                        className={inputClassName}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-5 md:hidden">
                            <div>
                                <label className={labelClassName}>Улица</label>

                                <input
                                    value={values.street}
                                    onChange={(event) => updateField("street", event.target.value)}
                                    required
                                    className={inputClassName}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClassName}>Дом</label>

                                    <input
                                        value={values.house}
                                        onChange={(event) => updateField("house", event.target.value)}
                                        required
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Квартира</label>

                                    <input
                                        value={values.apartment}
                                        onChange={(event) => updateField("apartment", event.target.value)}
                                        className={inputClassName}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClassName}>Подъезд</label>

                                    <input
                                        value={values.entrance}
                                        onChange={(event) => updateField("entrance", event.target.value)}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className={labelClassName}>Этаж</label>

                                    <input
                                        value={values.floor}
                                        onChange={(event) => updateField("floor", event.target.value)}
                                        className={inputClassName}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {values.deliveryType === "cdek_pickup" && (
                    <motion.div
                        key="cdek-pickup-fields"
                        variants={animatedBlockVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="overflow-visible"
                    >
                        <CdekPvzSelect
                            cityCode={values.cdekCityCode}
                            value={values.cdekPvzCode}
                            selectedPvzAddress={values.cdekPvzAddress}
                            onOpenMap={() => {
                                toast.info("Выбор ПВЗ на карте подключим следующим этапом");
                            }}
                            onSelect={(office) => {
                                setValues((currentValues) => ({
                                    ...currentValues,

                                    cdekPvzCode: office.code,
                                    cdekPvzName: office.name,
                                    cdekPvzAddress: office.fullAddress || office.address,
                                    cdekPvzWorkTime: office.workTime ?? "",
                                }));
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {showDefaultCheckbox && (
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[14px] text-neutral-700">
                    <input
                        type="checkbox"
                        checked={values.isDefault}
                        onChange={(event) => updateField("isDefault", event.target.checked)}
                        className="h-4 w-4"
                    />

                    Использовать как адрес по умолчанию
                </label>
            )}

            <div className="flex flex-col gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="h-[52px] rounded-full border border-neutral-300 px-6 text-[14px] font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950"
                    >
                        Отмена
                    </button>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-[54px] w-full rounded-full bg-black px-6 text-[15px] font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Сохраняем..." : submitLabel}
                </button>
            </div>
        </form>
    );
}