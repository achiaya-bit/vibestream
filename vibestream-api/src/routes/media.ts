import { Router } from "express";
import { pipeline } from "node:stream/promises";
import { getObjectStream } from "../storage/minio.js";
import { coversBucket, songsBucket } from "../utils/uploads.js";
import { normalizeAudioKey, normalizeCoverKey } from "../utils/storage-keys.js";

const router = Router();

function isObjectNotFound(err: unknown): boolean {
  const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
  const code = err && typeof err === "object" && "Code" in err ? String((err as { Code: string }).Code) : "";
  return name === "NoSuchKey" || name === "NotFound" || code === "NoSuchKey" || code === "NotFound";
}

async function serveObject(
  bucket: string,
  key: string,
  res: import("express").Response,
  defaultContentType: string,
) {
  const range = typeof res.req.headers.range === "string" ? res.req.headers.range : undefined;
  const { body, contentType, contentLength, contentRange, statusCode } = await getObjectStream(
    bucket,
    key,
    range,
  );

  res.status(statusCode);
  res.setHeader("Content-Type", contentType ?? defaultContentType);
  res.setHeader("Accept-Ranges", "bytes");
  if (contentLength !== undefined) res.setHeader("Content-Length", contentLength);
  if (contentRange) res.setHeader("Content-Range", contentRange);

  await pipeline(body, res);
}

router.get("/covers/:key", async (req, res, next) => {
  try {
    const key = normalizeCoverKey(decodeURIComponent(req.params.key));
    await serveObject(coversBucket(), key, res, "image/jpeg");
  } catch (e) {
    if (isObjectNotFound(e)) return res.status(404).json({ error: "Cover not found" });
    next(e);
  }
});

router.get("/songs/:key", async (req, res, next) => {
  try {
    const key = normalizeAudioKey(decodeURIComponent(req.params.key));
    await serveObject(songsBucket(), key, res, "audio/mpeg");
  } catch (e) {
    if (isObjectNotFound(e)) return res.status(404).json({ error: "Audio not found" });
    next(e);
  }
});

export default router;
