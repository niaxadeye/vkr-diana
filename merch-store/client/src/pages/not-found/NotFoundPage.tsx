import { Link } from "react-router";

export function NotFoundPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
            <section className="text-center">
                <h1 className="text-[40px] font-medium leading-none tracking-[-0.06em] text-[#060606] md:text-[48px]">
                    404
                </h1>

                <p className="mt-4 text-[14px] font-medium text-[#666666]">
                    Такой страницы не существует
                </p>

                <Link
                    to="/"
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#060606] px-5 text-[13px] font-medium text-white transition hover:bg-neutral-800"
                >
                    На главную
                </Link>
            </section>
        </main>
    );
}