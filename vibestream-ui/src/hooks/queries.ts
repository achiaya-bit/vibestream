import { queryOptions } from "@tanstack/react-query";
import { adminApi, artistsApi, authApi, playlistsApi, songsApi } from "@/services/api";
import type { Artist, ArtistDetail, Playlist, Song, User } from "@/lib/types";

export const queryKeys = {
  songs: (params?: Record<string, string>) => ["songs", params ?? {}] as const,
  song: (id: string) => ["songs", id] as const,
  playlists: ["playlists"] as const,
  playlist: (id: string) => ["playlists", id] as const,
  artists: ["artists"] as const,
  artist: (id: string) => ["artists", id] as const,
  me: ["auth", "me"] as const,
  adminStats: ["admin", "stats"] as const,
  adminUsers: ["admin", "users"] as const,
};

export const songsQuery = (params?: Record<string, string>) =>
  queryOptions({
    queryKey: queryKeys.songs(params),
    queryFn: async () => (await songsApi.list(params)).data as Song[],
  });

export const songQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.song(id),
    queryFn: async () => (await songsApi.get(id)).data as Song,
    enabled: !!id,
  });

export const playlistsQuery = queryOptions({
  queryKey: queryKeys.playlists,
  queryFn: async () => (await playlistsApi.list()).data as Playlist[],
});

export const playlistQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.playlist(id),
    queryFn: async () => (await playlistsApi.get(id)).data as Playlist,
    enabled: !!id,
  });

export const artistsQuery = queryOptions({
  queryKey: queryKeys.artists,
  queryFn: async () => (await artistsApi.list()).data as Artist[],
});

export const artistQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.artist(id),
    queryFn: async () => (await artistsApi.get(id)).data as ArtistDetail,
    enabled: !!id,
  });

export const meQuery = queryOptions({
  queryKey: queryKeys.me,
  queryFn: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vibestream_token") : null;
    if (!token) return null;
    const { data } = await authApi.me();
    return (data as { user: User }).user;
  },
  retry: false,
});

export const adminStatsQuery = queryOptions({
  queryKey: queryKeys.adminStats,
  queryFn: async () => (await adminApi.stats()).data,
});

export const adminUsersQuery = queryOptions({
  queryKey: queryKeys.adminUsers,
  queryFn: async () => (await adminApi.users()).data as User[],
});
