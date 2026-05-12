import { Link, useNavigate } from "react-router";

import { Icon } from "@/shared/ui/icon/Icon";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const navigate = useNavigate();

  function handleGoHome() {
    navigate("/");
  }

  return (
    <main className="relative min-h-screen bg-white md:grid md:grid-cols-2">
      <button
        type="button"
        onClick={handleGoHome}
        className="absolute right-7 top-7 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition-colors hover:bg-[#060606] hover:text-white md:right-8 md:top-8"
        aria-label="Вернуться на главную"
      >
        <Icon name="close" className="h-4 w-4" />
      </button>

      <section className="hidden bg-[#060606] px-8 py-5 md:block">
        <Link to="/" className="inline-flex items-center gap-3 text-white">
          <Icon name="logo" className="h-14 w-14 text-white" />
        </Link>
      </section>

      <section className="flex min-h-screen items-center justify-center px-8 py-12 md:min-h-screen">
        <div className="w-full max-w-[360px]">
          <div className="mb-8 flex justify-center md:hidden">
            <Link to="/">
              <img src="/logo.svg" alt="Acrylogo" className="h-16 w-16" />
            </Link>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}