import type { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prisma";

type ProductQuery = {
    search?: string;
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    categoryId?: string;
    collectionId?: string;
    page: number;
    limit: number;
};

export const productService = {
    async getProducts(query: ProductQuery) {
        const where: Prisma.ProductWhereInput = {
            status: query.status ?? "ACTIVE",
            ...(query.categoryId ? { categoryId: query.categoryId } : {}),
            ...(query.collectionId ? { collectionId: query.collectionId } : {}),
            ...(query.search
                ? {
                    title: {
                        contains: query.search,
                    },
                }
                : {}),
        };

        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    images: {
                        orderBy: { sortOrder: "asc" },
                    },
                    accordionItems: {
                        orderBy: { sortOrder: "asc" },
                    },
                    variants: true,
                    category: true,
                    collection: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            prisma.product.count({ where }),
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

    async getProductBySlug(slug: string) {
        return prisma.product.findUnique({
            where: { slug },
            include: {
                images: {
                    orderBy: { sortOrder: "asc" },
                },
                accordionItems: {
                    orderBy: { sortOrder: "asc" },
                },
                variants: true,
                category: true,
                collection: true,
            },
        });
    },

    async getAdminProducts(query: ProductQuery) {
        const where: Prisma.ProductWhereInput = {
            ...(query.status ? { status: query.status } : {}),
            ...(query.search
                ? {
                    title: {
                        contains: query.search,
                    },
                }
                : {}),
        };


        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    images: {
                        orderBy: { sortOrder: "asc" },
                    },
                    accordionItems: {
                        orderBy: { sortOrder: "asc" },
                    },
                    variants: true,
                    category: true,
                    collection: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            prisma.product.count({ where }),
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

    async createProduct(data: Prisma.ProductCreateInput) {
        return prisma.product.create({
            data,
            include: {
                images: {
                    orderBy: { sortOrder: "asc" },
                },
                variants: true,
                accordionItems: {
                    orderBy: { sortOrder: "asc" },
                },
                category: true,
                collection: true,
            },
        });
    },
    async getAdminProductById(id: string) {
        return prisma.product.findUnique({
            where: { id },
            include: {
                images: { orderBy: { sortOrder: "asc" } },
                accordionItems: {
                    orderBy: { sortOrder: "asc" },
                },
                variants: true,
                category: true,
                collection: true,
            },
        });
    },

    async updateProduct(
        id: string,
        data: {
            title?: string;
            slug?: string;
            description?: string;
            shortDescription?: string | null;
            price?: number;
            hasVariants?: boolean;
            oldPrice?: number | null;
            status?: "DRAFT" | "ACTIVE" | "ARCHIVED";

            weightGram?: number;
            lengthCm?: number;
            widthCm?: number;
            heightCm?: number;

            categoryId?: string | null;
            collectionId?: string | null;
            images?: {
                url: string;
                alt?: string | null;
                sortOrder?: number;
            }[];
            variants?: {
                size: string;
                color?: string | null;
                sku: string;
                stock: number;
                reservedStock?: number;
                priceOverride?: number | null;
                isActive?: boolean;

                weightGram?: number | null;
                lengthCm?: number | null;
                widthCm?: number | null;
                heightCm?: number | null;
            }[];
            accordionItems?: {
                title: string;
                content: string;
                sortOrder?: number;
                isActive?: boolean;
                isOpenByDefault?: boolean;
            }[];
        },
    ) {
        return prisma.$transaction(async (tx) => {
            await tx.productImage.deleteMany({
                where: { productId: id },
            });

            await tx.productVariant.deleteMany({
                where: { productId: id },
            });

            if (data.accordionItems) {
                await tx.productAccordionItem.deleteMany({
                    where: { productId: id },
                });
            }

            return tx.product.update({
                where: { id },
                data: {
                    title: data.title,
                    slug: data.slug,
                    description: data.description,
                    shortDescription: data.shortDescription,
                    price: data.price,
                    hasVariants: data.hasVariants,
                    oldPrice: data.oldPrice,
                    status: data.status,

                    weightGram: data.weightGram,
                    lengthCm: data.lengthCm,
                    widthCm: data.widthCm,
                    heightCm: data.heightCm,

                    categoryId: data.categoryId ?? null,
                    collectionId: data.collectionId ?? null,

                    images: data.images
                        ? {
                            create: data.images.map((image, index) => ({
                                url: image.url,
                                alt: image.alt ?? null,
                                sortOrder: image.sortOrder ?? index,
                            })),
                        }
                        : undefined,

                    variants: data.variants
                        ? {
                            create: normalizeUpdateVariants({
                                slug: data.slug,
                                hasVariants: data.hasVariants,
                                variants: data.variants,
                            }),
                        }
                        : undefined,

                    accordionItems: data.accordionItems
                        ? {
                            create: normalizeUpdateAccordionItems(data.accordionItems),
                        }
                        : undefined,
                },
                include: {
                    images: {
                        orderBy: { sortOrder: "asc" },
                    },
                    variants: true,
                    category: true,
                    collection: true,
                    accordionItems: {
                        orderBy: { sortOrder: "asc" },
                    },
                },
            });
        });
    },

    async deleteProduct(id: string) {
        return prisma.product.update({
            where: { id },
            data: {
                status: "ARCHIVED",
            },
        });
    },
};

function normalizeUpdateVariants(data: {
    slug?: string;
    hasVariants?: boolean;
    variants: {
        size: string;
        color?: string | null;
        sku: string;
        stock: number;
        reservedStock?: number;
        priceOverride?: number | null;
        isActive?: boolean;

        weightGram?: number | null;
        lengthCm?: number | null;
        widthCm?: number | null;
        heightCm?: number | null;
    }[];
}) {
    if (data.hasVariants === false) {
        const firstVariant = data.variants[0];

        return [
            {
                size: "ONE_SIZE",
                color: null,
                sku: firstVariant?.sku || `${data.slug ?? "product"}-default`,
                stock: firstVariant?.stock ?? 0,
                reservedStock: firstVariant?.reservedStock ?? 0,
                priceOverride: null,
                isActive: true,

                weightGram: firstVariant?.weightGram ?? null,
                lengthCm: firstVariant?.lengthCm ?? null,
                widthCm: firstVariant?.widthCm ?? null,
                heightCm: firstVariant?.heightCm ?? null,
            },
        ];
    }

    return data.variants.map((variant) => ({
        size: variant.size,
        color: variant.color ?? null,
        sku: variant.sku,
        stock: variant.stock,
        reservedStock: variant.reservedStock ?? 0,
        priceOverride: variant.priceOverride ?? null,
        isActive: variant.isActive ?? true,

        weightGram: variant.weightGram ?? null,
        lengthCm: variant.lengthCm ?? null,
        widthCm: variant.widthCm ?? null,
        heightCm: variant.heightCm ?? null,
    }));
}

function normalizeUpdateAccordionItems(
  items: {
    title: string;
    content: string;
    sortOrder?: number;
    isActive?: boolean;
    isOpenByDefault?: boolean;
  }[],
) {
  return items.map((item, index) => ({
    title: item.title,
    content: item.content,
    sortOrder: item.sortOrder ?? index,
    isActive: item.isActive ?? true,
    isOpenByDefault: item.isOpenByDefault ?? false,
  }));
}