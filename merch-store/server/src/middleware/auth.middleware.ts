import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/tokens";
import { fail } from "../utils/api-response";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return fail(res, 401, "UNAUTHORIZED", "Не авторизован");
  }

  const token = header.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    return fail(res, 401, "INVALID_TOKEN", "Недействительный access token");
  }
}