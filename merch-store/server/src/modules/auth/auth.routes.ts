import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authMiddleware, authController.me);

authRouter.get("/verify-email", authController.verifyEmail);

authRouter.post(
  "/resend-verification",
  authMiddleware,
  authController.resendVerification,
);

authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);