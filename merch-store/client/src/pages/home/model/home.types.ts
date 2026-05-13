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

export type CollectionPreview = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
};

export type ProductPreview = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  price: number;
  oldPrice?: number | null;
  isNew?: boolean;
  isSale?: boolean;
  isLimited?: boolean;
  isSoldOut?: boolean;
};