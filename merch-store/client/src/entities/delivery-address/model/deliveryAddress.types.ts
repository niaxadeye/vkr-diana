export type DeliveryType = "courier";

export type DeliveryAddress = {
    id: string;
    userId: string;

    title: string;
    fullName: string;
    phone: string;
    city: string;

    deliveryType: DeliveryType;

    street: string;
    house: string;
    apartment: string | null;
    entrance: string | null;
    floor: string | null;
    courierComment: string | null;

    isDefault: boolean;

    createdAt: string;
    updatedAt: string;
};

export type DeliveryAddressFormValues = {
    title: string;
    fullName: string;
    phone: string;
    city: string;

    deliveryType: DeliveryType;

    street: string;
    house: string;
    apartment: string;
    entrance: string;
    floor: string;
    courierComment: string;

    isDefault: boolean;
};

export type CreateDeliveryAddressPayload = DeliveryAddressFormValues;

export type UpdateDeliveryAddressPayload = Partial<DeliveryAddressFormValues>;