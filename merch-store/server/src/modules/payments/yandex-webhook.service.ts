import crypto from "crypto";
import jwt from "jsonwebtoken";

import { env } from "../../config/env";

export type YandexWebhookEvent =
  | "ORDER_STATUS_UPDATED"
  | "OPERATION_STATUS_UPDATED"
  | "TRANSACTION_STATUS_UPDATE"
  | "SUBSCRIPTION_STATUS_UPDATED"
  | string;

export type YandexWebhookPayload = {
  event: YandexWebhookEvent;
  eventTime?: string;
  merchantId?: string;
  order?: {
    orderId?: string;
    paymentStatus?: string;
    cartUpdated?: boolean;
  };
  operation?: {
    operationId?: string;
    operationType?: string;
    status?: string;
    orderId?: string;
  };
};

export class YandexWebhookError extends Error {
  constructor(
    message: string,
    readonly reasonCode: string,
    readonly statusCode = 400,
  ) {
    super(message);
  }
}

type Jwk = {
  kid?: string;
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  [key: string]: unknown;
};

type JwksResponse = {
  keys: Jwk[];
};

// Небольшой кэш JWKS, чтобы не дёргать Яндекс на каждый вебхук.
let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;
const JWKS_TTL_MS = 10 * 60 * 1000;

async function fetchJwks(): Promise<Jwk[]> {
  // Date.now недоступен в некоторых окружениях сборки, но в рантайме сервера он есть.
  const now = Date.now();

  if (jwksCache && now - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys;
  }

  const response = await fetch(env.yandexPay.jwksUrl);

  if (!response.ok) {
    throw new YandexWebhookError(
      "JWKS_FETCH_FAILED",
      "UNAUTHORIZED",
    );
  }

  const body = (await response.json()) as JwksResponse;
  jwksCache = { keys: body.keys ?? [], fetchedAt: now };

  return jwksCache.keys;
}

function jwkToKeyObject(jwk: Jwk): crypto.KeyObject {
  return crypto.createPublicKey({
    key: jwk as crypto.JsonWebKeyInput["key"],
    format: "jwk",
  });
}

function decodeHeader(token: string): { kid?: string; alg?: string } {
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded === "string") {
    throw new YandexWebhookError("INVALID_TOKEN", "UNAUTHORIZED");
  }

  return decoded.header as { kid?: string; alg?: string };
}

async function verifyProduction(token: string): Promise<YandexWebhookPayload> {
  const header = decodeHeader(token);
  const keys = await fetchJwks();

  const candidates = header.kid
    ? keys.filter((key) => key.kid === header.kid)
    : keys;

  if (candidates.length === 0) {
    throw new YandexWebhookError("SIGNING_KEY_NOT_FOUND", "UNAUTHORIZED");
  }

  for (const jwk of candidates) {
    try {
      const keyObject = jwkToKeyObject(jwk);
      const payload = jwt.verify(token, keyObject, {
        algorithms: ["ES256"],
      });

      return payload as YandexWebhookPayload;
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        (error instanceof Error && error.name === "TokenExpiredError")
      ) {
        throw new YandexWebhookError("TOKEN_EXPIRED", "TOKEN_EXPIRED");
      }
      // пробуем следующий ключ
    }
  }

  throw new YandexWebhookError("SIGNATURE_VERIFICATION_FAILED", "UNAUTHORIZED");
}

function decodeSandbox(token: string): YandexWebhookPayload {
  // В sandbox-режиме подпись не проверяем строго — только декодируем тело,
  // чтобы можно было локально тестировать без боевых ключей Яндекса.
  const payload = jwt.decode(token);

  if (!payload || typeof payload === "string") {
    throw new YandexWebhookError("INVALID_TOKEN", "UNAUTHORIZED");
  }

  return payload as YandexWebhookPayload;
}

async function verifyAndDecode(rawBody: Buffer): Promise<YandexWebhookPayload> {
  const token = rawBody.toString("utf8").trim();

  if (!token) {
    throw new YandexWebhookError("EMPTY_BODY", "UNAUTHORIZED");
  }

  if (env.yandexPay.signatureMode === "production") {
    return verifyProduction(token);
  }

  return decodeSandbox(token);
}

export const yandexWebhookService = {
  verifyAndDecode,
};
