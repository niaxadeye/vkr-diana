import type { DeliveryAddress } from "../model/deliveryAddress.types";

export function formatDeliveryAddress(address: DeliveryAddress) {
    const parts = [
        address.city,
        address.street ? address.street : null,
        address.house ? `д. ${address.house}` : null,
        address.apartment ? `кв./офис ${address.apartment}` : null,
        address.entrance ? `подъезд ${address.entrance}` : null,
        address.floor ? `этаж ${address.floor}` : null,
        address.cdekPvzName ? `ПВЗ СДЕК ${address.cdekPvzName}` : null,
        address.cdekPvzAddress ? address.cdekPvzAddress : null,
    ].filter(Boolean);

    return parts.join(", ");
}