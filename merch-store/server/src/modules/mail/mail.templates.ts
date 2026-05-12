function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function baseTemplate(content: string) {
  return `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Acrylogo</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#111111;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px;border-bottom:1px solid #eeeeee;">
                    <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em;">Acrylogo</div>
                    <div style="margin-top:6px;font-size:14px;color:#777777;">Акриловые изделия с логотипами команд</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px;background:#111111;color:#ffffff;font-size:13px;line-height:1.5;">
                    Это автоматическое письмо от Acrylogo. Если вы получили его по ошибке, просто проигнорируйте сообщение.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function button(label: string, href: string) {
  return `
    <a href="${href}" 
       style="display:inline-block;margin-top:18px;padding:14px 22px;background:#111111;color:#ffffff;text-decoration:none;border-radius:999px;font-size:15px;font-weight:600;">
      ${label}
    </a>
  `;
}

type EmailVerificationTemplateInput = {
  name?: string | null;
  verifyUrl: string;
};

export function emailVerificationTemplate({
  name,
  verifyUrl,
}: EmailVerificationTemplateInput) {
  const safeName = name ? escapeHtml(name) : "Здравствуйте";

  return baseTemplate(`
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;">Подтверждение регистрации</h1>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">
      ${safeName}, спасибо за регистрацию на сайте Acrylogo.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.6;">
      Чтобы подтвердить адрес электронной почты, нажмите на кнопку ниже.
    </p>
    ${button("Подтвердить email", verifyUrl)}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#777777;">
      Если кнопка не открывается, скопируйте ссылку в браузер:<br />
      <span style="word-break:break-all;">${escapeHtml(verifyUrl)}</span>
    </p>
  `);
}

type PasswordResetTemplateInput = {
  name?: string | null;
  resetUrl: string;
};

export function passwordResetTemplate({
  name,
  resetUrl,
}: PasswordResetTemplateInput) {
  const safeName = name ? escapeHtml(name) : "Здравствуйте";

  return baseTemplate(`
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;">Восстановление пароля</h1>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">
      ${safeName}, мы получили запрос на восстановление пароля.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.6;">
      Чтобы задать новый пароль, нажмите на кнопку ниже.
    </p>
    ${button("Восстановить пароль", resetUrl)}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#777777;">
      Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
    </p>
    <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#777777;">
      Ссылка действует ограниченное время.
    </p>
  `);
}

type OrderEmailItem = {
  title: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type OrderCreatedTemplateInput = {
  orderNumber: number;
  customerName: string;
  total: number;
  items: OrderEmailItem[];
  deliveryAddress: string;
  orderUrl?: string;
};

export function orderCreatedTemplate({
  orderNumber,
  customerName,
  total,
  items,
  deliveryAddress,
  orderUrl,
}: OrderCreatedTemplateInput) {
  const itemsHtml = items
    .map((item) => {
      const details = [item.size, item.color].filter(Boolean).join(" / ");

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eeeeee;">
            <div style="font-size:15px;font-weight:600;">${escapeHtml(item.title)}</div>
            ${
              details
                ? `<div style="margin-top:4px;font-size:13px;color:#777777;">${escapeHtml(details)}</div>`
                : ""
            }
          </td>
          <td align="center" style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;">
            ${item.quantity}
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;">
            ${formatPrice(item.totalPrice)}
          </td>
        </tr>
      `;
    })
    .join("");

  return baseTemplate(`
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;">Заказ №${orderNumber} создан</h1>
    <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">
      ${escapeHtml(customerName)}, ваш заказ успешно создан. Мы получили данные заказа и скоро приступим к обработке.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
      <tr>
        <th align="left" style="padding:0 0 10px;font-size:13px;color:#777777;">Товар</th>
        <th align="center" style="padding:0 0 10px;font-size:13px;color:#777777;">Кол-во</th>
        <th align="right" style="padding:0 0 10px;font-size:13px;color:#777777;">Сумма</th>
      </tr>
      ${itemsHtml}
    </table>

    <p style="margin:20px 0 0;font-size:18px;font-weight:700;">
      Итого: ${formatPrice(total)}
    </p>

    <p style="margin:22px 0 0;font-size:15px;line-height:1.6;">
      <strong>Адрес доставки:</strong><br />
      ${escapeHtml(deliveryAddress)}
    </p>

    ${orderUrl ? button("Открыть заказ", orderUrl) : ""}
  `);
}

type OrderShippedTemplateInput = {
  orderNumber: number;
  customerName: string;
  trackingNumber?: string | null;
  orderUrl?: string;
};

export function orderShippedTemplate({
  orderNumber,
  customerName,
  trackingNumber,
  orderUrl,
}: OrderShippedTemplateInput) {
  return baseTemplate(`
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;">Заказ №${orderNumber} отправлен</h1>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
      ${escapeHtml(customerName)}, ваш заказ передан в доставку.
    </p>
    ${
      trackingNumber
        ? `<p style="margin:0;font-size:16px;line-height:1.6;"><strong>Трек-номер:</strong> ${escapeHtml(trackingNumber)}</p>`
        : `<p style="margin:0;font-size:16px;line-height:1.6;">Трек-номер пока не указан.</p>`
    }
    ${orderUrl ? button("Открыть заказ", orderUrl) : ""}
  `);
}

type TrackingUpdatedTemplateInput = {
  orderNumber: number;
  customerName: string;
  trackingNumber: string;
  orderUrl?: string;
};

export function trackingUpdatedTemplate({
  orderNumber,
  customerName,
  trackingNumber,
  orderUrl,
}: TrackingUpdatedTemplateInput) {
  return baseTemplate(`
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;">Трек-номер заказа №${orderNumber} обновлён</h1>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
      ${escapeHtml(customerName)}, по вашему заказу обновлена информация о доставке.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.6;">
      <strong>Новый трек-номер:</strong> ${escapeHtml(trackingNumber)}
    </p>
    ${orderUrl ? button("Открыть заказ", orderUrl) : ""}
  `);
}

type OrderDeliveredTemplateInput = {
  orderNumber: number;
  customerName: string;
  orderUrl?: string;
};

export function orderDeliveredTemplate({
  orderNumber,
  customerName,
  orderUrl,
}: OrderDeliveredTemplateInput) {
  return baseTemplate(`
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;">Заказ №${orderNumber} доставлен</h1>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
      ${escapeHtml(customerName)}, заказ отмечен как доставленный.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.6;">
      Спасибо, что выбрали Acrylogo.
    </p>
    ${orderUrl ? button("Открыть заказ", orderUrl) : ""}
  `);
}