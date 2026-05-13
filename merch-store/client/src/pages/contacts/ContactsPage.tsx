import { toast } from "sonner";

import { Icon } from "@/shared/ui/icon/Icon";

const CONTACT_EMAIL = "shop@acrylogo.ru";
const CONTACT_PHONE = "+7 985 009 10 10";

function normalizePhoneForTel(phone: string) {
    return phone.replace(/[^\d+]/g, "");
}

async function copyToClipboard(value: string) {
    await navigator.clipboard.writeText(value);
}

export function ContactsPage() {
    async function handleCopyEmail() {
        try {
            await copyToClipboard(CONTACT_EMAIL);
            toast.success("Почта скопирована");
        } catch {
            toast.error("Не удалось скопировать почту");
        }
    }

    async function handleCopyPhone() {
        try {
            await copyToClipboard(CONTACT_PHONE);
            toast.success("Телефон скопирован");
        } catch {
            toast.error("Не удалось скопировать телефон");
        }
    }

    return (
        <main className="min-h-[calc(100svh-48px)] bg-white px-4 py-4 md:min-h-[calc(100vh-80px)] md:px-4 md:py-9">
            <div className="mx-auto grid min-h-[calc(100svh-80px)] max-w-[1680px] grid-cols-1 gap-3 md:min-h-[calc(100vh-152px)] md:grid-cols-4">
                <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="group flex min-h-[360px] flex-col items-center justify-center bg-[#fafafa] px-6 text-center transition-colors hover:bg-[#f0f0f0] md:col-start-2 md:min-h-[720px]"
                >
                    <Icon
                        name="mail"
                        className="h-12 w-12 text-[#060606] transition-transform duration-300 group-hover:scale-105"
                    />

                    <h1 className="mt-6 text-[24px] font-[500] leading-[32px] tracking-[-0.04em] text-[#060606] md:text-[28px] md:leading-[36px]">
                        Email
                    </h1>

                    <p className="mt-2 text-[18px] font-[400] leading-6 text-[#666666]">
                        {CONTACT_EMAIL}
                    </p>
                </button>

                {/* Desktop: телефон копируется */}
                <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="group hidden min-h-[720px] flex-col items-center justify-center bg-[#fafafa] px-6 text-center transition-colors hover:bg-[#f0f0f0] md:col-start-3 md:flex"
                >
                    <Icon
                        name="phone"
                        className="h-12 w-12 text-[#060606] transition-transform duration-300 group-hover:scale-105"
                    />

                    <h2 className="mt-6 text-[28px] font-[500] leading-[36px] tracking-[-0.04em] text-[#060606]">
                        Телефон
                    </h2>

                    <p className="mt-2 text-[18px] font-[400] leading-6 text-[#666666]">
                        {CONTACT_PHONE}
                    </p>
                </button>

                {/* Mobile: телефон открывает звонок */}
                <a
                    href={`tel:${normalizePhoneForTel(CONTACT_PHONE)}`}
                    className="group flex min-h-[360px] flex-col items-center justify-center bg-[#fafafa] px-6 text-center transition-colors active:bg-[#f0f0f0] md:hidden"
                >
                    <Icon name="phone" className="h-12 w-12 text-[#060606]" />

                    <h2 className="mt-6 text-[24px] font-[500] leading-[32px] tracking-[-0.04em] text-[#060606]">
                        Телефон
                    </h2>

                    <p className="mt-2 text-[18px] font-[400] leading-6 text-[#666666]">
                        {CONTACT_PHONE}
                    </p>
                </a>
            </div>
        </main>
    );
}