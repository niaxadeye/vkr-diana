import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { useCartStore } from "@/entities/cart/model/cart.store";
import { syncYandexPaymentStatus } from "@/entities/payment/api/yandexPayment.api";
import type { PaymentStatus } from "@/entities/order/model/order.types";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((state) => state.clearCart);
  const [status, setStatus] = useState<PaymentStatus | "SYNCING" | "ERROR">(
    orderId ? "SYNCING" : "ERROR",
  );
  const [message, setMessage] = useState(
    orderId
      ? "Проверяем статус оплаты в Яндекс Пэй..."
      : "Не удалось определить заказ для проверки оплаты.",
  );

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    async function syncPayment() {
      try {
        const result = await syncYandexPaymentStatus(orderId!);

        if (cancelled) {
          return;
        }

        setStatus(result.paymentStatus);

        if (result.paymentStatus === "PAID") {
          clearCart();
          setMessage("Оплата подтверждена. Заказ отмечен как оплаченный.");
          return;
        }

        if (result.paymentStatus === "PENDING") {
          setMessage(
            "Платёж ещё обрабатывается. Обновите страницу через несколько секунд или проверьте заказ в профиле.",
          );
          return;
        }

        if (result.paymentStatus === "FAILED") {
          setMessage("Яндекс Пэй сообщил, что оплата не прошла.");
          return;
        }

        setMessage(`Статус оплаты обновлён: ${result.paymentStatus}.`);
      } catch (error) {
        console.error("SYNC_YANDEX_PAYMENT_STATUS_ERROR", error);

        if (!cancelled) {
          setStatus("ERROR");
          setMessage(
            "Оплата могла пройти, но сейчас не удалось автоматически обновить статус. Проверьте заказ в профиле или админке чуть позже.",
          );
        }
      }
    }

    void syncPayment();

    return () => {
      cancelled = true;
    };
  }, [clearCart, orderId]);

  return (
    <PaymentResultLayout
      title={getTitle(status)}
      description={message}
      orderId={orderId}
      actionLabel="Перейти в профиль"
      actionHref="/profile"
    />
  );
}

function getTitle(status: PaymentStatus | "SYNCING" | "ERROR") {
  switch (status) {
    case "PAID":
      return "Оплата подтверждена";
    case "PENDING":
      return "Оплата обрабатывается";
    case "FAILED":
      return "Оплата не прошла";
    case "REFUNDED":
      return "Платёж возвращён";
    case "SYNCING":
      return "Проверяем оплату";
    default:
      return "Не удалось обновить статус";
  }
}

function PaymentResultLayout({
  title,
  description,
  orderId,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  orderId: string | null;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[760px] rounded-[28px] bg-neutral-50 p-8 text-center">
        <h1 className="text-[32px] font-semibold text-black">{title}</h1>
        <p className="mt-4 text-[16px] text-neutral-500">{description}</p>
        {orderId && (
          <p className="mt-4 text-[14px] text-neutral-500">
            ID заказа: <span className="font-medium text-black">{orderId}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={actionHref}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#060606] px-6 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800"
          >
            {actionLabel}
          </Link>
          <Link
            to="/catalog"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-medium text-black ring-1 ring-neutral-200 transition-colors hover:bg-neutral-100"
          >
            В каталог
          </Link>
        </div>
      </div>
    </main>
  );
}
