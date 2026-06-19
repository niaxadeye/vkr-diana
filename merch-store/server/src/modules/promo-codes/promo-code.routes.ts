import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { promoCodeController } from "./promo-code.controller";

export const promoCodeRouter = Router();

// Публичная проверка промокода (для корзины).
promoCodeRouter.post("/promo-codes/validate", promoCodeController.validate);

// Админский CRUD.
promoCodeRouter.get(
  "/admin/promo-codes",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  promoCodeController.getAdminPromoCodes,
);

promoCodeRouter.get(
  "/admin/promo-codes/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  promoCodeController.getAdminPromoCodeById,
);

promoCodeRouter.post(
  "/admin/promo-codes",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  promoCodeController.createPromoCode,
);

promoCodeRouter.patch(
  "/admin/promo-codes/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  promoCodeController.updatePromoCode,
);

promoCodeRouter.delete(
  "/admin/promo-codes/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  promoCodeController.deletePromoCode,
);
