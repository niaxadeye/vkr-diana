import { useState } from "react";
import { NavLink, Outlet } from "react-router";

import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon/Icon";

const adminNav = [
  { label: "Главная", href: "/admin" },
  { label: "Товары", href: "/admin/products" },
  { label: "Остатки", href: "/admin/inventory" },
  { label: "Заказы", href: "/admin/orders" },
  { label: "Коллекции", href: "/admin/collections" },
];

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-neutral-200 bg-white p-6 lg:block">
          <AdminSidebar />
        </aside>

        <div className="lg:hidden">
          <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[20px] font-semibold tracking-[-0.04em] text-black">
                  Admin
                </p>

                <p className="text-xs text-neutral-500">
                  Панель управления
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen((current) => !current)
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-black transition hover:bg-black hover:text-white"
                aria-label={
                  menuOpen
                    ? "Закрыть меню"
                    : "Открыть меню"
                }
              >
                <Icon
                  name={menuOpen ? "close" : "menu"}
                  className="h-5 w-5"
                />
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
    <div className="sticky top-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.05em] text-black">
          Admin
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Панель управления
        </p>
      </div>

      <nav className="mt-8 flex flex-col gap-2">
        {adminNav.map((item) => (
          <AdminNavLink key={item.href} item={item} />
        ))}
      </nav>
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
          "flex min-h-12 items-center rounded-2xl px-4 py-3 text-[15px] font-medium transition",
          isActive
            ? "bg-black text-white"
            : "text-black hover:bg-neutral-100",
        )
      }
    >
      {item.label}
    </NavLink>
  );
}