import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { productController } from "./product.controller";

export const productRouter = Router();

productRouter.get("/products", productController.getProducts);
productRouter.get("/products/:slug", productController.getProductBySlug);

productRouter.get(
  "/admin/products",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  productController.getAdminProducts,
);

productRouter.post(
  "/admin/products",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  productController.createProduct,
);

productRouter.patch(
  "/admin/products/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  productController.updateProduct,
);

productRouter.delete(
  "/admin/products/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  productController.deleteProduct,
);

productRouter.get(
  "/admin/products/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  productController.getAdminProductById,
);