export type CartItem = {
    id: string;
    productId: string;
    variantId: string | null;
    title: string;
    slug: string;
    size: string | null;
    color: string | null;
    price: number;
    oldPrice?: number | null;
    quantity: number;
    maxQuantity: number;
    imageUrl: string | null;
};

export type AddToCartPayload = {
    productId: string;
    variantId?: string | null;
    title: string;
    slug: string;
    size?: string | null;
    color?: string | null;
    price: number;
    oldPrice?: number | null;
    quantity?: number;
    maxQuantity: number;
    imageUrl?: string | null;
};