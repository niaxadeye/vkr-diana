import { Router } from "express";

import { cdekController } from "./cdek.controller.js";

export const cdekRouter = Router();

cdekRouter.get("/cities", cdekController.searchCities);
cdekRouter.get("/offices", cdekController.getOffices);