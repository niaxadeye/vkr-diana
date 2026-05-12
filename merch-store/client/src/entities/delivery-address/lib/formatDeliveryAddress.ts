import type { DeliveryAddress } from "../model/deliveryAddress.types";

export function formatDeliveryAddress(address: DeliveryAddress) {
    const parts = [
        address.city,
        address.street,
        `д. ${address.house}`,
        address.apartment ? `кв./офис ${address.apartment}` : null,
        address.entrance ? `подъезд ${address.entrance}` : null,
        address.floor ? `этаж ${address.floor}` : null,
    ].filter(Boolean);

    return parts.join(", ");
}