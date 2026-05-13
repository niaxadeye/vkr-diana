import type { HomeHeroBanner } from "./home.types";

export const announcementText =
  "Все заказы по РФ и СНГ, оформленные с 1 по 14 мая, начнут обрабатываться после 14 мая.";

export const homeHeroBanner: HomeHeroBanner = {
  id: "team-spirit-legacy",
  key: "home",

  title: "TEAM SPIRIT L3GACY",

  imageDesktop: "/images/home/hero-desktop.webp",
  imageMobile: "/images/home/hero-mobile.webp",

  videoDesktop: "/videos/home/video-10years.webm",
  videoMobile: "/videos/home/video-10years.webm",

  ctaLabel: "К коллекции",
  ctaHref: "/collections/team-spirit-l3g4cy",

  isActive: true,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};