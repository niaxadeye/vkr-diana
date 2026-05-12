import { prisma } from "../../prisma/prisma";
import type {
    DeliveryAddressInput,
    UpdateDeliveryAddressInput,
} from "./delivery-address.schemas";

export const deliveryAddressService = {
    async getUserAddresses(userId: string) {
        return prisma.deliveryAddress.findMany({
            where: {
                userId,
            },
            orderBy: [
                {
                    isDefault: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });
    },

    async createAddress(userId: string, data: DeliveryAddressInput) {
        return prisma.$transaction(async (tx) => {
            const existingAddressesCount = await tx.deliveryAddress.count({
                where: {
                    userId,
                },
            });

            const shouldBeDefault =
                data.isDefault === true || existingAddressesCount === 0;

            if (shouldBeDefault) {
                await tx.deliveryAddress.updateMany({
                    where: {
                        userId,
                    },
                    data: {
                        isDefault: false,
                    },
                });
            }

            return tx.deliveryAddress.create({
                data: {
                    userId,
                    title: data.title,
                    fullName: data.fullName,
                    phone: data.phone,
                    city: data.city,
                    deliveryType: data.deliveryType ?? "courier",
                    street: data.street,
                    house: data.house,
                    apartment: data.apartment || null,
                    entrance: data.entrance || null,
                    floor: data.floor || null,
                    courierComment: data.courierComment || null,
                    isDefault: shouldBeDefault,
                },
            });
        });
    },

    async updateAddress(
        userId: string,
        addressId: string,
        data: UpdateDeliveryAddressInput,
    ) {
        return prisma.$transaction(async (tx) => {
            const address = await tx.deliveryAddress.findFirst({
                where: {
                    id: addressId,
                    userId,
                },
            });

            if (!address) {
                return null;
            }

            if (data.isDefault === true) {
                await tx.deliveryAddress.updateMany({
                    where: {
                        userId,
                        id: {
                            not: addressId,
                        },
                    },
                    data: {
                        isDefault: false,
                    },
                });
            }

            return tx.deliveryAddress.update({
                where: {
                    id: addressId,
                },
                data: {
                    ...(data.title !== undefined && { title: data.title }),
                    ...(data.fullName !== undefined && { fullName: data.fullName }),
                    ...(data.phone !== undefined && { phone: data.phone }),
                    ...(data.city !== undefined && { city: data.city }),
                    ...(data.deliveryType !== undefined && {
                        deliveryType: data.deliveryType,
                    }),
                    ...(data.street !== undefined && { street: data.street }),
                    ...(data.house !== undefined && { house: data.house }),
                    ...(data.apartment !== undefined && {
                        apartment: data.apartment || null,
                    }),
                    ...(data.entrance !== undefined && {
                        entrance: data.entrance || null,
                    }),
                    ...(data.floor !== undefined && {
                        floor: data.floor || null,
                    }),
                    ...(data.courierComment !== undefined && {
                        courierComment: data.courierComment || null,
                    }),
                    ...(data.isDefault !== undefined && {
                        isDefault: data.isDefault,
                    }),
                },
            });
        });
    },

    async setDefaultAddress(userId: string, addressId: string) {
        return prisma.$transaction(async (tx) => {
            const address = await tx.deliveryAddress.findFirst({
                where: {
                    id: addressId,
                    userId,
                },
            });

            if (!address) {
                return null;
            }

            await tx.deliveryAddress.updateMany({
                where: {
                    userId,
                },
                data: {
                    isDefault: false,
                },
            });

            return tx.deliveryAddress.update({
                where: {
                    id: addressId,
                },
                data: {
                    isDefault: true,
                },
            });
        });
    },

    async deleteAddress(userId: string, addressId: string) {
        return prisma.$transaction(async (tx) => {
            const address = await tx.deliveryAddress.findFirst({
                where: {
                    id: addressId,
                    userId,
                },
            });

            if (!address) {
                return null;
            }

            await tx.deliveryAddress.delete({
                where: {
                    id: addressId,
                },
            });

            if (address.isDefault) {
                const nextAddress = await tx.deliveryAddress.findFirst({
                    where: {
                        userId,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });

                if (nextAddress) {
                    await tx.deliveryAddress.update({
                        where: {
                            id: nextAddress.id,
                        },
                        data: {
                            isDefault: true,
                        },
                    });
                }
            }

            return address;
        });
    },
};