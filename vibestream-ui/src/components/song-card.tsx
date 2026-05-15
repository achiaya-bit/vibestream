import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, Pause, Heart } from "lucide-react";
import { Cover } from "@/components/cover";
import { usePlayer } from "@/context/player-context";
import type { Song } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SongCard({ song, queue }: { song: Song; queue?: Song[] }) {
  const { current, isPlaying, play, toggle, liked, toggleLike } = usePlayer();
  const active = current?.id === song.id;
  const isLiked = liked.has(song.id);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group glass rounded-2xl p-4 cursor-pointer relative overflow-hidden"
    >
      <div className="relative">
        <Cover gradient={song.cover} coverUrl={song.coverUrl} size="full" />
        <button
          onClick={(e) => { e.preventDefault(); active ? toggle() : play(song, queue); }}
          className={cn(
            "absolute bottom-3 right-3 h-12 w-12 rounded-full bg-gradient-hero shadow-glow grid place-items-center",
            "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300",
            active && "opacity-100 translate-y-0"
          )}
          aria-label={active && isPlaying ? "Pause" : "Play"}
        >
          {active && isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" fill="white" />}
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{song.title}</h3>
          <Link
            to="/artist/$id"
            params={{ id: song.artistId }}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-muted-foreground hover:text-foreground truncate block"
          >
            {song.artist}
          </Link>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggleLike(song.id); }}
          className="shrink-0 text-muted-foreground hover:text-neon-pink transition"
          aria-label="Like"
        >
          <Heart size={18} className={cn(isLiked && "fill-current text-[var(--neon-pink)]")} />
        </button>
      </div>
    </motion.div>
  );
}
