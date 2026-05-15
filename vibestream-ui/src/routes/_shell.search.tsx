import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { genres } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/search")({
  head: () => ({ meta: [{ title: "Search — VibeStream" }] }),
  component: () => (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-display font-bold mb-6">Search</h1>
      <div className="relative max-w-xl mb-10">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          placeholder="What do you want to listen to?"
          className="w-full h-12 pl-11 pr-4 rounded-full bg-white/5 border border-white/10 focus:border-[var(--neon-cyan)] focus:outline-none"
        />
      </div>
      <h2 className="text-xl font-display font-bold mb-4">Browse genres</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres
          .filter((g) => g !== "All")
          .map((g, i) => (
            <Link
              to="/songs"
              search={{ genre: g }}
              key={g}
              className={cn(
                "relative rounded-2xl h-32 p-5 overflow-hidden bg-gradient-to-br",
                [
                  "from-purple-500 to-cyan-400",
                  "from-pink-500 to-purple-600",
                  "from-emerald-400 to-cyan-500",
                  "from-orange-400 to-pink-500",
                ][i % 4],
              )}
            >
              <h3 className="text-2xl font-display font-bold drop-shadow">{g}</h3>
            </Link>
          ))}
      </div>
    </div>
  ),
});
