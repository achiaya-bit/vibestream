import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

export function ensureUploadDirs() {
  for (const dir of [config.uploadDir, config.audioDir, config.coversDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

export function publicUploadUrl(relativePath: string | null | undefined) {
  if (!relativePath) return null;
  return `/uploads/${relativePath.replace(/\\/g, "/")}`;
}

export function resolveUploadPath(relativePath: string) {
  return path.join(config.uploadDir, relativePath);
}

export function deleteUploadFile(relativePath: string | null | undefined) {
  if (!relativePath) return;
  const full = resolveUploadPath(relativePath);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

export function dirSizeBytes(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += dirSizeBytes(full);
    else total += fs.statSync(full).size;
  }
  return total;
}

export function uploadsStorageBytes() {
  return dirSizeBytes(config.uploadDir);
}
