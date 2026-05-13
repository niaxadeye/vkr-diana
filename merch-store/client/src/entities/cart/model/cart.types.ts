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

    // Новые поля для расчёта доставки
    weightGram: number; // вес в граммах
    lengthCm: number;   // длина в см
    widthCm: number;    // ширина в см
    heightCm: number;   // высота в см
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

    // Прокидываем размеры и вес
    weightGram: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
};