import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/index.js";

const { playlistSongs, playlists } = schema;
import { requireAuth } from "../middleware/auth.js";
import { toPlaylistDto } from "../services/mappers.js";
import { newId } from "../utils/format.js";
import { cover } from "../db/seed-data.js";

const router = Router();

async function loadPlaylist(id: string) {
  const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id)).limit(1);
  if (!playlist) return null;
  const links = await db
    .select()
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, id))
    .orderBy(asc(playlistSongs.position));
  return toPlaylistDto(
    playlist,
    links.map((l) => l.songId),
  );
}

router.get("/", async (_req, res, next) => {
  try {
    const all = await db.select().from(playlists).orderBy(asc(playlists.title));
    const result = await Promise.all(all.map((p) => loadPlaylist(p.id)));
    res.json(result.filter(Boolean));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const playlist = await loadPlaylist(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlist);
  } catch (e) {
    next(e);
  }
});

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const id = newId("p");
    const [playlist] = await db
      .insert(playlists)
      .values({
        id,
        title: body.title,
        description: body.description ?? "",
        cover: cover(Math.floor(Math.random() * 8)),
        curator: req.user!.name,
        createdBy: req.user!.id,
      })
      .returning();

    res.status(201).json(toPlaylistDto(playlist, []));
  } catch (e) {
    next(e);
  }
});

export default router;
