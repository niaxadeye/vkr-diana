import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import {
    addRecommendedProductSchema,
    updateRecommendedProductSchema,
} from "./recommended-products.schemas";
import { recommendedProductsService } from "./recommended-products.service";

export const recommendedProductsController = {
    async getPublicRecommendedProducts(_req: Request, res: Response) {
        try {
            const products = await recommendedProductsService.getPublicRecommendedProducts();
            return success(res, products);
        } catch (error) {
            console.error("GET_RECOMMENDED_PRODUCTS_ERROR:", error);
            return fail(res, 500, "SERVER_ERROR", "Не удалось получить рекомендованные товары");
        }
    },

    async getAdminRecommendedProducts(_req: Request, res: Response) {
        try {
            const items = await recommendedProductsService.getAdminRecommendedProducts();
            return success(res, items);
        } catch (error) {
            console.error("GET_ADMIN_RECOMMENDED_PRODUCTS_ERROR:", error);
            return fail(res, 500, "SERVER_ERROR", "Не удалось получить рекомендованные товары");
        }
    },

    async addRecommendedProduct(req: Request, res: Response) {
        const parsedBody = addRecommendedProductSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректные данные рекомендованного товара",
                parsedBody.error.issues,
            );
        }

        try {
            const item = await recommendedProductsService.addRecommendedProduct(parsedBody.data);
            return success(res, item);
        } catch (error) {
            console.error("ADD_RECOMMENDED_PRODUCT_ERROR:", error);
            return fail(res, 500, "SERVER_ERROR", "Не удалось добавить рекомендованный товар");
        }
    },

    async updateRecommendedProduct(req: Request, res: Response) {
        const recommendedProductId = getParam(req.params.id);

        if (!recommendedProductId) {
            return fail(res, 400, "BAD_REQUEST", "Некорректный id рекомендованного товара");
        }

        const parsedBody = updateRecommendedProductSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректные данные рекомендованного товара",
                parsedBody.error.issues,
            );
        }

        try {
            const item = await recommendedProductsService.updateRecommendedProduct(
                recommendedProductId,
                parsedBody.data,
            );

            return success(res, item);
        } catch (error) {
            console.error("UPDATE_RECOMMENDED_PRODUCT_ERROR:", error);
            return fail(res, 500, "SERVER_ERROR", "Не удалось обновить рекомендованный товар");
        }
    },

    async deleteRecommendedProduct(req: Request, res: Response) {
        const recommendedProductId = getParam(req.params.id);

        if (!recommendedProductId) {
            return fail(res, 400, "BAD_REQUEST", "Некорректный id рекомендованного товара");
        }

        try {
            const item = await recommendedProductsService.deleteRecommendedProduct(
                recommendedProductId,
            );

            return success(res, item);
        } catch (error) {
            console.error("DELETE_RECOMMENDED_PRODUCT_ERROR:", error);
            return fail(res, 500, "SERVER_ERROR", "Не удалось удалить рекомендованный товар");
        }
    },
};

function getParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}