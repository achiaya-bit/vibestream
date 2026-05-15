import { Router } from "express";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { pipeline } from "node:stream/promises";
import { db, schema } from "../db/index.js";
import { getObjectStream } from "../storage/minio.js";
import { toSongDto } from "../services/mappers.js";
import { songsBucket } from "../utils/uploads.js";
import { normalizeAudioKey } from "../utils/storage-keys.js";

const { artists, songs } = schema;

const router = Router();

async function findSong(id: string) {
  const rows = await db
    .select({ song: songs, artistName: artists.name })
    .from(songs)
    .innerJoin(artists, eq(songs.artistId, artists.id))
    .where(eq(songs.id, id))
    .limit(1);
  return rows[0];
}

router.get("/", async (req, res, next) => {
  try {
    const genre = typeof req.query.genre === "string" ? req.query.genre : undefined;
    const q = typeof req.query.q === "string" ? req.query.q : undefined;

    const conditions = [];
    if (genre && genre !== "All") conditions.push(eq(songs.genre, genre));
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(
        or(ilike(songs.title, pattern), ilike(artists.name, pattern), ilike(songs.album, pattern))!,
      );
    }

    const rows = await db
      .select({ song: songs, artistName: artists.name })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(songs.title));

    res.json(rows.map(({ song, artistName }) => toSongDto({ ...song, artistName })));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const row = await findSong(req.params.id);
    if (!row) return res.status(404).json({ error: "Song not found" });
    res.json(toSongDto({ ...row.song, artistName: row.artistName }));
  } catch (e) {
    next(e);
  }
});

router.get("/:id/stream", async (req, res, next) => {
  try {
    const row = await findSong(req.params.id);
    if (!row) return res.status(404).json({ error: "Song not found" });

    await db
      .update(songs)
      .set({ plays: sql`${songs.plays} + 1` })
      .where(eq(songs.id, row.song.id));

    if (row.song.audioPath) {
      const key = normalizeAudioKey(row.song.audioPath);
      const range = typeof req.headers.range === "string" ? req.headers.range : undefined;

      try {
        const { body, contentType, contentLength, contentRange, statusCode } = await getObjectStream(
          songsBucket(),
          key,
          range,
        );

        res.status(statusCode);
        res.setHeader("Content-Type", contentType ?? "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        if (contentLength !== undefined) res.setHeader("Content-Length", contentLength);
        if (contentRange) res.setHeader("Content-Range", contentRange);

        await pipeline(body, res);
        return;
      } catch {
        /* fall through to demo stream */
      }
    }

    res.redirect(302, "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  } catch (e) {
    next(e);
  }
});

export default router;
