import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { deliveryAddressController } from "./delivery-address.controller";


export const deliveryAddressRouter = Router();

deliveryAddressRouter.get(
    "/",
    authMiddleware,
    deliveryAddressController.getMyAddresses,
);

deliveryAddressRouter.post(
    "/",
    authMiddleware,
    deliveryAddressController.createAddress,
);

deliveryAddressRouter.patch(
    "/:id",
    authMiddleware,
    deliveryAddressController.updateAddress,
);

deliveryAddressRouter.patch(
    "/:id/default",
    authMiddleware,
    deliveryAddressController.setDefaultAddress,
);

deliveryAddressRouter.delete(
    "/:id",
    authMiddleware,
    deliveryAddressController.deleteAddress,
);
