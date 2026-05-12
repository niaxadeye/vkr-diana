import { prisma } from "../../prisma/prisma";
import type {
  DeliveryAddressInput,
  UpdateDeliveryAddressInput,
} from "./delivery-address.schemas";

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function normalizeAddressData(input: DeliveryAddressInput) {
  const baseData = {
    title: input.title.trim(),
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),

    city: input.city.trim(),
    deliveryType: input.deliveryType,

    cdekCityCode: emptyToNull(input.cdekCityCode),
    cdekCityName: emptyToNull(input.cdekCityName),
    cdekRegion: emptyToNull(input.cdekRegion),
    cdekCountry: emptyToNull(input.cdekCountry),

    cdekPvzCode: emptyToNull(input.cdekPvzCode),
    cdekPvzName: emptyToNull(input.cdekPvzName),
    cdekPvzAddress: emptyToNull(input.cdekPvzAddress),
    cdekPvzWorkTime: emptyToNull(input.cdekPvzWorkTime),

    street: emptyToNull(input.street),
    house: emptyToNull(input.house),
    apartment: emptyToNull(input.apartment),
    entrance: emptyToNull(input.entrance),
    floor: emptyToNull(input.floor),
    courierComment: emptyToNull(input.courierComment),

    isDefault: input.isDefault ?? false,
  };

  if (input.deliveryType === "courier") {
    return {
      ...baseData,
      cdekPvzCode: null,
      cdekPvzName: null,
      cdekPvzAddress: null,
      cdekPvzWorkTime: null,
    };
  }

  return {
    ...baseData,
    street: null,
    house: null,
    apartment: null,
    entrance: null,
    floor: null,
    courierComment: null,
  };
}

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

  async createAddress(userId: string, input: DeliveryAddressInput) {
    return prisma.$transaction(async (tx) => {
      const existingAddressesCount = await tx.deliveryAddress.count({
        where: {
          userId,
        },
      });

      const normalizedData = normalizeAddressData(input);

      const shouldBeDefault =
        normalizedData.isDefault === true || existingAddressesCount === 0;

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
          ...normalizedData,
          userId,
          isDefault: shouldBeDefault,
        },
      });
    });
  },

  async updateAddress(
    userId: string,
    addressId: string,
    input: UpdateDeliveryAddressInput,
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

      const normalizedData = normalizeAddressData(input);

      if (normalizedData.isDefault === true) {
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
        data: normalizedData,
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