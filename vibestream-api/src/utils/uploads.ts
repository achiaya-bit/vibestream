import { config } from "../config.js";
import { normalizeAudioKey, normalizeCoverKey } from "./storage-keys.js";

export function publicCoverUrl(storedKey: string | null | undefined): string | null {
  if (!storedKey) return null;
  const key = normalizeCoverKey(storedKey);
  return `/uploads/covers/${encodeURIComponent(key)}`;
}

export function publicAudioUrl(storedKey: string | null | undefined): string | null {
  if (!storedKey) return null;
  const key = normalizeAudioKey(storedKey);
  return `/uploads/songs/${encodeURIComponent(key)}`;
}

/** @deprecated Use publicCoverUrl / publicAudioUrl */
export function publicUploadUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  if (relativePath.startsWith("covers/") || relativePath.startsWith("covers\\")) {
    return publicCoverUrl(relativePath);
  }
  if (relativePath.startsWith("audio/") || relativePath.startsWith("audio\\")) {
    return publicAudioUrl(relativePath);
  }
  return `/uploads/${relativePath.replace(/\\/g, "/")}`;
}

export function songsBucket(): string {
  return config.minio.bucketSongs;
}

export function coversBucket(): string {
  return config.minio.bucketCovers;
}
