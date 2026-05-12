import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { FreeMode, Mousewheel, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import {
    getCollections,
    type CollectionListItem,
} from "@/entities/collection/api/collection.api";
import { CollectionCard } from "@/entities/collection/ui/CollectionCard";
import { SliderArrow } from "@/shared/ui/slider-arrow/SliderArrow";

import "swiper/css";
import "swiper/css/free-mode";

export function CollectionsSection() {
    const swiperRef = useRef<SwiperType | null>(null);

    const [collections, setCollections] = useState<CollectionListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function loadCollections() {
        setIsLoading(true);

        try {
            const data = await getCollections();

            setCollections(data.filter((collection) => collection.isActive));
        } catch (error) {
            console.error("LOAD_COLLECTIONS_ERROR:", error);
            setCollections([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadCollections();
    }, []);

    function scrollPrev() {
        swiperRef.current?.slidePrev();
    }

    function scrollNext() {
        swiperRef.current?.slideNext();
    }

    if (isLoading) {
        return (
            <section className="bg-white px-4 pb-10 pt-6 md:pb-14 md:pt-10">
                <div className="mx-auto max-w-[1680px]">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="h2">Коллекции</h2>

                        <div className="flex items-center gap-2">
                            <SliderArrow direction="prev" onClick={() => {}} />
                            <SliderArrow direction="next" onClick={() => {}} />
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-hidden pb-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[360px] shrink-0 basis-[66.666%] animate-pulse bg-neutral-100 md:h-[544px] md:basis-[calc((100%-32px)/3)] xl:basis-[calc((100%-48px)/4)]"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (collections.length === 0) {
        return null;
    }

    return (
        <section className="bg-white px-4 pb-10 pt-8 md:pb-6 md:pt-8">
            <div className="mx-auto max-w-[1680px]">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="h2">Коллекции</h2>

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
                    // loop={collections.length > 4}
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
                        1280: {
                            slidesPerView: 4,
                            spaceBetween: 16,
                        },
                    }}
                    className="pb-4"
                >
                    {collections.map((collection) => (
                        <SwiperSlide key={collection.id}>
                            <CollectionCard collection={collection} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}