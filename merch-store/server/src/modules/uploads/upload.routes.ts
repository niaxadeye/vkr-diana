import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { uploadController } from "./upload.controller";
import { createUploadMiddleware } from "../../middleware/upload.middleware";

export const uploadRouter = Router();

uploadRouter.post(
  "/admin/uploads/product-image",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  createUploadMiddleware("products").single("file"),
  uploadController.uploadProductImage,
);

uploadRouter.post(
  "/admin/uploads/collection-image",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  createUploadMiddleware("collections").single("file"),
  uploadController.uploadCollectionImage,
);