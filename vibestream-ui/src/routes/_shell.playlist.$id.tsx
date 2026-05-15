import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Heart, Play, Shuffle } from "lucide-react";
import { useMemo } from "react";
import { Cover } from "@/components/cover";
import type { Song } from "@/lib/types";
import { PageLoader } from "@/components/page-loader";
import { usePlayer } from "@/context/player-context";
import { playlistQuery, songsQuery } from "@/hooks/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/playlist/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Playlist — VibeStream` },
      { name: "description", content: `Playlist ${params.id} on VibeStream` },
    ],
  }),
  component: PlaylistPage,
});

function PlaylistPage() {
  const { id } = Route.useParams();
  const { data: playlist, isLoading, isError } = useQuery(playlistQuery(id));
  const { data: allSongs = [] } = useQuery(songsQuery());
  const { play, current, isPlaying, toggleLike, liked } = usePlayer();

  const tracks = useMemo(() => {
    if (!playlist) return [] as Song[];
    return playlist.songs
      .map((sid) => allSongs.find((s) => s.id === sid))
      .filter((s): s is Song => !!s);
  }, [playlist, allSongs]);

  if (isLoading) return <PageLoader label="Loading playlist…" />;
  if (isError || !playlist) throw notFound();

  return (
    <div className="animate-fade-up">
      <div className="relative overflow-hidden rounded-3xl glass-strong p-6 md:p-10 mb-8">
        <div
          className={cn("absolute inset-0 bg-gradient-to-br opacity-30 blur-2xl", playlist.cover)}
        />
        <div className="relative flex flex-col md:flex-row gap-8 items-end">
          <Cover gradient={playlist.cover} size="xl" />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Playlist</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold mt-2">{playlist.title}</h1>
            <p className="mt-3 text-muted-foreground max-w-xl">{playlist.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              By {playlist.curator} · {tracks.length} tracks
            </p>
            <div className="mt-5 flex gap-3">
              {tracks[0] && (
                <button
                  onClick={() => play(tracks[0]!, tracks)}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-hero shadow-glow font-semibold hover:scale-[1.02] transition"
                >
                  <Play size={16} fill="currentColor" /> Play all
                </button>
              )}
              <button
                className="h-12 w-12 rounded-full glass grid place-items-center"
                aria-label="Shuffle"
              >
                <Shuffle size={16} />
              </button>
              <button
                className="h-12 w-12 rounded-full glass grid place-items-center"
                aria-label="Like"
              >
                <Heart size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left text-xs uppercase tracking-wider border-b border-white/5">
            <tr>
              <th className="p-4 w-10">#</th>
              <th>Title</th>
              <th className="hidden md:table-cell">Album</th>
              <th className="w-10"></th>
              <th className="text-right pr-4">
                <Clock size={14} className="inline" />
              </th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((s, i) => {
              if (!s) return null;
              const active = current?.id === s.id;
              const isLiked = liked.has(s.id);
              return (
                <tr
                  key={s.id}
                  onClick={() => play(s, tracks)}
                  className={cn(
                    "border-t border-white/5 hover:bg-white/5 cursor-pointer",
                    active && "bg-white/10",
                  )}
                >
                  <td className="p-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Cover gradient={s.cover} coverUrl={s.coverUrl} size="xs" />
                      <div>
                        <p
                          className={cn(
                            "font-semibold",
                            active && isPlaying && "text-[var(--neon-cyan)]",
                          )}
                        >
                          {s.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{s.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell text-muted-foreground">{s.album}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(s.id);
                      }}
                      className="text-muted-foreground hover:text-[var(--neon-pink)]"
                    >
                      <Heart
                        size={14}
                        className={cn(isLiked && "fill-[var(--neon-pink)] text-[var(--neon-pink)]")}
                      />
                    </button>
                  </td>
                  <td className="text-right pr-4 text-muted-foreground tabular-nums">
                    {s.duration}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
