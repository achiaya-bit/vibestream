import bcrypt from "bcryptjs";
import { db, schema } from "./index.js";
import { seedArtists, seedPlaylists, seedSongs } from "./seed-data.js";
import { parseDuration } from "../utils/format.js";

const { artists, playlistSongs, playlists, songs, users } = schema;

async function seed() {
  const existing = await db.select({ id: songs.id }).from(songs).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  const adminHash = await bcrypt.hash("admin123", 10);
  const demoHash = await bcrypt.hash("demo1234", 10);

  await db.insert(users).values([
    {
      id: "u_admin",
      name: "Admin",
      email: "admin@vibestream.dev",
      passwordHash: adminHash,
      role: "admin",
    },
    {
      id: "u_demo",
      name: "Demo User",
      email: "demo@vibestream.dev",
      passwordHash: demoHash,
      role: "user",
    },
  ]);

  await db.insert(artists).values(seedArtists);

  await db.insert(songs).values(
    seedSongs.map((s) => ({
      id: s.id,
      title: s.title,
      artistId: s.artistId,
      album: s.album,
      durationSeconds: parseDuration(s.duration),
      cover: s.cover,
      genre: s.genre,
      plays: s.plays,
    })),
  );

  await db.insert(playlists).values(
    seedPlaylists.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      cover: p.cover,
      curator: p.curator,
    })),
  );

  await db.insert(playlistSongs).values(
    seedPlaylists.flatMap((p) =>
      p.songs.map((songId, position) => ({
        playlistId: p.id,
        songId,
        position,
      })),
    ),
  );

  console.log("Seed complete.");
  console.log("  admin@vibestream.dev / admin123");
  console.log("  demo@vibestream.dev / demo1234");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
