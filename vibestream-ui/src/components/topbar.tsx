import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

export function Topbar() {
  const [q, setQ] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-white/5">
      <div className="flex items-center gap-3 px-4 md:px-6 h-16">
        <div className="hidden md:flex items-center gap-1">
          <button
            className="h-8 w-8 rounded-full bg-black/40 grid place-items-center text-muted-foreground hover:text-foreground"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="h-8 w-8 rounded-full bg-black/40 grid place-items-center text-muted-foreground hover:text-foreground"
            aria-label="Forward"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) {
                navigate({ to: "/songs", search: { q: q.trim() } });
              }
            }}
            placeholder="Search songs, artists, playlists…"
            className="w-full h-10 pl-10 pr-4 rounded-full bg-white/5 border border-white/10 focus:border-[var(--neon-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--neon-cyan)]/30 text-sm placeholder:text-muted-foreground transition"
          />
        </div>

        <button
          className="h-10 w-10 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {user ? (
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 pl-1 pr-3 h-10 rounded-full bg-white/5">
              <div className="h-8 w-8 rounded-full bg-gradient-hero shadow-glow grid place-items-center text-sm font-bold">
                {initial}
              </div>
              <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="h-10 w-10 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="hidden sm:flex items-center gap-2 pl-1 pr-3 h-10 rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-hero shadow-glow grid place-items-center text-sm font-bold">
              ?
            </div>
            <span className="text-sm font-medium">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  );
}
