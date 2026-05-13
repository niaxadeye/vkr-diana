import { Link } from "react-router";

const footerLinks = [
  { label: "Оплата", href: "/information?tab=payment" },
  { label: "Доставка", href: "/information?tab=delivery" },
  { label: "Возврат", href: "/information?tab=return" },
  { label: "Безопасность", href: "/information?tab=security" },
  { label: "Приватность", href: "/information?tab=privacy" },
  { label: "Положения", href: "/information?tab=terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-4 py-8 md:px-12 md:py-10">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[14px] font-semibold leading-5 text-neutral-950">
            © 2026 Acrylogo.ru
          </p>

          <p className="mt-3 font-[400] text-[14px] leading-5 text-neutral-500">
            358014, Россия, Респ. Калмыкия, г. Элиста, ул М.Эсамбаева, дом 1, кв. 9

          </p>
          <p className="mt-1 font-[400] text-[14px] leading-5 text-neutral-500">
            ИП Фаттахов Ильвир Фаилович ИНН 026208395129
          </p>

        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[14px] font-normal text-[#666666] underline-offset-[3px] transition hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}