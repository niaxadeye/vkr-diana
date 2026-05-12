import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import {
    getDeliveryAddresses,
    updateDeliveryAddress,
} from "@/entities/delivery-address/api/deliveryAddress.api";
import type {
    DeliveryAddress,
    DeliveryAddressFormValues,
} from "@/entities/delivery-address/model/deliveryAddress.types";
import { DeliveryAddressForm } from "@/entities/delivery-address/ui/DeliveryAddressForm";

export function ProfileAddressEditPage() {
    const navigate = useNavigate();
    const params = useParams();

    const addressId = params.id;

    const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const address = useMemo(() => {
        return addresses.find((item) => item.id === addressId) ?? null;
    }, [addresses, addressId]);

    useEffect(() => {
        async function loadAddress() {
            try {
                setIsLoading(true);

                const result = await getDeliveryAddresses();

                setAddresses(result);
            } catch (error) {
                console.error("LOAD_DELIVERY_ADDRESS_ERROR:", error);
                toast.error("Не удалось загрузить адрес доставки");
            } finally {
                setIsLoading(false);
            }
        }

        void loadAddress();
    }, []);

    async function handleSubmit(values: DeliveryAddressFormValues) {
        if (!addressId) {
            toast.error("Адрес доставки не найден");
            return;
        }

        try {
            await updateDeliveryAddress(addressId, values);

            toast.success("Адрес доставки сохранён");
            navigate("/profile");
        } catch (error) {
            console.error("UPDATE_DELIVERY_ADDRESS_ERROR:", error);
            toast.error("Не удалось сохранить адрес доставки");
        }
    }

    return (
        <main
            className="relative min-h-[calc(100vh-80px)] bg-[#eeeeee] bg-cover bg-center bg-no-repeat md:flex md:items-center md:justify-end md:px-[8vw]"
            style={{
                backgroundImage: "url('/map.png')",
            }}
        >
            <div className="absolute inset-0 bg-white/15 md:bg-transparent" />

            <section className="relative z-10 min-h-[calc(100vh-80px)] bg-white px-5 pb-8 pt-6 md:min-h-0 md:w-[33vw] md:min-w-[620px] md:max-w-[620px] md:rounded-2xl md:px-6 md:py-6 md:shadow-2xl min-[1900px]:w-[620px]">
                {isLoading ? (
                    <div className="text-[16px] font-[400] leading-5 text-[#666666]">
                        Загружаем адрес...
                    </div>
                ) : !address ? (
                    <div>
                        <p className="text-[16px] font-[400] leading-5 text-[#060606]">
                            Адрес доставки не найден
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="mt-6 h-[54px] w-full rounded-full bg-black px-6 text-[15px] font-bold text-white transition hover:bg-neutral-800"
                        >
                            Вернуться в профиль
                        </button>
                    </div>
                ) : (
                    <DeliveryAddressForm
                        initialAddress={address}
                        submitLabel="Сохранить адрес"
                        showTitleField
                        showDefaultCheckbox={false}
                        onSubmit={handleSubmit}
                    />
                )}
            </section>
        </main>
    );
}