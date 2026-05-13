import { useMemo, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { FreeMode, Mousewheel, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import type { ProductDetails } from "@/entities/product/api/product.api";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { Icon } from "@/shared/ui/icon/Icon";

import { ProductFloatingCard } from "./ProductFloatingCard";

import "swiper/css";
import "swiper/css/free-mode";

type Props = {
    product: ProductDetails;
};

export function ProductShowcase({ product }: Props) {
    const desktopSwiperRef = useRef<SwiperType | null>(null);
    const mobileSwiperRef = useRef<SwiperType | null>(null);

    const images = useMemo(() => {
        const showcaseImages =
            product.images.length > 1 ? product.images.slice(1) : product.images;

        return showcaseImages
            .map((image) => ({
                url: getMediaUrl(image.url),
                alt: image.alt ?? product.title,
            }))
            .filter((image) => image.url);
    }, [product.images, product.title]);

    function slideDesktopPrev() {
        desktopSwiperRef.current?.slidePrev();
    }

    function slideDesktopNext() {
        desktopSwiperRef.current?.slideNext();
    }

    function slideMobilePrev() {
        mobileSwiperRef.current?.slidePrev();
    }

    function slideMobileNext() {
        mobileSwiperRef.current?.slideNext();
    }

    return (
        <>
            {/* DESKTOP */}
            <section className="relative hidden h-[calc(100vh-80px)] overflow-hidden bg-[#fff] md:block">
                {images.length > 0 ? (
                    <Swiper
                        modules={[FreeMode, Mousewheel, Navigation]}
                        onSwiper={(swiper) => {
                            desktopSwiperRef.current = swiper;
                        }}
                        loop={images.length > 2}
                        grabCursor
                        speed={500}
                        slidesPerView={2.1}
                        spaceBetween={8}
                        freeMode={{
                            enabled: true,
                            momentum: true,
                            momentumRatio: 0.3,
                            sticky: true,
                            momentumVelocityRatio: 0.3,
                        }}
                        mousewheel={{
                            forceToAxis: true,
                            sensitivity: 0.7,
                        }}
                        className="h-full w-full"
                    >
                        {images.map((image, index) => (
                            <SwiperSlide
                                key={`${image.url}-${index}`}
                                className="h-full overflow-hidden bg-[#efefef]"
                            >
                                <img
                                    src={image.url}
                                    alt={image.alt}
                                    loading="lazy"
                                    draggable={false}
                                    className="h-full w-full object-cover"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="flex h-full items-center justify-center text-[15px] text-neutral-400">
                        Нет изображения
                    </div>
                )}

                {images.length > 1 && (
                    <div className="absolute bottom-8 left-[max(2rem,3.33vw)] z-20 flex gap-2">
                        <button
                            type="button"
                            onClick={slideDesktopPrev}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md transition-colors hover:bg-neutral-100"
                            aria-label="Предыдущий слайд"
                        >
                            <Icon name="arrow-left" className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={slideDesktopNext}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md transition-colors hover:bg-neutral-100"
                            aria-label="Следующий слайд"
                        >
                            <Icon name="arrow-right" className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <ProductFloatingCard product={product} />
            </section>

            {/* MOBILE */}
            <section className="md:hidden">
                <div className="relative bg-[#fff]">
                    {images.length > 0 ? (
                        <Swiper
                            modules={[FreeMode, Mousewheel, Navigation]}
                            onSwiper={(swiper) => {
                                mobileSwiperRef.current = swiper;
                            }}
                            loop={images.length > 1}
                            grabCursor
                            speed={500}
                            slidesPerView={1}
                            spaceBetween={8}
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
                            className="h-[420px] w-full"
                        >
                            {images.map((image, index) => (
                                <SwiperSlide
                                    key={`${image.url}-${index}`}
                                    className="h-full overflow-hidden bg-[#efefef]"
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt}
                                        loading="lazy"
                                        draggable={false}
                                        className="h-full w-full object-cover"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className="flex h-[420px] items-center justify-center text-[15px] text-neutral-400">
                            Нет изображения
                        </div>
                    )}

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={slideMobilePrev}
                                className="absolute left-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition-colors hover:bg-neutral-100"
                                aria-label="Предыдущий слайд"
                            >
                                <Icon name="arrow-left" className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                onClick={slideMobileNext}
                                className="absolute right-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition-colors hover:bg-neutral-100"
                                aria-label="Следующий слайд"
                            >
                                <Icon name="arrow-right" className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>

                <div className="relative -mt-6 rounded-t-[24px] bg-white px-5 pb-4 md:pb-10 pt-6 z-[20]">
                    <ProductFloatingCard mobile product={product} />
                </div>
            </section>
        </>
    );
}