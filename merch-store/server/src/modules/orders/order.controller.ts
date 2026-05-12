import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import {
    adminOrderQuerySchema,
    createOrderSchema,
    updateOrderStatusSchema,
    updatePaymentStatusSchema,
} from "./order.schemas";
import { orderService } from "./order.service";

function getParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function getUserId(req: Request) {
    return req.user?.userId;
}

function mapCreateOrderError(error: unknown) {
    if (!(error instanceof Error)) {
        return null;
    }

    switch (error.message) {
        case "ORDER_VARIANT_NOT_FOUND":
            return {
                status: 400,
                code: "ORDER_VARIANT_NOT_FOUND",
                message: "Один из вариантов товара не найден",
            };

        case "ORDER_PRODUCT_VARIANT_MISMATCH":
            return {
                status: 400,
                code: "ORDER_PRODUCT_VARIANT_MISMATCH",
                message: "Вариант товара не принадлежит выбранному товару",
            };

        case "ORDER_PRODUCT_NOT_ACTIVE":
            return {
                status: 400,
                code: "ORDER_PRODUCT_NOT_ACTIVE",
                message: "Один из товаров недоступен для покупки",
            };

        case "ORDER_VARIANT_NOT_ACTIVE":
            return {
                status: 400,
                code: "ORDER_VARIANT_NOT_ACTIVE",
                message: "Один из вариантов товара недоступен для покупки",
            };

        case "ORDER_NOT_ENOUGH_STOCK":
            return {
                status: 400,
                code: "ORDER_NOT_ENOUGH_STOCK",
                message: "Недостаточно товара на складе",
            };

        default:
            return null;
    }
}

export const orderController = {
    async createOrder(req: Request, res: Response) {
        const parsed = createOrderSchema.safeParse(req.body);

        if (!parsed.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректные данные заказа",
                parsed.error.issues,
            );
        }

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
            const order = await orderService.createOrder({
                userId,
                data: parsed.data,
            });

            return success(res, order);
        } catch (error) {
            console.error("CREATE_ORDER_ERROR:", error);

            const mappedError = mapCreateOrderError(error);

            if (mappedError) {
                return fail(
                    res,
                    mappedError.status,
                    mappedError.code,
                    mappedError.message,
                );
            }

            return fail(res, 500, "SERVER_ERROR", "Не удалось создать заказ");
        }
    },

    async getMyOrders(req: Request, res: Response) {
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
            const orders = await orderService.getMyOrders(userId);

            return success(res, orders);
        } catch (error) {
            console.error("GET_MY_ORDERS_ERROR:", error);

            return fail(res, 500, "SERVER_ERROR", "Не удалось получить заказы");
        }
    },

    async getOrderById(req: Request, res: Response) {
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
            return fail(res, 400, "BAD_REQUEST", "ID заказа не передан");
        }

        try {
            const order = await orderService.getOrderById(userId, id);

            if (!order) {
                return fail(res, 404, "ORDER_NOT_FOUND", "Заказ не найден");
            }

            return success(res, order);
        } catch (error) {
            console.error("GET_ORDER_BY_ID_ERROR:", error);

            return fail(res, 500, "SERVER_ERROR", "Не удалось получить заказ");
        }
    },
    async getAdminOrders(req: Request, res: Response) {
        const parsed = adminOrderQuerySchema.safeParse(req.query);

        if (!parsed.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректные параметры",
                parsed.error.issues,
            );
        }

        try {
            const result = await orderService.getAdminOrders(parsed.data);

            return success(res, result.items, result.meta);
        } catch (error) {
            console.error("GET_ADMIN_ORDERS_ERROR:", error);

            return fail(res, 500, "SERVER_ERROR", "Не удалось получить заказы");
        }
    },

    async getAdminOrderById(req: Request, res: Response) {
        const id = getParam(req.params.id);

        if (!id) {
            return fail(res, 400, "BAD_REQUEST", "ID заказа не передан");
        }

        try {
            const order = await orderService.getAdminOrderById(id);

            if (!order) {
                return fail(res, 404, "ORDER_NOT_FOUND", "Заказ не найден");
            }

            return success(res, order);
        } catch (error) {
            console.error("GET_ADMIN_ORDER_BY_ID_ERROR:", error);

            return fail(res, 500, "SERVER_ERROR", "Не удалось получить заказ");
        }
    },

    async updateOrderStatus(req: Request, res: Response) {
        const id = getParam(req.params.id);
        const parsed = updateOrderStatusSchema.safeParse(req.body);

        if (!id) {
            return fail(res, 400, "BAD_REQUEST", "ID заказа не передан");
        }

        if (!parsed.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректный статус заказа",
                parsed.error.issues,
            );
        }

        try {
            const order = await orderService.updateOrderStatus(
                id,
                parsed.data.status,
            );

            return success(res, order);
        } catch (error) {
            console.error("UPDATE_ORDER_STATUS_ERROR:", error);

            if (error instanceof Error) {
                if (error.message === "ORDER_NOT_FOUND") {
                    return fail(res, 404, "ORDER_NOT_FOUND", "Заказ не найден");
                }

                if (error.message === "INVALID_ORDER_STATUS_ROLLBACK") {
                    return fail(
                        res,
                        400,
                        "INVALID_ORDER_STATUS_ROLLBACK",
                        "Нельзя вернуть отправленный, доставленный или отменённый заказ обратно в резервный статус",
                    );
                }

                if (error.message === "RESERVED_STOCK_RELEASE_FAILED") {
                    return fail(
                        res,
                        409,
                        "RESERVED_STOCK_RELEASE_FAILED",
                        "Не удалось освободить резерв. Остатки уже изменились",
                    );
                }

                if (error.message === "PRODUCT_STOCK_SHIP_FAILED") {
                    return fail(
                        res,
                        409,
                        "PRODUCT_STOCK_SHIP_FAILED",
                        "Не удалось списать товар со склада. Проверьте остатки и резерв",
                    );
                }
            }

            return fail(
                res,
                500,
                "SERVER_ERROR",
                "Не удалось обновить статус заказа",
            );
        }
    },

    async updatePaymentStatus(req: Request, res: Response) {
        const id = getParam(req.params.id);

        if (!id) {
            return fail(res, 400, "BAD_REQUEST", "ID заказа не передан");
        }

        const parsed = updatePaymentStatusSchema.safeParse(req.body);

        if (!parsed.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректный статус оплаты",
                parsed.error.issues,
            );
        }

        try {
            const order = await orderService.updatePaymentStatus(
                id,
                parsed.data.paymentStatus,
            );

            return success(res, order);
        } catch (error) {
            console.error("UPDATE_PAYMENT_STATUS_ERROR:", error);

            return fail(
                res,
                500,
                "SERVER_ERROR",
                "Не удалось обновить статус оплаты",
            );
        }
    },
};