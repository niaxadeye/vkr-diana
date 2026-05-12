import type { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prisma";
import type { AdminOrderQuery, CreateOrderInput } from "./order.schemas";

type CreateOrderParams = { userId: string; data: CreateOrderInput; };

const RESERVED_ORDER_STATUSES = ["CREATED", "CONFIRMED", "ASSEMBLING"] as const;

type ReservedOrderStatus = (typeof RESERVED_ORDER_STATUSES)[number];

function isReservedOrderStatus(status: string): status is ReservedOrderStatus {
    return RESERVED_ORDER_STATUSES.includes(status as ReservedOrderStatus);
}

function shouldReleaseReserve(oldStatus: string, newStatus: string) {
    return isReservedOrderStatus(oldStatus) && newStatus === "CANCELLED";
}
function shouldShipReservedItems(oldStatus: string, newStatus: string) {
    return isReservedOrderStatus(oldStatus) && newStatus === "SHIPPED";
}

function shouldForbidReturnToReserved(oldStatus: string, newStatus: string) {
    return (
        ["SHIPPED", "DELIVERED", "CANCELLED"].includes(oldStatus) &&
        isReservedOrderStatus(newStatus)
    );
}

export const orderService = {
    async createOrder({ userId, data }: CreateOrderParams) {
        return prisma.$transaction(async (tx) => {
            const normalizedItems = mergeSameItems(data.items);

            const variantIds = normalizedItems.map((item) => item.variantId);

            const variants = await tx.productVariant.findMany({
                where: {
                    id: {
                        in: variantIds,
                    },
                },
                include: {
                    product: {
                        include: {
                            images: {
                                orderBy: {
                                    sortOrder: "asc",
                                },
                            },
                        },
                    },
                },
            });

            if (variants.length !== variantIds.length) {
                throw new Error("ORDER_VARIANT_NOT_FOUND");
            }

            const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

            for (const item of normalizedItems) {
                const variant = variants.find(
                    (currentVariant) => currentVariant.id === item.variantId,
                );

                if (!variant) {
                    throw new Error("ORDER_VARIANT_NOT_FOUND");
                }

                if (variant.productId !== item.productId) {
                    throw new Error("ORDER_PRODUCT_VARIANT_MISMATCH");
                }

                if (variant.product.status !== "ACTIVE") {
                    throw new Error("ORDER_PRODUCT_NOT_ACTIVE");
                }

                if (!variant.isActive) {
                    throw new Error("ORDER_VARIANT_NOT_ACTIVE");
                }

                const availableStock = variant.stock - variant.reservedStock;

                if (availableStock < item.quantity) {
                    throw new Error("ORDER_NOT_ENOUGH_STOCK");
                }

                const unitPrice = variant.priceOverride ?? variant.product.price;
                const totalPrice = unitPrice * item.quantity;
                const firstImage = variant.product.images[0];

                orderItemsData.push({
                    productId: variant.product.id,
                    variantId: variant.id,

                    title: variant.product.title,
                    slug: variant.product.slug,
                    size: variant.size,
                    color: variant.color,
                    imageUrl: firstImage?.url ?? null,

                    unitPrice,
                    quantity: item.quantity,
                    totalPrice,
                });
            }

            const subtotal = orderItemsData.reduce(
                (sum, item) => sum + item.totalPrice,
                0,
            );

            const discountTotal = 0;
            const deliveryPrice = data.delivery.price;
            const total = subtotal + deliveryPrice - discountTotal;

            const order = await tx.order.create({
                data: {
                    userId: userId,

                    customerName: data.customer.fullName,
                    customerPhone: data.customer.phone,
                    customerEmail: normalizeNullableString(data.customer.email),

                    deliveryProvider: data.delivery.provider,
                    deliveryMethod: data.delivery.method,
                    deliveryTariffCode: normalizeNullableString(
                        data.delivery.tariffCode,
                    ),
                    deliveryPrice,

                    deliveryCity: data.deliveryAddress.city,
                    deliveryStreet: data.deliveryAddress.street,
                    deliveryHouse: data.deliveryAddress.house,
                    deliveryApartment: normalizeNullableString(
                        data.deliveryAddress.apartment,
                    ),
                    deliveryEntrance: normalizeNullableString(
                        data.deliveryAddress.entrance,
                    ),
                    deliveryFloor: normalizeNullableString(
                        data.deliveryAddress.floor,
                    ),
                    deliveryComment: normalizeNullableString(
                        data.deliveryAddress.courierComment,
                    ),

                    cdekCityCode: normalizeNullableString(
                        data.delivery.cdekCityCode,
                    ),
                    cdekPvzCode: normalizeNullableString(data.delivery.cdekPvzCode),

                    promoCode: normalizeNullableString(data.promoCode),

                    subtotal,
                    discountTotal,
                    total,

                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: true,
                },
            });

            for (const item of normalizedItems) {
                await tx.productVariant.update({
                    where: {
                        id: item.variantId,
                    },
                    data: {
                        reservedStock: {
                            increment: item.quantity,
                        },
                    },
                });
            }

            return order;
        });
    },

    async getMyOrders(userId: string) {
        return prisma.order.findMany({
            where: {
                userId,
            },
            include: {
                items: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async getOrderById(userId: string, orderId: string) {
        return prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: true,
            },
        });
    },
    async getAdminOrders(query: AdminOrderQuery) {
        const search = query.search?.trim();

        const orderNumberSearch = search ? Number(search) : Number.NaN;

        const searchWhere: Prisma.OrderWhereInput | undefined = search
            ? {
                OR: [
                    ...(Number.isInteger(orderNumberSearch)
                        ? [
                            {
                                orderNumber: orderNumberSearch,
                            },
                        ]
                        : []),

                    {
                        customerName: {
                            contains: search,
                        },
                    },
                    {
                        customerPhone: {
                            contains: search,
                        },
                    },
                    {
                        customerEmail: {
                            contains: search,
                        },
                    },
                ],
            }
            : undefined;

        const where: Prisma.OrderWhereInput = {
            ...(query.status ? { status: query.status } : {}),
            ...(query.paymentStatus
                ? { paymentStatus: query.paymentStatus }
                : {}),
            ...(query.deliveryProvider
                ? { deliveryProvider: query.deliveryProvider }
                : {}),
            ...(query.deliveryMethod
                ? { deliveryMethod: query.deliveryMethod }
                : {}),
            ...(searchWhere ? searchWhere : {}),
        };

        const [items, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            items,
            meta: {
                page: query.page,
                limit: query.limit,
                total,
                pages: Math.ceil(total / query.limit),
            },
        };
    },

    async getAdminOrderById(id: string) {
        return prisma.order.findUnique({
            where: {
                id,
            },
            include: {
                items: true,
            },
        });
    },

    async updateOrderStatus(
        id: string,
        status:
            | "CREATED"
            | "CONFIRMED"
            | "ASSEMBLING"
            | "SHIPPED"
            | "DELIVERED"
            | "CANCELLED",
    ) {
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: {
                    id,
                },
                include: {
                    items: true,
                },
            });

            if (!order) {
                throw new Error("ORDER_NOT_FOUND");
            }

            const oldStatus = order.status;
            const newStatus = status;

            if (oldStatus === newStatus) {
                return order;
            }

            if (shouldForbidReturnToReserved(oldStatus, newStatus)) {
                throw new Error("INVALID_ORDER_STATUS_ROLLBACK");
            }

            if (shouldReleaseReserve(oldStatus, newStatus)) {
                for (const item of order.items) {
                    if (!item.variantId) {
                        throw new Error("ORDER_ITEM_VARIANT_NOT_FOUND");
                    }

                    const result = await tx.productVariant.updateMany({
                        where: {
                            id: item.variantId,
                            reservedStock: {
                                gte: item.quantity,
                            },
                        },
                        data: {
                            reservedStock: {
                                decrement: item.quantity,
                            },
                        },
                    });

                    if (result.count !== 1) {
                        throw new Error("RESERVED_STOCK_RELEASE_FAILED");
                    }
                }
            }

            if (shouldShipReservedItems(oldStatus, newStatus)) {
                for (const item of order.items) {
                    if (!item.variantId) {
                        throw new Error("ORDER_ITEM_VARIANT_NOT_FOUND");
                    }

                    const result = await tx.productVariant.updateMany({
                        where: {
                            id: item.variantId,
                            stock: {
                                gte: item.quantity,
                            },
                            reservedStock: {
                                gte: item.quantity,
                            },
                        },
                        data: {
                            stock: {
                                decrement: item.quantity,
                            },
                            reservedStock: {
                                decrement: item.quantity,
                            },
                        },
                    });

                    if (result.count !== 1) {
                        throw new Error("PRODUCT_STOCK_SHIP_FAILED");
                    }
                }
            }

            return tx.order.update({
                where: {
                    id,
                },
                data: {
                    status: newStatus,
                },
                include: {
                    items: true,
                },
            });
        });
    },


    async updatePaymentStatus(
        id: string,
        paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED",
    ) {
        return prisma.order.update({
            where: {
                id,
            },
            data: {
                paymentStatus,
            },
            include: {
                items: true,
            },
        });
    },
};



function normalizeNullableString(value?: string | null) {
    const normalized = value?.trim();

    return normalized ? normalized : null;
}

function mergeSameItems(items: CreateOrderInput["items"]) {
    const map = new Map<
        string,
        {
            productId: string;
            variantId: string;
            quantity: number;
        }
    >();

    for (const item of items) {
        const key = `${item.productId}:${item.variantId}`;
        const existingItem = map.get(key);

        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            map.set(key, {
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            });
        }
    }

    return Array.from(map.values());
}