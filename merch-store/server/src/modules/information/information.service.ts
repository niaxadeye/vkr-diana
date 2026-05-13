import { prisma } from "../../prisma/prisma";
import type { InformationSlug } from "./information.schemas";

const defaultInformationPages: {
  slug: InformationSlug;
  title: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
}[] = [
  {
    slug: "payment",
    title: "Оплата",
    sortOrder: 10,
    isActive: true,
    content:
      "Все платежи в нашем интернет-магазине осуществляются через надёжные платёжные системы.\n\nПосле оформления заказа вы будете перенаправлены на страницу оплаты.",
  },
  {
    slug: "delivery",
    title: "Доставка",
    sortOrder: 20,
    isActive: true,
    content:
      "Мы доставляем заказы по России. Доступные способы доставки и итоговая стоимость рассчитываются при оформлении заказа.",
  },
  {
    slug: "return",
    title: "Возврат",
    sortOrder: 30,
    isActive: true,
    content:
      "Если у вас возникла необходимость оформить возврат, свяжитесь с нашей службой поддержки.",
  },
  {
    slug: "security",
    title: "Безопасность",
    sortOrder: 40,
    isActive: true,
    content:
      "Мы уделяем внимание безопасности пользовательских данных и используем современные методы защиты информации.",
  },
  {
    slug: "privacy",
    title: "Приватность",
    sortOrder: 50,
    isActive: true,
    content:
      "На этой странице размещается информация о порядке обработки персональных данных пользователей.",
  },
  {
    slug: "terms",
    title: "Положения",
    sortOrder: 60,
    isActive: true,
    content:
      "На этой странице размещаются основные положения и правила использования интернет-магазина.",
  },
];

let defaultsInitialized = false;

async function ensureDefaultInformationPages() {
  if (defaultsInitialized) {
    return;
  }

  await Promise.all(
    defaultInformationPages.map((page) =>
      prisma.informationPage.upsert({
        where: {
          slug: page.slug,
        },
        update: {},
        create: page,
      }),
    ),
  );

  defaultsInitialized = true;
}

export const informationService = {
  async getPublicPages() {
    await ensureDefaultInformationPages();

    return prisma.informationPage.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });
  },

  async getPublicPageBySlug(slug: InformationSlug) {
    await ensureDefaultInformationPages();

    return prisma.informationPage.findUnique({
      where: {
        slug,
      },
    });
  },

  async getAdminPages() {
    await ensureDefaultInformationPages();

    return prisma.informationPage.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });
  },

  async getAdminPageBySlug(slug: InformationSlug) {
    await ensureDefaultInformationPages();

    return prisma.informationPage.findUnique({
      where: {
        slug,
      },
    });
  },

  async updatePageBySlug(
    slug: InformationSlug,
    data: {
      title?: string;
      content?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    await ensureDefaultInformationPages();

    return prisma.informationPage.update({
      where: {
        slug,
      },
      data,
    });
  },
};