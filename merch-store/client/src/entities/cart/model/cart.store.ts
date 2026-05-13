import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

import type { AddToCartPayload, CartItem } from "./cart.types";

type CartState = {
    items: CartItem[];

    addItem: (payload: AddToCartPayload) => void;
    removeItem: (id: string) => void;
    incrementItem: (id: string) => void;
    decrementItem: (id: string) => void;
    setItemQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;

    getTotalQuantity: () => number;
    getTotalPrice: () => number;
};

function createCartItemId(payload: AddToCartPayload) {
    if (payload.variantId) {
        return `${payload.productId}:${payload.variantId}`;
    }

    return payload.productId;
}

function clampQuantity(quantity: number, maxQuantity: number) {
    return Math.max(1, Math.min(quantity, maxQuantity));
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem(payload) {
                const itemId = createCartItemId(payload);
                const quantityToAdd = payload.quantity ?? 1;
                const maxQuantity = Math.max(0, payload.maxQuantity);

                if (maxQuantity <= 0) {
                    toast.error("Товар закончился");
                    return;
                }

                let wasAdded = false;
                let wasLimitedByStock = false;

                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.id === itemId,
                    );

                    if (existingItem) {
                        const nextQuantity = existingItem.quantity + quantityToAdd;
                        const clampedQuantity = Math.min(nextQuantity, maxQuantity);

                        wasAdded = clampedQuantity > existingItem.quantity;
                        wasLimitedByStock = nextQuantity > maxQuantity;

                        return {
                            items: state.items.map((item) =>
                                item.id === itemId
                                    ? {
                                        ...item,
                                        price: payload.price,
                                        oldPrice: payload.oldPrice ?? null,
                                        maxQuantity,
                                        quantity: clampedQuantity,
                                        imageUrl: payload.imageUrl ?? item.imageUrl,
                                        // Обновляем размеры и вес
                                        weightGram: payload.weightGram,
                                        lengthCm: payload.lengthCm,
                                        widthCm: payload.widthCm,
                                        heightCm: payload.heightCm,
                                    }
                                    : item,
                            ),
                        };
                    }

                    const newItem: CartItem = {
                        id: itemId,
                        productId: payload.productId,
                        variantId: payload.variantId ?? null,
                        title: payload.title,
                        slug: payload.slug,
                        size: payload.size ?? null,
                        color: payload.color ?? null,
                        price: payload.price,
                        oldPrice: payload.oldPrice ?? null,
                        quantity: clampQuantity(quantityToAdd, maxQuantity),
                        maxQuantity,
                        imageUrl: payload.imageUrl ?? null,
                        weightGram: payload.weightGram,
                        lengthCm: payload.lengthCm,
                        widthCm: payload.widthCm,
                        heightCm: payload.heightCm,
                    };

                    wasAdded = true;
                    wasLimitedByStock = quantityToAdd > maxQuantity;

                    return {
                        items: [newItem, ...state.items],
                    };
                });

                if (wasLimitedByStock && !wasAdded) {
                    toast.error("На складе больше нет");
                    return;
                }

                if (wasLimitedByStock) {
                    toast.warning("Добавлено максимально доступное количество");
                    return;
                }

                if (wasAdded) {
                    toast.success("Товар добавлен в корзину");
                }
            },

            removeItem(id) {
                const item = get().items.find((cartItem) => cartItem.id === id);

                set((state) => ({
                    items: state.items.filter((cartItem) => cartItem.id !== id),
                }));

                if (item) {
                    toast.message("Товар удалён из корзины");
                }
            },

            incrementItem(id) {
                const item = get().items.find((cartItem) => cartItem.id === id);

                if (!item) return;

                if (item.quantity >= item.maxQuantity) {
                    toast.error("На складе больше нет");
                    return;
                }

                set((state) => ({
                    items: state.items.map((cartItem) =>
                        cartItem.id === id
                            ? {
                                ...cartItem,
                                quantity: Math.min(
                                    cartItem.quantity + 1,
                                    cartItem.maxQuantity,
                                ),
                            }
                            : cartItem,
                    ),
                }));
            },

            decrementItem(id) {
                set((state) => ({
                    items: state.items
                        .map((item) =>
                            item.id === id
                                ? {
                                    ...item,
                                    quantity: item.quantity - 1,
                                }
                                : item,
                        )
                        .filter((item) => item.quantity > 0),
                }));
            },

            setItemQuantity(id, quantity) {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }

                const item = get().items.find((cartItem) => cartItem.id === id);

                if (!item) return;

                if (quantity > item.maxQuantity) {
                    toast.warning("Указано максимально доступное количество");
                }

                set((state) => ({
                    items: state.items.map((cartItem) =>
                        cartItem.id === id
                            ? {
                                ...cartItem,
                                quantity: clampQuantity(
                                    quantity,
                                    cartItem.maxQuantity,
                                ),
                            }
                            : cartItem,
                    ),
                }));
            },

            clearCart() {
                set({
                    items: [],
                });
            },

            getTotalQuantity() {
                return get().items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                );
            },

            getTotalPrice() {
                return get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                );
            },
        }),
        {
            name: "acrylogo-cart",
        },
    ),
);