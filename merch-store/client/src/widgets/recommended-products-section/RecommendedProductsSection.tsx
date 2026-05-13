import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { FreeMode, Mousewheel, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import {
    getProducts,
    type ProductListItem,
} from "@/entities/product/api/product.api";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { SliderArrow } from "@/shared/ui/slider-arrow/SliderArrow";

import "swiper/css";
import "swiper/css/free-mode";

export function RecommendedProductsSection() {
    const swiperRef = useRef<SwiperType | null>(null);

    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function loadProducts() {
        setIsLoading(true);

        try {
            const response = await getProducts({
                page: 1,
                limit: 10,
            });

            setProducts(response.data);
        } catch (error) {
            console.error("LOAD_RECOMMENDED_PRODUCTS_ERROR:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadProducts();
    }, []);

    function scrollPrev() {
        swiperRef.current?.slidePrev();
    }

    function scrollNext() {
        swiperRef.current?.slideNext();
    }

    if (isLoading) {
        return (
            <section className="bg-white px-4 pb-16 pt-8 md:pb-20 md:pt-8">
                <div className="mx-auto max-w-[1680px]">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="h2">Для вас</h2>

                        <div className="flex items-center gap-2">
                            <SliderArrow direction="prev" onClick={() => {}} />
                            <SliderArrow direction="next" onClick={() => {}} />
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-hidden pb-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[360px] shrink-0 basis-[66.666%] animate-pulse bg-neutral-100 md:h-[544px] md:basis-[calc((100%-32px)/3)] xl:basis-[calc((100%-48px)/4)]"
                            >
                                <div className="aspect-[3/4] bg-neutral-100" />

                                <div className="pt-3">
                                    <div className="h-3 w-3/4 rounded-full bg-neutral-100" />
                                    <div className="mt-2 h-3 w-1/3 rounded-full bg-neutral-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="bg-white px-4 pb-16 pt-8 md:pb-20 md:pt-8">
            <div className="mx-auto max-w-[1680px]">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="h2">Для вас</h2>

                    <div className="flex items-center gap-2">
                        <SliderArrow direction="prev" onClick={scrollPrev} />
                        <SliderArrow direction="next" onClick={scrollNext} />
                    </div>
                </div>

                <Swiper
                    modules={[FreeMode, Mousewheel, Navigation]}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    grabCursor
                    speed={500}
                    spaceBetween={16}
                    slidesPerView={1.5}
                    freeMode={{
                        enabled: true,
                        momentum: true,
                        sticky: true,
                        momentumRatio: 0.3,
                        momentumVelocityRatio: 0.3,
                    }}
                    mousewheel={{
                        forceToAxis: true,
                        sensitivity: 0.7,
                    }}
                    breakpoints={{
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 16,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 16,
                        },
                        1280: {
                            slidesPerView: 5,
                            spaceBetween: 16,
                        },
                    }}
                    className="pb-4"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}