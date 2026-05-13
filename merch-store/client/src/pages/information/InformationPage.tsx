import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getInformationPages } from "@/entities/information/api/information.api";
import type {
    InformationPage as InformationPageType,
    InformationSlug,
} from "@/entities/information/model/information.types";
import { isInformationSlug } from "@/entities/information/model/information.types";
import { cn } from "@/shared/lib/cn";

export function InformationPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState<InformationPageType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const queryTab = searchParams.get("tab");
    const activeSlug: InformationSlug = isInformationSlug(queryTab)
        ? queryTab
        : "payment";

    const activePage =
        pages.find((page) => page.slug === activeSlug) ?? pages[0] ?? null;

    useEffect(() => {
        async function loadInformationPages() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getInformationPages();

                setPages(data);
            } catch (loadError) {
                console.error("LOAD_INFORMATION_PAGES_ERROR:", loadError);
                setError("Не удалось загрузить информационные страницы");
            } finally {
                setIsLoading(false);
            }
        }

        void loadInformationPages();
    }, []);

    useEffect(() => {
        if (isLoading || pages.length === 0) return;

        const hasActivePage = pages.some((page) => page.slug === activeSlug);

        if (!queryTab || !hasActivePage) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("tab", pages[0].slug);

            setSearchParams(nextParams, {
                replace: true,
            });
        }
    }, [activeSlug, isLoading, pages, queryTab, searchParams, setSearchParams]);

    function handleTabClick(slug: InformationSlug) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("tab", slug);

        setSearchParams(nextParams);
    }

    return (
        <main className="min-h-[calc(100svh-48px)] bg-white px-4 py-4 md:min-h-[calc(100vh-80px)] md:px-4 md:py-9">
            <div className="mx-auto max-w-[1680px]">
                <section className="grid min-h-[calc(100svh-80px)] grid-cols-1 gap-3 md:min-h-[calc(100vh-152px)] md:grid-cols-[360px_1fr]">
                    <aside className="bg-[#fafafa] p-4 md:p-6 rounded-2xl">
                        <div className="sticky top-24">
                            <p className="text-[13px] font-medium uppercase  text-[#666666]">
                                Информация
                            </p>

                            <h1 className="mt-3 text-[36px] font-[500] leading-[44px] text-[#060606]">
                                Помощь покупателю
                            </h1>

                            <nav className="mt-8 grid gap-2">
                                {isLoading ? (
                                    <div className="rounded-2xl bg-white px-4 py-4 text-[15px] text-[#666666]">
                                        Загружаем разделы...
                                    </div>
                                ) : (
                                    pages.map((page) => {
                                        const isActive = activePage?.slug === page.slug;

                                        return (
                                            <button
                                                key={page.slug}
                                                type="button"
                                                onClick={() => handleTabClick(page.slug)}
                                                className={cn(
                                                    "flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition",
                                                    isActive
                                                        ? "bg-black text-white"
                                                        : "bg-white text-black hover:bg-[#f0f0f0]",
                                                )}
                                            >
                                                <span>{page.title}</span>


                                            </button>
                                        );
                                    })
                                )}
                            </nav>
                        </div>
                    </aside>

                    <section className="bg-[#fafafa] p-4 md:p-8 lg:p-6 rounded-2xl">
                        {isLoading ? (
                            <div className="flex min-h-[360px] items-center justify-center rounded-[28px] bg-white px-6 text-center text-[15px] text-[#666666]">
                                Загружаем информацию...
                            </div>
                        ) : error ? (
                            <div className="flex min-h-[360px] items-center justify-center rounded-[28px] bg-white px-6 text-center">
                                <div>
                                    <p className="text-[18px] font-medium text-black">
                                        Ошибка загрузки
                                    </p>

                                    <p className="mt-2 text-[15px] text-[#666666]">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        ) : !activePage ? (
                            <div className="flex min-h-[360px] items-center justify-center rounded-xl bg-white px-6 text-center text-[15px] text-[#666666]">
                                Информационная страница не найдена
                            </div>
                        ) : (
                            <article className="min-h-full rounded-xl bg-white px-4 py-6 md:px-8 md:py-9 lg:px-12 lg:py-12">
                                <div className="max-w-[920px]">
                                    <h2 className="mt-0 text-[36px] font-[500] leading-[48px] text-[#060606] md:text-[56px] md:leading-[64px]">
                                        {activePage.title}
                                    </h2>

                                    <div className="markdown-content mt-8">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {activePage.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </article>
                        )}
                    </section>
                </section>
            </div>
        </main>
    );
}