import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Play, UserPlus } from "lucide-react";
import { Cover } from "@/components/cover";
import { SongCard } from "@/components/song-card";
import { PageLoader } from "@/components/page-loader";
import { formatPlays } from "@/lib/format";
import type { Song } from "@/lib/types";
import { usePlayer } from "@/context/player-context";
import { artistQuery } from "@/hooks/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/artist/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Artist — VibeStream` },
      { name: "description", content: `Artist ${params.id}` },
    ],
  }),
  component: ArtistPage,
});

function ArtistPage() {
  const { id } = Route.useParams();
  const { data: artist, isLoading, isError } = useQuery(artistQuery(id));
  const { play, current, isPlaying } = usePlayer();

  if (isLoading) return <PageLoader label="Loading artist…" />;
  if (isError || !artist) throw notFound();

  const top = (artist.topTracks ?? []) as Song[];
  const albums = Array.from(new Set(top.map((s) => s.album)));

  return (
    <div className="animate-fade-up">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-3xl mb-8 -mt-6 -mx-4 md:-mx-8"
      >
        <div className={cn("h-72 bg-gradient-to-br animate-gradient-x", artist.image)} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex items-end gap-6">
          <div
            className={cn(
              "h-32 w-32 md:h-48 md:w-48 rounded-full bg-gradient-to-br shadow-glow border-4 border-background",
              artist.image,
            )}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-[var(--neon-cyan)]">
              <CheckCircle2 size={14} /> Verified Artist
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mt-1">{artist.name}</h1>
            <p className="mt-2 text-muted-foreground">
              {formatPlays(artist.monthlyListeners)} monthly listeners ·{" "}
              {formatPlays(artist.followers)} followers
            </p>
          </div>
        </div>
      </motion.div>

      <p className="text-muted-foreground max-w-2xl mb-6">{artist.bio}</p>
      <div className="flex gap-3 mb-10">
        {top[0] && (
          <button
            onClick={() => play(top[0], top)}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-hero shadow-glow font-semibold"
          >
            <Play size={16} fill="currentColor" /> Play
          </button>
        )}
        <button className="inline-flex items-center gap-2 h-12 px-6 rounded-full glass font-semibold">
          <UserPlus size={16} /> Follow
        </button>
      </div>

      <h2 className="text-2xl font-display font-bold mb-4">Top tracks</h2>
      <div className="glass rounded-2xl overflow-hidden mb-10">
        <table className="w-full text-sm">
          <tbody>
            {top.map((s, i) => {
              const active = current?.id === s.id;
              return (
                <tr
                  key={s.id}
                  onClick={() => play(s, top)}
                  className={cn(
                    "border-t border-white/5 first:border-0 hover:bg-white/5 cursor-pointer",
                    active && "bg-white/10",
                  )}
                >
                  <td className="p-3 w-10 text-muted-foreground">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Cover gradient={s.cover} coverUrl={s.coverUrl} size="xs" />
                      <span
                        className={cn(
                          "font-semibold",
                          active && isPlaying && "text-[var(--neon-cyan)]",
                        )}
                      >
                        {s.title}
                      </span>
                    </div>
                  </td>
                  <td className="text-muted-foreground hidden md:table-cell">
                    {formatPlays(s.plays)} plays
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

      <h2 className="text-2xl font-display font-bold mb-4">Albums</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {albums.map((alb) => {
          const albSongs = top.filter((s) => s.album === alb);
          return (
            <div key={alb} className="glass rounded-2xl p-4">
              <Cover gradient={albSongs[0]?.cover ?? artist.image} size="full" />
              <h3 className="mt-3 font-semibold">{alb}</h3>
              <p className="text-xs text-muted-foreground">{albSongs.length} tracks</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-display font-bold mb-4">More from {artist.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {top.slice(0, 4).map((s) => (
          <SongCard key={s.id} song={s} queue={top} />
        ))}
      </div>
    </div>
  );
}
