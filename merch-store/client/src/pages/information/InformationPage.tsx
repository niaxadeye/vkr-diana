import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router";
import { Swiper, SwiperSlide, } from "swiper/react";
import { FreeMode } from 'swiper/modules';
import "@/info.css";

import { getInformationPages } from "@/entities/information/api/information.api";
import type { InformationPage as InformationPageType } from "@/entities/information/model/information.types";
import { Markdown } from "@/shared/ui/markdown/Markdown";


export function InformationPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [pages, setPages] = useState<InformationPageType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const queryTab = searchParams.get("tab");
    const activeSlug = queryTab ? queryTab : "payment";
    const activePage = pages.find((p) => p.slug === activeSlug) ?? pages[0] ?? null;

    const tabsRef = useRef<HTMLDivElement>(null);
    const underlineRef = useRef<HTMLDivElement>(null);

    // Обновление позиции underline
    const updateUnderline = () => {
        if (!tabsRef.current || !underlineRef.current || !activePage) return;
        const activeButton = tabsRef.current.querySelector<HTMLButtonElement>(
            `[data-slug="${activePage.slug}"]`
        );
        if (activeButton) {
            underlineRef.current.style.width = `${activeButton.offsetWidth}px`;
            underlineRef.current.style.transform = `translateX(${activeButton.offsetLeft}px)`;
        }
    };

    useEffect(() => {
        void (async function loadPages() {
            try {
                setIsLoading(true);
                setError("");
                const data = await getInformationPages();
                setPages(data);
            } catch {
                setError("Не удалось загрузить информационные страницы");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        updateUnderline();
    }, [activeSlug, pages]);

    useEffect(() => {
        const container = tabsRef.current;
        if (!container) return;
        container.addEventListener("scroll", updateUnderline, { passive: true });
        window.addEventListener("resize", updateUnderline);
        return () => {
            container.removeEventListener("scroll", updateUnderline);
            window.removeEventListener("resize", updateUnderline);
        };
    }, [pages, activePage]);

    const handleTabClick = (slug: string) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("tab", slug);
        setSearchParams(nextParams);
    };

    return (
        <main className="min-h-[calc(100svh-48px)] bg-white px-4 py-4 md:py-4 flex flex-col items-center">
            {/* Tabs Swiper */}
            <div className="relative w-full max-w-[800px]">
                <Swiper
                    spaceBetween={24}
                    slidesPerView="auto"
                    freeMode={window.innerWidth >= 768}
                    modules={[FreeMode]}
                    className="!overflow-hidden scrollbar-none"
                >
                    {pages.map((page) => {
                        const isActive = activePage?.slug === page.slug;
                        return (
                            <SwiperSlide key={page.slug} className="!w-auto relative">
                                <button
                                    data-slug={page.slug}
                                    onClick={() => handleTabClick(page.slug)}
                                    className={`py-2 text-[14px] font-[400] ${isActive ? "text-[#060606]" : "text-[#060606]"}`}
                                    style={{ borderRadius: 0 }}
                                >
                                    {page.title}
                                </button>
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black transition-all duration-300" />
                                )}
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Underline */}
                <div
                    ref={underlineRef}
                    className="absolute bottom-0 h-[2px] bg-black transition-all duration-300"
                />
            </div>

            {/* Content */}
            <section className="w-full flex items-center justify-center  min-h-[calc(100svh-256px)] py-2">
                {isLoading ? (
                    <div className="text-gray-600 text-lg">Загружаем информацию...</div>
                ) : error ? (
                    <div className="text-red-500 text-lg">{error}</div>
                ) : !activePage ? (
                    <div className="text-gray-600 text-lg">Информационная страница не найдена</div>
                ) : (
                    <article className="max-w-[800px] w-full">
                        <div className="mt-6 text-left">
                            <Markdown>{activePage.content}</Markdown>
                        </div>
                    </article>
                )}
            </section>
        </main>

    );
}