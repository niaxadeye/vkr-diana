import { useState } from "react";
import { NavLink, Link, Outlet } from "react-router";

import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon/Icon";

const adminNav = [
  { label: "Главная", href: "/admin" },
  { label: "Товары", href: "/admin/products" },
  { label: "Остатки", href: "/admin/inventory" },
  { label: "Заказы", href: "/admin/orders" },
  { label: "Коллекции", href: "/admin/collections" },
  { label: "Промокоды", href: "/admin/promo-codes" },
  { label: "Шапка", href: "/admin/home" },
  { label: "Информация", href: "/admin/info" },
  { label: "Рекомендации", href: "/admin/recommended-products" },
];

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-[#e5e5e5] bg-white p-6 lg:block">
          <AdminSidebar />
        </aside>

        <div className="lg:hidden">
          <header className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[22px] font-[500] tracking-[-0.04em] text-[#060606]">
                  Админ-панель
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white"
                aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              >
                <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
              </button>
            </div>

            {menuOpen && (
              <nav className="mt-4 grid gap-2 pb-1">
                {adminNav.map((item) => (
                  <AdminNavLink
                    key={item.href}
                    item={item}
                    onClick={closeMenu}
                  />
                ))}

                <Link
                  to="/"
                  onClick={closeMenu}
                  className="mt-1 flex min-h-12 items-center rounded-2xl px-4 py-3 text-[15px] font-[500] text-[#666666] transition hover:bg-[#f0f0f0] hover:text-[#060606]"
                >
                  На сайт
                </Link>
              </nav>
            )}
          </header>
        </div>

        <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

function AdminSidebar() {
  return (
    <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col">
      <div>
        <h1 className="text-[28px] font-[500] leading-[34px] tracking-[-0.04em] text-[#060606]">
          Админ-панель
        </h1>

        <p className="mt-1 text-[15px] text-[#666666]">
          Управление магазином
        </p>
      </div>

      <nav className="mt-8 flex flex-col gap-2">
        {adminNav.map((item) => (
          <AdminNavLink key={item.href} item={item} />
        ))}
      </nav>

      <Link
        to="/"
        className="mt-auto flex min-h-12 items-center gap-2 rounded-2xl px-4 py-3 text-[15px] font-[500] text-[#666666] transition hover:bg-[#f0f0f0] hover:text-[#060606]"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        На сайт
      </Link>
    </div>
  );
}

function AdminNavLink({
  item,
  onClick,
}: {
  item: {
    label: string;
    href: string;
  };
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={item.href}
      end={item.href === "/admin"}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex min-h-12 items-center rounded-2xl px-4 py-3 text-[15px] font-[500] transition",
          isActive
            ? "bg-[#060606] text-white"
            : "text-[#060606] hover:bg-[#f0f0f0]",
        )
      }
    >
      {item.label}
    </NavLink>
  );
}
