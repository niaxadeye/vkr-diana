import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { collectionController } from "./collection.controller";

export const collectionRouter = Router();

collectionRouter.get("/collections", collectionController.getCollections);
collectionRouter.get("/collections/:slug", collectionController.getCollectionBySlug);

collectionRouter.get(
  "/admin/collections",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  collectionController.getAdminCollections,
);

collectionRouter.get(
  "/admin/collections/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  collectionController.getAdminCollectionById,
);

collectionRouter.post(
  "/admin/collections",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  collectionController.createCollection,
);

collectionRouter.patch(
  "/admin/collections/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  collectionController.updateCollection,
);

collectionRouter.delete(
  "/admin/collections/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  collectionController.deleteCollection,
);