import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { resolveUploadPath } from "../utils/uploads.js";

const { artists, songs } = schema;
import { toSongDto } from "../services/mappers.js";

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
      const filePath = resolveUploadPath(row.song.audioPath);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const range = req.headers.range;
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${stat.size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Type": "audio/mpeg",
          });
          return fs.createReadStream(filePath, { start, end }).pipe(res);
        }
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", stat.size);
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    // Demo fallback when no uploaded audio file exists yet
    res.redirect(302, "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  } catch (e) {
    next(e);
  }
});

export default router;
