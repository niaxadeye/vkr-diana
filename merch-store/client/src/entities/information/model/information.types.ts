export const INFORMATION_SLUGS = [
  "payment",
  "delivery",
  "return",
  "security",
  "privacy",
  "terms",
] as const;

export type InformationSlug = (typeof INFORMATION_SLUGS)[number];

export type InformationPage = {
  id: string;
  slug: InformationSlug;
  title: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function isInformationSlug(value: string | null): value is InformationSlug {
  if (!value) return false;

  return INFORMATION_SLUGS.includes(value as InformationSlug);
}