import { Link } from "react-router";

import { getMediaUrl } from "@/shared/lib/getMediaUrl";

type ProductCardProps = {
    product: {
        id: string;
        title: string;
        slug: string;
        price: number;
        oldPrice?: number | null;
        isNew?: boolean;
        images?: {
            url: string;
            alt?: string | null;
            sortOrder?: number;
        }[];
        variants?: {
            stock: number;
            reservedStock?: number;
            isActive?: boolean;
        }[];
    };
};

function formatPrice(value: number) {
    return `${new Intl.NumberFormat("ru-RU").format(value)}₽`;
}

function getAvailableStock(product: ProductCardProps["product"]) {
    const variants = product.variants ?? [];

    const activeVariants = variants.filter((variant) => variant.isActive !== false);

    if (activeVariants.length === 0) {
        return 0;
    }

    return activeVariants.reduce((sum, variant) => {
        const reservedStock = variant.reservedStock ?? 0;
        const availableStock = Math.max(0, variant.stock - reservedStock);

        return sum + availableStock;
    }, 0);
}

export function ProductCard({ product }: ProductCardProps) {
    const image = product.images?.[0];
    const imageSrc = getMediaUrl(image?.url);

    const availableStock = getAvailableStock(product);

    const isSoldOut = availableStock <= 0;
    const hasDiscount =
        typeof product.oldPrice === "number" && product.oldPrice > product.price;

    const badgeText = isSoldOut
        ? "Нет в наличии"
        : hasDiscount
          ? "Распродажа"
          : product.isNew
            ? "NEW"
            : null;

    return (
        <Link to={`/products/${product.slug}`} className="group block w-full">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f0f0f0]">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={image?.alt ?? product.title}
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[13px] text-[#666666]">
                        Нет фото
                    </div>
                )}

                {badgeText && (
                    <div className="absolute right-2.5 top-2.5 rounded-full bg-[#FAFAFA] px-2 py-0.5 leading-5 text-[14px] font-[600]  text-[#060606] shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                        {badgeText}
                    </div>
                )}
            </div>

            <div className="pt-3">
                <h3 className="text-[14px] uppercase font-[400] leading-5 font-regular text-[#060606]">
                    {product.title}
                </h3>

                <div className="mt-1 flex items-center gap-2">
                    {hasDiscount ? (
                        <>
                            <span className="inline-flex items-center  rounded-full bg-[#060606] px-2 py-0.5 leading-5 text-[14px] font-[600] text-white">
                                {formatPrice(product.price)}
                            </span>

                            <span className="text-[14px] font-[400] leading-none text-[#666666] line-through">
                                {formatPrice(product.oldPrice!)}
                            </span>
                        </>
                    ) : (
                        <span className="text-[14px] font-[400] leading-none text-[#666666]">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}