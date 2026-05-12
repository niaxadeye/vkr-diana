import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import {
  collectionQuerySchema,
  createCollectionSchema,
  updateCollectionSchema,
} from "./collection.schemas";
import { collectionService } from "./collection.service";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const collectionController = {
  async getCollections(req: Request, res: Response) {
    const parsed = collectionQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return fail(res, 400, "VALIDATION_ERROR", "Некорректные параметры");
    }

    const result = await collectionService.getCollections({
      ...parsed.data,
      isActive: parsed.data.isActive ?? true,
    });

    return success(res, result.items, result.meta);
  },

  async getCollectionBySlug(req: Request, res: Response) {
    const slug = getParam(req.params.slug);

    if (!slug) {
      return fail(res, 400, "BAD_REQUEST", "Slug коллекции не передан");
    }

    const collection = await collectionService.getCollectionBySlug(slug);

    if (!collection || !collection.isActive) {
      return fail(res, 404, "COLLECTION_NOT_FOUND", "Коллекция не найдена");
    }

    return success(res, collection);
  },

  async getAdminCollections(req: Request, res: Response) {
    const parsed = collectionQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return fail(res, 400, "VALIDATION_ERROR", "Некорректные параметры");
    }

    const result = await collectionService.getCollections(parsed.data);

    return success(res, result.items, result.meta);
  },

  async getAdminCollectionById(req: Request, res: Response) {
    const id = getParam(req.params.id);

    if (!id) {
      return fail(res, 400, "BAD_REQUEST", "ID коллекции не передан");
    }

    const collection = await collectionService.getAdminCollectionById(id);

    if (!collection) {
      return fail(res, 404, "COLLECTION_NOT_FOUND", "Коллекция не найдена");
    }

    return success(res, collection);
  },

  async createCollection(req: Request, res: Response) {
    const parsed = createCollectionSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные коллекции",
        parsed.error.issues,
      );
    }

    try {
      const collection = await collectionService.createCollection(parsed.data);
      return success(res, collection);
    } catch (error) {
      console.error("CREATE_COLLECTION_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось создать коллекцию");
    }
  },

  async updateCollection(req: Request, res: Response) {
    const id = getParam(req.params.id);

    if (!id) {
      return fail(res, 400, "BAD_REQUEST", "ID коллекции не передан");
    }

    const parsed = updateCollectionSchema.safeParse(req.body);

    if (!parsed.success) {
      return fail(
        res,
        400,
        "VALIDATION_ERROR",
        "Некорректные данные коллекции",
        parsed.error.issues,
      );
    }

    try {
      const collection = await collectionService.updateCollection(id, parsed.data);
      return success(res, collection);
    } catch (error) {
      console.error("UPDATE_COLLECTION_ERROR:", error);
      return fail(res, 500, "SERVER_ERROR", "Не удалось обновить коллекцию");
    }
  },

  async deleteCollection(req: Request, res: Response) {
    const id = getParam(req.params.id);

    if (!id) {
      return fail(res, 400, "BAD_REQUEST", "ID коллекции не передан");
    }

    try {
      const collection = await collectionService.deleteCollection(id);
      return success(res, collection);
    } catch {
      return fail(res, 500, "SERVER_ERROR", "Не удалось удалить коллекцию");
    }
  },
};