import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { informationController } from "./information.controller";

export const informationRouter = Router();

informationRouter.get("/information", informationController.getInformationPages);
informationRouter.get("/information/:slug", informationController.getInformationPageBySlug);

informationRouter.get(
  "/admin/information",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  informationController.getAdminInformationPages,
);

informationRouter.get(
  "/admin/information/:slug",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  informationController.getAdminInformationPageBySlug,
);

informationRouter.patch(
  "/admin/information/:slug",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  informationController.updateAdminInformationPage,
);