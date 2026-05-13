import multer from "multer";
import path from "path";

import {
  createUniqueFileName,
  type UploadFolder,
} from "../modules/uploads/upload.service.js";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const allowedHomeHeroMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "video/webm",
  "video/mp4",
];

function createStorage(folder: UploadFolder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.resolve(process.cwd(), "uploads", folder));
    },
    filename: (_req, file, cb) => {
      cb(null, createUniqueFileName(file.originalname));
    },
  });
}

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error("INVALID_FILE_TYPE"));
    return;
  }

  cb(null, true);
}

function homeHeroFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!allowedHomeHeroMimeTypes.includes(file.mimetype)) {
    cb(new Error("INVALID_HOME_HERO_FILE_TYPE"));
    return;
  }

  cb(null, true);
}

export function createUploadMiddleware(folder: UploadFolder) {
  return multer({
    storage: createStorage(folder),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
}

export function createHomeHeroUploadMiddleware() {
  return multer({
    storage: createStorage("home"),
    fileFilter: homeHeroFileFilter,
    limits: {
      fileSize: 80 * 1024 * 1024,
    },
  });
}