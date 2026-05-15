import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, BarChart3, Database, Globe, HardDrive, Server, Shield } from "lucide-react";

export const Route = createFileRoute("/_shell/infrastructure")({
  head: () => ({
    meta: [
      { title: "Cloud Infrastructure — VibeStream" },
      {
        name: "description",
        content:
          "VibeStream's cloud-native architecture: Nginx, Node.js, PostgreSQL, MinIO, Prometheus, Grafana.",
      },
    ],
  }),
  component: Infra,
});

type Node = {
  id: string;
  label: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  x: number;
  y: number;
  color: string;
};

const nodes: Node[] = [
  {
    id: "client",
    label: "Client",
    sub: "React / Vite",
    icon: Globe,
    x: 50,
    y: 8,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "nginx",
    label: "Nginx",
    sub: "Reverse Proxy + TLS",
    icon: Shield,
    x: 50,
    y: 28,
    color: "from-fuchsia-500 to-cyan-400",
  },
  {
    id: "frontend",
    label: "Frontend Server",
    sub: "Static / SSR",
    icon: Server,
    x: 20,
    y: 50,
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: "api",
    label: "Backend API",
    sub: "Node.js · Express",
    icon: Server,
    x: 80,
    y: 50,
    color: "from-emerald-400 to-cyan-500",
  },
  {
    id: "db",
    label: "PostgreSQL",
    sub: "Users · Tracks · Playlists",
    icon: Database,
    x: 65,
    y: 78,
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "minio",
    label: "MinIO",
    sub: "Object Storage · Audio",
    icon: HardDrive,
    x: 95,
    y: 78,
    color: "from-orange-400 to-pink-500",
  },
  {
    id: "prom",
    label: "Prometheus",
    sub: "Metrics scraping",
    icon: Activity,
    x: 5,
    y: 78,
    color: "from-rose-400 to-fuchsia-500",
  },
  {
    id: "graf",
    label: "Grafana",
    sub: "Dashboards",
    icon: BarChart3,
    x: 35,
    y: 78,
    color: "from-yellow-300 to-pink-500",
  },
];

const edges: [string, string][] = [
  ["client", "nginx"],
  ["nginx", "frontend"],
  ["nginx", "api"],
  ["api", "db"],
  ["api", "minio"],
  ["api", "prom"],
  ["prom", "graf"],
];

function pos(p: number) {
  return p;
}

function Infra() {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Architecture</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold mt-1">Cloud infrastructure</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          A production-grade, observable, cloud-native stack — built to stream millions of tracks
          reliably.
        </p>
      </div>

      <div className="relative glass-strong rounded-3xl p-6 md:p-10 overflow-hidden mb-10">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--neon-purple)]/30 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--neon-cyan)]/20 blur-[100px]" />
        <div className="relative" style={{ height: 640 }}>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="line-grad" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.68 0.27 295)" />
                <stop offset="100%" stopColor="oklch(0.82 0.18 200)" />
              </linearGradient>
            </defs>
            {edges.map(([from, to], i) => {
              const a = nodes.find((n) => n.id === from)!;
              const b = nodes.find((n) => n.id === to)!;
              return (
                <line
                  key={i}
                  x1={pos(a.x)}
                  y1={pos(a.y)}
                  x2={pos(b.x)}
                  y2={pos(b.y)}
                  stroke="url(#line-grad)"
                  strokeWidth="0.3"
                  strokeDasharray="0.8 0.8"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-3.2"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </line>
              );
            })}
          </svg>

          {nodes.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className="glass rounded-2xl p-3 w-44 text-center shadow-glow border border-white/10 hover:scale-105 transition">
                <div
                  className={`mx-auto h-10 w-10 rounded-xl bg-gradient-to-br ${n.color} grid place-items-center`}
                >
                  <n.icon size={18} className="text-white" />
                </div>
                <p className="mt-2 font-semibold text-sm">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "API throughput", value: "12.4K rps", icon: Activity },
          { title: "DB connections", value: "184 / 500", icon: Database },
          { title: "Storage IOPS", value: "9.2K", icon: HardDrive },
          { title: "Uptime", value: "99.99%", icon: Shield },
        ].map((m) => (
          <div key={m.title} className="glass rounded-2xl p-5">
            <m.icon size={18} className="text-[var(--neon-cyan)]" />
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{m.title}</p>
            <p className="text-2xl font-display font-bold">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
