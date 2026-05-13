import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response";
import { getUploadUrl, type UploadFolder } from "./upload.service";

function handleUpload(req: Request, res: Response, folder: UploadFolder) {
  if (!req.file) {
    return fail(res, 400, "NO_FILE", "Файл не передан");
  }

  const url = getUploadUrl(folder, req.file.filename);

  return success(res, {
    url,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
}

export const uploadController = {
  uploadProductImage(req: Request, res: Response) {
    return handleUpload(req, res, "products");
  },

  uploadCollectionImage(req: Request, res: Response) {
    return handleUpload(req, res, "collections");
  },
  uploadHomeHeroMedia(req: Request, res: Response) {
    return handleUpload(req, res, "home");
  },
};