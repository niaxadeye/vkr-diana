import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  clientUrl: required("CLIENT_URL"),
  accessSecret: required("JWT_ACCESS_SECRET"),
  refreshSecret: required("JWT_REFRESH_SECRET"),
  accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  refreshExpiresInDays: Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 30),
  yandexPay: {
    apiBaseUrl:
      process.env.YANDEX_PAY_API_BASE_URL ??
      "https://sandbox.pay.yandex.ru/api/merchant/v1",
    apiKey: required("YANDEX_PAY_API_KEY"),
    redirectBaseUrl: process.env.YANDEX_PAY_REDIRECT_BASE_URL ?? required("CLIENT_URL"),

    // Webhook (server-to-server notifications)
    webhookEnabled: (process.env.YANDEX_PAY_WEBHOOK_ENABLED ?? "true") === "true",
    merchantId: process.env.YANDEX_PAY_MERCHANT_ID ?? null,
    // "sandbox" — мягкая проверка подписи (для локальной разработки),
    // "production" — обязательная проверка ES256 по публичным ключам Яндекса.
    signatureMode:
      process.env.YANDEX_PAY_WEBHOOK_SIGNATURE_MODE === "production"
        ? ("production" as const)
        : ("sandbox" as const),
    jwksUrl:
      process.env.YANDEX_PAY_JWKS_URL ??
      "https://sandbox.pay.yandex.ru/api/jwks",
    // Время жизни ссылки на оплату в секундах (совпадает с ttl в запросе createOrder).
    paymentTtlSeconds: Number(process.env.YANDEX_PAY_PAYMENT_TTL_SECONDS ?? 1800),
  },
};