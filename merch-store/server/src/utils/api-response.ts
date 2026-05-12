import type { Response } from "express";

export function success<T>(res: Response, data: T, meta?: unknown) {
  return res.json({
    success: true,
    data,
    meta: meta ?? {},
  });
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details: unknown[] = [],
) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}