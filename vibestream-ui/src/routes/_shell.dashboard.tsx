import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Play } from "lucide-react";
import { Cover } from "@/components/cover";
import { SongCard } from "@/components/song-card";
import { PlaylistCard } from "@/components/playlist-card";
import { PageLoader } from "@/components/page-loader";
import { formatPlays } from "@/lib/format";
import { useAuth } from "@/context/auth-context";
import { usePlayer } from "@/context/player-context";
import { artistsQuery, playlistsQuery, songsQuery } from "@/hooks/queries";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VibeStream" }] }),
  component: Dashboard,
});

function Section({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-2xl font-display font-bold">{title}</h2>
        {action && <button className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">{action} <ChevronRight size={14} /></button>}
      </div>
      {children}
    </section>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { play } = usePlayer();
  const songsQ = useQuery(songsQuery());
  const playlistsQ = useQuery(playlistsQuery);
  const artistsQ = useQuery(artistsQuery);

  const isLoading = songsQ.isLoading || playlistsQ.isLoading || artistsQ.isLoading;
  const isError = songsQ.isError || playlistsQ.isError || artistsQ.isError;
  const songs = songsQ.data ?? [];
  const playlists = playlistsQ.data ?? [];
  const artists = artistsQ.data ?? [];

  if (isLoading) return <PageLoader label="Loading your dashboard…" />;
  if (isError) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Unable to reach the API. Start the backend with <code className="text-[var(--neon-cyan)]">npm run dev</code> in vibestream-api.
      </p>
    );
  }

  const name = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="animate-fade-up">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl glass-strong p-6 md:p-10 mb-10">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--neon-purple)]/30 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--neon-cyan)]/20 blur-[100px]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Good evening, {name}</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-display font-bold">Pick up where you <span className="text-gradient">left off</span></h1>
            <p className="mt-3 text-muted-foreground max-w-xl">Your queue, recommendations and trending tracks — all curated for tonight.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {songs[0] && (
                <button onClick={() => play(songs[0], songs)} className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-gradient-hero shadow-glow font-semibold hover:scale-[1.02] transition">
                  <Play size={16} fill="currentColor" /> Play recommended mix
                </button>
              )}
              <Link to="/songs" className="inline-flex items-center gap-2 h-11 px-5 rounded-full glass font-semibold">Browse catalog</Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-3 w-fit">
            {songs.slice(0, 6).map((s, i) => (
              <div key={s.id} className="animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                <Cover gradient={s.cover} coverUrl={s.coverUrl} size="xs" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <Section title="Recently played" action="See all">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {playlists.slice(0, 8).map((p) => (
            <Link key={p.id} to="/playlist/$id" params={{ id: p.id }} className="group glass rounded-xl flex items-center gap-3 pr-4 overflow-hidden hover:bg-white/10 transition">
              <div className={`h-16 w-16 bg-gradient-to-br ${p.cover} shrink-0`} />
              <span className="font-semibold truncate">{p.title}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Trending now" action="View charts">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {songs.slice(0, 6).map((s) => <SongCard key={s.id} song={s} queue={songs} />)}
        </div>
      </Section>

      <Section title="Made for you" action="See all">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
        </div>
      </Section>

      <Section title="Popular artists" action="Discover more">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {artists.map((a) => (
            <Link key={a.id} to="/artist/$id" params={{ id: a.id }} className="group glass rounded-2xl p-4 text-center hover:bg-white/10 transition">
              <div className={`mx-auto h-32 w-32 rounded-full bg-gradient-to-br ${a.image} shadow-glow group-hover:scale-105 transition`} />
              <h3 className="mt-4 font-semibold truncate">{a.name}</h3>
              <p className="text-xs text-muted-foreground">{formatPlays(a.followers)} followers</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Continue listening">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {songs.slice(6, 12).map((s) => <SongCard key={s.id} song={s} queue={songs} />)}
        </div>
      </Section>
    </div>
  );
}
