export type Song = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  duration: string;
  cover: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
  genre: string;
  plays: number;
  uploadedAt?: string | null;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  cover: string;
  songCount: number;
  curator: string;
  songs: string[];
};

export type Artist = {
  id: string;
  name: string;
  image: string;
  followers: number;
  monthlyListeners: number;
  bio: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type ArtistDetail = Artist & {
  topTracks?: Song[];
};

export const genres = ["All", "Electronic", "Synthwave", "Ambient", "Indie Pop"];
