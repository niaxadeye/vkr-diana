import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { recommendedProductsController } from "./recommended-products.controller";

export const recommendedProductsRouter = Router();

recommendedProductsRouter.get(
  "/recommended-products",
  recommendedProductsController.getPublicRecommendedProducts,
);

recommendedProductsRouter.get(
  "/admin/recommended-products",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  recommendedProductsController.getAdminRecommendedProducts,
);

recommendedProductsRouter.post(
  "/admin/recommended-products",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  recommendedProductsController.addRecommendedProduct,
);

recommendedProductsRouter.patch(
  "/admin/recommended-products/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  recommendedProductsController.updateRecommendedProduct,
);

recommendedProductsRouter.delete(
  "/admin/recommended-products/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  recommendedProductsController.deleteRecommendedProduct,
);