import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import { deliveryAddressService } from "./delivery-address.service";
import {
    deliveryAddressSchema,
    updateDeliveryAddressSchema,
} from "./delivery-address.schemas";

function getParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function getUserId(req: Request) {
    return req.user?.userId;
}

export const deliveryAddressController = {
    async getMyAddresses(req: Request, res: Response) {
        const userId = getUserId(req);

        if (!userId) {
            return fail(
                res,
                401,
                "UNAUTHORIZED",
                "Пользователь не авторизован",
            );
        }

        try {
            const addresses = await deliveryAddressService.getUserAddresses(userId);

            return success(res, addresses);
        } catch (error) {
            console.error("GET_DELIVERY_ADDRESSES_ERROR:", error);

            return fail(
                res,
                500,
                "SERVER_ERROR",
                "Не удалось получить адреса доставки",
            );
        }
    },

    async createAddress(req: Request, res: Response) {
        const userId = getUserId(req);

        if (!userId) {
            return fail(
                res,
                401,
                "UNAUTHORIZED",
                "Пользователь не авторизован",
            );
        }

        const parsed = deliveryAddressSchema.safeParse(req.body);

        if (!parsed.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректные данные адреса",
                parsed.error.issues,
            );
        }

        try {
            const address = await deliveryAddressService.createAddress(
                userId,
                parsed.data,
            );

            return success(res, address);
        } catch (error) {
            console.error("CREATE_DELIVERY_ADDRESS_ERROR:", error);

            return fail(
                res,
                500,
                "SERVER_ERROR",
                "Не удалось создать адрес доставки",
            );
        }
    },

    async updateAddress(req: Request, res: Response) {
        const userId = getUserId(req);

        if (!userId) {
            return fail(
                res,
                401,
                "UNAUTHORIZED",
                "Пользователь не авторизован",
            );
        }

        const id = getParam(req.params.id);

        if (!id) {
            return fail(
                res,
                400,
                "BAD_REQUEST",
                "ID адреса не передан",
            );
        }

        const parsed = updateDeliveryAddressSchema.safeParse(req.body);

        if (!parsed.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректные данные адреса",
                parsed.error.issues,
            );
        }

        try {
            const address = await deliveryAddressService.updateAddress(
                userId,
                id,
                parsed.data,
            );

            if (!address) {
                return fail(
                    res,
                    404,
                    "DELIVERY_ADDRESS_NOT_FOUND",
                    "Адрес доставки не найден",
                );
            }

            return success(res, address);
        } catch (error) {
            console.error("UPDATE_DELIVERY_ADDRESS_ERROR:", error);

            return fail(
                res,
                500,
                "SERVER_ERROR",
                "Не удалось обновить адрес доставки",
            );
        }
    },

    async setDefaultAddress(req: Request, res: Response) {
        const userId = getUserId(req);

        if (!userId) {
            return fail(
                res,
                401,
                "UNAUTHORIZED",
                "Пользователь не авторизован",
            );
        }

        const id = getParam(req.params.id);

        if (!id) {
            return fail(
                res,
                400,
                "BAD_REQUEST",
                "ID адреса не передан",
            );
        }

        try {
            const address = await deliveryAddressService.setDefaultAddress(
                userId,
                id,
            );

            if (!address) {
                return fail(
                    res,
                    404,
                    "DELIVERY_ADDRESS_NOT_FOUND",
                    "Адрес доставки не найден",
                );
            }

            return success(res, address);
        } catch (error) {
            console.error("SET_DEFAULT_DELIVERY_ADDRESS_ERROR:", error);

            return fail(
                res,
                500,
                "SERVER_ERROR",
                "Не удалось выбрать адрес по умолчанию",
            );
        }
    },

    async deleteAddress(req: Request, res: Response) {
        const userId = getUserId(req);

        if (!userId) {
            return fail(
                res,
                401,
                "UNAUTHORIZED",
                "Пользователь не авторизован",
            );
        }

        const id = getParam(req.params.id);

        if (!id) {
            return fail(
                res,
                400,
                "BAD_REQUEST",
                "ID адреса не передан",
            );
        }

        try {
            const address = await deliveryAddressService.deleteAddress(
                userId,
                id,
            );

            if (!address) {
                return fail(
                    res,
                    404,
                    "DELIVERY_ADDRESS_NOT_FOUND",
                    "Адрес доставки не найден",
                );
            }

            return success(res, address);
        } catch (error) {
            console.error("DELETE_DELIVERY_ADDRESS_ERROR:", error);

            return fail(
                res,
                500,
                "SERVER_ERROR",
                "Не удалось удалить адрес доставки",
            );
        }
    },
};