import { prisma } from "../../prisma/prisma";
import type {
    AddRecommendedProductInput,
    UpdateRecommendedProductInput,
} from "./recommended-products.schemas";

const productInclude = {
    images: {
        orderBy: {
            sortOrder: "asc" as const,
        },
    },
    variants: true,
    category: true,
    collection: true,
};

export const recommendedProductsService = {
    async getPublicRecommendedProducts() {
        const items = await prisma.recommendedProduct.findMany({
            where: {
                isActive: true,
                product: {
                    status: "ACTIVE",
                },
            },
            include: {
                product: {
                    include: productInclude,
                },
            },
            orderBy: [
                {
                    sortOrder: "asc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });

        return items.map((item) => item.product);
    },

    async getAdminRecommendedProducts() {
        return prisma.recommendedProduct.findMany({
            include: {
                product: {
                    include: productInclude,
                },
            },
            orderBy: [
                {
                    sortOrder: "asc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });
    },

    async addRecommendedProduct(data: AddRecommendedProductInput) {
        return prisma.recommendedProduct.upsert({
            where: {
                productId: data.productId,
            },
            update: {
                sortOrder: data.sortOrder,
                isActive: data.isActive,
            },
            create: {
                productId: data.productId,
                sortOrder: data.sortOrder,
                isActive: data.isActive,
            },
            include: {
                product: {
                    include: productInclude,
                },
            },
        });
    },

    async updateRecommendedProduct(
        id: string,
        data: UpdateRecommendedProductInput,
    ) {
        return prisma.recommendedProduct.update({
            where: {
                id,
            },
            data,
            include: {
                product: {
                    include: productInclude,
                },
            },
        });
    },

    async deleteRecommendedProduct(id: string) {
        return prisma.recommendedProduct.delete({
            where: {
                id,
            },
        });
    },
};