import { formatDuration } from "../utils/format.js";
import { publicUploadUrl } from "../utils/uploads.js";

type SongRow = {
  id: string;
  title: string;
  artistId: string;
  album: string;
  durationSeconds: number;
  cover: string;
  genre: string;
  plays: number;
  audioPath?: string | null;
  coverImagePath?: string | null;
  uploadedAt?: string | Date | null;
  artistName?: string;
};

type ArtistRow = {
  id: string;
  name: string;
  image: string;
  followers: number;
  monthlyListeners: number;
  bio: string;
};

export function toSongDto(row: SongRow) {
  const uploadedAt =
    row.uploadedAt instanceof Date
      ? row.uploadedAt.toISOString()
      : row.uploadedAt ?? null;

  return {
    id: row.id,
    title: row.title,
    artist: row.artistName ?? "",
    artistId: row.artistId,
    album: row.album,
    duration: formatDuration(row.durationSeconds),
    cover: row.cover,
    coverUrl: publicUploadUrl(row.coverImagePath),
    audioUrl: publicUploadUrl(row.audioPath),
    genre: row.genre,
    plays: row.plays,
    uploadedAt,
  };
}

export function toArtistDto(row: ArtistRow) {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    followers: row.followers,
    monthlyListeners: row.monthlyListeners,
    bio: row.bio,
  };
}

export function toPlaylistDto(
  row: { id: string; title: string; description: string; cover: string; curator: string },
  songIds: string[],
) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    cover: row.cover,
    songCount: songIds.length,
    curator: row.curator,
    songs: songIds,
  };
}

export function toUserDto(row: { id: string; name: string; email: string; role: string }) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}
