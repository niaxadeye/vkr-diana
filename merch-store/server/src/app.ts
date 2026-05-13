import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import path from "path";

import { uploadRouter } from "./modules/uploads/upload.routes.js";
import { ensureUploadFolders } from "./modules/uploads/upload.service.js";

import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { productRouter } from "./modules/products/product.routes.js";
import { collectionRouter } from "./modules/collections/collection.routes.js";
import { deliveryAddressRouter } from "./modules/delivery-addresses/delivery-address.routes.js";
import { orderRouter } from "./modules/orders/order.routes.js";
import { cdekRouter } from "./modules/cdek/cdek.routes.js";
import { informationRouter } from "./modules/information/information.routes";
import { homeRouter } from "./modules/home/home.routes";

export const app = express();
ensureUploadFolders();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(
    cors({
        origin: env.clientUrl,
        credentials: true,
    }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());


app.use(
    "/uploads",
    express.static(path.resolve(process.cwd(), "uploads")),
);

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        data: {
            status: "ok",
        },
    });
});

app.use("/api", productRouter);
app.use("/api/auth", authRouter);
app.use("/api", collectionRouter);
app.use("/api", uploadRouter);
app.use("/api/delivery-addresses", deliveryAddressRouter);
app.use("/api", orderRouter);
app.use("/api/cdek", cdekRouter);
app.use("/api", informationRouter);
app.use("/api", homeRouter);