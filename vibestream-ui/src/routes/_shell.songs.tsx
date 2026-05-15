import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Grid3x3, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SongCard } from "@/components/song-card";
import { Cover } from "@/components/cover";
import { PageLoader } from "@/components/page-loader";
import { genres } from "@/lib/types";
import { usePlayer } from "@/context/player-context";
import { songsQuery } from "@/hooks/queries";
import { cn } from "@/lib/utils";

type SongsSearch = {
  q?: string;
  genre?: string;
};

export const Route = createFileRoute("/_shell/songs")({
  validateSearch: (search: Record<string, unknown>): SongsSearch => {
    const result: SongsSearch = {};
    if (typeof search.q === "string") result.q = search.q;
    if (typeof search.genre === "string") result.genre = search.genre;
    return result;
  },
  head: () => ({ meta: [{ title: "Catalog — VibeStream" }] }),
  component: Songs,
});

function Songs() {
  const search = Route.useSearch();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState(search.q ?? "");
  const [genre, setGenre] = useState(search.genre ?? "All");
  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (genre !== "All") p.genre = genre;
    if (q.trim()) p.q = q.trim();
    return p;
  }, [genre, q]);

  const { data: songs = [], isLoading, isError } = useQuery(songsQuery(params));
  const { play, current, isPlaying } = usePlayer();

  if (isLoading) return <PageLoader label="Loading catalog…" />;
  if (isError) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Unable to load songs. Is the API running on port 3001?
      </p>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-display font-bold">Songs catalog</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search songs or artists"
              className="h-10 pl-9 pr-4 rounded-full bg-white/5 border border-white/10 focus:border-[var(--neon-cyan)] focus:outline-none text-sm w-72"
            />
          </div>
          <div className="flex glass rounded-full p-1">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "h-8 w-8 rounded-full grid place-items-center",
                view === "grid" && "bg-white/15",
              )}
              aria-label="Grid"
            >
              <Grid3x3 size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "h-8 w-8 rounded-full grid place-items-center",
                view === "list" && "bg-white/15",
              )}
              aria-label="List"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={cn(
              "h-8 px-4 rounded-full text-sm transition",
              genre === g
                ? "bg-gradient-hero shadow-glow font-semibold"
                : "glass hover:bg-white/10",
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {songs.map((s) => (
            <SongCard key={s.id} song={s} queue={songs} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 w-10">#</th>
                <th>Title</th>
                <th className="hidden md:table-cell">Album</th>
                <th className="hidden md:table-cell">Genre</th>
                <th className="text-right pr-4">Duration</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((s, i) => {
                const active = current?.id === s.id;
                return (
                  <tr
                    key={s.id}
                    onClick={() => play(s, songs)}
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
                    <td className="hidden md:table-cell text-muted-foreground">{s.genre}</td>
                    <td className="text-right pr-4 text-muted-foreground tabular-nums">
                      {s.duration}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
