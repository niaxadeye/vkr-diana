import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import {
    createProductSchema,
    productQuerySchema,
    updateProductSchema,
} from "./product.schemas";
import { productService } from "./product.service";

function getParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function mapProductCreateData(data: ReturnType<typeof createProductSchema.parse>) {
    return {
        title: data.title,
        slug: data.slug,
        description: data.description,
        hasVariants: data.hasVariants,
        shortDescription: data.shortDescription,
        price: data.price,
        oldPrice: data.oldPrice,
        status: data.status,
        category: data.categoryId
            ? {
                connect: {
                    id: data.categoryId,
                },
            }
            : undefined,
        collection: data.collectionId
            ? {
                connect: {
                    id: data.collectionId,
                },
            }
            : undefined,
        images: {
            create: data.images,
        },
        variants: {
            create: normalizeProductVariants(data),
        },
    };
}

export const productController = {
    async getProducts(req: Request, res: Response) {
        const parsed = productQuerySchema.safeParse(req.query);

        if (!parsed.success) {
            return fail(res, 400, "VALIDATION_ERROR", "Некорректные параметры");
        }

        const result = await productService.getProducts(parsed.data);

        return success(res, result.items, result.meta);
    },

    async getProductBySlug(req: Request, res: Response) {
        const slug = getParam(req.params.slug);

        if (!slug) {
            return fail(res, 400, "BAD_REQUEST", "Slug товара не передан");
        }

        const product = await productService.getProductBySlug(slug);

        if (!product || product.status !== "ACTIVE") {
            return fail(res, 404, "PRODUCT_NOT_FOUND", "Товар не найден");
        }

        return success(res, product);
    },

    async getAdminProducts(req: Request, res: Response) {
        const parsed = productQuerySchema.safeParse(req.query);

        if (!parsed.success) {
            return fail(res, 400, "VALIDATION_ERROR", "Некорректные параметры");
        }

        const result = await productService.getAdminProducts(parsed.data);

        return success(res, result.items, result.meta);
    },

    async createProduct(req: Request, res: Response) {
        const parsed = createProductSchema.safeParse(req.body);

        if (!parsed.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректные данные товара",
                parsed.error.issues,
            );
        }

        try {
            const product = await productService.createProduct(
                mapProductCreateData(parsed.data),
            );

            return success(res, product);
        } catch (error) {
            console.error("CREATE_PRODUCT_ERROR:", error);
            return fail(res, 500, "SERVER_ERROR", "Не удалось создать товар");
        }
    },

    async updateProduct(req: Request, res: Response) {
        const parsed = updateProductSchema.safeParse(req.body);

        if (!parsed.success) {
            return fail(
                res,
                400,
                "VALIDATION_ERROR",
                "Некорректные данные товара",
                parsed.error.issues,
            );
        }

        try {
            const data = parsed.data;
            const id = getParam(req.params.id);
            if (!id) {
                return fail(res, 400, "BAD_REQUEST", "ID товара не передан");
            }
            const product = await productService.updateProduct(id, {
                title: data.title,
                slug: data.slug,
                description: data.description,
                shortDescription: data.shortDescription,
                price: data.price,
                oldPrice: data.oldPrice,
                status: data.status,
                categoryId: data.categoryId,
                collectionId: data.collectionId,
                images: data.images,
                variants: data.variants,
            });

            return success(res, product);
        } catch (error) {
            console.error("UPDATE_PRODUCT_ERROR:", error);
            return fail(res, 500, "SERVER_ERROR", "Не удалось обновить товар");
        }
    },
    async getAdminProductById(req: Request, res: Response) {
        const id = getParam(req.params.id);

        if (!id) {
            return fail(res, 400, "BAD_REQUEST", "ID товара не передан");
        }

        const product = await productService.getAdminProductById(id);

        if (!product) {
            return fail(res, 404, "PRODUCT_NOT_FOUND", "Товар не найден");
        }

        return success(res, product);
    },

    async deleteProduct(req: Request, res: Response) {
        const id = getParam(req.params.id);
        if (!id) {
            return fail(res, 400, "BAD_REQUEST", "ID товара не передан");
        }
        try {
            const product = await productService.deleteProduct(id);

            return success(res, product);
        } catch {
            return fail(res, 500, "SERVER_ERROR", "Не удалось удалить товар");
        }
    },
};

function normalizeProductVariants(data: ReturnType<typeof createProductSchema.parse>) {
    if (data.hasVariants) {
        return data.variants;
    }

    const firstVariant = data.variants[0];

    return [
        {
            size: "ONE_SIZE",
            color: null,
            sku: firstVariant?.sku || `${data.slug}-default`,
            stock: firstVariant?.stock ?? 0,
            reservedStock: firstVariant?.reservedStock ?? 0,
            priceOverride: null,
            isActive: true,
        },
    ];
}