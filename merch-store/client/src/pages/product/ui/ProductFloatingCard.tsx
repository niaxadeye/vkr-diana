import { useEffect, useMemo, useState } from "react";

import { useCartStore } from "@/entities/cart/model/cart.store";
import type { ProductDetails } from "@/entities/product/api/product.api";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";

type Props = {
    product: ProductDetails;
    mobile?: boolean;
};

function formatRub(price: number) {
    return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

function getProductImageUrl(product: ProductDetails) {
    const firstImage = product.images[0];

    if (!firstImage?.url) {
        return null;
    }

    return getMediaUrl(firstImage.url);
}

function getAvailableStock(variant: ProductDetails["variants"][number]) {
    return Math.max(0, variant.stock - variant.reservedStock);
}

function hasDiscount(price: number, oldPrice?: number | null) {
    return Boolean(oldPrice && oldPrice > price);
}

export function ProductFloatingCard({ product, mobile = false }: Props) {
    const activeVariants = useMemo(
        () => product.variants.filter((variant) => variant.isActive),
        [product.variants],
    );

    const defaultVariant = activeVariants[0];

    const [selectedVariantId, setSelectedVariantId] = useState(
        defaultVariant?.id ?? "",
    );

    const [addedMessageVisible, setAddedMessageVisible] = useState(false);

    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        if (!defaultVariant) {
            setSelectedVariantId("");
            return;
        }

        setSelectedVariantId(defaultVariant.id);
    }, [defaultVariant?.id]);

    const selectedVariant = product.hasVariants
        ? activeVariants.find((variant) => variant.id === selectedVariantId)
        : defaultVariant;

    const productImageUrl = useMemo(() => getProductImageUrl(product), [product]);

    const currentPrice = selectedVariant?.priceOverride ?? product.price;
    const currentOldPrice = product.oldPrice ?? null;
    const discounted = hasDiscount(currentPrice, currentOldPrice);

    const selectedVariantAvailableStock = selectedVariant
        ? getAvailableStock(selectedVariant)
        : 0;

    const addToCartDisabled =
        !selectedVariant || selectedVariantAvailableStock <= 0;

    const buttonText = addToCartDisabled
        ? "Нет в наличии"
        : addedMessageVisible
            ? "Добавлено"
            : "В корзину";

    const collectionTitle =
        product.collection?.title || "Коллекция";

    function handleAddToCart() {
        if (!selectedVariant || selectedVariantAvailableStock <= 0) {
            setAddedMessageVisible(false);
            return;
        }

        addItem({
            productId: product.id,
            variantId: selectedVariant.id,
            title: product.title,
            slug: product.slug,
            oldPrice: currentOldPrice,
            size: product.hasVariants ? selectedVariant.size : null,
            color: selectedVariant.color ?? null,
            price: currentPrice,
            imageUrl: productImageUrl,
            quantity: 1,
            maxQuantity: selectedVariantAvailableStock,
            // новые поля для расчёта доставки
            weightGram: Number(selectedVariant?.weightGram ?? product.weightGram ?? 0),
            lengthCm: Number(selectedVariant?.lengthCm ?? product.lengthCm ?? 0),
            widthCm: Number(selectedVariant?.widthCm ?? product.widthCm ?? 0),
            heightCm: Number(selectedVariant?.heightCm ?? product.heightCm ?? 0),
        });

        setAddedMessageVisible(true);

        window.setTimeout(() => {
            setAddedMessageVisible(false);
        }, 1800);
    }

    const variantsBlock = product.hasVariants ? (
        <div className="mt-6 grid grid-cols-2 gap-2">
            {activeVariants.map((variant) => {
                const isActive = selectedVariantId === variant.id;
                const availableStock = getAvailableStock(variant);
                const isDisabled = availableStock <= 0;

                return (
                    <button
                        key={variant.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`h-10 rounded-full text-[15px] font-medium transition ${isActive
                            ? "bg-[#060606] text-white"
                            : "bg-[#f0f0f0] text-[#060606] hover:bg-[#060606] hover:text-white"
                            } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                        {variant.size}
                    </button>
                );
            })}
        </div>
    ) : null;

    if (mobile) {
        return (
            <div className="w-full">
                <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0 pr-4">
                        <p className="text-[14px] font-normal uppercase leading-5 text-[#666666]">
                            {collectionTitle}
                        </p>

                        <h1 className="mt-1 text-[20px] font-medium uppercase leading-[24px] tracking-[-0.03em] text-[#060606]">
                            {product.title}
                        </h1>
                    </div>

                    <div className="shrink-0 text-right">
                        <div className="text-[18px] font-medium leading-6 text-[#060606]">
                            {formatRub(currentPrice)}
                        </div>

                        {discounted && (
                            <div className="mt-0.5 text-[15px] font-medium leading-5 text-[#666666] line-through">
                                {formatRub(currentOldPrice!)}
                            </div>
                        )}
                    </div>
                </div>

                <pre className="mt-7 whitespace-pre-wrap font-sans text-[16px] font-normal leading-6 text-[#666666]">
                    {product.description}
                </pre>

                {variantsBlock}

                <button
                    type="button"
                    disabled={addToCartDisabled}
                    onClick={handleAddToCart}
                    className="mt-6 h-14 w-full rounded-full bg-[#060606] text-[15px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {buttonText}
                </button>
            </div>
        );
    }

    return (
        <div className="pointer-events-auto absolute bottom-8 right-[max(2rem,3.33vw)] z-20 w-[50%] min-w-[420px] rounded-[18px] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)] lg:w-[25%]">
            <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                    <p className="text-[15px] font-[400] uppercase leading-5.5 text-[#666666]">
                        {collectionTitle}
                    </p>

                    <h1 className="mt-1 text-[36px] font-medium uppercase leading-[44px] tracking-[-0.04em] text-[#060606]">
                        {product.title}
                    </h1>
                </div>

                <div className="shrink-0 text-right">
                    <div className="text-[24px] font-medium leading-7 text-[#060606]">
                        {formatRub(currentPrice)}
                    </div>

                    {discounted && (
                        <div className="mt-1 text-[18px] font-medium leading-6 text-[#666666] line-through">
                            {formatRub(currentOldPrice!)}
                        </div>
                    )}
                </div>
            </div>

            <pre className="mt-7 whitespace-pre-wrap font-sans text-[16px] font-normal leading-6 text-[#666666]">
                {product.description}
            </pre>

            {variantsBlock}

            <button
                type="button"
                disabled={addToCartDisabled}
                onClick={handleAddToCart}
                className="mt-6 h-14 w-full rounded-full bg-[#060606] text-[15px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {buttonText}
            </button>
        </div>
    );
}