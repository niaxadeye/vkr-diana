import { Link, useSearchParams } from "react-router";

export function PaymentAbortPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[760px] rounded-[28px] bg-neutral-50 p-8 text-center">
        <h1 className="text-[32px] font-semibold text-black">Оплата отменена</h1>
        <p className="mt-4 text-[16px] text-neutral-500">
          Вы отменили оплату в Яндекс Пэй. Корзина на этом устройстве не очищалась, поэтому можно вернуться и попробовать снова.
        </p>
        {orderId && (
          <p className="mt-4 text-[14px] text-neutral-500">
            ID заказа: <span className="font-medium text-black">{orderId}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/cart"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#060606] px-6 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Вернуться в корзину
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
