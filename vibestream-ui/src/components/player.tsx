import { motion } from "framer-motion";
import { Heart, ListMusic, Maximize2, Mic2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Cover } from "@/components/cover";
import { parseDuration } from "@/lib/format";
import { usePlayer } from "@/context/player-context";
import { cn } from "@/lib/utils";

function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-0.5 bg-[var(--neon-cyan)] origin-bottom rounded-full",
            active ? "animate-equalizer" : "h-1"
          )}
          style={active ? { animationDelay: `${i * 0.15}s`, height: "100%" } : undefined}
        />
      ))}
    </div>
  );
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Player() {
  const { current, isPlaying, toggle, next, prev, progress, seek, volume, setVolume, liked, toggleLike } = usePlayer();
  const total = current ? parseDuration(current.duration) : 0;
  const elapsed = progress * total;
  const isLiked = current ? liked.has(current.id) : false;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-[1800px] px-2 pb-2">
        <div className="glass-strong rounded-2xl shadow-elevated border border-white/10 px-3 sm:px-4 py-3 grid grid-cols-3 items-center gap-3">
          {/* Track info */}
          <div className="flex items-center gap-3 min-w-0">
            {current ? (
              <>
                <Cover gradient={current.cover} coverUrl={current.coverUrl} size="xs" animated />
                <div className="min-w-0 hidden sm:block">
                  <p className="text-sm font-semibold truncate">{current.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{current.artist}</p>
                </div>
                <button
                  onClick={() => toggleLike(current.id)}
                  className="ml-1 text-muted-foreground hover:text-[var(--neon-pink)]"
                  aria-label="Like"
                >
                  <Heart size={16} className={cn(isLiked && "fill-[var(--neon-pink)] text-[var(--neon-pink)]")} />
                </button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Pick a song to start streaming</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="text-muted-foreground hover:text-foreground hidden sm:block" aria-label="Shuffle"><Shuffle size={16} /></button>
              <button onClick={prev} className="text-muted-foreground hover:text-foreground" aria-label="Previous"><SkipBack size={18} fill="currentColor" /></button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggle}
                className="h-10 w-10 rounded-full bg-white text-black grid place-items-center shadow-glow hover:scale-105 transition"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
              </motion.button>
              <button onClick={next} className="text-muted-foreground hover:text-foreground" aria-label="Next"><SkipForward size={18} fill="currentColor" /></button>
              <button className="text-muted-foreground hover:text-foreground hidden sm:block" aria-label="Repeat"><Repeat size={16} /></button>
              <Equalizer active={isPlaying} />
            </div>
            <div className="hidden sm:flex w-full items-center gap-2 text-xs text-muted-foreground">
              <span className="tabular-nums w-9 text-right">{fmt(elapsed)}</span>
              <div
                className="flex-1 h-1.5 rounded-full bg-white/10 group cursor-pointer relative"
                onClick={(e) => {
                  const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  seek((e.clientX - r.left) / r.width);
                }}
              >
                <div className="h-full rounded-full bg-gradient-hero relative" style={{ width: `${progress * 100}%` }}>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition shadow-glow" />
                </div>
              </div>
              <span className="tabular-nums w-9">{current?.duration ?? "0:00"}</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 text-muted-foreground">
            <button className="hover:text-foreground hidden md:block" aria-label="Lyrics"><Mic2 size={16} /></button>
            <button className="hover:text-foreground hidden md:block" aria-label="Queue"><ListMusic size={16} /></button>
            <div className="hidden md:flex items-center gap-2 w-32">
              <Volume2 size={16} />
              <input
                type="range" min={0} max={1} step={0.01} value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[var(--neon-cyan)]"
                aria-label="Volume"
              />
            </div>
            <button className="hover:text-foreground" aria-label="Fullscreen"><Maximize2 size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
