import type { NextFunction, Request, Response } from "express";

import { fail } from "../utils/api-response";

export function roleMiddleware(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return fail(res, 401, "UNAUTHORIZED", "Не авторизован");
    }

    if (!roles.includes(req.user.role)) {
      return fail(res, 403, "FORBIDDEN", "Недостаточно прав");
    }

    next();
  };
}