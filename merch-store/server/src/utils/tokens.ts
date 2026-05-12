import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";

export type JwtUserPayload = {
  userId: string;
  role: string;
};

const accessOptions: SignOptions = {
  expiresIn: env.accessExpiresIn as SignOptions["expiresIn"],
};

const refreshOptions: SignOptions = {
  expiresIn: `${env.refreshExpiresInDays}d` as SignOptions["expiresIn"],
};

export function createAccessToken(payload: JwtUserPayload) {
  return jwt.sign(payload, env.accessSecret, accessOptions);
}

export function createRefreshToken(payload: JwtUserPayload) {
  return jwt.sign(payload, env.refreshSecret, refreshOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.accessSecret) as JwtUserPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.refreshSecret) as JwtUserPayload;
}