import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { getOrderById } from "@/entities/order/api/order.api";
import { createYandexPaymentForExistingOrder } from "@/entities/payment/api/yandexPayment.api";
import type { Order } from "@/entities/order/model/order.types";
import { useCountdown } from "@/shared/lib/useCountdown";

export function PaymentAbortPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadline = order?.paymentUrlExpiresAt ?? null;
  const { formatted, isExpired } = useCountdown(deadline);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      try {
        setLoading(true);
        const result = await getOrderById(orderId!);

        if (!cancelled) {
          setOrder(result);
        }
      } catch (err) {
        console.error("LOAD_ABORTED_ORDER_ERROR", err);

        if (!cancelled) {
          setError("Не удалось загрузить заказ. Откройте его в профиле.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handlePay() {
    if (!orderId) {
      return;
    }

    try {
      setPaying(true);
      setError(null);
      const payment = await createYandexPaymentForExistingOrder(orderId);
      window.location.href = payment.paymentUrl;
    } catch (err) {
      console.error("RETRY_ABORTED_PAYMENT_ERROR", err);
      setError("Не удалось открыть оплату. Попробуйте ещё раз.");
      setPaying(false);
    }
  }

  const isPaid = order?.paymentStatus === "PAID";
  const isCancelled = order?.status === "CANCELLED";
  const canPay = Boolean(orderId) && !isPaid && !isCancelled;

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[760px] rounded-[28px] bg-neutral-50 p-8 text-center">
        <h1 className="text-[32px] font-semibold text-black">
          {isPaid ? "Заказ уже оплачен" : "У вас есть время оплатить заказ"}
        </h1>

        {isPaid ? (
          <p className="mt-4 text-[16px] text-neutral-500">
            Этот заказ уже оплачен. Можно посмотреть его в профиле.
          </p>
        ) : isCancelled ? (
          <p className="mt-4 text-[16px] text-neutral-500">
            Заказ отменён, ссылка на оплату больше недоступна. Оформите новый заказ.
          </p>
        ) : (
          <p className="mt-4 text-[16px] text-neutral-500">
            Вы вышли из оплаты, но заказ сохранён. Ссылка на оплату действует
            ограниченное время — успейте завершить платёж.
          </p>
        )}

        {orderId && (
          <p className="mt-4 text-[14px] text-neutral-500">
            {order ? (
              <>Заказ <span className="font-medium text-black">#{order.orderNumber}</span></>
            ) : (
              <>ID заказа: <span className="font-medium text-black">{orderId}</span></>
            )}
          </p>
        )}

        {loading && (
          <p className="mt-6 text-[15px] text-neutral-500">Загружаем заказ...</p>
        )}

        {!loading && canPay && deadline && (
          <div className="mt-6">
            {isExpired ? (
              <p className="text-[15px] text-neutral-500">
                Срок действия ссылки истёк. Можно создать новую ссылку на оплату.
              </p>
            ) : (
              <>
                <p className="text-[14px] text-neutral-500">Осталось времени на оплату</p>
                <p className="mt-1 text-[36px] font-semibold tabular-nums text-black">
                  {formatted}
                </p>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-[16px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {!loading && canPay && (
            <button
              type="button"
              onClick={() => void handlePay()}
              disabled={paying}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#060606] px-6 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying
                ? "Открываем оплату..."
                : isExpired
                  ? "Оплатить заново"
                  : "Оплатить"}
            </button>
          )}

          <Link
            to="/profile"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-medium text-black ring-1 ring-neutral-200 transition-colors hover:bg-neutral-100"
          >
            В профиль
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
