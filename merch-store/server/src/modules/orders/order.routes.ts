import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { orderController } from "./order.controller";

export const orderRouter = Router();

orderRouter.get(
    "/admin/orders",
    authMiddleware,
    roleMiddleware(["ADMIN", "MANAGER"]),
    orderController.getAdminOrders,
);

orderRouter.get(
    "/admin/orders/:id",
    authMiddleware,
    roleMiddleware(["ADMIN", "MANAGER"]),
    orderController.getAdminOrderById,
);

orderRouter.patch(
    "/admin/orders/:id/status",
    authMiddleware,
    roleMiddleware(["ADMIN", "MANAGER"]),
    orderController.updateOrderStatus,
);

orderRouter.patch(
    "/admin/orders/:id/payment-status",
    authMiddleware,
    roleMiddleware(["ADMIN", "MANAGER"]),
    orderController.updatePaymentStatus,
);

orderRouter.post(
    "/orders",
    authMiddleware,
    orderController.createOrder,
);

orderRouter.get(
    "/orders/my",
    authMiddleware,
    orderController.getMyOrders,
);

orderRouter.get(
    "/orders/:id",
    authMiddleware,
    orderController.getOrderById,
);