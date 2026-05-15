import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";

const { artists, songs } = schema;
import { toArtistDto, toSongDto } from "../services/mappers.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await db.select().from(artists).orderBy(asc(artists.name));
    res.json(rows.map(toArtistDto));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [artist] = await db.select().from(artists).where(eq(artists.id, req.params.id)).limit(1);
    if (!artist) return res.status(404).json({ error: "Artist not found" });

    const trackRows = await db
      .select({ song: songs, artistName: artists.name })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .where(eq(songs.artistId, artist.id))
      .orderBy(asc(songs.plays));

    res.json({
      ...toArtistDto(artist),
      topTracks: trackRows.map(({ song, artistName }) => toSongDto({ ...song, artistName })),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
