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
};