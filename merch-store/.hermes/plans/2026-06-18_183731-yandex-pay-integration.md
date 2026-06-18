# Yandex Pay Integration Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Подключить оплату через Яндекс Пэй в существующий checkout интернет-магазина, не ломая текущий процесс создания заказов, резервирования остатков и админского управления заказами.

**Architecture:** Интеграция должна жить в серверной части: фронтенд не должен знать Merchant API-ключ. На фронте кнопка оплаты на странице корзины вызывает backend endpoint, backend создает локальный заказ, создает заказ в Yandex Pay API, возвращает `paymentUrl`, а фронтенд перенаправляет пользователя/SDK на оплату. Финальный источник истины по оплате — webhook Яндекс Пэй и/или ручная проверка статуса заказа через Yandex Pay API.

**Tech Stack:** React/Vite client, Express/TypeScript server, Prisma/MariaDB, Yandex Pay Web SDK v4, Yandex Pay Merchant API sandbox.

---

## 1. Контекст проекта

Проект находится в:

```text
C:\Users\Erick\Documents\vkr-diana\merch-store
```

Структура релевантных частей:

```text
client/src/pages/cart/CartPage.tsx
client/src/entities/order/api/order.api.ts
client/src/entities/order/model/order.types.ts
server/src/modules/orders/order.routes.ts
server/src/modules/orders/order.controller.ts
server/src/modules/orders/order.service.ts
server/src/modules/orders/order.schemas.ts
server/src/prisma/prisma.ts
server/prisma/schema.prisma
server/src/config/env.ts
server/src/app.ts
```

Сейчас кнопка в `CartPage.tsx` делает только:

1. `POST /api/orders`
2. локальный заказ создается в БД;
3. товары резервируются через `reservedStock`;
4. корзина очищается;
5. пользователь видит «Заказ оформлен».

Фактической оплаты пока нет. Поле `Order.paymentStatus` уже есть и принимает:

```prisma
PENDING
PAID
FAILED
REFUNDED
```

Это хорошо ложится на Yandex Pay:

```text
Yandex PENDING  -> local PENDING
Yandex CAPTURED -> local PAID
Yandex FAILED   -> local FAILED
Yandex REFUNDED -> local REFUNDED
```

---

## 2. Что говорит документация Яндекс Пэй

Источник: <https://pay.yandex.ru/docs/ru/custom/integration-guide>

Для нашей задачи нужен сценарий полной оплаты интернет-магазина:

1. Фронтенд показывает кнопку Яндекс Пэй / обычную кнопку оплаты.
2. После клика фронтенд вызывает backend магазина.
3. Backend магазина создает локальный заказ.
4. Backend магазина вызывает Yandex Pay API:

```http
POST https://sandbox.pay.yandex.ru/api/merchant/v1/orders
Authorization: Api-Key <Merchant API key>
Content-Type: application/json
```

Production endpoint:

```http
POST https://pay.yandex.ru/api/merchant/v1/orders
```

5. Yandex возвращает `paymentUrl`.
6. Пользователь переходит на `paymentUrl` и оплачивает.
7. Yandex отправляет webhook на backend магазина:

```text
/v1/webhook
```

Callback URL в личном кабинете нужно указывать без `/v1/webhook`, потому что Яндекс добавляет этот путь сам.

Webhook приходит как JWT в теле запроса с `Content-Type: application/octet-stream`. Его нужно проверять через JWK:

```text
Sandbox:    https://sandbox.pay.yandex.ru/api/jwks
Production: https://pay.yandex.ru/api/jwks
```

Yandex Pay Web SDK подключается с:

```html
<script src="https://pay.yandex.ru/sdk/v1/pay.js" async></script>
```

В SDK для sandbox используется:

```js
YaPay.PaymentEnv.Sandbox
```

---

## 3. Где именно внедрять оплату

### Backend — основное место интеграции

Создать новый модуль:

```text
server/src/modules/payments/
├── payments.routes.ts
├── payments.controller.ts
├── payments.schemas.ts
├── yandex-pay.service.ts
├── yandex-pay.types.ts
└── yandex-pay-webhook.service.ts
```

Почему отдельный модуль, а не всё внутри `orders`:

- `orders` уже отвечает за бизнес-логику заказов и резервы;
- Yandex Pay — внешний провайдер оплаты;
- потом будет проще добавить возвраты, ручную проверку статуса, YooKassa/другого провайдера или оплату при получении.

### Existing order module

Изменить `server/src/modules/orders/order.service.ts` минимально:

- оставить `createOrder` как доменную операцию создания локального заказа;
- добавить метод получения заказа по id для payment module, если нужно;
- добавить безопасные методы обновления payment status от провайдера;
- переиспользовать текущую логику освобождения резерва при отмене.

### Frontend

Основная точка внедрения:

```text
client/src/pages/cart/CartPage.tsx
```

Сейчас там находится финальная кнопка:

```tsx
<button onClick={handleSubmitOrder}>Оплатить ...</button>
```

На первом этапе проще заменить поведение `handleSubmitOrder`:

1. собрать тот же payload заказа;
2. вызвать новый endpoint `POST /api/payments/yandex/create`;
3. получить `paymentUrl`;
4. сделать `window.location.href = paymentUrl`.

Позже можно заменить обычную кнопку на Yandex Pay Web SDK button/widget.

---

## 4. Рекомендуемый порядок внедрения

### Этап 1. Минимальная серверная интеграция без Web SDK

**Цель:** получить работающий redirect flow через обычную кнопку `Оплатить`.

Пользователь нажимает текущую кнопку → backend создает заказ в БД → backend создает заказ в Яндекс Пэй → frontend открывает `paymentUrl`.

Плюсы:

- меньше фронтенд-рисков;
- проще отладить Merchant API;
- проще сохранить текущий UX корзины;
- SDK можно добавить вторым шагом.

### Этап 2. Webhook для статусов оплаты

**Цель:** после оплаты автоматически обновлять `paymentStatus` в локальном заказе.

Webhook обрабатывает события:

```text
ORDER_STATUS_UPDATED
```

И маппит:

```text
CAPTURED -> PAID
FAILED   -> FAILED
REFUNDED -> REFUNDED
```

При `FAILED` нужно решить, что делать с резервом товара:

- либо автоматически отменять заказ и освобождать резерв;
- либо оставить заказ `CREATED/PENDING`, чтобы менеджер обработал вручную.

Для текущего магазина логичнее автоматически:

```text
paymentStatus = FAILED
status = CANCELLED
reservedStock уменьшается обратно
```

Но это нужно сделать аккуратно через существующую логику `updateOrderStatus(..., "CANCELLED")`.

### Этап 3. Страница результата оплаты

Добавить страницы:

```text
client/src/pages/payment/PaymentSuccessPage.tsx
client/src/pages/payment/PaymentErrorPage.tsx
client/src/pages/payment/PaymentAbortPage.tsx
```

И роуты:

```text
/payment/success?orderId=...
/payment/error?orderId=...
/payment/abort?orderId=...
```

Важно: эти страницы не должны сами считать заказ оплаченным. Они только показывают пользователю промежуточное состояние и могут запросить `GET /api/orders/:id`. Истина — webhook или server-side status check.

### Этап 4. Web SDK button/widget

После того как redirect flow работает, можно улучшить UX:

- подключить SDK в `client/index.html` или отдельным loader-компонентом;
- создать `YandexPayButton` компонент;
- в `onPayButtonClick` вызывать backend endpoint и возвращать `paymentUrl`;
- передавать в SDK `merchantId`, `totalAmount`, `availablePaymentMethods`.

---

## 5. Переменные окружения

### Server `.env`

Добавить в `server/.env`:

```dotenv
YANDEX_PAY_ENV=sandbox
YANDEX_PAY_API_BASE_URL=https://sandbox.pay.yandex.ru/api/merchant/v1
YANDEX_PAY_JWKS_URL=https://sandbox.pay.yandex.ru/api/jwks
YANDEX_PAY_MERCHANT_ID=<merchant-id>
YANDEX_PAY_API_KEY=<test-merchant-api-key-from-chat>
YANDEX_PAY_REDIRECT_BASE_URL=http://localhost:5173
YANDEX_PAY_WEBHOOK_MERCHANT_ID=<merchant-id>
```

Не сохранять реальный ключ в git. Для тестового ключа, который уже передан в чате, использовать его локально в `.env`, но не коммитить.

### Client `.env`

Если добавляем Web SDK, фронту нужен только публичный merchant id и env, не API key:

```dotenv
VITE_YANDEX_PAY_ENV=sandbox
VITE_YANDEX_PAY_MERCHANT_ID=<merchant-id>
```

Открытый вопрос: в sandbox по документации API-ключом используется Merchant ID магазина. Нужно подтвердить, что переданный UUID — одновременно sandbox `merchantId`, который можно отдавать в Web SDK. Если это именно Merchant API-key, но не Merchant ID, нужен отдельный Merchant ID из кабинета.

---

## 6. Изменения в базе данных

В `server/prisma/schema.prisma` расширить `Order` минимальными полями:

```prisma
model Order {
  // existing fields...

  paymentProvider       PaymentProvider @default(MANUAL)
  yandexPayOrderId      String?         @unique
  yandexPayPaymentUrl   String?         @db.Text
  yandexPayPaymentStatus String?
  paymentFailureCode    String?
  paymentExpiresAt      DateTime?
}

enum PaymentProvider {
  MANUAL
  YANDEX_PAY
}
```

Вариант попроще: не заводить `PaymentProvider`, а добавить только nullable-поля `yandexPay*`. Но enum полезен для админки и будущих способов оплаты.

Миграция:

```bash
cd server
npx prisma migrate dev --name add_yandex_pay_fields
npx prisma generate
```

Для production потом использовать:

```bash
npx prisma migrate deploy
```

---

## 7. Backend endpoint'ы

### Create payment

Добавить endpoint:

```http
POST /api/payments/yandex/create
Authorization: Bearer <accessToken>
```

Тело запроса на первом этапе можно сделать таким же, как `CreateOrderPayload`:

```ts
createYandexPaymentSchema = createOrderSchema
```

Ответ:

```ts
{
  success: true,
  data: {
    order: Order,
    paymentUrl: string
  }
}
```

Логика:

1. Валидировать payload.
2. Создать локальный заказ через `orderService.createOrder`.
3. Сформировать body для Yandex:

```ts
{
  orderId: order.id,
  currencyCode: "RUB",
  availablePaymentMethods: ["CARD"],
  preferredPaymentMethod: "FULLPAYMENT",
  orderSource: "WEBSITE",
  billingPhone: order.customerPhone,
  fiscalContact: order.customerEmail ?? order.customerPhone,
  ttl: 1800,
  purpose: `Оплата заказа #${order.orderNumber}`,
  redirectUrls: {
    onSuccess: `${redirectBaseUrl}/payment/success?orderId=${order.id}`,
    onError: `${redirectBaseUrl}/payment/error?orderId=${order.id}`,
    onAbort: `${redirectBaseUrl}/payment/abort?orderId=${order.id}`
  },
  cart: {
    externalId: order.id,
    items: [
      // товары заказа + доставка отдельной строкой
    ],
    total: {
      amount: formatRub(order.total)
    }
  }
}
```

4. Важно: доставка по документации должна передаваться в `cart.items` отдельным товаром.
5. Вызвать Yandex Pay API.
6. Сохранить `paymentUrl`, `yandexPayOrderId = order.id`, `paymentProvider = YANDEX_PAY`, `paymentExpiresAt`.
7. Вернуть `paymentUrl` на фронт.

Если Yandex API вернул ошибку после локального создания заказа:

1. пометить `paymentStatus = FAILED`;
2. перевести заказ в `CANCELLED` через существующую логику, чтобы освободить `reservedStock`;
3. вернуть клиенту понятную ошибку.

### Webhook

Яндекс автоматически вызывает:

```http
POST /v1/webhook
Content-Type: application/octet-stream
```

В текущем Express-приложении все API живут под `/api`, но для Yandex лучше добавить отдельный путь ровно `/v1/webhook`, потому что Яндекс сам добавляет `/v1/webhook` к Callback URL.

В `server/src/app.ts`:

```ts
app.use("/v1", yandexPayWebhookRouter);
```

Для webhook нужен raw body parser до `express.json()` или отдельный route-level parser:

```ts
express.raw({ type: "application/octet-stream" })
```

Ответ при успехе:

```json
{"status":"success"}
```

---

## 8. Файлы и задачи

### Task 1: Добавить env config для Yandex Pay

**Files:**

- Modify: `server/src/config/env.ts`

Добавить чтение:

```ts
yandexPay: {
  env: process.env.YANDEX_PAY_ENV ?? "sandbox",
  apiBaseUrl: process.env.YANDEX_PAY_API_BASE_URL ?? "https://sandbox.pay.yandex.ru/api/merchant/v1",
  jwksUrl: process.env.YANDEX_PAY_JWKS_URL ?? "https://sandbox.pay.yandex.ru/api/jwks",
  merchantId: required("YANDEX_PAY_MERCHANT_ID"),
  apiKey: required("YANDEX_PAY_API_KEY"),
  redirectBaseUrl: required("YANDEX_PAY_REDIRECT_BASE_URL"),
}
```

**Validation:**

```bash
cd server
npm run build
```

---

### Task 2: Расширить Prisma Order

**Files:**

- Modify: `server/prisma/schema.prisma`
- Generated: new migration in `server/prisma/migrations/...`

Добавить поля оплаты, описанные в разделе 6.

**Validation:**

```bash
cd server
npx prisma validate
npx prisma migrate dev --name add_yandex_pay_fields
npx prisma generate
npm run build
```

---

### Task 3: Добавить Yandex Pay service

**Files:**

- Create: `server/src/modules/payments/yandex-pay.types.ts`
- Create: `server/src/modules/payments/yandex-pay.service.ts`

Service должен содержать:

```ts
createYandexPayOrder(order: OrderWithItems): Promise<{ paymentUrl: string }>
getYandexPayOrder(orderId: string): Promise<YandexPayOrderResponse>
```

Особенности:

- `Authorization: Api-Key ${env.yandexPay.apiKey}`;
- суммы форматировать как строку с двумя знаками: `123.00`;
- цены в проекте сейчас хранятся как целые рубли, не копейки;
- доставку добавлять отдельной позицией в `cart.items`;
- `cart.total.amount` должен равняться сумме всех `cart.items[].total`.

**Validation:**

```bash
cd server
npm run build
```

---

### Task 4: Добавить payment controller/routes

**Files:**

- Create: `server/src/modules/payments/payments.schemas.ts`
- Create: `server/src/modules/payments/payments.controller.ts`
- Create: `server/src/modules/payments/payments.routes.ts`
- Modify: `server/src/app.ts`

Routes:

```ts
paymentsRouter.post(
  "/yandex/create",
  authMiddleware,
  paymentsController.createYandexPayment,
);
```

Mount:

```ts
app.use("/api/payments", paymentsRouter);
```

**Validation:**

```bash
cd server
npm run build
```

---

### Task 5: Добавить frontend API для payment

**Files:**

- Create: `client/src/entities/payment/api/yandexPayment.api.ts`
- Create: `client/src/entities/payment/model/payment.types.ts`

API:

```ts
export async function createYandexPayment(payload: CreateOrderPayload) {
  const response = await apiClient.post<ApiResponse<CreateYandexPaymentResponse>>(
    "/payments/yandex/create",
    payload,
  );

  return response.data.data;
}
```

**Validation:**

```bash
cd client
npm run build
```

---

### Task 6: Подключить оплату в CartPage

**Files:**

- Modify: `client/src/pages/cart/CartPage.tsx`

Изменить `handleSubmitOrder`:

1. собрать текущий `CreateOrderPayload`;
2. вызвать `createYandexPayment(payload)`;
3. не очищать корзину сразу до успешной оплаты, либо очистить только после успешного redirect/webhook flow;
4. открыть `paymentUrl`:

```ts
window.location.href = payment.paymentUrl;
```

Рекомендация: корзину очищать на странице `/payment/success` после подтверждения, а не сразу после создания платежной ссылки. Иначе при ошибке оплаты пользователь потеряет корзину.

**Validation:**

```bash
cd client
npm run build
```

---

### Task 7: Добавить страницы результата оплаты

**Files:**

- Create: `client/src/pages/payment/PaymentSuccessPage.tsx`
- Create: `client/src/pages/payment/PaymentErrorPage.tsx`
- Create: `client/src/pages/payment/PaymentAbortPage.tsx`
- Modify: `client/src/app/routes/routes.tsx`

Поведение:

- success: показать «Платеж обрабатывается / заказ создан», запросить заказ и показать payment status;
- error: «Оплата не прошла» + ссылка назад в корзину/профиль;
- abort: «Оплата отменена» + ссылка назад в корзину.

**Validation:**

```bash
cd client
npm run build
```

---

### Task 8: Реализовать webhook

**Files:**

- Create: `server/src/modules/payments/yandex-pay-webhook.service.ts`
- Create: `server/src/modules/payments/yandex-pay-webhook.routes.ts`
- Modify: `server/src/app.ts`
- Modify: `server/package.json` if JWT/JWK dependency is needed

Рекомендуемая dependency:

```bash
cd server
npm install jose
```

Почему `jose`: удобно проверять ES256 JWT через remote JWK set.

Webhook route:

```ts
webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/octet-stream" }),
  yandexPayWebhookController.handle,
);
```

Mount:

```ts
app.use("/v1", webhookRouter);
```

Логика:

1. получить raw JWT из `req.body`;
2. проверить подпись через sandbox JWK;
3. проверить `merchantId`;
4. если `event === "ORDER_STATUS_UPDATED"`, найти локальный заказ по `data.orderId`;
5. обновить payment status;
6. при `CAPTURED` поставить `paymentStatus = PAID`;
7. при `FAILED` поставить `paymentStatus = FAILED`, возможно `status = CANCELLED` с освобождением резерва;
8. ответить `{ status: "success" }`.

**Validation:**

```bash
cd server
npm run build
```

Manual webhook validation можно сделать отдельным unit/helper тестом с mock JWT позже; реальный webhook потребует публичный URL или туннель.

---

### Task 9: Добавить ручную синхронизацию статуса

**Files:**

- Modify/Create in `server/src/modules/payments/*`
- Optional Modify: `server/src/modules/orders/order.routes.ts`

Endpoint для админа или пользователя:

```http
POST /api/payments/yandex/:orderId/sync
```

Зачем:

- если webhook не дошел;
- удобно для отладки sandbox;
- удобно в админке.

Backend вызывает:

```http
GET https://sandbox.pay.yandex.ru/api/merchant/v1/orders/{order_id}
Authorization: Api-Key <key>
```

И обновляет локальный `paymentStatus`.

---

### Task 10: Web SDK button/widget, после redirect flow

**Files:**

- Modify: `client/index.html` or Create SDK loader component
- Create: `client/src/entities/payment/ui/YandexPayButton.tsx`
- Modify: `client/src/pages/cart/CartPage.tsx`
- Modify: `client/.env`

SDK payment data:

```ts
{
  env: YaPay.PaymentEnv.Sandbox,
  version: 4,
  currencyCode: YaPay.CurrencyCode.Rub,
  merchantId: import.meta.env.VITE_YANDEX_PAY_MERCHANT_ID,
  totalAmount: formatRub(total),
  availablePaymentMethods: ["CARD"]
}
```

Callback:

```ts
async function onPayButtonClick() {
  const { paymentUrl } = await createYandexPayment(payload);
  return paymentUrl;
}
```

---

## 9. Проверка после внедрения

### Backend

```bash
cd server
npx prisma validate
npx prisma generate
npm run build
```

### Frontend

```bash
cd client
npm run build
```

`npm run lint` сейчас уже падает по существующим React Hooks rules, поэтому для проверки платежной задачи сначала ориентироваться на build. Отдельной итерацией стоит починить lint.

### Manual sandbox flow

1. Запустить backend:

```bash
cd server
npm run dev
```

2. Запустить frontend:

```bash
cd client
npm run dev
```

3. Авторизоваться.
4. Добавить товар в корзину.
5. Выбрать адрес доставки.
6. Нажать оплату.
7. Убедиться, что backend вернул `paymentUrl`.
8. Убедиться, что открылась страница оплаты Яндекс.
9. После оплаты проверить заказ в профиле/админке.
10. Проверить `paymentStatus` после webhook или manual sync.

---

## 10. Риски и открытые вопросы

1. **Merchant ID vs API Key.** Для Web SDK нужен `merchantId`. Переданный UUID может быть sandbox Merchant ID/API key, но лучше подтвердить по кабинету Яндекс Пэй.
2. **Callback URL.** Для локального тестирования webhook нужен публичный URL: VPS, ngrok, localtunnel или другой туннель. Callback указывать без `/v1/webhook`.
3. **Фискализация.** Если в личном кабинете включена фискализация через Яндекс Пэй, нужно передавать `receipt` для каждого товара и доставки. Минимально для товаров: `tax`, `measure`, `paymentMethodType`, `paymentSubjectType`. Для мерча обычно `paymentSubjectType = 1` товар, `measure = 0` штуки, `tax` зависит от налогового режима.
4. **Когда очищать корзину.** Лучше не очищать корзину сразу после получения `paymentUrl`; очищать после успешной оплаты/страницы success с подтвержденным статусом.
5. **Резерв товара.** Сейчас резерв создается при создании заказа. Если пользователь не оплатит, резерв нужно освобождать по webhook `FAILED`, manual sync или cron-cleanup истекших платежей.
6. **Сплит.** Для первого этапа лучше включить только `CARD`. `SPLIT` добавить отдельно после базовой оплаты, потому что у Сплита больше требований к составу корзины и рассрочке.

---

## 11. Рекомендуемый первый инкремент

Начать не с Web SDK, а с backend redirect flow:

```text
POST /api/payments/yandex/create -> paymentUrl -> window.location.href
```

Это минимально встраивается в текущий `CartPage.tsx` и быстро покажет, работают ли sandbox Merchant API-ключ, суммы, товары и redirect URLs.

После этого вторым инкрементом добавить webhook, третьим — красивые страницы результата, четвертым — кнопку Web SDK.
