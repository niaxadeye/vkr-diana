import { Link, NavLink } from "react-router";

import { Icon } from "@/shared/ui/icon/Icon";
import { useCartStore } from "@/entities/cart/model/cart.store";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/features/cart-drawer/ui/CartDrawer";
import { FloatingCartButton } from "@/features/cart-drawer/ui/FloatingCartButton";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button/Button";
import { useAuthStore } from "@/features/auth/model/auth.store";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Все товары", href: "/catalog" },
  { label: "Информация", href: "/information" },
  { label: "Контакты", href: "/contacts" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuMounted, setIsMobileMenuMounted] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const totalQuantity = useCartStore((state) => state.getTotalQuantity());
  const user = useAuthStore((state) => state.user);



  const isAuthenticated = Boolean(user);

  function openMobileMenu() {
    setIsMobileMenuMounted(true);

    window.setTimeout(() => {
      setIsMobileMenuOpen(true);
    }, 10);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);

    window.setTimeout(() => {
      setIsMobileMenuMounted(false);
    }, 250);
  }

  useEffect(() => {
    document.body.style.overflow = isMobileMenuMounted ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuMounted]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
        <div className="relative mx-auto flex h-12 items-center px-4 md:h-20 md:px-12">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-9 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "text-[15px] font-[500] text-neutral-950 transition-opacity hover:opacity-60",
                    isActive && "opacity-60",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            aria-label="Открыть меню"
            className="flex h-10 w-10 items-center justify-start rounded-full text-[#060606] transition-colors hover:bg-[#f0f0f0] md:hidden"
            onClick={openMobileMenu}
          >
            <Icon name="menu" className="h-4 w-4" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            aria-label="На главную"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-7 w-7 object-contain md:h-10 md:w-10"
            />
          </Link>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">

            {/* Account */}
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              aria-label={isAuthenticated ? "Профиль" : "Войти"}
              className="flex h-8 w-8 items-center justify-center text-[#060606] transition-colors hover:opacity-60 md:h-10 md:w-10 md:rounded-full md:bg-[#f0f0f0] md:hover:bg-[#060606] md:hover:text-white md:hover:opacity-100"
            >
              <Icon
                name={isAuthenticated ? "person" : "account"}
                className="h-4 w-4"
              />
            </Link>

            {/* Cart desktop */}
            <Button
              type="button"
              variant="black"
              onClick={() => setCartOpen(true)}
              className="group hidden h-10 items-center gap-2 rounded-full bg-black px-5 text-[15px] font-medium leading-none md:flex"
            >
              <span className="text-[15px] font-medium leading-none">Корзина</span>
              <Icon
                name={totalQuantity > 0 ? "cart-filled" : "cart-empty"}
                className="h-4 w-4"
              />

              <span className="text-[15px] font-medium leading-none">
                {totalQuantity}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuMounted && (
        <div
          className={cn(
            "fixed inset-0 z-[60] bg-white min-h-[100dvh] transition duration-250 ease-out md:hidden",
            isMobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <div className="relative flex h-12 items-center px-4">
            <Link
              to="/"
              aria-label="На главную"
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              onClick={closeMobileMenu}
            >
              <img
                src="/logo.svg"
                alt="Logo"
                className="h-7 w-7 object-contain"
              />
            </Link>

            <button
              type="button"
              aria-label="Закрыть меню"
              className="ml-auto flex h-10 w-10 items-center justify-end rounded-full text-[#060606] transition-colors hover:bg-[#f0f0f0]"
              onClick={closeMobileMenu}
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          <nav
            className={cn(
              "flex min-h-[calc(100vh-48px)] flex-col items-center justify-center gap-9 pb-24 transition duration-300 ease-out",
              isMobileMenuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
          >
            {navItems.map((item, index) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  cn(
                    "text-[22px] font-[500] text-[#060606] transition-all duration-300 hover:opacity-60",
                    isActive && "opacity-60",
                  )
                }
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 35}ms` : "0ms",
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}


      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <FloatingCartButton
        count={totalQuantity}
        onClick={() => setCartOpen(true)}
      />
    </>
  );
}