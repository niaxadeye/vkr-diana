import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { SliderArrow } from "@/shared/ui/slider-arrow/SliderArrow";
import { Icon } from "@/shared/ui/icon/Icon";

import { getMyOrders } from "@/entities/order/api/order.api";
import type { Order } from "@/entities/order/model/order.types";
import { formatPrice } from "@/entities/cart/lib/formatPrice";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";

import { ChangeEmailModal } from "./ui/ChangeEmailModal";
import { ChangePasswordModal } from "./ui/ChangePasswordModal";

import { useAuthStore } from "@/features/auth/model/auth.store";

import {
    getDeliveryAddresses,
    setDefaultDeliveryAddress,
} from "@/entities/delivery-address/api/deliveryAddress.api";
import { formatDeliveryAddress } from "@/entities/delivery-address/lib/formatDeliveryAddress";
import type { DeliveryAddress } from "@/entities/delivery-address/model/deliveryAddress.types";

export function ProfilePage() {
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [addressesError, setAddressesError] = useState<string | null>(null);

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    async function loadAddresses() {
        try {
            setAddressesLoading(true);
            setAddressesError(null);

            const result = await getDeliveryAddresses();

            setAddresses(result);
        } catch (error) {
            console.error("LOAD_DELIVERY_ADDRESSES_ERROR:", error);
            setAddressesError("Не удалось загрузить адреса доставки");
        } finally {
            setAddressesLoading(false);
        }
    }

    async function loadOrders() {
        try {
            setOrdersLoading(true);
            setOrdersError(null);

            const result = await getMyOrders();

            setOrders(result);
        } catch (error) {
            console.error("LOAD_ORDERS_ERROR:", error);
            setOrdersError("Не удалось загрузить заказы");
        } finally {
            setOrdersLoading(false);
        }
    }

    useEffect(() => {
        void loadAddresses();
        void loadOrders();
    }, []);

    function handleOpenCreateAddressPage() {
        navigate("/profile/addresses/new");
    }

    function handleOpenEditAddressPage(addressId: string) {
        navigate(`/profile/addresses/${addressId}/edit`);
    }

    async function handleSetDefaultAddress(addressId: string) {
        try {
            setActionLoadingId(addressId);

            const updatedAddress = await setDefaultDeliveryAddress(addressId);

            setAddresses((currentAddresses) =>
                currentAddresses.map((address) => ({
                    ...address,
                    isDefault: address.id === updatedAddress.id,
                })),
            );

            toast.success("Адрес выбран по умолчанию");
        } catch (error) {
            console.error("SET_DEFAULT_DELIVERY_ADDRESS_ERROR:", error);
            toast.error("Не удалось выбрать адрес по умолчанию");
        } finally {
            setActionLoadingId(null);
        }
    }

    return (
        <>
            <main className="min-h-screen bg-white px-4 py-5 md:px-12">
                <div className="mx-auto max-w-[1256px]">
                    <section>
                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-[36px] font-[500] leading-[44px] text-[#060606] max-md:text-[24px] max-md:leading-[32px]">
                                Профиль
                            </h1>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex h-10 items-center justify-center rounded-full bg-[#f0f0f0] px-5 text-[15px] font-[500] text-[#060606] transition hover:bg-[#060606] hover:text-white"
                            >
                                Выйти
                            </button>
                        </div>

                        <div className="mt-8 flex items-start gap-6">
                            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#060606] text-[34px] font-medium uppercase leading-none text-white md:flex">
                                {user?.email?.[0]?.toUpperCase() ?? "U"}
                            </div>

                            <div className="grid flex-1 gap-7 md:max-w-[520px] md:grid-cols-2 md:gap-10">
                                <div className="flex items-start justify-between gap-4 md:block">
                                    <div>
                                        <p className="text-[18px] leading-6 text-[#666666]">
                                            Email
                                        </p>

                                        <p className="mt-1 text-[18px] font-[400] leading-6 text-[#060606]">
                                            {user?.email}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => setEmailModalOpen(true)}
                                            className="mt-3 hidden items-center gap-2 text-[15px] font-medium text-[#666666] transition hover:text-[#060606] md:inline-flex"
                                        >
                                            <Icon name="edit" className="h-4 w-4" />
                                            Изменить
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setEmailModalOpen(true)}
                                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white md:hidden"
                                        aria-label="Изменить email"
                                    >
                                        <Icon name="edit" className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex items-start justify-between gap-4 md:block">
                                    <div>
                                        <p className="text-[18px] leading-6 text-[#666666]">
                                            Пароль
                                        </p>

                                        <p className="mt-1 text-[18px] font-[400] leading-6 text-[#060606]">
                                            ••••••••••••
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => setPasswordModalOpen(true)}
                                            className="mt-3 hidden items-center gap-2 text-[15px] font-medium text-[#666666] transition hover:text-[#060606] md:inline-flex"
                                        >
                                            <Icon name="edit" className="h-4 w-4" />
                                            Изменить
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setPasswordModalOpen(true)}
                                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white md:hidden"
                                        aria-label="Изменить пароль"
                                    >
                                        <Icon name="edit" className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-12 max-md:mt-14">
                        <h2 className="text-[36px] font-[500] leading-[44px] text-[#060606] max-md:text-[24px] max-md:leading-[32px]">
                            Заказы
                        </h2>

                        <div className="mt-4">
                            {ordersLoading ? (
                                <div className="rounded-[24px] bg-[#fafafa] p-7 text-[15px] text-[#666666]">
                                    Загружаем заказы...
                                </div>
                            ) : ordersError ? (
                                <div className="rounded-[24px] bg-red-50 p-7 text-[15px] text-red-600">
                                    {ordersError}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="rounded-[24px] bg-[#fafafa] p-7">
                                    <p className="text-[15px] font-[500] text-[#060606]">
                                        Заказов пока нет
                                    </p>

                                    <p className="mt-1 text-[15px] text-[#666666]">
                                        После оформления покупки заказ появится здесь.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {orders.map((order) => (
                                        <article
                                            key={order.id}
                                            className="border-b border-[#e5e5e5] py-6 last:border-b-0"
                                        >
                                            <div className="grid gap-5 md:grid-cols-[150px_180px_100px_120px_1fr] md:items-start md:gap-6">
                                                <div>
                                                    <p className="text-[16px] font-medium leading-6 text-[#060606]">
                                                        Заказ #{order.orderNumber}
                                                    </p>

                                                    <p className="mt-1 text-[16px] leading-6 text-[#666666]">
                                                        {getOrderStatusLabel(order.status, order)}
                                                    </p>
                                                </div>

                                                <InfoColumn
                                                    label="Создан"
                                                    value={formatDateTime(order.createdAt)}
                                                />

                                                <InfoColumn
                                                    label="Итого"
                                                    value={formatPrice(order.total)}
                                                />

                                                {isOrderWaitingPayment(order) ? (
                                                    <InfoColumn
                                                        label="Оплатить до"
                                                        value={getOrderPaymentDeadline(order)}
                                                    />
                                                ) : (
                                                    <div className="hidden md:block" />
                                                )}

                                                <div className="flex h-10 items-center justify-between gap-3 md:justify-end">
                                                    {isOrderWaitingPayment(order) && (
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-10 items-center justify-center rounded-full bg-[#060606] px-6 text-[15px] font-medium text-white transition hover:bg-neutral-800"
                                                        >
                                                            Оплатить
                                                        </button>
                                                    )}

                                                    <OrderPreviewImages order={order} />

                                                    <Link
                                                        to={`/profile/orders/${order.id}`}
                                                        aria-label={`Открыть заказ #${order.orderNumber}`}
                                                        className="shrink-0"
                                                    >
                                                        <SliderArrow direction="next" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    ))}

                                    {orders.length > 2 && (
                                        <div className="mt-8 flex justify-center">
                                            <button
                                                type="button"
                                                className="inline-flex h-11 items-center justify-center rounded-full bg-[#f0f0f0] px-7 text-[15px] font-[500] text-[#060606] transition hover:bg-[#060606] hover:text-white"
                                            >
                                                Загрузить ещё
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="mt-12">
                        <div className="flex items-center gap-4">
                            <h2 className="text-[36px] font-[500] leading-[44px] text-[#060606] max-md:text-[24px] max-md:leading-[32px]">
                                Адреса доставки
                            </h2>

                            <button
                                type="button"
                                onClick={handleOpenCreateAddressPage}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white"
                                aria-label="Добавить адрес"
                            >
                                <Icon name="plus" className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-8">
                            {addressesLoading ? (
                                <div className="rounded-2xl bg-neutral-50 p-7 text-sm text-neutral-500">
                                    Загружаем адреса доставки...
                                </div>
                            ) : addressesError ? (
                                <div className="rounded-2xl bg-red-50 p-7 text-sm text-red-600">
                                    {addressesError}
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="rounded-2xl bg-neutral-50 p-7">
                                    <p className="text-sm font-medium text-black">
                                        Адреса доставки пока не добавлены
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Добавьте первый адрес, чтобы быстрее оформлять заказы.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-3">
                                    {addresses.map((address) => (
                                        <article
                                            key={address.id}
                                            className="relative flex h-full flex-col rounded-2xl bg-neutral-50 p-7"
                                        >
                                            {address.isDefault && (
                                                <span className="absolute right-5 top-5 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                                                    По умолчанию
                                                </span>
                                            )}

                                            <div className="flex items-start justify-between gap-4 pr-28">
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#060606]">
                                                        {address.title}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex-1 space-y-5">
                                                <Info label="Имя" value={address.fullName} />

                                                <Info label="Телефон" value={address.phone} />

                                                <Info
                                                    label="Тип доставки"
                                                    value={getDeliveryTypeLabel(address)}
                                                />

                                                {address.deliveryType === "courier" && (
                                                    <Info
                                                        label="Адрес доставки"
                                                        value={formatDeliveryAddress(address)}
                                                    />
                                                )}

                                                {address.deliveryType === "cdek_pickup" && address.cdekPvzCode && (
                                                    <Info
                                                        label="Пункт выдачи"
                                                        value={[
                                                            address.cdekPvzName,
                                                            address.cdekPvzAddress,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(", ")}
                                                    />
                                                )}

                                                {address.deliveryType === "courier" && address.courierComment && (
                                                    <Info
                                                        label="Комментарий"
                                                        value={address.courierComment}
                                                    />
                                                )}
                                            </div>

                                            <div className="mt-7 border-t border-neutral-200 pt-5">
                                                <div className="flex flex-col items-center gap-4 md:flex-row md:flex-wrap md:items-center md:justify-start md:gap-5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditAddressPage(address.id)}
                                                        className="inline-flex items-center justify-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-black"
                                                    >
                                                        <Icon name="edit" className="h-4 w-4" />
                                                        Редактировать
                                                    </button>

                                                    {!address.isDefault && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetDefaultAddress(address.id)}
                                                            disabled={actionLoadingId === address.id}
                                                            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Icon name="home" className="h-4 w-4" />
                                                            Выбрать по умолчанию
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <ChangeEmailModal
                open={emailModalOpen}
                onClose={() => setEmailModalOpen(false)}
            />

            <ChangePasswordModal
                open={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-1 text-sm font-medium leading-5 text-black">
                {value}
            </p>
        </div>
    );
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function OrderPreviewImages({ order }: { order: Order }) {
    const previewItems = order.items.slice(0, 4);

    if (previewItems.length === 0) {
        return (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0]">
                <Icon name="cart-filled" className="h-5 w-5" />
            </div>
        );
    }

    return (
        <div className="flex h-10 items-center">
            {previewItems.map((item, index) => (
                <div
                    key={item.id}
                    className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#f0f0f0] ring-2 ring-white"
                    style={{
                        marginLeft: index === 0 ? 0 : -12,
                        zIndex: previewItems.length - index,
                    }}
                >
                    {item.imageUrl ? (
                        <img
                            src={getMediaUrl(item.imageUrl)}
                            alt={item.title}
                            loading="lazy"
                            className="h-[34px] w-[34px] object-contain"
                        />
                    ) : (
                        <Icon name="cart-filled" className="h-5 w-5" />
                    )}
                </div>
            ))}
        </div>
    );
}

function isOrderWaitingPayment(order: Order) {
    return (
        order.status !== "CANCELLED" &&
        order.status !== "DELIVERED" &&
        order.paymentStatus === "PENDING"
    );
}

function getOrderPaymentDeadline(order: Order) {
    const deadline = order.paymentExpiresAt
        ? new Date(order.paymentExpiresAt)
        : new Date(new Date(order.createdAt).getTime() + 2 * 60 * 60 * 1000);

    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) {
        return "00:00:00";
    }

    const totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, "0"))
        .join(":");
}

function getOrderStatusLabel(status: Order["status"], order?: Order) {
    if (order?.paymentStatus === "PENDING" && status === "CREATED") {
        return "Ждём оплату";
    }

    const labels: Record<Order["status"], string> = {
        CREATED: "Создан",
        CONFIRMED: "Подтверждён",
        ASSEMBLING: "Собирается",
        SHIPPED: "Отправлен",
        DELIVERED: "Доставлен",
        CANCELLED: "Отменён",
    };

    return labels[status] ?? status;
}

function getDeliveryTypeLabel(address: DeliveryAddress) {
    if (address.deliveryType === "cdek_pickup") {
        return "Пункт выдачи СДЭК";
    }

    return "Курьер";
}

function InfoColumn({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 md:block">
            <p className="text-[16px] leading-6 text-[#666666] md:hidden">
                {label}
            </p>

            <p className="text-[16px] leading-6 text-[#060606]">
                {value}
            </p>

            <p className="hidden text-[16px] leading-6 text-[#666666] md:mt-1 md:block">
                {label}
            </p>
        </div>
    );
}