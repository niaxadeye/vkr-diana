export type OrderStatus =
    | "CREATED"
    | "CONFIRMED"
    | "ASSEMBLING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type DeliveryProvider = "CUSTOM" | "CDEK";

export type DeliveryMethod = "COURIER" | "PICKUP_POINT";

export type CreateOrderPayload = {
    customer: {
        fullName: string;
        phone: string;
        email?: string | null;
    };

    deliveryAddress: {
        city: string;
        street: string;
        house: string;
        apartment?: string | null;
        entrance?: string | null;
        floor?: string | null;
        courierComment?: string | null;
    };

    delivery: {
        provider: DeliveryProvider;
        method: DeliveryMethod;
        tariffCode?: string | null;
        price: number;
        cdekCityCode?: string | null;
        cdekPvzCode?: string | null;
    };

    items: {
        productId: string;
        variantId: string;
        quantity: number;
    }[];

    promoCode?: string | null;
};

export type OrderItem = {
    id: string;

    orderId: string;

    productId: string;
    variantId: string | null;

    title: string;
    slug: string;
    size: string | null;
    color: string | null;
    imageUrl: string | null;

    unitPrice: number;
    quantity: number;
    totalPrice: number;

    createdAt: string;
};

export type Order = {
    id: string;
    orderNumber: number;

    userId: string | null;

    customerName: string;
    customerPhone: string;
    customerEmail: string | null;

    deliveryProvider: DeliveryProvider;
    deliveryMethod: DeliveryMethod;

    deliveryTariffCode: string | null;
    deliveryPrice: number;

    deliveryCity: string;
    deliveryStreet: string;
    deliveryHouse: string;
    deliveryApartment: string | null;
    deliveryEntrance: string | null;
    deliveryFloor: string | null;
    deliveryComment: string | null;

    cdekCityCode: string | null;
    cdekPvzCode: string | null;
    cdekOrderUuid: string | null;
    cdekTrackNumber: string | null;

    promoCode: string | null;
    subtotal: number;
    discountTotal: number;
    total: number;

    status: OrderStatus;
    paymentStatus: PaymentStatus;

    paymentExpiresAt?: string | null;

    createdAt: string;
    updatedAt: string;

    items: OrderItem[];
};

export type AdminOrderQuery = {
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    deliveryProvider?: DeliveryProvider;
    deliveryMethod?: DeliveryMethod;
    page?: number;
    limit?: number;
};

export type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    pages: number;
};

export type AdminOrdersResponse = {
    items: Order[];
    meta: PaginationMeta;
};

export type UpdateOrderStatusPayload = {
    status: OrderStatus;
};

export type UpdatePaymentStatusPayload = {
    paymentStatus: PaymentStatus;
};