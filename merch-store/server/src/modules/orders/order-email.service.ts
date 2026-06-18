import type { Order, OrderItem } from "@prisma/client";

import { sendMail } from "../mail/mail.service.js";
import {
  orderPaidTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
  trackingUpdatedTemplate,
} from "../mail/mail.templates.js";

type OrderWithItems = Order & { items: OrderItem[] };

function buildOrderUrl(orderId: string): string | undefined {
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    return undefined;
  }

  return `${clientUrl}/profile/orders/${orderId}`;
}

function formatOrderDeliveryAddress(order: OrderWithItems): string {
  // ПВЗ СДЭК — показываем название/адрес пункта.
  if (order.cdekPvzAddress || order.cdekPvzName) {
    return [order.cdekCityName ?? order.deliveryCity, order.cdekPvzAddress ?? order.cdekPvzName]
      .filter(Boolean)
      .join(", ");
  }

  // Курьерская доставка — собираем из частей адреса.
  const parts = [
    order.deliveryCity,
    order.deliveryStreet,
    order.deliveryHouse ? `д. ${order.deliveryHouse}` : null,
    order.deliveryApartment ? `кв. ${order.deliveryApartment}` : null,
  ].filter(Boolean);

  return parts.join(", ") || order.deliveryCity;
}

function mapItems(order: OrderWithItems) {
  return order.items.map((item) => ({
    title: item.title,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
  }));
}

/**
 * Письмо «Заказ оформлен и оплачен» — после подтверждения оплаты.
 */
export async function sendOrderPaidEmail(order: OrderWithItems) {
  if (!order.customerEmail) {
    return;
  }

  try {
    await sendMail({
      to: order.customerEmail,
      subject: `Заказ №${order.orderNumber} оплачен`,
      html: orderPaidTemplate({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        items: mapItems(order),
        deliveryAddress: formatOrderDeliveryAddress(order),
        orderUrl: buildOrderUrl(order.id),
      }),
    });
  } catch (error) {
    console.error("[SEND_ORDER_PAID_EMAIL_ERROR]", error);
  }
}

/**
 * Письмо «Заказ отправлен» — при переходе в SHIPPED.
 */
export async function sendOrderShippedEmail(order: OrderWithItems) {
  if (!order.customerEmail) {
    return;
  }

  try {
    await sendMail({
      to: order.customerEmail,
      subject: `Заказ №${order.orderNumber} отправлен`,
      html: orderShippedTemplate({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        trackingNumber: order.trackingNumber ?? order.cdekTrackNumber,
        orderUrl: buildOrderUrl(order.id),
      }),
    });
  } catch (error) {
    console.error("[SEND_ORDER_SHIPPED_EMAIL_ERROR]", error);
  }
}

/**
 * Письмо «Заказ доставлен» — при переходе в DELIVERED.
 */
export async function sendOrderDeliveredEmail(order: OrderWithItems) {
  if (!order.customerEmail) {
    return;
  }

  try {
    await sendMail({
      to: order.customerEmail,
      subject: `Заказ №${order.orderNumber} доставлен`,
      html: orderDeliveredTemplate({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        orderUrl: buildOrderUrl(order.id),
      }),
    });
  } catch (error) {
    console.error("[SEND_ORDER_DELIVERED_EMAIL_ERROR]", error);
  }
}

/**
 * Письмо «Трек-номер обновлён» — при установке/смене трек-номера.
 */
export async function sendTrackingUpdatedEmail(order: OrderWithItems) {
  if (!order.customerEmail || !order.trackingNumber) {
    return;
  }

  try {
    await sendMail({
      to: order.customerEmail,
      subject: `Трек-номер заказа №${order.orderNumber} обновлён`,
      html: trackingUpdatedTemplate({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        trackingNumber: order.trackingNumber,
        orderUrl: buildOrderUrl(order.id),
      }),
    });
  } catch (error) {
    console.error("[SEND_TRACKING_UPDATED_EMAIL_ERROR]", error);
  }
}
