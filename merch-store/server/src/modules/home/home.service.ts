import { prisma } from "../../prisma/prisma";

const defaultHero = {
  key: "home",
  title: "TEAM SPIRIT L3GACY",
  imageDesktop: "/images/home/hero-desktop.webp",
  imageMobile: "/images/home/hero-mobile.webp",
  videoDesktop: "/videos/home/video-10years.webm",
  videoMobile: "/videos/home/video-10years.webm",
  ctaLabel: "К коллекции",
  ctaHref: "/collections/team-spirit-l3g4cy",
  isActive: true,
};

async function ensureHomeHero() {
  return prisma.homeHeroBanner.upsert({
    where: {
      key: "home",
    },
    update: {},
    create: defaultHero,
  });
}

export const homeService = {
  async getHero() {
    return ensureHomeHero();
  },

  async updateHero(data: {
    title?: string;
    imageDesktop?: string;
    imageMobile?: string;
    videoDesktop?: string | null;
    videoMobile?: string | null;
    ctaLabel?: string;
    ctaHref?: string;
    isActive?: boolean;
  }) {
    await ensureHomeHero();

    return prisma.homeHeroBanner.update({
      where: {
        key: "home",
      },
      data,
    });
  },
};