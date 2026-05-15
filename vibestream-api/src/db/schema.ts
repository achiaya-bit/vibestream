import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const artists = pgTable("artists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  followers: integer("followers").notNull(),
  monthlyListeners: integer("monthly_listeners").notNull(),
  bio: text("bio").notNull(),
});

export const songs = pgTable("songs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  artistId: text("artist_id")
    .notNull()
    .references(() => artists.id),
  album: text("album").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  cover: text("cover").notNull(),
  genre: text("genre").notNull(),
  plays: integer("plays").notNull().default(0),
  audioPath: text("audio_path"),
  coverImagePath: text("cover_image_path"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
});

export const playlists = pgTable("playlists", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cover: text("cover").notNull(),
  curator: text("curator").notNull(),
  createdBy: text("created_by").references(() => users.id),
});

export const playlistSongs = pgTable(
  "playlist_songs",
  {
    playlistId: text("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    songId: text("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (t) => [primaryKey({ columns: [t.playlistId, t.songId] })],
);
