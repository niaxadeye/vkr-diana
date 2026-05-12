import { Link } from "react-router";

const footerLinks = [
  { label: "Оплата", href: "/payment" },
  { label: "Доставка", href: "/delivery" },
  { label: "Возврат", href: "/returns" },
  { label: "Безопасность", href: "/security" },
  { label: "Приватность", href: "/privacy" },
  { label: "Положения", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-4 py-8 md:px-12 md:py-10">
      <div className="mx-auto flex max-w-[1760px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[14px] font-semibold text-neutral-950">
            © 2026 Team Spirit
          </p>

          <p className="mt-3 max-w-[440px] text-[12px] font-medium leading-5 text-neutral-500">
            11000, Gospodar Jovanova 38, Beograd, Serbia 21775703
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[14px] font-semibold text-neutral-800 transition hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}