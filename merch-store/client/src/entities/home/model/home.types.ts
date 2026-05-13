export type HomeHeroBanner = {
  id: string;
  key: string;

  title: string;

  imageDesktop: string;
  imageMobile: string;

  videoDesktop?: string | null;
  videoMobile?: string | null;

  ctaLabel: string;
  ctaHref: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};