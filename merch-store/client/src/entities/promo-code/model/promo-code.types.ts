export type PromoCode = {
  id: string;
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromoCodePayload = {
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  usageLimit?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
};

export type ValidatePromoResult = {
  code: string;
  discountPercent: number;
  discountAmount: number;
};
