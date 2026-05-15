import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  MoreHorizontal,
  Music2,
  Network,
  Upload,
  Users,
} from "lucide-react";
import { Cover } from "@/components/cover";
import { PageLoader } from "@/components/page-loader";
import { UploadMusicDialog } from "@/components/upload-music-dialog";
import { formatPlays } from "@/lib/format";
import { adminStatsQuery, artistsQuery, songsQuery } from "@/hooks/queries";

export const Route = createFileRoute("/_shell/admin")({
  head: () => ({ meta: [{ title: "Admin — VibeStream" }] }),
  component: Admin,
});

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div
          className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accent} grid place-items-center shadow-glow`}
        >
          <Icon size={18} className="text-white" />
        </div>
        <MoreHorizontal size={16} className="text-muted-foreground" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-display font-bold mt-1">{value}</p>
      <p className="text-xs text-[var(--neon-cyan)] mt-1">{hint}</p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  color,
  points,
}: {
  title: string;
  value: string;
  color: string;
  points: number[];
}) {
  const max = Math.max(...points);
  const w = 100 / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * w} ${100 - (p / max) * 80}`)
    .join(" ");
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        <p className="text-2xl font-display font-bold">{value}</p>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24 mt-3">
        <defs>
          <linearGradient id={`g-${title}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L 100 100 L 0 100 Z`} fill={`url(#g-${title})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function Admin() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const statsQ = useQuery(adminStatsQuery);
  const songsQ = useQuery(songsQuery());
  const artistsQ = useQuery(artistsQuery);

  if (statsQ.isLoading || songsQ.isLoading) return <PageLoader label="Loading admin data…" />;
  if (statsQ.isError) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Admin API unavailable. Sign in as{" "}
        <code className="text-[var(--neon-cyan)]">admin@vibestream.dev</code>.
      </p>
    );
  }

  const stats = statsQ.data as {
    totalTracks: number;
    activeUsers: number;
    streamsPerHour: number;
    storageUsedBytes: number;
    storageTotalBytes: number;
    totalPlays: number;
  };
  const songs = songsQ.data ?? [];
  const artists = artistsQ.data ?? [];
  const storagePct = Math.round((stats.storageUsedBytes / stats.storageTotalBytes) * 100);

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Admin Console</p>
          <h1 className="text-4xl font-display font-bold mt-1">Operations dashboard</h1>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-gradient-hero shadow-glow font-semibold hover:scale-[1.02] transition"
        >
          <Upload size={16} /> Upload music
        </button>
      </div>

      <UploadMusicDialog open={uploadOpen} onOpenChange={setUploadOpen} artists={artists} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat
          icon={Music2}
          label="Total tracks"
          value={String(stats.totalTracks)}
          hint={`${formatPlays(stats.totalPlays)} plays`}
          accent="from-purple-500 to-cyan-400"
        />
        <Stat
          icon={Users}
          label="Active users"
          value={String(stats.activeUsers)}
          hint="registered"
          accent="from-pink-500 to-purple-600"
        />
        <Stat
          icon={Activity}
          label="Streams / hr"
          value={formatPlays(stats.streamsPerHour)}
          hint="estimated"
          accent="from-emerald-400 to-cyan-500"
        />
        <Stat
          icon={HardDrive}
          label="Storage"
          value={`${storagePct}%`}
          hint="uploads"
          accent="from-orange-400 to-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="CPU"
          value="42%"
          color="oklch(0.68 0.27 295)"
          points={[20, 30, 28, 45, 38, 52, 40, 55, 42]}
        />
        <MetricCard
          title="Memory"
          value="61%"
          color="oklch(0.82 0.18 200)"
          points={[40, 42, 55, 50, 58, 60, 62, 59, 61]}
        />
        <MetricCard
          title="Network"
          value="1.2 Gbps"
          color="oklch(0.72 0.25 340)"
          points={[30, 55, 40, 70, 65, 80, 72, 90, 82]}
        />
        <MetricCard
          title="Storage I/O"
          value="312 MB/s"
          color="oklch(0.78 0.18 200)"
          points={[10, 20, 18, 35, 30, 40, 38, 55, 48]}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold">Manage songs</h2>
            <button className="text-sm text-[var(--neon-cyan)]">View all</button>
          </div>
          <div className="space-y-2 max-h-96 overflow-auto scrollbar-thin">
            {songs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                <Cover gradient={s.cover} coverUrl={s.coverUrl} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.artist} · {s.album}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {formatPlays(s.plays)} plays
                </span>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold mb-4">Storage usage</h2>
            <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-hero rounded-full"
                style={{ width: `${storagePct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{(stats.storageUsedBytes / 1e9).toFixed(2)} GB used</span>
              <span>{(stats.storageTotalBytes / 1e12).toFixed(0)} TB total</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold mb-4">Top artists</h2>
            <div className="space-y-3">
              {artists.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${a.image}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPlays(a.monthlyListeners)} listeners
                    </p>
                  </div>
                  <Cpu size={14} className="text-[var(--neon-cyan)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
