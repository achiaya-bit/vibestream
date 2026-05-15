import fs from "node:fs";
import path from "node:path";
import { Router, type NextFunction, type Request, type Response } from "express";
import { count, desc, eq, sql } from "drizzle-orm";
import multer from "multer";
import { parseFile } from "music-metadata";
import { z } from "zod";
import { config } from "../config.js";
import { cover } from "../db/seed-data.js";
import { db, schema } from "../db/index.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { toSongDto, toUserDto } from "../services/mappers.js";
import { newId } from "../utils/format.js";
import { ensureUploadDirs, uploadsStorageBytes } from "../utils/uploads.js";

const { artists, songs, users } = schema;

const router = Router();
router.use(requireAuth, requireAdmin);

ensureUploadDirs();

const ALLOWED_AUDIO = new Set(["audio/mpeg", "audio/mp3"]);
const ALLOWED_IMAGES = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeExt(original: string, fallback: string) {
  const ext = path.extname(original).toLowerCase();
  return ext || fallback;
}

const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: (_req, file, cb) => {
      ensureUploadDirs();
      cb(null, file.fieldname === "audio" ? config.audioDir : config.coversDir);
    },
    filename: (_req, file, cb) => {
      if (file.fieldname === "audio") {
        cb(null, `${newId("track")}${safeExt(file.originalname, ".mp3")}`);
      } else {
        cb(null, `${newId("cover")}${safeExt(file.originalname, ".jpg")}`);
      }
    },
  }),
  limits: { fileSize: config.maxAudioBytes },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "audio") {
      if (!ALLOWED_AUDIO.has(file.mimetype) && !file.originalname.toLowerCase().endsWith(".mp3")) {
        return cb(new Error("Only MP3 audio files are allowed"));
      }
      return cb(null, true);
    }
    if (file.fieldname === "cover") {
      if (!ALLOWED_IMAGES.has(file.mimetype)) {
        return cb(new Error("Cover must be JPEG, PNG, or WebP"));
      }
      return cb(null, true);
    }
    cb(new Error("Unexpected upload field"));
  },
}).fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

const uploadBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  artistId: z.string().trim().min(1),
  album: z.string().trim().min(1).max(200),
  genre: z.string().trim().min(1).max(80),
});

async function readAudioDurationSeconds(filePath: string) {
  try {
    const meta = await parseFile(filePath);
    const seconds = meta.format.duration;
    if (seconds && Number.isFinite(seconds) && seconds > 0) {
      return Math.round(seconds);
    }
  } catch {
    /* use fallback */
  }
  return 180;
}

function cleanupFiles(files: Express.Multer.File[]) {
  for (const f of files) {
    if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
  }
}

async function handleUpload(req: Request, res: Response, next: NextFunction) {
  const files = req.files as { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] } | undefined;
  const audioFile = files?.audio?.[0];
  const coverFile = files?.cover?.[0];
  const uploaded = [audioFile, coverFile].filter(Boolean) as Express.Multer.File[];

  try {
    if (!audioFile) {
      cleanupFiles(uploaded);
      return res.status(400).json({ error: "MP3 audio file is required" });
    }
    if (!coverFile) {
      cleanupFiles(uploaded);
      return res.status(400).json({ error: "Cover image is required" });
    }

    if (coverFile.size > config.maxCoverBytes) {
      cleanupFiles(uploaded);
      return res.status(400).json({ error: "Cover image must be 5 MB or smaller" });
    }

    const body = uploadBodySchema.parse(req.body);
    const [artist] = await db.select().from(artists).where(eq(artists.id, body.artistId)).limit(1);
    if (!artist) {
      cleanupFiles(uploaded);
      return res.status(400).json({ error: "Unknown artist" });
    }

    const audioRelative = path.join("audio", audioFile.filename).replace(/\\/g, "/");
    const coverRelative = path.join("covers", coverFile.filename).replace(/\\/g, "/");
    const durationSeconds = await readAudioDurationSeconds(audioFile.path);
    const uploadedAt = new Date();
    const id = newId("s");

    const [song] = await db
      .insert(songs)
      .values({
        id,
        title: body.title,
        artistId: body.artistId,
        album: body.album,
        durationSeconds,
        cover: cover(Math.floor(Math.random() * 8)),
        genre: body.genre,
        plays: 0,
        audioPath: audioRelative,
        coverImagePath: coverRelative,
        uploadedAt,
      })
      .returning();

    res.status(201).json(toSongDto({ ...song, artistName: artist.name }));
  } catch (e) {
    cleanupFiles(uploaded);
    next(e);
  }
}

router.get("/stats", async (_req, res, next) => {
  try {
    const [songCount] = await db.select({ value: count() }).from(songs);
    const [userCount] = await db.select({ value: count() }).from(users);
    const [artistCount] = await db.select({ value: count() }).from(artists);
    const [playsSum] = await db.select({ value: sql<number>`coalesce(sum(${songs.plays}), 0)` }).from(songs);

    res.json({
      totalTracks: songCount.value,
      activeUsers: userCount.value,
      totalArtists: artistCount.value,
      totalPlays: playsSum.value,
      streamsPerHour: Math.round(playsSum.value / 168),
      storageUsedBytes: uploadsStorageBytes(),
      storageTotalBytes: 10 * 1024 ** 4,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/users", async (_req, res, next) => {
  try {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(rows.map((u) => toUserDto(u)));
  } catch (e) {
    next(e);
  }
});

function uploadHandler(req: Request, res: Response, next: NextFunction) {
  uploadMiddleware(req, res, (err) => {
    const files = req.files as { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] } | undefined;
    const uploaded = [files?.audio?.[0], files?.cover?.[0]].filter(Boolean) as Express.Multer.File[];

    if (err) {
      cleanupFiles(uploaded);
      if (err instanceof multer.MulterError) {
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? `Audio file exceeds ${config.maxAudioBytes / (1024 * 1024)} MB limit`
            : err.message;
        return res.status(400).json({ error: message });
      }
      return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
    }

    void handleUpload(req, res, next);
  });
}

router.post("/upload", uploadHandler);
router.post("/songs", uploadHandler);

export default router;
