import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import { updateHomeHeroSchema } from "./home.schemas";
import { homeService } from "./home.service";

export const homeController = {
  async getHero(_req: Request, res: Response) {
    try {
      const hero = await homeService.getHero();

      return success(res, hero);
    } catch (error) {
      console.error("GET_HOME_HERO_ERROR:", error);

      return fail(
        res,
        500,
        "SERVER_ERROR",
        "Не удалось получить hero-блок",
      );
    }
  },

  async getAdminHero(_req: Request, res: Response) {
    try {
      const hero = await homeService.getHero();

      return success(res, hero);
    } catch (error) {
      console.error("GET_ADMIN_HOME_HERO_ERROR:", error);

      return fail(
        res,
        500,
        "SERVER_ERROR",
        "Не удалось получить hero-блок",
      );
    }
  },

  async updateAdminHero(req: Request, res: Response) {
    const parsedBody = updateHomeHeroSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные hero-блока",
        parsedBody.error.issues,
      );
    }

    try {
      const hero = await homeService.updateHero(parsedBody.data);

      return success(res, hero);
    } catch (error) {
      console.error("UPDATE_HOME_HERO_ERROR:", error);

      return fail(
        res,
        500,
        "SERVER_ERROR",
        "Не удалось обновить hero-блок",
      );
    }
  },
};