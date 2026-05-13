import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { homeController } from "./home.controller";

export const homeRouter = Router();

homeRouter.get("/home/hero", homeController.getHero);

homeRouter.get(
  "/admin/home/hero",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  homeController.getAdminHero,
);

homeRouter.patch(
  "/admin/home/hero",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  homeController.updateAdminHero,
);