import fs from "fs";
import path from "path";
import crypto from "crypto";

export type UploadFolder = "products" | "collections";

export function ensureUploadFolders() {
  const folders: UploadFolder[] = ["products", "collections"];

  folders.forEach((folder) => {
    const dir = path.resolve(process.cwd(), "uploads", folder);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

export function createUniqueFileName(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const id = crypto.randomUUID();

  return `${id}${ext}`;
}

export function getUploadUrl(folder: UploadFolder, filename: string) {
  return `/uploads/${folder}/${filename}`;
}