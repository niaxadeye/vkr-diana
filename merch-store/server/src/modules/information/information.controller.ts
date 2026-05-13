import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import {
  informationSlugSchema,
  updateInformationPageSchema,
} from "./information.schemas";
import { informationService } from "./information.service";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const informationController = {
  async getInformationPages(_req: Request, res: Response) {
    try {
      const pages = await informationService.getPublicPages();
      return success(res, pages);
    } catch (error) {
      console.error("GET_INFORMATION_PAGES_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось получить информационные страницы");
    }
  },

  async getInformationPageBySlug(req: Request, res: Response) {
    const rawSlug = getParam(req.params.slug);
    const parsedSlug = informationSlugSchema.safeParse(rawSlug);

    if (!parsedSlug.success) {
      return fail(res, 400, "BAD_REQUEST", "Некорректная вкладка информационной страницы");
    }

    try {
      const page = await informationService.getPublicPageBySlug(parsedSlug.data);

      if (!page || !page.isActive) {
        return fail(res, 404, "INFORMATION_PAGE_NOT_FOUND", "Информационная страница не найдена");
      }

      return success(res, page);
    } catch (error) {
      console.error("GET_INFORMATION_PAGE_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось получить информационную страницу");
    }
  },

  async getAdminInformationPages(_req: Request, res: Response) {
    try {
      const pages = await informationService.getAdminPages();
      return success(res, pages);
    } catch (error) {
      console.error("GET_ADMIN_INFORMATION_PAGES_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось получить информационные страницы");
    }
  },

  async getAdminInformationPageBySlug(req: Request, res: Response) {
    const rawSlug = getParam(req.params.slug);
    const parsedSlug = informationSlugSchema.safeParse(rawSlug);

    if (!parsedSlug.success) {
      return fail(res, 400, "BAD_REQUEST", "Некорректная вкладка информационной страницы");
    }

    try {
      const page = await informationService.getAdminPageBySlug(parsedSlug.data);

      if (!page) {
        return fail(res, 404, "INFORMATION_PAGE_NOT_FOUND", "Информационная страница не найдена");
      }

      return success(res, page);
    } catch (error) {
      console.error("GET_ADMIN_INFORMATION_PAGE_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось получить информационную страницу");
    }
  },

  async updateAdminInformationPage(req: Request, res: Response) {
    const rawSlug = getParam(req.params.slug);
    const parsedSlug = informationSlugSchema.safeParse(rawSlug);

    if (!parsedSlug.success) {
      return fail(res, 400, "BAD_REQUEST", "Некорректная вкладка информационной страницы");
    }

    const parsedBody = updateInformationPageSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные информационной страницы",
        parsedBody.error.issues,
      );
    }

    try {
      const page = await informationService.updatePageBySlug(parsedSlug.data, parsedBody.data);
      return success(res, page);
    } catch (error) {
      console.error("UPDATE_INFORMATION_PAGE_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось обновить информационную страницу");
    }
  },
};