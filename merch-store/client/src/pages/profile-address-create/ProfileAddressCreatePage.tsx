import { useNavigate } from "react-router";
import { toast } from "sonner";

import { createDeliveryAddress } from "@/entities/delivery-address/api/deliveryAddress.api";
import type { DeliveryAddressFormValues } from "@/entities/delivery-address/model/deliveryAddress.types";
import { DeliveryAddressForm } from "@/entities/delivery-address/ui/DeliveryAddressForm";

export function ProfileAddressCreatePage() {
    const navigate = useNavigate();

    async function handleSubmit(values: DeliveryAddressFormValues) {
        try {
            await createDeliveryAddress(values);

            toast.success("Адрес доставки добавлен");
            navigate("/profile");
        } catch (error) {
            console.error("CREATE_DELIVERY_ADDRESS_ERROR:", error);
            toast.error("Не удалось добавить адрес доставки");
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
                <DeliveryAddressForm
                    submitLabel="Добавить адрес"
                    showTitleField
                    showDefaultCheckbox={false}
                    onSubmit={handleSubmit}
                />
            </section>
        </main>
    );
}