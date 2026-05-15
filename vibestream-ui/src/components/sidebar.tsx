import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Search, Library, Compass, Heart, Plus, Cloud, Shield, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { playlistsQuery } from "@/hooks/queries";

const main = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/songs", label: "Browse", icon: Compass },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
];

const more = [
  { to: "/admin", label: "Admin", icon: Shield },
  { to: "/infrastructure", label: "Cloud Infra", icon: Cloud },
];

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const is = (p: string) => path === p || path.startsWith(p + "/");
  const { data: playlists = [] } = useQuery(playlistsQuery);

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 glass-strong border-r border-white/5 h-[calc(100vh-96px)] sticky top-0 p-4 gap-4 overflow-y-auto scrollbar-thin">
      <Link to="/" className="flex items-center gap-2 px-2 py-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-hero shadow-glow grid place-items-center">
          <Radio size={18} className="text-white" />
        </div>
        <span className="font-display font-bold text-lg">VibeStream</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {main.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
              is(m.to)
                ? "bg-white/10 text-foreground shadow-glow-cyan"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <m.icon size={18} />
            {m.label}
          </Link>
        ))}
      </nav>

      <div className="h-px bg-white/5" />

      <div className="flex items-center justify-between px-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Your Playlists</span>
        <button className="text-muted-foreground hover:text-foreground" aria-label="New playlist">
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-pink)] grid place-items-center">
            <Heart size={14} className="text-white fill-white" />
          </div>
          Liked Songs
        </button>
        {playlists.slice(0, 5).map((p) => (
          <Link
            key={p.id}
            to="/playlist/$id"
            params={{ id: p.id }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition truncate"
          >
            <div className={cn("h-8 w-8 rounded-md bg-gradient-to-br shrink-0", p.cover)} />
            <span className="truncate">{p.title}</span>
          </Link>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <div className="h-px bg-white/5 my-2" />
        {more.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
              is(m.to)
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <m.icon size={18} />
            {m.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
