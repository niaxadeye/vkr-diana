import { prisma } from "../../prisma/prisma";

type CollectionQuery = {
  search?: string;
  isActive?: boolean;
  page: number;
  limit: number;
};

export const collectionService = {
  async getCollections(query: CollectionQuery) {
    const where = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            title: {
              contains: query.search,
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          products: true,
        },
      }),
      prisma.collection.count({ where }),
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

  async getCollectionBySlug(slug: string) {
    return prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          where: {
            status: "ACTIVE",
          },
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
            variants: true,
          },
        },
      },
    });
  },

  async getAdminCollectionById(id: string) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  },

  async createCollection(data: {
    title: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    isActive: boolean;
  }) {
    return prisma.collection.create({
      data,
    });
  },

  async updateCollection(
    id: string,
    data: {
      title?: string;
      slug?: string;
      description?: string | null;
      imageUrl?: string | null;
      isActive?: boolean;
    },
  ) {
    return prisma.collection.update({
      where: { id },
      data,
    });
  },

  async deleteCollection(id: string) {
    return prisma.collection.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  },
};